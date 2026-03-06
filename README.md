# A73 Clone - Réplica Editável

Réplica do site A73 com **código-fonte editável**, construída com Vue 3 + Ionic + Vite.

## Diferença do site original

| Original (baixado) | Este clone |
|--------------------|------------|
| JS minificado | Código Vue legível |
| Sem componentes | Componentes `.vue` editáveis |
| Patches para modificar | Edição direta do código |

## Pré-requisitos

- Node.js 18+
- npm ou pnpm

## Instalação

```bash
cd a73-clone
npm install
```

## Executar

1. **Inicie o servidor backend** (em outro terminal):
   ```bash
   cd /Volumes/midascod/chinesa
   python3 server.py
   ```
   O servidor roda em `http://localhost:3000` e fornece a API tRPC (login, registro) e os assets.

2. **Inicie o clone**:
   ```bash
   npm run dev
   ```
   O clone roda em `http://localhost:3001` e faz proxy das requisições `/api` e `/s5` para o servidor.

## Estrutura

```
a73-clone/
├── src/
│   ├── views/          # Páginas (Login, Registro, Início, Admin)
│   ├── components/     # Componentes reutilizáveis
│   ├── api/            # Cliente tRPC
│   ├── theme.css       # Variáveis de tema
│   └── main.js
├── public/
│   └── s5/             # Imagens e ícones (copiados do original)
└── package.json
```

## Rotas

- `/main/inicio/` - Página inicial
- `/main/login/` - Login (nome de usuário + senha)
- `/main/register/` - Registro
- `/admin/` - Painel admin

## Editar

Todos os arquivos em `src/` são editáveis. Exemplos:

- **Login**: `src/views/Login.vue`
- **Registro**: `src/views/Register.vue`
- **Tema**: `src/theme.css`
- **API**: `src/api/trpc.js`

## Build para produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`. Para servir, use o mesmo `server.py` apontando para a pasta `dist` ou um servidor estático.
