import { toastController } from '@ionic/vue'

export function useToast() {
  async function show(message, color = 'primary', duration = 3000) {
    const t = await toastController.create({
      message,
      color,
      duration,
      position: 'bottom',
    })
    await t.present()
  }
  return {
    show,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'danger'),
    warning: (msg) => show(msg, 'warning'),
  }
}
