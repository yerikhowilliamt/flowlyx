# Phase 31 - File Storage: TypeScript Initialization & Linting Errors

## Symptoms (Gejala)

During the build process (`npm run build`) and pre-commit hooks for Phase 31, several errors prevented successful execution:

_(Selama proses build (`npm run build`) dan pre-commit hooks pada Fase 31, beberapa error menghalangi eksekusi yang sukses:)_

1. **TS2564 (TypeScript Initialization Error)**:
   - `Property 'workspaceId' has no initializer and is not definitely assigned in the constructor.`
   - This occurred across multiple fields in `UploadFileDto` and `FileEntity`.
2. **ESLint Errors**:
   - `Unexpected any. Specify a different type @typescript-eslint/no-explicit-any` (Triggered by the use of `as any` in mock tests and Prisma client wrappers).
   - `'ApiProperty' is defined but never used @typescript-eslint/no-unused-vars`
3. **TypeScript Syntax Error in Tests**:
   - `TS1128: Declaration or statement expected` in `storage.service.spec.ts` due to an unclosed bracket after a codebase refactor.

## Root Cause (Akar Masalah)

1. **Definite Assignment in TypeScript (Penugasan Pasti di TypeScript)**:
   The project has strict TypeScript configuration enabled (`strictPropertyInitialization: true`). Classes like Entities and DTOs that do not initialize their properties in the constructor will trigger `TS2564` unless they are marked with the definite assignment assertion (`!`).
   _(Proyek ini mengaktifkan konfigurasi TypeScript yang ketat. Class seperti Entities dan DTOs yang tidak menginisialisasi propertinya di dalam constructor akan memicu `TS2564` kecuali ditandai dengan asersi penugasan yang pasti (`!`).)_

2. **Strict ESLint Rules (Aturan ESLint yang Ketat)**:
   Similar to Phase 20, the use of `as any` as a quick bypass for incomplete mocked data structures or generic return types violates the project's `@typescript-eslint/no-explicit-any` rule.
   _(Sama seperti Fase 20, penggunaan `as any` sebagai cara pintas untuk struktur data mock yang tidak lengkap atau tipe kembalian generik melanggar aturan `@typescript-eslint/no-explicit-any` proyek.)_

3. **Incomplete Refactoring (Refactor yang Tidak Sempurna)**:
   During the simplification phase ("ponytail review") to remove the over-engineered `StorageRepository`, an inline refactor of `prisma.file.create` inside the test mocks accidentally left an unbalanced parenthesis/brace structure.
   _(Selama fase penyederhanaan untuk menghapus `StorageRepository` yang over-engineered, refactor sebaris dari `prisma.file.create` di dalam mock test secara tidak sengaja menyisakan struktur kurung kurawal/biasa yang tidak seimbang.)_

## Solution (Solusi)

1. **Definite Assignment Assertions (Asersi Penugasan Pasti)**:
   Appended the `!` operator to properties in DTOs and Entities that are populated dynamically by NestJS validators or Prisma (e.g., `workspaceId!: string;`).
   _(Menambahkan operator `!` pada properti di DTOs dan Entities yang diisi secara dinamis oleh validator NestJS atau Prisma.)_

2. **Type-Safe Type Casting (Casting Tipe Secara Aman)**:
   Replaced occurrences of `as any` with `as unknown as Type` (e.g., `as unknown as Request & { user: { id: string } }` and `as unknown as FileEntity`). This satisfies the linter while still allowing tests to provide partial mock objects.
   _(Mengganti kemunculan `as any` dengan `as unknown as Type`. Hal ini memenuhi linter sekaligus tetap memungkinkan test untuk menyediakan objek mock parsial.)_

3. **Test Syntax Correction (Koreksi Sintaks Test)**:
   Restored the missing `data:` wrapper and the proper closing brackets inside the `expect.objectContaining()` assertions in the unit tests.
   _(Mengembalikan wrapper `data:` yang hilang dan tanda kurung penutup yang tepat di dalam asersi `expect.objectContaining()` pada unit test.)_

## Prevention (Pencegahan)

- **Entities & DTOs Typing (Pengetikan Entities & DTOs)**: Always use `!: type` for required class properties that do not have a constructor, ensuring compatibility with `strictPropertyInitialization`.
  _(Selalu gunakan `!: type` untuk properti class wajib yang tidak memiliki constructor, untuk memastikan kompatibilitas dengan `strictPropertyInitialization`.)_
- **Avoid `any` (Hindari `any`)**: Double-check test suites to ensure `as any` is not being used to silence compiler errors on mocks. Use `unknown` bridging when absolutely necessary.
  _(Periksa kembali test suite untuk memastikan `as any` tidak digunakan untuk membungkam error compiler pada mock. Gunakan perantara `unknown` hanya ketika benar-benar diperlukan.)_
- **Step-by-Step Refactoring (Refactoring Bertahap)**: When running multi-line regex or automated replacements during code cleanup, always verify the structural integrity of the surrounding code blocks.
  _(Saat menjalankan regex multi-baris atau penggantian otomatis selama pembersihan kode, selalu pastikan integritas struktural dari blok kode di sekitarnya.)_
