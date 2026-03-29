# ──────────────────────────────────────────────────────────────
# A73 Cassino — build único (backend Express + frontend estático)
# Base dir Coolify: atualizado/
# ──────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim

# Deps sistema (Prisma precisa de OpenSSL)
RUN apt-get update && \
    apt-get install -y openssl ca-certificates curl tar && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── 1. Instalar dependências do backend ─────────────────────
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ── 2. Prisma ────────────────────────────────────────────────
COPY backend/prisma ./prisma/
RUN npx prisma generate

# ── 3. Código do backend ─────────────────────────────────────
COPY backend/ ./

# ── 4. Frontend estático (site_baixado) ──────────────────────
# Se já existir na imagem base (build local), usa directo.
# Em produção (Coolify), descarrega da GitHub Release — sem blobs grandes no git.
ARG SITE_BAIXADO_URL=https://github.com/ronaldoarch/a73-clone/releases/download/v1.0-site-baixado/site_baixado.tar.gz
ARG SKIP_SITE_DOWNLOAD=0

RUN set -e; \
    if [ -d /app/site_baixado ] && [ "$(ls -A /app/site_baixado 2>/dev/null | wc -l)" -gt 5 ]; then \
        echo "site_baixado already present, skipping download"; \
    elif [ "${SKIP_SITE_DOWNLOAD}" = "1" ]; then \
        echo "SKIP_SITE_DOWNLOAD=1, skipping"; \
        mkdir -p /app/site_baixado; \
    else \
        echo "Downloading site_baixado from GitHub Release..."; \
        curl -fL "${SITE_BAIXADO_URL}" -o /tmp/site_baixado.tar.gz && \
        tar -xzf /tmp/site_baixado.tar.gz -C /app && \
        rm /tmp/site_baixado.tar.gz && \
        echo "Download concluído."; \
    fi

# ── 5. Finalização ────────────────────────────────────────────
RUN mkdir -p /app/uploads && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENV SERVE_SITE_BAIXADO=1
# O server.js usa: path.join(__dirname, '..', 'site_baixado')
# __dirname = /app → ../site_baixado = /site_baixado
# Por isso usamos SITE_BAIXADO_DIR para apontar para /app/site_baixado
ENV SITE_BAIXADO_DIR=/app/site_baixado

ENTRYPOINT ["./entrypoint.sh"]
