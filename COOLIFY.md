# Deploy no Coolify com PostgreSQL

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

### Se frontend e backend forem apps separados
- Frontend: seu domínio principal
- Backend: subdomínio (ex: `api.seudominio.com`) ou path
- Ajuste o frontend para usar a URL do backend nas chamadas de API (variável `VITE_API_URL`)

## Variáveis do Backend

| Variável      | Descrição                          |
|---------------|------------------------------------|
| DATABASE_URL  | URL do PostgreSQL (Coolify fornece)|
| JWT_SECRET    | Segredo para tokens JWT           |
| PORT          | Porta (padrão 3000)               |
