# ERR-001: Lint Error `Unexpected any`

## Symptoms (Gejala)

When running `npm run lint`, the linter fails with `@typescript-eslint/no-explicit-any` errors in test files, specifically for mock DTOs casted as `any` (e.g., `dto as any`).
_(Saat menjalankan `npm run lint`, linter gagal dengan error `@typescript-eslint/no-explicit-any` pada file test, khususnya untuk mock DTO yang di-cast sebagai `any` (contoh: `dto as any`).)_

## Root Cause (Akar Masalah)

The project's ESLint configuration strictly forbids the usage of explicit `any` types to maintain strong typing and type safety across the codebase. Using `as any` in test files violates this rule.
_(Konfigurasi ESLint proyek dengan tegas melarang penggunaan tipe `any` secara eksplisit demi mempertahankan pengetikan yang kuat dan keamanan tipe di seluruh codebase. Menggunakan `as any` di file test melanggar aturan ini.)_

## Investigation (Investigasi)

During the implementation of Phase 8 (Organization), unit tests for `organizations.service.spec.ts` and `organizations.controller.spec.ts` used `dto as any` to quickly mock the incoming Data Transfer Objects (DTOs) for the `create` methods. The CI/CD pipeline or `npm run lint` step caught this and failed the build.
_(Selama implementasi Phase 8 (Organization), unit test untuk `organizations.service.spec.ts` dan `organizations.controller.spec.ts` menggunakan `dto as any` untuk memock Data Transfer Objects (DTO) secara cepat pada metode `create`. Pipeline CI/CD atau proses `npm run lint` menangkap hal ini dan menggagalkan build.)_

## Solution (Solusi)

Replace `as any` with a double cast using `unknown` followed by the specific DTO type. For example:
_(Ganti `as any` dengan double cast menggunakan `unknown` yang diikuti oleh tipe DTO spesifik. Sebagai contoh:)_

```typescript
// From (Dari):
const result = await controller.create(dto as any);

// To (Ke):
const result = await controller.create(dto as unknown as CreateOrganizationDto);
```

This satisfies the linter by avoiding `any` while still allowing the mock object (which might be missing some optional fields or methods) to be passed into the function.
_(Ini memenuhi aturan linter dengan menghindari `any`, sembari tetap memungkinkan objek mock (yang mungkin kehilangan beberapa field atau metode opsional) untuk dilempar ke dalam fungsi.)_

## Trade-offs (Kelemahan/Pertukaran)

Using `as unknown as CreateOrganizationDto` still bypasses strict type checking for the mock object, meaning if the DTO shape changes significantly, the test might not catch it at compile time. However, it successfully avoids `any` and adheres to the project's strict linting rules.
_(Menggunakan `as unknown as CreateOrganizationDto` masih mem-bypass pengecekan tipe yang ketat untuk objek mock, yang berarti jika bentuk DTO berubah secara signifikan, test mungkin tidak akan mendeteksinya saat compile-time. Namun, cara ini berhasil menghindari `any` dan mematuhi aturan linting proyek yang ketat.)_

## Prevention (Pencegahan)

Always avoid `any` in test files. When mocking complex objects or DTOs, either provide a fully compliant object or use `as unknown as Type` if a partial mock is absolutely necessary.
_(Selalu hindari `any` di dalam file test. Ketika me-mock objek atau DTO kompleks, sediakan objek yang sepenuhnya patuh aturan atau gunakan `as unknown as Type` jika mock parsial benar-benar diperlukan.)_

## References (Referensi)

- [ESLint: no-explicit-any](https://typescript-eslint.io/rules/no-explicit-any/)
