---
name: component
description: Rules for using and styling UI components (Button, Card, Modal, Table, Badge, Input).
---

# Component Rules

Aturan untuk komponen UI (diutamakan menggunakan shadcn/ui):

- **Cursor**: Semua elemen yang bisa diklik (button, link, tab, checkbox, radio, switch, select trigger, dropdown item, card yang clickable, icon button, dsb) **wajib** menggunakan `cursor-pointer`. Elemen yang disabled harus menggunakan `disabled:cursor-not-allowed` (bukan `cursor-pointer`).
- **Button**:
  - Primary: `bg-orange-500 text-white hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`.
  - Secondary/Outline: `border-zinc-700 hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`.
  - Ghost: `hover:bg-zinc-800/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`.
- **Card**: Gunakan `Card` shadcn dengan background `bg-zinc-900` dan border tipis `border-zinc-800`. Jika `Card` berfungsi sebagai elemen yang bisa diklik (misalnya membuka detail), tambahkan `cursor-pointer` dan `hover:border-zinc-700` untuk memberi indikasi interaktif.
- **Input**: Background `bg-zinc-950` atau transparan, ring color saat fokus menggunakan warna oranye (`focus-visible:ring-orange-500`). (Input teks biasa tidak perlu `cursor-pointer`, gunakan `cursor-text` default browser.)
- **Badge**: Gunakan varian warna yang sesuai secara semantik (hijau untuk sukses, merah untuk error/destruktif). Jika Badge dipakai sebagai filter/tombol yang bisa diklik, tambahkan `cursor-pointer`.
