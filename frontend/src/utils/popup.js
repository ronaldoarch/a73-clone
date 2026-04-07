/**
 * Global popup/modal queue system.
 * Manages priority-based popup display ensuring only one popup is visible at a time.
 */

import { ref } from 'vue'

export const PopupType = Object.freeze({
  TIPS: 1,
  EXCEPTION: 2,
  FLOW: 3,
  BONUS: 4,
  TRIAL: 5,
  NEW_USER_EXCLUSIVE: 6
})

const queues = new Map([
  [PopupType.EXCEPTION, new Set()],
  [PopupType.TIPS, new Set()],
  [PopupType.FLOW, new Set()],
  [PopupType.BONUS, new Set()],
  [PopupType.TRIAL, new Set()],
  [PopupType.NEW_USER_EXCLUSIVE, new Set()]
])

const shownPopups = new Map([
  [PopupType.EXCEPTION, new Set()],
  [PopupType.TIPS, new Set()],
  [PopupType.FLOW, new Set()],
  [PopupType.BONUS, new Set()],
  [PopupType.TRIAL, new Set()],
  [PopupType.NEW_USER_EXCLUSIVE, new Set()]
])

export const isPopupActive = ref(false)
let activePopupElement = null

function markAsShown(popup) {
  if (popup?.type && popup?.uniqueId) {
    shownPopups.get(popup.type)?.add(popup.uniqueId)
  }
}

function wasShown(popup) {
  if (popup?.type && popup?.uniqueId) {
    return shownPopups.get(popup.type)?.has(popup.uniqueId) || false
  }
  return false
}

function getNextPopup() {
  for (const queue of queues.values()) {
    if (queue.size > 0) {
      return queue.values().next().value
    }
  }
  return null
}

function addToQueue(type, popup) {
  queues.get(type)?.add(popup)
}

function removeFromQueue(type) {
  const queue = queues.get(type)
  const first = queue?.values().next().value
  if (first) queue.delete(first)
}

function clearAllQueues() {
  for (const queue of queues.values()) {
    if (queue.size > 0) queue.clear()
  }
}

function createPopupOverlay(popup) {
  const overlay = document.createElement('div')
  overlay.className = 'global-popup-overlay'
  overlay.id = popup.id || 'popup-' + Date.now()

  const content = document.createElement('div')
  content.className = 'global-popup-content'

  const title = popup.title || ''
  const message = popup.msg || popup.message || ''
  const confirmText = popup.confirmText || 'OK'

  content.innerHTML = `
    <div class="global-popup-inner">
      ${title ? `<h3 class="global-popup-title">${title}</h3>` : ''}
      <div class="global-popup-message">${message}</div>
      <div class="global-popup-actions">
        <button class="global-popup-btn global-popup-btn-confirm">${confirmText}</button>
      </div>
    </div>
  `

  overlay.appendChild(content)
  return overlay
}

function injectPopupStyles() {
  if (document.getElementById('global-popup-styles')) return
  const style = document.createElement('style')
  style.id = 'global-popup-styles'
  style.textContent = `
    .global-popup-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.6); display: flex;
      align-items: center; justify-content: center;
      animation: popup-fade-in 0.2s ease-out;
    }
    .global-popup-content {
      width: 90%; max-width: 360px;
    }
    .global-popup-inner {
      background: linear-gradient(135deg, #2A1A4E, #1F1238);
      border-radius: 16px; padding: 24px; text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .global-popup-title {
      color: #E8DFF5; font-size: 18px; font-weight: 700; margin-bottom: 12px;
    }
    .global-popup-message {
      color: #B8A9D0; font-size: 14px; line-height: 1.6; margin-bottom: 20px;
    }
    .global-popup-actions {
      display: flex; gap: 12px; justify-content: center;
    }
    .global-popup-btn {
      padding: 10px 32px; border-radius: 24px; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none;
    }
    .global-popup-btn-confirm {
      background: linear-gradient(135deg, #7041F3, #9B6BFF);
      color: #FFF; min-width: 120px;
    }
    .global-popup-btn-confirm:active { opacity: 0.85; }
    @keyframes popup-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

async function processQueue() {
  const popup = getNextPopup()
  if (!popup) return

  const { type } = popup

  if (wasShown(popup) || (popup.checkIntercept && popup.checkIntercept())) {
    removeFromQueue(type)
    processQueue()
    return
  }

  isPopupActive.value = true
  injectPopupStyles()

  const overlay = createPopupOverlay(popup)
  document.body.appendChild(overlay)
  activePopupElement = overlay
  markAsShown(popup)

  const confirmBtn = overlay.querySelector('.global-popup-btn-confirm')
  await new Promise(resolve => {
    const dismiss = () => {
      overlay.remove()
      activePopupElement = null
      resolve()
    }
    confirmBtn?.addEventListener('click', dismiss)
    if (popup.backdropDismiss !== false) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) dismiss()
      })
    }
    if (popup.onPresented) popup.onPresented()
  })

  removeFromQueue(type)
  isPopupActive.value = false

  if (popup.onDismissed) popup.onDismissed()
  processQueue()
}

/**
 * Show a popup in the queue system.
 * @param {Object} options - Popup configuration
 * @param {number} options.type - PopupType enum value
 * @param {string} [options.msg] - Message to display
 * @param {string} [options.title] - Title
 * @param {string} [options.uniqueId] - Unique ID for dedup
 * @param {boolean} [options.allowRepeat] - Allow showing again
 */
export function showPopup(options = {}) {
  const config = {
    allowRepeat: false,
    type: PopupType.TIPS,
    msg: '',
    ...options
  }

  if (config.type === PopupType.EXCEPTION) {
    clearAllQueues()
    if (activePopupElement) {
      activePopupElement.remove()
      activePopupElement = null
      isPopupActive.value = false
    }
  }

  addToQueue(config.type, config)

  if (!isPopupActive.value) {
    processQueue()
  }
}

/**
 * Dismiss the currently active popup.
 */
export function dismissPopup() {
  if (activePopupElement) {
    activePopupElement.remove()
    activePopupElement = null
    isPopupActive.value = false
  }
}
