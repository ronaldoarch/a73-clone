# Setup local do A73 Clone
# Requisito: Docker Desktop instalado e rodando

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host "=== A73 Clone - Setup Local ===" -ForegroundColor Cyan

# 1. Subir PostgreSQL
Write-Host "`n[1/4] Subindo PostgreSQL (Docker)..." -ForegroundColor Yellow
docker compose -f "$projectRoot\docker-compose.dev.yml" up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Docker nao encontrado ou nao esta rodando." -ForegroundColor Red
    Write-Host "Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "Apos instalar, reinicie o computador e execute este script novamente." -ForegroundColor Yellow
    exit 1
}

# Aguardar PostgreSQL iniciar
Write-Host "Aguardando PostgreSQL iniciar (10s)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 2. Criar tabelas no banco
Write-Host "`n[2/4] Criando tabelas (Prisma db push)..." -ForegroundColor Yellow
Set-Location $projectRoot
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao criar tabelas." -ForegroundColor Red
    exit 1
}

# 3. Instalar dependencias do backend (se necessario)
Write-Host "`n[3/4] Verificando dependencias do backend..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"
npm install

# 4. Iniciar backend
Write-Host "`n[4/4] Iniciando backend..." -ForegroundColor Yellow
Write-Host "Backend rodara em http://localhost:3000" -ForegroundColor Green
Write-Host "Em outro terminal, execute 'npm run dev' na raiz para o frontend (porta 3001)" -ForegroundColor Green
Write-Host ""
npm run dev
