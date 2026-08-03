# Phase 27 - Time Tracking: Incorrect Import Paths and Architecture Mismatches

## Symptoms (Gejala)

During the compilation process (`npm run build`), the build failed with multiple TypeScript module resolution errors:

_(Selama proses kompilasi (`npm run build`), build mengalami kegagalan dengan beberapa error resolusi modul TypeScript:)_

- `error TS2307: Cannot find module './services/time-entry.service' or its corresponding type declarations.`
- `error TS2307: Cannot find module '../../core/prisma/prisma.service' or its corresponding type declarations.`
- `error TS2307: Cannot find module '../../../core/interceptors/transform.interceptor' or its corresponding type declarations.`

Additionally, there were TypeScript strictness errors in the DTOs:
_(Selain itu, terdapat error pengetatan TypeScript di dalam DTO:)_

- `error TS2564: Property 'taskId' has no initializer and is not definitely assigned in the constructor.`

## Root Cause (Akar Masalah)

1. **Relative Path Assumptions**: The files were generated in nested subfolders (`controllers/`, `services/`, `repositories/`), but the import paths assumed they were siblings (e.g., `./services/...` from inside `controllers/`).
   _(Asumsi Path Relatif: File di-generate di dalam subfolder yang bersarang, namun path import mengasumsikan file tersebut sejajar.)_
2. **Monorepo Architecture Deviations**: The implementation mistakenly attempted to inject a local `PrismaService` and `LoggerService` from a `core` directory. However, the Flowlyx monorepo architecture handles database connections globally via the `@flowlyx/database` workspace package, eliminating the need for a local `PrismaModule` or injected `PrismaService`.
   _(Penyimpangan Arsitektur Monorepo: Implementasi secara keliru mencoba meng-injeksi `PrismaService` dan `LoggerService` lokal. Padahal, arsitektur monorepo Flowlyx menangani koneksi database secara global via package `@flowlyx/database`.)_
3. **Missing Interceptor**: Attempted to import a `StandardResponse` from an interceptor file that did not exist in the codebase.
4. **TypeScript Strict Property Initialization**: DTO properties were missing the definite assignment assertion (`!`), which violates the strict TypeScript compiler checks.

## Investigation (Investigasi)

- Verified actual directory structures using file exploration.
- Investigated other existing modules (e.g., `notifications.repository.ts`) to understand the standard architectural patterns used in the project. Found that Prisma is imported globally via `import { prisma } from '@flowlyx/database';`.

## Solution (Solusi)

1. **Fixed Relative Imports (Memperbaiki Import Relatif)**: Corrected the relative import paths in the controller to correctly traverse up the directory tree (`../services/time-entry.service`).
2. **Refactored Database Access (Refactor Akses Database)**: Removed the local `PrismaService` injection and replaced it with direct usage of the global `prisma` singleton from `@flowlyx/database`.
3. **Removed Unused Abstractions (Menghapus Abstraksi yang Tidak Digunakan)**: Removed the nonexistent `StandardResponse` and `LoggerService` imports and let the controllers return the data directly.
4. **Fixed DTO Initialization (Memperbaiki Inisialisasi DTO)**: Added the definite assignment assertion operator (`!`) to required DTO properties (`taskId!: string;`).

## Prevention (Pencegahan)

- **Study Existing Patterns (Pelajari Pola yang Sudah Ada)**: Always review existing modules in the codebase before implementing a new one to ensure consistency with the established architectural patterns (e.g., how Prisma is used, how responses are structured).
  _(Selalu ulas modul yang sudah ada di codebase sebelum mengimplementasikan modul baru untuk memastikan konsistensi dengan pola arsitektur yang sudah mapan.)_
- **Verify File Paths (Verifikasi Path File)**: Ensure correct directory levels are used when writing relative imports in a nested feature module structure.

---

# Phase 27 - Missing Workspace Dependency

## Symptoms (Gejala)

During compilation, the following error was encountered in the API workspace:
_(Saat kompilasi, error berikut ditemukan di workspace API:)_

`error TS2307: Cannot find module 'class-validator' or its corresponding type declarations.`

## Root Cause (Akar Masalah)

The `@flowlyx/api` package explicitly relied on `class-validator` for DTO validation (e.g., `@IsUUID()`, `@IsDateString()`), but the dependency was missing from the `apps/api/package.json`. While `class-transformer` was present, `class-validator` was not.

## Solution (Solusi)

Installed the missing dependency specifically for the API workspace:
_(Menginstal dependensi yang hilang khusus untuk workspace API:)_

`npm install class-validator --workspace=@flowlyx/api`

## Prevention (Pencegahan)

- Ensure that all required third-party libraries used in decorators are explicitly declared in the specific workspace's `package.json`, rather than relying on phantom dependencies or global installations.

---

# Phase 27 - ESLint Strict Typing and Pre-Commit Hook Failures

## Symptoms (Gejala)

During the `git commit` phase, Husky's pre-commit hook failed the `eslint --fix` check with the following errors:
_(Saat fase `git commit`, pre-commit hook dari Husky menggagalkan pengecekan `eslint --fix` dengan error berikut:)_

- `'HttpCode' is defined but never used @typescript-eslint/no-unused-vars`
- `Unexpected any. Specify a different type @typescript-eslint/no-explicit-any` (triggered by `@Req() req: any`)

## Root Cause (Akar Masalah)

1. Unused imports were left behind after refactoring the controller.
2. The controller endpoints used `@Req() req: any` to bypass type checking for the custom `req.user` object injected by the `JwtAuthGuard`. The project strictly enforces a "no `any`" policy (`@typescript-eslint/no-explicit-any`).

## Solution (Solusi)

1. Removed the unused `HttpCode` and `HttpStatus` imports.
2. Replaced the `any` type with a properly intersected type that defines the `user` object on the Express Request:
   _(Mengganti tipe `any` dengan tipe beririsan (intersected type) yang mendefinisikan objek `user` pada Request Express:)_

   ```typescript
   import { Request } from 'express';
   import { User } from '@flowlyx/database';

   async create(@Req() req: Request & { user: User }, ...)
   ```

## Prevention (Pencegahan)

- **Avoid explicit `any`**: Always type request payloads and injected objects properly. If an injected property (like `user`) is not available on the base `Request` type, extend it locally using intersections (`Request & { user: User }`) or by declaring global module augmentations.
  _(Selalu berikan tipe secara tepat pada request payload dan objek yang di-injeksi. Hindari `any`.)_
