# Phase 33 - Settings: TypeScript Exported Variable and Strict Typing Errors

## Symptoms (Gejala)

During the implementation of the Settings module and Zod DTO refactoring, TypeScript compilation (`tsc`) and ESLint (`npm run lint`) failed with the following errors:

_(Selama implementasi modul Settings dan refactor Zod DTO, kompilasi TypeScript (`tsc`) dan ESLint (`npm run lint`) mengalami kegagalan dengan error berikut:)_

- `Exported variable 'UpdateSettingDto' has or is using name 'baseSettingSchema' from external module but cannot be named.` (TypeScript Compilation Error / Error Kompilasi TypeScript)
- `Unexpected any. Specify a different type @typescript-eslint/no-explicit-any` (ESLint Strict Typing Error / Error Tipe Ketat ESLint)
- `Cannot find name 'SuccessResponse'.` (Missing Import Error / Error Impor Hilang)

## Root Cause (Akar Masalah)

1. **Inline Partial Zod Schema (Skema Parsial Zod Inline)**:
   In `update-setting.dto.ts`, the `UpdateSettingDto` was extending a `createZodDto` using an inline partial schema from the create DTO. Because the base schema was not exported properly or was wrapped inline, TypeScript could not generate the declaration `.d.ts` files correctly as it lost the reference to the original schema type.

   _(Di dalam `update-setting.dto.ts`, `UpdateSettingDto` mewarisi `createZodDto` menggunakan skema parsial inline dari create DTO. Karena skema dasarnya tidak diekspor dengan benar atau dibungkus secara inline, TypeScript tidak dapat menghasilkan file deklarasi `.d.ts` dengan tepat karena kehilangan referensi ke tipe skema aslinya.)_

2. **Linter "No Explicit Any" Policy (Aturan Linter Dilarang Menggunakan Any)**:
   During the creation of unit tests in `settings.service.spec.ts`, the mock payload was temporarily cast as `any` (`as any`) to bypass TypeScript constraints for the missing DTO properties. The project strictly enforces a "no `any` types allowed" policy, causing the CI/lint step to fail.

   _(Saat pembuatan unit test di `settings.service.spec.ts`, payload tiruan secara sementara di-*cast* sebagai `any` (`as any`) untuk mengabaikan batasan TypeScript terhadap properti DTO yang tidak lengkap. Proyek ini memberlakukan aturan ketat yang melarang penggunaan tipe `any`, sehingga menyebabkan langkah CI/lint gagal.)_

3. **Missing Imports in Global Refactoring (Impor Hilang pada Refactoring Global)**:
   While applying `@Serialize(SuccessResponse)` to all `DELETE` endpoints globally across 23 controllers, some controllers did not have the `SuccessResponse` model imported.

   _(Saat menerapkan `@Serialize(SuccessResponse)` ke seluruh endpoint `DELETE` secara global di 23 controller, beberapa controller belum mengimpor model `SuccessResponse` tersebut.)_

## Solution (Solusi)

1. **Fixing Zod Schema Exports (Memperbaiki Ekspor Skema Zod)**:
   Extracted the base schema into a separate, properly exported constant in `create-setting.dto.ts` before creating the Zod DTO class.

   _(Mengekstrak skema dasar ke dalam konstanta terpisah yang diekspor dengan benar di dalam `create-setting.dto.ts` sebelum membuat kelas Zod DTO.)_

   ```typescript
   // create-setting.dto.ts
   export const baseSettingSchema = z.object({ ... });
   export class CreateSettingDto extends createZodDto(baseSettingSchema) {}

   // update-setting.dto.ts
   export class UpdateSettingDto extends createZodDto(baseSettingSchema.partial()) {}
   ```

2. **Type-Safe Mock Casting (Casting Mock yang Aman secara Tipe)**:
   Replaced `as any` with `as unknown as CreateSettingDto` to safely tell TypeScript to trust the mock object structure without violating ESLint rules.

   _(Mengganti `as any` dengan `as unknown as CreateSettingDto` untuk secara aman memberitahu TypeScript agar mempercayai struktur objek tiruan tersebut tanpa melanggar aturan ESLint.)_

3. **Automated Import Resolution (Resolusi Impor Otomatis)**:
   Executed a Node.js script to dynamically traverse all controller files, identifying missing `SuccessResponse` definitions and injecting the correct import path (`import { SuccessResponse } from '../../models/api.model'`).

   _(Mengeksekusi skrip Node.js untuk secara dinamis menelusuri seluruh file controller, mengidentifikasi definisi `SuccessResponse` yang hilang, lalu menyuntikkan jalur impor yang tepat.)_

## Prevention (Pencegahan)

- **Proper Schema Modularity (Modularitas Skema yang Tepat)**: Always separate and export the core Zod schema constants (`const xyzSchema = z.object(...)`) before wrapping them in `createZodDto`. This ensures TypeScript can accurately resolve and name the types during compilation across different files.
  _(Selalu pisahkan dan ekspor konstanta skema inti Zod sebelum membungkusnya di dalam `createZodDto`. Hal ini memastikan TypeScript dapat menyelesaikan dan menamai tipe-tipe tersebut secara akurat selama kompilasi lintas file.)_
- **Avoid `any` Casts (Hindari Casting `any`)**: Even in test suites, avoid `as any`. Use double casting (`as unknown as T`) or `Parameters<T>` instead to maintain compliance with strictly typed linters.
  _(Bahkan di dalam serangkaian test sekalipun, hindari penggunaan `as any`. Gunakan casting ganda (`as unknown as T`) atau `Parameters<T>` guna menjaga kepatuhan terhadap linter bertipe ketat.)_

---

# Phase 33 - Settings: Invalid Role Enum Usage Error

## Symptoms (Gejala)

During the creation of `SettingsController`, the role-based access control (RBAC) guard triggered a TypeScript error because the role provided did not match the expected constraints.

_(Selama pembuatan `SettingsController`, *guard* kendali akses berbasis peran (RBAC) memicu error TypeScript karena peran yang diberikan tidak sesuai dengan batasan yang diharapkan.)_

## Root Cause (Akar Masalah)

The `@Roles()` decorator was incorrectly supplied with a string literal `'SYSTEM_ADMIN'` instead of using the predefined `Role` enum that the application expects.

_(Dekorator `@Roles()` keliru disuplai dengan literal string `'SYSTEM_ADMIN'` alih-alih menggunakan enum `Role` bawaan yang diharapkan oleh aplikasi.)_

## Solution (Solusi)

Replaced the string literal with the correct enum value: `Role.SUPER_ADMIN`.
_(Mengganti literal string tersebut dengan nilai enum yang benar: `Role.SUPER_ADMIN`.)_

```typescript
import { Role } from '../rbac/enums/role.enum';

// Sebelum (Before)
@Roles('SYSTEM_ADMIN')

// Sesudah (After)
@Roles(Role.SUPER_ADMIN)
```

## Prevention (Pencegahan)

- **Strict Enum Usage (Penggunaan Enum Secara Ketat)**: Always utilize centralized Enums for RBAC instead of hardcoding raw strings. This allows the compiler to catch typos and invalid states instantly.
  _(Selalu manfaatkan Enum terpusat untuk RBAC ketimbang melakukan penulisan string mentah (*hardcoding*). Ini memungkinkan *compiler* untuk segera menangkap kesalahan pengetikan dan status yang tidak valid.)_
