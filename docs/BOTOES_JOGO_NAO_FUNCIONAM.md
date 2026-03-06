# Análise: Botões do jogo não funcionam (não é iGameWin)

## Contexto

O saldo (R$4,00) aparece corretamente, mas os botões (Spin, Opções de rodada, Aposta, Menu) não respondem. O iGameWin confirmou que o problema não está no lado deles.

## Possíveis causas no nosso lado

### 1. gold_api retornando erro

Quando o usuário clica em Spin, o jogo chama `POST /gold_api` com `method: 'transaction'`. Se retornarmos `status: 0` (erro), o jogo pode desabilitar os botões.

**Erros que geram status 0:**
- `INVALID_AGENT` – agent_code ou agent_secret incorretos
- `INVALID_PARAMETER` – user_code vazio
- `INVALID_USER` – usuário não encontrado no banco
- `INSUFFICIENT_USER_FUNDS` – saldo insuficiente para a aposta
- `INVALID_METHOD` – método não reconhecido

**Como diagnosticar:** Verifique os logs do backend. Adicionamos `console.warn` para cada erro. Exemplo:
```
gold_api INVALID_USER: { user_code: '39***' }
gold_api INSUFFICIENT_USER_FUNDS: { user_code: '39***', currentBalance: 4, delta: -0.5 }
```

### 2. user_code não corresponde ao account

O jogo envia o `user_code` que recebeu no `game_launch`. Nosso backend busca o usuário por `account`. Se o formato for diferente (ex.: `11999999999` vs `11 99999-9999`), não encontra.

**Solução:** Já temos `normalizeAccount` (só dígitos). Confirme que o `account` no banco está normalizado e que o `user_code` enviado no launch é o mesmo.

### 3. Permissões do iframe

O jogo precisa de permissões para interação (fullscreen, payment, etc.). Atualizamos o `GameIframeModal` com:
- `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; payment; gamepad"`
- `referrerpolicy="no-referrer-when-downgrade"`

### 4. CORS

O jogo (origem iGameWin) faz POST para nosso backend. O middleware CORS para `/gold_api` reflete o `Origin` da requisição. Se o jogo usar uma origem não esperada, pode ser bloqueado.

**Verificar:** No DevTools do navegador (aba Network), ao clicar em Spin, aparece requisição para `/gold_api`? Qual o status (200, 403, CORS error)?

### 5. Formato da transação

O jogo pode enviar `slot`, `live` ou `sport` com estrutura diferente. Suportamos:
- `slotData.txn_id` ou `transaction_id`
- `slotData.txn_type`: `debit`, `credit`, `debit_credit`
- `slotData.bet_money`, `slotData.bet`
- `slotData.win_money`, `slotData.win`

Valores > 100 são tratados como centavos (dividimos por 100).

### 6. Modo Demo (is_demo)

Com `is_demo: true`, não debitamos/creditamos o saldo real, mas retornamos `status: 1`. O jogo em modo demo pode ter comportamento diferente. Teste com `is_demo: false` (modo real) para comparar.

---

## Checklist de diagnóstico

1. [ ] Verificar logs do backend ao clicar em Spin – aparece `gold_api`?
2. [ ] Se aparecer erro (INVALID_USER, etc.), corrigir a causa
3. [ ] No DevTools → Network: a requisição POST /gold_api é feita? Status 200?
4. [ ] Site Endpoint no painel iGameWin = `https://api.35m.site` (ou URL do backend)
5. [ ] Agent Secret correto e preenchido
6. [ ] user_code no launch = account do usuário (normalizado)
7. [ ] Testar com is_demo: false

---

## Logs adicionados

O backend agora registra (console.warn) quando retorna erro em gold_api:
- INVALID_AGENT
- INVALID_PARAMETER
- INVALID_USER
- INSUFFICIENT_USER_FUNDS
- INVALID_METHOD

Isso permite identificar a causa nos logs do servidor.
