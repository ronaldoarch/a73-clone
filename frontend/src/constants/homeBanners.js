/**
 * Banners do carrossel da home (PNG em public/assets/banners/).
 * Copie para cá: vip.png, meiri.png, pdd.png, hby.png, fs.png, bx2.png
 * (mesmos nomes da sua pasta de arte).
 *
 * Se a imagem falhar ao carregar, HomePage usa banner-bonus.svg no @error.
 */
export const LOCAL_HOME_BANNERS = [
  { img: '/assets/banners/vip.png', title: 'Programa VIP', route: '/activity/vip' },
  { img: '/assets/banners/meiri.png', title: 'Recompensa diária', route: '/main/promo' },
  { img: '/assets/banners/pdd.png', title: 'Promoções', route: '/main/promo' },
  { img: '/assets/banners/hby.png', title: 'Eventos', route: '/main/promo' },
  { img: '/assets/banners/fs.png', title: 'Ofertas especiais', route: '/main/promo' },
  { img: '/assets/banners/bx2.png', title: 'Bônus', route: '/main/promo' },
]
