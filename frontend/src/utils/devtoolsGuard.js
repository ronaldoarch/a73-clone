let detectorInstance = null

export function initDevtoolsGuard() {
  if (!import.meta.env.PROD) return

  import('devtools-detector').then(({ addListener, launch }) => {
    detectorInstance = { addListener, launch }

    addListener((isOpen) => {
      if (isOpen) {
        console.warn('[Security] DevTools detected')
        document.body.style.filter = 'blur(10px)'
        document.body.style.pointerEvents = 'none'
      } else {
        document.body.style.filter = ''
        document.body.style.pointerEvents = ''
      }
    })

    launch()
  }).catch(() => {})
}

export function stopDevtoolsGuard() {
  if (detectorInstance?.stop) {
    detectorInstance.stop()
  }
}
