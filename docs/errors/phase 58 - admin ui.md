# Phase 58 - Admin UI & Assignment Console: TypeScript Strict Typing & shadcn/ui Select Mismatch Errors

## Symptoms (Gejala)

During the migration of the Admin User Assignment Dialog to use **shadcn/ui Select** component and executing the compiler checks (`npm run type-check`), the compilation failed with several `TS2345` parameter mismatch errors:

_(Selama migrasi Dialog Penugasan User Admin untuk menggunakan komponen **shadcn/ui Select** dan menjalankan pengecekan compiler (`npm run type-check`), proses kompilasi mengalami kegagalan dengan beberapa error ketidakcocokan parameter `TS2345`:)_

- `Argument of type 'string | null' is not assignable to parameter of type 'SetStateAction<string>'.`
- `Type 'null' is not assignable to type 'SetStateAction<string>'.`
- `Unexpected any. Specify a different type @typescript-eslint/no-explicit-any` (during `npm run lint`)

## Root Cause (Akar Masalah)

1. **shadcn/ui Select Event Handler Signature**:
   The native HTML `<select>` triggers an `onChange` event yielding an event target value, whereas shadcn/ui's `<Select>` triggers an `onValueChange` event which passes the new string directly. However, shadcn/ui Select allows the string argument to be `string | null` in its React binding definitions.

   _(Pemicu `<select>` HTML bawaan menggunakan event `onChange` yang menghasilkan nilai target event, sedangkan komponen `<Select>` shadcn/ui memicu event `onValueChange` yang meneruskan string secara langsung. Akan tetapi, binding React Select shadcn/ui memungkinkan argumen string tersebut bertipe `string | null`.)_

2. **State Mismatch**:
   Our local state setters (like `setSelectedOrg`, `setSelectedWorkspace`, etc.) strictly enforce `string` (non-nullable). Passing `string | null` directly into these state setters without a null guard resulted in a TypeScript compiler error.

   _(Setter state lokal kami (seperti `setSelectedOrg`, `setSelectedWorkspace`, dsb.) secara ketat mewajibkan tipe data `string` (non-nullable). Meneruskan `string | null` secara langsung ke dalam state setter ini tanpa pengecekan null menghasilkan error pada compiler TypeScript.)_

3. **Strict Linter Rule (`no-explicit-any`)**:
   During data fetching from feature APIs (`getOrganizations`, `getWorkspaces`), the initial implementation declared lists of items as `any[]`. This violated the project's strict linter configuration which throws errors on any `any` usage.

   _(Selama pengambilan data dari API fitur (`getOrganizations`, `getWorkspaces`), implementasi awal mendeklarasikan daftar item sebagai `any[]`. Hal ini melanggar konfigurasi linter proyek yang ketat yang membuang error pada setiap penggunaan tipe data `any`.)_

## Investigation (Investigasi)

- Inspected the type definitions of `Select` component in `apps/web/src/components/ui/select.tsx` and found it inherits from `@base-ui/react/select` bindings where values passed down to event handlers can occasionally be null when deselecting.
  _(Memeriksa definisi tipe komponen `Select` di `apps/web/src/components/ui/select.tsx` dan menemukan bahwa ia mewarisi binding dari `@base-ui/react/select` di mana nilai yang dikirim ke handler terkadang bernilai null saat batal dipilih.)_
- Checked linter logs indicating violations under `assignment-dialog.tsx` due to `any[]` declarations.
  _(Memeriksa log linter yang menunjukkan pelanggaran pada `assignment-dialog.tsx` akibat deklarasi `any[]`.)_

## Solution (Solusi)

1. **Null Guarding on Select Value Changes (Pencegahan Nilai Null pada Pemicu Select)**:
   Added conditional checks inside all `onValueChange` handlers of shadcn/ui `Select` to ensure values are only set if they are not null:

   _(Menambahkan pengecekan kondisi di dalam semua handler `onValueChange` milik `Select` shadcn/ui untuk memastikan nilai hanya diset jika tidak bernilai null:)_

   ```tsx
   onValueChange={(val) => {
     if (val) setSelectedWorkspace(val);
   }}
   ```

2. **Resolving Type-safe API Mappings (Menyelesaikan Pemetaan API yang Type-safe)**:
   Replaced all `any[]` state declarations with type imports corresponding to the features:

   _(Mengganti semua deklarasi state `any[]` dengan tipe data yang diimpor sesuai fiturnya:)_

   ```tsx
   import { OrganizationSummary } from '@/features/organizations/types/organization.types';
   import { WorkspaceSummary } from '@/features/workspaces/types/workspace.types';
   import { ProjectSummary } from '@/features/projects/types/project.types';

   const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
   const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
   const [projects, setProjects] = useState<ProjectSummary[]>([]);
   ```

3. **Fallback Value Display inside Select Value (Tampilan Nilai Cadangan di dalam Select Value)**:
   Explicitly mapped selected UUID strings back to display names in the trigger so the default state shows a readable string:

   _(Secara eksplisit memetakan string UUID terpilih kembali ke nama tampilan pada trigger agar state default memuat string yang dapat dibaca:)_

   ```tsx
   <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
     <SelectValue placeholder="Select Organization">
       {orgs.find((o) => o.id === selectedOrg)?.name || 'Select Organization'}
     </SelectValue>
   </SelectTrigger>
   ```

## Prevention (Pencegahan)

- **Use Strict Types over Any**: Never declare mock or API objects as `any[]` or `any`. Always locate the matching module's `types` file.
  _(Jangan pernah mendeklarasikan mock atau objek API sebagai `any[]` atau `any`. Selalu cari berkas `types` dari modul yang cocok.)_
- **Safeguard shadcn Select Triggers**: Always add a truthy guard (`if (val)`) inside shadcn/ui select change callbacks to satisfy strict React hook string states.
  _(Selalu tambahkan guard `if (val)` di dalam callback perubahan select shadcn/ui untuk memenuhi state string hook React yang ketat.)_
