# Phase 10 - User Management: ESLint Unexpected Any Type

## Symptoms (Gejala)

During the Quality Gates pipeline, the `npm run lint` command failed with the following error:
_(Selama berjalannya pipeline Quality Gates, perintah `npm run lint` gagal dengan error berikut:)_
`error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any` in `users.controller.spec.ts`.

## Root Cause (Akar Masalah)

In the `users.controller.spec.ts` file, a mock payload for the `update` method was incorrectly cast using `as any` (`{ status: 'INACTIVE' } as any`). The `Flowlyx Engineering Handbook` enforces strict typing and strictly prohibits the explicit use of `any` across the codebase, including in test files.
_(Di dalam file `users.controller.spec.ts`, sebuah payload tiruan (mock) untuk metode `update` secara keliru di-cast menggunakan `as any` (`{ status: 'INACTIVE' } as any`). `Flowlyx Engineering Handbook` mewajibkan pengetikan data yang ketat dan secara tegas melarang penggunaan tipe `any` secara eksplisit di seluruh codebase, termasuk di dalam file test.)_

## Investigation (Investigasi)

Ran the `npm run lint` command locally which immediately identified line 87 in `apps/api/src/modules/users/users.controller.spec.ts` as the source of the rule violation.
_(Menjalankan perintah `npm run lint` secara lokal yang mana langsung mengidentifikasi baris 87 di dalam `apps/api/src/modules/users/users.controller.spec.ts` sebagai sumber pelanggaran aturan.)_

## Solution (Solusi)

1. Imported the actual `UpdateUserDto` into the test file.
   _(Mengimpor `UpdateUserDto` yang asli ke dalam file test.)_
2. Refactored the type casting to use strict, safe assertions: `as unknown as UpdateUserDto`.
   _(Melakukan refactor pada type casting untuk menggunakan asersi yang ketat dan aman: `as unknown as UpdateUserDto`.)_
3. Ran `npm run lint` again to ensure the issue was fully resolved.
   _(Menjalankan `npm run lint` kembali untuk memastikan masalah telah sepenuhnya terselesaikan.)_

## Trade-offs (Kelemahan/Pertukaran)

Using specific DTOs in test mocks instead of `any` slightly increases the verbosity of test files and couples the tests closer to the DTO definitions. However, this is a necessary trade-off to maintain absolute type safety and adhere to the strict `no explicit any` policy.
_(Menggunakan DTO spesifik pada mock test alih-alih `any` sedikit meningkatkan jumlah baris kode pada file test dan membuat test menjadi lebih terikat (coupled) pada definisi DTO. Walaupun begitu, ini adalah pertukaran (trade-off) yang perlu dilakukan demi menjaga keamanan tipe secara absolut dan mematuhi kebijakan ketat `no explicit any`.)_

## Prevention (Pencegahan)

- Developers must avoid using `as any` when writing mock objects in unit tests.
  _(Developer harus menghindari penggunaan `as any` ketika menulis objek mock di dalam unit test.)_
- Prefer using `Partial<T>`, `unknown`, or casting to the specific Expected Type/DTO.
  _(Lebih diutamakan untuk menggunakan `Partial<T>`, `unknown`, atau melakukan cast menuju Tipe yang Diharapkan/DTO secara spesifik.)_
- Pre-commit hooks should catch this before pushing.
  _(Pre-commit hook seharusnya menangkap hal ini sebelum proses push dilakukan.)_

## References (Referensi)

- ESLint Rule: `@typescript-eslint/no-explicit-any`
- Flowlyx Engineering Handbook: "No explicit any" policy.
