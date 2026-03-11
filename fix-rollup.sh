#!/bin/bash
# Corrige erro @rollup/rollup-darwin-arm64 e reinstala dependências
set -e
cd "$(dirname "$0")"

echo "Removendo node_modules e caches..."
rm -rf node_modules
rm -rf a73-clone/node_modules
rm -rf a73-clone/node_modules/.vite
rm -f package-lock.json
rm -f a73-clone/package-lock.json

echo "Reinstalando com pnpm..."
cd a73-clone
pnpm install

echo "Pronto! Rode: pnpm run dev"
