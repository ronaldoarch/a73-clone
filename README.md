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
pnpm install
```

> **Nota:** O projeto usa **pnpm**. Se usar npm e tiver erro `Cannot read properties of null`, use `pnpm install` ou rode `rm -rf node_modules && pnpm install`.

## Executar

1. **PostgreSQL** (obrigatório para o backend):
   - **Com Docker:** `pnpm postgres:up`
   - **Sem Docker (disco externo):** Rode uma vez `./instalar-postgresql-disco-externo.sh`, depois use:
     ```bash
     ./postgresql-start.sh   # inicia
     ./postgresql-stop.sh    # para (antes de desconectar o disco)
     ```

2. **Backend** (em outro terminal):
   ```bash
   cd backend
   npm install
   npx prisma db push    # cria tabelas no banco (só na primeira vez)
   npm run dev
   ```
   O backend roda em `http://localhost:3000` e fornece a API (login, registro, jogos, etc.).

3. **Frontend**:
   ```bash
   cd a73-clone
   pnpm run dev
   ```
   O frontend roda em `http://localhost:3001` e faz proxy de `/api` para o backend.

### Erros comuns

- **`http proxy error: ECONNREFUSED`** — O backend não está rodando. Inicie o backend (passo 2).
- **`md.transition-C5IAVRC2.js` não encontrado** — Cache corrompido. Rode: `rm -rf node_modules/.vite && pnpm run dev`
- **`@rollup/rollup-darwin-arm64` / `ERR_DLOPEN_FAILED`** — Binário corrompido ou conflito. Rode o script de correção:
  ```bash
  cd /Volumes/midascod/chinesa
  chmod +x fix-rollup.sh && ./fix-rollup.sh
  cd a73-clone && pnpm run dev
  ```

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
