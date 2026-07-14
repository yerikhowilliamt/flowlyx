# Phase 21 - Prisma Connection Error (P1001)

## Symptoms (Gejala)

Running `npx prisma db push` failed with error: `Error: P1001: Can't reach database server at 127.0.0.1:5433`.

_(Menjalankan `npx prisma db push` gagal dengan error: `Error: P1001: Can't reach database server at 127.0.0.1:5433`.)_

## Root Cause (Akar Masalah)

The local PostgreSQL database container was not running on the expected port `5433`, preventing Prisma from connecting and pushing the schema changes.

_(Container database PostgreSQL lokal tidak berjalan pada port yang diharapkan `5433`, sehingga mencegah Prisma untuk terhubung dan menerapkan perubahan skema.)_

## Investigation (Investigasi)

- The error output explicitly stated that the database server could not be reached.
  _(Output error secara eksplisit menyatakan bahwa server database tidak dapat dijangkau.)_
- Verified that the `.env` file pointed to `127.0.0.1:5433` but the Docker container was inactive.
  _(Telah diverifikasi bahwa file `.env` menunjuk ke `127.0.0.1:5433` namun container Docker sedang tidak aktif.)_

## Solution (Solusi)

1. **Local Prisma Generation (Generate Prisma Lokal)**:
   Instead of forcing a database push to an offline server during development, we ran `npx prisma generate` to generate the Prisma Client types locally. The actual database migration will be handled when the container is spun up or in the CI/CD pipeline.
   _(Alih-alih memaksakan push database ke server yang sedang offline selama masa pengembangan, kami menjalankan `npx prisma generate` untuk men-generate tipe Prisma Client secara lokal. Migrasi database yang sebenarnya akan ditangani ketika container dinyalakan atau di dalam pipeline CI/CD.)_

## Prevention (Pencegahan)

- **Ensure Services are Running (Pastikan Service Berjalan)**: Ensure the `docker-compose` stack is fully running before executing `prisma db push` or `prisma migrate dev`.
  _(Pastikan stack `docker-compose` sudah berjalan sepenuhnya sebelum mengeksekusi `prisma db push` atau `prisma migrate dev`.)_

---

# Phase 21 - Type Check Script Mismatch

## Symptoms (Gejala)

Running `npm run typecheck` failed with `Missing script: "typecheck"`.

_(Menjalankan `npm run typecheck` gagal dengan pesan `Missing script: "typecheck"`.)_

## Root Cause (Akar Masalah)

The script defined in `package.json` for running the TypeScript compiler without emitting files is named `type-check`, not `typecheck`.

_(Script yang didefinisikan di `package.json` untuk menjalankan compiler TypeScript tanpa menghasilkan file bernama `type-check`, bukan `typecheck`.)_

## Investigation (Investigasi)

- The npm error output suggested `Did you mean this? npm run type-check`.
  _(Output error npm menyarankan `Did you mean this? npm run type-check`.)_

## Solution (Solusi)

1. **Use Correct Script Name (Gunakan Nama Script yang Benar)**:
   Executed `npm run type-check` instead.
   _(Mengeksekusi `npm run type-check` sebagai gantinya.)_

## Prevention (Pencegahan)

- **Check Available Scripts (Periksa Script yang Tersedia)**: Check `package.json` scripts list (`npm run`) before assuming standard script names if they fail.
  _(Periksa daftar script pada `package.json` (dengan `npm run`) sebelum berasumsi menggunakan nama script standar jika terjadi kegagalan.)_

---

# Phase 21 - ESLint Strictness in Test Files

## Symptoms (Gejala)

ESLint threw errors in `.spec.ts` files for using `any` (e.g., `Unexpected any. Specify a different type`) and for unused imports (`'NotFoundException' is defined but never used`).

_(ESLint memunculkan error pada file `.spec.ts` karena penggunaan `any` (contoh: `Unexpected any. Specify a different type`) dan untuk impor yang tidak digunakan (`'NotFoundException' is defined but never used`).)_

## Root Cause (Akar Masalah)

The ESLint configuration in this repository is strict and does not permit `any` types or unused imports, even within test files where mocking often relies on type casting.

_(Konfigurasi ESLint di repositori ini sangat ketat dan tidak mengizinkan tipe `any` atau impor yang tidak digunakan, bahkan di dalam file pengujian di mana proses mocking sering kali bergantung pada type casting.)_

## Investigation (Investigasi)

- Reviewed the ESLint error output which pointed exactly to the lines in `task-comments.controller.spec.ts` and `task-comments.service.spec.ts`.
  _(Meninjau output error ESLint yang secara tepat menunjuk ke baris-baris di `task-comments.controller.spec.ts` dan `task-comments.service.spec.ts`.)_

## Solution (Solusi)

1. **Remove Unused Imports (Hapus Impor yang Tidak Digunakan)**:
   Removed the unused `NotFoundException` import.
   _(Menghapus impor `NotFoundException` yang tidak digunakan.)_
2. **Replace `any` with Specific Types (Ganti `any` dengan Tipe Spesifik)**:
   Replaced `as any` casts with specific types (`as User`, `as PaginationDto`) and imported the required types from the database and core modules.
   _(Mengganti konversi `as any` dengan tipe-tipe spesifik (`as User`, `as PaginationDto`) dan mengimpor tipe-tipe yang dibutuhkan dari modul database dan core.)_

## Prevention (Pencegahan)

- **Type-Safe Mocking (Mocking yang Type-Safe)**: Always import the actual types and avoid `as any` when writing mock objects in test files.
  _(Selalu impor tipe-tipe yang asli dan hindari penggunaan `as any` ketika menulis objek mock di dalam file pengujian.)_
