# Comparação: iGameWin A73 vs LuxBet

## 1. Visão geral

| Aspecto | LuxBet | A73 |
|---------|--------|-----|
| Modo principal | Seamless | Seamless + Transfer |
| Saldo | Banco LuxBet | Banco A73 (AfiliadoData) |
| iGameWin chama | Backend para saldo/transações | Backend via gold_api |

---

## 2. Gold API (modo Seamless)

### Endpoints expostos

| LuxBet | A73 |
|--------|-----|
| POST /gold_api | ✅ POST /gold_api |
| POST /api/public/gold_api | ❌ |
| POST /api/admin/gold_api | ❌ |
| GET /gold_api (teste disponibilidade) | ❌ |

**A73:** POST /gold_api e POST /api/games/seamless (ambos usam o mesmo handler).

### Métodos implementados

| Método | LuxBet | A73 |
|--------|--------|-----|
| user_balance | ✅ | ✅ |
| transaction (debit, credit, debit_credit) | ✅ | ✅ |

### Validação

| LuxBet | A73 |
|--------|-----|
| agent_code ativo + agent_secret correto | agent_code + agent_secret |
| user_code obrigatório | user_code obrigatório |

### Regras de transação

| LuxBet | A73 |
|--------|-----|
| Aposta: primeiro bonus_balance, depois balance | Aposta: só balance (AfiliadoData) |
| Ganho: sempre em balance (sacável) | Ganho: balance |
| Registro em bets com external_id = txn_id | Registro em GameTxnLog com txnId |

**Diferença:** LuxBet tem bonus_balance separado; A73 tem apenas um saldo.

---

## 3. Fluxo de lançamento

| Etapa | LuxBet | A73 |
|-------|--------|-----|
| 1. Usuário clica "Jogar" | GET /api/public/games/{game_code}/launch | POST /api/igamewin/launch-game |
| 2. create_user no iGameWin | ✅ | ✅ user_create |
| 3. launch_game → launch_url | ✅ | ✅ |
| 4. Frontend abre | iframe | Nova aba (target="_blank") |
| 5. Durante o jogo | iGameWin chama /gold_api | iGameWin chama /gold_api |

**A73 adicional:** Modo Transfer com user_deposit antes e game-return para user_withdraw_reset.

---

## 4. Cliente API (chamadas ao iGameWin)

| Método LuxBet | A73 |
|---------------|-----|
| create_user | ✅ user_create (em launch-game) |
| get_agent_balance | ✅ money_info (Admin) |
| get_user_balance | ✅ money_info |
| transfer_in | ✅ user_deposit (modo Transfer) |
| transfer_out | ✅ user_withdraw_reset (game-return) |
| get_providers | ✅ provider_list (catalog) |
| get_games | ✅ game_list (catalog) |
| launch_game | ✅ game_launch |
| control_rtp | ✅ control_rtp (via proxy) |

---

## 5. Rotas administrativas

| LuxBet | A73 |
|--------|-----|
| CRUD /api/admin/igamewin-agents | Config único em Settings (agent_code, agent_token, agent_secret) |
| GET agent-balance | money_info no Admin |
| GET games | GET /api/igamewin/catalog |
| POST control-rtp/agent | control_rtp via proxy |
| POST control-rtp/user | control_rtp com user_code |
| POST control-rtp/bulk-users | ❌ |

---

## 6. Cache

| LuxBet | A73 |
|--------|-----|
| TTL 5 min | TTL 10 min |
| Chaves por agent_code, provider_code | Cache global (um agent) |
| Invalidação ao atualizar agentes | Invalidação ao salvar home-providers |

---

## 7. Configuração no painel iGameWin

| LuxBet | A73 |
|--------|-----|
| Tipo de API: Seamless | Seamless ou Transfer |
| Site Endpoint: https://api.luxbet.site | https://api.35m.site |
| Lista de IPs IPv4 | - |
| Linguagem: BRL | lang no game_launch |
| Moeda: BRL | - |

---

## 8. Webhook

| LuxBet | A73 |
|--------|-----|
| POST /webhook/igamewin/bet (auditoria) | ❌ |

Em Seamless, o saldo já é atualizado via gold_api; o webhook LuxBet serve para registro/auditoria.

---

## 9. Mapeamento de jogos

| LuxBet | A73 |
|--------|-----|
| igamewin_games_to_viper/ | ❌ |

A73 usa os códigos do iGameWin diretamente.

---

## 10. Resumo – o que está alinhado

- ✅ Modo Seamless com gold_api (user_balance, transaction)
- ✅ user_create antes de game_launch
- ✅ Validação agent_code + agent_secret
- ✅ Tipos de transação: debit, credit, debit_credit
- ✅ Idempotência por txn_id
- ✅ Cache de providers/jogos
- ✅ control_rtp
- ✅ Site Endpoint sem /gold_api (iGameWin adiciona)

---

## 11. Melhorias sugeridas (baseadas no LuxBet)

1. **GET /gold_api** – health check para o iGameWin testar disponibilidade
2. **Webhook /webhook/igamewin/bet** – auditoria de apostas (opcional)
3. **bonus_balance** – se houver bônus separado do saldo principal
4. **control_rtp em lote** – bulk-users (se necessário)
