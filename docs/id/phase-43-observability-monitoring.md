# Dokumentasi Fase 43: Observability & Monitoring

## Ringkasan Fase

Fase ini berfokus pada implementasi dan perancangan modul **Observability & Monitoring** dalam platform Flowlyx. Setiap fitur yang dikerjakan pada fase ini dirancang untuk dapat di-scale dengan baik dan tidak menimbulkan utang teknis (technical debt) yang berarti.

## Pekerjaan yang Dilakukan

Fokus utama dalam pengerjaan fase **Observability & Monitoring** ini adalah mendesain arsitektur modul secara spesifik, membangun entitas data, menerapkan logika bisnis (business logic) dalam services, dan mengekspos endpoint API (atau UI) yang diperlukan. Pengembangan juga meliputi pengujian unit (unit testing) untuk menjamin fungsi inti tidak terganggu oleh pembaruan fase berikutnya.

## Pemilihan Teknologi dan Tech Stack

Berikut adalah daftar teknologi, alat, atau framework yang memainkan peran penting di dalam fase ini:

### Datadog / Sentry

- **Alasan Pemilihan:** Memudahkan identifikasi masalah performa (bottleneck) di lingkungan produksi.
- **Kelebihan dibanding Alternatif:** Monitoring lengkap, tracing aplikasi terdistribusi, pemantauan error frontend dan backend.
- **Kekurangan dibanding Alternatif:** Harga layanan lumayan mahal untuk skala besar.
