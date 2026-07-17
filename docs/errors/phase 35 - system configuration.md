# Phase 35 - TypeScript Type Incompatibility on Prisma JSON Fields

## Symptoms (Gejala)

During the compilation or type-checking step, TypeScript threw the following error in the `SystemConfigurationService`:
_(Selama proses kompilasi atau type-checking, TypeScript melemparkan error berikut pada `SystemConfigurationService`:)_

`Type 'CreateSystemConfigurationDto' is not assignable to type 'SystemConfigurationCreateInput'.`
`Types of property 'value' are incompatible.`
`Type 'unknown' is not assignable to type 'JsonNull | InputJsonValue'.`

## Root Cause (Akar Masalah)

The Data Transfer Object (DTO) defined the `value` property broadly as `unknown`. However, Prisma expects JSON fields to be explicitly typed as `Prisma.InputJsonValue` (which covers arrays, objects, strings, numbers, booleans, and null). TypeScript refuses to implicitly assign `unknown` directly to `Prisma.InputJsonValue` without validation, because an `unknown` value could potentially be a non-JSON serializable object (like a Function or Symbol).
_(Data Transfer Object (DTO) mendefinisikan properti `value` secara luas sebagai `unknown`. Namun, Prisma mengharuskan field JSON memiliki tipe yang lebih spesifik, yaitu `Prisma.InputJsonValue` (yang mencakup array, object, string, number, boolean, dan null). TypeScript menolak untuk secara implisit menetapkan `unknown` langsung ke `Prisma.InputJsonValue` tanpa validasi, karena nilai `unknown` bisa jadi merupakan objek yang tidak dapat diserialisasi ke JSON (seperti Function atau Symbol).)_

## Investigation (Investigasi)

- Checked `system-configuration.service.ts` and found the DTO payload was passed directly to `prisma.systemConfiguration.create` and `update` as the entire `data` payload without type assertion on the `value` property.
  _(Mengecek `system-configuration.service.ts` dan menemukan bahwa payload DTO dikirim langsung ke `prisma.systemConfiguration.create` dan `update` sebagai keseluruhan objek `data` tanpa asersi tipe pada properti `value`.)_

## Solution (Solusi)

1. **Explicit Type Casting (Casting Tipe Eksplisit)**:
   Extracted and explicitly cast the `value` property to `Prisma.InputJsonValue` when creating or updating records using Prisma.
   _(Mengekstrak dan melakukan casting tipe secara eksplisit pada properti `value` menjadi `Prisma.InputJsonValue` ketika membuat atau memperbarui record menggunakan Prisma.)_

   ```typescript
   // Example fix in create method:
   return prisma.systemConfiguration.create({
     data: {
       ...createDto,
       value: createDto.value as Prisma.InputJsonValue,
     },
   });
   ```

## Prevention (Pencegahan)

- **Handle JSON Fields carefully with Prisma (Tangani field JSON dengan hati-hati saat menggunakan Prisma)**: When mapping DTO properties defined as `unknown` or `any` to a Prisma JSON field, explicitly assert the type using `as Prisma.InputJsonValue` before passing it to Prisma's data object.
  _(Saat memetakan properti DTO yang didefinisikan sebagai `unknown` atau `any` ke field JSON Prisma, lakukan asersi tipe secara eksplisit menggunakan `as Prisma.InputJsonValue` sebelum meneruskannya ke objek data Prisma.)_
