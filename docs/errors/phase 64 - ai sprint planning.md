# Phase 64 - AI Sprint Planning: Return Type of Public Method Cannot Be Named (TS4053)

## Symptoms (Gejala)

During `npm run type-check`, the following TypeScript error was thrown:
_(Selama menjalankan `npm run type-check`, terjadi error TypeScript berikut:)_

```
src/modules/ai-sprint-planning/ai-sprint-planning.controller.ts(29,9): error TS4053:
Return type of public method from exported class has or is using name 'SprintPlanResult'
from external module ".../ai-sprint-planning.service" but cannot be named.
```

## Root Cause (Akar Masalah)

`AiSprintPlanningService.generateSprintPlan()` had a return type of `Promise<SprintPlanResult>`, but `SprintPlanResult` was declared as a module-private `interface` (not exported). When the controller called this method, TypeScript needed to name the return type in the public method signature but could not, because the interface was not visible outside the service file.
_(Method `generateSprintPlan()` memiliki return type `Promise<SprintPlanResult>`, namun `SprintPlanResult` dideklarasikan sebagai `interface` privat (tidak di-export). Saat controller memanggil method ini, TypeScript perlu menamai return type di signature method publik namun tidak bisa karena interface tidak terlihat di luar file service.)_

```typescript
// Sebelum — interface tidak di-export, menyebabkan TS4053
interface SprintPlanResult { ... }
interface SprintTask { ... }
```

## Investigation (Investigasi)

- Ran `npm run type-check --workspace=apps/api` → error menunjuk ke baris `async generateSprintPlan(...)` di controller.
- Error TS4053 terjadi karena controller adalah `exported class` dengan `public method`, dan TypeScript strict mode mengharuskan semua tipe yang digunakan pada public API dapat dinamai secara eksplisit.
- Interface `SprintPlanResult` dan `SprintTask` hanya dideklarasikan di dalam `ai-sprint-planning.service.ts` tanpa keyword `export`.

## Solution (Solusi)

Export kedua interface dari service file agar TypeScript dapat menamai return type pada public method controller.
_(Export kedua interface dari file service agar TypeScript dapat menamai return type pada method publik di controller.)_

```typescript
// Sesudah — interface di-export, type-check clean
export interface SprintTask { ... }
export interface SprintPlanResult { ... }
```

## Trade-offs (Trade-off)

Mengeksport interface ini menjadikannya bagian dari public API modul. Tidak ada dampak runtime; ini murni concern TypeScript. Jika di masa depan interface ini tidak dibutuhkan di luar modul, bisa diganti dengan return type inline.
_(Mengeksport interface ini menjadikannya bagian dari public API modul. Tidak ada dampak runtime. Jika tidak dibutuhkan di luar modul, bisa diganti dengan return type inline.)_

## Prevention (Pencegahan)

- **Export interface yang digunakan sebagai return type public method (Export interface yang digunakan sebagai return type method publik)**: Jika sebuah `interface` digunakan sebagai return type dari method yang dapat diakses dari luar class (termasuk melalui controller NestJS), selalu tambahkan keyword `export`.
- **Jalankan type-check setelah menulis service, sebelum menulis controller**: Error ini baru terdeteksi saat controller dibuat. Menjalankan `npm run type-check --workspace=apps/api` setelah selesai menulis service akan mendeteksi masalah lebih awal.
