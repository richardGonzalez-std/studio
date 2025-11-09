# === ETAPA 1: Dependencias ===
# Usamos una imagen base de Node.js para instalar las dependencias.
# Esto nos permite cachear las dependencias y acelerar compilaciones futuras.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# === ETAPA 2: Compilación (Builder) ===
# En esta etapa, compilamos la aplicación de Next.js.
FROM node:20-alpine AS builder
WORKDIR /app
# Copiamos las dependencias de la etapa anterior.
COPY --from=deps /app/node_modules ./node_modules
# Copiamos el resto del código fuente.
COPY . .
# Ejecutamos el script de compilación de Next.js para producción.
RUN npm run build

# === ETAPA 3: Ejecución (Runner) ===
# Esta es la etapa final que creará la imagen que se ejecutará en producción.
# Usamos una imagen ligera de Node.js.
FROM node:20-alpine AS runner
WORKDIR /app

# Copiamos solo los artefactos necesarios para producción desde la etapa de compilación.
# Esto incluye la carpeta .next (el resultado de la compilación) y las dependencias de producción.
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Exponemos el puerto en el que se ejecutará la aplicación (Next.js por defecto usa el 3000).
EXPOSE 3000

# El comando para iniciar la aplicación en modo de producción.
CMD ["npm", "start"]
