---
name: accessibility
description: Accessibility rules, WCAG compliance, keyboard navigation, focus states.
---

# Accessibility (a11y)

- **Focus States**: Setiap elemen interaktif (tombol, link, input) harus memiliki focus ring yang jelas. Contoh: `focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none`.
- **Keyboard Navigation**: Aplikasi harus bisa digunakan sepenuhnya hanya dengan keyboard (Tab, Enter, Space, Arrow keys).
- **Aria Attributes**: Gunakan aria-label untuk elemen yang tidak memiliki teks (seperti tombol icon). Gunakan aria-hidden untuk dekorasi visual murni.
- **Contrast**: Pastikan rasio kontras teks terhadap background memenuhi standar WCAG (minimal 4.5:1 untuk teks normal). Gunakan abu-abu terang, bukan abu-abu gelap, di atas background hitam.
- **Screen Readers**: Komponen kompleks (seperti dialog, dropdown) dari shadcn biasanya sudah accessible, jangan merusak aksesibilitas bawaannya.
