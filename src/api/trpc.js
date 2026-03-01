export const api = {
  async login(data) {
    const res = await fetch('/api/frontend/trpc/user.login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: data })
    })
    const json = await res.json()
    if (json.result?.data?.json) return json.result.data.json
    if (json.error) return { error: json.error.message }
    return json
  },

  async register(data) {
    // Inclui pid do indicador se disponível (link de convite)
    const pid = localStorage.getItem('a73_pid_ref')
    if (pid) data.pid = pid
    const res = await fetch('/api/frontend/trpc/user.register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: data })
    })
    const json = await res.json()
    if (json.result?.data?.json) return json.result.data.json
    if (json.error) return { error: json.error.message }
    return json
  }
}
