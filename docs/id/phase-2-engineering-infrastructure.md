# Dokumentasi Fase 2: Engineering Infrastructure

## Ringkasan Fase

Fase ini berfokus pada implementasi dan perancangan modul **Engineering Infrastructure** dalam platform Flowlyx. Setiap fitur yang dikerjakan pada fase ini dirancang untuk dapat di-scale dengan baik dan tidak menimbulkan utang teknis (technical debt) yang berarti.

## Pekerjaan yang Dilakukan

Fokus utama dalam pengerjaan fase **Engineering Infrastructure** ini adalah mendesain arsitektur modul secara spesifik, membangun entitas data, menerapkan logika bisnis (business logic) dalam services, dan mengekspos endpoint API (atau UI) yang diperlukan. Pengembangan juga meliputi pengujian unit (unit testing) untuk menjamin fungsi inti tidak terganggu oleh pembaruan fase berikutnya.

## Pemilihan Teknologi dan Tech Stack

Berikut adalah daftar teknologi, alat, atau framework yang memainkan peran penting di dalam fase ini:

### Turborepo

- **Alasan Pemilihan:** Pengelolaan dependencies yang rapi antara frontend, backend, dan package database.
- **Kelebihan dibanding Alternatif:** Caching yang sangat agresif dan eksekusi task secara paralel.
- **Kekurangan dibanding Alternatif:** Pengaturan Remote Caching untuk tim butuh integrasi layanan spesifik.

### GitHub Actions

- **Alasan Pemilihan:** Otomatisasi Pipeline (CI/CD) yang mulus dari PR ke Deployment.
- **Kelebihan dibanding Alternatif:** Terintegrasi langsung dengan repository GitHub, tidak perlu server CI tambahan.
- **Kekurangan dibanding Alternatif:** Runner bawaan tidak secepat runner dedicated.
