# Flowlyx — Agent Guide

## Workflow Rules

- **Sebelum mulai mengerjakan**, buat dulu `Implementation Plan` atau planning-nya terlebih dahulu. Tunggu review dari user. Baru mulai kerjakan setelah di-_approve_.
- **Jangan lakukan PR** jika belum diperintahkan secara eksplisit oleh user.
- Setelah selesai mengerjakan implementasi atau planning-nya, **selalu panggil skill `ponytail-review`** untuk memastikan tidak ada over-engineering.
- Untuk task sederhana yang eksplisit dan sudah jelas scope-nya (contoh: "ganti button native jadi shadcn button di file X"), Implementation Plan boleh dilewati — langsung eksekusi. Implementation Plan wajib untuk task yang butuh keputusan desain, menyentuh >1 modul, atau mengubah kontrak API/skema database.
- **Setiap kali membuat (create) atau mengedit (edit) sebuah file, langsung buka (view/read) file tersebut setelahnya** untuk memverifikasi hasil perubahan sebelum melanjutkan ke langkah berikutnya atau melaporkan selesai ke user.

## Execution Rules (baca sebelum explore file)

- **Cek dulu section "Known Locations" di bawah** sebelum melakukan glob/grep/read massal. Kalau lokasi file/komponen yang dibutuhkan sudah tercantum di situ, langsung pakai — jangan verifikasi ulang dengan explore folder.
- Untuk task straightforward (ganti elemen native ke komponen library, rename, fix typo, ubah styling satu komponen), baca **hanya file yang direferensikan user atau file yang jelas-jelas relevan**. Jangan baca seluruh modul/folder untuk task yang scope-nya sudah sempit.
- Kalau butuh mencari sesuatu, gunakan grep/glob dengan query **spesifik** (nama komponen, nama fungsi, nama route) — bukan `list directory` lalu baca satu-satu.
- Jangan re-verify hal yang sudah confirmed di step sebelumnya dalam task yang sama (misal: sudah cek `package.json` sekali, jangan cek ulang untuk alasan yang sama).
- Selesaikan task dengan perubahan seminimal mungkin yang menyelesaikan requirement — selaras dengan skill `ponytail` (YAGNI-first).

## Debugging Protocol (coba cheap fixes dulu sebelum deep-dive)

Sebelum melakukan investigasi berat (baca banyak file, query database, grep massal, trace call chain lintas modul), cek dulu apakah error yang muncul match salah satu pola umum berikut. Kalau match, **langsung eksekusi fix-nya**, jangan investigasi lebih jauh:

- **Route/page baru tidak terdeteksi, dapat 404 padahal file sudah ada dan sudah benar** → curigai stale Next.js dev cache. Fix: hapus `apps/web/.next`, minta user restart dev server. Jangan query database atau curigai backend/RBAC dulu.
- **Prisma client error (module not found / `EPERM` saat generate)** → curigai ada proses lain (dev server) yang mengunci file. Fix: minta user stop dev server dulu, baru generate ulang.
- **Type error yang muncul di path `.next/dev/types/**` atau file generated lainnya** → itu gejala, bukan akar masalah. Jangan dianalisis atau diedit manual. Fix: hapus folder `.next`, biarkan Next.js regenerate.
- **Error setelah pull/merge branch baru (module not found, type mismatch aneh)** → curigai `node_modules` atau Prisma client belum sinkron. Fix: `npm ci` lalu `npx prisma generate --workspace=packages/database`.

Aturan umum: **kalau error message menunjuk ke path di dalam `.next/`, `node_modules/`, atau file yang jelas-jelas generated — itu gejala cache/build state, bukan bug di source code.** Curigai cache dulu sebelum audit logika kode.

Kalau tidak ada pola yang cocok, baru lakukan investigasi normal — tapi mulai dari hipotesis **paling murah untuk divalidasi** (restart process, cek env var, cek versi dependency) sebelum masuk ke hipotesis mahal (query database langsung, baca banyak file, trace lintas modul).

## Output Style

- Jangan narasikan proses berpikir secara verbatim ("wait, let's check X...", "ah I see...", "hmm, what if..."). Langsung: hipotesis → satu langkah verifikasi → kesimpulan → aksi.
- Kalau solusinya ternyata simpel, katakan itu di **awal** respons — jangan setelah eksplorasi panjang.
- Default: jawaban singkat, tanpa preamble/kesimpulan panjang, kecuali user minta detail atau task-nya memang butuh penjelasan (misal keputusan arsitektur).

## Quick Commands

```bash
# Install deps (npm, NOT pnpm — README is wrong)
npm ci

# Dev servers (run from root or individual workspaces)
npm run dev                  # turbo: all workspaces
npm run dev --workspace=apps/api   # NestJS on :4000, piped through pino-pretty
npm run dev --workspace=apps/web   # Next.js on :3015 (turbopack)

# Verify (CI order — respect this sequence)
npm run build --workspace=packages/database   # must build DB package first
npm run lint
npm run type-check
npm run test
npm run build

# Single workspace
npm run lint --workspace=apps/api
npm run type-check --workspace=apps/web
npm run test --workspace=apps/api

# E2E tests (separate config, loads .env.test)
npm run test:e2e --workspace=apps/api

# Prisma
npx prisma generate --workspace=packages/database
npx prisma migrate dev --workspace=packages/database
npx prisma db seed --workspace=packages/database

# Reset stale Next.js dev cache (route 404 padahal file sudah benar)
rm -rf apps/web/.next   # lalu restart dev server
```

## Architecture

- **Monorepo**: npm workspaces + Turborepo. Do NOT use pnpm or yarn.
- **`apps/api`**: NestJS backend. Entry: `src/main.ts`. Modules under `src/modules/` (33 modules). Global prefix `/api`. Swagger at `/api/docs`. Uses Zod validation pipes, helmet, compression, pino logger. API uses CommonJS module system.
- **`apps/web`**: Next.js 16 frontend (App Router, React 19, Turbopack). Components use shadcn/ui (base-nova style, Tailwind v4). Path alias `@/*` → `./src/*`. Uses ESNext/bundler module system.
- **`packages/database`**: Prisma schema + migrations. PostgreSQL. Build step runs `prisma generate && tsc`. Must be built before any consumer can compile.
- **`packages/config`**: Shared ESLint, Prettier, TSConfig presets.
- **`packages/types`** and **`packages/ui`**: Scaffolding only (empty).

## Known Locations (jangan explore, langsung pakai)

- **shadcn/ui components** sudah ter-install di `apps/web/src/components/ui/` — import langsung dari situ, JANGAN scan folder lain untuk cari komponen.
  Contoh: `import { Button } from "@/components/ui/button"`
- Kalau butuh komponen shadcn yang belum ada di folder itu, install via CLI (`npx shadcn@latest add <component>`) — jangan bikin manual.
- **Halaman/route web**: `apps/web/src/app/` (App Router, folder = route).
- **Komponen custom per-fitur**: `apps/web/src/features/<feature>/components/`.
- **Hooks per-fitur** (React Query, dsb): `apps/web/src/features/<feature>/hooks/`.
- **API client layer (frontend)**: `apps/web/src/features/<feature>/api/` dan base client di `apps/web/src/lib/api-client.ts`.
- **NestJS modules (backend)**: `apps/api/src/modules/<module>/` — masing-masing modul punya `*.controller.ts`, `*.service.ts`, `*.module.ts`.
- **RBAC guards**: `apps/api/src/modules/rbac/guards/`.
- **Prisma schema**: `packages/database/prisma/schema.prisma`.
- **Konfigurasi env validation (API)**: `apps/api/src/core/config/env.validation.ts`.

## Local Infrastructure

`docker-compose.yml` starts Postgres, Redis, Prometheus, Grafana, Loki.

| Service    | Port                    |
| ---------- | ------------------------|
| Postgres   | 5433 (mapped from 5432) |
| Redis      | 6379                    |
| Grafana    | 3000                    |
| Prometheus | 9090                    |
| Loki       | 3100                    |

API expects `DATABASE_URL=postgresql://postgres:password@localhost:5433/flowlyx`.

## Environment Variables

**API** (validated at startup via Zod in `apps/api/src/core/config/env.validation.ts`):

- Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Has defaults: `NODE_ENV`, `PORT`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, `REDIS_HOST`, `REDIS_PORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `AUTHORIZED_JAVASCRIPT_ORIGINS`
- Optional: `REDIS_PASSWORD`, `SMTP_USER`, `SMTP_PASS`

**Web**: `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). See `apps/web/.env.example`.

**E2E tests**: Use `apps/api/.env.test` (loaded by `test/setup.ts`). Contains a remote Neon DB URL — do not overwrite.

## Code Style

- **Prettier**: semicolons, single quotes, trailing commas, 100 char width, 2-space indent. Config: `packages/config/prettier-preset.json`.
- **ESLint (API)**: `@typescript-eslint/no-explicit-any` is **error**. Unused vars allowed if prefixed with `_`. Config: `packages/config/eslint-preset.js`.
- **ESLint (Web)**: Flat config (`apps/web/eslint.config.mjs`), uses `eslint-config-next`.
- **TypeScript**: Strict mode. API extends base tsconfig but overrides to CommonJS/node; web uses ESNext/bundler.
- **Commits**: Conventional commits enforced (`@commitlint/config-conventional`). Husky + lint-staged runs ESLint + Prettier on staged `*.{js,ts,tsx,jsx,json,md,yml,yaml}` files.

## Testing

- **Unit tests**: `*.spec.ts` in `apps/api/src/`. Jest + ts-jest. For business logic, services, permissions — not controllers.
- **E2E tests**: `*.e2e-spec.ts` in `apps/api/test/`. Separate Jest config (`test/jest-e2e.json`). Uses `--forceExit`. Loads `.env.test`.
- **Web**: No test setup currently.
- **Turbo quirk**: `test` task depends on `build` (in `turbo.json`). Running `turbo run test` will trigger a build first. Use `--filter` or workspace flags to run a single package's tests.

## Key Gotchas

- The README says "pnpm" but the actual package manager is **npm** (`packageManager` field in root `package.json`). Always use `npm`.
- Database package must be built before anything else that depends on it (`@flowlyx/database`).
- API validates env vars at boot with Zod — missing vars crash the process immediately.
- API CORS is locked to `http://localhost:3015`.
- Web dev server runs on port 3015 (not 3000).
- Postgres is on port **5433** externally (not 5432).
- E2E `.env.test` contains a remote Neon DB URL — don't commit changes to it.
- lint-staged runs on `*.{js,ts,tsx,jsx,json,md,yml,yaml}` — not just JS/TS files.
- Next.js dev cache (`apps/web/.next`) bisa jadi stale setelah menambah dynamic route baru — lihat "Debugging Protocol" di atas sebelum panik.

## Available Skills (`.agents/skills/`)

Load via the `skill` tool when relevant. Key ones:

**Coding discipline:**

- `ponytail` — lazy senior dev mode. 7-rung ladder (YAGNI → reuse → stdlib → native → dep → one-liner → minimum code). Default intensity: full. Active every response until stopped.
- `ponytail-review` — review for over-engineering only (delete/yagni/shrink tags).
- `ponytail-audit` — whole-repo bloat scan. One-shot report.
- `ponytail-debt` — harvest `ponytail:` comments into a tracked ledger.

**Frontend / UI (apps/web):**

- `shadcn` — shadcn/ui usage: CLI install, CSS variables for dark mode with orange accents, CVA variants.
- `component` — styling rules for Button, Card, Input, Badge (cursor-pointer, focus rings, semantic colors).
- `tailwind` — utility-first rules: no `@apply`, mobile-first, consistent class ordering.
- `ui-styling` — comprehensive: shadcn + Tailwind + canvas designs, theming, accessibility.
- `ui-design` — Flowlyx visual language: dark mode only, `bg-zinc-950`, `orange-500` accent, `rounded-xl`.
- `layout` — Dashboard grid, Sidebar (fixed/dark), Navbar, Auth pages.
- `typography` — **Plus Jakarta Sans** only (via `next/font/google`). Never Inter/Geist.
- `motion` — fast animations (150-200ms), hover transitions, framer-motion or Tailwind.
- `accessibility` — WCAG: focus rings, keyboard nav, ARIA, 4.5:1 contrast.
- `ux-writing` — professional copy, active-voice CTAs, empathetic errors.

**Design / Creative:**

- `design` — mega-skill routing to brand, design-system, ui-styling, or built-in tasks (logo, banners, icons, CIP, social photos).
- `design-system` — 3-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales.
- `brand` — voice, messaging, asset management, brand-to-token sync.
- `banner-design` — 22 styles, multi-platform (social, ads, web, print).
- `slides` — HTML presentations with Chart.js, design tokens, responsive layouts.
- `ui-ux-pro-max` — 67 styles, 161 palettes, 57 font pairings, 99 UX rules. BM25 search.

## Reference Docs

The `Handbook/` directory contains the engineering SSOT. Key sections:

- `Handbook/08-development-workflow/` — dev process
- `Handbook/09-git-workflow/` — branching/PR conventions
- `Handbook/11-testing/` — testing strategy
- `Handbook/18-ai-development/` — AI-assisted development guidelines (mandatory rules for AI agents: no `any`, no `console.log`, always route through services, generate tests)