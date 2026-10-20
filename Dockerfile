FROM node:26-alpine AS build

WORKDIR /app

COPY package.json .npmrc ./
RUN npm install --no-audit --no-fund

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_CENTRAL_DOMAIN
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER
ARG VITE_RECAPTCHA_SITE_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_BASE_URL_PROD=$VITE_API_BASE_URL \
    VITE_API_BASE_URL_LOCAL=$VITE_API_BASE_URL \
    VITE_CENTRAL_DOMAIN_PROD=$VITE_CENTRAL_DOMAIN \
    VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY \
    VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER \
    VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY \
    NODE_OPTIONS=--max-old-space-size=4096

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

USER root
RUN apk upgrade --no-cache
USER 101

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1
