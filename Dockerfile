# Base stage for node and turbo
FROM node:20-alpine AS base
# Set working directory
WORKDIR /app
# Install turbo globally
RUN npm install -g turbo

# Prune the workspace for the api app
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=@flowlyx/api --docker

# Builder stage
FROM base AS builder
WORKDIR /app

# First install the dependencies (as they change less often)
# The pruned workspace generates out/json/ and out/full/
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies (ignore scripts to avoid husky error)
RUN npm install --ignore-scripts

# Build the project (which includes prisma generate)
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=@flowlyx/api

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user and group (Alpine node image already has a node user with uid 1000)
# We can just use the built-in node user

RUN apk add --no-cache openssl

# Set environment to production
ENV NODE_ENV production

# Install only production dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install --omit=dev --ignore-scripts

# Copy built application, local packages, and generated prisma client
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Change ownership to non-root user
RUN chown -R node:node /app

USER node

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "apps/api/dist/src/main.js"]
