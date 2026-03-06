/**
 * Confetti simples - sem dependências externas
 * Uso: import { confetti } from '@/utils/confetti' e chamar confetti()
 */
const colors = ['#fbbf24', '#f97316', '#ef4444', '#22c55e', '#a855f7', '#3b82f6', '#ec4899']
const shapes = ['square', 'circle', 'rect']

export function confetti(options = {}) {
  const { duration = 2500, count = 60, origin = { x: 0.5, y: 0.5 } } = options
  const container = document.createElement('div')
  container.className = 'a73-confetti-container'
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;'
  document.body.appendChild(container)

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const color = colors[Math.floor(Math.random() * colors.length)]
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    const size = 6 + Math.random() * 8
    const left = origin.x * 100 + (Math.random() - 0.5) * 30
    const delay = Math.random() * 300
    const rot = (Math.random() - 0.5) * 720
    const tx = (Math.random() - 0.5) * 400
    const ty = -200 - Math.random() * 300

    el.style.cssText = `
      position:absolute;
      left:${left}%;
      top:50%;
      width:${shape === 'rect' ? size * 2 : size}px;
      height:${size}px;
      background:${color};
      border-radius:${shape === 'circle' ? '50%' : '2px'};
      opacity:0.9;
      transform:rotate(${rot}deg);
      animation:a73-confetti-fall ${duration}ms ease-out ${delay}ms forwards;
      --tx:${tx}px;
      --ty:${ty}px;
    `
    container.appendChild(el)
  }

  setTimeout(() => {
    container.remove()
  }, duration + 500)
}
