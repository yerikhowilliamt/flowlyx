# Phase 40 - Background Workers: Strict Class Property Initialization Error

## Symptoms (Gejala)

During the compilation process (`npm run build`), the build failed with the following TypeScript error:

_(Selama proses kompilasi (`npm run build`), proses build gagal dengan error TypeScript berikut:)_

`Property 'name' has no initializer and is not definitely assigned in the constructor. (TS2564)`

## Root Cause (Akar Masalah)

In `create-job.dto.ts`, the class property `name` was declared without an initial value and without being assigned in a constructor. Because the project has `strictPropertyInitialization` enabled in `tsconfig.json`, TypeScript flags this as an error.

_(Pada `create-job.dto.ts`, properti kelas `name` dideklarasikan tanpa nilai awal dan tanpa diisi di dalam konstruktor. Karena proyek ini mengaktifkan `strictPropertyInitialization` pada `tsconfig.json`, TypeScript mendeteksi ini sebagai sebuah error.)_

In NestJS, DTOs are usually instantiated dynamically by `class-transformer` based on incoming request bodies, meaning developers rarely instantiate them manually with constructors.

_(Di NestJS, DTO biasanya diinstansiasi secara dinamis oleh `class-transformer` berdasarkan body request yang masuk, yang berarti developer jarang menginstansiasinya secara manual menggunakan konstruktor.)_

## Solution (Solusi)

Used the **definite assignment assertion** operator (`!`) to tell TypeScript that the property will be assigned by the framework at runtime.

_(Menggunakan operator asersi penugasan pasti (`!`) untuk memberi tahu TypeScript bahwa properti ini akan diisi oleh framework saat aplikasi berjalan (runtime).)_

```typescript
import { IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  name!: string;
}
```

## Prevention (Pencegahan)

- **Use Definite Assignment Assertions (Gunakan Operator Asersi Penugasan)**: Always append `!` to DTO properties decorated with `class-validator` decorators to satisfy TypeScript's strict initialization checks.
  _(Selalu tambahkan `!` pada properti DTO yang menggunakan dekorator `class-validator` untuk memenuhi pemeriksaan inisialisasi ketat milik TypeScript.)_

---

# Phase 40 - PowerShell Output Redirection Encoding Corruption

## Symptoms (Gejala)

During a subsequent `npm run build`, the compilation threw multiple syntax errors on a newly edited file `src/core/base/index.ts`:

_(Pada saat menjalankan `npm run build` setelahnya, kompilasi memunculkan banyak error sintaksis pada file yang baru diedit `src/core/base/index.ts`:)_

- `error TS1127: Invalid character.`
- `error TS2304: Cannot find name 'e'.`
- The characters in the error log were visibly spaced out (e.g., `e x p o r t   *   f r o m`).

## Root Cause (Akar Masalah)

The command `echo "export * from './base.processor';" >> src/core/base/index.ts` was executed within a Windows PowerShell environment. By default, older versions of Windows PowerShell use **UTF-16 LE** encoding for output redirection (`>>` or `>`). When this output was appended to an existing UTF-8 file, it corrupted the file's encoding, causing the TypeScript compiler to read invalid byte order marks and null bytes between characters.

_(Perintah `echo "export * from './base.processor';" >> src/core/base/index.ts` dieksekusi di dalam lingkungan Windows PowerShell. Secara bawaan, PowerShell versi lama menggunakan encoding **UTF-16 LE** untuk pengalihan output (`>>` atau `>`). Saat output ini ditambahkan ke file UTF-8 yang sudah ada, hal ini merusak encoding file tersebut, sehingga compiler TypeScript membaca byte order mark dan null byte yang tidak valid di antara karakter.)_

## Solution (Solusi)

Rewrote the file content entirely using standard UTF-8 encoding.

_(Menulis ulang seluruh isi file tersebut menggunakan encoding UTF-8 standar.)_

## Prevention (Pencegahan)

- **Avoid PowerShell Native Redirection for Source Code (Hindari Pengalihan Bawaan PowerShell untuk Kode Sumber)**: Never use `>>` or `>` to append or create source code files in Windows PowerShell without explicitly defining the encoding. Instead, use dedicated file-editing tools or ensure commands use standard encoding flags (e.g., `Out-File -Encoding utf8 -Append`).
  _(Jangan pernah menggunakan `>>` atau `>` untuk menambahkan atau membuat file kode sumber di Windows PowerShell tanpa mendefinisikan encoding secara eksplisit. Sebagai gantinya, gunakan perkakas pengeditan file yang benar atau pastikan perintah menggunakan flag encoding standar.)_
