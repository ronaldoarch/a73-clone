#!/bin/bash
# PostgreSQL no disco INTERNO - evita erro ._ do macOS em discos externos
# Dados em ~/postgresql-a73-data (disco interno)

PG_DATA="$HOME/postgresql-a73-data"
PG_LOG="$HOME/postgresql-a73.log"
DISCO="/Volumes/midascod/chinesa"
PG_PORT=5433

echo "=== PostgreSQL no disco interno ==="
echo "Dados em: $PG_DATA"
echo "(Evita erro ._ em discos externos)"
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

INITDB=$(which initdb 2>/dev/null || find /opt/homebrew /usr/local -name initdb 2>/dev/null | head -1)
PG_CTL=$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)

if [ -z "$INITDB" ] || [ -z "$PG_CTL" ]; then
  echo "Erro: initdb ou pg_ctl não encontrados."
  exit 1
fi

# 3. Parar PostgreSQL antigo no disco externo (se existir)
if [ -f "$DISCO/postgresql-data/PG_VERSION" ]; then
  echo "Parando PostgreSQL antigo (disco externo)..."
  $PG_CTL -D "$DISCO/postgresql-data" stop 2>/dev/null || true
  sleep 2
fi

# 4. Inicializar no disco interno
if [ ! -f "$PG_DATA/PG_VERSION" ]; then
  echo "Inicializando banco em $PG_DATA..."
  rm -rf "$PG_DATA"
  "$INITDB" -D "$PG_DATA" -U "$USER"
  echo "port = $PG_PORT" >> "$PG_DATA/postgresql.conf"
  echo "Cluster criado."
else
  echo "Cluster já existe em $PG_DATA"
fi

# 5. Iniciar
echo "Iniciando PostgreSQL..."
$PG_CTL -D "$PG_DATA" -l "$PG_LOG" -o "-p $PG_PORT" start 2>/dev/null || true
sleep 2

# 6. Criar usuário e banco
PSQL=$(which psql 2>/dev/null || find /opt/homebrew /usr/local -name psql -path '*/bin/*' 2>/dev/null | head -1)
if [ -n "$PSQL" ]; then
  echo "Criando usuário a73 e banco a73db..."
  $PSQL -d postgres -h localhost -p $PG_PORT -tAc "SELECT 1 FROM pg_roles WHERE rolname='a73'" 2>/dev/null | grep -q 1 || \
    $PSQL -d postgres -h localhost -p $PG_PORT -c "CREATE USER a73 WITH PASSWORD 'a73' CREATEDB;" 2>/dev/null
  $PSQL -d postgres -h localhost -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='a73db'" 2>/dev/null | grep -q 1 || \
    $PSQL -d postgres -h localhost -p $PG_PORT -c "CREATE DATABASE a73db OWNER a73;" 2>/dev/null
  echo "Pronto."
fi

# 7. Scripts de controle no disco do projeto
cat > "$DISCO/postgresql-start.sh" << SCRIPT
#!/bin/bash
PG_DATA="$PG_DATA"
PG_LOG="$PG_LOG"
PG_CTL=\$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)
if \$PG_CTL -D "\$PG_DATA" status 2>/dev/null | grep -q "running"; then
  echo "PostgreSQL já está rodando na porta $PG_PORT."
else
  \$PG_CTL -D "\$PG_DATA" -l "\$PG_LOG" -o "-p $PG_PORT" start
  echo "PostgreSQL iniciado na porta $PG_PORT."
fi
SCRIPT

cat > "$DISCO/postgresql-stop.sh" << SCRIPT
#!/bin/bash
PG_DATA="$PG_DATA"
PG_CTL=\$(which pg_ctl 2>/dev/null || find /opt/homebrew /usr/local -name pg_ctl 2>/dev/null | head -1)
if \$PG_CTL -D "\$PG_DATA" status 2>/dev/null | grep -q "running"; then
  \$PG_CTL -D "\$PG_DATA" stop
  echo "PostgreSQL parado."
else
  echo "PostgreSQL não está rodando."
fi
SCRIPT

chmod +x "$DISCO/postgresql-start.sh" "$DISCO/postgresql-stop.sh"

# 8. Atualizar .env
ENV_FILE="$DISCO/backend/.env"
if [ -f "$ENV_FILE" ]; then
  sed "s|localhost:[0-9]*|localhost:$PG_PORT|g" "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"
fi

echo ""
echo "=== Concluído! ==="
echo ""
echo "PostgreSQL rodando na porta $PG_PORT (dados em disco interno)"
echo ""
echo "Próximos passos:"
echo "  cd $DISCO/backend"
echo "  npx prisma db push"
echo "  npm run dev"
echo ""
