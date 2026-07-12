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

# Install dependencies (no lockfile: repo is package-manager-agnostic by
# owner directive — installs resolve fresh from package.json)
RUN pnpm install

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
# Digest-pinned like the builder stage — the previous unpinned 1.27-alpine tag
# aged into 37 CRITICAL/HIGH alpine-3.21 CVEs (openssl, expat, libpng, c-ares)
FROM nginx:1.30-alpine@sha256:0d3b80406a13a767339fbe2f41406d6c7da727ab89cf8fae399e81f780f814d1 AS runtime

# Pull OS security patches newer than the base-image snapshot (alpine package
# fixes land faster than nginx image digests). Named stage 'runtime' paired with
# CI no-cache-filters ensures this layer always rebuilds (BuildKit gha cache
# otherwise freezes the apk upgrade → ships stale packages with known CVEs).
RUN apk upgrade --no-cache

# Copy custom nginx config with SPA routing + security headers
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/security-headers.conf

# Copy built assets from builder stage
COPY --from=builder /build/dist /usr/share/nginx/html

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1

# Run as non-root user (nginx user, uid 101)
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
