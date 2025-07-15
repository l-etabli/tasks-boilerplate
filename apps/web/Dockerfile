# Use Node.js 22 LTS as base image
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.9.0

# Set working directory
WORKDIR /app

# Copy package.json and pnpm lock files
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy package.json files from packages (create minimal directory structure)
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY packages/sentry/package.json ./packages/sentry/
COPY packages/otel/package.json ./packages/otel/
COPY packages/trousse/package.json ./packages/trousse/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies (install all dependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code after dependencies are installed  
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

# Copy root-level config files needed for build
COPY turbo.json tsconfig.json ./
COPY biome.json ./

# Build the application
FROM base AS builder
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

RUN apk add --no-cache curl

WORKDIR /app

# Copy built application from builder stage (includes migrations)
COPY --from=builder /app/apps/web/.output ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server/index.mjs"]