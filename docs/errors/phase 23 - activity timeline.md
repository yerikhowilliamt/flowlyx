# Phase 24 - Activity Timeline: Dependency, Test, and Linter Errors

## 1. Missing Dependency / Validation Standard Mismatch

### Symptoms (Gejala)

During the initial execution of the unit test suite (`npm run test`), the tests failed because the `class-validator` package was missing from the `apps/api` dependencies.
_(Selama eksekusi awal test suite unit (`npm run test`), test mengalami kegagalan karena package `class-validator` tidak ditemukan di dependensi `apps/api`.)_

### Root Cause (Akar Masalah)

The initial implementation of the Activity Timeline DTOs mistakenly used `class-validator` and `class-transformer` decorators for validation. However, the project's established global validation standard exclusively uses `zod` and `nestjs-zod`.
_(Implementasi awal dari DTO Activity Timeline secara keliru menggunakan dekorator dari `class-validator` dan `class-transformer` untuk validasi. Namun, standar validasi global yang telah ditetapkan di proyek ini secara eksklusif menggunakan `zod` dan `nestjs-zod`.)_

### Solution (Solusi)

Instead of installing the missing `class-validator` dependencies, the `CreateActivityDto` and `FindActivitiesDto` files were refactored to use `zod` schemas and extend `createZodDto` from `nestjs-zod`, aligning with the rest of the modules.
_(Alih-alih menginstal dependensi `class-validator` yang hilang, file `CreateActivityDto` dan `FindActivitiesDto` di-refactor menggunakan skema `zod` dan mengekstensi `createZodDto` dari `nestjs-zod`, agar selaras dengan modul-modul lainnya.)_

### Prevention (Pencegahan)

- **Follow Existing Patterns (Ikuti Pola yang Ada)**: Before introducing a new library (like `class-validator`), check existing implementations (e.g., `tasks` module) to ensure alignment with the repository's established standards.
  _(Sebelum memperkenalkan library baru (seperti `class-validator`), periksa implementasi yang sudah ada (misal modul `tasks`) untuk memastikan keselarasan dengan standar yang sudah ditetapkan pada repositori.)_

---

## 2. Unit Test Pagination Meta Mismatch

### Symptoms (Gejala)

The service test for `findByEntityId` failed with the following mismatch error:
_(Test pada service untuk `findByEntityId` gagal dengan error ketidakcocokan berikut:)_

`Expected: 1, Received: undefined`

### Root Cause (Akar Masalah)

The unit tests asserted and mocked the paginated metadata object using the property `meta.totalItems`. However, the shared pagination utility `createPaginatedResponse` and the `PaginatedResponse` DTO structure define the property as `meta.total`, causing `totalItems` to be `undefined`.
_(Unit test melakukan asersi dan mock terhadap objek metadata paginasi menggunakan properti `meta.totalItems`. Akan tetapi, utilitas paginasi bersama `createPaginatedResponse` dan struktur DTO `PaginatedResponse` mendefinisikan propertinya sebagai `meta.total`, sehingga `totalItems` bernilai `undefined`.)_

### Solution (Solusi)

Updated the assertions in `activities.service.spec.ts` and the mock return structures in `activities.controller.spec.ts` to use `meta.total` instead of `meta.totalItems`.
_(Memperbarui asersi pada `activities.service.spec.ts` dan struktur mock kembalian pada `activities.controller.spec.ts` untuk menggunakan `meta.total` ketimbang `meta.totalItems`.)_

### Prevention (Pencegahan)

- **Verify Shared DTOs (Verifikasi DTO Bersama)**: Always verify the exact property names and structures of shared utilities and DTOs before hardcoding them in test expectations.
  _(Selalu verifikasi penamaan properti dan struktur dari utilitas atau DTO bersama sebelum menuliskannya langsung secara manual (hardcode) pada ekspektasi test.)_

---

## 3. Linter/Typescript Strict Typing Error (No Explicit Any)

### Symptoms (Gejala)

The CI/CD pipeline failed during the `npm run lint` step with the following errors:
_(Pipeline CI/CD mengalami kegagalan pada langkah `npm run lint` dengan error berikut:)_

- `Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`
- `'CurrentUser' is defined but never used @typescript-eslint/no-unused-vars`

### Root Cause (Akar Masalah)

1. In the test files (`activities.controller.spec.ts` and `activities.service.spec.ts`), the mocked service and repository variables were explicitly typed as `any` (e.g., `let mockService: any;`), which violates the project's strict no-any policy.
   _(Pada file test, variabel untuk service dan repository tiruan diketik secara eksplisit sebagai `any`, yang mana melanggar aturan ketat larangan penggunaan `any` pada proyek ini.)_
2. The `activities.controller.ts` file imported the `CurrentUser` decorator but never used it in the endpoints.
   _(File `activities.controller.ts` mengimpor dekorator `CurrentUser` namun tidak pernah menggunakannya di dalam endpoint.)_

### Solution (Solusi)

1. **Removed `any` Casts (Menghapus Tipe `any`)**: Changed the mock variables from `any` to a strictly-typed `Record<string, jest.Mock>`, providing accurate type safety for the mocked methods.
   _(Mengganti variabel mock dari `any` menjadi tipe ketat `Record<string, jest.Mock>`, memberikan type-safety yang akurat untuk metode-metode tiruan.)_
2. **Removed Unused Imports (Menghapus Impor Tak Terpakai)**: Deleted the `CurrentUser` import from the controller file to satisfy the ESLint unused-vars rule.
   _(Menghapus impor `CurrentUser` dari file controller untuk memenuhi aturan ESLint unused-vars.)_

### Prevention (Pencegahan)

- **Avoid `any` at all costs (Hindari penggunaan `any` dalam kondisi apapun)**: Never use `any` to define mocked dependencies. Use TypeScript utility types like `Partial<T>`, `jest.Mocked<T>`, or `Record<string, jest.Mock>`.
  _(Jangan pernah menggunakan `any` untuk mendefinisikan dependensi tiruan. Gunakan utilitas tipe TypeScript seperti `Partial<T>`, `jest.Mocked<T>`, atau `Record<string, jest.Mock>`.)_
