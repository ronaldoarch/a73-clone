/**
 * Bridge tRPC HTTP batch para o site_baixado: devolve o mesmo formato { result: { data: { json } } }
 * que o patch-fetch espera. Suporta GET (queries) e POST (mutations).
 * - GET: input vem de req.query.input (JSON) ou req.query[n]
 * - POST: input vem de req.body (batch array ou objeto)
 */
import jwt from 'jsonwebtoken'

function pathToProcKey(p) {
  const x = String(p || '').trim().split('.')
  if (x.length < 2) return String(p || '').replace(/\./g, '')
  return x[0] + x[1].charAt(0).toUpperCase() + x[1].slice(1)
}

function parseBatchInputs(body, n) {
  if (body == null) return null
  if (Array.isArray(body)) {
    const row = body[n]
    return row && typeof row === 'object' && 'json' in row ? row.json : row
  }
  if (typeof body === 'object') {
    const row = body[String(n)] ?? body[n]
    if (row !== undefined) {
      return row && typeof row === 'object' && 'json' in row ? row.json : row
    }
    if (n === 0 && 'json' in body && !Object.keys(body).some((k) => /^\d+$/.test(k))) {
      return body.json
    }
  }
  return null
}

function okJson(json) {
  return { result: { data: { json, meta: {} } } }
}

function errJson(message, code = 'INTERNAL_SERVER_ERROR') {
  return {
    error: {
      json: { message: String(message || 'Erro'), code }
    }
  }
}

const DEMO_TOKEN = 'a73-local-demo-token'

const fallbacks = {
  domainInfo: {
    list: [],
    config: [
      { tenantId: 0, currency: 'BRL', symbol: 'R$' },
      { tenantId: 1, currency: 'BRL', symbol: 'R$' }
    ],
    domains: [],
    tenantId: 1,
    currency: 'BRL',
    symbol: 'R$'
  },
  channelInfo: {
    id: 1,
    tenantId: 1,
    domain: 'localhost',
    currency: 'BRL',
    symbol: 'R$',
    config: [{ tenantId: 1, currency: 'BRL', symbol: 'R$' }]
  },
  tenantInfo: {
    tenantId: 1,
    currency: 'BRL',
    symbol: 'R$',
    id: 1,
    switch: true,
    background: 'theme_SKIN_9.png',
    region: { currency: 'BRL', symbol: 'R$', language: 'pt-BR' },
    currencySymbol: 'R$',
    siteName: 'A73 Local',
    appIcon: '/assets/banner01-D4JvzT0X.png',
    siteLogo: '/assets/banner01-D4JvzT0X.png',
    appLanguage: ['pt-BR', 'en', 'es'],
    appDefaultLanguage: 'pt-BR'
  },
  authTenants: [{ id: 1, tenantId: 1, currency: 'BRL', symbol: 'R$', name: 'Local' }],
  homeList: { list: [{ games: [], items: [] }], total: 0, gameTypeList: [] },
  homeHot: { list: [{ games: [], items: [] }], total: 0, hotList: [] },
  homePopularGames: { list: [{ games: [], items: [] }], games: [], total: 0 },
  homeMarquee: { content: [], list: [], value: [] },
  carouselConfigList: [],
  activityConfig: {
    configList: {
      tabSort: [
        '{"title":"Eventos","isOpen":true,"sort":40}',
        '{"title":"Código de Resgate","isOpen":true,"sort":30}',
        '{"title":"Histórico","isOpen":true,"sort":20}',
        '{"title":"Pendente","isOpen":true,"sort":10}'
      ]
    }
  },
  taskList: { taskList: [], taskRules: {} },
  activityListPublic: {
    list: [{ id: 2118, type: 'Agency', title: 'Indique amigos — Bônus R$50', sort: 1, status: 'ON' }],
    total: 1
  },
  tenantFooterText: { text: '', content: [] },
  announcementLoginOut: { list: [], value: [] }
}

function deepClone(x) {
  try {
    return JSON.parse(JSON.stringify(x))
  } catch {
    return x
  }
}

function getBearer(req) {
  const h = req.headers.authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m ? m[1].trim() : ''
}

function fallbackForProc(procKey) {
  const u = procKey.toLowerCase()
  if (u.includes('domain') && u.includes('tenant')) return deepClone(fallbacks.domainInfo)
  if (u.includes('channel')) return deepClone(fallbacks.channelInfo)
  if (u.includes('tenant') && u.includes('info')) return deepClone(fallbacks.tenantInfo)
  if (u === 'authtenants' || u.includes('authtenant')) return deepClone(fallbacks.authTenants)
  if (u === 'authinfo')
    return { loginType: ['Phone', 'Account'], registerSwitch: true, forgetPasswordSwitch: true }
  if (u === 'authtoken') return { token: DEMO_TOKEN }
  if (u === 'authlogout') return { ok: true }
  if (u.indexOf('carouselconfig') >= 0) return deepClone(fallbacks.carouselConfigList)
  if (u.indexOf('popular') >= 0) return deepClone(fallbacks.homePopularGames)
  if (u.indexOf('marquee') >= 0 || u.indexOf('carousel') >= 0) return deepClone(fallbacks.homeMarquee)
  if (u.indexOf('banner') >= 0 && u.indexOf('quick') >= 0)
    return {
      list: [
        {
          id: 9201,
          imageUrl: '/svg/gift.svg',
          targetType: 'internal',
          targetValue: '{"type":"activity_list","info":{}}'
        }
      ],
      total: 1
    }
  if (u.indexOf('banner') >= 0)
    return {
      list: [],
      total: 0
    }
  if (u.indexOf('mainmedia') >= 0) return { list: [], total: 0 }
  if (u === 'activityconfig') return deepClone(fallbacks.activityConfig)
  if (u === 'tasklist') return deepClone(fallbacks.taskList)
  if (u.indexOf('activity') >= 0) return deepClone(fallbacks.activityListPublic)
  if (u.indexOf('footer') >= 0) return deepClone(fallbacks.tenantFooterText)
  if (u.indexOf('announcement') >= 0) return deepClone(fallbacks.announcementLoginOut)
  if (u.indexOf('prizepool') >= 0) {
    const now = Math.floor(Date.now() / 1000)
    return [{ time: now, prizePoolValue: 0 }, { time: now + 7200, prizePoolValue: 0 }]
  }
  if (u.indexOf('hot') >= 0) return deepClone(fallbacks.homeHot)
  if (u.indexOf('redpoint') >= 0) return []
  return deepClone(fallbacks.homeList)
}

async function resolveOne(procPath, input, ctx) {
  const key = pathToProcKey(procPath)
  const { prisma, jwtSecret } = ctx

  if (key === 'userDetails' || key === 'userdetails') {
    if (!ctx.userId) {
      return okJson({ userId: '', id: '', account: '', nickname: '', avatar: '', firstRechargeTime: 0 })
    }
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } })
    if (!user) return errJson('Usuário não encontrado', 'NOT_FOUND')
    const firstDep = await prisma.deposit.findFirst({
      where: { userId: user.id, status: 'concluido' },
      orderBy: { createdAt: 'asc' }
    })
    return okJson({
      userId: user.id,
      id: user.id,
      account: user.account,
      nickname: user.account,
      avatar: '',
      firstRechargeTime: firstDep ? Math.floor(firstDep.createdAt.getTime() / 1000) : 0
    })
  }

  if (key === 'userAssets' || key === 'userassets') {
    if (!ctx.userId) {
      return okJson({ commission: 0, gold: 0, balance: 0, lockedGold: 0, withdrawAmount: 0 })
    }
    const af = await prisma.afiliadoData.findUnique({ where: { userId: ctx.userId } })
    if (!af) return errJson('Dados não encontrados', 'NOT_FOUND')
    return okJson({
      commission: af.comissaoPendente ?? 0,
      gold: af.balance ?? 0,
      balance: af.balance ?? 0,
      lockedGold: 0,
      withdrawAmount: af.valorSaque ?? 0
    })
  }

  if (key === 'authToken' || key === 'authtoken') {
    const bearer = getBearer(ctx.req)
    if (bearer && bearer !== DEMO_TOKEN) {
      try {
        jwt.verify(bearer, jwtSecret)
        return okJson({ token: bearer })
      } catch {
        return errJson('Sessão inválida', 'UNAUTHORIZED')
      }
    }
    return okJson({ token: DEMO_TOKEN })
  }

  if (key === 'authLogout' || key === 'authlogout') return okJson({ ok: true })

  // ── iGameWin catalog procedures ───────────────────────────────
  const u = key.toLowerCase()
  const isGameProc =
    u === 'homelist' ||
    u === 'homehot' ||
    u === 'homepopulargames' ||
    u.includes('gamelist') ||
    u.includes('gametype')

  if (isGameProc) {
    try {
      const catalog = await ctx.req?.app?.locals?.getIgamewinCatalog?.()
      if (catalog?.providers?.length) {
        // Mapeia jogos de cada provedor com todos os campos que o site espera
        const mapGames = (code, games, providerIndex) => games.map((g, gi) => {
          const gameCode = g.game_code || g.code || g.id || ''
          const gameName = g.game_name || g.name || g.title || ''
          const img = g.banner || g.cover || g.picture || g.icon || ''
          return {
            // Campos que o site_baixado usa para renderizar e lançar jogos
            id: gameCode,
            gameId: gameCode,
            code: gameCode,
            game_code: gameCode,
            gameName,
            game_name: gameName,
            name: gameName,
            imageUrl: img,
            banner: img,
            logo: img,
            platformId: providerIndex + 1,  // id numérico do provedor
            providerCode: code,
            isHot: !!(g.isHot || g.hot),
            isNew: !!(g.isNew || g.new_game),
            sort: g.sort || gi,
            status: 1
          }
        })

        // O site lê: homeList.gameTypeList[n].platformList para exibir os jogos
        const gameTypeList = catalog.providers.map((p, i) => {
          const games = mapGames(p.code, catalog.gamesByProvider[p.code] || [], i)
          return {
            id: i + 1,
            platformId: i + 1,
            code: p.code,
            name: p.name || p.code,
            icon: p.icon || p.logo || '',
            sort: i + 1,
            platformList: games,
            games,
            items: games
          }
        })

        const allGames = gameTypeList.flatMap(p => p.games)

        if (u === 'homelist' || u === 'gametype') {
          return okJson({ list: gameTypeList, total: allGames.length, gameTypeList })
        }
        // game.list — retorna gameList (campo esperado pelo site)
        if (u.includes('gamelist')) {
          const inp = input || {}
          const gameType = inp.gameType || inp.platformCode || inp.providerCode || null
          const platId = inp.platformId ? Number(inp.platformId) : null
          let filtered = allGames
          if (gameType) {
            filtered = allGames.filter(g => g.providerCode === gameType || g.code === gameType)
          } else if (platId) {
            filtered = allGames.filter(g => g.platformId === platId)
          }
          return okJson({ gameList: filtered, list: filtered, total: filtered.length })
        }
        if (u === 'homehot') {
          const hotGames = allGames.filter((g) => g.isHot).length > 0
            ? allGames.filter((g) => g.isHot)
            : allGames.slice(0, 20)
          return okJson({ list: [{ games: hotGames, items: hotGames, platformList: hotGames }], total: hotGames.length, hotList: hotGames, gameList: hotGames })
        }
        if (u === 'homepopulargames') {
          const popular = allGames.slice(0, 40)
          return okJson({ list: [{ games: popular, items: popular, platformList: popular }], games: popular, total: popular.length, gameList: popular })
        }
        return okJson({ list: gameTypeList, total: allGames.length, gameTypeList })
      }
    } catch (e) {
      console.error('[trpc-bridge] catalog error', e.message)
    }
    // fallback if catalog unavailable
    const fb2 = fallbackForProc(key)
    return okJson(fb2)
  }

  const fb = fallbackForProc(key)
  return okJson(fb)
}

/**
 * Express: POST /api/frontend/trpc/proc1,proc2,proc3 com body batch tRPC.
 */
export async function handleTrpcBatch(req, res, procedureTail) {
  const jwtSecret = req.app?.locals?.JWT_SECRET || process.env.JWT_SECRET
  if (!jwtSecret) {
    return res.status(500).json([errJson('JWT_SECRET não configurado')])
  }

  const bearer = getBearer(req)
  let userId = null
  if (bearer && bearer !== DEMO_TOKEN) {
    try {
      const p = jwt.verify(bearer, jwtSecret)
      userId = p.userId || p.sub || null
    } catch {
      userId = null
    }
  }

  const prisma = req.app?.locals?.prisma
  if (!prisma) {
    return res.status(500).json([errJson('Prisma não disponível')])
  }

  const ctx = { prisma, jwtSecret, userId, req }
  const paths = String(procedureTail || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (!paths.length) {
    return res.status(400).json([errJson('Nenhum procedimento')])
  }

  // Para GET: input vem de req.query.input (JSON batch) ou req.query[n]
  let getInputs = null
  if (req.method === 'GET' && req.query?.input) {
    try { getInputs = JSON.parse(req.query.input) } catch { getInputs = null }
  }

  const out = []
  for (let i = 0; i < paths.length; i++) {
    let input
    if (req.method === 'GET') {
      if (getInputs !== null && typeof getInputs === 'object') {
        const row = getInputs[String(i)] ?? getInputs[i]
        input = row && typeof row === 'object' && 'json' in row ? row.json : row
      } else {
        input = null
      }
    } else {
      input = parseBatchInputs(req.body, i)
    }
    try {
      out.push(await resolveOne(paths[i], input, ctx))
    } catch (e) {
      console.error('[trpc-bridge]', paths[i], e)
      out.push(errJson(e.message || 'Erro'))
    }
  }

  res.setHeader('Content-Type', 'application/json')
  return res.status(200).json(out.length === 1 ? out[0] : out)
}

export function trpcBatchMiddleware(prisma, jwtSecret) {
  return async (req, res, next) => {
    // Suporta GET (queries tRPC) e POST (mutations tRPC)
    if (req.method !== 'POST' && req.method !== 'GET') return next()
    const pathOnly = req.originalUrl.split('?')[0]
    const prefix = '/api/frontend/trpc/'
    if (!pathOnly.startsWith(prefix)) return next()
    const tail = pathOnly.slice(prefix.length)
    if (
      !tail ||
      tail === 'user.login' ||
      tail === 'user.register' ||
      tail === 'auth.login' ||
      tail === 'auth.registe'
    ) {
      return next()
    }
    req.app.locals = req.app.locals || {}
    req.app.locals.prisma = prisma
    req.app.locals.JWT_SECRET = jwtSecret
    return handleTrpcBatch(req, res, tail)
  }
}
