#!/bin/sh
set -e
# BACKEND_URL: URL do backend para proxy /api e /uploads (evita CORS)
# Ex: https://jkcgkgks00ggggo4g0kow8ws.agenciamidas.com
HTML=/usr/share/nginx/html
if [ -n "$BACKEND_URL" ]; then
  export BACKEND_URL=$(echo "$BACKEND_URL" | sed 's:/$::')
  # Extrai host do BACKEND_URL para o header Host (ex: jkcgkgks00ggggo4g0kow8ws.agenciamidas.com)
  export BACKEND_HOST="${BACKEND_HOST:-$(echo "$BACKEND_URL" | sed 's|^https\?://||' | sed 's|/.*||')}"
  envsubst '${BACKEND_URL} ${BACKEND_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
  # Força frontend a usar /api (proxy) mesmo se VITE_API_URL foi definido no build
  echo "window.__API_BASE__='';" > "$HTML/app-config.js"
else
  cp /etc/nginx/conf.d/default.conf.no-proxy /etc/nginx/conf.d/default.conf
  echo "// Proxy desativado" > "$HTML/app-config.js"
fi
exec nginx -g "daemon off;"
