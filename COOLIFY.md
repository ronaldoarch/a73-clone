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
