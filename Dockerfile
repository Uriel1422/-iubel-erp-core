# Dockerfile — Motor Unificado Iubel ERP Sovereign Edition 🚀🐳🏗️

# ETAPA 1: Construcción (Compilando la Interfaz Glassmorphism)
FROM node:20-slim AS builder
WORKDIR /app

# Instalar dependencias para la construcción
COPY package*.json ./
RUN npm install

# Copiar el código fuente y construir el frontend
COPY . .
RUN npm run build

# ETAPA 2: Producción (Ejecutando el Motor Financiero)
FROM node:20-slim
WORKDIR /app

# Instalar solo dependencias de ejecución para ligereza y seguridad
COPY package*.json ./
RUN npm install --production

# Copiar la API y la interfaz compilada desde la etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/db ./db
COPY --from=builder /app/server.js ./server.js

# Configuración de Entorno
ENV NODE_ENV=production
EXPOSE 3001

# Seguridad: No operar como root
USER node

# Comando de Inicio Maestro
CMD ["node", "server.js"]
