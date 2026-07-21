# Phase 55 - Notification UI: Base UI Popover Trigger and Type Mismatch Errors

## Symptoms (Gejala)

During the compilation and type check phase (`npm run type-check`), the compiler failed with a type assignment error in the newly created notification bell component:

_(Selama fase kompilasi dan pemeriksaan tipe (`npm run type-check`), compiler gagal dengan error penetapan tipe pada komponen tombol notifikasi yang baru dibuat:)_

- `src/features/notifications/components/notification-bell.tsx(42,23): error TS2322: Type '{ children: Element; asChild: true; }' is not assignable to type 'IntrinsicAttributes & NativeButtonProps & ...'`
- `Property 'asChild' does not exist on type 'IntrinsicAttributes & NativeButtonProps & ...'`

## Root Cause (Akar Masalah)

The Flowlyx design system and component primitives utilize `@base-ui/react` (Base UI) instead of `@radix-ui/react` (Radix UI) for components like Popover, Tooltip, and Dropdowns.

_(Sistem desain Flowlyx dan primitif komponen menggunakan `@base-ui/react` (Base UI) alih-alih `@radix-ui/react` (Radix UI) untuk komponen seperti Popover, Tooltip, dan Dropdowns.)_

In Radix UI, custom trigger elements are wrapped inside `<Trigger asChild>` with the `asChild` boolean prop. In Base UI, custom elements must be rendered using the `render` property directly on the Trigger element (e.g., `<PopoverTrigger render={<Button ... />} />`), which passes down trigger ref and event handlers correctly without throwing type errors.

_(Pada Radix UI, elemen trigger kustom dibungkus di dalam `<Trigger asChild>` dengan prop boolean `asChild`. Pada Base UI, elemen kustom harus di-render menggunakan properti `render` secara langsung pada elemen Trigger (contoh: `<PopoverTrigger render={<Button ... />} />`), yang meneruskan trigger ref dan event handler dengan benar tanpa memicu type error.)_

## Investigation (Investigasi)

- Investigated the component declaration file of `PopoverTrigger` in `apps/web/src/components/ui/popover.tsx` which references `PopoverPrimitive.Trigger.Props` from `@base-ui/react/popover`.
  _(Menginvestigasi file deklarasi komponen `PopoverTrigger` di `apps/web/src/components/ui/popover.tsx` yang merujuk pada `PopoverPrimitive.Trigger.Props` dari `@base-ui/react/popover`.)_
- Confirmed that `PopoverPrimitive.Trigger` doesn't have an `asChild` property, but instead supports a `render` prop taking a React node or function to customize the rendered element.
  _(Memastikan bahwa `PopoverPrimitive.Trigger` tidak memiliki properti `asChild`, melainkan mendukung prop `render` yang menerima React node atau fungsi untuk melakukan kustomisasi elemen yang di-render.)_

## Solution (Solusi)

1. **Refactored Popover Trigger Rendering (Refaktor Rendering Popover Trigger)**:
   Modified `notification-bell.tsx` to pass the `<Button>` component inside the `render` prop of `<PopoverTrigger>` instead of nesting it under `asChild`:
   _(Mengubah `notification-bell.tsx` untuk meneruskan komponen `<Button>` di dalam prop `render` milik `<PopoverTrigger>` alih-alih membungkusnya di dalam `asChild`:)_
   ```tsx
   <PopoverTrigger
     render={
       <Button variant="ghost" size="icon" className="...">
         <Bell className="..." />
       </Button>
     }
   />
   ```

## Prevention (Pencegahan)

- Always verify component libraries when building interactive primitives. Flowlyx standardizes on `@base-ui/react` for layout and dropdown components which relies on the `render` prop for customization instead of `asChild`.
  _(Selalu pastikan pustaka komponen yang digunakan saat membangun primitif interaktif. Flowlyx menstandarkan penggunaan `@base-ui/react` untuk komponen layout dan dropdown yang mengandalkan prop `render` untuk kustomisasi alih-alih `asChild`.)_
