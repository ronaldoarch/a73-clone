/**
 * API de afiliado, bônus, depósito - integração com backend
 */

function getToken() {
  return localStorage.getItem('token')
}

function getAuthHeaders() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function trpcPost(path, data) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ json: data })
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'Erro')
  return json.result?.data?.json
}

async function trpcGet(path) {
  const res = await fetch(path, { headers: getAuthHeaders() })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'Erro')
  return json.result?.data?.json
}

export const afiliadoApi = {
  async getData() {
    return trpcGet('/api/afiliado')
  },

  async deposito(valor) {
    return trpcPost('/api/deposito', { valor })
  },

  async reclamarPromo(pessoas) {
    return trpcPost('/api/afiliado/reclamar-promo', { pessoas })
  },

  async receberComissao(valor) {
    return trpcPost('/api/afiliado/receber-comissao', { valor })
  },

  async reclamarMisterioso() {
    return trpcPost('/api/afiliado/reclamar-misterioso', {})
  },

  async coletarVip() {
    return trpcPost('/api/afiliado/coletar-vip', {})
  },

  async getPid() {
    const r = await trpcGet('/api/afiliado/pid')
    return r?.pid
  }
}
