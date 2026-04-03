const ANALYTICS_KEYS = [
  'kwaiId', 'fbPixelId', 'ttPixelId', 'ch', 'sdmode', 'bgPixel',
  'gtagId', 'test', 'tt_test_id', 'ttclid', 'afId', 'mgSkyPixelId',
  'okspPixelId', 'device_id', 'adid', 'operaPixelId', 'operaCvid',
  'megoDataSetId', 'megoSignKey', 'pePixelId'
]

function loadScript(src, onError) {
  const s = document.createElement('script')
  s.type = 'text/javascript'
  s.async = true
  s.src = src
  if (onError) s.onerror = onError
  const first = document.getElementsByTagName('script')[0]
  if (first && first.parentNode) {
    first.parentNode.insertBefore(s, first)
  } else {
    document.head.appendChild(s)
  }
}

function loadKwaiAnalytics(key) {
  /* eslint-disable */
  !function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.install=t():e.install=t()}("undefined"!=typeof window?window:self,(function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=72)}({72:function(e,t,n){"use strict";var o=this&&this.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var o,r=0,i=t.length;r<i;r++)!o&&r in t||(o||(o=Array.prototype.slice.call(t,0,r)),o[r]=t[r]);return e.concat(o||Array.prototype.slice.call(t))};Object.defineProperty(t,"__esModule",{value:!0});var r=function(e,t,n){var o,i=e.createElement("script");i.type="text/javascript",i.async=!0,i.src=t,n&&(i.onerror=function(){r(e,n)});var a=e.getElementsByTagName("script")[0];null===(o=a.parentNode)||void 0===o||o.insertBefore(i,a)};!function(e,t,n){e.KwaiAnalyticsObject=n;var i=e[n]=e[n]||[];i.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];var a=function(e,t){e[t]=function(){for(var n=[],r=0;r<arguments.length;r++)n[r]=arguments[r];var i=o([t],n,!0);e.push(i)}};i.methods.forEach((function(e){a(i,e)})),i.instance=function(e){var t,n=(null===(t=i._i)||void 0===t?void 0:t[e])||[];return i.methods.forEach((function(e){a(n,e)})),n},i.load=function(e,o){var a="https://s21-def.ap4r.com/kos/s101/nlav112572/pixel/events.js";i._i=i._i||{},i._i[e]=[],i._i[e]._u=a,i._t=i._t||{},i._t[e]=+new Date,i._o=i._o||{},i._o[e]=o||{};var c="?sdkid=".concat(e,"&lib=").concat(n);r(t,a+c,"https://s21-def.ks-la.net/kos/s101/nlav112572/pixel/events.js"+c)}}(window,document,"kwaiq")}})
  }));
  /* eslint-enable */
  try {
    window.kwaiq.load(key)
    window.kwaiq.page()
  } catch (e) { /* ignore */ }
}

function loadBigoAnalytics(key) {
  window.bgdataLayer = window.bgdataLayer || []
  window.bge = function () { window.bgdataLayer.push(arguments) }
  window.bge('init', key)
  loadScript('https://api.imotech.video/ad/events.js?pixel_id=' + key)
}

function loadTiktokAnalytics(key) {
  /* eslint-disable */
  ;(function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(key);ttq.page()})(window,document,'ttq');
  /* eslint-enable */
}

function loadFacebookAnalytics(key) {
  /* eslint-disable */
  ;(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', key + '')
  window.fbq('track', 'PageView')
}

function loadGoogleAnalytics(key) {
  /* eslint-disable */
  ;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer',key);
  /* eslint-enable */
}

function loadMGSkyAnalytics(key) {
  loadScript(`https://s.mgskyads.com/js/tag.js?aa=${key}`)
}

function loadOKSpinAnalytics(key) {
  loadScript(`https://s.oksp.in/js/tag.js?aa=${key}`)
}

function loadOperaAnalytics(key) {
  /* eslint-disable */
  !(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;n.src=w;g.parentNode.insertBefore(n,g)}})(window,document,"script","//res-odx.op-mobile.opera.com/sp.js","otag");
  /* eslint-enable */
  window.otag('init', key)
}

function loadMegoAnalytics(dataSetId, urlParams) {
  const signKey = urlParams.get('megoSignKey') || window.megoSignKey
  if (!signKey) return

  /* eslint-disable */
  !function(x,u,e,v,n,t,s){if(x.xnq)return;n=x.xnq=function(){return n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};n.queue=[];t=u.createElement(e);t.async=!0;t.src=v;s=u.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://attr.aigp.cc/js/xn-attribution.js');
  /* eslint-enable */
  window.xnq('init', { dataSetId, signKey })
}

export function initAdAnalytics() {
  const urlParams = new URLSearchParams(window.location.search)

  ANALYTICS_KEYS.forEach(key => {
    if (urlParams.has(key)) {
      window[key] = localStorage[key] || urlParams.get(key)
    }
  })

  const loaders = {
    kwaiId: loadKwaiAnalytics,
    fbPixelId: loadFacebookAnalytics,
    ttPixelId: loadTiktokAnalytics,
    bgPixel: loadBigoAnalytics,
    gtagId: loadGoogleAnalytics,
    mgSkyPixelId: loadMGSkyAnalytics,
    okspPixelId: loadOKSpinAnalytics,
    operaPixelId: loadOperaAnalytics,
    megoDataSetId: (v) => loadMegoAnalytics(v, urlParams)
  }

  Object.keys(loaders).forEach(key => {
    const value = urlParams.get(key)
    if (value) {
      try {
        loaders[key](value)
      } catch (e) {
        console.warn(`[adAnalytics] Failed to load ${key}:`, e)
      }
    }
  })
}
