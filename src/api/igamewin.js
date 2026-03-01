/**
 * iGameWin API - Transfer API
 * Endpoint: https://igamewin.com/api/v1
 * Em dev usa proxy /igamewin-api para evitar CORS
 * Modo sandbox: usa mock quando API real falha
 */
const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/igamewin-api'
  : 'https://igamewin.com/api/v1'
const STORAGE_KEY = 'a73_igamewin_config'

const defaultConfig = () => ({
  agent_code: 'Midaslabs',
  agent_token: '092b6406e28211f0b8f1bc2411881493',
  agent_balance: 0,
  agent_rtp: 70,
  sandbox: true,
})

function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultConfig(), ...JSON.parse(raw) } : defaultConfig()
  } catch (e) {
    return defaultConfig()
  }
}

function saveConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
}

async function callApi(method, params = {}) {
  const cfg = getConfig()
  const body = {
    method,
    agent_code: cfg.agent_code,
    agent_token: cfg.agent_token,
    ...params,
  }

  if (cfg.sandbox) {
    return mockResponse(method, body, cfg)
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return data
  } catch (e) {
    return mockResponse(method, body, cfg)
  }
}

function mockResponse(method, body, cfg) {
  const balance = cfg.agent_balance ?? 0
  const rtp = cfg.agent_rtp ?? 70

  switch (method) {
    case 'money_info':
      return {
        status: 1,
        msg: 'SUCCESS',
        agent: { agent_code: body.agent_code, balance },
        ...(body.user_code && { user: { user_code: body.user_code, balance: 0 } }),
      }
    case 'user_create':
      return { status: 1, msg: 'SUCCESS', user_code: body.user_code, user_balance: 0 }
    case 'user_deposit':
      return {
        status: 1,
        msg: 'SUCCESS',
        agent_balance: balance - (body.amount || 0),
        user_balance: body.amount || 0,
      }
    case 'user_withdraw':
      return {
        status: 1,
        msg: 'SUCCESS',
        agent_balance: balance + (body.amount || 0),
        user_balance: 0,
      }
    case 'provider_list':
      return {
        status: 1,
        msg: 'SUCCESS',
        providers: [
          { code: 'PRAGMATIC', name: 'Pragmatic Play', status: 1 },
          { code: 'PGSOFT', name: 'PG Soft', status: 1 },
          { code: 'EVOLUTION', name: 'Evolution', status: 1 },
          { code: 'CQ9', name: 'CQ9', status: 1 },
          { code: 'HABANERO', name: 'Habanero', status: 1 },
        ],
      }
    case 'game_list':
      return {
        status: 1,
        msg: 'SUCCESS',
        games: [
          { game_code: 'vs20doghouse', game_name: 'The Dog House', banner: '', status: 1 },
          { game_code: 'vs243mwarrior', game_name: 'Monkey Warrior', banner: '', status: 1 },
        ],
      }
    case 'game_launch':
      return {
        status: 1,
        msg: 'SUCCESS',
        launch_url: 'https://igamewin.com/demo',
      }
    case 'control_rtp':
      return { status: 1, changed_rtp: body.rtp ?? rtp }
    default:
      return { status: 1, msg: 'SUCCESS' }
  }
}

export const igamewinApi = {
  getConfig,
  saveConfig,

  async moneyInfo(userCode = null, allUsers = false) {
    const params = {}
    if (userCode) params.user_code = userCode
    if (allUsers) params.all_users = true
    const data = await callApi('money_info', params)
    if (data.status === 1 && data.agent) {
      const cfg = getConfig()
      cfg.agent_balance = data.agent.balance
      saveConfig(cfg)
    }
    return data
  },

  async userCreate(userCode, isDemo = false) {
    return callApi('user_create', { user_code: userCode, is_demo: isDemo })
  },

  async userDeposit(userCode, amount) {
    const data = await callApi('user_deposit', { user_code: userCode, amount })
    if (data.status === 1 && data.agent_balance != null) {
      const cfg = getConfig()
      cfg.agent_balance = data.agent_balance
      saveConfig(cfg)
    }
    return data
  },

  async userWithdraw(userCode, amount) {
    const data = await callApi('user_withdraw', { user_code: userCode, amount })
    if (data.status === 1 && data.agent_balance != null) {
      const cfg = getConfig()
      cfg.agent_balance = data.agent_balance
      saveConfig(cfg)
    }
    return data
  },

  async userWithdrawReset(userCode = null, allUsers = false) {
    const params = allUsers ? { all_users: true } : { user_code: userCode }
    return callApi('user_withdraw_reset', params)
  },

  async setDemo(userCode) {
    return callApi('set_demo', { user_code: userCode })
  },

  async gameLaunch(userCode, providerCode, gameCode, lang = 'en') {
    return callApi('game_launch', {
      user_code: userCode,
      provider_code: providerCode,
      game_code: gameCode || '',
      lang,
    })
  },

  async providerList() {
    return callApi('provider_list')
  },

  async gameList(providerCode) {
    return callApi('game_list', { provider_code: providerCode })
  },

  async controlRtp(rtp, userCode = null) {
    const params = { rtp }
    if (userCode) params.user_code = userCode
    const data = await callApi('control_rtp', params)
    if (data.status === 1) {
      const cfg = getConfig()
      cfg.agent_rtp = data.changed_rtp ?? rtp
      saveConfig(cfg)
    }
    return data
  },

  /** Add Balance (sandbox) - adiciona saldo ao agent localmente */
  addBalance(amount) {
    const cfg = getConfig()
    cfg.agent_balance = (cfg.agent_balance || 0) + amount
    saveConfig(cfg)
    return cfg.agent_balance
  },
}
