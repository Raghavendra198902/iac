FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies for cloud CLIs
RUN apk add --no-cache python3 py3-pip curl bash

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install minimal dependencies for orchestration (skip cloud CLIs for faster build)
RUN apk add --no-cache curl bash

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3005

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
