# Phase 22 - Linter Error: Usage of `any` Type (@typescript-eslint/no-explicit-any)

## Symptoms (Gejala)

The project enforces a strict "No explicit any" rule. Using `req: any` in the Controller and `as any` when mocking in tests caused the CI/CD pipeline to fail during the `npm run lint` step.

_(Proyek memberlakukan aturan ketat "No explicit any" (tanpa menggunakan tipe data `any` sama sekali). Penggunaan `req: any` di dalam Controller dan `as any` pada saat melakukan *mocking* dalam pengujian menyebabkan kegagalan pipeline CI/CD di tahap `npm run lint`.)_

## Root Cause (Akar Masalah)

The `@typescript-eslint/no-explicit-any` rule forbids the usage of the `any` type to ensure strict type safety across the codebase. Bypassing types using `any` during development or mocking triggered this rule.

_(Aturan `@typescript-eslint/no-explicit-any` melarang penggunaan tipe `any` untuk memastikan keamanan tipe yang ketat di seluruh basis kode. Mengabaikan tipe menggunakan `any` selama masa pengembangan atau saat *mocking* memicu aturan ini.)_

## Investigation (Investigasi)

- The ESLint output highlighted `req: any` in `task-attachments.controller.ts` and `as any` assertions in `task-attachments.service.spec.ts`.
  _(Output ESLint menyoroti `req: any` di `task-attachments.controller.ts` dan asersi `as any` di `task-attachments.service.spec.ts`.)_

## Solution (Solusi)

1. **Strictly Type Controller Parameters (Ketik Parameter Controller Secara Ketat)**:
   In the Controller, the request parameter was strictly typed, for example: `@Request() req: { user: { id: string } }`.
   _(Pada Controller, parameter request didefinisikan secara spesifik, contohnya: `@Request() req: { user: { id: string } }`.)_
2. **Type-Safe Mocking (Mocking yang Type-Safe)**:
   In tests (`.spec.ts`), type casting was done in a more type-safe manner using the actual type or using a fallback to `as never` / `as unknown as Type`.
   _(Pada pengujian (`.spec.ts`), konversi tipe dilakukan dengan cara yang lebih *type-safe* menggunakan tipe aslinya atau fallback ke `as never` / `as unknown as Type`.)_

## Prevention (Pencegahan)

- **Avoid `any` (Hindari `any`)**: Never use the `any` keyword. Rely on generics, `unknown`, or proper interface definitions even in test files.
  _(Jangan pernah gunakan kata kunci `any`. Bergantunglah pada generics, `unknown`, atau definisi interface yang tepat bahkan di dalam file pengujian.)_

---

# Phase 22 - Linter Error: Usage of `require()` (@typescript-eslint/no-require-imports)

## Symptoms (Gejala)

ESLint threw an error for using `require()` to import the `streamifier` package.

_(ESLint memunculkan error karena penggunaan `require()` untuk mengimpor paket `streamifier`.)_

## Root Cause (Akar Masalah)

The `streamifier` package was initially imported using CommonJS style: `const streamifier = require('streamifier');`. This is forbidden in projects with modern ES Module ecosystems enforced by ESLint.

_(Paket `streamifier` awalnya diimpor menggunakan gaya CommonJS: `const streamifier = require('streamifier');`. Hal ini dilarang pada proyek dengan ekosistem ES Module modern yang ditegakkan oleh ESLint.)_

## Investigation (Investigasi)

- ESLint flagged the `require` statement in `cloudinary.service.ts` with `@typescript-eslint/no-require-imports`.
  _(ESLint menandai pernyataan `require` di `cloudinary.service.ts` dengan peringatan `@typescript-eslint/no-require-imports`.)_

## Solution (Solusi)

1. **Use ES6 Imports (Gunakan Impor ES6)**:
   Updated to the TypeScript/ES6 import standard: `import * as streamifier from 'streamifier';`.
   _(Diperbarui menjadi standar impor TypeScript/ES6: `import * as streamifier from 'streamifier';`.)_

## Prevention (Pencegahan)

- **Standardize Import Syntax (Standarisasi Sintaks Impor)**: Always use `import` syntax (`import * as x from 'y'` or `import x from 'y'`) instead of `require()`.
  _(Selalu gunakan sintaks `import` (`import * as x from 'y'` atau `import x from 'y'`) alih-alih `require()`.)_

---

# Phase 22 - Type Check Error (TS2769): Mocking Private Method in Jest

## Symptoms (Gejala)

In the `task-attachments.service.spec.ts` file, attempting to mock the private method `verifyAccess` using `jest.spyOn()` resulted in a type overload mismatch during the static type checking phase (`npm run type-check`).

_(Dalam file `task-attachments.service.spec.ts`, upaya untuk melakukan intersepsi (mocking) pada *private method* `verifyAccess` menggunakan `jest.spyOn()` menghasilkan *type overload mismatch* pada saat tahap pemeriksaan tipe statis (`npm run type-check`).)_

## Root Cause (Akar Masalah)

TypeScript strictly enforces access modifiers. `jest.spyOn` cannot easily spy on a method marked as `private` without conflicting with the class's public interface typings.

_(TypeScript secara ketat menegakkan modifier akses. `jest.spyOn` tidak dapat dengan mudah memantau metode yang ditandai sebagai `private` tanpa bertentangan dengan tipe antarmuka publik dari kelas tersebut.)_

## Investigation (Investigasi)

- The command `tsc --noEmit` failed with `TS2769: No overload matches this call` on the `jest.spyOn(service as any, 'verifyAccess')` line.
  _(Perintah `tsc --noEmit` gagal dengan pesan `TS2769: No overload matches this call` pada baris `jest.spyOn(service as any, 'verifyAccess')`.)_

## Solution (Solusi)

1. **Bypass Access Modifier via Bracket Notation (Melewati Modifier Akses via Notasi Kurung Siku)**:
   Bypassed type validation by directly overriding the function on the instance using bracket notation and `as never`:
   _(Melewati validasi tipe dengan menimpa fungsi secara langsung pada *instance* menggunakan notasi kurung siku dan `as never`:)_

   ```typescript
   service['verifyAccess'] = jest.fn().mockResolvedValue(true) as never;
   ```

## Prevention (Pencegahan)

- **Avoid Spying on Private Methods (Hindari Memantau Metode Private)**: Ideally, private methods should be tested through the public methods that call them. If a private method must be mocked, use bracket notation injection carefully.
  _(Idealnya, metode private harus diuji melalui metode publik yang memanggilnya. Jika metode private memang harus di-mock, gunakan injeksi dengan notasi kurung siku secara hati-hati.)_

---

# Phase 22 - Logging Standard Violation (Console vs Logger)

## Symptoms (Gejala)

A code block was found using `console.error(...)` for Cloudinary error handling.

_(Ditemukan bagian kode yang menggunakan `console.error(...)` untuk penanganan error Cloudinary.)_

## Root Cause (Akar Masalah)

The usage of `console.error(...)` violated the project's Engineering Handbook, which mandates the exclusive use of injected `Logger` (based on `nestjs-pino`) to ensure proper structured JSON logging in production.

_(Penggunaan `console.error(...)` melanggar *Engineering Handbook* proyek, yang mewajibkan penggunaan injeksi *Logger* (berbasis `nestjs-pino`) secara eksklusif untuk memastikan struktur logging JSON yang tepat saat produksi.)_

## Investigation (Investigasi)

- The violation was caught during a code review pass targeting adherence to project guidelines.
  _(Pelanggaran ini tertangkap selama proses code review yang menargetkan kepatuhan terhadap pedoman proyek.)_

## Solution (Solusi)

1. **Use NestJS Logger (Gunakan Logger NestJS)**:
   Removed `console.error` and replaced it with the official NestJS logger instance.
   _(Menghapus `console.error` dan menggantinya dengan instalasi *instance logger* resmi NestJS.)_

   ```typescript
   private readonly logger = new Logger(TaskAttachmentsService.name);
   // ...
   this.logger.error('Failed to delete old file from Cloudinary', error);
   ```

## Prevention (Pencegahan)

- **Consistent Logger Injection (Injeksi Logger yang Konsisten)**: Ensure every service class instantiates its own `Logger` property and strictly uses it instead of native `console` methods.
  _(Pastikan setiap kelas service menginisialisasi properti `Logger`-nya sendiri dan secara ketat menggunakannya alih-alih metode `console` bawaan.)_

---

# Phase 22 - Windows PowerShell Execution Compatibility

## Symptoms (Gejala)

Sequential test commands using logical operators (`npm run lint && npm run test`) triggered a parsing error in the Windows PowerShell environment.

_(Perintah pengujian berurutan dengan menggunakan operator logis (`npm run lint && npm run test`) menimbulkan galat parser (*parsing error*) di *environment* Windows PowerShell.)_

## Root Cause (Akar Masalah)

The `&&` token is not a valid native syntax operator in older versions of Windows PowerShell (prior to PowerShell 7).

_(Token `&&` bukanlah sintaks operator bawaan yang valid di versi Windows PowerShell yang lebih lama (sebelum PowerShell 7).)_

## Investigation (Investigasi)

- The terminal threw an error stating `The token '&&' is not a valid statement separator in this version.`
  _(Terminal memunculkan error yang menyatakan `The token '&&' is not a valid statement separator in this version.`.)_

## Solution (Solusi)

1. **Use Semicolon Separator (Gunakan Pemisah Titik Koma)**:
   The operator was changed to a semicolon (`;`) to safely execute multiple sequential commands.
   _(Operator dirubah menjadi titik koma (`;`) untuk mengeksekusi multi perintah secara berurutan dan aman.)_

   ```powershell
   npm run lint; npm run type-check; npm run test -- task-attachments
   ```

## Prevention (Pencegahan)

- **Cross-platform Scripting (Scripting Lintas Platform)**: When running multiple commands manually in PowerShell, use `;`. Alternatively, rely on `npm` scripts defined in `package.json` utilizing `npm-run-all` or similar packages for cross-platform sequential execution.
  _(Saat menjalankan beberapa perintah secara manual di PowerShell, gunakan `;`. Sebagai alternatif, bergantunglah pada script `npm` yang didefinisikan di `package.json` yang menggunakan `npm-run-all` atau paket serupa untuk eksekusi berurutan lintas platform.)_
