# Error Documentation - Phase 65 (Reporting)

## 1. PowerShell Execution Syntax Error (`&&` and `head`)

### Symptoms

Saat mencoba menjalankan multiple commands secara sekuensial dan memfilter output (e.g., `git add . && git diff --staged` atau `git status --short | head -10`), terminal mengembalikan error:

- `The token '&&' is not a valid statement separator in this version.`
- `head : The term 'head' is not recognized as the name of a cmdlet...`

### Root Cause

Environment shell yang berjalan secara default adalah **Windows PowerShell (5.1)**, yang tidak mendesain/mendukung penggunaan operator bash unix seperti `&&` untuk chaining commands dan command `head` secara native.

### Investigation

- Mengecek error log dari terminal, terlihat pesan khas PowerShell `ParserError`.
- `&&` baru didukung secara penuh di PowerShell 7+, sedangkan sistem menggunakan versi 5.1.

### Solution

Mengubah syntax bash standar menjadi syntax PowerShell:

- Mengganti penggunaan `&&` dengan PowerShell conditional operator: `; if ($?) { command2 }`.
- Mengganti penggunaan `head -n` dengan command cmdlet: `Select-Object -First <n>`.
- Mengganti `grep` dengan `Select-String`.

### Trade-offs

- Syntax PowerShell sedikit lebih verbose (panjang) dibandingkan dengan bash standar.
- Namun, memastikan eksekusi command konsisten dan berjalan native tanpa harus bergantung pada Git Bash atau WSL di environment local.

### Prevention

Untuk fase-fase berikutnya, agen (AI) harus selalu ingat bahwa host OS adalah Windows (`win32`) dan shell utamanya adalah PowerShell 5.1. Pendekatan eksekusi command harus langsung disesuaikan ke standar PowerShell.

---

## 2. Task Status Ambiguity in Prisma Schema

### Symptoms

Saat mencoba membuat "Task Overview Report", tidak ditemukan field enum `STATUS` (seperti `TODO`, `IN_PROGRESS`, `DONE`) pada tabel `Task`.

### Root Cause

Berdasarkan investigasi ke `schema.prisma`, field `status` pada model `Task` dan `List` rupanya digunakan untuk mekanisme soft-delete (nilai default `"ACTIVE"`, bisa diubah ke `"DELETED"`). Status "progress" dari task dalam arsitektur Flowlyx sebenarnya di-handle oleh relasi ke model `List` (nama list menentukan tahapan task).

### Investigation

Melakukan pencarian (`Select-String`) terhadap `model Task` dan `model List` di `schema.prisma`.

### Solution

Melakukan agregasi task overview dengan menyesuaikan definisi "Status" yang ada:

- `activeTasks` dihitung dari task yang memiliki status `"ACTIVE"`.
- `deletedTasks` dihitung dari task yang berstatus `"DELETED"`.
- Jika ke depannya dibutuhkan perhitungan agregasi Task berdasarkan progres, harus melakukan cross-join data ke tabel `List` (menggunakan nama List).

### Trade-offs

- Report saat ini tidak bisa memberikan statistik Task berdasarkan (Todo/In Progress/Done) secara absolut tanpa mapping nama `List` yang bisa jadi dinamis (custom oleh user).
- Mempertahankan Clean Architecture tanpa merombak schema pada modul Reporting (yang sifatnya _read-only_).

### Prevention

Selalu biasakan verifikasi `schema.prisma` sebelum merancang DTO atau Service agar ekspektasi model data selaras dengan realitas database.
