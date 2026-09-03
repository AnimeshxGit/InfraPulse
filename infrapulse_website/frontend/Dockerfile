# =======================================================
# Multi-stage Dockerfile to build and serve React Frontend
# =======================================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build argument for API URL (can be empty for same-origin proxy)
ARG VITE_API_URL=""
ARG VITE_BASE_PATH="/"
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build

# Production web server
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
