# 🐛 Error & Bug Resolutions / Resolusi Error & Bug

This document records technical issues encountered during development and the solutions implemented to resolve them.
_(Dokumen ini mencatat masalah teknis yang ditemui selama pengembangan dan solusi yang diterapkan untuk menyelesaikannya.)_

---

### 1. Error: `Property 'organizationId' has no initializer`

- **Cause (Penyebab):** TypeScript's `strictPropertyInitialization` rule blocked class properties that weren't explicitly initialized in a constructor.
  _(Aturan `strictPropertyInitialization` pada TypeScript memblokir properti kelas yang tidak diinisialisasi secara eksplisit di dalam konstruktor.)_
- **Solution (Solusi - Ponytail Strategy):** Since these models function as DTOs and their data is dynamically hydrated, the Definite Assignment Assertion (`!`) operator was appended to properties (e.g., `organizationId!: string;`) instead of creating extensive constructor boilerplate.
  _(Karena model ini berfungsi sebagai DTO dan datanya dihidrasi secara dinamis, operator Definite Assignment Assertion (`!`) ditambahkan pada properti (contoh: `organizationId!: string;`) alih-alih membuat boilerplate konstruktor yang panjang.)_

### 2. Error: `unable to determine transport target for "pino-pretty"`

- **Cause (Penyebab):** The API's default logger (`nestjs-pino`) was configured to use `pino-pretty` as a terminal log formatter when running in a development environment (`NODE_ENV !== 'production'`). However, `pino-pretty` was missing from the dependency list (`package.json`).
  _(Logger bawaan API (`nestjs-pino`) dikonfigurasi untuk menggunakan `pino-pretty` sebagai pemformat log terminal saat berjalan di environment pengembangan (`NODE_ENV !== 'production'`). Namun, `pino-pretty` tidak ada dalam daftar dependensi (`package.json`).)_
- **Solution (Solusi):** Executed the `npm install --save-dev pino-pretty` command inside the `apps/api` directory to install the required log formatter module.
  _(Menjalankan perintah `npm install --save-dev pino-pretty` di dalam direktori `apps/api` untuk menginstal modul pemformat log yang dibutuhkan.)_

### 3. Environment Config (`.env`) & Git Tokens Misunderstanding

- **Cause (Penyebab):** Confusion regarding where to store the `GITHUB_TOKEN` versus other API secrets.
  _(Kebingungan mengenai di mana harus menyimpan `GITHUB_TOKEN` dibandingkan dengan secret API lainnya.)_
- **Solution (Solusi):** Provided clarification that Git Personal Access Tokens (for CLI/Push/Pull operations) must be stored at the system level (Windows Credential Manager via `gh auth login`), NOT in the project's `.env`. Meanwhile, NestJS environment variables (like `JWT_SECRET`, `PORT`) should be properly localized by creating an `apps/api/.env` file.
  _(Memberikan klarifikasi bahwa Git Personal Access Tokens (untuk operasi CLI/Push/Pull) harus disimpan pada tingkat sistem (Windows Credential Manager via `gh auth login`), BUKAN di dalam `.env` proyek. Sementara itu, variabel environment NestJS (seperti `JWT_SECRET`, `PORT`) harus dilokalisasi dengan benar dengan membuat file `apps/api/.env`.)_
