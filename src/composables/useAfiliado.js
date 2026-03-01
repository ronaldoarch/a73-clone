/**
 * Store centralizado de afiliado e bônus.
 * Persiste em localStorage para funcionar sem backend.
 * Regras: Promo (subordinados válidos), Comissão (rebate 5%), VIP (apostas), Misterioso (depósito/dias).
 */
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'a73_afiliado_data'
const BASE_URL = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://a73.com'

const defaultData = () => ({
  // Afiliado
  pid: '',
  subDiretos: 0,
  subValidos: 0,
  subOutros: 0,
  novosSubordinados: 0,
  valorDeposito: 0,
  numDepositos: 0,
  valorPrimeiroDep: 0,
  usuariosPrimeiroDep: 0,
  valorSaque: 0,
  numSaques: 0,
  // Comissão
  comissaoRecebida: 0,
  comissaoPendente: 0,
  comissaoHoje: 0,
  coletavelRebate: 0,
  // VIP
  apostaAcumulada: 0,
  nivelVip: 0,
  bonusVipColetados: [],
  bonusVipReclamar: 0,
  // Misterioso
  horaRegisto: null,
  depositoMisterioso: 0,
  misteriosoReclamado: false,
  misteriosoDiasAtivos: 0,
  // Bônus Promo (indicação)
  bonusPromoReclamados: [], // array de { pessoas: N } já reclamados
})

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...defaultData(), ...parsed }
    }
  } catch (e) {}
  return defaultData()
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {}
}

const state = ref(loadFromStorage())

watch(state, (val) => {
  saveToStorage(val)
}, { deep: true })

/** Captura pid da URL (?pid=xxx) e persiste para uso no registro */
export function capturePidFromUrl() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const pid = params.get('pid') || params.get('ref') || params.get('aff')
  if (pid) {
    localStorage.setItem('a73_pid_ref', pid)
    return pid
  }
  return localStorage.getItem('a73_pid_ref')
}

/** Pid do usuário logado (afiliado) - usado no link de convite */
export function getMyPid() {
  const account = localStorage.getItem('account') || ''
  const token = localStorage.getItem('token')
  if (token && account) {
    // Usar hash do account como pid único (simulação)
    let pid = localStorage.getItem('a73_my_pid')
    if (!pid) {
      pid = '4' + String(Math.abs(account.split('').reduce((a, c) => a + c.charCodeAt(0), 0))).padStart(9, '0')
      localStorage.setItem('a73_my_pid', pid)
    }
    return pid
  }
  return state.value.pid || '4180019537'
}

export function useAfiliado() {
  const linkConvite = computed(() => {
    const pid = getMyPid()
    const sep = BASE_URL.includes('?') ? '&' : '?'
    return `${BASE_URL}${sep}pid=${pid}`
  })

  const idIndicacao = computed(() => getMyPid())

  const subDiretos = computed({
    get: () => state.value.subDiretos,
    set: (v) => { state.value.subDiretos = v }
  })

  const subValidos = computed({
    get: () => state.value.subValidos,
    set: (v) => { state.value.subValidos = v }
  })

  const subOutros = computed({
    get: () => state.value.subOutros,
    set: (v) => { state.value.subOutros = v }
  })

  const comissaoRecebida = computed({
    get: () => state.value.comissaoRecebida,
    set: (v) => { state.value.comissaoRecebida = v }
  })

  const comissaoPendente = computed({
    get: () => state.value.comissaoPendente,
    set: (v) => { state.value.comissaoPendente = v }
  })

  const comissaoHoje = computed({
    get: () => state.value.comissaoHoje,
    set: (v) => { state.value.comissaoHoje = v }
  })

  const coletavelRebate = computed({
    get: () => state.value.coletavelRebate,
    set: (v) => { state.value.coletavelRebate = v }
  })

  const apostaAcumulada = computed({
    get: () => state.value.apostaAcumulada,
    set: (v) => { state.value.apostaAcumulada = v }
  })

  const nivelVip = computed({
    get: () => state.value.nivelVip,
    set: (v) => { state.value.nivelVip = v }
  })

  const depositoMisterioso = computed({
    get: () => state.value.depositoMisterioso,
    set: (v) => { state.value.depositoMisterioso = v }
  })

  const misteriosoReclamado = computed({
    get: () => state.value.misteriosoReclamado,
    set: (v) => { state.value.misteriosoReclamado = v }
  })

  const horaRegisto = computed({
    get: () => state.value.horaRegisto,
    set: (v) => { state.value.horaRegisto = v }
  })

  const bonusPromoReclamados = computed({
    get: () => state.value.bonusPromoReclamados || [],
    set: (v) => { state.value.bonusPromoReclamados = v }
  })

  const novosSubordinados = computed(() => state.value.novosSubordinados ?? 0)
  const valorDeposito = computed(() => fmt(state.value.valorDeposito ?? 0))
  const numDepositos = computed(() => state.value.numDepositos ?? 0)
  const valorPrimeiroDep = computed(() => fmt(state.value.valorPrimeiroDep ?? 0))
  const usuariosPrimeiroDep = computed(() => state.value.usuariosPrimeiroDep ?? 0)
  const valorSaque = computed(() => fmt(state.value.valorSaque ?? 0))
  const numSaques = computed(() => state.value.numSaques ?? 0)

  /** Formata valor em R$ */
  function fmt(val) {
    if (typeof val !== 'number') val = parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  /** Promo: próxima recompensa disponível com base em subValidos */
  const recompensasPromo = [
    { valor: 50, pessoas: 1 }, { valor: 50, pessoas: 2 }, { valor: 50, pessoas: 3 }, { valor: 50, pessoas: 4 },
    { valor: 50, pessoas: 5 }, { valor: 300, pessoas: 10 }, { valor: 300, pessoas: 15 }, { valor: 300, pessoas: 20 },
    { valor: 500, pessoas: 30 }, { valor: 600, pessoas: 40 }, { valor: 600, pessoas: 50 }, { valor: 600, pessoas: 60 },
    { valor: 600, pessoas: 70 }, { valor: 600, pessoas: 80 }, { valor: 600, pessoas: 90 }, { valor: 700, pessoas: 100 },
    { valor: 2500, pessoas: 150 }, { valor: 2500, pessoas: 200 }, { valor: 2500, pessoas: 250 }, { valor: 2500, pessoas: 300 },
    { valor: 2500, pessoas: 350 }, { valor: 2500, pessoas: 400 }, { valor: 2500, pessoas: 450 }, { valor: 3000, pessoas: 500 },
  ]

  const recompensasDisponiveis = computed(() => {
    const validos = state.value.subValidos
    const reclamados = state.value.bonusPromoReclamados || []
    return recompensasPromo.filter(r => r.pessoas <= validos && !reclamados.some(x => x.pessoas === r.pessoas))
  })

  const podeReclamarPromo = computed(() => recompensasDisponiveis.value.length > 0)

  /** VIP: níveis e progresso */
  const niveisVip = [
    { nivel: 0, aposta: 0, bonus: 0 },
    { nivel: 1, aposta: 100, bonus: 1 }, { nivel: 2, aposta: 1000, bonus: 3 }, { nivel: 3, aposta: 3000, bonus: 10 },
    { nivel: 4, aposta: 10000, bonus: 15 }, { nivel: 5, aposta: 30000, bonus: 30 }, { nivel: 6, aposta: 60000, bonus: 40 },
    { nivel: 7, aposta: 100000, bonus: 55 }, { nivel: 8, aposta: 300000, bonus: 155 }, { nivel: 9, aposta: 600000, bonus: 255 },
    { nivel: 10, aposta: 1000000, bonus: 355 }, { nivel: 11, aposta: 2000000, bonus: 555 }, { nivel: 12, aposta: 3000000, bonus: 755 },
    { nivel: 13, aposta: 4000000, bonus: 855 }, { nivel: 14, aposta: 5000000, bonus: 955 }, { nivel: 15, aposta: 6000000, bonus: 1055 },
  ]

  const vipProgresso = computed(() => {
    const aposta = state.value.apostaAcumulada || 0
    const nivel = state.value.nivelVip || 0
    const atual = niveisVip[nivel] || niveisVip[0]
    const prox = niveisVip[Math.min(nivel + 1, niveisVip.length - 1)]
    const pct = prox.aposta > 0 ? Math.min(100, (aposta / prox.aposta) * 100) : 0
    return {
      apostaAtual: fmt(aposta),
      apostaProximo: fmt(prox.aposta),
      progresso: pct,
      bonusProximo: prox.bonus,
    }
  })

  const podeColetarVip = computed(() => {
    const bonus = state.value.bonusVipReclamar || 0
    return bonus > 0
  })

  /** Misterioso: elegibilidade por depósito e dias */
  const tabelaMisterioso = [
    { deposito: 30, premioMin: 0.3, premioMax: 88 },
    { deposito: 70, premioMin: 0.7, premioMax: 188 },
    { deposito: 150, premioMin: 1, premioMax: 388 },
    { deposito: 300, premioMin: 3, premioMax: 688 },
    { deposito: 600, premioMin: 7, premioMax: 888 },
    { deposito: 1000, premioMin: 10, premioMax: 1888 },
    { deposito: 2000, premioMin: 24, premioMax: 2888 },
    { deposito: 5000, premioMin: 61, premioMax: 8888 },
  ]

  const misteriosoElegivel = computed(() => {
    const dep = state.value.depositoMisterioso || 0
    const reclamado = state.value.misteriosoReclamado
    const minDep = 30
    return dep >= minDep && !reclamado
  })

  /** Inicializa dados do usuário ao registrar (com pid do indicador) */
  function initFromRegistro(account, pidRef) {
    if (pidRef) state.value.pid = pidRef
    if (!state.value.horaRegisto) {
      state.value.horaRegisto = new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  }

  /** Simula novo subordinado (para demo - em produção viria do backend) */
  function addSubordinadoValido() {
    state.value.subDiretos = (state.value.subDiretos || 0) + 1
    state.value.subValidos = (state.value.subValidos || 0) + 1
    state.value.novosSubordinados = (state.value.novosSubordinados || 0) + 1
  }

  /** Reclamar bônus Promo (por X pessoas) */
  function reclamarBonusPromo(pessoas) {
    const reclamados = state.value.bonusPromoReclamados || []
    if (reclamados.some(x => x.pessoas === pessoas)) return false
    const r = recompensasPromo.find(x => x.pessoas === pessoas)
    if (!r || state.value.subValidos < pessoas) return false
    reclamados.push({ pessoas, valor: r.valor })
    state.value.bonusPromoReclamados = reclamados
    return true
  }

  /** Receber comissão */
  function receberComissao(valor) {
    const v = typeof valor === 'number' ? valor : (state.value.comissaoPendente || state.value.coletavelRebate || 0)
    if (v <= 0) return false
    state.value.comissaoRecebida = (state.value.comissaoRecebida || 0) + v
    state.value.comissaoPendente = Math.max(0, (state.value.comissaoPendente || 0) - v)
    state.value.coletavelRebate = Math.max(0, (state.value.coletavelRebate || 0) - v)
    return true
  }

  /** Reclamar Misterioso */
  function reclamarMisterioso() {
    if (state.value.misteriosoReclamado) return false
    if ((state.value.depositoMisterioso || 0) < 30) return false
    state.value.misteriosoReclamado = true
    return true
  }

  /** Coletar bônus VIP */
  function coletarVip() {
    const bonus = state.value.bonusVipReclamar || 0
    if (bonus <= 0) return false
    state.value.bonusVipReclamar = 0
    return true
  }

  /** Registrar depósito (atualiza Misterioso, comissão, apostas VIP, etc.) */
  function registrarDeposito(valor) {
    if (!valor || valor <= 0) return
    state.value.depositoMisterioso = (state.value.depositoMisterioso || 0) + valor
    state.value.valorDeposito = (state.value.valorDeposito || 0) + valor
    state.value.numDepositos = (state.value.numDepositos || 0) + 1
    // Comissão 5% (rebate) - simulação
    const rebate = valor * 0.05
    state.value.coletavelRebate = (state.value.coletavelRebate || 0) + rebate
    state.value.comissaoPendente = (state.value.comissaoPendente || 0) + rebate
    state.value.comissaoHoje = (state.value.comissaoHoje || 0) + rebate
    // Apostas acumuladas (simulação: depósito x 5 para progresso VIP)
    state.value.apostaAcumulada = (state.value.apostaAcumulada || 0) + valor * 5
    // Bônus VIP disponível ao atingir novo nível
    const aposta = state.value.apostaAcumulada
    const nivel = state.value.nivelVip || 0
    const prox = niveisVip[Math.min(nivel + 1, niveisVip.length - 1)]
    if (aposta >= prox.aposta && nivel < 15) {
      state.value.bonusVipReclamar = (state.value.bonusVipReclamar || 0) + prox.bonus
      state.value.nivelVip = nivel + 1
    }
  }

  return {
    state,
    linkConvite,
    idIndicacao,
    subDiretos,
    subValidos,
    subOutros,
    comissaoRecebida,
    comissaoPendente,
    comissaoHoje,
    coletavelRebate,
    apostaAcumulada,
    nivelVip,
    depositoMisterioso,
    misteriosoReclamado,
    horaRegisto,
    bonusPromoReclamados,
    fmt,
    recompensasPromo,
    recompensasDisponiveis,
    podeReclamarPromo,
    niveisVip,
    vipProgresso,
    podeColetarVip,
    tabelaMisterioso,
    misteriosoElegivel,
    initFromRegistro,
    addSubordinadoValido,
    reclamarBonusPromo,
    receberComissao,
    reclamarMisterioso,
    coletarVip,
    novosSubordinados,
    valorDeposito,
    numDepositos,
    valorPrimeiroDep,
    usuariosPrimeiroDep,
    valorSaque,
    numSaques,
    registrarDeposito,
  }
}
