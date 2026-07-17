---
name: layout
description: Layout rules for Sidebar, Navbar, Dashboard, Auth, Settings.
---

# Layout Rules

- **Dashboard**: Gunakan grid layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3` atau `4`) untuk card metrik. Pastikan ada spasi (`gap-4` atau `gap-6`) yang lega.
- **Sidebar**: Posisi tetap (fixed/sticky) di sebelah kiri, background `bg-zinc-950` atau `bg-zinc-900`, item navigasi aktif menggunakan teks oranye atau background halus.
- **Navbar/Header**: Ketinggian konsisten (misal `h-16`), berisi breadcrumbs, search, dan profil/notifikasi di kanan.
- **Auth**: Layout split (setengah gambar/branding, setengah form) atau form card di tengah layar dengan background bersih.
- **Spacing**: Gunakan sistem spacing Tailwind secara konsisten (misal selalu gunakan kelipatan 4: `p-4`, `p-6`, `p-8`).
