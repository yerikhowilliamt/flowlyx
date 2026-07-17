# Phase 19 - Priority: Missing ProjectRolesGuard Module Error

## Symptoms (Gejala)

During the execution of the unit test suite (`npm run test`), the following error caused the test suite to fail:
_(Selama masa pelaksanaan / eksekusi dari rangkaian unit test (`npm run test`), muncul sejenis rentetan error di bawah ini yang berhasil menumbangkan jalannya kesuksesan proses pengujian:)_
`Cannot find module '../rbac/guards/project-roles.guard' from 'modules/priorities/priorities.controller.ts'`

## Root Cause (Akar Masalah)

An assumption was made that `ProjectRolesGuard` existed in the RBAC module to handle project-level role authorization, similar to how `OrganizationRolesGuard` and `WorkspaceRolesGuard` function. However, this guard has not been implemented in the codebase yet.
_(Ada semacam ilusi / rekaan bahwa `ProjectRolesGuard` telah tercipta serta eksis berkeliaran mendiami kawasan `RBAC module` agar ia piawai merangkap tugas penjaga lapis gerbang level proyek; tak beda persis seperti gaya bertugas sang `OrganizationRolesGuard` serta `WorkspaceRolesGuard`.. Tetapi apa daya, pengawal *guard* ini sama sekali belum dilahirkan ke dunia / *codebase*.)_

## Investigation (Investigasi)

- Inspected the `apps/api/src/modules/rbac/guards` directory and confirmed that `project-roles.guard.ts` does not exist.
  _(Memelototi dengan seksama isi sekat relung direktori di dalam `apps/api/src/modules/rbac/guards` lalu mengesahkan kebenaran absolut bahwa sosok berkode `project-roles.guard.ts` nyatanya nihil nan gaib / tidak ada.)_
- Reviewed `apps/api/src/modules/labels/labels.controller.ts` (which also manages project-scoped entities) to understand the existing authorization pattern. Found that it currently relies solely on `JwtAuthGuard` without explicit RBAC checks.
  _(Meninjau kilas lalu `apps/api/src/modules/labels/labels.controller.ts` (padahal sosok di ini pun ikut repot merawat urusan perizinan *entitas proyek*) dalam usaha menyingkap pola otorisasi terkini. Betapa terperanjatnya sesaat setelah mendapati fakta yang ada bahwasanya kini mereka bersandar tunggal mengemis penjagaan kepada sang `JwtAuthGuard` polos di mana tak ada tanda eksistensi sistem pemeriksaan *RBAC checks* secara mutlak (eksplisit).)_

## Solution (Solusi)

- Created `ProjectRole` enum (`ADMIN`, `PROJECT_MANAGER`, `MEMBER`).
  _(Meluncurkan sebuah jenis struktur *Enums* anyar dengan nama `ProjectRole` (yang bermuatan susunan `ADMIN`, `PROJECT_MANAGER`, `MEMBER`).)_
- Created `ProjectRolesGuard` and `ProjectRoles` decorator.
  _(Melahirkan *ProjectRolesGuard* dari ketiadaan dan melengkapinya dengan balutan penghias / ornamen (decorator) memukau bertajuk `ProjectRoles`.)_
- The guard intelligently fetches `projectId` from nested resources (like `priorityId`) if it is not present in the request body or query.
  _(Sistem *guard* pengawal kini bermodalkan otak sedikit lebih cerdik guna menghisap / mengestrak serpihan `projectId` langsung dari tumpukan benda bersarang (*nested resources*) semacam `priorityId`, itu pun bilamana ternyata jejak keberadaan parameternya tak disematkan dengan niat baik dalam balutan *Request Body* (Tubuh/payload Request) maupun deret ekor *Query*.)_
- Applied `@ProjectRoles(ProjectRole.ADMIN, ProjectRole.PROJECT_MANAGER)` to `create`, `update`, and `remove` endpoints in `priorities.controller.ts`.
  _(Memberikan stempel izin `@ProjectRoles(ProjectRole.ADMIN, ProjectRole.PROJECT_MANAGER)` ke seluruh jajaran endpoint rawan nan sakral yang tak lain terdiri dari proses penambahan data / `create`, ubahan nilai baru / `update`, atau pembuangan paksa / `remove` yang terhampar di sepanjang lembah `priorities.controller.ts`. )_

## Trade-offs (Kelemahan/Pertukaran)

- **Slight Overhead (Sedikit Tambahan Beban Kinerja)**: The guard performs an additional database lookup to fetch the `projectId` from the nested resource ID (`priorityId`) during `update` and `delete` operations. This is a standard and acceptable trade-off for robust RBAC on nested routes.
  _(Setelan *Guard* ini dengan sangat terpaksa diam-diam melaksanakan rutinitas penarikan paksa beruntun menuju gudang / basis database setiap kali hendak menciduk nomor serian / parameter urutan `projectId` di relung perut benda id *nested resource* (`priorityId`) tiap saat prosesi tindakan penyuntingan berkedok `update` ditambah *pembasmian data (`delete`)* meletus. Untungnya ini bisa diamini sepenuhnya dikarenakan merupakan jalan tengah/kompromistis paling pantas teramat wajar dalam mencapai ketegaran keamanan RBAC tingkat tinggi (khususnya untuk penanganan Rute Buntu Berlapis / Nested Routes).)_

## Prevention (Pencegahan)

- **Verify Dependencies (Mengesahkan Keberadaan Modul/Keterikatan Awal/Dependensi)**: Always verify the existence of shared utilities, guards, or services before importing them.
  _(Awas sebelum menyentuh / mengimpor / memanggil barang; Cek serta konfirmasikan eksistensi maupun jasad riil dari sosok fungsional bawaan `shared utilities`, `guards`, `services`.)_
- **Reference Existing Patterns (Manfaatkan Riwayat Rujukan Pola Kebiasaan Mapan)**: Consult similar, previously implemented modules (such as `Labels` for project-scoped resources) to identify the currently supported patterns and avoid speculative imports.
  _(Terus mengais hikmah serta berkonsultasi mengenai aneka ragam susunan tumpuan bentuk / *Implemented Modules* di fase purba sebelum masa-masa kini (Macam keberadaan wujud dewa entitas bertajuk: `Labels` bagi kasus *project-scoped resources*), gunanya demi memperoleh identifikasi titik kerangka struktur (pola dasar) manakah gerangan yang patut mendapat *restu mutlak* dukungan terkini sehingga angan rekayasa spekulatif / khayalan semata nan menyedihkan dapat dikubur rapat-rapat saat kita iseng melakukan tindakan impor pemanggilan._)
