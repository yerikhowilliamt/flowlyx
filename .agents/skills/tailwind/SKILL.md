---
name: tailwind
description: Rules and best practices for using Tailwind CSS.
---

# Tailwind CSS Rules

- **Konsistensi**: Gunakan utility classes secara langsung. Hindari membuat `@apply` di file CSS eksternal kecuali untuk komponen base yang sangat berulang.
- **Arbitrary Values**: Hindari penggunaan arbitrary values (`w-[321px]`) sebisa mungkin. Gunakan nilai yang ada di konfigurasi Tailwind (seperti `w-80`).
- **Responsive**: Selalu gunakan pendekatan mobile-first. Tulis base class untuk mobile, lalu gunakan modifier `sm:`, `md:`, `lg:` untuk menyesuaikan layout di layar besar.
- **Clean Code**: Urutkan class Tailwind secara logis (layout -> margin/padding -> ukuran -> tipografi -> warna -> efek). (Atau gunakan prettier-plugin-tailwindcss).
