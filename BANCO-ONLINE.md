# Banco de dados online para desenvolvimento local

Use um PostgreSQL na nuvem (gratuito) quando não tiver Docker/PostgreSQL instalado.

## Coolify: banco no seu servidor

Se o PostgreSQL está no **Coolify**, a URL interna (`uwwscgwkw888o8wks4g0g8ww`) **só funciona dentro do servidor**. Do seu PC, você não consegue conectar.

**Para usar do seu PC:**
1. No Coolify, abra o PostgreSQL
2. Em **Proxy**, marque **"Make it publicly available"**
3. Copie a **URL pública** (IP ou domínio do servidor + porta 5432)
4. Use no `.env`: `DATABASE_URL="postgresql://postgres:SENHA@IP_OU_DOMINIO:5432/postgres"`

Exemplo: se o servidor é `meuservidor.com`, use:
`postgresql://postgres:SENHA@meuservidor.com:5432/postgres`

**Segurança:** Expor o PostgreSQL na internet exige firewall e senha forte. Para dev local, prefira Neon/Supabase (abaixo).

---

## Opção 1: Neon (recomendado)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta (GitHub/Google)
2. Crie um novo projeto
3. No dashboard, clique em **Connect** e copie a **Connection string**
4. Cole no `backend/.env`:
   ```
   DATABASE_URL="postgresql://usuario:senha@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

## Opção 2: Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Project Settings** > **Database** > **Connection string** (URI)
4. Copie e cole no `backend/.env`

## Depois de configurar

```powershell
cd "d:\projetos clientes\73cloneatualzado\a73-clone"
npm run db:push
cd backend
npm run dev
```

Em outro terminal, para o frontend:
```powershell
cd "d:\projetos clientes\73cloneatualzado\a73-clone"
npm run dev
```
