# Debian Bookworm (OpenSSL 3.x) - compatível com Prisma
FROM node:20-bookworm-slim

# OpenSSL e libs necessárias para Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Cria pasta de uploads e torna entrypoint executável
RUN mkdir -p uploads && chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
