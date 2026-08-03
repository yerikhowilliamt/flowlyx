# Phase 42 - Performance Optimization: TypeScript Callable and Linter Any Errors

## Symptoms (Gejala)

During the execution of quality gates (`npm run type-check` and `npm run lint`), two distinct errors occurred:

_(Selama eksekusi gerbang kualitas (`npm run type-check` dan `npm run lint`), terjadi dua error yang berbeda:)_

1. `src/main.ts(18,11): error TS2349: This expression is not callable. Type 'typeof compression' has no call signatures.` (TypeScript Error during build / Error TypeScript saat build)
2. `10:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any` (ESLint Error / Error ESLint)

## Root Cause (Akar Masalah)

1. **TypeScript Callable Error**: The `compression` middleware was imported using the wildcard syntax (`import * as compression from 'compression';`). Due to how the `@types/compression` definitions are structured relative to `esModuleInterop` settings, TypeScript could not infer a callable default export from the wildcard import, treating it merely as a namespace object.
   _(**Error Callable TypeScript**: Middleware `compression` diimpor menggunakan sintaks wildcard (`import * as compression from 'compression';`). Akibat struktur definisi dari `@types/compression` sehubungan dengan pengaturan `esModuleInterop`, TypeScript tidak bisa menyimpulkan adanya ekspor bawaan yang bisa dipanggil dari impor wildcard tersebut, dan hanya menganggapnya sebagai objek namespace.)_

2. **Linter Any Error**: The `PerformanceInterceptor` implemented `NestInterceptor` and returned `Observable<any>` inside its `intercept` method. The project strictly enforces a "no `any` types allowed" policy via ESLint (`@typescript-eslint/no-explicit-any`), causing the linter step to fail.
   _(**Error Any Linter**: `PerformanceInterceptor` mengimplementasikan `NestInterceptor` dan mengembalikan `Observable<any>` di dalam metode `intercept`. Proyek secara ketat memberlakukan aturan larangan penggunaan tipe `any` melalui ESLint (`@typescript-eslint/no-explicit-any`), menyebabkan langkah linter gagal.)_

## Investigation (Investigasi)

- Investigated the TypeScript compilation output and identified that the `compression` module export wasn't directly callable when imported as a wildcard namespace.
  _(Menginvestigasi output kompilasi TypeScript dan mengidentifikasi bahwa ekspor modul `compression` tidak bisa dipanggil secara langsung ketika diimpor sebagai namespace wildcard.)_
- Investigated the ESLint output targeting `performance.interceptor.ts` and identified the explicit usage of `Observable<any>`.
  _(Menginvestigasi output ESLint yang menargetkan `performance.interceptor.ts` dan mengidentifikasi penggunaan eksplisit dari `Observable<any>`.)_

## Solution (Solusi)

1. **Fixing the TypeScript Import (Memperbaiki Impor TypeScript)**:
   Refactored the import statement in `main.ts` from a wildcard import to a default import, allowing TypeScript to correctly resolve the callable middleware function.
   _(Melakukan refactor pada pernyataan impor di `main.ts` dari impor wildcard menjadi impor bawaan (default), yang memungkinkan TypeScript untuk secara tepat menyelesaikan fungsi middleware yang bisa dipanggil tersebut.)_
   `import compression from 'compression';`

2. **Fixing the Explicit Any (Memperbaiki Any Eksplisit)**:
   Replaced the `any` generic type in the return signature of the interceptor with `unknown`, which is a type-safe counterpart to `any` and satisfies the rigorous linter rules.
   _(Mengganti tipe generik `any` pada tipe kembalian interceptor dengan `unknown`, yang merupakan alternatif type-safe untuk `any` dan memenuhi aturan linter yang ketat.)_
   `intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>`

## Prevention (Pencegahan)

- **Use Default Imports for Middleware (Gunakan Impor Default untuk Middleware)**: When importing legacy or common CommonJS-based Express middlewares, prefer `import moduleName from 'module-name'` if `esModuleInterop` is active, as it aligns better with the expected type declarations.
  _(Saat mengimpor middleware Express bawaan CommonJS yang lawas atau umum, lebih disarankan menggunakan `import moduleName from 'module-name'` jika `esModuleInterop` aktif, karena ini lebih selaras dengan deklarasi tipe yang diharapkan.)_
- **Embrace `unknown` over `any` (Gunakan `unknown` ketimbang `any`)**: When a type truly could be anything (like the return value of an intercepted handler), use `unknown` instead of `any`. It forces subsequent consumers to perform type narrowing and satisfies strict TypeScript/ESLint constraints.
  _(Ketika sebuah tipe benar-benar bisa berupa apa saja (seperti nilai kembalian dari handler yang di-intercept), gunakan `unknown` ketimbang `any`. Hal ini memaksa pengguna tipe tersebut selanjutnya untuk melakukan penyempitan tipe (type narrowing) dan memenuhi batasan ketat TypeScript/ESLint.)_
