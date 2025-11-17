# Multi-stage build for efficiency (Debian-based for OpenSSL/Prisma)
FROM node:20-slim AS builder

# FIXED: Install OpenSSL for Prisma engine
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN corepack enable && pnpm install --frozen-lockfile

# Copy backend source
COPY backend ./backend

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate --schema=prisma/schema.prisma

# Build backend
RUN pnpm build

# Production stage
FROM node:20-slim AS production

# FIXED: Install OpenSSL in prod too
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# FIXED: Copy root files to /app (absolute paths from context)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/  

# Prod install (workspace-wide)
RUN corepack enable && pnpm install --frozen-lockfile --prod

# FIXED: Copy built backend to /app/backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# FIXED: Change to backend dir
WORKDIR /app/backend

# FIXED: Regenerate Prisma client in prod (after prod install; @prisma/client in deps)
RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4001/api/health || exit 1

CMD ["sh", "-c", "npx prisma db push && node dist/src/server.js"]