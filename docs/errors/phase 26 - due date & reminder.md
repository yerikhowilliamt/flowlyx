# Phase 26 - PowerShell Syntax Error: Invalid Statement Separator

## Symptoms (Gejala)

During the execution of chained terminal commands such as cd packages/database && npx prisma generate and git add . && git commit ..., the commands failed to execute. The terminal returned an exit code of 1 with the following error:

_(Selama eksekusi perintah terminal berantai seperti cd packages/database && npx prisma generate dan git add . && git commit ..., perintah-perintah tersebut gagal dieksekusi. Terminal mengembalikan exit code 1 dengan error berikut:)_

The token '&&' is not a valid statement separator in this version.

## Root Cause (Akar Masalah)

The agent's terminal environment uses Windows PowerShell. Older versions of PowerShell (such as Windows PowerShell 5.1) do not support the && operator to chain commands, unlike Bash or PowerShell 7.

_(Lingkungan terminal agen menggunakan Windows PowerShell. Versi PowerShell lama (seperti Windows PowerShell 5.1) tidak mendukung operator && untuk merangkai perintah, tidak seperti Bash atau PowerShell 7.)_

## Investigation (Investigasi)

- Reviewed the failed command outputs and saw the ParserError exception pointing specifically to the && token.
  _(Meninjau output perintah yang gagal dan melihat eksepsi ParserError yang secara spesifik menunjuk pada token &&.)_

## Solution (Solusi)

1. **Use Semicolon Separator (Gunakan Pemisah Titik Koma)**:
   Replaced the && operator with the ; operator, which is the valid command separator in older Windows PowerShell versions.
   _(Mengganti operator && dengan operator ;, yang merupakan pemisah perintah yang sah di versi Windows PowerShell lama.)_
   _Example (Contoh):_ git add . ; git commit -m "..."

2. **Use Cwd Property (Gunakan Properti Cwd)**:
   Instead of using cd and chaining commands, utilized the Cwd parameter on the command execution tool to specify the working directory.
   _(Alih-alih menggunakan cd dan merangkai perintah, memanfaatkan parameter Cwd pada tool eksekusi perintah untuk menentukan direktori kerja.)_
   _Example (Contoh):_ Executing
   px prisma generate directly inside packages/database.

## Prevention (Pencegahan)

- **Use Windows-specific Shell Syntax (Gunakan Sintaks Shell Khusus Windows)**: When chained commands are strictly necessary, remember to use ; instead of && when operating within the standard PowerShell sandbox environment.
  _(Saat perintah berantai (chained commands) mutlak diperlukan, ingatlah untuk menggunakan ; alih-alih && saat beroperasi di dalam lingkungan sandbox standar PowerShell.)_
