# Phase 12 - Project: Prisma Migration Authentication Failed / Environment Variable Not Found

## Symptoms

During the execution of the `npx prisma migrate dev` command in the `packages/database` directory to add the `Project` entity, the following errors were encountered sequentially:

1. **Initial Error (P1012)**:

```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
```

2. **Subsequent Error (P1000)** (after configuring `.env` and starting Docker):

```
Error: P1000: Authentication failed against database server at `127.0.0.1`, the provided database credentials for `postgres` are not valid.
```

## Root Cause

1. **Missing Configuration**: The Prisma CLI relies on the `DATABASE_URL` environment variable for database connections. The `packages/database` directory did not have a `.env` file containing this variable.
2. **Port Conflict**: After providing a `.env` with a connection URL targeting `localhost:5432` (via Docker), authentication failed. The root cause was that a native PostgreSQL service was already running on the Windows host machine bound to port `5432`. Prisma CLI silently connected to the native host database instead of the Docker container, leading to a credentials mismatch.

## Investigation

- The first error explicitly mentioned `Environment variable not found: DATABASE_URL`.
- After creating the `.env` and bringing up `docker-compose`, the Docker container logs confirmed that PostgreSQL initialized successfully with the requested `POSTGRES_PASSWORD`.
- Execution of `docker exec flowlyx-db psql -U postgres -d flowlyx -c "SELECT 1;"` was successful, indicating the database was healthy internally.
- Inspecting native processes on Windows (`Get-Process -Name postgres*`) revealed that PostgreSQL was actively running natively outside of Docker.

## Solution

1. **Environment Configuration**: Replicated the `.env` file to include `DATABASE_URL` so that Prisma can load the connection string.
2. **Resolve Port Collision**: Modified `docker-compose.yml` to map the container's port `5432` to the host port `5433` (i.e., `5433:5432`).
3. **Connection String Update**: Updated the `DATABASE_URL` in the `.env` file to connect via port `5433` (`postgresql://postgres:password@127.0.0.1:5433/flowlyx?schema=public`).
4. **Re-run Migration**: Executing `npx prisma migrate dev` ran successfully.

## Trade-offs

Binding to a non-standard Postgres port (`5433`) requires team members to be aware that the local development database does not run on the default `5432` port. Any direct connections via GUI tools (e.g., pgAdmin, DBeaver) will need to be explicitly configured to use `5433`.

## Prevention

- Always verify if a native service is already occupying a default port (like 5432 for Postgres or 6379 for Redis) before configuring Docker services.
- Ensure developers set up a local `.env` file with proper connection strings before attempting to run database migrations.
- Centralize port configurations in `docker-compose.yml` and explicitly document them in the repository's setup instructions.

## References

- [Prisma Error Code Reference: P1012](https://www.prisma.io/docs/orm/reference/error-reference#p1012)
- [Prisma Error Code Reference: P1000](https://www.prisma.io/docs/orm/reference/error-reference#p1000)
