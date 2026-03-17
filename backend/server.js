import 'dotenv/config'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { setPrisma, gateboxCreatePix, gateboxPixStatus, gateboxWithdraw, gateboxBalance } from './gatebox.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
setPrisma(prisma)

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não definido. Defina a variável de ambiente JWT_SECRET antes de iniciar.')
  process.exit(1)
}

// CORS: FRONTEND_URL restringe origens permitidas; se vazio, aceita qualquer
const FRONTEND_URL = process.env.FRONTEND_URL || ''
const corsOpts = {
  origin: (o, cb) => {
    if (!o) return cb(null, true)
    if (!FRONTEND_URL) return cb(null, true)
    const allowed = FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean)
    const ok = allowed.some(u => o === u || o.startsWith(u.replace(/\/$/, '') + '/'))
    return cb(null, ok ? o : false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
// CORS para /gold_api e /api/games/seamless - iGameWin chama de iframe de outro domínio.
// Usa whitelist: IGAMEWIN_ALLOWED_ORIGINS (CSV) + FRONTEND_URL.
// Se nenhuma variável for definida, bloqueia tudo por segurança.
const IGAMEWIN_ALLOWED_ORIGINS = (process.env.IGAMEWIN_ALLOWED_ORIGINS || '')
  .split(',').map(u => u.trim()).filter(Boolean)

function isAllowedSeamlessOrigin(origin) {
  if (!origin) return false
  const allowed = [
    ...IGAMEWIN_ALLOWED_ORIGINS,
    ...(FRONTEND_URL ? FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean) : [])
  ]
  return allowed.some(u => origin === u || origin.startsWith(u.replace(/\/$/, '') + '/'))
}

app.use((req, res, next) => {
  if (req.path === '/gold_api' || req.path === '/api/games/seamless') {
    const origin = req.headers.origin
    if (origin && isAllowedSeamlessOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else if (!origin) {
      // Chamada server-to-server sem Origin (permitido)
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
    // Se origin existe mas não está na whitelist, não seta o header (browser bloqueará)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
  }
  next()
})

app.use(cors(corsOpts))
app.options('*', cors(corsOpts))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// POST webhook Gatebox - recebe eventos PIX (PIX_PAY_IN, etc.) - sem auth
app.post('/api/webhook/gatebox', async (req, res) => {
  // Validação de token: se GATEBOX_WEBHOOK_TOKEN estiver definido, exige
  // Authorization: Bearer <token> ou X-Webhook-Token: <token>
  const webhookToken = process.env.GATEBOX_WEBHOOK_TOKEN
  if (webhookToken) {
    const authHeader = req.headers['authorization'] || ''
    const tokenHeader = req.headers['x-webhook-token'] || req.headers['x-gatebox-token'] || ''
    const received = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : tokenHeader
    if (received !== webhookToken) {
      console.warn('Webhook Gatebox: token inválido, request rejeitado')
      return res.status(401).json({ ok: false, error: 'Unauthorized' })
    }
  }
  const body = req.body || {}
  const eventType = (body.type || body.eventType || body.event || '').toUpperCase()
  let externalId = body.externalId || body.data?.externalId || body.transactionId || body.id ||
    body.conciliationId || body.conciliation_id || body.reference || body.pixChargeIdConciliation
  if (!externalId && body.invoice) {
    const inv = body.invoice
    externalId = inv.externalId || inv.id || inv.reference || inv.conciliationId
  }
  if (!externalId && body.transaction) {
    const tx = body.transaction
    externalId = tx.externalId || tx.id || tx.reference || tx.conciliationId || tx.transactionId
  }
  if (!externalId) {
    const flat = JSON.stringify(body)
    const cuidMatch = flat.match(/"c[a-z0-9]{24}"/)
    if (cuidMatch) externalId = cuidMatch[0].replace(/^"|"$/g, '')
  }
  if (!externalId || process.env.NODE_ENV !== 'production') {
    console.log('Webhook Gatebox:', { eventType, externalId, keys: Object.keys(body), invoice: body.invoice ? Object.keys(body.invoice) : null, transaction: body.transaction ? Object.keys(body.transaction) : null })
  }
  res.status(200).json({ ok: true })
  try {
    if (!eventType || !['PIX_PAY_IN', 'PIX_PAYIN', 'PAY_IN', 'PIX PAY IN'].includes(eventType.replace(/\s/g, '_'))) return
    if (!externalId) return
    const extStr = String(externalId).trim()

    // Idempotência: atualiza status para 'processando' atomicamente.
    // Se outro request já fez isso, updateMany retorna count=0 e abortamos.
    let claimed = await prisma.deposit.updateMany({
      where: { externalId: extStr, status: 'pendente' },
      data: { status: 'processando' }
    })
    if (claimed.count === 0) {
      // Tenta pelo id como fallback
      claimed = await prisma.deposit.updateMany({
        where: { id: extStr, status: 'pendente' },
        data: { status: 'processando' }
      })
    }
    if (claimed.count === 0) {
      console.log('Webhook Gatebox: depósito', extStr, 'já processado ou não encontrado — ignorando')
      return
    }

    // Busca o depósito agora em status 'processando' (nosso lock)
    let deposit = await prisma.deposit.findFirst({
      where: { externalId: extStr, status: 'processando' },
      include: { user: true }
    })
    if (!deposit) {
      deposit = await prisma.deposit.findFirst({
        where: { id: extStr, status: 'processando' },
        include: { user: true }
      })
    }
    if (!deposit) return

    await confirmarDepositoPix(deposit)
    console.log('Webhook Gatebox: depósito', extStr, 'confirmado')
  } catch (e) {
    console.error('Webhook Gatebox:', e)
  }
})

/** Gera pid único a partir do account (hash polinomial para evitar colisões) */
function generatePid(account) {
  const s = String(account)
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return '4' + String(Math.abs(h) % 1000000000).padStart(9, '0')
}

/** Middleware para verificar JWT */
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: { message: 'Token obrigatório' } })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (e) {
    return res.status(401).json({ error: { message: 'Token inválido' } })
  }
}

/** Middleware Admin - verifica JWT com claim admin */
function adminAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: { message: 'Token obrigatório' } })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.admin) return res.status(403).json({ error: { message: 'Acesso negado' } })
    req.admin = true
    next()
  } catch (e) {
    return res.status(401).json({ error: { message: 'Token inválido ou expirado' } })
  }
}

/** Obtém credenciais admin (Settings ou env) */
async function getAdminCredentials() {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'admin' } })
    const v = s?.value
    if (v && typeof v === 'object' && v.user && v.passwordHash) {
      return { user: v.user, passwordHash: v.passwordHash, fromDb: true }
    }
  } catch (e) { /* ignore */ }
  return {
    user: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    fromDb: false
  }
}

const DEFAULT_ROLETA_SEGMENTS = [
  { label: '30,00', value: 30 },
  { label: '100,00', value: 100 },
  { label: '50,00', value: 50 },
  { label: '???', value: 20 },
  { label: '😎', value: 0 },
  { label: '1.000,00', value: 1000 },
  { label: '????', value: 10 },
  { label: '??', value: 5 }
]

/** Configurações da plataforma (Saque, Roleta, Bônus) */
async function getAppConfig() {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'config' } })
    const v = s?.value || {}
    const segs = v.roletaSegments
    const roletaSegments = Array.isArray(segs) && segs.length === 8
      ? segs.map(sg => ({ label: String(sg?.label ?? ''), value: Number(sg?.value) ?? 0 }))
      : DEFAULT_ROLETA_SEGMENTS
    return {
      depositoMin: v.depositoMin ?? 10,
      saqueMin: v.saqueMin ?? 20,
      saqueMax: v.saqueMax ?? 40000,
      roletaMinWithdraw: v.roletaMinWithdraw ?? 100,
      roletaBonusDays: v.roletaBonusDays ?? 3,
      roletaDailySpins: v.roletaDailySpins ?? 1,
      bonusPrimeiroDep: v.bonusPrimeiroDep ?? 0,
      bonusPrimeiroDepPercent: v.bonusPrimeiroDepPercent ?? 0,
      roletaSegments,
      whatsappUrl: v.whatsappUrl || ''
    }
  } catch (e) { return { depositoMin: 10, saqueMin: 20, saqueMax: 40000, roletaMinWithdraw: 100, roletaBonusDays: 3, roletaDailySpins: 1, bonusPrimeiroDep: 0, bonusPrimeiroDepPercent: 0, roletaSegments: DEFAULT_ROLETA_SEGMENTS } }
}

/** Confirma depósito PIX e credita saldo (usado por polling e webhook)
 * @param {object} deposit - Deposit com user incluído
 * @param {number} [bonusExtra=0] - Bônus extra em R$ (admin pode adicionar ao aprovar)
 */
async function confirmarDepositoPix(deposit, bonusExtra = 0) {
  const af = await ensureAfiliado(deposit.userId, deposit.user?.account || '')
  const cfg = await getAppConfig()
  const bonusPrimeiro = (af.numDepositos ?? 0) === 0
    ? (cfg.bonusPrimeiroDep ?? 0) + (deposit.valor * (cfg.bonusPrimeiroDepPercent ?? 0) / 100)
    : 0
  const balanceIncrement = deposit.valor + bonusPrimeiro + (Number(bonusExtra) || 0)
  const rebate = deposit.valor * 0.05
  const niveisVip = [
    { nivel: 0, aposta: 0, bonus: 0 },
    { nivel: 1, aposta: 100, bonus: 1 }, { nivel: 2, aposta: 1000, bonus: 3 }, { nivel: 3, aposta: 3000, bonus: 10 },
    { nivel: 4, aposta: 10000, bonus: 15 }, { nivel: 5, aposta: 30000, bonus: 30 }, { nivel: 6, aposta: 60000, bonus: 40 },
    { nivel: 7, aposta: 100000, bonus: 55 }, { nivel: 8, aposta: 300000, bonus: 155 }, { nivel: 9, aposta: 600000, bonus: 255 },
    { nivel: 10, aposta: 1000000, bonus: 355 }, { nivel: 11, aposta: 2000000, bonus: 555 }, { nivel: 12, aposta: 3000000, bonus: 755 },
    { nivel: 13, aposta: 4000000, bonus: 855 }, { nivel: 14, aposta: 5000000, bonus: 955 }, { nivel: 15, aposta: 6000000, bonus: 1055 }
  ]
  const apostaNova = af.apostaAcumulada + deposit.valor * 5
  let nivelVip = af.nivelVip
  let bonusVipReclamar = af.bonusVipReclamar
  const prox = niveisVip[Math.min(nivelVip + 1, 15)]
  if (apostaNova >= prox.aposta && nivelVip < 15) {
    nivelVip++
    bonusVipReclamar += prox.bonus
  }
  await prisma.$transaction([
    prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'concluido' } }),
    prisma.afiliadoData.update({
      where: { userId: deposit.userId },
      data: {
        depositoMisterioso: { increment: deposit.valor },
        valorDeposito: { increment: deposit.valor },
        numDepositos: { increment: 1 },
        balance: { increment: balanceIncrement },
        coletavelRebate: { increment: rebate },
        comissaoPendente: { increment: rebate },
        comissaoHoje: { increment: rebate },
        apostaAcumulada: apostaNova,
        nivelVip,
        bonusVipReclamar,
        updatedAt: new Date()
      }
    })
  ])
  const indicator = (await prisma.user.findUnique({ where: { id: deposit.userId } }))?.indicatorId
  if (indicator) {
    await prisma.afiliadoData.update({
      where: { userId: indicator },
      data: {
        comissaoPendente: { increment: rebate },
        coletavelRebate: { increment: rebate },
        comissaoHoje: { increment: rebate },
        updatedAt: new Date()
      }
    })
  }
}

/** Garante AfiliadoData para o usuário */
async function ensureAfiliado(userId, account) {
  let af = await prisma.afiliadoData.findUnique({ where: { userId } })
  if (!af) {
    const pid = generatePid(account)
    af = await prisma.afiliadoData.create({
      data: {
        userId,
        pid,
        horaRegisto: new Date(),
        updatedAt: new Date()
      }
    })
  }
  return af
}

// Multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads')
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `${file.fieldname}-${Date.now()}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// Normaliza telefone para só dígitos (evita "11 99999-9999" vs "11999999999")
function normalizeAccount(v) {
  if (!v) return ''
  return String(v).replace(/\D/g, '')
}

// tRPC-style user.login
app.post('/api/frontend/trpc/user.login', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
    if (!userLoginLimiter.check(ip)) {
      return res.status(429).json({ error: { message: 'Muitas tentativas de login. Aguarde 15 minutos.' } })
    }
    const { account, phone, password } = req.body?.json || req.body || {}
    const login = account || phone
    if (!login || !password) {
      return res.json({ error: { message: 'Telefone e senha obrigatórios' } })
    }
    let user = await prisma.user.findUnique({ where: { account: login } })
    if (!user) {
      const loginNorm = normalizeAccount(login)
      if (loginNorm.length >= 10) {
        user = await prisma.user.findFirst({ where: { account: loginNorm } })
      }
    }
    // Mensagem genérica para evitar enumeração de contas
    if (!user) {
      return res.json({ error: { message: 'Credenciais inválidas' } })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.json({ error: { message: 'Credenciais inválidas' } })
    }
    await ensureAfiliado(user.id, user.account)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({
      result: {
        data: {
          json: {
            token,
            user: { account: user.account, id: user.id }
          }
        }
      }
    })
  } catch (e) {
    console.error('login error:', e)
    const msg = process.env.NODE_ENV === 'production' ? 'Erro interno' : (e.message || String(e))
    return res.status(500).json({ error: { message: msg } })
  }
})

// tRPC-style user.register
app.post('/api/frontend/trpc/user.register', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
    if (!userRegisterLimiter.check(ip)) {
      return res.status(429).json({ error: { message: 'Muitos cadastros a partir deste endereço. Aguarde 1 hora.' } })
    }
    const data = req.body?.json || req.body || {}
    const { phone, account, password, confirmPassword, pid } = data
    const acc = account || phone
    if (!acc || !password) {
      return res.json({ error: { message: 'Telefone e senha obrigatórios' } })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.json({ error: { message: 'Senha deve ter no mínimo 6 caracteres' } })
    }
    if (password !== confirmPassword) {
      return res.json({ error: { message: 'As senhas não coincidem' } })
    }
    const phoneClean = normalizeAccount(acc)
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return res.json({ error: { message: 'Telefone inválido' } })
    }
    const exists = await prisma.user.findUnique({ where: { account: phoneClean } })
    if (exists) {
      return res.json({ error: { message: 'Conta já cadastrada' } })
    }
    let indicatorId = null
    if (pid) {
      const indicador = await prisma.afiliadoData.findUnique({ where: { pid }, include: { user: true } })
      if (indicador) indicatorId = indicador.userId
    }
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        account: phoneClean,
        phone: phoneClean,
        password: hash,
        indicatorId
      }
    })
    let pidNovo = generatePid(phoneClean)
    const pidExists = await prisma.afiliadoData.findUnique({ where: { pid: pidNovo } })
    if (pidExists) pidNovo = '4' + String(Date.now() % 1000000000).padStart(9, '0')
    await prisma.afiliadoData.create({
      data: {
        userId: user.id,
        pid: pidNovo,
        horaRegisto: new Date(),
        updatedAt: new Date()
      }
    })
    if (indicatorId) {
      await prisma.afiliadoData.update({
        where: { userId: indicatorId },
        data: {
          subDiretos: { increment: 1 },
          subValidos: { increment: 1 },
          novosSubordinados: { increment: 1 },
          updatedAt: new Date()
        }
      })
      await addBonusSpinToIndicator(indicatorId)
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({
      result: {
        data: {
          json: {
            token,
            user: { account: user.account, id: user.id }
          }
        }
      }
    })
  } catch (e) {
    console.error('register error:', e)
    return res.status(500).json({ error: { message: e.message || 'Erro interno' } })
  }
})

// POST troca de senha do usuário
app.post('/api/user/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body?.json || req.body || {}
    if (!currentPassword || !newPassword) {
      return res.json({ error: { message: 'Senha atual e nova senha são obrigatórias' } })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.json({ error: { message: 'Nova senha deve ter no mínimo 6 caracteres' } })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(401).json({ error: { message: 'Usuário não encontrado' } })
    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return res.json({ error: { message: 'Senha atual incorreta' } })
    const hash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.userId }, data: { password: hash, updatedAt: new Date() } })
    return res.json({ result: { data: { json: { ok: true } } } })
  } catch (e) {
    console.error('change-password:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// Upload logo (requer admin)
app.post('/api/upload/logo', upload.single('file'), adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ ok: false, error: 'Nenhum arquivo enviado' })
    }
    const url = `/uploads/${req.file.filename}`
    await prisma.setting.upsert({
      where: { id: 'main' },
      create: { id: 'main', logo: url },
      update: { logo: url }
    })
    return res.json({ ok: true, url })
  } catch (e) {
    console.error('upload logo:', e)
    return res.json({ ok: false, error: e.message })
  }
})

// Upload banner
app.post('/api/upload/banner', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ ok: false, error: 'Nenhum arquivo enviado' })
    }
    const url = `/uploads/${req.file.filename}`
    await prisma.setting.upsert({
      where: { id: 'main' },
      create: { id: 'main', banner: url },
      update: { banner: url }
    })
    return res.json({ ok: true, url })
  } catch (e) {
    console.error('upload banner:', e)
    return res.json({ ok: false, error: e.message })
  }
})

// ========== Afiliado / Bônus (requer auth) ==========

const MISTERIOSO_CICLO_DIAS = 32

async function checkMisteriosoReset(af, user) {
  const horaReg = af.horaRegisto || user?.createdAt
  if (!horaReg) return af
  const now = new Date()
  const regDate = horaReg instanceof Date ? horaReg : new Date(horaReg)
  const diasDesdeRegistro = (now - regDate) / (24 * 60 * 60 * 1000)
  const cicloAtual = Math.floor(diasDesdeRegistro / MISTERIOSO_CICLO_DIAS)
  const cicloSalvo = af.misteriosoCicloAtual ?? 0
  if (cicloAtual > cicloSalvo) {
    const updated = await prisma.afiliadoData.update({
      where: { userId: af.userId },
      data: {
        misteriosoReclamado: false,
        depositoMisterioso: 0,
        misteriosoCicloAtual: cicloAtual,
        updatedAt: now
      }
    })
    return updated
  }
  return af
}

// Tabelas de bônus VIP periódico (índice = nível 0-15)
const BONUS_VIP_DIARIO  = [0, 0.10, 0.30, 0.50, 0.80, 1.50, 2.00, 3.00,  8.00,  13.00,  18.00,  28.00,  38.00,  43.00,  48.00,  53.00]
const BONUS_VIP_SEMANAL = [0, 0.50, 1.00, 2.00, 3.00, 5.00, 7.00, 10.00, 30.00,  50.00,  70.00, 110.00, 150.00, 170.00, 190.00, 210.00]
const BONUS_VIP_MENSAL  = [0, 1.00, 3.00, 5.00, 8.00, 15.00, 20.00, 30.00, 80.00, 130.00, 180.00, 280.00, 380.00, 430.00, 480.00, 530.00]

// Helpers de cooldown VIP periódico
function mesmodia(a, b) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate()
}
function mesmasemana(a, b) {
  const inicioSemana = d => { const c = new Date(d); c.setUTCHours(0,0,0,0); c.setUTCDate(c.getUTCDate() - c.getUTCDay()); return c.getTime() }
  return inicioSemana(a) === inicioSemana(b)
}
function mesmomes(a, b) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()
}

// GET afiliado - retorna dados completos
app.get('/api/afiliado', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    let af = await ensureAfiliado(req.userId, user?.account || '')
    af = await checkMisteriosoReset(af, user)
    const subordinados = await prisma.user.findMany({
      where: { indicatorId: req.userId },
      include: { afiliado: true }
    })
    const subEfetivos = subordinados.filter(u => {
      const a = u.afiliado
      if (!a) return false
      return (a.valorDeposito ?? 0) >= PROMO_DEP_MIN && (a.apostaAcumulada ?? 0) >= PROMO_APOSTA_MIN
    }).length
    const data = {
      pid: af.pid,
      balance: af.balance ?? 0,
      subDiretos: af.subDiretos,
      subValidos: af.subValidos,
      subEfetivos,
      subOutros: af.subOutros,
      novosSubordinados: af.novosSubordinados,
      valorDeposito: af.valorDeposito,
      numDepositos: af.numDepositos,
      valorPrimeiroDep: af.valorPrimeiroDep,
      usuariosPrimeiroDep: af.usuariosPrimeiroDep,
      valorSaque: af.valorSaque,
      numSaques: af.numSaques,
      comissaoRecebida: af.comissaoRecebida,
      comissaoPendente: af.comissaoPendente,
      comissaoHoje: af.comissaoHoje,
      coletavelRebate: af.coletavelRebate,
      apostaAcumulada: af.apostaAcumulada,
      nivelVip: af.nivelVip,
      bonusVipReclamar: af.bonusVipReclamar,
      horaRegisto: af.horaRegisto?.toISOString?.()?.slice(0, 19)?.replace('T', ' ') || null,
      depositoMisterioso: af.depositoMisterioso,
      misteriosoReclamado: af.misteriosoReclamado,
      misteriosoDiasAtivos: af.misteriosoDiasAtivos,
      bonusPromoReclamados: Array.isArray(af.bonusPromoReclamados) ? af.bonusPromoReclamados : [],
      bonusVipColetados: Array.isArray(af.bonusVipColetados) ? af.bonusVipColetados : [],
      rolloverPendente: af.rolloverPendente ?? 0,
      vipDiarioColetadoEm: af.vipDiarioColetadoEm?.toISOString?.() || null,
      vipSemanalColetadoEm: af.vipSemanalColetadoEm?.toISOString?.() || null,
      vipMensalColetadoEm: af.vipMensalColetadoEm?.toISOString?.() || null,
      vipDiarioDisp: BONUS_VIP_DIARIO[Math.min(af.nivelVip || 0, 15)],
      vipSemanalDisp: BONUS_VIP_SEMANAL[Math.min(af.nivelVip || 0, 15)],
      vipMensalDisp: BONUS_VIP_MENSAL[Math.min(af.nivelVip || 0, 15)]
    }
    return res.json({ result: { data: { json: data } } })
  } catch (e) {
    console.error('afiliado get:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST depósito PIX (Gatebox) - gera QR e cria Deposit pendente
app.post('/api/deposito/pix', authMiddleware, async (req, res) => {
  try {
    const { valor, cpf, nome } = req.body?.json || req.body || {}
    const v = parseFloat(valor)
    const cfg = await getAppConfig()
    const minDep = cfg.depositoMin ?? 10
    if (!Number.isFinite(v) || v <= 0) return res.json({ error: { message: 'Valor inválido' } })
    if (v < minDep) return res.json({ error: { message: `Valor mínimo R$ ${minDep.toFixed(2)}` } })
    if (v > 50000) return res.json({ error: { message: 'Valor máximo R$ 50.000,00' } })
    const doc = String(cpf || '').replace(/\D/g, '')
    if (doc.length !== 11) return res.json({ error: { message: 'CPF inválido (11 dígitos)' } })
    const nomeDeposito = String(nome || '').trim()
    if (!nomeDeposito || nomeDeposito.length > 120) return res.json({ error: { message: 'Nome completo obrigatório' } })
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(401).json({ error: { message: 'Usuário não encontrado' } })
    const deposit = await prisma.deposit.create({
      data: {
        userId: req.userId,
        valor: v,
        status: 'pendente',
        externalId: null
      }
    })
    const externalId = deposit.id
    const result = await gateboxCreatePix({
      externalId,
      amount: v,
      document: doc,
      name: nomeDeposito.slice(0, 100),
      identification: `Depósito A73 - ${user.account}`,
      description: `Depósito A73 - ${user.account}`,
      expire: 3600
    })
    if (!result.ok) {
      await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'erro' } })
      return res.json({ error: { message: result.error || 'Erro ao gerar PIX' } })
    }
    await prisma.deposit.update({ where: { id: deposit.id }, data: { externalId } })
    const d = result.data || {}
    const nested = d.data || d.result || d.body || {}
    const all = { ...d, ...(typeof nested === 'object' ? nested : {}) }
    let copyPaste = all.copyPaste || all.brCode || all.pixCopiaECola || all.payload || all.pixKey || all.pixCopyPaste || ''
    let qrcode = all.qrcode || all.qrCode || all.qrCodeBase64 || all.imagemQrCode || all.qrCodeImage || ''
    if (!copyPaste || !qrcode) {
      const flat = JSON.stringify(d)
      const pixMatch = flat.match(/"00020[^"]{100,}"/)
      if (pixMatch && !copyPaste) copyPaste = pixMatch[0].replace(/^"|"$/g, '')
      const b64Match = flat.match(/"([A-Za-z0-9+/]{100,}=*)"/)
      if (b64Match && !qrcode && /^[A-Za-z0-9+/=]+$/.test(b64Match[1])) qrcode = `data:image/png;base64,${b64Match[1]}`
    }
    if (!copyPaste && !qrcode) {
      const keys = Object.keys(all)
      const sample = JSON.stringify(d).slice(0, 800)
      console.warn('Gatebox PIX: resposta sem qrcode/copyPaste. Keys:', keys, 'Sample:', sample)
      await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'erro' } })
      const debug = process.env.NODE_ENV !== 'production' ? { keys, sample } : undefined
      return res.json({
        error: {
          message: 'Não foi possível gerar o PIX. Verifique os dados e tente novamente.',
          ...(debug && { debug })
        }
      })
    }
    return res.json({
      result: {
        data: {
          json: {
            ok: true,
            externalId,
            valor: v,
            qrcode,
            copyPaste,
            expireAt: Date.now() + 3600 * 1000
          }
        }
      }
    })
  } catch (e) {
    console.error('deposito pix:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// GET status depósito PIX - polling até pagamento confirmado
app.get('/api/deposito/pix/status/:externalId', authMiddleware, async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.set('Pragma', 'no-cache')
  try {
    const { externalId } = req.params
    if (!externalId) return res.status(400).json({ error: { message: 'externalId obrigatório' } })
    const deposit = await prisma.deposit.findFirst({
      where: { externalId, userId: req.userId },
      include: { user: true }
    })
    if (!deposit) return res.status(404).json({ error: { message: 'Depósito não encontrado' } })
    if (deposit.status === 'concluido') {
      return res.json({ result: { data: { json: { status: 'concluido', valor: deposit.valor } } } })
    }
    const statusResult = await gateboxPixStatus({ externalId })
    if (!statusResult.ok) {
      return res.json({ result: { data: { json: { status: 'pendente', error: statusResult.error } } } })
    }
    const st = statusResult.data?.status || statusResult.data?.transactionStatus || (statusResult.data?.paid ? 'PAID' : 'PENDING')
    const paid = ['PAID', 'PAID_OUT', 'CONCLUIDO', 'concluido', 'pago'].includes(String(st).toUpperCase())
    if (paid) {
      await confirmarDepositoPix(deposit)
      return res.json({ result: { data: { json: { status: 'concluido', valor: deposit.valor } } } })
    }
    return res.json({ result: { data: { json: { status: 'pendente' } } } })
  } catch (e) {
    console.error('deposito pix status:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST depósito (legado - crédito imediato, sem PIX)
app.post('/api/deposito', authMiddleware, async (req, res) => {
  try {
    const { valor } = req.body?.json || req.body || {}
    const v = parseFloat(valor)
    const cfg = await getAppConfig()
    const minDep = cfg.depositoMin ?? 10
    if (!v || v < minDep) {
      return res.json({ error: { message: `Valor mínimo R$ ${minDep.toFixed(2)}` } })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { afiliado: true } })
    if (!user) return res.status(401).json({ error: { message: 'Usuário não encontrado' } })
    const af = await ensureAfiliado(req.userId, user.account)
    const bonusPrimeiro = (af.numDepositos ?? 0) === 0
      ? (cfg.bonusPrimeiroDep ?? 0) + (v * (cfg.bonusPrimeiroDepPercent ?? 0) / 100)
      : 0
    const balanceIncrement = v + bonusPrimeiro
    const rebate = v * 0.05
    const niveisVip = [
      { nivel: 0, aposta: 0, bonus: 0 },
      { nivel: 1, aposta: 100, bonus: 1 }, { nivel: 2, aposta: 1000, bonus: 3 }, { nivel: 3, aposta: 3000, bonus: 10 },
      { nivel: 4, aposta: 10000, bonus: 15 }, { nivel: 5, aposta: 30000, bonus: 30 }, { nivel: 6, aposta: 60000, bonus: 40 },
      { nivel: 7, aposta: 100000, bonus: 55 }, { nivel: 8, aposta: 300000, bonus: 155 }, { nivel: 9, aposta: 600000, bonus: 255 },
      { nivel: 10, aposta: 1000000, bonus: 355 }, { nivel: 11, aposta: 2000000, bonus: 555 }, { nivel: 12, aposta: 3000000, bonus: 755 },
      { nivel: 13, aposta: 4000000, bonus: 855 }, { nivel: 14, aposta: 5000000, bonus: 955 }, { nivel: 15, aposta: 6000000, bonus: 1055 }
    ]
    const apostaNova = af.apostaAcumulada + v * 5
    let nivelVip = af.nivelVip
    let bonusVipReclamar = af.bonusVipReclamar
    const prox = niveisVip[Math.min(nivelVip + 1, 15)]
    if (apostaNova >= prox.aposta && nivelVip < 15) {
      nivelVip++
      bonusVipReclamar += prox.bonus
    }
    await prisma.$transaction([
      prisma.deposit.create({ data: { userId: req.userId, valor: v } }),
      prisma.afiliadoData.update({
        where: { userId: req.userId },
        data: {
          depositoMisterioso: { increment: v },
          valorDeposito: { increment: v },
          numDepositos: { increment: 1 },
          balance: { increment: balanceIncrement },
          coletavelRebate: { increment: rebate },
          comissaoPendente: { increment: rebate },
          comissaoHoje: { increment: rebate },
          apostaAcumulada: apostaNova,
          nivelVip,
          bonusVipReclamar,
          updatedAt: new Date()
        }
      })
    ])
    if (user.indicatorId) {
      await prisma.afiliadoData.update({
        where: { userId: user.indicatorId },
        data: {
          comissaoPendente: { increment: rebate },
          coletavelRebate: { increment: rebate },
          comissaoHoje: { increment: rebate },
          updatedAt: new Date()
        }
      })
    }
    return res.json({ result: { data: { json: { ok: true } } } })
  } catch (e) {
    console.error('deposito:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// Promo: critérios para "número de promoção efetiva"
const PROMO_DEP_MIN = 30
const PROMO_APOSTA_MIN = 600
const PROMO_EXPIRA_DIAS = 180 // bônus promo expira 180 dias após o registro

// POST reclamar bônus Promo - usa "promoção efetiva": subordinados com dep≥30 e apostas≥600
app.post('/api/afiliado/reclamar-promo', authMiddleware, async (req, res) => {
  try {
    const { pessoas } = req.body?.json || req.body || {}
    const p = parseInt(pessoas, 10)
    if (!p || p < 1) return res.json({ error: { message: 'Pessoas inválido' } })
    const recompensasPromo = [
      { valor: 50, pessoas: 1 }, { valor: 50, pessoas: 2 }, { valor: 50, pessoas: 3 }, { valor: 50, pessoas: 4 },
      { valor: 50, pessoas: 5 }, { valor: 300, pessoas: 10 }, { valor: 300, pessoas: 15 }, { valor: 300, pessoas: 20 },
      { valor: 500, pessoas: 30 }, { valor: 600, pessoas: 40 }, { valor: 600, pessoas: 50 }, { valor: 600, pessoas: 60 },
      { valor: 600, pessoas: 70 }, { valor: 600, pessoas: 80 }, { valor: 600, pessoas: 90 }, { valor: 700, pessoas: 100 },
      { valor: 2500, pessoas: 150 }, { valor: 2500, pessoas: 200 }, { valor: 2500, pessoas: 250 }, { valor: 2500, pessoas: 300 },
      { valor: 2500, pessoas: 350 }, { valor: 2500, pessoas: 400 }, { valor: 2500, pessoas: 450 }, { valor: 3000, pessoas: 500 }
    ]
    const r = recompensasPromo.find(x => x.pessoas === p)
    if (!r) return res.json({ error: { message: 'Recompensa não encontrada' } })
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const af = await ensureAfiliado(req.userId, user?.account || '')
    // Verifica expiração: promo só disponível nos primeiros PROMO_EXPIRA_DIAS dias
    const horaReg = af.horaRegisto || user?.createdAt
    if (horaReg) {
      const diasDesdeReg = (Date.now() - new Date(horaReg).getTime()) / (24 * 60 * 60 * 1000)
      if (diasDesdeReg > PROMO_EXPIRA_DIAS) {
        return res.json({ error: { message: `Bônus Promo expirado. Disponível apenas nos primeiros ${PROMO_EXPIRA_DIAS} dias após o registro.` } })
      }
    }
    const subordinados = await prisma.user.findMany({
      where: { indicatorId: req.userId },
      include: { afiliado: true }
    })
    const subEfetivos = subordinados.filter(u => {
      const a = u.afiliado
      if (!a) return false
      const dep = a.valorDeposito ?? 0
      const aposta = a.apostaAcumulada ?? 0
      return dep >= PROMO_DEP_MIN && aposta >= PROMO_APOSTA_MIN
    })
    if (subEfetivos.length < p) return res.json({ error: { message: `Subordinados efetivos insuficientes (${subEfetivos.length}/${p}). Necessário: depósito ≥ ${PROMO_DEP_MIN} e apostas ≥ ${PROMO_APOSTA_MIN} por subordinado.` } })
    const reclamados = Array.isArray(af.bonusPromoReclamados) ? af.bonusPromoReclamados : []
    if (reclamados.some(x => x.pessoas === p)) return res.json({ error: { message: 'Já reclamado' } })
    reclamados.push({ pessoas: p, valor: r.valor })
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: {
        bonusPromoReclamados: reclamados,
        balance: { increment: r.valor },
        updatedAt: new Date()
      }
    })
    return res.json({ result: { data: { json: { ok: true, valor: r.valor } } } })
  } catch (e) {
    console.error('reclamar-promo:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST receber comissão
app.post('/api/afiliado/receber-comissao', authMiddleware, async (req, res) => {
  try {
    const { valor } = req.body?.json || req.body || {}
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    const disp = Math.max(af.comissaoPendente || 0, af.coletavelRebate || 0)
    const v = typeof valor === 'number' && valor > 0 ? Math.min(valor, disp) : disp
    if (v <= 0) return res.json({ error: { message: 'Nenhum valor disponível' } })
    const pend = Math.max(0, (af.comissaoPendente || 0) - v)
    const reb = Math.max(0, (af.coletavelRebate || 0) - v)
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: {
        comissaoRecebida: (af.comissaoRecebida || 0) + v,
        comissaoPendente: pend,
        coletavelRebate: reb,
        balance: { increment: v },
        updatedAt: new Date()
      }
    })
    return res.json({ result: { data: { json: { ok: true, valor: v } } } })
  } catch (e) {
    console.error('receber-comissao:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST reclamar Misterioso - prêmio baseado em depositoMisterioso (tabela alinhada ao frontend)
const TABELA_MISTERIOSO = [
  { minDep: 30, premioMin: 0.3, premioMax: 88 }, { minDep: 70, premioMin: 0.7, premioMax: 188 },
  { minDep: 150, premioMin: 1, premioMax: 388 }, { minDep: 300, premioMin: 3, premioMax: 688 },
  { minDep: 600, premioMin: 7, premioMax: 888 }, { minDep: 1000, premioMin: 10, premioMax: 1888 },
  { minDep: 2000, premioMin: 24, premioMax: 2888 }, { minDep: 5000, premioMin: 61, premioMax: 8888 },
]
app.post('/api/afiliado/reclamar-misterioso', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    let af = await ensureAfiliado(req.userId, user?.account || '')
    af = await checkMisteriosoReset(af, user)
    if (af.misteriosoReclamado) return res.json({ error: { message: 'Já reclamado' } })
    if (af.depositoMisterioso < 30) return res.json({ error: { message: 'Depósito mínimo R$ 30,00' } })
    const faixa = [...TABELA_MISTERIOSO].reverse().find(t => af.depositoMisterioso >= t.minDep)
    const min = faixa ? faixa.premioMin : 0.3
    const max = faixa ? faixa.premioMax : 88
    const premio = Math.round((min + Math.random() * (max - min)) * 100) / 100
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: {
        misteriosoReclamado: true,
        balance: { increment: premio },
        rolloverPendente: { increment: premio }, // 1x rollover antes de sacar
        updatedAt: new Date()
      }
    })
    return res.json({ result: { data: { json: { ok: true, valor: premio } } } })
  } catch (e) {
    console.error('reclamar-misterioso:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST coletar VIP
app.post('/api/afiliado/coletar-vip', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    if (af.bonusVipReclamar <= 0) return res.json({ error: { message: 'Nenhum bônus disponível' } })
    const valor = af.bonusVipReclamar
    const coletados = Array.isArray(af.bonusVipColetados) ? af.bonusVipColetados : []
    coletados.push({ nivel: af.nivelVip, valor })
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: {
        bonusVipReclamar: 0,
        bonusVipColetados: coletados,
        balance: { increment: valor },
        updatedAt: new Date()
      }
    })
    return res.json({ result: { data: { json: { ok: true } } } })
  } catch (e) {
    console.error('coletar-vip:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST coletar bônus VIP Diário
app.post('/api/afiliado/coletar-vip-diario', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    if (af.nivelVip <= 0) return res.json({ error: { message: 'Nível VIP insuficiente' } })
    const agora = new Date()
    if (af.vipDiarioColetadoEm && mesmodia(af.vipDiarioColetadoEm, agora)) {
      return res.json({ error: { message: 'Bônus diário já coletado hoje' } })
    }
    const valor = BONUS_VIP_DIARIO[Math.min(af.nivelVip, 15)]
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: { balance: { increment: valor }, rolloverPendente: { increment: valor }, vipDiarioColetadoEm: agora, updatedAt: agora }
    })
    return res.json({ result: { data: { json: { ok: true, valor } } } })
  } catch (e) {
    console.error('coletar-vip-diario:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST coletar bônus VIP Semanal
app.post('/api/afiliado/coletar-vip-semanal', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    if (af.nivelVip <= 0) return res.json({ error: { message: 'Nível VIP insuficiente' } })
    const agora = new Date()
    if (af.vipSemanalColetadoEm && mesmasemana(af.vipSemanalColetadoEm, agora)) {
      return res.json({ error: { message: 'Bônus semanal já coletado esta semana' } })
    }
    const valor = BONUS_VIP_SEMANAL[Math.min(af.nivelVip, 15)]
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: { balance: { increment: valor }, rolloverPendente: { increment: valor }, vipSemanalColetadoEm: agora, updatedAt: agora }
    })
    return res.json({ result: { data: { json: { ok: true, valor } } } })
  } catch (e) {
    console.error('coletar-vip-semanal:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST coletar bônus VIP Mensal
app.post('/api/afiliado/coletar-vip-mensal', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    if (af.nivelVip <= 0) return res.json({ error: { message: 'Nível VIP insuficiente' } })
    const agora = new Date()
    if (af.vipMensalColetadoEm && mesmomes(af.vipMensalColetadoEm, agora)) {
      return res.json({ error: { message: 'Bônus mensal já coletado este mês' } })
    }
    const valor = BONUS_VIP_MENSAL[Math.min(af.nivelVip, 15)]
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: { balance: { increment: valor }, rolloverPendente: { increment: valor }, vipMensalColetadoEm: agora, updatedAt: agora }
    })
    return res.json({ result: { data: { json: { ok: true, valor } } } })
  } catch (e) {
    console.error('coletar-vip-mensal:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// GET pid (para link de convite)
app.get('/api/afiliado/pid', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    return res.json({ result: { data: { json: { pid: af.pid } } } })
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } })
  }
})

// Helper: carrega config iGameWin do banco (usado por proxy e gold_api)
async function getIgamewinConfig() {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'igamewin' } })
    const v = s?.value
    if (v && typeof v === 'object') {
      return {
        agent_code: v.agent_code || '',
        agent_token: v.agent_token || '',
        agent_secret: v.agent_secret || '',
        sandbox: v.sandbox ?? true,
        is_demo: v.is_demo ?? true,
        api_mode: v.api_mode || 'seamless', // 'seamless' | 'transfer'
      }
    }
  } catch (e) { /* ignore */ }
  return null
}

// ========== iGameWin Seamless API (Site API) ==========
// iGameWin chama: POST /gold_api ou POST /api/games/seamless
// Site EndPoint no painel: https://api.35m.site (iGameWin adiciona /gold_api)
const handleSeamless = async (req, res) => {
  try {
    const { method, agent_code, agent_secret, user_code } = req.body || {}
    // Log para diagnóstico: qual URL o jogo está chamando
    const calledUrl = `${req.protocol}://${req.get('host') || req.headers.host}${req.originalUrl || req.url}`
    console.log('gold_api chamado:', { url: calledUrl, method, user_code: user_code ? `${String(user_code).slice(0, 4)}***` : null })
    const stored = await getIgamewinConfig()
    const expectedCode = stored?.agent_code || process.env.IGAMEWIN_AGENT_CODE || 'Midaslabs'
    const expectedSecret = stored?.agent_secret || process.env.IGAMEWIN_AGENT_SECRET || ''
    if (agent_code !== expectedCode || !expectedSecret || agent_secret !== expectedSecret) {
      console.warn('gold_api INVALID_AGENT:', { agent_code: agent_code ? '***' : null, expectedCode })
      return res.json({ status: 0, msg: 'INVALID_AGENT', user_balance: 0 })
    }
    if (!user_code) {
      console.warn('gold_api INVALID_PARAMETER: user_code vazio')
      return res.json({ status: 0, msg: 'INVALID_PARAMETER', user_balance: 0 })
    }

    const fmt = (v) => Math.round(Number(v) * 100) / 100
    const isDemo = stored?.is_demo ?? true

    if (method === 'user_balance') {
      let af = await prisma.afiliadoData.findFirst({
        where: { user: { account: user_code } },
        include: { user: true }
      })
      if (!af && user_code !== 'guest') {
        const codeNorm = normalizeAccount(user_code)
        if (codeNorm.length >= 10) {
          af = await prisma.afiliadoData.findFirst({
            where: { user: { account: codeNorm } },
            include: { user: true }
          })
        }
      }
      const balance = af?.balance ?? 0
      return res.json({ status: 1, user_balance: fmt(balance) })
    }

    if (method === 'transaction') {
      const { game_type, slot } = req.body || {}
      const slotData = slot || req.body?.live || req.body?.sport || {}
      const rawTxnId = slotData.txn_id ?? slotData.transaction_id
      const txnId = rawTxnId != null ? String(rawTxnId) : null
      if (txnId) {
        const existing = await prisma.gameTxnLog.findUnique({ where: { txnId } })
        if (existing) {
          return res.json({ status: 1, user_balance: fmt(existing.balanceAfter) })
        }
      }

      const txnType = slotData.txn_type || 'debit_credit'
      const toReais = (v) => { const n = Number(v) || 0; return n > 100 ? n / 100 : n }
      const betReais = toReais(slotData.bet_money ?? slotData.bet ?? 0)
      const winReais = toReais(slotData.win_money ?? slotData.win ?? 0)
      let delta = 0
      if (txnType === 'debit') delta = -betReais
      else if (txnType === 'credit') delta = winReais
      else delta = winReais - betReais

      let af = await prisma.afiliadoData.findFirst({
        where: { user: { account: user_code } },
        include: { user: true }
      })
      if (!af && user_code !== 'guest') {
        const codeNorm = normalizeAccount(user_code)
        if (codeNorm.length >= 10) {
          af = await prisma.afiliadoData.findFirst({
            where: { user: { account: codeNorm } },
            include: { user: true }
          })
        }
      }
      if (!af) {
        if (user_code === 'guest' && isDemo) {
          return res.json({ status: 1, user_balance: 0 })
        }
        console.warn('gold_api INVALID_USER:', { user_code: user_code ? `${String(user_code).slice(0, 4)}***` : null })
        return res.json({ status: 0, msg: 'INVALID_USER', user_balance: 0 })
      }

      const currentBalance = af.balance ?? 0
      let newBalance = currentBalance + delta
      if (!isDemo && newBalance < 0) {
        console.warn('gold_api INSUFFICIENT_USER_FUNDS:', { user_code: user_code ? `${String(user_code).slice(0, 4)}***` : null, currentBalance, delta })
        return res.json({ status: 0, msg: 'INSUFFICIENT_USER_FUNDS', user_balance: fmt(currentBalance) })
      }
      // Decrementa rollover pendente ao apostar (apenas débitos reais)
      const rolloverDesconto = betReais > 0 && !isDemo ? Math.min(betReais, af.rolloverPendente ?? 0) : 0
      await prisma.afiliadoData.update({
        where: { id: af.id },
        data: {
          balance: newBalance,
          rolloverPendente: rolloverDesconto > 0 ? { decrement: rolloverDesconto } : undefined,
          updatedAt: new Date()
        }
      })

      if (txnId) {
        await prisma.gameTxnLog.create({
          data: {
            txnId,
            userId: af.userId,
            userCode: user_code,
            gameType: game_type,
            provider: slotData.provider_code,
            gameCode: slotData.game_code,
            txnType,
            betReais,
            winReais,
            delta,
            balanceBefore: currentBalance,
            balanceAfter: newBalance
          }
        })
      }
      return res.json({ status: 1, user_balance: fmt(newBalance) })
    }

    console.warn('gold_api INVALID_METHOD:', method)
    return res.json({ status: 0, msg: 'INVALID_METHOD', user_balance: 0 })
  } catch (e) {
    console.error('gold_api error:', e)
    res.status(500).json({ status: 0, msg: 'INTERNAL_ERROR', user_balance: 0 })
  }
}

// GET /gold_api - teste de disponibilidade (como LuxBet)
app.get('/gold_api', (req, res) => res.json({ status: 1, msg: 'OK' }))
app.post('/gold_api', handleSeamless)
app.post('/api/games/seamless', handleSeamless)

// GET/POST iGameWin config (Admin) - credenciais salvas no backend - requer auth admin
app.get('/api/settings/igamewin', adminAuthMiddleware, async (req, res) => {
  try {
    const cfg = await getIgamewinConfig()
    const base = cfg || { agent_code: '', agent_token: '', agent_secret: '', sandbox: true, is_demo: true, api_mode: 'seamless' }
    base.site_endpoint = process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || ''
    return res.json(base)
  } catch (e) {
    return res.json({ agent_code: '', agent_token: '', agent_secret: '', sandbox: true, is_demo: true, api_mode: 'seamless', site_endpoint: process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || '' })
  }
})

app.post('/api/settings/igamewin', adminAuthMiddleware, async (req, res) => {
  try {
    const { agent_code, agent_token, agent_secret, sandbox, is_demo, api_mode } = req.body || {}
    const existing = await getIgamewinConfig()
    // Se agent_secret/agent_token vazios, mantém o existente (evita apagar ao salvar só outros campos)
    const finalSecret = (agent_secret != null && String(agent_secret).trim() !== '') ? String(agent_secret).trim() : (existing?.agent_secret || '')
    const finalToken = (agent_token != null && String(agent_token).trim() !== '') ? String(agent_token).trim() : (existing?.agent_token || '')
    const finalCode = agent_code != null ? String(agent_code).trim() : (existing?.agent_code || '')
    const mode = (api_mode === 'transfer' || api_mode === 'seamless') ? api_mode : (existing?.api_mode || 'seamless')
    await prisma.setting.upsert({
      where: { id: 'igamewin' },
      create: {
        id: 'igamewin',
        value: { agent_code: finalCode, agent_token: finalToken, agent_secret: finalSecret, sandbox: sandbox ?? true, is_demo: is_demo ?? true, api_mode: mode }
      },
      update: {
        value: { agent_code: finalCode, agent_token: finalToken, agent_secret: finalSecret, sandbox: sandbox ?? true, is_demo: is_demo ?? true, api_mode: mode }
      }
    })
    catalogCache = null
    return res.json({ ok: true })
  } catch (e) {
    console.error('save igamewin config:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// Catálogo de provedores e jogos (cache 10 min) - para a plataforma exibir
const IGAMEWIN_URL = 'https://igamewin.com/api/v1'
let catalogCache = null
let catalogCacheTime = 0
const CATALOG_TTL = 10 * 60 * 1000 // 10 min

async function fetchIgamewin(body) {
  const stored = await getIgamewinConfig()
  const b = { ...body }
  if (stored?.agent_code && stored?.agent_token) {
    b.agent_code = stored.agent_code
    b.agent_token = stored.agent_token
  }
  const r = await fetch(IGAMEWIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b)
  })
  return r.json()
}

// Catálogo demo quando API falha ou sem credenciais - 4 provedores, 30 jogos cada
const DEMO_GAMES = (prefix, names) => names.map((n, i) => ({ game_code: `${prefix}_${i}`, game_name: n, banner: '', status: 1 }))
const DEMO_CATALOG = {
  providers: [
    { code: 'PRAGMATIC', name: 'Pragmatic Play', status: 1 },
    { code: 'PGSOFT', name: 'PG Soft', status: 1 },
    { code: 'CQ9', name: 'CQ9', status: 1 },
    { code: 'EVOLUTION', name: 'Evolution', status: 1 },
  ],
  gamesByProvider: {
    PRAGMATIC: DEMO_GAMES('pp', ['The Dog House', 'Gates of Olympus', 'Sweet Bonanza', 'Sugar Rush', 'Starlight Princess', 'Big Bass Bonanza', 'Wolf Gold', 'Great Rhino', 'Madame Destiny', 'Fruit Party', 'Wild West Gold', 'The Hand of Midas', 'Fire Strike', 'John Hunter', 'Aztec Gems', 'Hot Safari', 'Lucky Lightning', 'Buffalo King', 'Release the Kraken', 'Legacy of Dead', 'Rise of Olympus', 'Chilli Heat', 'Pirate Gold', 'Dragon Kingdom', 'Mustang Gold', 'Ancient Egypt', 'Voodoo Magic', 'Magic Journey', 'Leprechaun Song', 'Caishen Wins']),
    PGSOFT: DEMO_GAMES('pg', ['Monkey Warrior', 'Mahjong Ways', 'Dragon Hatch', 'Treasure Rush', 'Ganesha Gold', 'Prosperity Lion', 'Bikini Paradise', 'Wild Bandito', 'Fortune Tiger', 'Fortune Ox', 'Fortune Rabbit', 'Candy Bonanza', 'Medusa', 'Gem Saviour', 'Double Fortune', 'Lucky Neko', 'Plushie Frenzy', 'Ways of Qilin', 'Sushi Oishi', 'Aladdin', 'Genie Jackpots', 'Wrath of Medusa', 'Jurassic Kingdom', 'Dragon Legend', 'Queen of Bounty', 'Treasures of Aztec', 'Santas Gift', 'Mermaid Riches', 'Cosmic Cash', 'Wild Bandito']),
    CQ9: DEMO_GAMES('cq9', ['God of Wealth', 'Dragon Rising', 'Lucky Neko', 'Fire Chibi', 'Rising Sun', 'Super Ace', 'Vault of Anubis', 'Sakai Empire', 'Lucky Bats', 'Totem Wonders', 'Win Win Won', 'Good Fortune', 'Dragon Hatch', 'Treasure Raider', 'Leprechaun Riches', 'Buffalo King', 'Golden Empire', 'Lucky Lion', 'Monkey King', 'Ninja Ways', 'Sushi Oishi', 'Wild Bandito', 'Fortune Tiger', 'Dragon Legend', 'Gem Saviour', 'Prosperity Lion', 'Ganesha Gold', 'Treasure Rush', 'Dragon Hatch', 'Candy Bonanza']),
    EVOLUTION: DEMO_GAMES('ev', ['Lightning Roulette', 'Crazy Time', 'Monopoly Live', 'Dream Catcher', 'Deal or No Deal', 'Mega Ball', 'Cash or Crash', 'Football Studio', 'Side Bet City', 'Caribbean Stud', 'Blackjack', 'Baccarat', 'Texas Holdem', 'Three Card Poker', 'Casino Holdem', 'Dragon Tiger', 'Speed Baccarat', 'Lightning Baccarat', 'Infinite Blackjack', 'Auto Roulette', 'Immersive Roulette', 'Speed Roulette', 'Double Ball Roulette', 'Mega Roulette', 'PowerUp Roulette', 'Gonzo Treasure Hunt', 'Crazy Coin Flip', 'Cash Drop', 'Monopoly Big Baller', 'Deal or No Deal Megaball']),
  },
}

async function getHomeProviders() {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'home' } })
    const v = s?.value
    if (v && Array.isArray(v.homeProviders)) return v.homeProviders
  } catch (e) {}
  return []
}

app.get('/api/igamewin/catalog', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === '1'
    if (!forceRefresh && catalogCache && Date.now() - catalogCacheTime < CATALOG_TTL) {
      const homeProviders = await getHomeProviders()
      return res.json({ ...catalogCache, homeProviders })
    }
    const provRes = await fetchIgamewin({ method: 'provider_list' })
    if (provRes.status !== 1 || !provRes.providers?.length) {
      const homeProviders = await getHomeProviders()
      return res.json({ ...DEMO_CATALOG, homeProviders })
    }
    const providers = provRes.providers.filter(p => p.status === 1).slice(0, 20)
    const gamesByProvider = {}
    for (const p of providers) {
      const gamesRes = await fetchIgamewin({ method: 'game_list', provider_code: p.code })
      if (gamesRes.status === 1 && gamesRes.games?.length) {
        gamesByProvider[p.code] = gamesRes.games.filter(g => g.status === 1).slice(0, 200)
      } else {
        gamesByProvider[p.code] = []
      }
    }
    catalogCache = { providers, gamesByProvider }
    catalogCacheTime = Date.now()
    const homeProviders = await getHomeProviders()
    res.json({ ...catalogCache, homeProviders })
  } catch (e) {
    console.error('igamewin catalog:', e)
    const homeProviders = await getHomeProviders().catch(() => [])
    res.json({ ...DEMO_CATALOG, homeProviders })
  }
})

app.get('/api/settings/home-providers', async (req, res) => {
  try {
    const homeProviders = await getHomeProviders()
    return res.json({ homeProviders })
  } catch (e) {
    return res.json({ homeProviders: [] })
  }
})

app.post('/api/settings/home-providers', async (req, res) => {
  try {
    const { homeProviders } = req.body?.json || req.body || {}
    const list = Array.isArray(homeProviders) ? homeProviders.filter(x => typeof x === 'string') : []
    await prisma.setting.upsert({
      where: { id: 'home' },
      create: { id: 'home', value: { homeProviders: list } },
      update: { value: { homeProviders: list } }
    })
    catalogCache = null
    return res.json({ ok: true, homeProviders: list })
  } catch (e) {
    console.error('save home providers:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// Launch game: cria usuário (user_create com is_demo) antes de game_launch - evita "Login Error"
// Modo transfer: user_deposit antes de game_launch (transfere saldo para iGameWin)
app.post('/api/igamewin/launch-game', async (req, res) => {
  try {
    const { user_code, provider_code, game_code, lang = 'en' } = req.body || {}
    const stored = await getIgamewinConfig()
    if (!stored?.agent_code || !stored?.agent_token) {
      return res.json({ status: 0, msg: 'IGAMEWIN_NOT_CONFIGURED' })
    }
    // user_code: normaliza (só dígitos para telefone, ou guest) - iGameWin pode rejeitar espaços/caracteres
    const raw = String(user_code || 'guest').trim()
    const userCode = raw === 'guest' ? 'guest' : (normalizeAccount(raw) || raw)
    const isDemo = stored.is_demo ?? true
    const apiMode = stored.api_mode || 'seamless'

    // 1. user_create (obrigatório antes de game_launch) - modo samples usa is_demo: true
    const createRes = await fetch(IGAMEWIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'user_create',
        agent_code: stored.agent_code,
        agent_token: stored.agent_token,
        user_code: userCode,
        is_demo: isDemo
      })
    })
    const createData = await createRes.json()
    // DUPLICATED_USER = usuário já existe, ok para prosseguir
    if (createData.status === 0 && createData.msg !== 'DUPLICATED_USER') {
      return res.json(createData)
    }

    // 2. Modo transfer: user_deposit com saldo do usuário antes de game_launch
    if (apiMode === 'transfer' && userCode !== 'guest') {
      let af = await prisma.afiliadoData.findFirst({
        where: { user: { account: userCode } },
        include: { user: true }
      })
      if (!af) {
        const codeNorm = normalizeAccount(userCode)
        if (codeNorm.length >= 10) {
          af = await prisma.afiliadoData.findFirst({
            where: { user: { account: codeNorm } },
            include: { user: true }
          })
        }
      }
      const balance = af?.balance ?? 0
      if (balance > 0) {
        const depositRes = await fetch(IGAMEWIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'user_deposit',
            agent_code: stored.agent_code,
            agent_token: stored.agent_token,
            user_code: userCode,
            amount: balance
          })
        })
        const depositData = await depositRes.json()
        if (depositData.status !== 1) {
          return res.json({ status: 0, msg: depositData.msg || 'DEPOSIT_FAILED' })
        }
        // Debita saldo local (agora está no iGameWin)
        await prisma.afiliadoData.update({
          where: { id: af.id },
          data: { balance: 0, updatedAt: new Date() }
        })
      }
    }

    // 3. game_launch (modo transfer: return_url para devolver saldo ao fechar)
    const apiBase = process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || ''
    const returnUrl = apiMode === 'transfer' && apiBase
      ? `${apiBase.replace(/\/$/, '')}/api/igamewin/game-return?user_code=${encodeURIComponent(userCode)}`
      : undefined
    // site_url: URL base para gold_api (sem /gold_api) - alguns jogos PG Soft precisam disso na launch
    const siteUrl = apiBase ? apiBase.replace(/\/$/, '').replace(/\/gold_api\/?$/, '') : undefined
    const launchBody = {
      method: 'game_launch',
      agent_code: stored.agent_code,
      agent_token: stored.agent_token,
      user_code: userCode,
      provider_code: provider_code || '',
      game_code: game_code || '',
      lang
    }
    if (returnUrl) launchBody.return_url = returnUrl
    if (siteUrl) launchBody.site_url = siteUrl
    console.log('igamewin game_launch REQUEST:', { provider_code: launchBody.provider_code, game_code: launchBody.game_code, is_demo: isDemo, user_code: userCode })
    const launchRes = await fetch(IGAMEWIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(launchBody)
    })
    const launchData = await launchRes.json()
    console.log('igamewin game_launch RESPONSE:', { status: launchData.status, msg: launchData.msg, launch_url: launchData.launch_url ? launchData.launch_url.slice(0, 100) + '...' : null })
    if (launchData.status !== 1) {
      console.warn('igamewin launch-game:', launchData.msg || launchData.status)
    } else if (launchData.launch_url) {
      const url = String(launchData.launch_url || '')
      if (url.includes('igamewin.com/demo') && !url.includes('/demo/')) {
        console.warn('igamewin launch-game: iGameWin retornou URL demo (404). Possível causa: is_demo=true no user_create. Tente desmarcar "Modo Demo" no Admin.', { isDemo, url })
        return res.json({
          status: 0,
          msg: 'IGAMEWIN_DEMO_URL_404',
          hint: 'O iGameWin retornou URL de demonstração. Tente desmarcar "Modo Demo/Samples" no Admin → API de Jogos. Se persistir, contate o suporte iGameWin.'
        })
      }
      console.log('igamewin launch-game OK:', { provider_code, game_code, launch_url: url?.slice?.(0, 80) + '...' })
    }
    res.json(launchData)
  } catch (e) {
    console.error('igamewin launch-game:', e)
    res.status(502).json({ status: 0, msg: 'Proxy error' })
  }
})

// Modo transfer: quando o jogo fecha, chama user_withdraw_reset e credita saldo de volta
// URL de retorno: configure no painel iGameWin ou use ?return_url= no game_launch se suportado
app.get('/api/igamewin/game-return', async (req, res) => {
  try {
    const userCode = String(req.query.user_code || '').trim()
    if (!userCode || userCode === 'guest') {
      return res.redirect(process.env.FRONTEND_URL || '/')
    }
    const stored = await getIgamewinConfig()
    if (!stored?.agent_code || !stored?.agent_token || stored.api_mode !== 'transfer') {
      return res.redirect(process.env.FRONTEND_URL || '/')
    }
    // 1. Obter saldo do usuário no iGameWin antes do withdraw
    const moneyRes = await fetch(IGAMEWIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'money_info',
        agent_code: stored.agent_code,
        agent_token: stored.agent_token,
        user_code: userCode
      })
    })
    const moneyData = await moneyRes.json()
    const balanceToCredit = Number(moneyData?.user?.balance ?? moneyData?.user_balance ?? 0) || 0
    // 2. user_withdraw_reset - devolve saldo do usuário para o agent
    await fetch(IGAMEWIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'user_withdraw_reset',
        agent_code: stored.agent_code,
        agent_token: stored.agent_token,
        user_code: userCode
      })
    })
    // 3. Creditar saldo de volta no nosso sistema
    if (balanceToCredit > 0) {
      let af = await prisma.afiliadoData.findFirst({
        where: { user: { account: userCode } },
        include: { user: true }
      })
      if (!af) {
        const codeNorm = normalizeAccount(userCode)
        if (codeNorm.length >= 10) {
          af = await prisma.afiliadoData.findFirst({
            where: { user: { account: codeNorm } },
            include: { user: true }
          })
        }
      }
      if (af) {
        await prisma.afiliadoData.update({
          where: { id: af.id },
          data: { balance: { increment: balanceToCredit }, updatedAt: new Date() }
        })
      }
    }
    const frontUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '') || '/'
    return res.redirect(frontUrl + '/main/inicio/')
  } catch (e) {
    console.error('igamewin game-return:', e)
    const frontUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '') || '/'
    return res.redirect(frontUrl + '/main/inicio/')
  }
})

// Proxy iGameWin API (evita CORS em produção)
// Usa credenciais do backend (Settings) quando salvas; senão usa o body da requisição
app.post('/api/igamewin', async (req, res) => {
  try {
    const stored = await getIgamewinConfig()
    const body = { ...req.body }
    if (stored?.agent_code && stored?.agent_token) {
      body.agent_code = stored.agent_code
      body.agent_token = stored.agent_token
    }
    const r = await fetch(IGAMEWIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('igamewin proxy:', e)
    res.status(502).json({ status: 0, msg: 'Proxy error' })
  }
})

// GET ranking de lucro (lucro real nos jogos = soma de delta do GameTxnLog)
function maskAccount(account) {
  if (!account || account.length < 5) return '****'
  return account.slice(0, 2) + '****' + account.slice(-2)
}
function formatAmountBr(val) {
  const [intPart, decPart] = Number(val).toFixed(2).split('.')
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decPart
}
app.get('/api/ranking', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)
    const agg = await prisma.gameTxnLog.groupBy({
      by: ['userId'],
      _sum: { delta: true }
    })
    const sorted = agg
      .map(({ userId, _sum }) => ({ userId, lucro: _sum?.delta ?? 0 }))
      .filter((x) => x.lucro > 0)
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, limit)
    const userIds = sorted.map((x) => x.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, account: true }
    })
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    const list = sorted.map((item, i) => ({
      pos: i + 1,
      user: maskAccount(userMap[item.userId]?.account),
      amount: formatAmountBr(item.lucro)
    }))
    return res.json({ top3: list.slice(0, 3), list })
  } catch (e) {
    console.error('ranking:', e)
    return res.json({ top3: [], list: [] })
  }
})

// ========== Roleta (Mina Misteriosa) - requer auth ==========

async function getOrCreateRoleta(userId) {
  const cfg = await getAppConfig()
  const dailySpins = cfg.roletaDailySpins ?? 1
  let r = await prisma.roletaBonus.findUnique({ where: { userId } })
  if (!r) {
    r = await prisma.roletaBonus.create({
      data: { userId, bonusBalance: 0, spinsRemaining: dailySpins }
    })
  }
  const now = new Date()
  // Prêmio expirado após 3 dias
  if (r.bonusExpiresAt && now > r.bonusExpiresAt) {
    r = await prisma.roletaBonus.update({
      where: { userId },
      data: { bonusBalance: 0, bonusExpiresAt: null, updatedAt: now }
    })
  }
  const today = now.toISOString().slice(0, 10)
  const lastDate = r.lastSpinDate?.toISOString?.()?.slice(0, 10)
  if (lastDate !== today) {
    r = await prisma.roletaBonus.update({
      where: { userId },
      data: { spinsRemaining: dailySpins, lastSpinDate: null, updatedAt: now }
    })
  }
  return r
}

async function addBonusSpinToIndicator(indicatorUserId) {
  try {
    const cfg = await getAppConfig()
    const dailySpins = cfg.roletaDailySpins ?? 1
    let rb = await prisma.roletaBonus.findUnique({ where: { userId: indicatorUserId } })
    if (!rb) {
      rb = await prisma.roletaBonus.create({
        data: { userId: indicatorUserId, bonusBalance: 0, spinsRemaining: dailySpins + 1 }
      })
    } else {
      await prisma.roletaBonus.update({
        where: { userId: indicatorUserId },
        data: { spinsRemaining: { increment: 1 }, updatedAt: new Date() }
      })
    }
  } catch (e) {
    console.error('addBonusSpinToIndicator:', e)
  }
}

app.get('/api/roleta/config', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  try {
    const cfg = await getAppConfig()
    return res.json({ segments: cfg.roletaSegments || DEFAULT_ROLETA_SEGMENTS })
  } catch (e) {
    return res.json({ segments: DEFAULT_ROLETA_SEGMENTS })
  }
})

// Roleta exclusiva para novos usuários (1 giro por usuário, ever)
app.get('/api/roleta-novos/status', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const alreadyUsed = !!user?.roletaNovosUsedAt
    return res.json({ eligible: !alreadyUsed, alreadyUsed })
  } catch (e) {
    console.error('roleta-novos status:', e)
    return res.status(500).json({ error: e.message })
  }
})

app.post('/api/roleta-novos/spin', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (user?.roletaNovosUsedAt) {
      return res.json({ ok: false, error: 'Você já utilizou sua chance na roleta de novos usuários.' })
    }
    const cfg = await getAppConfig()
    const bonusDays = cfg.roletaBonusDays ?? 3
    const segments = cfg.roletaSegments || DEFAULT_ROLETA_SEGMENTS
    const prizeIndex = Math.floor(Math.random() * segments.length)
    const prize = Number(segments[prizeIndex]?.value) ?? 0
    const today = new Date()
    const expiresAt = prize > 0 ? new Date(Date.now() + bonusDays * 24 * 60 * 60 * 1000) : undefined
    const r = await getOrCreateRoleta(req.userId)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId },
        data: { roletaNovosUsedAt: today }
      }),
      prisma.roletaBonus.update({
        where: { userId: req.userId },
        data: {
          bonusBalance: { increment: prize },
          lastSpinDate: today,
          ...(expiresAt && { bonusExpiresAt: expiresAt }),
          updatedAt: today
        }
      }),
      prisma.roletaBonusLog.create({
        data: {
          userId: req.userId,
          valor: prize,
          descricao: prize > 0 ? 'Ganhou na roleta (novos usuários)' : 'Sem prêmio (roleta novos)'
        }
      })
    ])
    return res.json({
      ok: true,
      prize,
      prizeIndex,
      bonusBalance: r.bonusBalance + prize
    })
  } catch (e) {
    console.error('roleta-novos spin:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/api/roleta', authMiddleware, async (req, res) => {
  try {
    const cfg = await getAppConfig()
    const minWithdraw = cfg.roletaMinWithdraw ?? 100
    let r = await getOrCreateRoleta(req.userId)
    const now = new Date()
    const canCollect = r.bonusBalance >= minWithdraw &&
      (!r.bonusExpiresAt || now < r.bonusExpiresAt)
    if (canCollect) {
      const amount = r.bonusBalance
      const u = await prisma.user.findUnique({ where: { id: req.userId } })
      await ensureAfiliado(req.userId, u?.account || '')
      await prisma.$transaction([
        prisma.roletaBonus.update({
          where: { userId: req.userId },
          data: { bonusBalance: 0, bonusExpiresAt: null, updatedAt: now }
        }),
        prisma.afiliadoData.update({
          where: { userId: req.userId },
          data: {
            balance: { increment: amount },
            rolloverPendente: { increment: amount }, // 1x rollover antes de sacar
            updatedAt: now
          }
        })
      ])
      r = await prisma.roletaBonus.findUnique({ where: { userId: req.userId } })
    }
    const logs = await prisma.roletaBonusLog.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const maskAccount = (a) => !a || a.length < 5 ? '****' : a.slice(0, 2) + '****' + a.slice(-2)
    return res.json({
      bonusBalance: r.bonusBalance,
      spinsRemaining: r.spinsRemaining,
      minWithdraw,
      bonusCollected: canCollect,
      report: logs.map(l => ({
        id: maskAccount(user?.account),
        descricao: l.descricao,
        bonus: '+' + l.valor.toFixed(2).replace('.', ',') + ' R$'
      }))
    })
  } catch (e) {
    console.error('roleta get:', e)
    return res.status(500).json({ error: e.message })
  }
})

app.post('/api/roleta/spin', authMiddleware, async (req, res) => {
  try {
    const r = await getOrCreateRoleta(req.userId)
    if (r.spinsRemaining <= 0) {
      return res.json({ ok: false, error: 'Sem giros restantes. Volte amanhã!' })
    }
    const cfg = await getAppConfig()
    const bonusDays = cfg.roletaBonusDays ?? 3
    const segments = cfg.roletaSegments || DEFAULT_ROLETA_SEGMENTS
    const prizeIndex = Math.floor(Math.random() * segments.length)
    const prize = Number(segments[prizeIndex]?.value) ?? 0
    const today = new Date()
    const expiresAt = prize > 0 ? new Date(Date.now() + bonusDays * 24 * 60 * 60 * 1000) : undefined
    await prisma.$transaction([
      prisma.roletaBonus.update({
        where: { userId: req.userId },
        data: {
          bonusBalance: { increment: prize },
          spinsRemaining: { decrement: 1 },
          lastSpinDate: today,
          ...(expiresAt && { bonusExpiresAt: expiresAt }),
          updatedAt: today
        }
      }),
      prisma.roletaBonusLog.create({
        data: {
          userId: req.userId,
          valor: prize,
          descricao: prize > 0 ? 'Ganhou na roleta' : 'Sem prêmio'
        }
      })
    ])
    return res.json({
      ok: true,
      prize,
      prizeIndex,
      bonusBalance: r.bonusBalance + prize,
      spinsRemaining: r.spinsRemaining - 1
    })
  } catch (e) {
    console.error('roleta spin:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// ========== Saque (Withdraw) - Automático via Gatebox ==========
app.post('/api/saque', authMiddleware, async (req, res) => {
  try {
    const cfg = await getAppConfig()
    const { valor, metodo, nome, cpfId } = req.body?.json || req.body || {}
    const v = parseFloat(valor)
    if (!Number.isFinite(v) || v <= 0) return res.json({ error: { message: 'Valor inválido' } })
    if (v < cfg.saqueMin) return res.json({ error: { message: `Valor mínimo R$ ${cfg.saqueMin.toFixed(2)}` } })
    if (v > cfg.saqueMax) return res.json({ error: { message: `Valor máximo R$ ${cfg.saqueMax.toFixed(2).replace('.', ',')}` } })
    const chavePix = String(cpfId || '').trim()
    if (!chavePix || chavePix.length > 77) return res.json({ error: { message: 'Chave PIX inválida' } })
    const nomeRecebedor = String(nome || '').trim()
    if (!nomeRecebedor || nomeRecebedor.length > 120) return res.json({ error: { message: 'Nome do recebedor é obrigatório' } })
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const af = await ensureAfiliado(req.userId, user?.account || '')
    const saldo = af.balance ?? 0
    if (saldo < v) return res.json({ error: { message: 'Saldo insuficiente' } })
    const rollover = af.rolloverPendente ?? 0
    if (rollover > 0) return res.json({ error: { message: `Requisito de rollover não cumprido. Aposte mais R$ ${rollover.toFixed(2)} para liberar o saque.` } })

    const [, withdrawal] = await prisma.$transaction([
      prisma.afiliadoData.update({
        where: { userId: req.userId },
        data: {
          balance: { decrement: v },
          valorSaque: { increment: v },
          numSaques: { increment: 1 },
          updatedAt: new Date()
        }
      }),
      prisma.withdrawal.create({
        data: {
          userId: req.userId,
          valor: v,
          metodo: metodo || 'pix',
          nome: nomeRecebedor || null,
          cpfId: chavePix,
          status: 'pendente'
        }
      })
    ])

    let key = chavePix
    if (/^\d+$/.test(key) && (key.length === 11 || key.length === 14)) {
      key = key.replace(/\D/g, '')
    }
    const name = nomeRecebedor || user?.account || 'Cliente'

    const refundAndFail = async (errorMsg) => {
      await prisma.$transaction([
        prisma.withdrawal.update({ where: { id: withdrawal.id }, data: { status: 'recusado', updatedAt: new Date() } }),
        prisma.afiliadoData.update({
          where: { userId: req.userId },
          data: { balance: { increment: v }, valorSaque: { decrement: v }, numSaques: { decrement: 1 }, updatedAt: new Date() }
        })
      ])
      return res.json({ error: { message: errorMsg } })
    }

    let withdrawResult
    try {
      withdrawResult = await gateboxWithdraw({
        externalId: withdrawal.id,
        key,
        name,
        amount: v,
        documentNumber: /^\d{11}$|^\d{14}$/.test(key) ? key : undefined,
        description: `Saque A73 - ${user?.account || req.userId}`
      })
    } catch (gateboxErr) {
      console.error('Gatebox withdraw error:', gateboxErr)
      return refundAndFail('Erro de conexão com o gateway. Tente novamente.')
    }

    if (!withdrawResult.ok) {
      return refundAndFail(withdrawResult.error || 'Erro ao enviar PIX. Tente novamente ou entre em contato com o suporte.')
    }

    await prisma.withdrawal.update({ where: { id: withdrawal.id }, data: { status: 'concluido', updatedAt: new Date() } })
    return res.json({ result: { data: { json: { ok: true, valor: v, saldoRestante: saldo - v } } } })
  } catch (e) {
    console.error('saque:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// ========== Admin APIs ==========

// Rate limit in-memory reutilizável (login usuário + admin + registro)
function makeRateLimiter(max, windowMs) {
  const attempts = new Map()
  setInterval(() => {
    const cutoff = Date.now() - windowMs
    for (const [k, e] of attempts.entries()) {
      if (e.windowStart < cutoff) attempts.delete(k)
    }
  }, 30 * 60 * 1000)
  return {
    check(key) {
      const now = Date.now()
      const e = attempts.get(key) || { count: 0, windowStart: now }
      if (now - e.windowStart > windowMs) { e.count = 0; e.windowStart = now }
      e.count++
      attempts.set(key, e)
      return e.count <= max
    }
  }
}

const userLoginLimiter    = makeRateLimiter(10, 15 * 60 * 1000)  // 10 tentativas / 15 min por IP
const userRegisterLimiter = makeRateLimiter(5, 60 * 60 * 1000)   // 5 registros / hora por IP

// Rate limit in-memory para login admin: máx 10 tentativas por IP em 15 minutos
const adminLoginAttempts = new Map()
const ADMIN_RATE_LIMIT_MAX = 10
const ADMIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 min

function checkAdminRateLimit(ip) {
  const now = Date.now()
  const entry = adminLoginAttempts.get(ip) || { count: 0, windowStart: now }
  if (now - entry.windowStart > ADMIN_RATE_LIMIT_WINDOW_MS) {
    // Janela expirou, reinicia
    entry.count = 0
    entry.windowStart = now
  }
  entry.count++
  adminLoginAttempts.set(ip, entry)
  return entry.count <= ADMIN_RATE_LIMIT_MAX
}

// Limpeza periódica de entradas antigas (a cada 30 min)
setInterval(() => {
  const cutoff = Date.now() - ADMIN_RATE_LIMIT_WINDOW_MS
  for (const [ip, entry] of adminLoginAttempts.entries()) {
    if (entry.windowStart < cutoff) adminLoginAttempts.delete(ip)
  }
}, 30 * 60 * 1000)

app.post('/api/admin/login', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
    if (!checkAdminRateLimit(ip)) {
      return res.status(429).json({ error: { message: 'Muitas tentativas. Aguarde 15 minutos.' } })
    }

    const { user, password } = req.body?.json || req.body || {}
    if (!user || !password) return res.status(400).json({ error: { message: 'Usuário e senha obrigatórios' } })
    const cred = await getAdminCredentials()
    let ok = false
    if (cred.fromDb) {
      ok = await bcrypt.compare(password, cred.passwordHash)
    } else {
      ok = password === cred.password && user.toLowerCase() === cred.user.toLowerCase()
    }
    if (!ok) return res.status(401).json({ error: { message: 'Credenciais inválidas' } })
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ ok: true, token })
  } catch (e) {
    console.error('admin login:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

app.get('/api/admin/dashboard', adminAuthMiddleware, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setDate(todayEnd.getDate() + 1)
    const [usersCount, depositsToday, withdrawalsPending, recentDeposits, recentWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.aggregate({ where: { createdAt: { gte: today, lt: todayEnd } }, _sum: { valor: true } }),
      prisma.withdrawal.aggregate({ where: { status: 'pendente' }, _sum: { valor: true } }),
      prisma.deposit.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { account: true } } } }),
      prisma.withdrawal.findMany({ where: { status: 'pendente' }, orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { account: true } } } })
    ])
    const totalDeposits = await prisma.deposit.aggregate({ _sum: { valor: true } })
    return res.json({
      usersCount,
      depositsToday: depositsToday._sum.valor ?? 0,
      withdrawalsPending: withdrawalsPending._sum.valor ?? 0,
      totalDeposits: totalDeposits._sum.valor ?? 0,
      recentDeposits: recentDeposits.map(d => ({ user: maskAccount(d.user?.account), valor: d.valor, status: 'Aprovado', data: d.createdAt?.toISOString?.()?.slice(0, 16)?.replace('T', ' ') })),
      recentWithdrawals: recentWithdrawals.map(w => ({ user: maskAccount(w.user?.account), valor: w.valor, status: 'Pendente', data: w.createdAt?.toISOString?.()?.slice(0, 16)?.replace('T', ' ') }))
    })
  } catch (e) {
    console.error('admin dashboard:', e)
    return res.status(500).json({ usersCount: 0, depositsToday: 0, withdrawalsPending: 0, totalDeposits: 0, recentDeposits: [], recentWithdrawals: [] })
  }
})

app.get('/api/admin/saques', adminAuthMiddleware, async (req, res) => {
  try {
    const status = req.query.status || ''
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const where = status ? { status } : {}
    const list = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { account: true } } }
    })
    return res.json({ list: list.map(w => ({
      id: w.id,
      userId: w.userId,
      user: maskAccount(w.user?.account),
      valor: w.valor,
      metodo: w.metodo,
      nome: w.nome,
      cpfId: w.cpfId,
      status: w.status,
      createdAt: w.createdAt?.toISOString?.()?.slice(0, 19)?.replace('T', ' ') || null
    })) })
  } catch (e) {
    console.error('admin saques:', e)
    return res.status(500).json({ list: [], error: e.message })
  }
})

app.patch('/api/admin/saques/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body?.json || req.body || {}
    if (!['concluido', 'recusado'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Status inválido. Use concluido ou recusado.' })
    }
    const w = await prisma.withdrawal.findUnique({ where: { id }, include: { user: { select: { account: true } } } })
    if (!w) return res.status(404).json({ ok: false, error: 'Saque não encontrado' })
    if (w.status !== 'pendente') return res.status(400).json({ ok: false, error: 'Saque já processado' })
    if (status === 'recusado') {
      await prisma.$transaction([
        prisma.withdrawal.update({ where: { id }, data: { status: 'recusado', updatedAt: new Date() } }),
        prisma.afiliadoData.update({
          where: { userId: w.userId },
          data: { balance: { increment: w.valor }, updatedAt: new Date() }
        })
      ])
      return res.json({ ok: true, status })
    }
    let key = String(w.cpfId || '').trim()
    if (!key) return res.status(400).json({ ok: false, error: 'Chave PIX não informada no saque' })
    if (/^\d+$/.test(key) && (key.length === 11 || key.length === 14)) {
      key = key.replace(/\D/g, '')
    }
    const name = String(w.nome || w.user?.account || 'Cliente').trim()
    const withdrawResult = await gateboxWithdraw({
      externalId: id,
      key,
      name,
      amount: w.valor,
      documentNumber: /^\d{11}$|^\d{14}$/.test(key) ? key : undefined,
      description: `Saque A73 - ${w.user?.account || w.userId}`
    })
    if (!withdrawResult.ok) {
      return res.status(400).json({ ok: false, error: withdrawResult.error || 'Erro ao enviar PIX via Gatebox' })
    }
    await prisma.withdrawal.update({ where: { id }, data: { status: 'concluido', updatedAt: new Date() } })
    return res.json({ ok: true, status: 'concluido' })
  } catch (e) {
    console.error('admin saque update:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/api/admin/usuarios', adminAuthMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const where = q ? {
      OR: [
        { account: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } }
      ]
    } : {}
    const list = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { afiliado: { select: { balance: true, valorDeposito: true, apostaAcumulada: true } } }
    })
    return res.json({ list: list.map(u => ({
      id: u.id,
      account: u.account,
      phone: u.phone,
      balance: u.afiliado?.balance ?? 0,
      valorDeposito: u.afiliado?.valorDeposito ?? 0,
      apostaAcumulada: u.afiliado?.apostaAcumulada ?? 0,
      createdAt: u.createdAt?.toISOString?.()?.slice(0, 19)?.replace('T', ' ') || null
    })) })
  } catch (e) {
    console.error('admin usuarios:', e)
    return res.status(500).json({ list: [], error: e.message })
  }
})

app.get('/api/admin/config', adminAuthMiddleware, async (req, res) => {
  try {
    const cfg = await getAppConfig()
    return res.json(cfg)
  } catch (e) {
    return res.json({ depositoMin: 10, saqueMin: 20, saqueMax: 40000, roletaMinWithdraw: 100, roletaBonusDays: 3, roletaDailySpins: 1, bonusPrimeiroDep: 0, bonusPrimeiroDepPercent: 0, roletaSegments: DEFAULT_ROLETA_SEGMENTS })
  }
})

app.post('/api/admin/config', adminAuthMiddleware, async (req, res) => {
  try {
    const body = req.body?.json || req.body || {}
    const depositoMin = Math.max(1, parseInt(body.depositoMin, 10) || 10)
    const saqueMin = Math.max(1, parseInt(body.saqueMin, 10) || 20)
    const saqueMax = Math.min(1000000, Math.max(saqueMin, parseInt(body.saqueMax, 10) || 40000))
    const roletaMinWithdraw = Math.max(1, parseInt(body.roletaMinWithdraw, 10) || 100)
    const roletaBonusDays = Math.max(1, Math.min(30, parseInt(body.roletaBonusDays, 10) || 3))
    const roletaDailySpins = Math.max(1, Math.min(10, parseInt(body.roletaDailySpins, 10) || 1))
    const bonusPrimeiroDep = Math.max(0, parseFloat(body.bonusPrimeiroDep) || 0)
    const bonusPrimeiroDepPercent = Math.max(0, Math.min(100, parseFloat(body.bonusPrimeiroDepPercent) || 0))
    const segs = body.roletaSegments
    const roletaSegments = Array.isArray(segs) && segs.length === 8
      ? segs.map((sg, i) => ({ label: String(sg?.label ?? ''), value: Number(sg?.value) ?? 0 }))
      : DEFAULT_ROLETA_SEGMENTS
    const whatsappUrl = String(body.whatsappUrl || '').trim().slice(0, 200)
    const value = { depositoMin, saqueMin, saqueMax, roletaMinWithdraw, roletaBonusDays, roletaDailySpins, bonusPrimeiroDep, bonusPrimeiroDepPercent, roletaSegments, whatsappUrl }
    await prisma.setting.upsert({
      where: { id: 'config' },
      create: { id: 'config', value },
      update: { value }
    })
    return res.json({ ok: true })
  } catch (e) {
    console.error('admin config save:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/api/admin/gatebox', adminAuthMiddleware, async (req, res) => {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'gatebox' } })
    const v = s?.value || {}
    return res.json({
      apiUrl: v.apiUrl || 'https://api.gatebox.com.br',
      username: v.username || '',
      password: v.password ? '••••••' : ''
    })
  } catch (e) {
    return res.json({ apiUrl: 'https://api.gatebox.com.br', username: '', password: '' })
  }
})

app.post('/api/admin/gatebox', adminAuthMiddleware, async (req, res) => {
  try {
    const { apiUrl, username, password } = req.body?.json || req.body || {}
    const s = await prisma.setting.findUnique({ where: { id: 'gatebox' } })
    const v = (s?.value && typeof s.value === 'object') ? { ...s.value } : {}
    v.apiUrl = (apiUrl || 'https://api.gatebox.com.br').replace(/\/$/, '')
    v.username = String(username || '').trim()
    if (password && password !== '••••••') v.password = String(password).trim()
    await prisma.setting.upsert({
      where: { id: 'gatebox' },
      create: { id: 'gatebox', value: v },
      update: { value: v }
    })
    return res.json({ ok: true })
  } catch (e) {
    console.error('admin gatebox save:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// POST /api/admin/gatebox/test-pix - testa criação de PIX e retorna resposta bruta da Gatebox (debug)
app.post('/api/admin/gatebox/test-pix', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await gateboxCreatePix({
      externalId: 'test-' + Date.now(),
      amount: 0.1,
      document: '12345678901',
      name: 'Teste Debug',
      expire: 60
    })
    return res.json({
      ok: result.ok,
      raw: result.data,
      keys: result.data ? Object.keys(result.data) : [],
      error: result.error
    })
  } catch (e) {
    console.error('admin gatebox test-pix:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/api/admin/depositos', adminAuthMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const statusFilter = (req.query.status || '').trim().toLowerCase()
    const where = statusFilter && ['pendente', 'concluido', 'erro'].includes(statusFilter)
      ? { status: statusFilter }
      : {}
    const list = await prisma.deposit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { account: true } } }
    })
    return res.json({ list: list.map(d => ({
      id: d.id,
      userId: d.userId,
      user: maskAccount(d.user?.account),
      valor: d.valor,
      status: d.status || 'concluido',
      createdAt: d.createdAt?.toISOString?.()?.slice(0, 19)?.replace('T', ' ') || null
    })) })
  } catch (e) {
    console.error('admin depositos:', e)
    return res.status(500).json({ list: [], error: e.message })
  }
})

// POST aprovar depósito pendente manualmente (admin) - opcional: bonusAmount em R$
app.post('/api/admin/depositos/:id/approve', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { bonusAmount = 0 } = req.body || {}
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: { user: { select: { account: true } } }
    })
    if (!deposit) return res.status(404).json({ ok: false, error: 'Depósito não encontrado' })
    if (deposit.status !== 'pendente') {
      return res.status(400).json({ ok: false, error: 'Apenas depósitos pendentes podem ser aprovados' })
    }
    const bonus = Math.max(0, parseFloat(bonusAmount) || 0)
    await confirmarDepositoPix(deposit, bonus)
    return res.json({ ok: true })
  } catch (e) {
    console.error('admin depositos approve:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// POST adicionar saldo bônus a usuário específico (admin)
app.post('/api/admin/usuarios/:id/add-bonus', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { amount, motivo } = req.body || {}
    const v = parseFloat(amount)
    if (!v || v <= 0) return res.status(400).json({ ok: false, error: 'Valor inválido' })
    const user = await prisma.user.findUnique({ where: { id }, include: { afiliado: true } })
    if (!user) return res.status(404).json({ ok: false, error: 'Usuário não encontrado' })
    const af = await ensureAfiliado(user.id, user.account)
    await prisma.afiliadoData.update({
      where: { userId: id },
      data: { balance: { increment: v }, updatedAt: new Date() }
    })
    console.log('Admin add-bonus:', { userId: id, account: user.account, amount: v, motivo: motivo || '' })
    return res.json({ ok: true, newBalance: (af.balance ?? 0) + v })
  } catch (e) {
    console.error('admin add-bonus:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// GET settings (logo, banner, siteName, pageTitle, depositoMin, saqueMin, saqueMax) - público
app.get('/api/settings', async (req, res) => {
  try {
    const [main, config] = await Promise.all([
      prisma.setting.findUnique({ where: { id: 'main' } }),
      prisma.setting.findUnique({ where: { id: 'config' } })
    ])
    const v = main?.value || {}
    const cfg = config?.value || {}
    const defaultLogo = '/s5/app-icon/1222508/LOGO.jpg'
    return res.json({
      logo: main?.logo || defaultLogo,
      banner: main?.banner || '/s5/1770954153806/9999.jpg',
      loadingBanner: v.loadingBanner || main?.logo || defaultLogo,
      siteName: v.siteName || 'A73.com',
      pageTitle: v.pageTitle || 'A73',
      depositoMin: cfg.depositoMin ?? 10,
      saqueMin: cfg.saqueMin ?? 20,
      saqueMax: cfg.saqueMax ?? 40000,
      whatsappUrl: cfg.whatsappUrl || ''
    })
  } catch (e) {
    return res.json({ logo: '/s5/app-icon/1222508/LOGO.jpg', banner: '/s5/1770954153806/9999.jpg', loadingBanner: '/s5/app-icon/1222508/LOGO.jpg', siteName: 'A73.com', pageTitle: 'A73', depositoMin: 10, saqueMin: 20, saqueMax: 40000, whatsappUrl: '' })
  }
})

// Upload banner de carregamento (tela de loading)
app.post('/api/upload/loading-banner', upload.single('file'), adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ ok: false, error: 'Nenhum arquivo enviado' })
    }
    const url = `/uploads/${req.file.filename}`
    const s = await prisma.setting.findUnique({ where: { id: 'main' } })
    const v = (s?.value && typeof s.value === 'object') ? { ...s.value } : {}
    v.loadingBanner = url
    await prisma.setting.upsert({
      where: { id: 'main' },
      create: { id: 'main', logo: null, banner: null, value: v },
      update: { value: v }
    })
    return res.json({ ok: true, url })
  } catch (e) {
    console.error('upload loading-banner:', e)
    return res.json({ ok: false, error: e.message })
  }
})

// Restaurar banner de carregamento (usar logo)
app.post('/api/settings/loading-banner/clear', adminAuthMiddleware, async (req, res) => {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'main' } })
    const v = (s?.value && typeof s.value === 'object') ? { ...s.value } : {}
    delete v.loadingBanner
    await prisma.setting.upsert({
      where: { id: 'main' },
      create: { id: 'main', logo: null, banner: null, value: v },
      update: { value: v }
    })
    return res.json({ ok: true })
  } catch (e) {
    console.error('clear loading-banner:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// POST settings branding (siteName, pageTitle) - requer admin
app.post('/api/settings/branding', adminAuthMiddleware, async (req, res) => {
  try {
    const { siteName, pageTitle } = req.body?.json || req.body || {}
    const s = await prisma.setting.findUnique({ where: { id: 'main' } })
    const v = (s?.value && typeof s.value === 'object') ? { ...s.value } : {}
    if (typeof siteName === 'string') v.siteName = siteName.trim() || 'A73.com'
    if (typeof pageTitle === 'string') v.pageTitle = pageTitle.trim() || 'A73'
    await prisma.setting.upsert({
      where: { id: 'main' },
      create: { id: 'main', logo: null, banner: null, value: v },
      update: { value: v }
    })
    return res.json({ ok: true, siteName: v.siteName, pageTitle: v.pageTitle })
  } catch (e) {
    console.error('save branding:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// ========== Promoções (Eventos) - público + admin ==========
// GET promocoes - lista pública
app.get('/api/promocoes', async (req, res) => {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'promocoes' } })
    const list = (s?.value && Array.isArray(s.value)) ? s.value : []
    return res.json(list)
  } catch (e) {
    return res.json([])
  }
})

// GET admin promocoes
app.get('/api/admin/promocoes', adminAuthMiddleware, async (req, res) => {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'promocoes' } })
    const list = (s?.value && Array.isArray(s.value)) ? s.value : []
    return res.json(list)
  } catch (e) {
    return res.json([])
  }
})

// POST admin promocoes - criar/atualizar lista
app.post('/api/admin/promocoes', adminAuthMiddleware, async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : (req.body?.promocoes || req.body?.list || [])
    const valid = list.map((p, i) => ({
      id: p.id || `p-${Date.now()}-${i}`,
      titulo: String(p.titulo || '').trim(),
      descricao: String(p.descricao || '').trim(),
      bannerUrl: String(p.bannerUrl || p.banner || '').trim(),
      url: String(p.url || p.link || '').trim(),
      status: String(p.status || 'Em andamento').trim(),
      ordem: Number(p.ordem) || i
    })).sort((a, b) => a.ordem - b.ordem)
    await prisma.setting.upsert({
      where: { id: 'promocoes' },
      create: { id: 'promocoes', logo: null, banner: null, value: valid },
      update: { value: valid }
    })
    return res.json({ ok: true, promocoes: valid })
  } catch (e) {
    console.error('save promocoes:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// Upload banner de promoção
app.post('/api/upload/promo-banner', upload.single('file'), adminAuthMiddleware, async (req, res) => {
  try {
    if (!req.file) return res.json({ ok: false, error: 'Nenhum arquivo enviado' })
    const url = `/uploads/${req.file.filename}`
    return res.json({ ok: true, url })
  } catch (e) {
    console.error('upload promo-banner:', e)
    return res.json({ ok: false, error: e.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: 'postgres' })
})

async function main() {
  try {
    await prisma.$connect()
    const uploadsDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  } catch (e) {
    console.warn('DB connect:', e.message)
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A73 Backend running on port ${PORT}`)
  })
}

main().catch(console.error)
