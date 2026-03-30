# ──────────────────────────────────────────────────────────────
# A73 Cassino — build único (Vue SPA compilado + backend Express)
# Build context: root do repositório
# Base dir Coolify: atualizado/
# ──────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim

# Deps sistema (Prisma precisa de OpenSSL)
RUN apt-get update && \
    apt-get install -y openssl ca-certificates curl tar && \
    rm -rf /var/lib/apt/lists/*

# ── 1. Build Vue SPA (frontend com admin real) ───────────────
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build
# Output: /build/dist/

# ── 2. Instalar dependências do backend ─────────────────────
WORKDIR /app

COPY atualizado/backend/package*.json ./
RUN npm ci --omit=dev

# ── 3. Prisma ────────────────────────────────────────────────
COPY atualizado/backend/prisma ./prisma/
RUN npx prisma generate

# ── 4. Código do backend ─────────────────────────────────────
COPY atualizado/backend/ ./

# ── 5. Frontend compilado ────────────────────────────────────
RUN cp -r /build/dist /app/frontend

# ── 6. Finalização ────────────────────────────────────────────
RUN mkdir -p /app/uploads && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENV SERVE_SITE_BAIXADO=1
ENV SITE_BAIXADO_DIR=/app/frontend

ENTRYPOINT ["./entrypoint.sh"]
