#!/bin/sh
set -e
# BACKEND_URL: URL do backend para proxy /api e /uploads (evita CORS)
# Ex: https://jkcgkgks00ggggo4g0kow8ws.agenciamidas.com
if [ -n "$BACKEND_URL" ]; then
  export BACKEND_URL=$(echo "$BACKEND_URL" | sed 's:/$::')
  envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
else
  cp /etc/nginx/conf.d/default.conf.no-proxy /etc/nginx/conf.d/default.conf
fi
exec nginx -g "daemon off;"
