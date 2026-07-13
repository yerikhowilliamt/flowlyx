# Phase 19 - Priority: Missing ProjectRolesGuard Module Error

## Symptoms

During the execution of the unit test suite (`npm run test`), the following error caused the test suite to fail:
`Cannot find module '../rbac/guards/project-roles.guard' from 'modules/priorities/priorities.controller.ts'`

## Root Cause

An assumption was made that `ProjectRolesGuard` existed in the RBAC module to handle project-level role authorization, similar to how `OrganizationRolesGuard` and `WorkspaceRolesGuard` function. However, this guard has not been implemented in the codebase yet.

## Investigation

- Inspected the `apps/api/src/modules/rbac/guards` directory and confirmed that `project-roles.guard.ts` does not exist.
- Reviewed `apps/api/src/modules/labels/labels.controller.ts` (which also manages project-scoped entities) to understand the existing authorization pattern. Found that it currently relies solely on `JwtAuthGuard` without explicit RBAC checks.

## Solution

- Created `ProjectRole` enum (`ADMIN`, `PROJECT_MANAGER`, `MEMBER`).
- Created `ProjectRolesGuard` and `ProjectRoles` decorator.
- The guard intelligently fetches `projectId` from nested resources (like `priorityId`) if it is not present in the request body or query.
- Applied `@ProjectRoles(ProjectRole.ADMIN, ProjectRole.PROJECT_MANAGER)` to `create`, `update`, and `remove` endpoints in `priorities.controller.ts`.

## Trade-offs

- **Slight Overhead**: The guard performs an additional database lookup to fetch the `projectId` from the nested resource ID (`priorityId`) during `update` and `delete` operations. This is a standard and acceptable trade-off for robust RBAC on nested routes.

## Prevention

- **Verify Dependencies**: Always verify the existence of shared utilities, guards, or services before importing them.
- **Reference Existing Patterns**: Consult similar, previously implemented modules (such as `Labels` for project-scoped resources) to identify the currently supported patterns and avoid speculative imports.
