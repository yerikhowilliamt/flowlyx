# Phase 52 - Board UI: TypeScript Type Mismatch on Select component onValueChange

## Symptoms (Gejala)

During the execution of `npm run type-check` after implementing the Board UI component, the TypeScript compilation failed with the following error:

_(Selama eksekusi `npm run type-check` setelah mengimplementasikan komponen Board UI, kompilasi TypeScript mengalami kegagalan dengan error berikut:)_

```bash
src/features/boards/components/board-list.tsx(79,43): error TS2322: Type 'Dispatch<SetStateAction<string>>' is not assignable to type '(value: string | null, eventDetails: SelectRootChangeEventDetails) => void'.
  Types of parameters 'value' and 'value' are incompatible.
    Type 'string | null' is not assignable to type 'SetStateAction<string>'.
      Type 'null' is not assignable to type 'SetStateAction<string>'.
```

## Root Cause (Akar Masalah)

The `@/components/ui/select` component's `onValueChange` callback accepts a type of `(value: string | null) => void`. In our initial implementation of the `BoardList` component, we directly passed the React state setter `setSelectedProjectId` (which expects a type of `string` and does not accept `null`) to the `onValueChange` prop of the `<Select>` component.

_(Callback `onValueChange` pada komponen `@/components/ui/select` menerima tipe data `(value: string | null) => void`. Pada implementasi awal komponen `BoardList`, kami langsung meneruskan setter state React `setSelectedProjectId` (yang mengharapkan tipe data `string` dan tidak menerima `null`) ke properti `onValueChange` dari komponen `<Select>`.)_

## Investigation (Investigasi)

1. Checked [board-list.tsx](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/boards/components/board-list.tsx) and saw:
   ```tsx
   <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
   ```
2. Identified that `setSelectedProjectId` is declared as `const [selectedProjectId, setSelectedProjectId] = useState<string>('');`, which means its type signature is `Dispatch<SetStateAction<string>>`.
3. The Select component allows the value to be cleared or nullified under certain behaviors, passing `null` to `onValueChange`, which is incompatible with `SetStateAction<string>`.

## Solution (Solusi)

To fix the type mismatch and safely handle potential null values:

_(Untuk memperbaiki ketidakcocokan tipe data dan menangani nilai null potensial dengan aman:)_

1. Changed `onValueChange` in [board-list.tsx](file:///c:/Users/Yerikho/Project/Flowlyx/apps/web/src/features/boards/components/board-list.tsx) to check for nullability and fall back to an empty string:
   ```tsx
   onValueChange={(val) => setSelectedProjectId(val || '')}
   ```
2. Refactored the selection state logic to derive the active project ID (`activeProjectId`) synchronously from the projects array if `selectedProjectId` is empty, avoiding unnecessary cascading renders from `useEffect` updates.

## Prevention (Pencegahan)

- **Handle Nullable Props in Custom Form Controls (Tangani Properti Nullable pada Kontrol Form Kustom)**: When using wrapping library components (like shadcn select built on top of Radix UI or Base UI), always check if the output parameters of event callbacks are nullable before passing strict state dispatchers. Wrap them in a callback to provide default fallbacks when necessary.
  _(Saat menggunakan komponen pustaka pembungkus (seperti shadcn select yang dibangun di atas Radix UI atau Base UI), selalu periksa apakah parameter keluaran dari event callback bersifat nullable sebelum meneruskan state dispatcher yang ketat. Bungkus dengan callback untuk menyediakan fallback default bila diperlukan.)_
