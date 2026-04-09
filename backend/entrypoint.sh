#!/bin/sh
set -e

echo "[entrypoint] Aplicando migrações Prisma (MySQL)..."
ok=0
i=1
while [ "$i" -le 30 ]; do
  if npx prisma migrate deploy; then
    echo "[entrypoint] Migrações aplicadas com sucesso."
    ok=1
    break
  fi
  echo "[entrypoint] migrate deploy falhou (tentativa $i/30). A aguardar a base de dados..."
  sleep 2
  i=$((i + 1))
done

if [ "$ok" -ne 1 ]; then
  echo "[entrypoint] FATAL: prisma migrate deploy falhou após 30 tentativas. O servidor não vai arrancar."
  echo "[entrypoint] Corrija DATABASE_URL, execute o SQL de recuperação (prisma/mysql-recover-p3009.sql) se precisar, e redeploy."
  exit 1
fi

echo "[entrypoint] Iniciando servidor..."
exec node server.js
