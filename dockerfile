# =========================
# Stage 1: Build frontend
# =========================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend/ ./
RUN npm run build


# =========================
# Stage 2: Run backend
# =========================
FROM node:20-alpine AS backend

WORKDIR /app

COPY Backend/package*.json ./
RUN npm install --omit=dev

COPY Backend/ ./

COPY --from=frontend-builder /app/dist ./public

EXPOSE 5000

CMD ["node", "server.js"]