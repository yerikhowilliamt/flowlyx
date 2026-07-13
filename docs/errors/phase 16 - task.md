# Phase 16 - Task: Prisma Migration Database Unreachable (P1001)

## Symptoms (Gejala)

During the implementation of Phase 16 (Task module), running `npx prisma migrate dev --name add-task-model` resulted in the following failure:
_(Selama implementasi Phase 16 (modul Task), menjalankan perintah `npx prisma migrate dev --name add-task-model` berujung pada kegagalan berikut:)_

```
Error: P1001: Can't reach database server at `127.0.0.1:5433`

Please make sure your database server is running at `127.0.0.1:5433`.
```

The migration file was not created and the `tasks` table was not applied to the database.
_(File migrasi tidak terbuat dan tabel `tasks` belum teraplikasikan pada database.)_

## Root Cause (Akar Masalah)

The PostgreSQL database server configured in `packages/database/.env` (`DATABASE_URL` pointing to `127.0.0.1:5433`) was not running at the time of migration execution. The Docker Compose service (`docker-compose.yml`) had not been started, so Prisma could not establish a TCP connection to the database.
_(Server database PostgreSQL yang dikonfigurasi di `packages/database/.env` (`DATABASE_URL` menunjuk ke `127.0.0.1:5433`) tidak dalam keadaan berjalan pada saat pengeksekusian migrasi dilakukan. Layanan Docker Compose (`docker-compose.yml`) belum dinyalakan, sehingga Prisma tidak mampu menginisialisasi sambungan TCP terhadap database tersebut.)_

## Investigation (Investigasi)

- Verified the Prisma schema was syntactically valid (`npx prisma generate` succeeded).
  _(Memverifikasi schema Prisma dan memastikannya sudah valid secara tata bahasa/sintaks (`npx prisma generate` sukses dieksekusi).)_
- Confirmed all 15 unit tests passed (mocked database, no real connection needed).
  _(Mengonfirmasi bahwa ke-15 unit test sukses dan berhasil terlewati (menggunakan database mock, tak butuh sambungan betulan).)_
- Checked that the error was strictly a connectivity issue (P1001), not a schema or SQL error.
  _(Memeriksa dan meyakini bahwa error ini merupakan masalah sambungan murni (P1001), bukan karena ada error syntax SQL maupun schema.)_

## Solution (Solusi)

Start the database before running the migration:
_(Menjalankan database sebelum memanggil migrasi:)_

```bash
docker compose up -d
npx prisma migrate dev --name add-task-model
```

No code changes required — the schema and application code are correct.
_(Tidak dibutuhkan satupun perubahan kode — susunan schema dan aplikasi sudah sepenuhnya benar.)_

## Trade-offs (Kelemahan/Pertukaran)

- **None (Tidak ada)**: This is a runtime environment issue, not a code defect. The migration will succeed once the database is available.
  _(Ini merupakan isu murni akibat status environment pada saat berjalan, dan bukan kerusakan dari kodenya. Proses migrasi akan berhasil tepat di saat database kembali normal.)_

## Prevention (Pencegahan)

- **Pre-flight check (Pengecekan pra-eksekusi)**: Before running migrations, verify the database is reachable (`docker compose ps` or `pg_isready -h 127.0.0.1 -p 5433`).
  _(Sebelum mengeksekusi migrasi, pastikan database bisa terhubung (`docker compose ps` atau `pg_isready -h 127.0.0.1 -p 5433`).)_
- **CI/CD pipeline**: Ensure the database service is started as a dependency before the migration step in any automated workflow.
  _(Pastikan service database berjalan sebagai dependensi awal sebelum migrasi dieksekusi di dalam rentetan workflow yang terotomatisasi.)_

## References (Referensi)

- [Prisma Error Reference: P1001](https://www.prisma.io/docs/reference/api-reference/error-reference#p1001)
- [Docker Compose documentation](https://docs.docker.com/compose/)

---

# Phase 16 - Task: Commitlint body-max-line-length Violation

## Symptoms (Gejala)

During `git commit`, husky's commit-msg hook rejected the commit with:
_(Selama pemanggilan `git commit`, hook milik husky yaitu commit-msg menolak proses commit dengan pesan berikut:)_

```
⧗   input: feat(tasks): implement Task module (Phase 16)
✖   body's lines must not be longer than 100 characters [body-max-line-length]
✖   found 1 problems, 0 warnings
```

## Root Cause (Akar Masalah)

The commit body contained lines exceeding the 100-character limit enforced by `.commitlintrc.json`. Detailed descriptions like `"Add Task model to Prisma schema (belongs to List, with title, description, order, priority, status, audit fields)"` exceeded this threshold.
_(Tubuh (body) pada commit berisi baris-baris panjang yang jauh melebihi batas 100 karakter yang diatur secara ketat oleh `.commitlintrc.json`. Deskripsi menjabarkan panjang layaknya `"Add Task model to Prisma schema (belongs to List, with title, description, order, priority, status, audit fields)"` melampaui batasan ini.)_

## Investigation (Investigasi)

- Identified that `.commitlintrc.json` enforces `body-max-line-length` at 100 characters.
  _(Mengidentifikasi bahwa `.commitlintrc.json` menerapkan aturan `body-max-line-length` tepat di 100 buah karakter.)_
- The commit message body used `-m` flags with full-sentence descriptions that were too long.
  _(Bagian tubuh dari commit memanfaatkan argumen/flag `-m` digabung dengan struktur kalimat penuh yang terlampau panjang.)_

## Solution (Solusi)

Shortened each body line to stay under 100 characters:
_(Memendekkan setiap barisan agar terus berada di bawah batas 100 karakter:)_

```bash
git commit -m "feat(tasks): implement Task module (Phase 16)" \
  -m "- Add Task model to Prisma schema (belongs to List)" \
  -m "- Create TasksModule with CRUD controller, service, Zod DTOs" \
  -m "- Register TasksModule in AppModule" \
  -m "- Add unit tests (15 total: 7 controller, 8 service)" \
  -m "- Add error doc for Phase 16 (P1001 migration error)"
```

## Trade-offs (Kelemahan/Pertukaran)

- **None (Tidak ada)**: Shorter lines are more readable in `git log` anyway.
  _(Baris tulisan yang lebih pendek jauh lebih gampang dan enak dipandang saat melihat riwayat `git log`.)_

## Prevention (Pencegahan)

- Keep commit body lines concise (under 100 characters).
  _(Jaga agar pesan tiap tubuh commit padat dan ringkas (di bawah 100 karakter).)_
- Move detailed descriptions to the PR body instead of the commit message.
  _(Jika ingin menulis detail panjang lebar, gunakan isi di Pull Request, jangan jadikan tubuh di dalam Commit.)_

## References (Referensi)

- [Commitlint: body-max-line-length](https://commitlint.js.org/reference/rules.html)
