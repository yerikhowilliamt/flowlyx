# Phase 32 - Audit Log: Validation Standard & Swagger Boilerplate

## Symptoms (Gejala)

During the implementation of the Audit Logs module, several issues were encountered related to validation libraries, pathing, and documentation bloat:

_(Selama implementasi modul Audit Logs, ditemukan beberapa masalah terkait penggunaan library validasi, path import, dan penumpukan dokumentasi:)_

1. **Linter / Standardization Mismatch**: DTOs initially created with `class-validator` (e.g., `@IsString()`, `@IsUUID()`) threw "red line" linter warnings in the IDE because they did not match the established validation pattern of the monorepo.
2. **Module Resolution Error**: `PaginationDto` could not be found when importing it into `find-audit-logs.dto.ts`.
3. **Swagger `.describe()` Boilerplate**: Writing explicit `.describe('...')` for every field in Zod schemas (e.g., `workspaceId: z.string().describe('Workspace ID')`) created massive redundant boilerplate across 40+ DTOs.
4. **Vague Global Error Messages**: The `GlobalExceptionFilter` was masking contextual logic by mapping Prisma errors (e.g., `P2002`) and Guard rejections to generic fallback messages (like "An unexpected error occurred" or "A record with this value already exists"), confusing end-users.
   _(Pesan Error Global yang Samar: `GlobalExceptionFilter` menutupi logika kontekstual dengan mengubah error Prisma dan penolakan Guard menjadi pesan generik, sehingga membingungkan pengguna akhir.)_
5. **Unit Test Failures Post-Refactor**: After modifying the RBAC guards to explicitly throw `ForbiddenException`, 4 unit tests failed because they were hardcoded to expect the guards to return `false`.
   _(Kegagalan Unit Test Pasca-Refactor: Setelah memodifikasi RBAC guard untuk melempar `ForbiddenException` secara eksplisit, 4 unit test gagal karena dikodekan secara kaku untuk mengharapkan guard mengembalikan nilai `false`.)_

## Root Cause (Akar Masalah)

1. **Validation Standard**: Flowlyx strictly standardizes on `nestjs-zod` for all request validations. Using standard NestJS validation decorators (`class-validator`) violates this architectural decision and triggers standard checks.
2. **Relative Pathing**: The DTO was located deep in the module (`apps/api/src/modules/audit-logs/dto/`), requiring a specific relative path to reach the core directory `../../../core/pagination/pagination.dto`.
3. **Swagger Integration**: While `nestjs-zod` handles validation, without proper global configuration, developers feel forced to write manual textual descriptions for Swagger to understand the schema types, which contradicts the "Ponytail" principle (lazy/efficient coding).
4. **Over-reliance on Global Filters**: Attempting to handle all database unique constraints globally prevented sending highly specific, contextual English error messages tailored to the action the user was performing. Additionally, a refactor accidentally dropped the `responseBody` extraction from `HttpException`, masking intentional error messages.
   _(Ketergantungan Berlebih pada Filter Global: Mencoba menangani semua constraint unik database secara global mencegah pengiriman pesan error spesifik dan kontekstual. Selain itu, refactor secara tidak sengaja menghilangkan ekstraksi `responseBody` dari `HttpException`, sehingga menyembunyikan pesan error kustom.)_
5. **Brittle Test Expectations**: The RBAC tests strictly expected boolean logic (`false`) rather than validating the full HTTP response lifecycle (Exceptions).
   _(Ekspektasi Test yang Rapuh: Test RBAC dengan kaku mengharapkan logika boolean (`false`) alih-alih memvalidasi siklus respons HTTP secara penuh (Exception).)_

## Solution (Solusi)

1. **Migrating to Zod (Migrasi ke Zod)**:
   Completely removed `class-validator` and `@nestjs/swagger` decorators from the DTOs and refactored them to use `z.object()` and `createZodDto`. Furthermore, audited the entire codebase to ensure no remaining `class-validator` usage existed (migrating 3 other outlier DTOs in the process).
   _(Menghapus total `class-validator` dan dekorator `@nestjs/swagger` dari DTO dan melakukan refactor menggunakan `z.object()` serta `createZodDto`. Selain itu, melakukan audit pada seluruh codebase untuk memastikan tidak ada lagi penggunaan `class-validator`.)_

2. **Fixing Import Path (Memperbaiki Path Import)**:
   Corrected the relative import of `PaginationDto` to successfully resolve from the `core` folder.
   _(Memperbaiki import relatif untuk `PaginationDto` agar berhasil di-resolve dari folder `core`.)_

3. **Global Swagger Patch (Patch Swagger Global)**:
   Instead of manually appending `.describe()` to ~40 DTOs, implemented a 1-line solution in `main.ts` using `patchNestJsSwagger()`. This automatically infers data types, optionality, and constraints directly from Zod into Swagger Docs. All redundant `.describe()` fields were deleted.
   _(Daripada menambahkan `.describe()` secara manual ke ~40 DTO, solusi 1 baris diimplementasikan pada `main.ts` menggunakan `patchNestJsSwagger()`. Hal ini secara otomatis menarik tipe data, opsionalitas, dan constraint langsung dari Zod ke Swagger Docs. Semua `.describe()` yang redundan dihapus.)_

4. **Explicit Manual Error Validation (Validasi Error Manual Eksplisit)**:
   Reverted generic database intercepts in the `GlobalExceptionFilter` and manually injected explicit `ConflictException` (for duplicates) and `ForbiddenException` (for roles) with tailored English messages directly into the Services and Guards. Fixed the Global Filter to properly extract custom `HttpException` messages.
   _(Menghapus intercept database generik di `GlobalExceptionFilter` dan menyuntikkan `ConflictException` serta `ForbiddenException` secara manual dengan pesan bahasa Inggris yang spesifik langsung di dalam Service dan Guard. Memperbaiki Global Filter agar dapat mengekstrak pesan `HttpException` kustom dengan benar.)_

5. **Updating Unit Tests (Memperbarui Unit Test)**:
   Modified the Role Guard unit tests from expecting a `toBe(false)` boolean return to asserting `rejects.toThrow(ForbiddenException)`.
   _(Memodifikasi unit test Role Guard dari yang awalnya mengharapkan return boolean `false` menjadi asersi yang mengharapkan pelemparan `ForbiddenException`.)_

## Prevention (Pencegahan)

- **Enforce Standardization (Tegakkan Standarisasi)**: Always use `nestjs-zod` and `createZodDto` for any new module to maintain consistency and keep the codebase lean. Do not revert to `class-validator`.
  _(Selalu gunakan `nestjs-zod` dan `createZodDto` untuk modul baru demi menjaga konsistensi. Jangan kembali ke `class-validator`.)_
- **Trust Global Plugins (Percayai Plugin Global)**: Before writing repetitive boilerplate (like Swagger descriptions), check if a global plugin or interceptor already exists to automate the task.
  _(Sebelum menulis boilerplate yang berulang, periksa apakah ada plugin atau interceptor global yang bisa mengotomatisasi tugas tersebut.)_
- **Prioritize User Experience over DRY in Errors**: A program is built for users, not code brevity. It is acceptable (and encouraged) to use manual, somewhat repetitive try/catch or conditional validation in Domain Services if it results in a drastically clearer error message for the end user.
  _(Sebuah program dibuat untuk mempermudah pengguna, bukan sekadar agar kode pendek. Boleh dan sangat disarankan untuk melakukan validasi manual di Domain Service jika itu menghasilkan pesan error yang jauh lebih jelas bagi pengguna.)_
