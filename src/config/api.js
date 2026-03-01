/**
 * URL base da API.
 * - Runtime: window.__API_BASE__ (definido por api-config.js quando BACKEND_URL está no frontend)
 * - Build: VITE_API_URL (ex: https://api.seudominio.com)
 * - Se vazio, usa mesma origem (proxy /api no nginx)
 */
const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__ !== undefined)
  ? window.__API_BASE__
  : (import.meta.env.VITE_API_URL || '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${String(API_BASE).replace(/\/$/, '')}${p}` : p
}
