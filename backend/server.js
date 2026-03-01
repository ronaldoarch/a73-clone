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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'a73-secret-change-in-production'

app.use(cors({ origin: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/** Gera pid único a partir do account */
function generatePid(account) {
  const hash = Math.abs(String(account).split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return '4' + String(hash).padStart(9, '0')
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

// tRPC-style user.login
app.post('/api/frontend/trpc/user.login', async (req, res) => {
  try {
    const { account, phone, password } = req.body?.json || req.body || {}
    const login = account || phone
    if (!login || !password) {
      return res.json({ error: { message: 'Telefone e senha obrigatórios' } })
    }
    const user = await prisma.user.findUnique({ where: { account: login } })
    if (!user) {
      return res.json({ error: { message: 'Usuário não encontrado' } })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.json({ error: { message: 'Senha incorreta' } })
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
    return res.status(500).json({ error: { message: e.message || 'Erro interno' } })
  }
})

// tRPC-style user.register
app.post('/api/frontend/trpc/user.register', async (req, res) => {
  try {
    const data = req.body?.json || req.body || {}
    const { phone, account, password, confirmPassword, pid } = data
    const acc = account || phone
    if (!acc || !password) {
      return res.json({ error: { message: 'Telefone e senha obrigatórios' } })
    }
    if (password !== confirmPassword) {
      return res.json({ error: { message: 'As senhas não coincidem' } })
    }
    const phoneClean = String(acc).replace(/\D/g, '')
    if (phoneClean.length < 10) {
      return res.json({ error: { message: 'Telefone inválido (mínimo 10 dígitos)' } })
    }
    const exists = await prisma.user.findUnique({ where: { account: acc } })
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
        account: acc,
        phone: acc,
        password: hash,
        indicatorId
      }
    })
    const pidNovo = generatePid(acc)
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

// Upload logo
app.post('/api/upload/logo', upload.single('file'), async (req, res) => {
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

// GET afiliado - retorna dados completos
app.get('/api/afiliado', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    const data = {
      pid: af.pid,
      subDiretos: af.subDiretos,
      subValidos: af.subValidos,
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
      bonusVipColetados: Array.isArray(af.bonusVipColetados) ? af.bonusVipColetados : []
    }
    return res.json({ result: { data: { json: data } } })
  } catch (e) {
    console.error('afiliado get:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST depósito
app.post('/api/deposito', authMiddleware, async (req, res) => {
  try {
    const { valor } = req.body?.json || req.body || {}
    const v = parseFloat(valor)
    if (!v || v <= 0) {
      return res.json({ error: { message: 'Valor inválido' } })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { afiliado: true } })
    if (!user) return res.status(401).json({ error: { message: 'Usuário não encontrado' } })
    const af = await ensureAfiliado(req.userId, user.account)
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
          balance: { increment: v },
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

// POST reclamar bônus Promo
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
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    if (af.subValidos < p) return res.json({ error: { message: 'Subordinados insuficientes' } })
    const reclamados = Array.isArray(af.bonusPromoReclamados) ? af.bonusPromoReclamados : []
    if (reclamados.some(x => x.pessoas === p)) return res.json({ error: { message: 'Já reclamado' } })
    reclamados.push({ pessoas: p, valor: r.valor })
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: { bonusPromoReclamados: reclamados, updatedAt: new Date() }
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
        updatedAt: new Date()
      }
    })
    return res.json({ result: { data: { json: { ok: true, valor: v } } } })
  } catch (e) {
    console.error('receber-comissao:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
})

// POST reclamar Misterioso
app.post('/api/afiliado/reclamar-misterioso', authMiddleware, async (req, res) => {
  try {
    const af = await ensureAfiliado(req.userId, (await prisma.user.findUnique({ where: { id: req.userId } }))?.account || '')
    if (af.misteriosoReclamado) return res.json({ error: { message: 'Já reclamado' } })
    if (af.depositoMisterioso < 30) return res.json({ error: { message: 'Depósito mínimo R$ 30,00' } })
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: { misteriosoReclamado: true, updatedAt: new Date() }
    })
    return res.json({ result: { data: { json: { ok: true } } } })
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
    const coletados = Array.isArray(af.bonusVipColetados) ? af.bonusVipColetados : []
    coletados.push({ nivel: af.nivelVip, valor: af.bonusVipReclamar })
    await prisma.afiliadoData.update({
      where: { userId: req.userId },
      data: { bonusVipReclamar: 0, bonusVipColetados: coletados, updatedAt: new Date() }
    })
    return res.json({ result: { data: { json: { ok: true } } } })
  } catch (e) {
    console.error('coletar-vip:', e)
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
      }
    }
  } catch (e) { /* ignore */ }
  return null
}

// ========== iGameWin Seamless API (Site API) ==========
// Endpoint que a iGameWin chama em modo Seamless. Configure a URL com iGameWin:
// https://seu-dominio.com/gold_api
// Usa agent_code e agent_secret do Settings (Admin) ou env
app.post('/gold_api', async (req, res) => {
  try {
    const { method, agent_code, agent_secret, user_code } = req.body || {}
    const stored = await getIgamewinConfig()
    const expectedCode = stored?.agent_code || process.env.IGAMEWIN_AGENT_CODE || 'Midaslabs'
    const expectedSecret = stored?.agent_secret || process.env.IGAMEWIN_AGENT_SECRET || ''
    if (agent_code !== expectedCode || !expectedSecret || agent_secret !== expectedSecret) {
      return res.json({ status: 0, msg: 'INVALID_AGENT', user_balance: 0 })
    }
    if (!user_code) {
      return res.json({ status: 0, msg: 'INVALID_PARAMETER', user_balance: 0 })
    }

    if (method === 'user_balance') {
      const af = await prisma.afiliadoData.findFirst({
        where: { user: { account: user_code } },
        include: { user: true }
      })
      const balance = af?.balance ?? 0
      return res.json({ status: 1, user_balance: Math.round(balance * 100) / 100 })
    }

    if (method === 'transaction') {
      const { agent_balance, user_balance: reportedBalance, game_type, slot } = req.body || {}
      const slotData = slot || req.body?.live || req.body?.sport || {}
      const txnType = slotData.txn_type || 'debit_credit'
      const betMoney = Number(slotData.bet_money ?? slotData.bet ?? 0) || 0
      const winMoney = Number(slotData.win_money ?? slotData.win ?? 0) || 0

      let delta = 0
      if (txnType === 'debit') delta = -betMoney
      else if (txnType === 'credit') delta = winMoney
      else delta = winMoney - betMoney

      const af = await prisma.afiliadoData.findFirst({
        where: { user: { account: user_code } },
        include: { user: true }
      })
      if (!af) {
        return res.json({ status: 0, msg: 'INVALID_USER', user_balance: 0 })
      }

      const currentBalance = af.balance ?? 0
      const newBalance = currentBalance + delta
      if (newBalance < 0) {
        return res.json({ status: 0, msg: 'INSUFFICIENT_USER_FUNDS', user_balance: Math.round(currentBalance * 100) / 100 })
      }

      await prisma.afiliadoData.update({
        where: { id: af.id },
        data: { balance: newBalance, updatedAt: new Date() }
      })
      return res.json({ status: 1, user_balance: Math.round(newBalance * 100) / 100 })
    }

    return res.json({ status: 0, msg: 'INVALID_METHOD', user_balance: 0 })
  } catch (e) {
    console.error('gold_api error:', e)
    res.status(500).json({ status: 0, msg: 'INTERNAL_ERROR', user_balance: 0 })
  }
})

// GET/POST iGameWin config (Admin) - credenciais salvas no backend
app.get('/api/settings/igamewin', async (req, res) => {
  try {
    const cfg = await getIgamewinConfig()
    return res.json(cfg || { agent_code: '', agent_token: '', agent_secret: '', sandbox: true, is_demo: true })
  } catch (e) {
    return res.json({ agent_code: '', agent_token: '', agent_secret: '', sandbox: true, is_demo: true })
  }
})

app.post('/api/settings/igamewin', async (req, res) => {
  try {
    const { agent_code, agent_token, agent_secret, sandbox, is_demo } = req.body || {}
    await prisma.setting.upsert({
      where: { id: 'igamewin' },
      create: {
        id: 'igamewin',
        value: { agent_code: agent_code || '', agent_token: agent_token || '', agent_secret: agent_secret || '', sandbox: sandbox ?? true, is_demo: is_demo ?? true }
      },
      update: {
        value: { agent_code: agent_code || '', agent_token: agent_token || '', agent_secret: agent_secret || '', sandbox: sandbox ?? true, is_demo: is_demo ?? true }
      }
    })
    return res.json({ ok: true })
  } catch (e) {
    console.error('save igamewin config:', e)
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// Proxy iGameWin API (evita CORS em produção)
// Usa credenciais do backend (Settings) quando salvas; senão usa o body da requisição
const IGAMEWIN_URL = 'https://igamewin.com/api/v1'
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

// GET settings (logo, banner) - público
app.get('/api/settings', async (req, res) => {
  try {
    const s = await prisma.setting.findUnique({ where: { id: 'main' } })
    return res.json({
      logo: s?.logo || '/s5/app-icon/1222508/LOGO.jpg',
      banner: s?.banner || '/s5/1770954153806/9999.jpg'
    })
  } catch (e) {
    return res.json({ logo: '/s5/app-icon/1222508/LOGO.jpg', banner: '/s5/1770954153806/9999.jpg' })
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
