# Phase 30 - Real-time Updates (Socket.IO): Git Merge Conflicts with Locked Files

## Symptoms (Gejala)

During the initial setup for Phase 30, attempting to pull updates from the `dev` branch (`git pull origin dev`) failed repeatedly with the following error:
_(Selama proses setup awal untuk Phase 30, percobaan untuk menarik pembaruan dari branch `dev` (`git pull origin dev`) gagal berkali-kali dengan error berikut:)_

`error: The following untracked working tree files would be overwritten by merge: issue29.json`

Attempts to manually remove the file using `Remove-Item -Force` also failed:
_(Percobaan untuk menghapus file secara manual menggunakan `Remove-Item -Force` juga mengalami kegagalan:)_

`Remove-Item : Cannot remove item ... The process cannot access the file because it is being used by another process.`

## Root Cause (Akar Masalah)

An orphaned `powershell.exe` background process from a previous phase (or task) held an active handle (lock) on the `issue29.json` file. Because this file was untracked locally but present in the incoming commits from `origin/dev`, Git attempted to overwrite it during the merge but was blocked by the Windows OS file lock.
_(Sebuah proses latar belakang `powershell.exe` yang terabaikan dari fase (atau tugas) sebelumnya menahan handle aktif (kunci) pada file `issue29.json`. Karena file ini berstatus untracked di lokal namun terdapat di dalam commit yang datang dari `origin/dev`, Git mencoba untuk menimpanya saat melakukan merge, namun diblokir oleh sistem pengunci file milik OS Windows.)_

## Investigation (Investigasi)

- Attempted to bypass the file using `git sparse-checkout`, which successfully ignored the file but removed all other non-root files from the working directory.
  _(Mencoba melewati file tersebut dengan `git sparse-checkout`, yang mana berhasil mengabaikan file itu namun justru menghapus seluruh file non-root lainnya dari direktori kerja.)_
- Attempted to reset the branch using `git reset --hard origin/dev`, but this also failed because Git could not unlink the locked file.
  _(Mencoba melakukan reset branch dengan `git reset --hard origin/dev`, namun ini juga gagal karena Git tidak bisa melakukan unlink pada file yang terkunci.)_
- Used `Get-Process powershell` to identify orphaned shell instances that were not the current PID (`$PID`).
  _(Menggunakan `Get-Process powershell` untuk mengidentifikasi instance shell yang terabaikan yang bukan merupakan PID saat ini (`$PID`).)_

## Solution (Solusi)

1. **Terminate Orphaned Processes (Hentikan Proses Terabaikan)**:
   Executed a script to find and forcibly stop all `powershell` processes except the currently executing one:
   _(Menjalankan skrip untuk menemukan dan secara paksa menghentikan semua proses `powershell` kecuali yang sedang berjalan saat ini:)_
   ```powershell
   Get-Process powershell | Where-Object { $_.Id -ne $PID } | Stop-Process -Force
   ```
2. **Execute Git Pull (Jalankan Git Pull)**:
   With the lock released, the file could be safely removed, and `git pull origin dev` completed successfully via fast-forward.
   _(Dengan terlepasnya kunci tersebut, file dapat dihapus dengan aman, dan `git pull origin dev` berhasil diselesaikan melalui fast-forward.)_

## Prevention (Pencegahan)

- **Proper Background Process Management (Manajemen Proses Latar Belakang yang Tepat)**: Ensure that any background tasks or file streams (like `Invoke-RestMethod | Out-File`) are properly closed and their parent processes are terminated when no longer needed.
  _(Pastikan bahwa semua tugas latar belakang atau aliran data file (seperti `Invoke-RestMethod | Out-File`) ditutup dengan benar dan proses induknya dihentikan saat tidak lagi dibutuhkan.)_
- **Handle Tracking (Pelacakan Handle)**: If a file fails to delete or merge in Windows, immediately suspect a process lock rather than a Git-specific issue.
  _(Jika sebuah file gagal dihapus atau di-merge di Windows, segera curigai adanya penguncian proses alih-alih masalah spesifik pada Git.)_

---

# Phase 30 - Real-time Updates (Socket.IO): Monorepo Dependency Resolution & Build Errors

## Symptoms (Gejala)

When installing Socket.IO dependencies inside `apps/api`, `npm install` failed with an `ERESOLVE unable to resolve dependency tree` error.
_(Saat menginstal dependensi Socket.IO di dalam `apps/api`, `npm install` gagal dengan pesan error `ERESOLVE unable to resolve dependency tree`.)_

After forcing the installation of specific versions, compiling the application (`npm run build` in `apps/api`) threw 50+ TypeScript errors:
_(Setelah memaksakan instalasi versi tertentu, proses kompilasi aplikasi (`npm run build` di dalam `apps/api`) melemparkan lebih dari 50 error TypeScript:)_

`Cannot find module '@flowlyx/database' or its corresponding type declarations.`

## Root Cause (Akar Masalah)

1. **Peer Dependency Conflict**: The latest `@nestjs/websockets` (v11) was fetched by default, which strictly requires `@nestjs/common@^11.0.0`. The project currently uses `v10.3.8`.
   _(Konflik Peer Dependency: Versi terbaru dari `@nestjs/websockets` (v11) diambil secara default, yang mana secara ketat mewajibkan `@nestjs/common@^11.0.0`. Proyek ini saat ini menggunakan versi `v10.3.8`.)_
2. **Monorepo Link Breakage**: Running `npm install` directly within a sub-workspace (`apps/api`) rather than at the root level broke the NPM workspace symlinks to the internal package `@flowlyx/database`.
   _(Kerusakan Tautan Monorepo: Menjalankan `npm install` secara langsung di dalam sub-workspace (`apps/api`) ketimbang di level root merusak symlink workspace NPM menuju package internal `@flowlyx/database`.)_

## Investigation (Investigasi)

- Read the `npm install` ERESOLVE logs to identify the version mismatch between NestJS Core v10 and NestJS Websockets v11.
  _(Membaca log ERESOLVE dari `npm install` untuk mengidentifikasi ketidakcocokan versi antara NestJS Core v10 dan NestJS Websockets v11.)_
- Realized that because Flowlyx is a TurboRepo monorepo, local `npm install` execution in the sub-folder destroyed the local workspace resolution for `@flowlyx/*` dependencies.
  _(Menyadari bahwa karena Flowlyx adalah sebuah monorepo TurboRepo, eksekusi `npm install` secara lokal di dalam sub-folder menghancurkan resolusi workspace lokal untuk dependensi `@flowlyx/*`.)_

## Solution (Solusi)

1. **Version Pinning (Pematokan Versi)**:
   Installed the dependencies using a specific version range that matches the rest of the NestJS ecosystem in the project:
   _(Menginstal dependensi menggunakan rentang versi spesifik yang cocok dengan ekosistem NestJS lainnya di proyek ini:)_
   ```bash
   npm install @nestjs/websockets@^10.0.0 @nestjs/platform-socket.io@^10.0.0 socket.io
   ```
2. **Root Workspace Re-linking (Taut Ulang Workspace Root)**:
   Navigated to the project root (`c:\Users\Yerikho\Project\Flowlyx`) and ran `npm install` globally to repair all workspace symlinks.
   _(Pindah ke root proyek (`c:\Users\Yerikho\Project\Flowlyx`) dan menjalankan `npm install` secara global untuk memperbaiki semua symlink workspace.)_
3. **TurboRepo Build**:
   Executed `npm run build` from the root directory so TurboRepo could correctly compile `@flowlyx/database` before attempting to compile `@flowlyx/api`.
   _(Menjalankan `npm run build` dari direktori root agar TurboRepo dapat secara tepat mengompilasi `@flowlyx/database` sebelum mencoba mengompilasi `@flowlyx/api`.)_

## Prevention (Pencegahan)

- **Strict Versioning in Monorepos (Penomoran Versi yang Ketat di Monorepo)**: Always check the core framework versions (e.g., NestJS) before installing supplementary packages to avoid peer dependency nightmares.
  _(Selalu periksa versi framework inti (seperti NestJS) sebelum menginstal package tambahan untuk menghindari mimpi buruk terkait peer dependency.)_
- **Root-level Execution (Eksekusi di Level Root)**: In an NPM workspace or TurboRepo setup, package installations and major build scripts should almost always be executed from the root directory to ensure dependencies and symlinks are resolved synchronously across all applications and packages.
  _(Dalam pengaturan NPM workspace atau TurboRepo, instalasi package dan skrip build utama seharusnya hampir selalu dieksekusi dari direktori root untuk memastikan semua dependensi dan symlink diselesaikan secara sinkron di seluruh aplikasi dan package.)_
