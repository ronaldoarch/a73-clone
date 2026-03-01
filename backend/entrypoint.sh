#!/bin/sh
set -e

# Aguarda PostgreSQL e executa migrações (até 60s)
echo "Aguardando PostgreSQL e aplicando migrações..."
for i in $(seq 1 60); do
  if npx prisma migrate deploy; then
    echo "Migrações aplicadas com sucesso."
    break
  fi
  if [ $i -eq 60 ]; then
    echo "Timeout. Tentando db push como fallback..."
    npx prisma db push --accept-data-loss || true
  else
    sleep 1
  fi
done

echo "Iniciando servidor..."
exec node server.js
