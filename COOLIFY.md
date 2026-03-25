# Deploy no Coolify com PostgreSQL

## Migrações automáticas

O backend executa **`prisma migrate deploy`** automaticamente ao iniciar, via `entrypoint.sh`:

1. Aguarda o PostgreSQL estar disponível (até 60s)
2. Aplica as migrações pendentes
3. Se `migrate deploy` falhar (ex: banco já existente), tenta `db push` como fallback
4. Inicia o servidor Node

**Importante:** No Coolify, **não defina** um "Custom Start Command" ou "Entrypoint" para o backend — deixe o padrão do Dockerfile para que as migrações rodem.

## Deploy apenas do Frontend (padrão)

Se você faz deploy só do repositório como **Application**, o frontend sobe sozinho (sem backend).
O nginx não faz proxy para `backend` — o app carrega, mas chamadas `/api` e `/uploads` retornam 404.

Para ter login, registro e bônus funcionando, use **Docker Compose** ou configure o backend separadamente.

## Opção 1: Docker Compose (recomendado)

1. No Coolify, crie um novo recurso **Docker Compose**
2. Cole o conteúdo do `docker-compose.yml`
3. Configure as variáveis:
   - `JWT_SECRET`: gere um segredo forte (ex: `openssl rand -base64 32`)
4. O Coolify pode criar o PostgreSQL automaticamente ou você adiciona como serviço de banco
5. Se usar PostgreSQL do Coolify, altere `DATABASE_URL` no serviço `backend` para a URL fornecida

## Opção 2: Serviços separados

### 1. PostgreSQL
- Crie um **PostgreSQL** no Coolify (Database)
- Anote a `DATABASE_URL` ou host, user, password, database

### 2. Backend
- Crie um **Dockerfile** build apontando para `./backend`
- Variáveis de ambiente:
  - `DATABASE_URL`: URL do PostgreSQL
  - `JWT_SECRET`: segredo JWT
  - `PORT`: 3000
- Volume para uploads: `/app/uploads` (persistir arquivos)

### 3. Frontend
- Build do Dockerfile raiz (frontend)
- Se frontend e backend estiverem no mesmo domínio, o nginx já faz proxy de `/api` e `/uploads` para o backend
- **Importante**: no docker-compose, o frontend depende do backend; o nginx usa `http://backend:3000`

### Frontend e backend em subdomínios diferentes (evitar CORS)

**IMPORTANTE:** Se você vê erro de CORS, o frontend está chamando o backend diretamente. Use o proxy:

- Frontend: ex. `lwsggkg88g0skg848880cg00.agenciamidas.com`
- Backend: ex. `jkcgkgks00ggggo4g0kow8ws.agenciamidas.com`
- **Build do frontend:** `VITE_API_URL` = **vazio ou omitir** — requests usam `/api` (mesma origem)
- **Runtime do frontend:** `BACKEND_URL` = URL do backend (ex: `https://jkcgkgks00ggggo4g0kow8ws.agenciamidas.com`)
- O nginx do frontend faz proxy de `/api` e `/uploads` para o backend — **sem CORS**

Se `VITE_API_URL` estiver definido no build, o frontend chama o backend diretamente e o CORS pode bloquear.

### 404 em /uploads (logo, banners, loading banner)

Se `/uploads/file-*.jpeg` retorna 404 mas `/api/settings` retorna 200, o backend está ok mas **os arquivos de upload não existem**. Causas comuns:

1. **Volume não configurado** — a cada redeploy os arquivos são perdidos
2. **Volume novo** — o volume foi criado vazio após um redeploy

**Solução no Coolify:**

1. Abra o recurso do **backend** (ou o serviço backend no Docker Compose)
2. Em **Storages** / **Volumes** / **Persistent Storage**, adicione:
   - **Container Path:** `/app/uploads`
   - **Volume Name:** `backend-uploads` (ou outro nome)
3. Salve e faça **Redeploy**
4. Depois do deploy, acesse o **Admin** e reenvie logo/banners, ou use "Restaurar (usar logo)" para aplicar a logo padrão

**Docker Compose:** o `docker-compose.yml` já define `backend-uploads:/app/uploads`. Se usar Compose no Coolify, o volume deve ser criado automaticamente. Se os arquivos sumiram após redeploy, pode ser que o volume tenha sido recriado — reenvie as imagens pelo Admin.

### Erro 502 Bad Gateway no /api

O 502 significa que o nginx do frontend não consegue alcançar o backend. Verifique:

1. **Backend está rodando?** — No Coolify, abra o serviço do backend e confira os logs. Se houver crash (ex.: Prisma), corrija antes.
2. **BACKEND_URL correto?** — Deve ser a URL pública do backend, ex: `https://jkcgkgks00ggggo4g0kow8ws.agenciamidas.com` (sem barra no final).
3. **Teste o backend direto** — No navegador ou `curl`, acesse `https://<backend-url>/api/settings`. Se retornar 200/JSON, o backend está ok.
4. **Docker Compose** — Se frontend e backend estiverem no mesmo `docker-compose.yml`, use `BACKEND_URL=http://backend:3000` (URL interna, sem HTTPS).

### Frontend e backend na mesma aplicação
- Se estiverem no mesmo domínio, o nginx já faz proxy
- `VITE_API_URL` = vazio

## Variáveis

### Backend
| Variável               | Descrição                                      |
|------------------------|------------------------------------------------|
| DATABASE_URL           | URL do PostgreSQL (Coolify fornece)            |
| JWT_SECRET             | Segredo para tokens JWT                        |
| PORT                   | Porta (padrão 3000)                             |
| FRONTEND_URL           | URL do frontend para CORS (ex: `https://lwsggkg88g0skg848880cg00.agenciamidas.com`). Várias: separar por vírgula |
| IGAMEWIN_AGENT_CODE    | Código do agent (Seamless)                      |
| IGAMEWIN_AGENT_SECRET  | Segredo do agent (Seamless, diferente do token)|
| API_PUBLIC_URL         | URL pública do backend (ex: `https://api.35m.site`) - usado no Admin para Site EndPoint do iGameWin |

### Frontend (build)
| Variável       | Descrição                                      |
|----------------|------------------------------------------------|
| VITE_API_URL   | URL do backend (ex: `https://api.seudominio.com`) quando em domínio diferente |

### API iGameWin (jogos)
- O backend faz proxy de `POST /api/igamewin` para `https://igamewin.com/api/v1`
- Evita CORS quando frontend e iGameWin estão em domínios diferentes
- Com `VITE_API_URL` configurado, o frontend usa esse proxy automaticamente

### iGameWin Seamless (Site API)
- O backend expõe `POST /gold_api` para modo Seamless
- Configure na iGameWin → Update Agent → Site EndPoint: **URL do backend** (ex: `https://api.35m.site`)
- O iGameWin adiciona `/gold_api` automaticamente
- Variáveis obrigatórias para Seamless:
  - `IGAMEWIN_AGENT_CODE`: código do agent (ex: Midaslabs)
  - `IGAMEWIN_AGENT_SECRET`: segredo do agent (diferente do agent_token)
- O `user_code` deve corresponder ao `account` do usuário no sistema

### iGameWin Transfer Mode
- No Admin → API de Jogos, selecione **API Mode: Transfer**
- Configure no painel iGameWin: API Type = "Transfer Mode"
- O agent precisa ter saldo no iGameWin (funding via painel)
- Ao abrir o jogo: `user_deposit` transfere o saldo do usuário para o iGameWin
- Ao fechar o jogo: configure Return URL no painel iGameWin para `https://api.35m.site/api/igamewin/game-return?user_code={user_code}` (o `{user_code}` será substituído pelo iGameWin)
- O endpoint `game-return` chama `user_withdraw_reset` e credita o saldo de volta no sistema

### Deploy falha: `tee .../backend/.env` (exit 255) ou sem mensagem de erro

O Coolify grava as variáveis de ambiente em `backend/.env` dentro da pasta do clone (`/artifacts/...`). Se essa pasta **não existir mais** após o build (árvore do repositório removida) ou o caminho estiver errado, o comando falha com **exit code 255** e às vezes *"Command failed with no error output"*.

**O que fazer (nesta ordem):**

1. **Preserve Repository During Deployment**  
   No recurso da aplicação (Docker Compose) no Coolify: **Settings → Advanced → Preserve Repository During Deployment** (ou equivalente na sua versão). Isso mantém o clone com a pasta `backend/` no disco para o passo que cria o `.env`.

2. **Atualizar o Coolify**  
   Versões recentes corrigem bugs em que o `.env` de runtime não era escrito no `--project-directory` dos artifacts (ex.: issue [#8953](https://github.com/coollabsio/coolify/issues/8953)). Prefira **v4.0.0-beta.469** ou mais novo.

3. **Base Directory do Git**  
   Deve ser a **raiz do repositório** (onde estão `docker-compose.yml` e a pasta `backend/`). Se a base for só `backend/`, o Coolify pode tentar gravar `backend/.env` como se fosse `backend/backend/.env` em relação ao clone e falhar.

4. **Permissões (Coolify como usuário não-root)**  
   Se o servidor não permitir escrita em `/artifacts` ou em pastas da aplicação, veja [coolify#5199](https://github.com/coollabsio/coolify/issues/5199) (permissões / `tee: Permission denied`).

5. **Deploy só do backend (Dockerfile)**  
   Use **Dockerfile** = `backend/Dockerfile` e **Base Directory** vazio (raiz do repo), *não* `backend`, para o caminho `backend/.env` bater com a árvore do Git.

### Login Error / botões não funcionam no jogo
- **Seamless:** API Type = "Seamless Mode", Site EndPoint = URL do backend
- **Transfer:** API Type = "Transfer Mode", agent com saldo
- Confirme que Agent Secret (Seamless) está preenchido e correto
- Se persistir: contate o suporte iGameWin com os logs do backend (igamewin launch-game)
