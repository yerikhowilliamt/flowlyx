# Phase 11 - RBAC: PowerShell Invalid Statement Separator

## Symptoms (Gejala)

During the execution of version control commands, the terminal returned a `ParserError`:
_(Saat pengeksekusian perintah version control, terminal mengembalikan sebuah `ParserError`:)_
`The token '&&' is not a valid statement separator in this version.`

## Root Cause (Akar Masalah)

The command `git add . && git commit -m "..."` was executed in a PowerShell terminal environment. Unlike Bash or Zsh, older versions of Windows PowerShell do not support the `&&` operator to chain commands sequentially.
_(Perintah `git add . && git commit -m "..."` dieksekusi di dalam lingkungan terminal PowerShell. Berbeda dengan Bash atau Zsh, versi lama dari Windows PowerShell tidak mendukung penggunaan operator `&&` untuk merangkai (chaining) perintah secara berurutan.)_

## Investigation (Investigasi)

The error message explicitly pointed to the `&&` token. It was identified that the terminal runner is operating on Windows with PowerShell, which handles command chaining differently (e.g., using `;` or requiring PowerShell 7+ for `&&`).
_(Pesan error secara eksplisit merujuk pada token `&&`. Teridentifikasi bahwa terminal runner tersebut beroperasi di sistem operasi Windows menggunakan PowerShell, yang mana memiliki cara penanganan perangkaian perintah yang berbeda (contohnya, menggunakan tanda `;` atau mewajibkan instalasi PowerShell versi 7 ke atas untuk mendukung `&&`).)_

## Solution (Solusi)

The compound command was split into two separate, sequential commands:
_(Perintah gabungan tersebut dipisah menjadi dua perintah berurutan yang berdiri sendiri:)_

1. `git add .`
2. `git commit -m "feat(api): implement RBAC module with decorators and guards"`

## Trade-offs (Kelemahan/Pertukaran)

Executing the commands separately means the second command will run even if the first one conceptually fails (though `git add .` rarely fails). However, this is a necessary trade-off to ensure commands run successfully in a cross-platform Windows environment without requiring PowerShell upgrades.
_(Mengeksekusi perintah secara terpisah berarti perintah kedua akan tetap berjalan bahkan jika perintah pertama secara konseptual mengalami kegagalan (walaupun perintah `git add .` sangat jarang gagal). Meski begitu, ini adalah pertukaran (trade-off) yang perlu dilakukan demi memastikan agar perintah bisa berjalan dengan sukses di lingkungan cross-platform Windows tanpa harus mewajibkan upgrade versi PowerShell.)_

## Prevention (Pencegahan)

- Avoid using POSIX-specific shell operators like `&&` or `||` in scripts or automated commands unless the environment is guaranteed to be POSIX-compliant.
  _(Hindari penggunaan operator shell khusus POSIX seperti `&&` atau `||` di dalam script atau perintah otomatis kecuali lingkungan terminalnya dijamin mendukung sistem POSIX.)_
- For Node.js `package.json` scripts, use tools like `npm-run-all` or rely on cross-platform script runners to handle sequential execution safely.
  _(Untuk script yang ada di `package.json` Node.js, gunakan tools seperti `npm-run-all` atau andalkan script runner berbasis cross-platform untuk menangani eksekusi berurutan dengan lebih aman.)_

## References (Referensi)

- Microsoft PowerShell Documentation: [About Pipeline Chain Operators](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipeline_chain_operators)
