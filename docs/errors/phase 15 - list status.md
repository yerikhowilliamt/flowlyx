# Phase 15 - List / Status: Jest Mock Call Count Leakage

## Symptoms (Gejala)

During the implementation of Phase 15 (List / Status module), running the unit tests using `npm run test -- lists` resulted in the following failure in `lists.controller.spec.ts`:
_(Selama implementasi Phase 15 (modul List / Status), menjalankan unit test menggunakan perintah `npm run test -- lists` berujung pada kegagalan berikut di `lists.controller.spec.ts`:)_

```
● ListsController › findAll › should return empty array if boardId is not provided

  expect(jest.fn()).not.toHaveBeenCalled()

  Expected number of calls: 0
  Received number of calls: 1

  1: "board-1"
```

## Root Cause (Akar Masalah)

The `lists.controller.spec.ts` tests used a shared mock object (`mockListsService`) for the `ListsService`. In the test setup (`beforeEach`), the mocks were not being cleared before each test execution. As a result, the `findAllByBoardId` method mock retained its call count from the previous test (`should return lists if boardId is provided`), causing the subsequent test (which expected 0 calls) to fail.
_(Test di `lists.controller.spec.ts` menggunakan satu buah objek mock yang dibagikan (`mockListsService`) untuk kebutuhan `ListsService`. Pada tahapan persiapan test (`beforeEach`), mock tersebut tidak dibersihkan sebelum eksekusi test selanjutnya dimulai. Akibatnya, pemanggilan mock untuk metode `findAllByBoardId` mempertahankan hitungan eksekusi (call count) dari test sebelumnya (`should return lists if boardId is provided`), yang menyebabkan test selanjutnya (yang mengharapkan pemanggilan sebanyak 0 kali) gagal.)_

## Investigation (Investigasi)

- Reviewed the test execution logs to identify the failing test block.
  _(Meninjau log eksekusi test untuk mengidentifikasi blok test yang gagal.)_
- Analyzed `lists.controller.spec.ts` focusing on how `mockListsService` was defined and injected.
  _(Menganalisis `lists.controller.spec.ts` berfokus pada bagaimana objek `mockListsService` didefinisikan dan disuntikkan.)_
- Confirmed that `mockListsService.findAllByBoardId` was called in the previous test block but no mechanism like `jest.clearAllMocks()` was invoked in `beforeEach` to reset the tracking counters.
  _(Mengonfirmasi bahwa `mockListsService.findAllByBoardId` memang terpanggil pada test sebelumnya, tetapi mekanisme seperti `jest.clearAllMocks()` tidak dipanggil di blok `beforeEach` untuk menyetel ulang angka pelacakan.)_

## Solution (Solusi)

Added `jest.clearAllMocks();` inside the `beforeEach` block of `lists.controller.spec.ts` to ensure that all mock invocation records and return values are wiped clean before each test begins.
_(Menambahkan pemanggilan `jest.clearAllMocks();` di dalam blok `beforeEach` pada `lists.controller.spec.ts` untuk memastikan bahwa semua riwayat pemicuan mock dan nilai kembaliannya dibersihkan total sebelum setiap test dimulai.)_

```typescript
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
// ...
```

## Trade-offs (Kelemahan/Pertukaran)

- **Performance (Performa)**: Clearing all mocks adds a very marginal, generally imperceptible overhead to the test suite setup.
  _(Membersihkan semua mock akan memberikan sedikit tambahan beban waktu yang sangat kecil - dan tak terasa - terhadap pengaturan awal eksekusi test suite.)_
- **Strictness (Keketatan Aturan)**: Ensures absolute test isolation, preventing hidden inter-test dependencies, making test behaviors predictable and resilient.
  _(Menjamin isolasi test secara mutlak, mencegah adanya dependensi tak kasat mata di antara test-test yang berjalan, dan membuat perilaku test tersebut dapat diprediksi sekaligus tangguh.)_

## Prevention (Pencegahan)

- **Test Isolation Standards (Standar Isolasi Test)**: Enforce the usage of `jest.clearAllMocks()` in all `beforeEach` test setups as a standard practice across the repository for all controller and service unit tests.
  _(Mewajibkan penggunaan `jest.clearAllMocks()` di seluruh blok `beforeEach` sebagai standar praktik di berbagai lokasi pada proyek ini, baik untuk unit test controller maupun unit test service.)_
- **Code Reviews**: Actively check for test isolation patterns during code reviews when shared mock objects are introduced.
  _(Secara aktif memeriksa pola-pola isolasi test selama sesi code review terutama saat seseorang membuat objek mock berformat 'shared'.)_

## References (Referensi)

- [Jest Documentation: Mock Functions - `clearAllMocks()`](https://jestjs.io/docs/jest-object#jestclearallmocks)
