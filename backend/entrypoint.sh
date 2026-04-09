#!/bin/sh
set -e

SCHEMA=./prisma/schema.prisma
RECOVER=./prisma/mysql-recover-p3009.sql

recover_p3009() {
  echo "[entrypoint] P3009: a limpar tabelas e _prisma_migrations (só use com base vazia ou descartável)."
  npx prisma db execute --file "$RECOVER" --schema "$SCHEMA"
}

i=1
recovered=0
while [ "$i" -le 30 ]; do
  set +e
  npx prisma migrate deploy > /tmp/md.log 2>&1
  code=$?
  set -e
  cat /tmp/md.log

  if [ "$code" -eq 0 ]; then
    echo "[entrypoint] Migrações aplicadas com sucesso."
    exec node server.js
  fi

  if grep -q P3009 /tmp/md.log && [ "$recovered" -eq 0 ]; then
    recovered=1
    recover_p3009
    continue
  fi

  echo "[entrypoint] migrate deploy falhou (tentativa $i/30). A aguardar a base de dados..."
  sleep 2
  i=$((i + 1))
done

echo "[entrypoint] FATAL: prisma migrate deploy falhou após 30 tentativas."
exit 1
