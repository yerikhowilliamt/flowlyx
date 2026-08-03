# Phase 59 - Performance Optimization: Bundle Size & Devtools Asset Optimization

## Symptoms (Gejala)

During the implementation of Phase 59 (Performance Optimization), the Next.js bundle footprint and devtools overhead were analyzed:

- Unoptimized package imports from large UI icon libraries (`lucide-react`, `@radix-ui/react-icons`) resulted in tree-shaking overhead and larger initial JS bundle chunks.
- Development tools such as `@tanstack/react-query-devtools` were loaded unconditionally in the `QueryProvider`, leading to unused code path execution in production.

_(Selama implementasi Phase 59 (Performance Optimization), ukuran bundle Next.js dan overhead devtools dianalisis:)_

- _Import paket yang tidak dioptimalkan dari pustaka ikon UI yang besar (`lucide-react`, `@radix-ui/react-icons`) menyebabkan overhead tree-shaking dan chunk JS awal yang lebih besar._
- _Alat bantu pengembangan seperti `@tanstack/react-query-devtools` dimuat secara tidak bersyarat pada `QueryProvider`, menyebabkan eksekusi kode yang tidak diperlukan pada environment production._

---

## Root Cause (Akar Masalah)

1. **Unoptimized Icon Package Barrel Imports**:
   Next.js by default evaluates barrel export files when importing icons, unless explicit package import optimizations are enabled in `next.config.ts`.
   _(Secara bawaan Next.js mengevaluasi berkas ekspor barrel saat mengimpor ikon, kecuali konfigurasi optimasi impor paket diaktifkan secara eksplisit pada `next.config.ts`.)_

2. **Unconditional Devtools Rendering**:
   `ReactQueryDevtools` was rendered directly inside `QueryProvider` without checking `process.env.NODE_ENV`, including its component logic in production runtime builds.
   _(`ReactQueryDevtools` dirender secara langsung di dalam `QueryProvider` tanpa memeriksa `process.env.NODE_ENV`, sehingga logika komponennya ikut terbawa pada runtime build production.)_

---

## Investigation (Investigasi)

- Inspected `apps/web/next.config.ts` and noted the absence of `experimental.optimizePackageImports`.
  _(Memeriksa `apps/web/next.config.ts` dan mencatat belum adanya konfigurasi `experimental.optimizePackageImports`.)_
- Checked `apps/web/src/providers/query-provider.tsx` where `<ReactQueryDevtools>` was included at the top-level return JSX without environment guards.
  _(Memeriksa `apps/web/src/providers/query-provider.tsx` di mana `<ReactQueryDevtools>` dimasukkan langsung pada JSX return tanpa pengecekan environment.)_

---

## Solution (Solusi)

1. **Configured Package Import Optimization (`next.config.ts`)**:
   Added `experimental.optimizePackageImports` to enable automatic modularized imports for UI icon libraries:
   _(Menambahkan `experimental.optimizePackageImports` untuk mengaktifkan impor modular otomatis bagi pustaka ikon UI:)_

   ```ts
   import type { NextConfig } from 'next';

   const nextConfig: NextConfig = {
     experimental: {
       optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
     },
   };

   export default nextConfig;
   ```

2. **Environment-Gated ReactQueryDevtools (`query-provider.tsx`)**:
   Wrapped `ReactQueryDevtools` with a `process.env.NODE_ENV !== 'production'` check:
   _(Membungkus `ReactQueryDevtools` dengan pengecekan `process.env.NODE_ENV !== 'production'`:)_

   ```tsx
   return (
     <QueryClientProvider client={queryClient}>
       {children}
       {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
     </QueryClientProvider>
   );
   ```

---

## Prevention (Pencegahan)

- **Always Optimize Heavy Barrel Packages**: Specify frequently imported component & icon libraries in `experimental.optimizePackageImports` in Next.js config.
  _(Selalu daftarkan pustaka komponen & ikon yang sering diimpor pada `experimental.optimizePackageImports` di konfigurasi Next.js.)_
- **Gate Development Tooling**: Ensure all dev-only providers, overlays, and logging tools are strictly guarded with environment condition checks.
  _(Pastikan seluruh provider, overlay, dan tool logging khusus dev dibungkus dengan pengecekan kondisi environment secara ketat.)_
