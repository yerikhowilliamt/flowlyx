# Phase 16 - Task: Prisma Migration Database Unreachable (P1001)

## Symptoms

During the implementation of Phase 16 (Task module), running `npx prisma migrate dev --name add-task-model` resulted in the following failure:

```
Error: P1001: Can't reach database server at `127.0.0.1:5433`

Please make sure your database server is running at `127.0.0.1:5433`.
```

The migration file was not created and the `tasks` table was not applied to the database.

## Root Cause

The PostgreSQL database server configured in `packages/database/.env` (`DATABASE_URL` pointing to `127.0.0.1:5433`) was not running at the time of migration execution. The Docker Compose service (`docker-compose.yml`) had not been started, so Prisma could not establish a TCP connection to the database.

## Investigation

- Verified the Prisma schema was syntactically valid (`npx prisma generate` succeeded).
- Confirmed all 15 unit tests passed (mocked database, no real connection needed).
- Checked that the error was strictly a connectivity issue (P1001), not a schema or SQL error.

## Solution

Start the database before running the migration:

```bash
docker compose up -d
npx prisma migrate dev --name add-task-model
```

No code changes required — the schema and application code are correct.

## Trade-offs

- **None**: This is a runtime environment issue, not a code defect. The migration will succeed once the database is available.

## Prevention

- **Pre-flight check**: Before running migrations, verify the database is reachable (`docker compose ps` or `pg_isready -h 127.0.0.1 -p 5433`).
- **CI/CD pipeline**: Ensure the database service is started as a dependency before the migration step in any automated workflow.

## References

- [Prisma Error Reference: P1001](https://www.prisma.io/docs/reference/api-reference/error-reference#p1001)
- [Docker Compose documentation](https://docs.docker.com/compose/)

---

# Phase 16 - Task: Commitlint body-max-line-length Violation

## Symptoms

During `git commit`, husky's commit-msg hook rejected the commit with:

```
⧗   input: feat(tasks): implement Task module (Phase 16)
✖   body's lines must not be longer than 100 characters [body-max-line-length]
✖   found 1 problems, 0 warnings
```

## Root Cause

The commit body contained lines exceeding the 100-character limit enforced by `.commitlintrc.json`. Detailed descriptions like `"Add Task model to Prisma schema (belongs to List, with title, description, order, priority, status, audit fields)"` exceeded this threshold.

## Investigation

- Identified that `.commitlintrc.json` enforces `body-max-line-length` at 100 characters.
- The commit message body used `-m` flags with full-sentence descriptions that were too long.

## Solution

Shortened each body line to stay under 100 characters:

```bash
git commit -m "feat(tasks): implement Task module (Phase 16)" \
  -m "- Add Task model to Prisma schema (belongs to List)" \
  -m "- Create TasksModule with CRUD controller, service, Zod DTOs" \
  -m "- Register TasksModule in AppModule" \
  -m "- Add unit tests (15 total: 7 controller, 8 service)" \
  -m "- Add error doc for Phase 16 (P1001 migration error)"
```

## Trade-offs

- **None**: Shorter lines are more readable in `git log` anyway.

## Prevention

- Keep commit body lines concise (under 100 characters).
- Move detailed descriptions to the PR body instead of the commit message.

## References

- [Commitlint: body-max-line-length](https://commitlint.js.org/reference/rules.html)
