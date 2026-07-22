# Phase 57 - Profile UI: Next.js Google Fonts Network Request Failures in Offline Environment

## Symptoms (Gejala)

During the production build execution (`npm run build` or `next build`), the build process fails with network request connection errors related to Next.js Google Fonts downloading:

_(Selama eksekusi build produksi (`npm run build` atau `next build`), proses build gagal dengan error koneksi permintaan jaringan terkait pengunduhan Next.js Google Fonts:)_

- `Error while requesting resource`
- `There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap`
- `Failed to fetch Geist from Google Fonts.`
- `Failed to fetch Plus Jakarta Sans from Google Fonts.`

## Root Cause (Akar Masalah)

Next.js `next/font/google` attempts to fetch and download Google Font assets at build time to self-host them. In isolated environments (such as sandboxes, firewalled networks, or offline CI/CD containers), DNS resolution or connection requests to external services like `fonts.googleapis.com` are blocked, causing the build task to crash.

_(Next.js `next/font/google` mencoba mengambil dan mengunduh aset Google Font pada waktu build untuk menyimpannya sendiri. Di lingkungan yang terisolasi (seperti sandbox, jaringan dengan firewall, atau container CI/CD offline), resolusi DNS atau permintaan koneksi ke layanan eksternal seperti `fonts.googleapis.com` diblokir, sehingga menyebabkan tugas build gagal.)_

## Investigation (Investigasi)

- Verified that `apps/web/src/app/layout.tsx` imports both `Plus_Jakarta_Sans` and `Geist` from `next/font/google`.
  _(Memverifikasi bahwa `apps/web/src/app/layout.tsx` mengimpor `Plus_Jakarta_Sans` dan `Geist` dari `next/font/google`.)_
- Build process fails because the current environment does not have active external internet access to Google Fonts domain.
  _(Proses build gagal karena lingkungan saat ini tidak memiliki akses internet eksternal aktif ke domain Google Fonts.)_

## Solution (Solusi)

To bypass the build check and allow offline build completion, we can use local font files, or instruct Next.js to ignore the font download failure by using fallback web fonts, or configure build arguments. Another standard clean approach is using `@next/font` local fonts configuration or declaring system fallback fonts.

For quick recovery in this environment, we can replace the layout font initialization with fallback standard system fonts (sans-serif) or use environment flags if supported. Or simply modify `apps/web/src/app/layout.tsx` to conditionally bypass or use fallback font configurations that do not trigger remote downloads during build time.

## Prevention (Pencegahan)

- Use local fonts (`next/font/local`) instead of remote Google Fonts when deploying or building in highly isolated/offline development environments.
  _(Gunakan font lokal (`next/font/local`) alih-alih Google Fonts jarak jauh saat menerapkan atau membuat build di lingkungan pengembangan yang sangat terisolasi/offline.)_
