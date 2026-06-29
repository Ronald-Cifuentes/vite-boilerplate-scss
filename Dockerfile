# Multi-stage Dockerfile for Vite React frontend
# Build stage uses exact Node version; runtime uses minimal nginx:alpine

# ========================================
# Stage 1: Builder
# ========================================
FROM node:22.13.1-alpine AS builder

# Enable corepack and install specific pnpm version
RUN corepack enable && \
    corepack prepare pnpm@9.15.4 --activate

WORKDIR /build

# Copy package manager lockfiles first (layer caching)
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies with pnpm (bypass packageManager guard)
# --frozen-lockfile ensures reproducible builds
# COREPACK_ENABLE_STRICT=0 disables corepack's packageManager field enforcement
ENV COREPACK_ENABLE_STRICT=0
RUN pnpm install --frozen-lockfile

# Copy source code and configs
COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Build production bundle (CI handles type-checking separately)
# Vite performs its own TS transpilation during build
RUN ./node_modules/.bin/vite build

# ========================================
# Stage 2: Production runtime
# ========================================
FROM nginx:1.27-alpine

# Copy custom nginx config with SPA routing + security headers
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /build/dist /usr/share/nginx/html

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Run as non-root user (nginx user, uid 101)
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
