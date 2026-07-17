# Phase 29 - Mentions: NestJS Dependency Injection (DI) Resolution Error in Tests

## Symptoms (Gejala)

During the execution of the unit test suite (`npm run test -- task-comments.service.spec.ts`), the tests failed to start, throwing the following error:

_(Selama eksekusi test suite unit (`npm run test -- task-comments.service.spec.ts`), test gagal berjalan dan melemparkan error berikut:)_

`Nest can't resolve dependencies of the TaskCommentsService (?). Please make sure that the argument NotificationsService at index [0] is available in the RootTestModule context.`

## Root Cause (Akar Masalah)

`NotificationsService` was recently injected into the constructor of `TaskCommentsService` to handle mention notifications. However, the `TestingModule` configuration inside `task-comments.service.spec.ts` was not updated to provide a mock for this new dependency. As a result, the NestJS Dependency Injection (DI) container failed to resolve it during the test initialization.

_(`NotificationsService` baru-baru ini diinjeksi ke dalam konstruktor `TaskCommentsService` untuk menangani notifikasi mention. Namun, konfigurasi `TestingModule` di dalam `task-comments.service.spec.ts` belum diperbarui untuk menyediakan mock bagi dependensi baru ini. Akibatnya, Dependency Injection (DI) container NestJS gagal menyelesaikannya saat inisialisasi test.)_

## Investigation (Investigasi)

- The error output explicitly stated the missing `NotificationsService` dependency at index `[0]`.
  _(Output error secara eksplisit menyebutkan hilangnya dependensi `NotificationsService` pada indeks `[0]`.)_
- Reviewed `task-comments.service.spec.ts` and confirmed that `NotificationsService` was missing from the `providers` array in `Test.createTestingModule`.
  _(Meninjau `task-comments.service.spec.ts` dan mengonfirmasi bahwa `NotificationsService` tidak ada di dalam array `providers` pada `Test.createTestingModule`.)_

## Solution (Solusi)

**Injecting Dependency Mock (Menginjeksi Mock Dependensi)**:
Added a mock for `NotificationsService` inside the `providers` array of `Test.createTestingModule` in `task-comments.service.spec.ts`.

_(Menambahkan mock untuk `NotificationsService` di dalam array `providers` pada `Test.createTestingModule` di file `task-comments.service.spec.ts`.)_

```typescript
providers: [
  TaskCommentsService,
  {
    provide: NotificationsService,
    useValue: {
      create: jest.fn(),
    },
  },
];
```

## Prevention (Pencegahan)

- **Synchronize Test Modules (Sinkronisasi Modul Test)**: Whenever a new dependency is injected into a service constructor, make sure to immediately provide a corresponding mock in the unit test module (`*.spec.ts`).
  _(Setiap kali dependensi baru diinjeksi ke dalam konstruktor service, pastikan untuk segera menyediakan mock yang sesuai di dalam modul unit test (`*.spec.ts`).)_
