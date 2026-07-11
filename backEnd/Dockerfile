# --- ETAPA 1: Compilación de TypeScript ---
FROM node:24-alpine AS builder

WORKDIR /app

# Copiamos los archivos de configuración de dependencias
COPY package*.json ./

# Instalamos todas las dependencias para poder compilar
RUN npm install

# Copiamos todo el código del backend al contenedor
COPY . .

# Compilamos el proyecto (esto generará la carpeta dist/ con JavaScript)
RUN npm run build


# --- ETAPA 2: Servidor de Producción Ligero ---
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiamos package.json para instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Traemos la carpeta dist compilada desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponemos el puerto 3000 que es donde corre Express
EXPOSE 3000

# Ejecutamos el archivo principal
CMD ["node", "dist/server.js"]