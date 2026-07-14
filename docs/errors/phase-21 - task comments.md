# Error Documentation: Phase 21 - Task Comments

## 1. Prisma Connection Error (P1001)

### Symptoms

Running `npx prisma db push` failed with error: `Error: P1001: Can't reach database server at 127.0.0.1:5433`.

### Root Cause

The local PostgreSQL database container was not running on the expected port `5433`, preventing Prisma from connecting and pushing the schema changes.

### Investigation

The error output explicitly stated that the database server could not be reached. Verified that the `.env` file pointed to `127.0.0.1:5433` but the Docker container was inactive.

### Solution

Instead of forcing a database push to an offline server during development, we ran `npx prisma generate` to generate the Prisma Client types locally. The actual database migration will be handled when the container is spun up or in the CI/CD pipeline.

### Trade-offs

Cannot verify database-level constraints locally until the container is running. However, it allows development and type-checking to continue unblocked.

### Prevention

Ensure the `docker-compose` stack is fully running before executing `prisma db push` or `prisma migrate dev`.

### References

- Prisma Error Codes: [P1001](https://www.prisma.io/docs/reference/api-reference/error-reference#p1001)

---

## 2. Type Check Script Mismatch

### Symptoms

Running `npm run typecheck` failed with `Missing script: "typecheck"`.

### Root Cause

The script defined in `package.json` for running the TypeScript compiler without emitting files is named `type-check`, not `typecheck`.

### Investigation

The npm error output suggested `Did you mean this? npm run type-check`.

### Solution

Executed `npm run type-check` instead.

### Trade-offs

None.

### Prevention

Check `package.json` scripts list (`npm run`) before assuming standard script names if they fail.

---

## 3. ESLint Strictness in Test Files

### Symptoms

ESLint threw errors in `.spec.ts` files for using `any` (e.g., `Unexpected any. Specify a different type`) and for unused imports (`'NotFoundException' is defined but never used`).

### Root Cause

The ESLint configuration in this repository is strict and does not permit `any` types or unused imports, even within test files where mocking often relies on type casting.

### Investigation

Reviewed the ESLint error output which pointed exactly to the lines in `task-comments.controller.spec.ts` and `task-comments.service.spec.ts`.

### Solution

- Removed the unused `NotFoundException` import.
- Replaced `as any` casts with specific types (`as User`, `as PaginationDto`) and imported the required types from the database and core modules.

### Trade-offs

Mocking requires slightly more boilerplate to satisfy the type checker (importing types), but it ensures high type safety across the entire codebase, including tests.

### Prevention

Always import the actual types and avoid `as any` when writing mock objects in test files.
