# Stage 1: Base image with Node.js and pnpm
FROM node:22.21.1-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

# Set working directory
WORKDIR /app

# Stage 2: Builder - Install dependencies and build
FROM base AS builder

# Copy package.json files for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/trousse/package.json ./packages/trousse/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install all dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the web app and its dependencies
ENV NODE_ENV=production
RUN pnpm build --filter=@tasks/web

# Stage 3: Production - Minimal runtime image
FROM base AS production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy built output from builder
COPY --from=builder /app/apps/web/.output ./apps/web/.output

# Copy packages/db for migrations (including source and deps)
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/turbo.json ./

# Install only production dependencies for db package
RUN pnpm install --frozen-lockfile --prod --filter=@tasks/db

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "apps/web/.output/server/index.mjs"]
