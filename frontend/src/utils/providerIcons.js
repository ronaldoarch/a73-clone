export const PROVIDER_SPRITE_POSITIONS = Object.freeze({
  slots_cq9: '0 0',
  ONE_API_CQ9: '0 0',
  Tada: '-100% 0',
  ELECTRONIC_tada: '-100% 0',
  ONE_API_Tada: '-100% 0',
  PP: '-200% 0',
  ONE_API_PP: '-200% 0',
  ELECTRONIC_PP: '-200% 0',
  PG: '-300% 0',
  KKGAME: '-300% 0',
  ELECTRONIC_kk: '-300% 0',
  ONE_API_PG: '-300% 0',
  slots_Evoplay: '-400% 0',
  ONE_API_Evoplay: '-400% 0',
  Betby: '-500% 0',
  slots_jdb: '-600% 0',
  ONE_API_JDB: '-600% 0',
  slots_Spinix: '-700% 0',
  ONE_API_Spinix: '-700% 0',
  live_evolutoin: '0 -100%',
  ONE_API_Evolution: '0 -100%',
  SPRIBE: '-100% -100%',
  ONE_API_Spribe: '-100% -100%',
  M8SPORTS: '-200% -100%',
  basha: '-300% -100%',
  slots_jili: '-400% -100%',
  ONE_API_Jili: '-400% -100%',
  slots_fc: '-500% -100%',
  ONE_API_FaChai: '-500% -100%',
  PANDA: '0 -200%',
  TBGame: '-600% -100%',
  CP: '-700% -100%',
  G759: '-200% -200%',
  SEXYBCRT: '-500% -200%',
  ONE_API_Sexy: '-500% -200%',
  EVOLive: '0 -100%',
  WHITECLIFF_Evolution: '0 -100%',
  WM_LIVE: '-700% -200%',
  FBSports: '0 -300%',
  ONE_API_AG: '-100% -300%',
  POPOK: '-300% -300%',
  PLAYSON: '-400% -300%',
  RUBYPLAY: '-500% -300%',
  inout: '-600% -300%',
  FASTSPIN: '-700% -300%',
  RECTANGLE: '0 -400%',
  '1BET': '-100% -400%',
  TOPPLAYER: '-200% -400%'
})

export const CATEGORY_SPRITE_POSITIONS = Object.freeze({
  ONE_API_HOT: '0 0',
  POPULAR: '0 0',
  ELECTRONIC: '-100% 0',
  SLOTS: '-100% 0',
  CHESS: '-200% 0',
  TABLE: '-200% 0',
  FISHING: '-300% 0',
  VIDEO: '-400% 0',
  LIVE: '-400% 0',
  SPORTS: '-500% 0',
  LOTTERY: '-600% 0',
  CRASH: '-100% 0',
  ARCADE: '-100% 0',
  BINGO: '-200% 0'
})

export function getProviderSpriteStyle(providerCode, spriteUrl) {
  const position = PROVIDER_SPRITE_POSITIONS[providerCode]
  if (!position || !spriteUrl) return ''
  return `background-image: url(${spriteUrl}); background-position: ${position};`
}

export function getCategorySpriteStyle(categoryCode, spriteUrl) {
  const position = CATEGORY_SPRITE_POSITIONS[categoryCode]
  if (!position || !spriteUrl) return ''
  return `background-image: url(${spriteUrl}); background-position: ${position};`
}

export function hasProviderIcon(providerCode) {
  return providerCode in PROVIDER_SPRITE_POSITIONS
}

export function hasCategoryIcon(categoryCode) {
  return categoryCode in CATEGORY_SPRITE_POSITIONS
}

export const USER_CARD_SPRITE_POSITIONS = Object.freeze({
  entrar: '0 0',
  withdraw: '-100% 0',
  vip: '-200% 0',
  promo: '-300% 0'
})
