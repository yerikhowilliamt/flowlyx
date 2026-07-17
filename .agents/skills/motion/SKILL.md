---
name: motion
description: Guidelines for UI animations and transitions.
---

# Motion & Transitions

- **Durasi & Easing**: Gunakan durasi yang cepat dan transisi yang halus agar aplikasi terasa "snappy".
  - Default: `duration-200 ease-in-out`
  - Mikro-interaksi: `duration-150`
- **Interaksi Hover**: Selalu tambahkan transisi untuk interaksi hover pada tombol dan link. (Contoh: `transition-colors hover:bg-zinc-800`).
- **State Change**: Animasi yang muncul atau menghilang (masuk/keluar DOM) harus memiliki fade atau scale yang halus. (Bisa menggunakan `framer-motion` jika diinstal, atau utility animasi Tailwind seperti `animate-in fade-in zoom-in`).
- **Gunakan Secukupnya**: Jangan gunakan animasi yang terlalu heboh. Animasi harus terasa bertujuan (purposeful) dan membantu pemahaman spasial pengguna.
