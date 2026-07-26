# Error Documentation - Phase 68 (Integrations - Slack, Discord, GitHub)

## 1. Prisma Migrate Dev Non-Interactive Environment Error

### Symptoms

Saat menjalankan `prisma migrate dev --name add-integrations` via PowerShell (baik melalui `npx` maupun binary langsung), terminal mengembalikan error:

```
Error: Prisma Migrate has detected that the environment is non-interactive, which is not supported.
`prisma migrate dev` is an interactive command designed to create new migrations and evolve the database in development.
```

### Root Cause

`prisma migrate dev` mendeteksi bahwa terminal tidak bersifat interactive (TTY). Saat dijalankan melalui PowerShell dengan subshell `cmd /c`, Prisma tidak dapat mendeteksi sesi interaktif yang valid untuk konfirmasi prompt.

### Investigation

- Mencoba berbagai cara: `npx prisma`, binary di `node_modules/.bin`, dan via `cmd /c` wrapper.
- Semua metode gagal karena Prisma mendeteksi non-interactive environment.

### Solution

Membuat migration file SQL secara manual, lalu menjalankan `prisma migrate deploy` (yang tidak membutuhkan interactive terminal):

1. Buat folder migration: `packages/database/prisma/migrations/<timestamp>_add_integrations/`
2. Tulis `migration.sql` secara manual sesuai perubahan schema.
3. Jalankan `prisma migrate deploy --schema=...` untuk menerapkan migration.

### Trade-offs

- Migration manual membutuhkan penulisan SQL secara eksplisit — berpotensi drift dari apa yang Prisma generate secara otomatis jika schema sangat kompleks.
- Untuk phase ini schema sederhana (satu tabel baru + satu index + satu FK), sehingga risiko drift sangat rendah.

### Prevention

Untuk fase berikutnya yang membutuhkan Prisma migration di environment PowerShell non-interactive:

- Langsung gunakan pendekatan manual (buat SQL + `migrate deploy`), skip `migrate dev`.
- Atau minta user menjalankan `prisma migrate dev` sendiri di terminal interaktif mereka.

---

## 2. Prisma Migration History Out of Sync (P3018)

### Symptoms

Saat menjalankan `prisma migrate deploy`, muncul error berulang:

```
Error: P3018
A migration failed to apply. New migrations cannot be applied before the error is recovered from.
Migration name: 20260716074004_
Database error code: 42701
Database error: ERROR: column "due_date" of relation "tasks" already exists
```

Error yang sama juga muncul untuk migration `20260717031519_add_avatar_url` dan `20260717040407_add_midtrans`.

### Root Cause

Migration-migration sebelumnya sudah pernah diaplikasikan langsung ke database (kemungkinan via `migrate dev` di sesi lain), namun tabel `_prisma_migrations` tidak mencatatnya sebagai applied — sehingga Prisma mencoba mengaplikasikannya ulang dan gagal karena objek DB sudah ada.

### Investigation

- Menjalankan `migrate deploy` dan membaca error message dengan teliti.
- Error `42701` (column already exists) dan `42P07` (relation already exists) mengkonfirmasi bahwa schema sudah ada di DB, bukan bug di SQL migration file.

### Solution

Menjalankan `prisma migrate resolve --applied <migration_name>` untuk setiap migration yang stuck, satu per satu, sebelum menjalankan `migrate deploy` kembali:

```bash
prisma migrate resolve --applied 20260716074004_
prisma migrate resolve --applied 20260717031519_add_avatar_url
prisma migrate resolve --applied 20260717040407_add_midtrans
prisma migrate deploy
```

### Trade-offs

- `migrate resolve --applied` hanya memperbarui tabel `_prisma_migrations` tanpa menjalankan SQL apapun — aman dilakukan selama kita yakin schema di DB sudah sesuai dengan isi migration file.

### Prevention

Jangan menjalankan DDL langsung ke database tanpa melalui Prisma Migrate, agar tabel `_prisma_migrations` selalu sinkron dengan state DB yang sebenarnya.

---

## 3. Prisma Generate EPERM — File Locked by Dev Server

### Symptoms

Saat menjalankan `prisma generate` atau `npm run build --workspace=packages/database`, muncul error:

```
Error:
EPERM: operation not permitted, rename
'...\.prisma\client\query_engine-windows.dll.node.tmp34900'
-> '...\.prisma\client\query_engine-windows.dll.node'
```

### Root Cause

Dev server NestJS yang sedang berjalan mengunci file `query_engine-windows.dll.node` milik Prisma Client. Windows tidak mengizinkan rename/replace file yang sedang digunakan oleh proses lain.

### Investigation

- Error `EPERM` pada operasi `rename` ke file `.dll.node` adalah signature khas Windows file lock.
- Sesuai Debugging Protocol: ini adalah pola umum yang tidak memerlukan investigasi lebih lanjut.

### Solution

Stop dev server terlebih dahulu, kemudian jalankan ulang generate:

```bash
# Stop dev server (Ctrl+C di terminal dev)
npm run build --workspace=packages/database
# Lalu start ulang dev server
```

### Trade-offs

- Tidak ada. Generate harus dilakukan dengan dev server mati di Windows.

### Prevention

Selalu matikan dev server sebelum menjalankan `prisma generate` di environment Windows. Jadikan ini bagian dari workflow standar saat ada perubahan schema.

---

## 4. ESLint `no-unused-vars` — Prefix `_` Hanya untuk Args, Bukan Vars

### Symptoms

Setelah refactor `update()` dan `remove()` untuk menggunakan `where: { id }` (tanpa perlu menyimpan hasil `findOne`), ESLint mengembalikan error:

```
'_integration' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

### Root Cause

Konfigurasi ESLint di `packages/config/eslint-preset.js` menggunakan:

```js
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
```

`argsIgnorePattern` hanya mengabaikan **function arguments** yang diawali `_`, bukan **local variables**. Sehingga `const _integration = ...` tetap dianggap error.

### Investigation

- Membaca konfigurasi ESLint di `packages/config/eslint-preset.js`.
- Memverifikasi bahwa `varsIgnorePattern` tidak dikonfigurasi.

### Solution

Hapus assignment sepenuhnya — cukup `await this.findOne(id)` tanpa menyimpan hasilnya. Method `findOne` sudah throw `NotFoundException` jika tidak ditemukan, sehingga nilai return tidak diperlukan:

```ts
await this.findOne(id);
```

### Trade-offs

- Tidak ada. Ini justru lebih ringkas dan idiomatis — guard call tanpa side effect.

### Prevention

Jika butuh mengabaikan local variable, gunakan `varsIgnorePattern: '^_'` di eslint config, atau cukup hindari assignment jika nilai return tidak digunakan.
