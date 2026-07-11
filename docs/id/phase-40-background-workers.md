# Dokumentasi Fase 40: Background Workers

## Ringkasan Fase

Fase ini berfokus pada implementasi dan perancangan modul **Background Workers** dalam platform Flowlyx. Setiap fitur yang dikerjakan pada fase ini dirancang untuk dapat di-scale dengan baik dan tidak menimbulkan utang teknis (technical debt) yang berarti.

## Pekerjaan yang Dilakukan

Fokus utama dalam pengerjaan fase **Background Workers** ini adalah mendesain arsitektur modul secara spesifik, membangun entitas data, menerapkan logika bisnis (business logic) dalam services, dan mengekspos endpoint API (atau UI) yang diperlukan. Pengembangan juga meliputi pengujian unit (unit testing) untuk menjamin fungsi inti tidak terganggu oleh pembaruan fase berikutnya.

## Pemilihan Teknologi dan Tech Stack

Berikut adalah daftar teknologi, alat, atau framework yang memainkan peran penting di dalam fase ini:

### BullMQ

- **Alasan Pemilihan:** Mengelola proses asynchronous agar pengguna tidak perlu menunggu loading lama (background processing).
- **Kelebihan dibanding Alternatif:** Berjalan di atas Redis, stabil, dan memiliki fitur retry serta cron-like bawaan.
- **Kekurangan dibanding Alternatif:** Akan ikut tumbang (down) jika server Redis mengalami gangguan.
