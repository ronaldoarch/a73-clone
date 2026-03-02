# Gatebox PIX - Integração

Gateway de pagamento PIX para depósitos e saques.

## Conta de teste (homologação)

| Campo    | Valor              |
|----------|--------------------|
| API URL  | `https://api.gatebox.com.br` |
| Username | `93892492000158`   |
| Password | `@Homolog1`        |

Configure no **Admin → Gatebox PIX** com esses dados para testar.

## Fluxo

### Depósito
1. Usuário escolhe valor e clica em "Depositar Agora"
2. Backend gera QR PIX via Gatebox
3. Usuário paga com o app do banco
4. Polling detecta pagamento e credita o saldo

### Saque
1. Usuário solicita saque (chave PIX + nome)
2. Admin aprova → Gatebox envia o PIX automaticamente
