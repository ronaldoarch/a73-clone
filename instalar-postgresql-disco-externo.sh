#!/bin/bash
# PostgreSQL no disco externo - dados em /Volumes/midascod/chinesa/postgresql-data
# Binários via Homebrew (precisa estar instalado no Mac)

DISCO="/Volumes/midascod/chinesa"
PG_DATA="$DISCO/postgresql-data"
PG_LOG="$DISCO/postgresql.log"

echo "=== PostgreSQL no disco externo ==="
echo "Dados em: $PG_DATA"
echo ""

# 1. Verificar Homebrew
if ! command -v brew &>/dev/null; then
  echo "Homebrew não encontrado. Instale primeiro:"
  echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  exit 1
fi

# 2. Instalar PostgreSQL
if ! command -v initdb &>/dev/null; then
  echo "Instalando PostgreSQL..."
  brew install postgresql@16 2>/dev/null || brew install postgresql
fi

# Encontrar initdb e pg_ctl
INITDB=$(which initdb 2>/dev/null || find /opt/homebrew /usr/local -name initdb 2>/dev/null | head -1)
PG_CTL=$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)

if [ -z "$INITDB" ] || [ -z "$PG_CTL" ]; then
  echo "Erro: initdb ou pg_ctl não encontrados. PostgreSQL instalado?"
  exit 1
fi

# Porta (5433 para evitar conflito com PostgreSQL do sistema)
PG_PORT=5433

# 3. Inicializar cluster (só se não existir)
if [ ! -f "$PG_DATA/PG_VERSION" ]; then
  # Em discos externos, macOS cria arquivos ._ que quebram o initdb.
  # Solução: inicializar em /tmp (disco interno) e depois mover.
  PG_TMP="/tmp/pg-a73-init-$$"
  rm -rf "$PG_TMP" "$PG_DATA"
  echo "Inicializando banco em /tmp (evita erro ._ do macOS)..."
  "$INITDB" -D "$PG_TMP" -U "$USER"
  echo "port = $PG_PORT" >> "$PG_TMP/postgresql.conf"
  "$PG_CTL" -D "$PG_TMP" -l "$PG_TMP/startup.log" -o "-p $PG_PORT" start
  sleep 2
  "$PG_CTL" -D "$PG_TMP" stop
  sleep 1
  echo "Movendo dados para o disco externo..."
  mv "$PG_TMP" "$PG_DATA"
  rm -rf "/tmp/pg-a73-init-"* 2>/dev/null || true
  echo "Cluster criado (porta $PG_PORT)."
else
  # Garantir que a porta está configurada
  grep -q "^port = " "$PG_DATA/postgresql.conf" 2>/dev/null || echo "port = $PG_PORT" >> "$PG_DATA/postgresql.conf"
  echo "Cluster já existe em $PG_DATA"
fi

# 5. Iniciar PostgreSQL
echo "Iniciando PostgreSQL na porta $PG_PORT..."
"$PG_CTL" -D "$PG_DATA" -l "$PG_LOG" -o "-p $PG_PORT" start 2>/dev/null || true
sleep 2

# 6. Criar usuário e banco (se não existirem)
if ! "$PG_CTL" -D "$PG_DATA" status &>/dev/null; then
  echo "Tentando iniciar novamente..."
  "$PG_CTL" -D "$PG_DATA" -l "$PG_LOG" -o "-p $PG_PORT" start
  sleep 3
fi

# Usar psql do mesmo pacote
PSQL=$(which psql 2>/dev/null || find /opt/homebrew /usr/local -name psql -path '*/bin/*' 2>/dev/null | head -1)
if [ -n "$PSQL" ]; then
  echo "Criando usuário a73 e banco a73db..."
  "$PSQL" -d postgres -h localhost -p $PG_PORT -tAc "SELECT 1 FROM pg_roles WHERE rolname='a73'" 2>/dev/null | grep -q 1 || \
    "$PSQL" -d postgres -h localhost -p $PG_PORT -c "CREATE USER a73 WITH PASSWORD 'a73' CREATEDB;" 2>/dev/null
  "$PSQL" -d postgres -h localhost -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='a73db'" 2>/dev/null | grep -q 1 || \
    "$PSQL" -d postgres -h localhost -p $PG_PORT -c "CREATE DATABASE a73db OWNER a73;" 2>/dev/null
  echo "Usuário e banco criados (ou já existiam)."
fi

# 7. Scripts de controle
cat > "$DISCO/postgresql-start.sh" << SCRIPT
#!/bin/bash
PG_DATA="$PG_DATA"
PG_LOG="$PG_LOG"
PG_PORT=$PG_PORT
PG_CTL=\$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)
\$PG_CTL -D "\$PG_DATA" -l "\$PG_LOG" -o "-p \$PG_PORT" start
echo "PostgreSQL iniciado na porta \$PG_PORT. Dados em \$PG_DATA"
SCRIPT

cat > "$DISCO/postgresql-stop.sh" << SCRIPT
#!/bin/bash
PG_DATA="$PG_DATA"
PG_CTL=\$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)
\$PG_CTL -D "\$PG_DATA" stop
echo "PostgreSQL parado."
SCRIPT

chmod +x "$DISCO/postgresql-start.sh" "$DISCO/postgresql-stop.sh"

echo ""
echo "=== Concluído! ==="
echo ""
echo "PostgreSQL rodando na porta $PG_PORT com dados em: $PG_DATA"
echo ""
echo "Comandos úteis:"
echo "  Iniciar:  $DISCO/postgresql-start.sh"
echo "  Parar:    $DISCO/postgresql-stop.sh"
echo ""
echo "Backend (.env já configurado):"
echo "  cd $DISCO/backend"
echo "  npx prisma db push"
echo "  npm run dev"
echo ""
echo "IMPORTANTE: Desconecte o disco só após rodar postgresql-stop.sh"
echo ""

# Atualizar .env do backend
ENV_FILE="$DISCO/backend/.env"
if [ -f "$ENV_FILE" ]; then
  if grep -q "localhost:5432" "$ENV_FILE"; then
    sed "s|localhost:5432|localhost:$PG_PORT|g" "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"
    echo "backend/.env atualizado para porta $PG_PORT"
  fi
else
  echo "Crie backend/.env com: DATABASE_URL=\"postgresql://a73:a73@localhost:$PG_PORT/a73db\""
fi
