# Dukaan backend (Node.js/Express) — instrumented with /metrics for Prometheus
FROM node:20-alpine AS base
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server.js"]
