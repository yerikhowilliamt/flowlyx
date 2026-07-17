# Flowlyx

Flowlyx is an enterprise-grade project management and collaboration platform designed for high performance, maintainability, scalability, and strict security standards. It serves as a centralized hub for teams to organize work, manage resources, and track progress.

## Core Features

- **Multi-tenant Organization & Workspaces**: Support for Organizations, nested Workspaces, and Projects.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across Organizations, Workspaces, and Projects.
- **Task Management Engine**: Advanced Kanban boards with Lists, Tasks, Subtasks, Priorities, and Labels.
- **Collaboration**: Task assignments, comments, attachments, and real-time updates via WebSockets.
- **Billing & Subscriptions**: Integrated billing limits and subscription tracking for Organizations.
- **Global Search**: High-performance search indexing for Tasks, Projects, and Workspaces.
- **Security & Auditing**: Strict JWT authentication, rate-limiting, comprehensive audit logs, and secure cloud storage integrations (Cloudinary/S3).

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

## Testing

This repository follows a strict and efficient testing strategy (inspired by clean code principles):
- **Unit Tests**: Used exclusively for testing complex business logic, background processors, permissions, and internal utility functions. We **do not** write redundant unit tests for basic API Controllers.
- **End-to-End (E2E) Tests**: Used for testing API route integrations (e.g. Controllers interacting with the database, middlewares, and Auth guards). E2E tests are located in `apps/api/test/`.

To run tests:
```bash
# Run unit tests (Services, Logic)
npm run test

# Run E2E tests (Controllers, DB Integration)
npm run test:e2e
```
