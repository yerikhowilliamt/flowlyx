# Dokumentasi Fase 7: Authentication

## Ringkasan Fase

Fase ini berfokus pada implementasi dan perancangan modul **Authentication** dalam platform Flowlyx. Setiap fitur yang dikerjakan pada fase ini dirancang untuk dapat di-scale dengan baik dan tidak menimbulkan utang teknis (technical debt) yang berarti.

## Pekerjaan yang Dilakukan

Fokus utama dalam pengerjaan fase **Authentication** ini adalah mendesain arsitektur modul secara spesifik, membangun entitas data, menerapkan logika bisnis (business logic) dalam services, dan mengekspos endpoint API (atau UI) yang diperlukan. Pengembangan juga meliputi pengujian unit (unit testing) untuk menjamin fungsi inti tidak terganggu oleh pembaruan fase berikutnya.

## Pemilihan Teknologi dan Tech Stack

Berikut adalah daftar teknologi, alat, atau framework yang memainkan peran penting di dalam fase ini:

### JWT (JSON Web Token)

- **Alasan Pemilihan:** Memudahkan arsitektur tanpa batas (tidak terikat memori server tunggal).
- **Kelebihan dibanding Alternatif:** Stateless, mudah diverifikasi lintas service (skalabilitas tinggi).
- **Kekurangan dibanding Alternatif:** Pencabutan (revoke) token yang belum expired lebih rumit.

### Argon2

- **Alasan Pemilihan:** Standar pengamanan tertinggi saat ini untuk enkripsi (hashing) kredensial pengguna.
- **Kelebihan dibanding Alternatif:** Memory-hard algorithm, sangat tahan terhadap serangan peretasan GPU/ASIC terkini.
- **Kekurangan dibanding Alternatif:** Konsumsi CPU dan RAM tinggi, bisa membebani server jika request terlalu beruntun.

### Passport.js

- **Alasan Pemilihan:** Modularitas dalam strategi login (Local, OAuth).
- **Kelebihan dibanding Alternatif:** Ekosistem luas, mudah memperluas metode autentikasi (Google, GitHub, dsb).
- **Kekurangan dibanding Alternatif:** Kadang terasa over-abstracted sehingga debug sulit.
