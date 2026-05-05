# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/prisma ./prisma

EXPOSE 5000

CMD ["npm", "run", "start"]
