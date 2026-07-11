# ERR-001: Lint Error `Unexpected any`

## Symptoms

When running `npm run lint`, the linter fails with `@typescript-eslint/no-explicit-any` errors in test files, specifically for mock DTOs casted as `any` (e.g., `dto as any`).

## Root Cause

The project's ESLint configuration strictly forbids the usage of explicit `any` types to maintain strong typing and type safety across the codebase. Using `as any` in test files violates this rule.

## Investigation

During the implementation of Phase 8 (Organization), unit tests for `organizations.service.spec.ts` and `organizations.controller.spec.ts` used `dto as any` to quickly mock the incoming Data Transfer Objects (DTOs) for the `create` methods. The CI/CD pipeline or `npm run lint` step caught this and failed the build.

## Solution

Replace `as any` with a double cast using `unknown` followed by the specific DTO type. For example:

```typescript
// From:
const result = await controller.create(dto as any);

// To:
const result = await controller.create(dto as unknown as CreateOrganizationDto);
```

This satisfies the linter by avoiding `any` while still allowing the mock object (which might be missing some optional fields or methods) to be passed into the function.

## Trade-offs

Using `as unknown as CreateOrganizationDto` still bypasses strict type checking for the mock object, meaning if the DTO shape changes significantly, the test might not catch it at compile time. However, it successfully avoids `any` and adheres to the project's strict linting rules.

## Prevention

Always avoid `any` in test files. When mocking complex objects or DTOs, either provide a fully compliant object or use `as unknown as Type` if a partial mock is absolutely necessary.

## References

- [ESLint: no-explicit-any](https://typescript-eslint.io/rules/no-explicit-any/)
