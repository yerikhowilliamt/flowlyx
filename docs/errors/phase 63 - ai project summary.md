# Phase 63 - AI Project Summary: Property 'completed' Does Not Exist on Task Type

## Symptoms (Gejala)

During `npm run type-check`, the following TypeScript error was thrown:
_(Selama menjalankan `npm run type-check`, terjadi error TypeScript berikut:)_

```
src/modules/ai-project-summary/ai-project-summary.service.ts(29,53): error TS2339:
Property 'completed' does not exist on type
'{ status: string; id: string; description: string | null; createdAt: Date; updatedAt: Date;
deletedAt: Date | null; createdBy: string | null; updatedBy: string | null; ... }'.
```

## Root Cause (Akar Masalah)

The initial implementation of `AiProjectSummaryService` assumed that the `Task` model had a boolean `completed` field to determine task completion rate:
_(Implementasi awal `AiProjectSummaryService` mengasumsikan bahwa model `Task` memiliki field boolean `completed` untuk menentukan tingkat penyelesaian task:)_

```typescript
const completedTasks = allTasks.filter((t) => t.completed).length;
```

However, the `Task` model in `packages/database/prisma/schema.prisma` does not have a `completed` boolean field. It uses a `status: String` field with a default value of `'ACTIVE'` — and no defined enum values that represent a "completed" state.
_(Namun, model `Task` di `packages/database/prisma/schema.prisma` tidak memiliki field boolean `completed`. Model ini menggunakan field `status: String` dengan nilai default `'ACTIVE'` — dan tidak ada nilai enum yang terdefinisi yang merepresentasikan status "selesai".)_

```prisma
model Task {
  id     String @id @default(uuid()) @db.Uuid
  status String @default("ACTIVE") @map("status")
  // ... tidak ada field 'completed'
}
```

## Investigation (Investigasi)

- Ran `npm run type-check --workspace=apps/api` → error menunjuk tepat ke baris `t.completed`.
  _(Menjalankan `npm run type-check --workspace=apps/api` → error menunjuk tepat ke baris `t.completed`.)_
- Inspected `packages/database/prisma/schema.prisma` model `Task` → confirmed no `completed` field exists.
  _(Memeriksa model `Task` di `packages/database/prisma/schema.prisma` → dikonfirmasi tidak ada field `completed`.)_
- Searched codebase for `status.*DONE|status.*COMPLETED` → no existing "done" status value found in any task-related service.
  _(Mencari di seluruh codebase untuk `status.*DONE|status.*COMPLETED` → tidak ada nilai status "done" yang ditemukan di service manapun yang berkaitan dengan task.)_

## Solution (Solusi)

Removed the assumption of a boolean `completed` field. Instead, the summary metrics were changed to use data that actually exists in the schema: total tasks, total boards, and total lists.
_(Menghapus asumsi adanya field boolean `completed`. Sebagai gantinya, metrik summary diganti menggunakan data yang memang ada di schema: total task, total board, dan total list.)_

```typescript
// Sebelum (menyebabkan type error)
const completedTasks = allTasks.filter((t) => t.completed).length;
const completionRate = Math.round((completedTasks / totalTasks) * 100);

// Sesudah (type-safe)
const totalTasks = allTasks.length;
const totalBoards = project.boards.length;
const totalLists = project.boards.flatMap((b) => b.lists).length;
```

Stats response was also updated accordingly:
_(Response stats juga diperbarui sesuai:)_

```typescript
// Sebelum
{
  (totalTasks, completedTasks, pendingTasks, completionRate);
}

// Sesudah
{
  (totalTasks, totalBoards, totalLists);
}
```

Unit tests in `ai-project-summary.service.spec.ts` were updated to remove `completed` from task mock data and align assertions with the new stats shape.
_(Unit test di `ai-project-summary.service.spec.ts` diperbarui untuk menghapus `completed` dari data mock task dan menyesuaikan asersi dengan bentuk stats yang baru.)_

## Trade-offs (Trade-off)

The summary no longer reports a "completion rate" because the schema does not support it. If a completion concept is needed in the future, a migration adding a `completedAt: DateTime?` or changing `status` to an enum with a `DONE` value would be required.
_(Summary tidak lagi melaporkan "completion rate" karena schema tidak mendukungnya. Jika konsep penyelesaian dibutuhkan di masa mendatang, diperlukan migrasi yang menambahkan field `completedAt: DateTime?` atau mengubah `status` menjadi enum dengan nilai `DONE`.)_

## Prevention (Pencegahan)

- **Always verify schema before assuming field names (Selalu verifikasi schema sebelum mengasumsikan nama field)**: Before referencing a model field in service logic, check `packages/database/prisma/schema.prisma` directly. Do not assume fields like `completed`, `isActive`, or `isDone` exist without confirmation.
  _(Sebelum mereferensikan field model di dalam logika service, periksa langsung `packages/database/prisma/schema.prisma`. Jangan mengasumsikan keberadaan field seperti `completed`, `isActive`, atau `isDone` tanpa konfirmasi.)_
- **Run type-check early (Jalankan type-check lebih awal)**: Run `npm run type-check --workspace=apps/api` immediately after writing service logic, before writing tests or controller, to catch schema mismatches before they propagate.
  _(Jalankan `npm run type-check --workspace=apps/api` segera setelah menulis logika service, sebelum menulis test atau controller, untuk mendeteksi ketidakcocokan schema sebelum menyebar.)_
