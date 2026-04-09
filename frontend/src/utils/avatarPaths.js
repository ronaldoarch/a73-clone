/**
 * Caminhos públicos em /assets/avatars/{male|female}/.
 * O bundle inclui nomes legados: male/111.jpg (slot 11), female/1010.jpg (slot 10).
 * @param {boolean} isMale
 * @param {number} slotIndex 1–12 (grade do perfil)
 * @returns {string} URL absoluta no site (ex.: /assets/avatars/male/01.jpg)
 */
export function getAvatarImagePath(isMale, slotIndex) {
  const folder = isMale ? 'male' : 'female'
  const i = Math.min(12, Math.max(1, Math.floor(Number(slotIndex) || 1)))
  let file
  if (folder === 'male') {
    file = i === 11 ? '111' : String(i).padStart(2, '0')
  } else {
    file = i === 10 ? '1010' : String(i).padStart(2, '0')
  }
  return `/assets/avatars/${folder}/${file}.jpg`
}

/**
 * @param {string} url
 * @returns {{ gender: 0|1, index: number } | null}
 */
export function parseAvatarSelectionUrl(url) {
  if (!url || typeof url !== 'string') return null
  const m = url.trim().match(/\/assets\/avatars\/(male|female)\/([^/.]+)\.jpg/i)
  if (!m) return null
  const gender = m[1].toLowerCase() === 'male' ? 1 : 0
  const file = m[2]
  let index = 1
  if (file === '111') index = 11
  else if (file === '1010') index = 10
  else {
    const n = parseInt(file, 10)
    if (Number.isFinite(n) && n >= 1) index = Math.min(12, n)
  }
  return { gender, index }
}
