# Dockerfile — Motor Unificado Iubel ERP Sovereign Edition 🚀🐳🏗️

# ETAPA 1: Construcción
FROM node:20-slim AS builder
WORKDIR /app

# Instalar dependencias para la construcción
COPY --chown=node:node package*.json ./
RUN npm install

# Copiar el código fuente y construir el frontend
COPY --chown=node:node . .
RUN npm run build

# ETAPA 2: Producción
FROM node:20-slim
WORKDIR /app

# Instalar solo dependencias de ejecución
COPY --chown=node:node package*.json ./
RUN npm install --production

# Copiar la API y la interfaz compilada asegurando permisos
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server ./server
COPY --chown=node:node --from=builder /app/db ./db
COPY --chown=node:node --from=builder /app/server.js ./server.js

# Configuración de Entorno
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Seguridad: Operar como usuario node con permisos correctos
USER node

# Comando de Inicio Directo
CMD ["node", "server.js"]
