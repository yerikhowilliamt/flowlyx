# Phase 51 - Project UI: TypeScript Type Mismatch on ProjectSummary Description

## Symptoms (Gejala)

During the execution of `npm run type-check` after implementing the Project UI component, the TypeScript compilation failed with the following errors:

_(Selama eksekusi `npm run type-check` setelah mengimplementasikan komponen Project UI, kompilasi TypeScript mengalami kegagalan dengan error berikut:)_

```bash
src/features/projects/components/project-list.tsx(100,26): error TS2339: Property 'description' does not exist on type 'ProjectSummary'.
src/features/projects/components/project-list.tsx(102,30): error TS2339: Property 'description' does not exist on type 'ProjectSummary'.
```

## Root Cause (Akar Masalah)

The backend endpoint for listing projects in a workspace (`GET /projects?workspaceId=...`) is decorated with `@Serialize([ProjectSummary])`.

_(Endpoint backend untuk menampilkan daftar project di dalam workspace (`GET /projects?workspaceId=...`) didekorasikan dengan `@Serialize([ProjectSummary])`.)_

In the backend model `project.model.ts`, `ProjectSummary` only exposed the core fields (`id`, `workspaceId`, `name`, `slug`, `status`) and explicitly excluded `description`. The frontend type `ProjectSummary` mirrored this layout. However, the rendering logic inside `project-list.tsx` required displaying `project.description` on project cards. This triggered a TypeScript compilation error because the API contract did not include the description.

_(Di dalam model backend `project.model.ts`, `ProjectSummary` hanya mengekspos properti inti (`id`, `workspaceId`, `name`, `slug`, `status`) dan secara eksplisit mengecualikan `description`. Tipe frontend `ProjectSummary` meniru desain ini. Namun, logika rendering di dalam `project-list.tsx` membutuhkan tampilan `project.description` pada kartu project. Hal ini memicu error kompilasi TypeScript karena kontrak API tidak menyertakan deskripsi tersebut.)_

## Investigation (Investigasi)

1. Checked the backend implementation in [projects.controller.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/modules/projects/projects.controller.ts) and verified that the `findAll` endpoint serializes outputs using `ProjectSummary`.
   _(Memeriksa implementasi backend di [projects.controller.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/modules/projects/projects.controller.ts) dan memverifikasi bahwa endpoint `findAll` menyerialisasi data keluaran menggunakan `ProjectSummary`.)_
2. Checked [project.model.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/models/project.model.ts) and confirmed that `description` was omitted from `ProjectSummary` but present in `ProjectResponse`.
   _(Memeriksa [project.model.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/models/project.model.ts) dan mengonfirmasi bahwa `description` dilewatkan dari `ProjectSummary` tetapi ada di dalam `ProjectResponse`.)_

## Solution (Solusi)

To retain and display project descriptions on the dashboard while keeping clean, robust types:

_(Untuk mempertahankan dan menampilkan deskripsi project pada dashboard dengan tipe data yang bersih dan kokoh:)_

1. Modified the backend [project.model.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/models/project.model.ts) to add `@ApiPropertyOptional()` and `@Expose()` decorators for `description` in the `ProjectSummary` class.
   _(Memodifikasi backend [project.model.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/models/project.model.ts) untuk menambahkan dekorator `@ApiPropertyOptional()` dan `@Expose()` pada properti `description` di dalam class `ProjectSummary`.)_
2. Added the optional `description?: string | null` property to the frontend `ProjectSummary` type in [project.types.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/projects/types/project.types.ts).
   _(Menambahkan properti opsional `description?: string | null` pada tipe frontend `ProjectSummary` di dalam [project.types.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/projects/types/project.types.ts).)_
3. Restored the project description rendering block inside [project-list.tsx](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/projects/components/project-list.tsx).
   _(Mengembalikan blok rendering deskripsi project di dalam [project-list.tsx](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/projects/components/project-list.tsx).)_

## Prevention (Pencegahan)

- **API Payload and UI Sync (Sinkronisasi Payload API dan UI)**: When creating dashboard cards or lists, verify if the backend uses a summary DTO that strips out required fields. If a field is needed in the UI, extend the summary DTO rather than bypassing the type checkers.
  _(Saat membuat kartu atau list dashboard, verifikasi apakah backend menggunakan DTO ringkasan yang memotong field yang dibutuhkan. Jika suatu field dibutuhkan di UI, perluas DTO ringkasan tersebut alih-alih melewati pemeriksa tipe data (type checkers).)_
