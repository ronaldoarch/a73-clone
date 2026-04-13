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

# Prisma valida o protocolo da DATABASE_URL com o provider do schema (MySQL em produção)
ENV DATABASE_URL="mysql://build:build@127.0.0.1:3306/prisma_build_placeholder"

# ── 1. Instalar dependências do backend ─────────────────────
# prisma em dependencies: npm ci --omit=dev inclui CLI (generate + migrate deploy no entrypoint)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ── 2. Prisma ────────────────────────────────────────────────
COPY backend/prisma ./prisma/
RUN npx prisma generate

# ── 2b. Vue (Vite) → /frontend/dist ────────────────────────────
# server.js só serve o PWA novo se existir ../frontend/dist relativo a /app (= /frontend/dist).
# Sem este passo, produção fica só no site_baixado (clone antigo).
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build \
  && mkdir -p /frontend \
  && rm -rf /frontend/dist \
  && mv dist /frontend/dist

WORKDIR /app

# ── 3. Código do backend ─────────────────────────────────────
COPY backend/ ./

# Assets estáticos do clone (evita download+tar de ~195MB na build — mais rápido e estável no Coolify).
# O RUN abaixo só baixa o .tar.gz se este diretório não existir ou tiver poucos ficheiros.
COPY site_baixado/ /app/site_baixado/

# ── 4. Frontend estático (site_baixado) ──────────────────────
# Repositório privado: GitHub devolve 404 sem autenticação. Em Coolify defina
# GITHUB_TOKEN (PAT com scope repo / leitura de releases) como Build Argument.
# Repositório público: deixe GITHUB_TOKEN vazio — usa URL directa.
ARG SITE_BAIXADO_URL=https://github.com/ronaldoarch/a73-clone/releases/download/v1.0-site-baixado/site_baixado.tar.gz
# ID do asset "site_baixado.tar.gz" na release v1.0-site-baixado (API: .../releases/assets/<id>)
ARG SITE_BAIXADO_ASSET_ID=384144780
ARG GITHUB_REPO=ronaldoarch/a73-clone
ARG GITHUB_TOKEN=
ARG SKIP_SITE_DOWNLOAD=0

RUN if [ -d /app/site_baixado ] && [ "$(ls -A /app/site_baixado 2>/dev/null | wc -l)" -gt 5 ]; then \
        echo "site_baixado already present, skipping download"; \
    elif [ "${SKIP_SITE_DOWNLOAD}" = "1" ]; then \
        echo "SKIP_SITE_DOWNLOAD=1, skipping"; \
        mkdir -p /app/site_baixado; \
    else \
        echo "Downloading site_baixado from GitHub Release..."; \
        DOWNLOAD_OK=0; \
        if [ -n "${GITHUB_TOKEN}" ]; then \
            curl -fSL --stderr - \
                -H "Accept: application/octet-stream" \
                -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                -o /tmp/site_baixado.tar.gz \
                "https://api.github.com/repos/${GITHUB_REPO}/releases/assets/${SITE_BAIXADO_ASSET_ID}" \
            && DOWNLOAD_OK=1; \
        else \
            curl -fSL --stderr - -A "A73-Dockerfile/1.0" "${SITE_BAIXADO_URL}" \
                -o /tmp/site_baixado.tar.gz \
            && DOWNLOAD_OK=1; \
        fi; \
        if [ "$DOWNLOAD_OK" = "1" ]; then \
            tar -xzf /tmp/site_baixado.tar.gz -C /app && \
            rm -f /tmp/site_baixado.tar.gz && \
            echo "Download concluído."; \
        else \
            echo "AVISO: Download do site_baixado falhou. Criando diretório vazio."; \
            mkdir -p /app/site_baixado; \
        fi; \
    fi

# ── 5. Admin customizado (sobrescreve o do site_baixado baixado) ─
COPY site_baixado/admin/ /app/site_baixado/admin/

# ── 6. Finalização ────────────────────────────────────────────
RUN mkdir -p /app/uploads && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENV SERVE_SITE_BAIXADO=1
# O server.js usa: path.join(__dirname, '..', 'site_baixado')
# __dirname = /app → ../site_baixado = /site_baixado
# Por isso usamos SITE_BAIXADO_DIR para apontar para /app/site_baixado
ENV SITE_BAIXADO_DIR=/app/site_baixado

ENTRYPOINT ["./entrypoint.sh"]
