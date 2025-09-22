# --- Para el Frontend de React ---
FROM node:18-alpine AS builder
WORKDIR /app

COPY cliente/package*.json ./
RUN npm install

COPY cliente/ ./
RUN npm run build

# --- P el Servidor de Node.js ---
FROM node:18-alpine
WORKDIR /app

COPY servidor/package*.json ./
RUN npm install --omit=dev

COPY servidor/ ./
COPY --from=builder /app/build ./public
EXPOSE 8080
CMD [ "node", "server.js" ]