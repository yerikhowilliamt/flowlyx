---
name: component
description: Rules for using and styling UI components (Button, Card, Modal, Table, Badge, Input).
---

# Component Rules

Aturan untuk komponen UI (diutamakan menggunakan shadcn/ui):
- **Button**: 
  - Primary: `bg-orange-500 text-white hover:bg-orange-600`.
  - Secondary/Outline: `border-zinc-700 hover:bg-zinc-800`.
  - Ghost: `hover:bg-zinc-800/50`.
- **Card**: Gunakan `Card` shadcn dengan background `bg-zinc-900` dan border tipis `border-zinc-800`.
- **Input**: Background `bg-zinc-950` atau transparan, ring color saat fokus menggunakan warna oranye (`focus-visible:ring-orange-500`).
- **Badge**: Gunakan varian warna yang sesuai secara semantik (hijau untuk sukses, merah untuk error/destruktif).
