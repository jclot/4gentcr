# Usamos una imagen slim para ahorrar RAM
FROM node:20-slim

# Instalamos dependencias del sistema necesarias para el túnel
RUN apt-get update && apt-get install -y git curl jq && \
    npm install -g pm2 @expo/ngrok && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos solo los archivos de dependencias primero (cache de Docker)
COPY package*.json ./
RUN npm install --only=production

# Copiamos el resto del código
COPY . .

# --- VARIABLES DE ENTORNO ---
# Aquí es donde pegas el link de tu backend en Render
ENV EXPO_PUBLIC_API_URL=https://fourgentcr.onrender.com
ENV NODE_OPTIONS="--max-old-space-size=450"

# Exponemos el puerto de Metro
EXPOSE 8081

# Comando de arranque con el túnel
CMD ["npx", "expo", "start", "--tunnel"]
