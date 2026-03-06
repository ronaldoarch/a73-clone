# Auditoria das Regras por Página

## 1. ROLETA (Mina Misteriosa) ✅
| Regra | Status |
|-------|--------|
| 1 chance/dia | ✅ Implementado |
| Saque ao atingir R$ 100 | ✅ Coleta automática |
| Mais giros ao convidar | ✅ +1 giro por indicação |
| Validade 3 dias | ✅ Prêmio expira |
| Coleta automática | ✅ Transferido para saldo |
| Somente proprietário | ✅ Auth obrigatório |

---

## 2. MISTERIOSO ✅
| Regra | Status |
|-------|--------|
| Depósitos e apostas → bônus | ⚠️ Depósito incrementa depositoMisterioso; apostas via depósito (5x) |
| Reinício no 32º dia após registro | ✅ Implementado (checkMisteriosoReset) |
| Bônus requer 1x apostas válidas para sacar | ⚠️ Não verificado (prêmio creditado direto) |
| Somente proprietário | ✅ Auth obrigatório |

**Corrigido:** `reclamar-misterioso` adiciona prêmio ao saldo (tabela por faixa de depósito).

---

## 3. PROMO (Bônus por Indicação) ✅
| Regra | Status |
|-------|--------|
| Convidar amigos para bônus | ✅ subValidos conta indicações |
| Reclamar manualmente | ✅ Implementado |
| Expiração e distribuição automática | ❌ Não implementado |
| Bônus requer 0x apostas para sacar | ✅ Reclamar adiciona ao saldo |
| Somente proprietário | ✅ Auth obrigatório |

**Condições "número de promoção efetiva":**
| Condição | Status |
|----------|--------|
| Depósitos acumulados subordinado ≥ 30 | ✅ Validado |
| Apostas acumuladas subordinado ≥ 600 | ✅ Validado |
| Outras (primeiro dep, dias, recargas) | ⚠️ Simplificado |

---

## 4. VIP ❌ Parcial
| Regra | Status |
|-------|--------|
| Promoção por apostas/recargas | ✅ apostaAcumulada no depósito |
| Bônus de upgrade ao subir nível | ✅ bonusVipReclamar |
| Bônus Diário | ❌ Não implementado |
| Bônus Semanal | ❌ Não implementado |
| Bônus Mensal | ❌ Não implementado |
| Expiração manual | ⚠️ Coletar existe, mas não adiciona ao saldo |
| Rollover 1x para sacar | ❌ Não implementado |
| Slots limitados (PG, JDB, etc.) | ❌ Não implementado |

**Problema crítico:** `coletar-vip` apenas atualiza `bonusVipColetados` e **não adiciona o valor ao saldo**.

---

## 5. COMISSÃO (5% Rebate) ❌ Parcial
| Regra | Status |
|-------|--------|
| 5% rebate no depósito | ✅ coletavelRebate e comissaoPendente |
| Receber comissão | ⚠️ Decrementa pendente mas **não adiciona ao saldo** |

**Problema crítico:** `receber-comissao` decrementa `comissaoPendente`/`coletavelRebate` mas **não incrementa `balance`**.

---

## 6. DEPÓSITO (Entrar) ✅
| Regra | Status |
|-------|--------|
| Login obrigatório | ✅ |
| Depósito incrementa saldo | ✅ balance + v |
| Depósito incrementa Misterioso | ✅ depositoMisterioso |
| Depósito incrementa comissão | ✅ 5% rebate |
| Depósito incrementa VIP | ✅ apostaAcumulada |

---

## 7. SAQUE (Withdraw) ✅
| Regra | Status |
|-------|--------|
| Login obrigatório | ✅ |
| Exibe saldo | ✅ |
| Limite R$ 20 - 40.000 | ✅ Implementado |
| Botão "Retirar Agora" | ✅ POST /api/saque (deduz saldo, cria Withdrawal) |

---

## Resumo de Correções Necessárias

### Prioridade 1 – Valores não vão para o saldo
1. **receber-comissao:** Adicionar `balance: { increment: v }` ao receber
2. **reclamar-promo:** Adicionar `balance: { increment: r.valor }` ao reclamar
3. **reclamar-misterioso:** Calcular prêmio (ex: tabela por depositoMisterioso) e adicionar ao `balance`
4. **coletar-vip:** Adicionar `balance: { increment: af.bonusVipReclamar }` ao coletar

### Prioridade 2 – Regras de negócio
5. **Misterioso:** Reinício no 32º dia
6. **Promo:** Validar "número de promoção efetiva" (subordinados com depósito ≥30, apostas ≥600)
7. **VIP:** Bônus Diário/Semanal/Mensal; rollover 1x

### Prioridade 3 – Fluxos
8. **Withdraw:** Implementar endpoint de saque real
