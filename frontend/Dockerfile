# --- ETAPA 1: Construcción/Compilación con Astro ---
FROM node:24-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias del frontend
COPY package*.json ./

# Instalamos dependencias limpias
RUN npm install

# Copiamos todo el código del frontend
COPY . .

# Compilamos el proyecto de Astro (Esto generará la carpeta 'dist')
RUN npm run build


# --- ETAPA 2: Servidor Web de Producción con Nginx ---
FROM nginx:alpine AS runner

# Copiamos los archivos estáticos que generó Astro hacia la carpeta raíz de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 (el puerto por defecto de Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]