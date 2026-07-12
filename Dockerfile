# Multi-stage Dockerfile for Vite React frontend
# Build stage uses exact Node version; runtime uses minimal nginx:alpine

# ========================================
# Stage 1: Builder
# ========================================
FROM node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS builder

WORKDIR /build

# Copy package manager config files first to read packageManager field and workspace settings
COPY package.json pnpm-workspace.yaml .npmrc ./

# Enable corepack and install pnpm version from packageManager field
# This reads "packageManager": "pnpm@11.5.1" from package.json
# Single source of truth - no hardcoded pnpm version
RUN corepack enable && \
    corepack install

# Copy lockfile after corepack setup (layer caching)
COPY pnpm-lock.yaml ./

# Install dependencies with pnpm
# --frozen-lockfile ensures reproducible builds
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
