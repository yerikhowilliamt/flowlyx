# Error Documentation - Phase 69 (Mobile API Preparation)

## 1. Prisma Generate EPERM — File Locked by Dev Server

### Symptoms

Saat menjalankan `npm run build --workspace=packages/database` (yang memicu `prisma generate`), muncul error:

```
EPERM: operation not permitted, rename '...\.prisma\client\query_engine-windows.dll.node.tmp...' -> '...\.prisma\client\query_engine-windows.dll.node'
```

### Root Cause

Proses dev server (NestJS/Next.js) sedang berjalan di background dan mengunci file binary Prisma Engine (`.dll.node`) di sistem Windows, sehingga Prisma tidak bisa me-replace file tersebut saat proses generate.

### Investigation

Error `EPERM` pada operasi `rename` di Windows saat memanipulasi `.node` file sangat umum terjadi akibat file lock oleh proses Node.js yang sedang aktif.

### Solution

Meminta user untuk mematikan dev server (Ctrl+C), lalu menjalankan ulang perintah generate/build. Setelah berhasil, dev server bisa dinyalakan kembali.

### Trade-offs

Tidak ada. Ini adalah limitasi OS Windows terkait file locking.

### Prevention

Selalu hentikan semua dev server yang menggunakan Prisma Client sebelum menjalankan `prisma generate` atau `npm run build` di package database.

---

## 2. Prisma Migrate Dev Non-Interactive Environment

### Symptoms

Saat menjalankan perintah migrasi melalui tool command line (PowerShell script):

```
Error: Prisma Migrate has detected that the environment is non-interactive, which is not supported.
`prisma migrate dev` is an interactive command designed to create new migrations and evolve the database in development.
```

### Root Cause

Command `prisma migrate dev` mengharuskan environment TTY yang interaktif untuk prompt konfirmasi (misal saat ada peringatan data loss). Sub-shell PowerShell yang digunakan oleh agen AI tidak bersifat interaktif.

### Investigation

Error message dari Prisma sangat eksplisit menjelaskan bahwa environment eksekusi non-interactive tidak didukung untuk `migrate dev`.

### Solution

Meminta user untuk menjalankan perintah secara manual di terminal mereka sendiri:
`cd packages/database && npx prisma migrate dev --name add_mobile_devices`

### Trade-offs

Membutuhkan intervensi manual dari user.

### Prevention

Jika ingin diotomatisasi tanpa intervensi, gunakan `prisma migrate deploy` dengan membuat file SQL migration-nya secara manual (walaupun ini lebih rentan terhadap schema drift). Jika ingin aman, delegasikan `migrate dev` ke user.
