# Phase 38 - Scheduled Jobs: Linter/Typescript Strict Typing Error (No Explicit Any)

## Symptoms (Gejala)

During the execution of the pre-commit hook (`npm run lint`), the CI/CD pipeline failed with the following error:
_(Selama eksekusi pre-commit hook (`npm run lint`), pipeline CI/CD mengalami kegagalan dengan error berikut:)_

`Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`

This error was triggered because the project strictly enforces a "no `any` types allowed" policy, and the code used `any` for `Job` parameters and mock test variables.
_(Error ini terpicu karena proyek secara ketat memberlakukan aturan larangan penggunaan tipe `any`, dan kode tersebut menggunakan `any` untuk parameter `Job` serta variabel mock pada test.)_

## Root Cause (Akar Masalah)

The initial code for `ScheduledJobsProcessor` and `ScheduledJobsService` (and their test files) used the `any` type to bypass strict typing for external library types (like `Job` from `bullmq`), generic objects, and Jest mocks.
_(Kode awal untuk `ScheduledJobsProcessor` dan `ScheduledJobsService` (beserta test-nya) menggunakan tipe `any` untuk mem-bypass strict typing pada tipe library eksternal (seperti `Job` dari `bullmq`), objek generik, dan mock Jest.)_

Specifically:

1. `async process(job: Job<any, any, string>)`
2. `async addCronJob(name: string, cronPattern: string, data: any = {})`
3. `let queueMock: any; let loggerMock: any;`

The ESLint rule `@typescript-eslint/no-explicit-any` correctly caught these deviations and failed the commit.
_(Aturan ESLint `@typescript-eslint/no-explicit-any` secara tepat menangkap penyimpangan ini dan menggagalkan proses commit.)_

## Solution (Solusi)

1. **Type-Safe Job Parameters (Parameter Job Secara Type-Safe)**:
   Replaced the `any` generic type in the BullMQ `Job` interface with `unknown`.
   _(Mengganti tipe generik `any` pada interface `Job` BullMQ dengan `unknown`.)_
   `async process(job: Job<unknown, unknown, string>): Promise<unknown>`

2. **Record Type for Objects (Tipe Record untuk Objek)**:
   Replaced `any` with `Record<string, unknown>` for the payload data object parameter in the service to properly define it as a generic key-value dictionary.
   _(Mengganti `any` dengan `Record<string, unknown>` untuk parameter objek data payload di service guna mendefinisikannya secara tepat sebagai kamus key-value generik.)_
   `async addCronJob(name: string, cronPattern: string, data: Record<string, unknown> = {})`

3. **Record Type for Mocks (Tipe Record untuk Mock)**:
   Replaced `any` with `Record<string, jest.Mock>` for the mock variables in the test files, explicitly typing them as objects containing Jest mock functions.
   _(Mengganti `any` dengan `Record<string, jest.Mock>` untuk variabel mock di file test, yang secara eksplisit memberikan tipe sebagai objek berisi fungsi mock Jest.)_
   `let loggerMock: Record<string, jest.Mock>;`

## Prevention (Pencegahan)

- **Use `unknown` instead of `any` (Gunakan `unknown` alih-alih `any`)**: When dealing with external payload data where the structure is not completely guaranteed, `unknown` forces the developer to perform type-checking or narrowing before use, keeping the codebase type-safe.
  _(Saat berhadapan dengan data payload eksternal yang strukturnya belum pasti, `unknown` memaksa developer untuk melakukan type-checking atau penyempitan tipe (narrowing) sebelum digunakan, sehingga keseluruhan kode tetap type-safe.)_
- **Strictly Type Test Mocks (Definisikan Tipe Mock Test Secara Ketat)**: Avoid using `any` for mock objects. Use `Record<string, jest.Mock>`, `Partial<T>`, or `jest.Mocked<T>` to maintain type safety in unit tests.
  _(Hindari penggunaan `any` untuk objek mock. Gunakan `Record<string, jest.Mock>`, `Partial<T>`, atau `jest.Mocked<T>` untuk menjaga keamanan tipe di dalam unit test.)_
