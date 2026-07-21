# Phase 54 - Calendar UI: DTO Validation Mismatch and Select Event Handler Typing Errors

## Symptoms (Gejala)

During the development and testing of Phase 54: Calendar UI, two main errors were encountered:

### 1. Zod Validation Exception on Task Update (ZodValidationException pada Perbaruan Task)

When attempting to update a task (such as setting/modifying `startDate` or `dueDate` or saving task details), the NestJS API server returned a `400 Bad Request` validation failure:
_(Saat mencoba memperbarui tugas (seperti mengatur/mengubah `startDate` atau `dueDate` atau menyimpan detail tugas), NestJS API server mengembalikan kegagalan validasi `400 Bad Request`:)_

```json
err: {
  "type": "Error",
  "message": "[PATCH] /api/tasks/3e313bdb-42f0-4028-b651-ab18a60d5015 - 400 - Validation failed",
  "stack":
      ZodValidationException: Validation failed
          at createZodValidationException (C:\Users\Yerikho\Project\Flowlyx\node_modules\nestjs-zod\dist\index.js:85:10)
          at validate (C:\Users\Yerikho\Project\Flowlyx\node_modules\nestjs-zod\dist\index.js:95:11)
          ...
}
```

### 2. TypeScript Compilation Error on Shadcn Select Component (Error Kompilasi TypeScript pada Komponen Select)

During typechecking (`npm run type-check`), the TypeScript compiler threw a type mismatch error on the project selector component inside `workspace-calendar.tsx`:
_(Selama typechecking (`npm run type-check`), compiler TypeScript memunculkan error ketidakcocokan tipe pada komponen pemilih proyek di dalam `workspace-calendar.tsx`:)_

```bash
src/features/calendar/components/workspace-calendar.tsx(194,45): error TS2322: Type 'Dispatch<SetStateAction<string>>' is not assignable to type '(value: string | null, eventDetails: SelectRootChangeEventDetails) => void'.
  Types of parameters 'value' and 'value' are incompatible.
    Type 'string | null' is not assignable to type 'SetStateAction<string>'.
      Type 'null' is not assignable to type 'SetStateAction<string>'.
```

---

## Root Cause (Akar Masalah)

### 1. Zod Validation Mismatch (Ketidakcocokan Validasi Zod)

The backend `UpdateTaskDto` validation schema (`updateTaskSchema`) defined `startDate`, `dueDate`, `priorityId`, and `description` as optional date strings (`z.string().datetime().optional()`) but did not allow `null` values.
In the frontend application, selecting an empty state or clearing a date/priority field causes the payload generator to explicitly send `null` (e.g., `startDate: null`) to clear the field value in the database. When the backend Zod validator encountered `null` on those fields, it failed validation.
_(Backend `UpdateTaskDto` skema validasi mendefinisikan `startDate`, `dueDate`, `priorityId`, dan `description` sebagai date string opsional namun tidak mengizinkan nilai `null`. Di frontend, mengosongkan tanggal mengirimkan payload `null` eksplisit untuk menghapus nilai di database. Ketika Zod menemukan nilai `null` pada kolom tersebut, validasi gagal.)_

### 2. Select `onValueChange` Typings (Tipe Handler `onValueChange` Select)

The project's custom `Select` component uses `@base-ui/react/select` under the hood. Its `onValueChange` callback passes a nullable string (`string | null`), whereas the react state setter `setSelectedProjectId` was strictly typed as a non-nullable string (`string`), leading to a type mismatch.
_(Komponen `Select` kustom proyek menggunakan `@base-ui/react/select`. Callback `onValueChange`-nya mengirimkan string nullable (`string | null`), sedangkan react state setter `setSelectedProjectId` bertipe string non-nullable (`string`).)_

---

## Investigation (Investigasi)

- Traced the `UpdateTaskDto` schema in [update-task.dto.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/modules/tasks/dto/update-task.dto.ts) and observed that the Prisma schema allows `DateTime?` and `String?` (which are nullable) for those columns, but the Zod schema was missing `.nullable()`.
  _(Menelusuri skema `UpdateTaskDto` di `update-task.dto.ts` dan mengamati bahwa skema Prisma mengizinkan kolom tersebut bernilai nullable, namun skema Zod kekurangan modifier `.nullable()`.)_
- Checked the component typings in `@/components/ui/select.tsx` and confirmed the `onValueChange` prop structure, pointing to why standard state setters cannot be directly passed to it.
  _(Memeriksa tipe komponen di `select.tsx` dan mengonfirmasi struktur prop `onValueChange` yang menyebabkan state setter biasa tidak dapat diteruskan langsung.)_

---

## Solution (Solusi)

### 1. Backend Validation Fix (Perbaikan Validasi Backend)

Modified [update-task.dto.ts](file:///c:/Users/Yerikho/Project/Flowlyx/apps/api/src/modules/tasks/dto/update-task.dto.ts) to declare all nullable database fields (like `startDate`, `dueDate`, `priorityId`, `description`, and `reminderAt`) as `.nullable()`:
_(Mengubah `update-task.dto.ts` untuk mendeklarasikan semua kolom database nullable sebagai `.nullable()`:)_

```typescript
const updateTaskSchema = z.object({
  listId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  order: z.number().optional(),
  priorityId: z.string().uuid().nullable().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
});
```

### 2. Frontend Typings Fix (Perbaikan Tipe Frontend)

Updated the `<Select>` component in [workspace-calendar.tsx](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/calendar/components/workspace-calendar.tsx) to capture the nullable value and safe-default it to a fallback value string:
_(Memperbarui komponen `<Select>` di `workspace-calendar.tsx` untuk menangkap nilai nullable dan mengembalikan nilai fallback aman:)_

```typescript
onValueChange={(val) => setSelectedProjectId(val || 'all')}
```

---

## Prevention (Pencegahan)

- **DTO Alignment (Penyelarasan DTO)**: Ensure backend Zod DTO parameters reflect the nullable nature (`nullable()`) of any database column that can be cleared or unset by users on the frontend.
  _(Pastikan parameter DTO Zod di backend mencerminkan sifat nullable (`nullable()`) dari kolom database mana pun yang dapat dihapus atau dikosongkan oleh pengguna di frontend.)_
- **Event Handler Safety (Keamanan Event Handler)**: Avoid passing react state setters directly to event handler hooks if the libraries emit nullable values; always wrap them in safe default expressions.
  _(Hindari meneruskan react state setter secara langsung ke event handler jika library menghasilkan nilai nullable; selalu bungkus dengan ekspresi default yang aman.)_
