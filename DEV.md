# Desenvolvimento local

## Pré-requisitos

- Node.js 20+
- Docker (para PostgreSQL)
- npm

**Importante:** execute os comandos dentro da pasta `a73-clone`:
```bash
cd a73-clone
```

## 1. Banco PostgreSQL local

```bash
npm run postgres:up
```

Para parar: `npm run postgres:down`

Credenciais: `a73` / `a73` / banco `a73db`

## 2. Configurar backend

```bash
cp backend/.env.example backend/.env
```

O `.env` já vem com `DATABASE_URL` para localhost.

## 3. Criar tabelas no banco

```bash
npm run db:push
```

## 4. Iniciar backend e frontend

**Terminal 1** — Backend (porta 3000):
```bash
cd backend && npm run dev
```

**Terminal 2** — Frontend (porta 3001):
```bash
npm run dev
```

Acesse: **http://localhost:3001**
