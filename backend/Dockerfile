# ==============================================================================
# VetCare API - Dockerfile Multi-Stage para Google Cloud Run
# ==============================================================================

# --- Etapa 1: Compilación de TypeScript ---
FROM node:20-slim AS builder
WORKDIR /app

# Copiar manifiestos e instalar todas las dependencias para compilar
COPY package*.json tsconfig.json ./
RUN npm ci

# Copiar código fuente y compilar a JavaScript (dist/)
COPY src/ ./src/
RUN npm run build

# --- Etapa 2: Imagen de Producción Reducida y Segura ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Instalar únicamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el build compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Ejecutar como usuario sin privilegios 'node' para mayor seguridad
USER node

# Puerto estándar de Cloud Run
EXPOSE 8080

# Arranque del servidor Express
CMD ["node", "dist/app.js"]
