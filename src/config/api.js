/**
 * URL base da API. Em produção, use VITE_API_URL (ex: https://api.seudominio.com).
 * Se vazio, usa a mesma origem (para proxy ou mesmo domínio).
 */
const API_BASE = import.meta.env.VITE_API_URL || ''

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}${p}` : p
}
