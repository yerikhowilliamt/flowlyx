# Phase 17 - Subtask: Dead Mock Setup in Copied Test Pattern

## Symptoms

During ponytail-review of the Subtask module, dead code was identified in the unit tests. `subtasks.service.spec.ts` contained `prisma.subtask.findUnique` mock calls inside the `update` and `remove` test blocks, but the actual service methods `update()` and `remove()` never call `findUnique`.

Similarly, `subtasks.controller.spec.ts` declared a `service` variable that was assigned via `module.get<SubtasksService>()` but was functionally identical to the `mockSubtasksService` object — an unnecessary indirection.

## Root Cause

The Subtask module was scaffolded by copying the Task module pattern. The Task module's test file (`tasks.service.spec.ts`) contains the same dead mocks (lines 97 and 109), and the controller spec has the same unused `service` variable. These were carried over verbatim without verifying whether the mocked methods were actually called by the code under test.

## Investigation

- Traced `SubtasksService.update()` — calls only `prisma.subtask.update`, never `findUnique`.
- Traced `SubtasksService.remove()` — calls only `prisma.subtask.delete`, never `findUnique`.
- Confirmed the `service` variable in controller spec resolves to the same mock object provided via `useValue: mockSubtasksService`.
- Verified that removing these lines does not break any of the 15 tests.

## Solution

- Removed 2 dead `findUnique` mock lines from `subtasks.service.spec.ts`.
- Removed `let service` declaration and `module.get()` assignment from `subtasks.controller.spec.ts`; assertions now reference `mockSubtasksService` directly.
- Removed a verbose log line in `subtasks.controller.ts` on the no-taskId path (noise, not actionable).

Net: **-4 lines**, 15/15 tests still passing.

## Trade-offs

- **None**: Pure dead code removal. No behavior change.

## Prevention

- When copying module patterns, verify that test mocks match actual method calls.
- Use ponytail-review (`/ponytail-review`) on newly scaffolded modules to catch inherited dead code.

## References

- [Ponytail Review Skill](../../.agents/skills/ponytail-review/SKILL.md)
- [Phase 16 - Task (source pattern)](./phase%2016%20-%20task.md)
