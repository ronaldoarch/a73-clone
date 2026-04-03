import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/main/inicio' },
  { path: '/main', redirect: '/main/inicio' },

  // Main tabs
  { path: '/main/inicio', name: 'Home', component: () => import('../views/HomePage.vue') },
  { path: '/main/deposito', name: 'Deposit', component: () => import('../views/DepositPage.vue'), meta: { auth: true } },
  { path: '/main/promo', name: 'Promo', component: () => import('../views/PromoPage.vue') },
  { path: '/main/perfil', name: 'Profile', component: () => import('../views/ProfilePage.vue') },
  { path: '/main/menu', name: 'Menu', component: () => import('../views/MenuPage.vue') },
  { path: '/main/comissao', name: 'Commission', component: () => import('../views/CommissionPage.vue') },
  { path: '/main/entrar', name: 'HomeEntrar', component: () => import('../views/HomePage.vue') },

  // Auth
  { path: '/login', name: 'Login', component: () => import('../views/LoginPage.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterPage.vue') },

  // Game
  { path: '/launch', name: 'Launch', component: () => import('../views/LaunchPage.vue') },
  { path: '/game/category/:gameType/:platformId?', name: 'GameCategory', component: () => import('../views/GameCategoryPage.vue') },
  { path: '/game/search/:tab?', name: 'GameSearch', component: () => import('../views/GameSearchPage.vue') },
  { path: '/game/action/:id', name: 'GameAction', component: () => import('../views/LaunchPage.vue') },

  // Financial
  { path: '/recharge/apply', name: 'RechargeApply', component: () => import('../views/DepositPage.vue'), meta: { auth: true } },
  { path: '/rechargeRecord', name: 'RechargeRecord', component: () => import('../views/ReportPage.vue'), meta: { auth: true } },
  { path: '/withdraw/apply', name: 'WithdrawApply', component: () => import('../views/WithdrawPage.vue'), meta: { auth: true } },
  { path: '/withdrawPW', name: 'WithdrawPW', component: () => import('../views/WithdrawPage.vue'), meta: { auth: true } },
  { path: '/withdrawSubView', name: 'WithdrawSubView', component: () => import('../views/WithdrawPage.vue'), meta: { auth: true } },
  { path: '/withdrawAuditDetails', name: 'WithdrawAudit', component: () => import('../views/WithdrawPage.vue'), meta: { auth: true } },
  { path: '/withdrawalAccount', name: 'WithdrawAccount', component: () => import('../views/WithdrawAccountPage.vue'), meta: { auth: true } },
  { path: '/withdrawalBindAccount', name: 'WithdrawBind', component: () => import('../views/WithdrawBindPage.vue'), meta: { auth: true } },

  // CPF
  { path: '/bindCPF/:processMode?', name: 'BindCPF', component: () => import('../views/BindCpfPage.vue'), meta: { auth: true } },
  { path: '/cpf', name: 'CPF', component: () => import('../views/BindCpfPage.vue'), meta: { auth: true } },

  // Security
  { path: '/security', name: 'Security', component: () => import('../views/SecurityPage.vue'), meta: { auth: true } },
  { path: '/security/verify/:type', name: 'SecurityVerify', component: () => import('../views/SecurityPage.vue'), meta: { auth: true } },
  { path: '/security/confirm/:type', name: 'SecurityConfirm', component: () => import('../views/SecurityPage.vue'), meta: { auth: true } },
  { path: '/security/bind/:type', name: 'SecurityBind', component: () => import('../views/SecurityPage.vue'), meta: { auth: true } },

  // Notifications
  { path: '/notification', name: 'Notifications', component: () => import('../views/NotificationPage.vue') },
  { path: '/notification/detail/:id', name: 'NotificationDetail', component: () => import('../views/NotificationDetailPage.vue') },

  // Reports
  { path: '/report', name: 'Report', component: () => import('../views/ReportPage.vue'), meta: { auth: true } },
  { path: '/report/:type', name: 'ReportType', component: () => import('../views/ReportPage.vue'), meta: { auth: true } },

  // Promotions / VIP
  { path: '/activity/vip', name: 'VIP', component: () => import('../views/VipPage.vue') },
  { path: '/Redeem', name: 'Redeem', component: () => import('../views/RedeemPage.vue') },
  { path: '/subscribeReward', name: 'SubscribeReward', component: () => import('../views/PromoPage.vue') },

  // Agency / MLM
  { path: '/spread', name: 'Spread', component: () => import('../views/SpreadPage.vue'), meta: { auth: true } },
  { path: '/mlmAgent', name: 'MLMAgent', component: () => import('../views/SpreadPage.vue'), meta: { auth: true },
    children: [
      { path: 'invitation', name: 'AgentInvitation', component: () => import('../views/SpreadPage.vue') },
      { path: 'subordinate', name: 'AgentSubordinate', component: () => import('../views/SpreadPage.vue') },
      { path: 'commissionDetail', name: 'AgentCommission', component: () => import('../views/SpreadPage.vue') },
      { path: 'invitationRules', name: 'AgentRules', component: () => import('../views/SpreadPage.vue') },
      { path: 'agentLevel', name: 'AgentLevel', component: () => import('../views/SpreadPage.vue') },
      { path: 'commissionRate', name: 'AgentRate', component: () => import('../views/SpreadPage.vue') },
      { path: 'leaderBord', name: 'AgentLeaderboard', component: () => import('../views/SpreadPage.vue') },
      { path: 'firstDepositCommission', name: 'AgentFirstDeposit', component: () => import('../views/SpreadPage.vue') },
      { path: 'inviteCommission', name: 'AgentInviteCommission', component: () => import('../views/SpreadPage.vue') },
      { path: 'inviteRule', name: 'AgentInviteRule', component: () => import('../views/SpreadPage.vue') },
    ]
  },

  // Activity pages
  { path: '/activity/RedPacket/:id?', name: 'RedPacket', component: () => import('../views/activities/RedPacketPage.vue') },
  { path: '/activity/AssistanceCash/:id?', name: 'AssistanceCash', component: () => import('../views/activities/LuckyWheelPage.vue') },
  { path: '/activity/MysteryReward/:id?', name: 'MysteryReward', component: () => import('../views/activities/MysteryRewardPage.vue') },
  { path: '/activity/SignIn/:id?', name: 'SignIn', component: () => import('../views/activities/SignInPage.vue') },
  { path: '/activity/LevelSignIn/:id?', name: 'LevelSignIn', component: () => import('../views/activities/SignInPage.vue') },
  { path: '/activity/MemberAppreciation/:id?', name: 'MemberAppreciation', component: () => import('../views/activities/MemberAppreciationPage.vue') },
  { path: '/activity/LuckyBet/:id?', name: 'LuckyBet', component: () => import('../views/activities/LuckyBetPage.vue') },
  { path: '/activity/Rescue/:id?', name: 'Rescue', component: () => import('../views/activities/RescuePage.vue') },
  { path: '/activity/CommissionReward/:id?', name: 'CommissionReward', component: () => import('../views/activities/CommissionRewardPage.vue') },
  { path: '/activity/RechargePromotion/:id?', name: 'RechargePromotion', component: () => import('../views/activities/RechargePromotionPage.vue') },
  { path: '/activity/LuckyWheel/:id?', name: 'LuckyWheel', component: () => import('../views/activities/LuckyWheelPage.vue') },
  { path: '/activity/InviteCPF/:id?', name: 'InviteCPF', component: () => import('../views/activities/InviteCpfPage.vue') },
  { path: '/activity/ReferralRewardsNew/:id?', name: 'ReferralRewards', component: () => import('../views/activities/ReferralRewardsPage.vue') },
  { path: '/activity/NewUserExclusive/:id?', name: 'NewUserExclusive', component: () => import('../views/activities/NewUserExclusivePage.vue') },
  { path: '/activity/ValidBet/:id?', name: 'ValidBet', component: () => import('../views/activities/ValidBetPage.vue') },
  { path: '/activity/RechargeBonus/:id?', name: 'RechargeBonus', component: () => import('../views/activities/RechargeBonusPage.vue') },
  { path: '/activity/RegisterReward/:id?', name: 'RegisterReward', component: () => import('../views/activities/RegisterRewardPage.vue') },
  { path: '/activity/Agency/:id?', name: 'AgencyActivity', component: () => import('../views/activities/AgencyPage.vue') },
  { path: '/activity/Custom/:id?', name: 'CustomActivity', component: () => import('../views/activities/CustomActivityPage.vue') },

  // Download
  { path: '/download', name: 'Download', component: () => import('../views/DownloadPage.vue') },

  // Misc
  { path: '/restricted', name: 'Restricted', component: () => import('../views/RestrictedPage.vue') },
  { path: '/unAvailable', name: 'Unavailable', component: () => import('../views/RestrictedPage.vue') },
  { path: '/405', name: 'Forbidden', component: () => import('../views/RestrictedPage.vue') },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/main/inicio' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  if (to.meta.auth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
