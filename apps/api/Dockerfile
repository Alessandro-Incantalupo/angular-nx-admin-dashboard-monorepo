# Stage 1: Dependencies
FROM oven/bun:1.2.12-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN bun install

# Accept Nx Cloud Token for caching
ARG NX_CLOUD_ACCESS_TOKEN
ENV NX_CLOUD_ACCESS_TOKEN=$NX_CLOUD_ACCESS_TOKEN

# Stage 2: Builder
FROM oven/bun:1.2.12-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./apps/api
COPY libs ./libs
COPY package.json tsconfig.base.json ./

# Stage 3: Runner
FROM oven/bun:1.2.12-alpine AS runner
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder --chown=api:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=api:nodejs /app/libs ./libs
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/package.json ./package.json
COPY --from=builder --chown=api:nodejs /app/tsconfig.base.json ./tsconfig.base.json

USER api

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "apps/api/src/server.ts"]
