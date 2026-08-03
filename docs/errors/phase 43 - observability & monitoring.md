# Phase 43 - Observability & Monitoring

## Verification Summary

Fase ini awalnya diselesaikan tanpa penambahan kode karena fungsionalitas observability bawaan (Pino, Correlation ID) sudah diimplementasikan (mematuhi prinsip YAGNI). Namun, atas permintaan eksplisit, modul Grafana dan Prometheus ditambahkan untuk memperkaya metrik dan portofolio.

---

# Phase 43 - Jest Open Handles / Worker Process Failed to Exit Gracefully

## Symptoms (Gejala)

Selama eksekusi _test suite_ secara keseluruhan (`npm run test`), meskipun semua test berhasil (49 test suites, 236 passed), di akhir eksekusi Jest memunculkan pesan _warning/error_ berikut dan prosesnya harus dimatikan paksa:

_(During the full execution of the test suite, although all tests passed, at the end of the execution Jest threw the following warning/error and had to be force exited:)_

`A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.`

## Root Cause (Akar Masalah)

Masalah ini terjadi karena ada koneksi asinkron, _timer_, atau antrean (_queue_) yang masih terbuka setelah semua _test_ selesai dijalankan. Dalam konteks aplikasi Flowlyx, beberapa tersangka utamanya adalah:

1. **Koneksi Database (PrismaClient)** yang tidak di-_disconnect_ secara eksplisit di modul-modul test tertentu.
2. **Koneksi Redis (BullMQ/Cache)** yang masih melakukan _polling_ atau tetap terkoneksi setelah blok `afterAll` selesai.
3. **Pino Logger** atau **Prometheus Metrics** yang masih menahan _I/O stream_ atau _timer_ aktif.

_(This issue occurs because there are asynchronous connections, timers, or queues still open after all tests have completed. Primary suspects include PrismaClient connections not explicitly disconnected, Redis connections still polling, or Pino/Prometheus holding active timers.)_

## Investigation (Investigasi)

- Mengamati log eksekusi dari Jest dan memastikan bahwa tidak ada test yang _failed_ (semua _logic_ bisnis aman).
- Error ini bukan merupakan _failure_ pada logika _code_, melainkan pada siklus hidup (_lifecycle_) _teardown_ lingkungan pengujian (testing environment).
- Eksekusi berhasil karena Jest mematikan paksa _worker_, tetapi hal ini bisa menjadi bom waktu untuk _CI/CD pipeline_ jika memory leak bertambah banyak.

## Solution (Solusi)

Karena saat ini fokus utama fase adalah Observability, dan semua tes logika berlalu 100%, berikut adalah solusi penanganan _teardown_:

1. **Menggunakan `--forceExit` (Solusi Jangka Pendek)**: Memastikan Jest secara eksplisit dimatikan dalam _script_ CI/CD agar tidak menggantung (_hang_) (_Trade-off_: menutupi masalah _memory leak_ di environment test).
2. **Proper Teardown Lifecycle (Solusi Jangka Panjang)**: Menambahkan blok `afterAll()` pada setiap `*.spec.ts` yang berinteraksi dengan database/redis:
   ```typescript
   afterAll(async () => {
     await app.close();
     // atau
     await prisma.$disconnect();
   });
   ```

## Prevention (Pencegahan)

- **Standardisasi Test Setup**: Pastikan template modul test baru selalu mengikutsertakan fase penutupan aplikasi atau _disconnect_ dari _third-party service_.
- Secara berkala menjalankan `jest --detectOpenHandles` di lokal untuk memburu koneksi spesifik mana (Prisma, Redis, HTTP Server) yang tidak tertutup dengan sempurna dan memperbaikinya.

---

# Phase 43 - Linter/TypeScript Strict Typing Error (No Explicit Any)

## Symptoms (Gejala)

Saat mencoba melakukan _commit_ kode untuk integrasi Loki melalui _Husky pre-commit hook_, CI/CD pipeline internal gagal pada langkah `eslint --fix` dengan pesan error:

`C:\Users\Yerikho\Project\Flowlyx\apps\api\src\core\logger\logger.module.ts 20:26 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`

## Root Cause (Akar Masalah)

Error ini disebabkan oleh penerapan tipe `any` (`null as any`) saat mendefinisikan elemen _array_ `targets` pada konfigurasi `pino-loki` secara kondisional berdasarkan `NODE_ENV`. Karena proyek ini memiliki kebijakan linting ketat untuk melarang penggunaan `any` dalam segala situasi, _linter_ menolak untuk me-_compile_ dan me-_commit_ perubahan.

## Investigation (Investigasi)

- Analisis kode pada `logger.module.ts` menunjukkan adanya logika operator ternary (`condition ? object : (null as any)`) dalam array transport Pino.
- Pendekatan ini dipakai untuk menyaring _log target_ yang tidak dipakai di _production_, tetapi bertentangan dengan standar Typescript.

## Solution (Solusi)

Mengganti logika inisialisasi _array_ kondisional dengan memanfaatkan fitur **Spread Operator** `...(...)` dan array kosong `[]`, sehingga TypeScript secara otomatis bisa melakukan _infer_ tipe tanpa memerlukan _casting_ `any`.

```typescript
targets: [
  ...(process.env.NODE_ENV !== 'production'
    ? [{ target: 'pino-pretty', options: { ... } }]
    : []),
  { target: 'pino-loki', options: { ... } },
]
```

## Prevention (Pencegahan)

- Selalu manfaatkan **Spread Operator** atau **Array.filter()** yang dikombinasikan dengan Type Guards (seperti `Boolean`) untuk menangani elemen _array_ kondisional, menghindari penggunaan _casting_ eksplisit (_type coercion_) seperti `as any` atau `as unknown`.
