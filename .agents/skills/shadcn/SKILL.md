---
name: shadcn
description: Guidelines for consistently using and customizing shadcn/ui components.
---

# shadcn/ui Guidelines

- **Instalasi Komponen**: Gunakan CLI `npx shadcn-ui@latest add <component>` untuk menginstal komponen yang dibutuhkan. Jangan membuat ulang (reinvent the wheel) jika komponennya sudah ada di shadcn.
- **Modifikasi**: Jika perlu mengubah gaya komponen bawaan shadcn (yang diletakkan di `components/ui/`), pastikan perubahan dilakukan dengan hati-hati. Gunakan properti Tailwind yang sudah diatur dalam file tersebut.
- **Warna CSS Variables**: Konfigurasikan file `globals.css` (bagian `:root` dan `.dark`) untuk menggunakan skema warna dark mode dengan aksen oranye, sehingga seluruh komponen shadcn otomatis mengikutinya.
- **Prop Variants**: Manfaatkan `class-variance-authority` (cva) yang ada di komponen shadcn untuk membuat variasi komponen jika diperlukan (misal ukuran button tambahan).
