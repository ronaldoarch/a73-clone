# Debian tem melhor compatibilidade com Prisma que Alpine
FROM node:20-slim

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
