import { Capacitor } from '@capacitor/core'

export function isNativePlatform() {
  return Capacitor.isNativePlatform()
}

export function getPlatform() {
  return Capacitor.getPlatform()
}

export async function getDeviceInfo() {
  try {
    const { Device } = await import('@capacitor/device')
    return await Device.getInfo()
  } catch {
    return {
      platform: 'web',
      model: navigator.userAgent,
      operatingSystem: navigator.platform,
      osVersion: '',
      manufacturer: '',
      isVirtual: false,
      webViewVersion: ''
    }
  }
}

export async function getDeviceId() {
  try {
    const { Device } = await import('@capacitor/device')
    const info = await Device.getId()
    return info.identifier || info.uuid
  } catch {
    let id = localStorage.getItem('x-device-id')
    if (!id) {
      const { v4 } = await import('uuid')
      id = v4()
      localStorage.setItem('x-device-id', id)
    }
    return id
  }
}

export async function getAppState() {
  try {
    const { App } = await import('@capacitor/app')
    return await App.getState()
  } catch {
    return { isActive: document.visibilityState === 'visible' }
  }
}

export async function onAppStateChange(callback) {
  try {
    const { App } = await import('@capacitor/app')
    App.addListener('appStateChange', callback)
  } catch {
    document.addEventListener('visibilitychange', () => {
      callback({ isActive: document.visibilityState === 'visible' })
    })
  }
}

export async function onBackButton(callback) {
  try {
    const { App } = await import('@capacitor/app')
    App.addListener('backButton', callback)
  } catch {}
}
