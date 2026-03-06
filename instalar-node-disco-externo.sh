#!/bin/bash
# Instala Node.js no disco externo usando nvm (Node Version Manager)
# Tudo fica em /Volumes/midascod/chinesa/.nvm

DISCO="/Volumes/midascod/chinesa"
NVM_DIR="$DISCO/.nvm"

echo "=== Instalando Node.js no disco externo ==="
echo "Local: $NVM_DIR"
echo ""

# 1. Instalar nvm no disco externo
export NVM_DIR="$NVM_DIR"
mkdir -p "$NVM_DIR"

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2. Configurar .zprofile para usar nvm do disco externo
NVM_CONFIG='
# NVM no disco externo
export NVM_DIR="/Volumes/midascod/chinesa/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
'

if ! grep -q "midascod/chinesa/.nvm" ~/.zprofile 2>/dev/null; then
  echo "$NVM_CONFIG" >> ~/.zprofile
  echo "Configuração adicionada ao ~/.zprofile"
fi

# 3. Carregar nvm e instalar Node LTS
source "$NVM_DIR/nvm.sh" 2>/dev/null || true
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm install --lts
  echo ""
  echo "=== Concluído! ==="
  echo "Node: $(node -v)"
  echo "npm: $(npm -v)"
  echo ""
  echo "Para usar em novos terminais, execute:"
  echo "  source ~/.zprofile"
  echo ""
  echo "Ou feche e abra o terminal."
  echo ""
  echo "Depois, no projeto:"
  echo "  cd /Volumes/midascod/chinesa/a73-clone"
  echo "  npm install"
  echo "  npm run dev"
else
  echo "Erro: nvm não foi instalado. Execute manualmente:"
  echo "  export NVM_DIR=\"$NVM_DIR\""
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
fi
