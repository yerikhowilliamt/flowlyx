# 🐛 Error & Bug Resolutions

This document records technical issues encountered during development and the solutions implemented to resolve them.

---

### 1. Error: `Property 'organizationId' has no initializer`

- **Cause:** TypeScript's `strictPropertyInitialization` rule blocked class properties that weren't explicitly initialized in a constructor.
- **Solution (Ponytail Strategy):** Since these models function as DTOs and their data is dynamically hydrated, the Definite Assignment Assertion (`!`) operator was appended to properties (e.g., `organizationId!: string;`) instead of creating extensive constructor boilerplate.

### 2. Error: `unable to determine transport target for "pino-pretty"`

- **Cause:** The API's default logger (`nestjs-pino`) was configured to use `pino-pretty` as a terminal log formatter when running in a development environment (`NODE_ENV !== 'production'`). However, `pino-pretty` was missing from the dependency list (`package.json`).
- **Solution:** Executed the `npm install --save-dev pino-pretty` command inside the `apps/api` directory to install the required log formatter module.

### 3. Environment Config (`.env`) & Git Tokens Misunderstanding

- **Cause:** Confusion regarding where to store the `GITHUB_TOKEN` versus other API secrets.
- **Solution:** Provided clarification that Git Personal Access Tokens (for CLI/Push/Pull operations) must be stored at the system level (Windows Credential Manager via `gh auth login`), NOT in the project's `.env`. Meanwhile, NestJS environment variables (like `JWT_SECRET`, `PORT`) should be properly localized by creating an `apps/api/.env` file.
