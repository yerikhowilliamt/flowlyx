# Troubleshooting & Error Logs / Log Kesalahan & Pemecahan Masalah

This document records common errors encountered during the development of Flowlyx and their respective solutions. / _Dokumen ini mencatat kesalahan umum yang ditemui selama pengembangan Flowlyx dan solusinya._

## 1. Turborepo CI `type-check` Failure: Cannot find module '@flowlyx/database'

**Error Message:**
\`\`\`text
src/modules/auth/auth.controller.ts(6,22): error TS2307: Cannot find module '@flowlyx/database' or its corresponding type declarations.
\`\`\`
**Cause (Penyebab):**
In the GitHub Actions CI, the `type-check` task was running across packages in parallel. The `@flowlyx/api` package attempted to run TypeScript validation before the `@flowlyx/database` package finished building (which runs `prisma generate`).
_Dalam GitHub Actions CI, task `type-check` berjalan paralel. Paket `@flowlyx/api` mencoba menjalankan validasi TypeScript sebelum `@flowlyx/database` selesai di-build._

**Solution (Solusi):**
Modify `turbo.json` to enforce that `type-check` depends on the `build` task of its dependencies.
_Ubah `turbo.json` untuk memaksa agar `type-check` menunggu task `build` selesai._
\`\`\`json
"type-check": {
"dependsOn": ["^build", "^type-check"]
}
\`\`\`

---

## 2. ESLint `@typescript-eslint/no-explicit-any` in Guards

**Error Message:**
\`\`\`text
error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any
\`\`\`
**Cause (Penyebab):**
The `handleRequest` method in NestJS `AuthGuard` overrides typically default to using `any` types for `err`, `user`, and `info`. Flowlyx enforces strict ESLint rules that forbid the use of `any`.
_Metode `handleRequest` pada `AuthGuard` menggunakan tipe data `any` secara bawaan, yang mana dilarang oleh aturan ketat ESLint di Flowlyx._

**Solution (Solusi):**
Replace `any` with explicit types or `unknown` in `jwt-auth.guard.ts`.
_Ganti `any` dengan tipe yang jelas atau `unknown`._
\`\`\`typescript
handleRequest<TUser = Record<string, unknown>>(
err: Error | null,
user: TUser,
_info: unknown,
_context: ExecutionContext,
_status?: unknown,
): TUser { ... }
\`\`\`

---

## 3. Husky `commit-msg` Deprecation Warning

**Error Message:**
\`\`\`text
husky - DEPRECATED
Please remove the following two lines from .husky/commit-msg:
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
\`\`\`
**Cause (Penyebab):**
Newer versions of Husky no longer require the boilerplate shell script initialization lines.
_Versi terbaru Husky tidak lagi memerlukan baris inisialisasi skrip shell tersebut._

**Solution (Solusi):**
Remove the deprecated lines from `.husky/commit-msg` so that it only contains the execution command.
_Hapus baris yang usang tersebut dari `.husky/commit-msg`._
\`\`\`bash

# .husky/commit-msg

npx --no-install commitlint --edit "$1"
\`\`\`

---

## 4. Unused `argon2` import in Tests

**Error Message:**
\`\`\`text
error 'argon2' is defined but never used @typescript-eslint/no-unused-vars
\`\`\`
**Cause (Penyebab):**
`argon2` was imported but only mocked using `jest.mock('argon2')`, leaving the actual import unused in the test file.
_`argon2` diimpor tetapi hanya di-mock, sehingga impor aslinya tidak terpakai._

**Solution (Solusi):**
Remove the `import * as argon2 from 'argon2';` statement from the spec files. The `jest.mock('argon2', ...)` will still function correctly without importing the library.
_Hapus baris impor `argon2` dari file spec._
