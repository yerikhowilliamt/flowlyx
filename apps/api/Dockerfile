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

# Install dependencies
RUN npm install

# Build the project
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=@flowlyx/api

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user and group (Alpine node image already has a node user with uid 1000)
# We can just use the built-in node user

# Set environment to production
ENV NODE_ENV production

# Install only production dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install --omit=dev

# Copy built application and required local packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages ./packages

# Change ownership to non-root user
RUN chown -R node:node /app

USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod", "-w", "@flowlyx/api"]
