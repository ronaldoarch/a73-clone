// Stub - funções utilitárias
function s(url, data, opts) {
  return fetch(url, { method: 'POST', body: JSON.stringify(data || {}), ...opts }).catch(() => {});
}
