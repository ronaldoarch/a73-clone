let loadingStack = []
let isLoading = false

function createSpinnerElement(message) {
  const overlay = document.createElement('div')
  overlay.className = 'global-loading-overlay'
  overlay.setAttribute('data-main-tree-loading', '')
  overlay.innerHTML = `
    <div class="global-loading-content">
      <div class="global-loading-spinner">
        <svg viewBox="0 0 42 42" class="spinner-svg">
          <circle cx="21" cy="21" r="18" fill="none" stroke="currentColor"
            stroke-width="3" stroke-dasharray="90,150" stroke-dashoffset="0"
            stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate"
              dur="1s" repeatCount="indefinite" from="0 21 21" to="360 21 21"/>
          </circle>
        </svg>
      </div>
      ${message ? `<div class="global-loading-message">${message}</div>` : ''}
    </div>
  `
  return overlay
}

function injectStyles() {
  if (document.getElementById('global-loading-styles')) return
  const style = document.createElement('style')
  style.id = 'global-loading-styles'
  style.textContent = `
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      backdrop-filter: blur(2px);
    }
    .global-loading-content {
      background: var(--ep-color-background-fill-secondary, rgba(30, 20, 50, 0.95));
      border-radius: 16px;
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .global-loading-spinner {
      width: 42px;
      height: 42px;
      color: var(--ep-color-background-fill-active-primary, #F5C84C);
    }
    .spinner-svg {
      width: 100%;
      height: 100%;
    }
    .global-loading-message {
      color: var(--ep-color-text-default, #E8DFF5);
      font-size: 14px;
      max-width: 200px;
      text-align: center;
      word-break: break-word;
    }
  `
  document.head.appendChild(style)
}

/**
 * Show a global loading spinner.
 * @param {string} [message] - Optional loading message
 * @param {number} [timeout=10000] - Auto-dismiss timeout in ms
 */
export async function showLoading(message, timeout = 10000) {
  const existingSpinner = document.querySelector('[data-main-tree-loading]')
  if (isLoading || existingSpinner) return

  isLoading = true
  injectStyles()

  const overlay = createSpinnerElement(message)
  document.body.appendChild(overlay)
  loadingStack.push(overlay)

  if (timeout > 0) {
    setTimeout(() => dismissLoading(), timeout)
  }
}

/**
 * Dismiss all loading spinners.
 */
export async function dismissLoading() {
  if (!isLoading || !loadingStack.length) return

  while (loadingStack.length) {
    const overlay = loadingStack.pop()
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay)
    }
  }
  isLoading = false
}

/**
 * Check if loading is currently active.
 */
export function isLoadingActive() {
  return isLoading
}

/**
 * Show loading during an async operation.
 * @param {Function} asyncFn - Async function to execute
 * @param {string} [message] - Loading message
 */
export async function withLoading(asyncFn, message) {
  try {
    await showLoading(message)
    return await asyncFn()
  } finally {
    await dismissLoading()
  }
}
