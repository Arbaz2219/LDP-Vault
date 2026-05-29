# Build stage
FROM node:20-slim as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Install only essential production dependencies
RUN apt-get update && apt-get install -y openssl libpq-dev && rm -rf /var/lib/apt/lists/*

COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/prisma ./prisma

EXPOSE 5000

# Pre-install only Chromium to save space and memory
RUN npx playwright install chromium --with-deps

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]


