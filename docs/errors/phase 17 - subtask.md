# Phase 17 - Subtask: Dead Mock Setup in Copied Test Pattern

## Symptoms (Gejala)

During ponytail-review of the Subtask module, dead code was identified in the unit tests. `subtasks.service.spec.ts` contained `prisma.subtask.findUnique` mock calls inside the `update` and `remove` test blocks, but the actual service methods `update()` and `remove()` never call `findUnique`.
_(Selama sesi peninjauan bergaya ponytail (ponytail-review) terhadap modul Subtask, tumpukan dead code teridentifikasi di dalam unit test. File `subtasks.service.spec.ts` memuat pemanggilan mock berupa `prisma.subtask.findUnique` di dalam blok tes `update` dan `remove`, padahal metode asli service `update()` maupun `remove()` sama sekali tidak pernah memanggil `findUnique` tersebut.)_

Similarly, `subtasks.controller.spec.ts` declared a `service` variable that was assigned via `module.get<SubtasksService>()` but was functionally identical to the `mockSubtasksService` object — an unnecessary indirection.
_(Sama halnya dengan `subtasks.controller.spec.ts`, yang tanpa alasan mendeklarasikan sebuah variabel `service` melalui pemanggilan `module.get<SubtasksService>()`, yang secara fungsional 100% sama dengan milik objek `mockSubtasksService` — sebuah redundansi yang tidak perlu.)_

## Root Cause (Akar Masalah)

The Subtask module was scaffolded by copying the Task module pattern. The Task module's test file (`tasks.service.spec.ts`) contains the same dead mocks (lines 97 and 109), and the controller spec has the same unused `service` variable. These were carried over verbatim without verifying whether the mocked methods were actually called by the code under test.
_(Struktur modul Subtask pada awalnya memang meniru habis-habisan (copy-paste) kerangka dasar dari modul Task. Ternyata, file test milik modul Task (`tasks.service.spec.ts`) juga secara turun-temurun memuat mock mati tersebut (di baris 97 dan 109), lengkap dengan variabel `service` tak terpakai pada file spec controller-nya. Kode ini dibiarkan begitu saja (copy-paste mentah-mentah) tanpa diverifikasi terlebih dahulu apakah seluruh metode pemanggilan mock-nya memang benar dibutuhkan atau tidak pada modul baru ini.)_

## Investigation (Investigasi)

- Traced `SubtasksService.update()` — calls only `prisma.subtask.update`, never `findUnique`.
  _(Melacak siklus hidup `SubtasksService.update()` — cuma pernah memanggil `prisma.subtask.update`, tak sekalipun butuh `findUnique`.)_
- Traced `SubtasksService.remove()` — calls only `prisma.subtask.delete`, never `findUnique`.
  _(Melacak siklus hidup `SubtasksService.remove()` — cuma pernah memanggil `prisma.subtask.delete`, tak sekalipun butuh `findUnique`.)_
- Confirmed the `service` variable in controller spec resolves to the same mock object provided via `useValue: mockSubtasksService`.
  _(Mengonfirmasi kalau variabel `service` yang ada di dalam spec controller malah tertuju / menunjuk kepada rujukan (reference) nilai asli persis dari objek `useValue: mockSubtasksService`.)_
- Verified that removing these lines does not break any of the 15 tests.
  _(Membuktikan dengan validasi bilamana pencopotan total baris kode redundan ini dijamin tidak akan membikin 15 deret test lainnya mati dan *crash*.)_

## Solution (Solusi)

- Removed 2 dead `findUnique` mock lines from `subtasks.service.spec.ts`.
  _(Membuang 2 baris mock mati si biang kerok `findUnique` dari dalam `subtasks.service.spec.ts`.)_
- Removed `let service` declaration and `module.get()` assignment from `subtasks.controller.spec.ts`; assertions now reference `mockSubtasksService` directly.
  _(Membongkar paksa dan menghabisi riwayat hidup deklarasi `let service` berikut `module.get()`-nya pada `subtasks.controller.spec.ts`; proses asersi kini dipersingkat mengacu kepada target aslinya: sang `mockSubtasksService`.)_
- Removed a verbose log line in `subtasks.controller.ts` on the no-taskId path (noise, not actionable).
  _(Menghapus sebuah baris output log verbal tak guna (`console.log`) pada file `subtasks.controller.ts` khusus untuk jalur ketika `taskId` tidak diserahkan.)_

Net: **-4 lines**, 15/15 tests still passing.
_(Hasil akhir: **-4 baris**, 15 dari ke-15 test masih lulus 100%.)_

## Trade-offs (Kelemahan/Pertukaran)

- **None (Tidak ada)**: Pure dead code removal. No behavior change.
  _(Pembuangan dead-code seratus persen alami. Perilaku kode tak secuil pun termanipulasi.)_

## Prevention (Pencegahan)

- When copying module patterns, verify that test mocks match actual method calls.
  _(Peringatan saat Anda nekat *copas* kerangka pola sebuah modul: pastikan lagi kalau kode *mock* di-test-nya itu sepadan / sesuai dengan metode API asli yang dituju.)_
- Use ponytail-review (`/ponytail-review`) on newly scaffolded modules to catch inherited dead code.
  _(Panggil dan perintahkan instruksi ponytail-review (`/ponytail-review`) ke arah susunan *scaffold* pada sebuah modul-baru buatanmu guna segera membasmi virus `dead code` turunan ini.)_

## References (Referensi)

- [Ponytail Review Skill](../../.agents/skills/ponytail-review/SKILL.md)
- [Phase 16 - Task (source pattern)](./phase%2016%20-%20task.md)
