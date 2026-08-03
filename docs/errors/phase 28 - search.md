# Phase 28 - Search: Naive ILIKE Performance and Global Pagination Limitations

## Symptoms (Gejala)

As the database grows, search queries against the `Task`, `Project`, and `Workspace` tables will progressively slow down, potentially leading to slow API response times or timeouts during execution. Additionally, global pagination (e.g., retrieving page 2 of a mixed result set) is not natively supported.

_(Seiring bertambahnya ukuran database, query pencarian pada tabel `Task`, `Project`, dan `Workspace` akan secara bertahap melambat, yang berpotensi menyebabkan waktu respons API menjadi lambat atau terjadinya timeout saat eksekusi. Selain itu, paginasi global (misalnya, mengambil halaman 2 dari kumpulan hasil campuran) tidak didukung secara bawaan.)_

## Root Cause (Akar Masalah)

The implementation utilizes Prisma's `contains: q, mode: 'insensitive'` under the hood, which translates to a naive `ILIKE '%query%'` SQL query.

_(Implementasi ini menggunakan `contains: q, mode: 'insensitive'` milik Prisma di balik layar, yang diterjemahkan menjadi query SQL `ILIKE '%query%'` sederhana.)_

1. **Full Table Scans (Pemindaian Tabel Penuh)**: PostgreSQL cannot utilize standard B-Tree indexes for leading wildcard searches (`%query`).
   _(PostgreSQL tidak dapat menggunakan indeks B-Tree standar untuk pencarian wildcard di awal kata (`%query`).)_
2. **Disconnected Entities (Entitas Terpisah)**: Tasks, Projects, and Workspaces are distinct tables. A single pagination offset cannot be cleanly applied across three concurrent `Promise.all` queries.
   _(Task, Project, dan Workspace adalah tabel yang berbeda. Offset paginasi tunggal tidak bisa diterapkan dengan bersih di tiga query `Promise.all` yang berjalan bersamaan.)_

## Investigation (Investigasi)

- Evaluated implementing a dedicated Search Engine (Elasticsearch / Algolia) but determined it violated the "Ponytail / YAGNI" rule due to the massive infrastructure overhead for an early-stage feature.
  _(Mengevaluasi penerapan Search Engine khusus (Elasticsearch / Algolia) namun memutuskan bahwa hal tersebut melanggar aturan "Ponytail / YAGNI" karena beban infrastruktur yang masif untuk fitur tahap awal.)_
- Evaluated PostgreSQL Views but found RBAC (Role-Based Access Control) implementation too complex for a unified view at this stage.
  _(Mengevaluasi penggunaan PostgreSQL Views namun menemukan bahwa implementasi RBAC terlalu rumit untuk view terpadu pada tahap ini.)_

## Solution (Solusi)

1. **Grouped Concurrent Queries (Query Paralel Terkelompok)**:
   Implemented a `Promise.all` approach that queries the tables concurrently and returns a grouped object (`{ tasks, projects, workspaces }`).
   _(Menerapkan pendekatan `Promise.all` yang melakukan query ke tabel-tabel secara paralel dan mengembalikan objek yang dikelompokkan (`{ tasks, projects, workspaces }`).)_

2. **Entity-Specific Limits (Batas Spesifik Entitas)**:
   Instead of global pagination, a `limit` parameter is applied individually to each query (default 10). If a user searches "Bug", they receive up to 10 Tasks, 10 Projects, and 10 Workspaces.
   _(Alih-alih menggunakan paginasi global, parameter `limit` diterapkan secara individual ke setiap query (bawaan 10). Jika pengguna mencari "Bug", mereka menerima maksimal 10 Task, 10 Project, dan 10 Workspace.)_

## Prevention (Pencegahan)

- **Monitor Slow Queries (Pantau Query Lambat)**: A `// ponytail: naive ILIKE scan` comment was added to the service to explicitly document the known ceiling of this approach.
  _(Komentar `// ponytail: naive ILIKE scan` ditambahkan ke service untuk mendokumentasikan batas maksimal (ceiling) dari pendekatan ini secara eksplisit.)_
- **Future Upgrade Path (Jalur Peningkatan di Masa Depan)**: Once performance demonstrably degrades, the schema should be updated to use PostgreSQL Full-Text Search (`tsvector`) or `pg_trgm` indexes on the searchable columns before migrating to an external search engine.
  _(Setelah performa terbukti menurun, skema harus diperbarui menggunakan PostgreSQL Full-Text Search (`tsvector`) atau indeks `pg_trgm` pada kolom yang dapat dicari sebelum bermigrasi ke mesin pencari eksternal.)_
