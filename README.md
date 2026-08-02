# Flowlyx Enterprise Project Management Platform

> **Languages**: 🇬🇧 [English](#english) | 🇮🇩 [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>

## 🇬🇧 English Overview

**Flowlyx** is an enterprise-grade project management and collaboration platform designed for high performance, maintainability, scalability, and strict security standards. It serves as a centralized hub for organizations, teams, and enterprises to organize work, manage resources, track time, and automate workflows.

---

### 💼 Business Domain & Architecture

Flowlyx is architected as a **B2B SaaS Enterprise Platform** structured around a 4-tier multi-tenant hierarchy:

$$\text{Organization} \longrightarrow \text{Workspace} \longrightarrow \text{Project} \longrightarrow \text{Board / Task}$$

#### Key Business Capabilities:

1. **Multi-Tenant Organizations & Workspaces**: Support for enterprise organizations owning multiple department workspaces and isolated projects.
2. **Subscriptions & Billing (`organization-billing`)**: Built-in subscription tier management (Free, Pro, Enterprise) and payment transaction tracking.
3. **Core Project Engine**: Advanced Kanban boards, custom lists, tasks, subtasks, priorities, and labels.
4. **Time Tracking (`TimeEntry`)**: Track time spent on tasks for client billing, workload analysis, and resource planning.
5. **Security & Governance (RBAC & Audit)**: Contextual Role-Based Access Control (Organization, Workspace, Project levels) paired with comprehensive `AuditLog` records for enterprise compliance.
6. **Team Collaboration**: @mentions, rich comments, file attachments via Cloudinary, real-time WebSocket updates, and email/in-app notifications.

---

### ⚙️ Technology Stack & Monorepo Architecture

- **Monorepo Management**: **NPM Workspaces** + **Turborepo** (`npm` is strictly enforced, do NOT use `pnpm` or `yarn`).
- **Backend (`apps/api`)**:
  - **Framework**: NestJS (CommonJS module system, Node.js >= 20).
  - **API Standard**: RESTful endpoints prefixed at `/api`, interactive Swagger docs at `/api/docs`.
  - **Validation & Logging**: Zod env validation at boot, Helmet security, Pino structured logger.
  - **Database**: PostgreSQL (port `5433` externally) managed via Prisma ORM (`packages/database`).
- **Frontend (`apps/web`)**:
  - **Framework**: Next.js 16 (App Router, React 19, Turbopack, default port `3015`).
  - **Design System**: Tailwind CSS v4, shadcn/ui (`base-nova` style), Plus Jakarta Sans typography.
- **Shared Packages (`packages/`)**:
  - `@flowlyx/database`: Prisma schema, migrations, seeders. Must be compiled first.
  - `@flowlyx/config`: Centralized ESLint, Prettier, and TypeScript presets.
  - `@flowlyx/types` & `@flowlyx/ui`: Shared scaffolding for types & component library.
- **Local Infrastructure**:
  - `docker-compose.yml` orchestrates PostgreSQL (5433), Redis (6379), Grafana (3000), Prometheus (9090), and Loki (3100).

---

### 📂 Directory Structure

```text
flowlyx/
├── .github/                  # CI/CD workflows and templates
├── apps/
│   ├── api/                  # NestJS backend application (33 domain modules)
│   └── web/                  # Next.js 16 frontend application
├── docs/ / Handbook/         # Engineering SSOT and guidelines
├── infrastructure/           # Docker Compose & observability configurations
├── packages/                 # Shared npm monorepo packages
│   ├── config/               # Shared ESLint, TSConfig, Prettier settings
│   ├── database/             # Prisma schema, migrations, and seed scripts
│   ├── types/                # Shared TypeScript definitions
│   └── ui/                   # Shared React UI components
```

---

### 🚀 Getting Started & Development Workflow

#### Prerequisites

- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0` (Do NOT use `pnpm` or `yarn`)
- **Docker & Docker Compose**: For local services (Postgres, Redis, Observability)

#### Local Infrastructure Setup

```bash
# Start local containers (Postgres on 5433, Redis, Grafana, Loki)
docker-compose up -d
```

#### Verification & Build Sequence (Respect CI Order)

```bash
# 1. Install dependencies
npm ci

# 2. Build Database Package FIRST (Required before building dependent packages)
npm run build --workspace=packages/database

# 3. Run Development Servers (API on :4000, Web on :3015)
npm run dev

# 4. CI Quality Checks
npm run lint
npm run type-check
npm run test
npm run build
```

---

### 🛡️ Security & Vulnerability Scanning

Flowlyx enforces an automated security testing pipeline via dedicated GitHub Actions workflows:

| Tool          | Category        | Target                        | Trigger                      | Description                                                                                                                                                                 |
| :------------ | :-------------- | :---------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semgrep**   | SAST            | `apps/api` & `apps/web`       | Pull Request (`main`, `dev`) | Static code analysis scanning TypeScript, React, and OWASP Top 10 patterns. Fails on `ERROR` severity.                                                                      |
| **Gitleaks**  | Secret Scan     | Entire Monorepo               | Push & Pull Request          | Detects hardcoded credentials, API keys, and tokens in git commit diffs and history.                                                                                        |
| **Trivy**     | SCA & Container | Monorepo deps & Docker images | Pull Request (`main`, `dev`) | Scans npm workspace dependencies and built Docker images (`apps/api`, `apps/web`) for `CRITICAL` and `HIGH` CVEs.                                                           |
| **OWASP ZAP** | DAST            | Staging API & Web             | Weekly Schedule & Manual     | Dynamic scanning against running staging endpoints (OpenAPI/Swagger for API, Baseline scan for Web app). Generates HTML reports and auto-creates GitHub issues on findings. |

---

<hr style="margin-top: 40px; margin-bottom: 40px;" />

<a name="bahasa-indonesia"></a>

## 🇮🇩 Ringkasan Bahasa Indonesia

**Flowlyx** adalah platform manajemen proyek dan kolaborasi kelas enterprise yang dirancang dengan performa tinggi, skala yang dapat disesuaikan, serta standar keamanan ketat. Flowlyx berfungsi sebagai pusat pengelolaan kerja, alokasi sumber daya, pencatatan waktu, dan otomatisasi alur kerja tim.

---

### 💼 Domain & Arsitektur Bisnis

Flowlyx dirancang sebagai **Platform Enterprise B2B SaaS** berbasis hirarki multi-tenant 4 tingkat:

$$\text{Organisasi} \longrightarrow \text{Workspace} \longrightarrow \text{Proyek} \longrightarrow \text{Papan Kanban / Tugas}$$

#### Fitur Utama Bisnis:

1. **Multi-Tenant Organisasi & Workspace**: Mendukung entitas perusahaan yang membawahi banyak divisi/workspace dan proyek terisolasi.
2. **Langganan & Pembayaran (`organization-billing`)**: Pengelolaan paket langganan (Free, Pro, Enterprise) dan histori transaksi pembayaran terintegrasi.
3. **Core Project Management Engine**: Papan Kanban interaktif, daftar kustom, tugas, sub-tugas, tingkat prioritas, dan label.
4. **Pencatatan Waktu Kerja (`TimeEntry`)**: Melacak durasi pengerjaan tugas untuk penagihan klien (_client billing_), analisis beban kerja, dan perencanaan sumber daya.
5. **Keamanan & Tata Kelola (RBAC & Audit)**: Pengaturan hak akses bertingkat (_Role-Based Access Control_) di level Organisasi, Workspace, dan Proyek, didukung pencatatan `AuditLog` penuh.
6. **Kolaborasi Tim**: Penggunaan `@mention`, komentar kaya media, lampiran dokumen Cloudinary, notifikasi langsung via WebSocket, serta email.

---

### ⚙️ Teknologi & Arsitektur Monorepo

- **Manajemen Monorepo**: **NPM Workspaces** + **Turborepo** (menggunakan `npm`, dilarang menggunakan `pnpm` atau `yarn`).
- **Backend (`apps/api`)**:
  - **Framework**: NestJS (sistem modul CommonJS, Node.js >= 20).
  - **Standar API**: RESTful API di `/api`, dokumentasi Swagger interaktif di `/api/docs`.
  - **Validasi & Logging**: Validasi Zod saat startup, Helmet security, Pino logger.
  - **Database**: PostgreSQL (port eksternal `5433`) dikelola via Prisma ORM (`packages/database`).
- **Frontend (`apps/web`)**:
  - **Framework**: Next.js 16 (App Router, React 19, Turbopack, port dev `3015`).
  - **Sistem Desain**: Tailwind CSS v4, shadcn/ui (gaya `base-nova`), tipografi Plus Jakarta Sans.
- **Paket Shared (`packages/`)**:
  - `@flowlyx/database`: Skema Prisma, migrasi, dan seeder. Harus di-build pertama kali.
  - `@flowlyx/config`: Preset ESLint, Prettier, dan TypeScript terpusat.
  - `@flowlyx/types` & `@flowlyx/ui`: Paket shared tipe data & komponen UI.
- **Infrastruktur Lokal**:
  - `docker-compose.yml` menjalankan PostgreSQL (5433), Redis (6379), Grafana (3000), Prometheus (9090), dan Loki (3100).

---

### 🚀 Alur Pengembangan & Perintah

```bash
# 1. Install dependensi
npm ci

# 2. Build Database Package TERLEBIH DAHULU
npm run build --workspace=packages/database

# 3. Jalankan Dev Server (API di :4000, Web di :3015)
npm run dev

# 4. Pemeriksaan Kualitas & Testing
npm run lint
npm run type-check
npm run test
npm run build
```

---

### 🛡️ Keamanan & Pemindai Kerentanan (Security)

Flowlyx menerapkan pemindaian keamanan otomatis melalui GitHub Actions terpisah:

| Tool          | Kategori        | Target                     | Trigger                      | Deskripsi                                                                                                                                                   |
| :------------ | :-------------- | :------------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semgrep**   | SAST            | `apps/api` & `apps/web`    | Pull Request (`main`, `dev`) | Analisis statis kode TypeScript, React, dan pola OWASP Top 10. Gagal pada temuan `ERROR`.                                                                   |
| **Gitleaks**  | Secret Scan     | Seluruh Monorepo           | Push & Pull Request          | Mendeteksi kredensial, API key, atau token rahasia pada histori commit maupun PR.                                                                           |
| **Trivy**     | SCA & Container | Dependensi & Docker images | Pull Request (`main`, `dev`) | Memindai dependensi npm workspaces dan image Docker (`apps/api`, `apps/web`) untuk CVE berlevel `CRITICAL` dan `HIGH`.                                      |
| **OWASP ZAP** | DAST            | Staging API & Web          | Jadwal Mingguan & Manual     | Uji dinamis terhadap aplikasi staging yang berjalan (API Swagger & Baseline Web). Menyimpan laporan HTML dan otomatis membuat issue GitHub jika ada temuan. |
