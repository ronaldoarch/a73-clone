#!/bin/bash
# Clona o frontend da porta 3000 (site_baixado) para frontend-clone
# Execute: ./clonar-frontend.sh

set -e
BASE="$(cd "$(dirname "$0")" && pwd)"
ORIG="$BASE/site_baixado"
DEST="$BASE/frontend-clone"

echo "Clonando frontend de site_baixado para frontend-clone..."
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$ORIG"/* "$DEST/" 2>/dev/null || true
cp -R "$ORIG"/. "$DEST/" 2>/dev/null || true
# Remover arquivos de recurso do macOS
find "$DEST" -name "._*" -delete 2>/dev/null || true
echo "Pronto! O servidor na porta 3000 usará frontend-clone."
echo "Edite os arquivos em frontend-clone/ e reinicie o servidor para ver as mudanças."
