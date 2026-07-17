# Phase 12 - Project: Prisma Migration Authentication Failed / Environment Variable Not Found

## Symptoms (Gejala)

During the execution of the `npx prisma migrate dev` command in the `packages/database` directory to add the `Project` entity, the following errors were encountered sequentially:
_(Selama pengeksekusian perintah `npx prisma migrate dev` di dalam direktori `packages/database` untuk menambahkan entitas `Project`, beberapa error berikut ditemui secara berurutan:)_

1. **Initial Error (Error Awal) (P1012)**:

```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
```

2. **Subsequent Error (Error Lanjutan) (P1000)** (after configuring `.env` and starting Docker / _setelah mengatur `.env` dan menyalakan Docker_):

```
Error: P1000: Authentication failed against database server at `127.0.0.1`, the provided database credentials for `postgres` are not valid.
```

## Root Cause (Akar Masalah)

1. **Missing Configuration (Konfigurasi Hilang)**: The Prisma CLI relies on the `DATABASE_URL` environment variable for database connections. The `packages/database` directory did not have a `.env` file containing this variable.
   _(Prisma CLI sangat bergantung pada environment variable `DATABASE_URL` untuk koneksi ke database. Direktori `packages/database` saat itu belum memiliki file `.env` yang berisi variabel tersebut.)_
2. **Port Conflict (Tabrakan Port)**: After providing a `.env` with a connection URL targeting `localhost:5432` (via Docker), authentication failed. The root cause was that a native PostgreSQL service was already running on the Windows host machine bound to port `5432`. Prisma CLI silently connected to the native host database instead of the Docker container, leading to a credentials mismatch.
   _(Setelah melengkapi file `.env` dengan URL koneksi yang mengarah ke `localhost:5432` (via Docker), proses otentikasi gagal. Akar masalahnya adalah karena sebuah layanan native PostgreSQL ternyata sudah berjalan secara tersembunyi pada mesin host Windows yang menggunakan port `5432`. Prisma CLI secara diam-diam terhubung ke database native host ini ketimbang ke dalam container Docker, yang menyebabkan terjadinya ketidakcocokan kredensial (credentials mismatch).)_

## Investigation (Investigasi)

- The first error explicitly mentioned `Environment variable not found: DATABASE_URL`.
  _(Error pertama secara terang-terangan menyebutkan `Environment variable not found: DATABASE_URL`.)_
- After creating the `.env` and bringing up `docker-compose`, the Docker container logs confirmed that PostgreSQL initialized successfully with the requested `POSTGRES_PASSWORD`.
  _(Setelah membuat `.env` dan menyalakan `docker-compose`, log pada container Docker mengonfirmasi bahwa PostgreSQL telah berhasil diinisialisasi dengan `POSTGRES_PASSWORD` yang diminta.)_
- Execution of `docker exec flowlyx-db psql -U postgres -d flowlyx -c "SELECT 1;"` was successful, indicating the database was healthy internally.
  _(Eksekusi `docker exec flowlyx-db psql -U postgres -d flowlyx -c "SELECT 1;"` berjalan sukses, yang mengindikasikan bahwa database tersebut dalam kondisi sehat secara internal.)_
- Inspecting native processes on Windows (`Get-Process -Name postgres*`) revealed that PostgreSQL was actively running natively outside of Docker.
  _(Melakukan inspeksi pada process bawaan Windows (`Get-Process -Name postgres*`) mengungkap fakta bahwa PostgreSQL sedang berjalan aktif secara native di luar Docker.)_

## Solution (Solusi)

1. **Environment Configuration (Konfigurasi Environment)**: Replicated the `.env` file to include `DATABASE_URL` so that Prisma can load the connection string.
   _(Menduplikasi file `.env` untuk menyertakan `DATABASE_URL` agar Prisma dapat memuat connection string.)_
2. **Resolve Port Collision (Penyelesaian Tabrakan Port)**: Modified `docker-compose.yml` to map the container's port `5432` to the host port `5433` (i.e., `5433:5432`).
   _(Memodifikasi `docker-compose.yml` agar melakukan pemetaan port container `5432` menuju port host `5433` (contoh: `5433:5432`).)_
3. **Connection String Update (Pembaruan Connection String)**: Updated the `DATABASE_URL` in the `.env` file to connect via port `5433` (`postgresql://postgres:password@127.0.0.1:5433/flowlyx?schema=public`).
   _(Memperbarui `DATABASE_URL` di dalam file `.env` agar terhubung lewat port `5433` (`postgresql://postgres:password@127.0.0.1:5433/flowlyx?schema=public`).)_
4. **Re-run Migration (Menjalankan Ulang Migrasi)**: Executing `npx prisma migrate dev` ran successfully.
   _(Mengeksekusi ulang `npx prisma migrate dev` berjalan dengan lancar.)_

## Trade-offs (Kelemahan/Pertukaran)

Binding to a non-standard Postgres port (`5433`) requires team members to be aware that the local development database does not run on the default `5432` port. Any direct connections via GUI tools (e.g., pgAdmin, DBeaver) will need to be explicitly configured to use `5433`.
_(Melakukan bind (pengikatan) menuju port Postgres non-standar (`5433`) mengharuskan setiap anggota tim agar menyadari bahwa database pengembangan lokal tidak berjalan di atas port default `5432`. Segala koneksi langsung via GUI (contoh: pgAdmin, DBeaver) perlu dikonfigurasi secara eksplisit agar menggunakan port `5433`.)_

## Prevention (Pencegahan)

- Always verify if a native service is already occupying a default port (like 5432 for Postgres or 6379 for Redis) before configuring Docker services.
  _(Selalu periksa apakah ada layanan native yang sudah menempati suatu port default (seperti 5432 untuk Postgres atau 6379 untuk Redis) sebelum Anda mengkonfigurasi layanan Docker.)_
- Ensure developers set up a local `.env` file with proper connection strings before attempting to run database migrations.
  _(Pastikan para developer telah menyetel file `.env` lokal dengan format connection string yang sesuai sebelum mencoba menjalankan migrasi database.)_
- Centralize port configurations in `docker-compose.yml` and explicitly document them in the repository's setup instructions.
  _(Pusatkan segala konfigurasi port pada `docker-compose.yml` dan dokumentasikan hal tersebut secara gamblang pada instruksi instalasi repositori (setup instructions).)_

## References (Referensi)

- [Prisma Error Code Reference: P1012](https://www.prisma.io/docs/orm/reference/error-reference#p1012)
- [Prisma Error Code Reference: P1000](https://www.prisma.io/docs/orm/reference/error-reference#p1000)
