import { UAParser } from 'ua-parser-js'
import { DeviceType, BrowserType, PlatformType, OSType } from './constants'

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const platform = typeof navigator !== 'undefined' ? navigator.platform : ''

const parser = new UAParser(ua)
export const parsedUA = {
  browser: parser.getBrowser(),
  os: parser.getOS(),
  device: parser.getDevice(),
  engine: parser.getEngine(),
  cpu: parser.getCPU()
}

function detectOS() {
  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return OSType.IOS
  }
  if (/Android/i.test(ua)) return OSType.ANDROID
  return OSType.WEB
}

function detectDeviceType() {
  const os = detectOS()
  if (os === OSType.IOS) return DeviceType.IOS
  if (os === OSType.ANDROID) return DeviceType.Android
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return DeviceType.Android
  return DeviceType.PC
}

function detectBrowser() {
  if (/FBAV|FBAN/.test(ua)) return BrowserType.FACEBOOK
  if (/SamsungBrowser/.test(ua)) return BrowserType.SAMSUNG_INTERNET
  if (/EdgA?\//.test(ua)) return BrowserType.EDGE
  if (/; wv\)/.test(ua) || /WebView/.test(ua)) return BrowserType.CHROME_WEBVIEW
  if (/CriOS|Chrome/.test(ua) && !/EdgA?\//.test(ua)) return BrowserType.CHROME
  if (/Safari/.test(ua) && /Mobile/.test(ua) && !/Chrome/.test(ua)) return BrowserType.MOBILE_SAFARI
  if (/AppleWebKit/.test(ua)) return BrowserType.WEBKIT
  return BrowserType.CHROME
}

function detectPlatformType() {
  if (window.matchMedia?.('(display-mode: standalone)')?.matches ||
      navigator.standalone === true) {
    return PlatformType.PWA
  }

  const os = detectOS()
  if (os === OSType.IOS) {
    if (/; wv\)/.test(ua) || /WebView/.test(ua)) return PlatformType.IOS_APP
    return PlatformType.IOS_H5
  }
  if (os === OSType.ANDROID) {
    if (/; wv\)/.test(ua) || /WebView/.test(ua)) return PlatformType.APK
    return PlatformType.ANDROID_H5
  }
  return PlatformType.DESKTOP_OS
}

function isMobile() {
  return detectDeviceType() !== DeviceType.PC
}

function isIOS() {
  return detectOS() === OSType.IOS
}

function isAndroid() {
  return detectOS() === OSType.ANDROID
}

function isPWA() {
  return detectPlatformType() === PlatformType.PWA
}

function isWebView() {
  const pt = detectPlatformType()
  return pt === PlatformType.APK || pt === PlatformType.IOS_APP
}

function supportsNotifications() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

function supportsInstallPrompt() {
  return !!window.deferredPrompt
}

function getScreenInfo() {
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: window.screen.orientation?.type || 'unknown'
  }
}

function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!conn) return { type: 'unknown', effectiveType: 'unknown', downlink: 0 }
  return {
    type: conn.type || 'unknown',
    effectiveType: conn.effectiveType || 'unknown',
    downlink: conn.downlink || 0,
    saveData: conn.saveData || false
  }
}

export const platformInfo = {
  os: detectOS(),
  deviceType: detectDeviceType(),
  browser: detectBrowser(),
  platformType: detectPlatformType(),
  isMobile: isMobile(),
  isIOS: isIOS(),
  isAndroid: isAndroid(),
  isPWA: isPWA(),
  isWebView: isWebView(),
  userAgent: ua,
  language: navigator.language || 'pt-BR',
  supportsNotifications: supportsNotifications(),
  screen: getScreenInfo(),
  connection: getConnectionInfo()
}

export {
  detectOS,
  detectDeviceType,
  detectBrowser,
  detectPlatformType,
  isMobile,
  isIOS,
  isAndroid,
  isPWA,
  isWebView,
  supportsNotifications,
  supportsInstallPrompt,
  getScreenInfo,
  getConnectionInfo
}

export function getDeviceHeaders() {
  return {
    'X-Device-Type': platformInfo.platformType,
    'X-Device-OS': platformInfo.os,
    'X-Device-Browser': platformInfo.browser,
    'X-Device-Mobile': platformInfo.isMobile ? '1' : '0',
    'X-Screen-Width': String(platformInfo.screen.width),
    'X-Screen-Height': String(platformInfo.screen.height),
    'X-Browser-Name': parsedUA.browser.name || '',
    'X-Browser-Version': parsedUA.browser.version || '',
    'X-OS-Name': parsedUA.os.name || '',
    'X-OS-Version': parsedUA.os.version || '',
    'X-Device-Model': parsedUA.device.model || '',
    'X-Device-Vendor': parsedUA.device.vendor || ''
  }
}
