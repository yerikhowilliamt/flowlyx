# Phase 24 - Notifications: Linter/Typescript Strict Typing Error (No Explicit Any)

## Symptoms (Gejala)

During the CI/CD or linting step (`npm run lint`), the build failed with the following error:
_(Selama proses linting (`npm run lint`), build gagal dengan pesan error berikut:)_

`Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`

This error was triggered in `notifications.controller.ts` and its spec file because the request object (`req`) was loosely typed as `any`.
_(Error ini muncul pada `notifications.controller.ts` dan file spec-nya karena objek request (`req`) diberi tipe `any`.)_

## Root Cause (Akar Masalah)

The project strictly enforces a "no `any` types allowed" policy via ESLint. When accessing the `user` property from the Express `Request` object (which is attached by the JWT Auth Guard), `req: any` was used as a shortcut to bypass TypeScript's type checking.
_(Proyek ini menerapkan kebijakan ketat "dilarang menggunakan tipe `any`" melalui ESLint. Saat mengakses properti `user` dari objek `Request` bawaan Express (yang disematkan oleh JWT Auth Guard), `req: any` digunakan sebagai jalan pintas untuk melewati pemeriksaan tipe TypeScript.)_

## Solution (Solusi)

1. **Type-Safe Request Interface (Interface Request yang Type-Safe):**
   Replaced `any` with an intersection type `Request & { user: User }` in the controller methods, explicitly defining the structure expected from the JWT authentication guard.
   _(Mengganti `any` dengan tipe persimpangan `Request & { user: User }` pada metode-metode controller, mendefinisikan secara eksplisit struktur yang diharapkan dari guard autentikasi JWT.)_

2. **Type-Safe Mock in Tests (Mock Type-Safe di Test):**
   Created a type alias `type RequestWithUser = Request & { user: User }` in the spec file, and casted the mock request object using `as unknown as RequestWithUser` instead of `as any`.
   _(Membuat alias tipe `type RequestWithUser = Request & { user: User }` pada file spec, dan melakukan casting pada objek request mock menggunakan `as unknown as RequestWithUser` alih-alih `as any`.)_

3. **Removing `as any` from query parameters (Menghapus `as any` dari parameter query):**
   When passing mock queries to controller tests, replaced `query as any` with `query as unknown as FindNotificationsDto`.
   _(Saat meneruskan query mock ke test controller, mengganti `query as any` dengan `query as unknown as FindNotificationsDto`.)_

## Prevention (Pencegahan)

- **Avoid `any` for Request Objects (Hindari penggunaan `any` untuk Objek Request):** Always use a properly typed interface (like `RequestWithUser` or `Request & { user: User }`) when extracting data attached by middleware or guards.
  _(Selalu gunakan antarmuka yang diketik dengan benar (seperti `RequestWithUser` atau `Request & { user: User }`) saat mengekstrak data yang disematkan oleh middleware atau guards.)_

---

# Phase 24 - Notifications: Missing Package Manager Command (yarn)

## Symptoms (Gejala)

Attempting to run tests with `yarn test` threw a `CommandNotFoundException` in PowerShell.
_(Mencoba menjalankan test dengan `yarn test` memunculkan `CommandNotFoundException` di PowerShell.)_

## Root Cause (Akar Masalah)

The environment did not have `yarn` installed globally, and the project explicitly uses `npm` as the primary package manager (`npm@10.8.0` is specified in `package.json`).
_(Lingkungan eksekusi tidak memiliki `yarn` yang terinstal secara global, dan proyek ini secara eksplisit menggunakan `npm` sebagai package manager utama (`npm@10.8.0` ditentukan dalam `package.json`).)_

## Solution (Solusi)

Switched from using `yarn` to standard `npm` commands (`npm run test` and `npm run lint`), which correctly utilize the `turbo` scripts defined in `package.json`.
_(Beralih dari menggunakan `yarn` ke perintah standar `npm` (`npm run test` dan `npm run lint`), yang secara tepat menggunakan skrip `turbo` yang didefinisikan dalam `package.json`.)_

## Prevention (Pencegahan)

- **Check `package.json` for package manager (Periksa `package.json` untuk mengetahui package manager):** Always verify the `packageManager` field or lockfiles (`package-lock.json`) before running commands to ensure consistency with the project's tooling.
  _(Selalu verifikasi field `packageManager` atau lockfile (`package-lock.json`) sebelum menjalankan perintah untuk memastikan konsistensi dengan tooling proyek.)_
