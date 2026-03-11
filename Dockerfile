# Build stage
FROM node:20-alpine AS builder

# URL do backend (ex: https://api.seudominio.com) - injete no build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY nginx-no-proxy.conf /etc/nginx/conf.d/default.conf.no-proxy
COPY entrypoint-nginx.sh /entrypoint-nginx.sh
RUN chmod +x /entrypoint-nginx.sh

EXPOSE 80

# BACKEND_URL: URL do backend para proxy /api (ex: https://api.seudominio.com)
ENTRYPOINT ["/entrypoint-nginx.sh"]
