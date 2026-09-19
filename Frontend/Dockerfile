# ---------- Stage 1: build the React app ----------
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Full install: Vite and the build tools are devDependencies
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time config. Empty means the app calls relative URLs (/api/...),
# which Nginx forwards to the backend container.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Stage 2: serve the static files ----------
FROM nginx:1.30-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80


