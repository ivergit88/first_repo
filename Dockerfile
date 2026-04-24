# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/.data
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/.data && chown -R app:app /app
COPY --from=deps --chown=app:app /app/package*.json ./
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --chown=app:app src ./src
COPY --chown=app:app public ./public
USER app
EXPOSE 3000
VOLUME ["/app/.data"]
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
