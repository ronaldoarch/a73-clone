import { defineStore } from 'pinia'

export const useStatusStore = defineStore('status', {
  state: () => ({
    homeInstallModalVisible: false,
    announcementInvisible: false,
    drawerLeftIsOpen: false,
    assetsOrderModalVisible: false,
    viewReload: false,
    redirectRoute: '',
    isRegisterPage: false,
    adReported: false,
    isMainTreeLoading: false
  }),
  actions: {
    setHomeInstallModalVisible(val) {
      this.homeInstallModalVisible = val
    },
    setDrawerLeftIsOpen(val) {
      this.drawerLeftIsOpen = val
    },
    setAnnouncementInvisible(val) {
      this.announcementInvisible = val
    },
    setViewReload(val = true) {
      this.viewReload = val
    },
    setRedirectRoute(route) {
      this.redirectRoute = route
    },
    async getAdReported() {
      try {
        this.adReported = JSON.parse(localStorage.getItem('adReported') || 'false')
      } catch { this.adReported = false }
      return this.adReported
    },
    async setAdReported(val) {
      this.adReported = val
      localStorage.setItem('adReported', JSON.stringify(val))
    }
  }
})
