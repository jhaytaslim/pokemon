# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# FIXED: Root context for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/  
# For workspace

RUN corepack enable && pnpm install --frozen-lockfile

COPY frontend ./frontend

WORKDIR /app/frontend
RUN pnpm build  # Outputs to frontend/dist

# Serve stage
FROM nginx:alpine AS production

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]