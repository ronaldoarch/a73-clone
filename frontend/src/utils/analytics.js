/**
 * Complete analytics event tracking system.
 * Maps application events to tracking platform events (Facebook, TikTok, Kwai, GTM, etc.)
 */

const EVENT_MAP = {
  register: {
    name: 'Registration',
    fbq: { event: 'CompleteRegistration', dataMapping: {}, needServer: false },
    ttq: { event: 'CompleteRegistration', dataMapping: {}, needServer: true },
    kwai: { event: 'completeRegistration', dataMapping: {}, needServer: false },
    gtm: { event: 'completeRegistration', dataMapping: {}, needServer: false },
    android: { event: 'register', dataMapping: {}, needServer: false },
    mgSky: { event: 'EVENT_COMPLETE_REGISTRATION', dataMapping: {}, needServer: false },
    okspin: { event: 'EVENT_COMPLETE_REGISTRATION', dataMapping: {}, needServer: false },
    bigo: { event: 'ec_register', dataMapping: {}, needServer: true },
    opera: { event: 'registration', dataMapping: {}, needServer: true },
    mego: { event: 'register', dataMapping: {}, needServer: false }
  },
  registerClick: {
    name: 'Register Click',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    gtm: { event: 'registerClick', dataMapping: {}, needServer: false },
    android: { event: 'registerClick', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  login: {
    name: 'Login',
    fbq: { event: 'SubmitApplication', dataMapping: {}, needServer: false },
    ttq: { event: 'SubmitForm', dataMapping: {}, needServer: true },
    kwai: { event: 'contentView', dataMapping: {}, needServer: false },
    gtm: { event: 'login', dataMapping: {}, needServer: false },
    android: { event: 'login', dataMapping: {}, needServer: false },
    mgSky: { event: 'EVENT_FORM_SUBMIT', dataMapping: {}, needServer: false },
    okspin: { event: 'EVENT_FORM_SUBMIT', dataMapping: {}, needServer: false },
    bigo: { event: 'form', dataMapping: {}, needServer: true },
    opera: { event: 'login', dataMapping: {}, needServer: true },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  logout: {
    name: 'Logout',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    gtm: { event: 'logout', dataMapping: {}, needServer: false },
    android: { event: 'logout', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  playGame: {
    name: 'Play Game',
    fbq: { event: 'StartTrial', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    gtm: { event: 'enterGame', dataMapping: {}, needServer: false },
    android: { event: 'enterGame', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  addToCart: {
    name: 'Add To Cart (Deposit Start)',
    fbq: { event: 'AddToCart', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    ttq: { event: 'AddToCart', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    kwai: { event: 'addToCart', dataMapping: {}, needServer: false },
    gtm: { event: 'addToCart', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: 'EVENT_ADD_TO_CART', dataMapping: {}, needServer: false },
    okspin: { event: 'EVENT_ADD_TO_CART', dataMapping: {}, needServer: false },
    bigo: { event: 'ec_add_cart', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    opera: { event: 'add_to_cart', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  initiateCheckout: {
    name: 'Initiate Checkout (Payment Order)',
    fbq: { event: 'InitiateCheckout', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    ttq: { event: 'InitiateCheckout', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: 'rechargeClick', dataMapping: { currency: 'currency', amount: 'amount' }, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  firstpay: {
    name: 'First Deposit',
    fbq: { event: 'Purchase', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    ttq: { event: 'Subscribe', dataMapping: { currency: 'currency', amount: 'value' }, needServer: true },
    kwai: { event: 'firstDeposit', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    gtm: { event: 'firstDeposit', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    android: { event: 'firstrecharge', dataMapping: { currency: 'currency', amount: 'amount' }, needServer: false },
    mgSky: { event: 'EVENT_FIRST_DEPOSIT', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    okspin: { event: 'EVENT_FIRST_DEPOSIT', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    bigo: { event: 'ec_purchase', dataMapping: { currency: 'currency', amount: 'value' }, needServer: true },
    opera: { event: 'first_deposit', dataMapping: { amount: 'payout' }, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  pay: {
    name: 'Deposit',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: 'CompletePayment', dataMapping: { currency: 'currency', amount: 'value' }, needServer: true },
    kwai: { event: 'purchase', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    gtm: { event: 'purchase', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    android: { event: 'recharge', dataMapping: { currency: 'currency', amount: 'amount' }, needServer: false },
    mgSky: { event: 'EVENT_PURCHASE', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    okspin: { event: 'EVENT_PURCHASE', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: 'purchase', dataMapping: { amount: 'payout' }, needServer: true },
    mego: { event: 'purchase', dataMapping: {}, needServer: false }
  },
  download: {
    name: 'Download',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: 'Download', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: 'app_download', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  installPWA: {
    name: 'Install PWA',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: 'EVENT_PWA_OPEN', dataMapping: {}, needServer: false },
    okspin: { event: 'EVENT_PWA_OPEN', dataMapping: {}, needServer: false },
    bigo: { event: 'app_download', dataMapping: {}, needServer: false },
    opera: { event: 'pwa_open', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  purchase1Day: {
    name: 'Day 1 Repeat Deposit',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    kwaiMoreDay: { event: 'purchase1Day', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  purchase2Day: {
    name: 'Day 2 Repeat Deposit',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    kwaiMoreDay: { event: 'purchase2Day', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  purchase3Day: {
    name: 'Day 3 Repeat Deposit',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    kwaiMoreDay: { event: 'purchase3Day', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  },
  purchase7Day: {
    name: 'Day 7 Repeat Deposit',
    fbq: { event: '', dataMapping: {}, needServer: false },
    ttq: { event: '', dataMapping: {}, needServer: false },
    kwai: { event: '', dataMapping: {}, needServer: false },
    kwaiMoreDay: { event: 'purchase7Day', dataMapping: { currency: 'currency', amount: 'value' }, needServer: false },
    gtm: { event: '', dataMapping: {}, needServer: false },
    android: { event: '', dataMapping: {}, needServer: false },
    mgSky: { event: '', dataMapping: {}, needServer: false },
    okspin: { event: '', dataMapping: {}, needServer: false },
    bigo: { event: '', dataMapping: {}, needServer: false },
    opera: { event: '', dataMapping: {}, needServer: false },
    mego: { event: '', dataMapping: {}, needServer: false }
  }
}

const PLATFORMS = ['fbq', 'ttq', 'kwai', 'kwaiMoreDay', 'gtm', 'android', 'mgSky', 'okspin', 'bigo', 'opera', 'mego']

function mapEventData(mapping, data) {
  if (!mapping || !data) return {}
  const result = {}
  for (const [sourceKey, targetKey] of Object.entries(mapping)) {
    if (data[sourceKey] !== undefined) {
      result[targetKey] = data[sourceKey]
    }
  }
  return result
}

function fireFBQ(eventName, data) {
  if (!window.fbq || !eventName) return
  try {
    window.fbq('track', eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireTTQ(eventName, data) {
  if (!window.ttq || !eventName) return
  try {
    window.ttq.track(eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireKwai(eventName, data) {
  if (!window.kwaiq || !eventName) return
  try {
    window.kwaiq.track(eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireGTM(eventName, data) {
  if (!window.dataLayer || !eventName) return
  try {
    window.dataLayer.push({ event: eventName, ...data })
  } catch (e) { /* ignore */ }
}

function fireBigo(eventName, data) {
  if (!window.bge || !eventName) return
  try {
    window.bge('event', eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireOpera(eventName, data) {
  if (!window.otag || !eventName) return
  try {
    window.otag('event', eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireMgSky(eventName, data) {
  if (!window.mg_sky || !eventName) return
  try {
    window.mg_sky('event', eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireOkSpin(eventName, data) {
  if (!window.ok_spin || !eventName) return
  try {
    window.ok_spin('event', eventName, data || {})
  } catch (e) { /* ignore */ }
}

function fireMego(eventName, data) {
  if (!window.xnq || !eventName) return
  try {
    window.xnq('event', eventName, data || {})
  } catch (e) { /* ignore */ }
}

const platformDispatchers = {
  fbq: fireFBQ,
  ttq: fireTTQ,
  kwai: fireKwai,
  kwaiMoreDay: fireKwai,
  gtm: fireGTM,
  bigo: fireBigo,
  opera: fireOpera,
  mgSky: fireMgSky,
  okspin: fireOkSpin,
  mego: fireMego,
  android: (eventName, data) => {
    if (window.AndroidBridge?.trackEvent) {
      try { window.AndroidBridge.trackEvent(eventName, JSON.stringify(data || {})) } catch { /* */ }
    }
  }
}

/**
 * Track an analytics event across all configured platforms.
 * @param {string} eventName - One of the EVENT_MAP keys
 * @param {object} [data] - Event data (currency, amount, etc.)
 */
export function trackEvent(eventName, data = {}) {
  const eventConfig = EVENT_MAP[eventName]
  if (!eventConfig) {
    console.warn(`[analytics] Unknown event: ${eventName}`)
    return
  }

  for (const platform of PLATFORMS) {
    const config = eventConfig[platform]
    if (!config || !config.event) continue

    const mappedData = mapEventData(config.dataMapping, data)
    const dispatcher = platformDispatchers[platform]
    if (dispatcher) {
      dispatcher(config.event, mappedData)
    }
  }
}

/**
 * Track a custom event to a specific platform.
 */
export function trackCustomEvent(platform, eventName, data = {}) {
  const dispatcher = platformDispatchers[platform]
  if (dispatcher) {
    dispatcher(eventName, data)
  }
}

export function getEventNames() {
  return Object.keys(EVENT_MAP)
}

export { EVENT_MAP, PLATFORMS }
