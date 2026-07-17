# Phase 37 - Email Service: Linter/Typescript Strict Typing Error (No Explicit Any)

## Symptoms (Gejala)

During the execution of Quality Gates (`npm run lint`), the CI/CD pipeline failed with the following error:

_(Selama eksekusi Quality Gates (`npm run lint`), pipeline CI/CD mengalami kegagalan dengan error berikut:)_

`Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`

This error occurred across multiple files in the newly created Email module:

- `apps/api/src/modules/email/email.processor.spec.ts`
- `apps/api/src/modules/email/email.processor.ts`
- `apps/api/src/modules/email/email.service.spec.ts`

## Root Cause (Akar Masalah)

The initial implementation used the `any` type as a shortcut when defining mocks for unit tests and processing BullMQ jobs. Because the project strictly enforces a "no `any` types allowed" policy, ESLint correctly flagged these deviations.

_(Implementasi awal menggunakan tipe `any` sebagai jalan pintas saat mendefinisikan mock untuk unit test dan memproses job BullMQ. Karena proyek secara ketat memberlakukan aturan larangan penggunaan tipe `any`, ESLint secara tepat menandai penyimpangan ini.)_

Specific instances included:

1. `let mockQueue: any;` (Used in `email.service.spec.ts`)
2. `let mockConfigService: any;` (Used in `email.processor.spec.ts`)
3. `const job: any = { ... };` (Used for mocking BullMQ jobs)
4. `async process(job: Job<SendEmailDto, any, string>): Promise<any>` (Used in `email.processor.ts`)

## Investigation (Investigasi)

- Investigated the ESLint output to identify the exact lines causing the error.
- Recognized that `mockQueue` and `mockConfigService` should be strictly typed using Jest's mock utilities.
- Recognized that BullMQ's `Job` generic requires defining the return type and data type explicitly rather than defaulting to `any`.

## Solution (Solusi)

1. **Strict Type Conformance for Mocks (Kepatuhan Tipe Ketat untuk Mock)**:
   Replaced `any` with `jest.Mocked<Partial<T>>` to ensure strict typing for dependencies:
   _(Mengganti `any` dengan `jest.Mocked<Partial<T>>` untuk memastikan pengetikan yang ketat bagi dependensi:)_

   - `let mockQueue: jest.Mocked<Partial<import('bullmq').Queue>>;`
   - `let mockConfigService: jest.Mocked<Partial<ConfigService>>;`

2. **Fixing Job Generics (Memperbaiki Generik Job)**:
   Replaced `any` in `email.processor.ts` with `unknown`:
   _(Mengganti `any` di `email.processor.ts` dengan `unknown`:)_

   - `async process(job: Job<SendEmailDto, unknown, string>): Promise<unknown>`

3. **Type-Safe Mock Parameter Injection (Injeksi Parameter Mock Secara Type-Safe)**:
   Removed `any` cast for the job mock in tests and injected it using `unknown` cast:
   _(Menghapus asersi `any` untuk mock job di test dan menyuntikkannya menggunakan asersi `unknown`:)_

   - `const result = await processor.process(job as unknown as import('bullmq').Job<import('./dto/send-email.dto').SendEmailDto, unknown, string>);`

## Prevention (Pencegahan)

- **Avoid `any` at all costs (Hindari penggunaan `any` dalam kondisi apapun)**: Do not use `any` as an escape hatch during initial development or testing, as it defeats the purpose of TypeScript and violates project rules.
  _(Jangan menggunakan `any` sebagai jalan pintas selama pengembangan awal atau saat testing, karena hal ini mencederai tujuan utama dari TypeScript dan melanggar aturan proyek.)_
- **Use `unknown` for Unknown Types (Gunakan `unknown` untuk Tipe yang Tidak Diketahui)**: When dealing with dynamic payloads (like generic BullMQ job returns), prefer `unknown` over `any` so that the compiler enforces structural checks before usage.
  _(Saat berhadapan dengan payload dinamis (seperti nilai kembalian job BullMQ yang generik), lebih baik gunakan `unknown` daripada `any` agar compiler memaksakan pengecekan struktural sebelum tipe tersebut digunakan.)_
