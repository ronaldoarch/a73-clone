/**
 * Roleta (mina misteriosa) — REST do backend Express.
 */

export async function fetchRoletaConfig() {
  const r = await fetch('/api/roleta/config')
  if (!r.ok) throw new Error('Falha ao carregar config da roleta')
  return r.json()
}

/** Feed público de ganhos recentes (atualização em tempo real no cliente via polling). */
export async function fetchRoletaRecentWins(limit = 20) {
  const r = await fetch(`/api/roleta/recent-wins?limit=${encodeURIComponent(limit)}`, {
    cache: 'no-store'
  })
  if (!r.ok) {
    const data = await r.json().catch(() => ({}))
    return { wins: Array.isArray(data.wins) ? data.wins : [], error: data.error }
  }
  return r.json()
}

export async function fetchRoletaMyReferrals(token, limit = 50) {
  if (!token) return { referrals: [], total: 0 }
  const r = await fetch(`/api/roleta/my-referrals?limit=${encodeURIComponent(limit)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  if (r.status === 401) return { referrals: [], total: 0 }
  if (!r.ok) {
    const data = await r.json().catch(() => ({}))
    return { referrals: [], total: 0, error: data.error }
  }
  return r.json()
}

export async function fetchRoletaState(token) {
  if (!token) return null
  const r = await fetch('/api/roleta', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (r.status === 401) return null
  if (!r.ok) {
    const t = await r.text()
    throw new Error(t || 'Falha ao carregar roleta')
  }
  return r.json()
}

export async function fetchRoletaNovosStatus(token) {
  if (!token) return { eligible: false, alreadyUsed: true }
  const r = await fetch('/api/roleta-novos/status', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (r.status === 401) return { eligible: false, alreadyUsed: true }
  if (!r.ok) return { eligible: false, alreadyUsed: true }
  return r.json()
}

async function parseSpinResponse(r) {
  let data = {}
  try {
    data = await r.json()
  } catch { /* ignore */ }
  if (r.status === 401) {
    return { ok: false, error: 'Sessão expirada. Entre novamente.' }
  }
  if (!r.ok) {
    return {
      ok: false,
      error: data.error || data.message || `Erro ${r.status}`
    }
  }
  return data
}

export async function postRoletaSpin(token) {
  const r = await fetch('/api/roleta/spin', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  })
  return parseSpinResponse(r)
}

export async function postRoletaNovosSpin(token) {
  const r = await fetch('/api/roleta-novos/spin', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  })
  return parseSpinResponse(r)
}
