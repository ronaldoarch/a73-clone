#!/bin/sh
set -e

# Migrações Prisma - rodam automaticamente em todo deploy (Coolify, Docker, etc.)
echo "[entrypoint] Aplicando migrações Prisma..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if npx prisma migrate deploy; then
    echo "[entrypoint] Migrações aplicadas com sucesso."
    break
  fi
  if [ "$i" -eq 10 ]; then
    echo "[entrypoint] migrate deploy falhou após 10 tentativas. Tentando db push..."
    npx prisma db push --accept-data-loss || true
  else
    echo "[entrypoint] Aguardando PostgreSQL... tentativa $i/10"
    sleep 2
  fi
done

echo "[entrypoint] Iniciando servidor..."
exec node server.js
