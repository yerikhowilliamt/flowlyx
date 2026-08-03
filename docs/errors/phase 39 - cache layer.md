# Phase 39 - GitHub CLI Authentication Error (401 Bad Credentials)

## Symptoms (Gejala)

During the final step of the phase implementation, the automated Pull Request creation via GitHub CLI (`gh pr create --title ...`) failed with the following error:
_(Selama langkah terakhir implementasi fase, pembuatan Pull Request otomatis melalui GitHub CLI mengalami kegagalan dengan error berikut:)_

`HTTP 401: Bad credentials (https://api.github.com/graphql)`
`Try authenticating with:  gh auth login -h github.com`

## Root Cause (Akar Masalah)

The GitHub CLI (`gh`) token stored in the local environment had expired or was invalid. Although the system reported a successful `gh auth login` earlier when checking the token, the active session token used to interact with the GraphQL API lacked the correct scopes or had been revoked/expired during execution.
_(Token GitHub CLI (`gh`) yang tersimpan di environment lokal sudah kadaluarsa atau tidak valid. Meskipun sistem sebelumnya melaporkan `gh auth login` berhasil saat mengecek token, token sesi aktif yang digunakan untuk berinteraksi dengan API GraphQL tidak memiliki scope yang tepat atau telah direvoke/kadaluarsa selama eksekusi.)_

## Investigation (Investigasi)

- The command `git push origin feature/phase-39-cache-layer-redis` successfully pushed the code to the remote repository.
  _(Perintah `git push` berhasil mendorong kode ke repositori remote.)_
- The `gh pr create` command immediately returned a `401 Bad Credentials` status from `api.github.com/graphql`.
  _(Perintah `gh pr create` langsung mengembalikan status `401 Bad Credentials` dari `api.github.com/graphql`.)_
- Verified that basic git operations using the git protocol token were still functional, isolating the issue exclusively to the `gh` CLI tool's GraphQL authentication.
  _(Verifikasi bahwa operasi dasar git menggunakan token protokol git masih berfungsi, yang berarti masalah terisolasi secara eksklusif pada autentikasi GraphQL milik alat `gh` CLI.)_

## Solution (Solusi)

1. **Manual PR Creation (Pembuatan PR Manual)**:
   The code was successfully pushed. The PR creation was delegated to manual creation via the GitHub Web UI using the provided remote link.
   _(Kode berhasil di-push. Pembuatan PR dialihkan ke pembuatan manual via Web UI GitHub menggunakan tautan remote yang disediakan.)_

2. **Re-Authentication Prompt (Anjuran Autentikasi Ulang)**:
   The user was informed to re-run `gh auth login` to refresh the credential scopes before running automated CLI PR scripts in the future.
   _(Pengguna diinformasikan untuk menjalankan ulang `gh auth login` guna menyegarkan scope kredensial sebelum menjalankan skrip CLI PR otomatis di masa depan.)_

## Prevention (Pencegahan)

- **Verify CLI Credentials (Verifikasi Kredensial CLI)**: Periodically verify that the `gh` CLI token has the correct `repo` and `workflow` scopes and is fully authenticated before initiating automated PR workflows.
  _(Verifikasi secara berkala bahwa token `gh` CLI memiliki scope `repo` dan `workflow` yang tepat serta terautentikasi penuh sebelum memulai alur kerja PR otomatis.)_

---

# Phase 39 - Over-Engineering & Deprecation Warning (Cache Manager)

## Symptoms (Gejala)

During the initial installation of `@nestjs/cache-manager` and `cache-manager-redis-yet`, `npm` outputted the following deprecation warning:
_(Selama instalasi awal `@nestjs/cache-manager` dan `cache-manager-redis-yet`, `npm` mengeluarkan peringatan deprecation berikut:)_

`npm warn deprecated cache-manager-redis-yet@5.1.5: With cache-manager v6 we now are using Keyv`

Additionally, a Ponytail Review identified that using `CacheService` to wrap `ioredis` methods (`get`, `set`, `del`) was unnecessary boilerplate.
_(Selain itu, Ponytail Review mengidentifikasi bahwa penggunaan `CacheService` untuk membungkus metode `ioredis` adalah boilerplate yang tidak perlu.)_

## Root Cause (Akar Masalah)

NestJS's official Cache Manager relies on third-party adapters that undergo frequent ecosystem changes (like migrating from v5 to v6 using Keyv). Implementing it as a wrapper created an unnecessary layer of abstraction that restricted access to advanced Redis features.
_(Cache Manager resmi NestJS bergantung pada adapter pihak ketiga yang sering mengalami perubahan ekosistem (seperti migrasi v5 ke v6). Mengimplementasikannya sebagai wrapper menciptakan lapisan abstraksi tak perlu yang membatasi akses ke fitur lanjutan Redis.)_

## Solution (Solusi)

1. **Removed Abstraction (Menghapus Abstraksi)**:
   Uninstalled `@nestjs/cache-manager`, `cache-manager`, and `cache-manager-redis-yet`. Installed `ioredis` directly.
   _(Menghapus paket cache-manager dan langsung menginstal `ioredis`.)_

2. **Direct Class Extension (Ekstensi Kelas Langsung)**:
   Refactored `CacheService` to `extend Redis` directly, eliminating wrapper methods and cutting the service logic down to 15 lines.
   _(Melakukan refactor `CacheService` untuk meng-extend `Redis` secara langsung, mengeliminasi metode wrapper dan menyusutkan logika servis menjadi 15 baris.)_

## Prevention (Pencegahan)

- **Apply "Ponytail" Rule Early (Terapkan Aturan "Ponytail" Sejak Awal)**: Always evaluate if a standard library abstraction is strictly necessary or if directly interfacing with the robust underlying tool (like `ioredis`) is cleaner and more efficient.
  _(Selalu evaluasi apakah abstraksi dari standard library benar-benar diperlukan atau apakah berinteraksi langsung dengan alat dasarnya lebih rapi dan efisien.)_
