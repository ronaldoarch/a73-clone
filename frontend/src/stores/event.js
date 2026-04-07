import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEventStore = defineStore('event', () => {
  const previousRoute = ref('/')
  const pageScrollTop = ref({})

  function setPreviousRoute(route) {
    previousRoute.value = route
    try { sessionStorage.setItem('previousRoute', route) } catch {}

    const sportPaths = ['/game/category/sport', '/main/inicio']
    if (sportPaths.includes(route)) {
      try { sessionStorage.setItem('sportPreviousRoute', route) } catch {}
    }
  }

  function getPreviousRoute() {
    if (!previousRoute.value || previousRoute.value === '/') {
      previousRoute.value = sessionStorage.getItem('previousRoute') || '/'
    }
    return previousRoute.value
  }

  function setPageScrollTop(path, top) {
    pageScrollTop.value = { ...pageScrollTop.value, [path]: top }
  }

  function getPageScrollTop(path) {
    return pageScrollTop.value[path] || 0
  }

  return {
    previousRoute, pageScrollTop,
    setPreviousRoute, getPreviousRoute,
    setPageScrollTop, getPageScrollTop
  }
})
