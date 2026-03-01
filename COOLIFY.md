# Deploy no Coolify com PostgreSQL

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

### Frontend e backend na mesma aplicação, URLs diferentes
- Frontend: ex. `app.seudominio.com`
- Backend: ex. `api.seudominio.com`
- No Coolify, na aplicação do **frontend**, adicione variável de **build**:
  - `VITE_API_URL` = URL do backend (ex: `https://api.seudominio.com`)
- O frontend usará essa URL para todas as chamadas `/api` e `/uploads`

### CORS (frontend e backend em subdomínios diferentes)
- O backend já envia headers CORS (`Access-Control-Allow-Origin` etc.)
- Se ainda houver erro de CORS, no Coolify verifique se o proxy do backend não está removendo headers
- Ou adicione no proxy do backend: `Access-Control-Allow-Origin: *` (ou o domínio do frontend)

## Variáveis

### Backend
| Variável               | Descrição                                      |
|------------------------|------------------------------------------------|
| DATABASE_URL           | URL do PostgreSQL (Coolify fornece)            |
| JWT_SECRET             | Segredo para tokens JWT                        |
| PORT                   | Porta (padrão 3000)                             |
| IGAMEWIN_AGENT_CODE    | Código do agent (Seamless)                      |
| IGAMEWIN_AGENT_SECRET  | Segredo do agent (Seamless, diferente do token)|

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
- Configure na iGameWin a URL: `https://api.seudominio.com/gold_api`
- Variáveis obrigatórias para Seamless:
  - `IGAMEWIN_AGENT_CODE`: código do agent (ex: Midaslabs)
  - `IGAMEWIN_AGENT_SECRET`: segredo do agent (diferente do agent_token)
- O `user_code` deve corresponder ao `account` do usuário no sistema
