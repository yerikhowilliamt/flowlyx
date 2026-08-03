# Flowlyx

Flowlyx is an enterprise-grade project management platform designed for maintainability, scalability, and strict security standards.

## Project Structure

This repository is a monorepo managed with `pnpm`.

```text
flowlyx/
├── .github/                  # GitHub Actions workflows and templates
├── apps/
│   ├── web/                  # Next.js Frontend Application
│   └── api/                  # NestJS Backend Application
├── docs/                     # The Engineering Handbook (SSOT)
├── infrastructure/           # Docker Compose, Terraform/Pulumi
├── packages/                 # Shared libraries and internal packages
│   ├── config/               # Shared ESLint, TSConfig, Prettier settings
│   ├── database/             # Prisma schema, migrations, and seed scripts
│   ├── types/                # Shared TypeScript definitions and DTOs
│   └── ui/                   # Shared React UI components
```

## Prerequisites

- **Node.js**: >= 20.0.0 LTS
- **Package Manager**: pnpm >= 8.0.0 (Strictly enforced, do NOT use npm or yarn)
- **Docker**: For running local infrastructure

## Engineering Standards

Please refer to the Engineering Handbook located in the `docs/` folder (specifically starting with `00-governance`) before contributing to this repository. The Handbook serves as our Single Source of Truth (SSOT).
