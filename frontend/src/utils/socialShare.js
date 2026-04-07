/**
 * Social sharing utilities.
 * Generates platform-specific share URLs for various social networks.
 */

/**
 * Detect if the current device is iOS.
 */
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Detect if the current device is Android.
 */
function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

/**
 * Detect if the browser is Chrome.
 */
function isChrome() {
  return /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent)
}

/**
 * Pick URL by platform (iOS / Android / default).
 */
function byPlatform({ iosUrl, androidUrl, defaultUrl }) {
  if (isIOS()) return iosUrl
  if (isAndroid() && !isChrome()) return androidUrl
  return defaultUrl
}

/**
 * Social platform share URL generators.
 */
const ShareHandlers = {
  TikTok({ baseUrl }) {
    return byPlatform({
      iosUrl: `https://www.tiktok.com/?text=${baseUrl}`,
      androidUrl: `intent://www.tiktok.com/?text=${baseUrl}#Intent;package=com.zhiliaoapp.musically;scheme=https;end;`,
      defaultUrl: `https://www.tiktok.com/?text=${baseUrl}`
    })
  },

  WhatsApp({ baseUrl }) {
    const isNative = !!window.jsBridge
    return isNative
      ? `https://api.whatsapp.com/send?text=${baseUrl}`
      : `whatsapp://send?text=${baseUrl}`
  },

  YouTube({ baseUrl }) {
    return byPlatform({
      iosUrl: `youtube:/?text=${baseUrl}`,
      androidUrl: `intent://www.youtube.com/?text=${baseUrl}#Intent;package=com.google.android.youtube;scheme=https;end;`,
      defaultUrl: `https://www.youtube.com/?text=${baseUrl}`
    })
  },

  Kwai({ baseUrl }) {
    return byPlatform({
      iosUrl: `ikwai://home?target_url=${baseUrl}`,
      androidUrl: `ikwai://home?target_url=${baseUrl}`,
      defaultUrl: `https://www.kwai.com/?content=${baseUrl}`
    })
  },

  Twitter({ content, shareUrl }) {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}&url=${encodeURIComponent(shareUrl)}`
  },

  Instagram({ baseUrl }) {
    return byPlatform({
      iosUrl: `instagram:/?quote=${baseUrl}`,
      androidUrl: `intent://instagram.com/#Intent;package=com.instagram.android;scheme=https;end`,
      defaultUrl: `https://www.instagram.com/?quote=${baseUrl}`
    })
  },

  Facebook({ content, shareUrl }) {
    return byPlatform({
      iosUrl: `fb://share/?link=${shareUrl}`,
      androidUrl: `https://m.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(content)}`,
      defaultUrl: `https://m.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(content)}`
    })
  },

  Telegram({ baseUrl }) {
    return `https://t.me/share/url?url=${baseUrl}`
  },

  Email({ baseUrl, recipient = '', subject = '' }) {
    return `mailto:${recipient}?subject=${subject}&body=${baseUrl}`
  }
}

/**
 * Available social platforms.
 */
export const SocialPlatforms = Object.keys(ShareHandlers)

/**
 * Open a share URL for a specific platform.
 * @param {string} platform - One of SocialPlatforms
 * @param {string} url - The URL to share
 * @param {string} [siteName] - Site name for share text
 * @param {string} [customText] - Custom share text (overrides default)
 */
export function shareOnPlatform(platform, url, siteName = '', customText = '') {
  const handler = ShareHandlers[platform]
  if (!handler) {
    console.warn(`[Share] Unknown platform: ${platform}`)
    return
  }

  const text = customText || `${siteName} ${url}`
  const baseUrl = encodeURIComponent(text)

  const shareUrl = handler({
    baseUrl,
    content: text,
    shareUrl: url,
    recipient: '',
    subject: encodeURIComponent(siteName)
  })

  if (shareUrl) {
    openShareUrl(shareUrl, platform)
  }
}

/**
 * Open the share URL, handling native vs web.
 */
function openShareUrl(url, platform) {
  try {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => a.remove(), 100)
  } catch {
    window.open(url, '_blank')
  }
}

/**
 * Generate a WhatsApp direct message link with a phone number.
 */
export function whatsappDirectLink(phone, message) {
  const encoded = encodeURIComponent(message)
  const isNative = !!window.jsBridge
  return isNative
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
    : `whatsapp://send?phone=${phone}&text=${encoded}`
}

/**
 * Generate an SMS link for multiple recipients.
 */
export function smsLink(phones, message) {
  const encoded = encodeURIComponent(message)
  if (isIOS()) {
    return `sms:/open?addresses=${phones.join(',%20')}&body=${encoded}`
  }
  return `sms:${phones.join(',')}?body=${encoded}`
}
