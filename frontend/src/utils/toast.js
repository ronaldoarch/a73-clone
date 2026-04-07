/**
 * Global toast notification system.
 */

let activeToast = null
const TOAST_DURATION = 2000

function createToastElement(message, type = '', position = 'middle') {
  const toast = document.createElement('div')
  toast.className = `global-toast global-toast-${position} ${type ? `global-toast-${type}` : ''}`
  toast.innerHTML = `
    <div class="global-toast-content">
      ${type === 'success' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
      ${type === 'error' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' : ''}
      <span class="global-toast-message">${message}</span>
    </div>
  `
  return toast
}

function injectToastStyles() {
  if (document.getElementById('global-toast-styles')) return
  const style = document.createElement('style')
  style.id = 'global-toast-styles'
  style.textContent = `
    .global-toast {
      position: fixed; left: 50%; transform: translateX(-50%);
      z-index: 100000; pointer-events: none;
      animation: toast-in 0.25s ease-out;
    }
    .global-toast-top { top: 60px; }
    .global-toast-middle { top: 50%; transform: translate(-50%, -50%); }
    .global-toast-bottom { bottom: 80px; }
    .global-toast-content {
      background: rgba(30, 20, 50, 0.95); border-radius: 12px;
      padding: 12px 20px; display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3); backdrop-filter: blur(4px);
      max-width: 80vw;
    }
    .global-toast-message {
      color: #E8DFF5; font-size: 14px; line-height: 1.4;
    }
    .global-toast-success .global-toast-content { border-left: 3px solid #4CAF50; }
    .global-toast-error .global-toast-content { border-left: 3px solid #F44336; }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .global-toast-out {
      animation: toast-out 0.2s ease-in forwards;
    }
    @keyframes toast-out {
      to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
  `
  document.head.appendChild(style)
}

/**
 * Show a toast notification.
 * @param {string} message - Toast message
 * @param {string} [type=''] - 'success' | 'error' | ''
 * @param {string} [position='middle'] - 'top' | 'middle' | 'bottom'
 * @param {number} [duration=2000] - Duration in ms
 */
export async function showToast(message, type = '', position = 'middle', duration = TOAST_DURATION) {
  if (activeToast) {
    activeToast.remove()
    activeToast = null
  }

  injectToastStyles()
  const toast = createToastElement(message, type, position)
  document.body.appendChild(toast)
  activeToast = toast

  setTimeout(() => {
    toast.classList.add('global-toast-out')
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast)
      if (activeToast === toast) activeToast = null
    }, 200)
  }, duration)

  return toast
}

export function toastSuccess(message, position) {
  return showToast(message, 'success', position)
}

export function toastError(message, position) {
  return showToast(message, 'error', position)
}

export function dismissToast() {
  if (activeToast) {
    activeToast.remove()
    activeToast = null
  }
}
