# Stage 1: Prune the workspace for the API package
FROM node:20-alpine AS pruner
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=@flowlyx/api --docker

# Stage 2: Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on the pruned package.json and package-lock.json
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy the rest of the pruned source code
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client before building
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the API
RUN npx turbo run build --filter=@flowlyx/api...

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the built app
COPY --from=builder --chown=nestjs:nodejs /app .

EXPOSE 4000

# Run the API
CMD ["node", "apps/api/dist/main.js"]
