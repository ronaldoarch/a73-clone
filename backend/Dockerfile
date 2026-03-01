FROM node:20-alpine

# Prisma engine precisa de libssl.so.1.1 (Alpine usa OpenSSL 3 por padrão)
RUN apk add --no-cache openssl1.1-compat

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
