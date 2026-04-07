import { ref } from 'vue'

const isGuideVisible = ref(false)
const guideType = ref('ios')

export function showIosPwaGuide() {
  guideType.value = 'ios'
  isGuideVisible.value = true
  injectGuideUI('ios')
}

export function showSafariGuide(url) {
  guideType.value = 'safari'
  isGuideVisible.value = true
  injectGuideUI('safari', url)
}

export function hideGuide() {
  isGuideVisible.value = false
  const el = document.getElementById('pwa-install-guide-overlay')
  if (el) el.remove()
}

function injectGuideUI(type, url = '') {
  const existing = document.getElementById('pwa-install-guide-overlay')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.id = 'pwa-install-guide-overlay'
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(0,0,0,0.7); display: flex;
    align-items: flex-end; justify-content: center;
  `

  if (type === 'ios') {
    overlay.innerHTML = `
      <div style="background:#fff;color:#000;width:100%;max-width:24rem;border-radius:1.25rem 1.25rem 0 0;padding:1.75rem 1.25rem 2rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <p style="font-weight:600;font-size:1.125rem;">Instalar o App</p>
          <span id="pwa-guide-close" style="cursor:pointer;font-size:1.5rem;line-height:1;">✕</span>
        </div>
        <div style="font-size:0.875rem;line-height:1.6;">
          <p><strong>1.</strong> Toque em <span style="font-size:1.25rem;">⬆</span> no menu do navegador</p>
          <p style="margin-top:0.75rem;"><strong>2.</strong> Role para baixo e selecione <span style="background:#f0f0f0;padding:0.125rem 0.375rem;border-radius:0.25rem;">Adicionar à Tela Inicial</span></p>
          <p style="margin-top:0.75rem;"><strong>3.</strong> Toque em <strong>Adicionar</strong> para confirmar</p>
        </div>
      </div>
    `
  } else {
    overlay.innerHTML = `
      <div style="background:#fff;color:#000;width:100%;max-width:24rem;border-radius:1.25rem 1.25rem 0 0;padding:1.75rem 1.25rem 2rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <p style="font-weight:600;font-size:1.125rem;">Abrir no Safari</p>
          <span id="pwa-guide-close" style="cursor:pointer;font-size:1.5rem;line-height:1;">✕</span>
        </div>
        <p style="font-size:0.875rem;margin-bottom:0.75rem;">Copie o link abaixo e abra no Safari para instalar:</p>
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.625rem;background:#f0f0f0;border-radius:0.5rem;">
          <span style="font-size:1.5rem;">🧭</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.8125rem;">${url || location.href}</span>
        </div>
      </div>
    `
  }

  document.body.appendChild(overlay)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'pwa-guide-close') {
      hideGuide()
    }
  })
}

let deferredPrompt = null

export function setupBeforeInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })
}

export async function triggerInstallPrompt() {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome === 'accepted'
}

export function canShowInstallPrompt() {
  return !!deferredPrompt
}

export function isStandalone() {
  return ('standalone' in navigator && navigator.standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
}

export { isGuideVisible, guideType }
