# Phase 15 - List / Status: Jest Mock Call Count Leakage

## Symptoms

During the implementation of Phase 15 (List / Status module), running the unit tests using `npm run test -- lists` resulted in the following failure in `lists.controller.spec.ts`:

```
● ListsController › findAll › should return empty array if boardId is not provided

  expect(jest.fn()).not.toHaveBeenCalled()

  Expected number of calls: 0
  Received number of calls: 1

  1: "board-1"
```

## Root Cause

The `lists.controller.spec.ts` tests used a shared mock object (`mockListsService`) for the `ListsService`. In the test setup (`beforeEach`), the mocks were not being cleared before each test execution. As a result, the `findAllByBoardId` method mock retained its call count from the previous test (`should return lists if boardId is provided`), causing the subsequent test (which expected 0 calls) to fail.

## Investigation

- Reviewed the test execution logs to identify the failing test block.
- Analyzed `lists.controller.spec.ts` focusing on how `mockListsService` was defined and injected.
- Confirmed that `mockListsService.findAllByBoardId` was called in the previous test block but no mechanism like `jest.clearAllMocks()` was invoked in `beforeEach` to reset the tracking counters.

## Solution

Added `jest.clearAllMocks();` inside the `beforeEach` block of `lists.controller.spec.ts` to ensure that all mock invocation records and return values are wiped clean before each test begins.

```typescript
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
// ...
```

## Trade-offs

- **Performance**: Clearing all mocks adds a very marginal, generally imperceptible overhead to the test suite setup.
- **Strictness**: Ensures absolute test isolation, preventing hidden inter-test dependencies, making test behaviors predictable and resilient.

## Prevention

- **Test Isolation Standards**: Enforce the usage of `jest.clearAllMocks()` in all `beforeEach` test setups as a standard practice across the repository for all controller and service unit tests.
- **Code Reviews**: Actively check for test isolation patterns during code reviews when shared mock objects are introduced.

## References

- [Jest Documentation: Mock Functions - `clearAllMocks()`](https://jestjs.io/docs/jest-object#jestclearallmocks)
