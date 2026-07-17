# Phase 18 - Labels: Proposed API Response Wrapper & Over-fetching

## Symptoms (Gejala)

A proposal was made to introduce a generic API response wrapper (`{ success, data, message, errors, status, paging, code, timestamp }`) across the project, as well as an overarching `models/` folder containing bloated response DTOs (e.g., a `UserResponse` that always fetches `organizationMembers`, `workspaceMembers`, and `projectMembers`).
_(Sebuah usulan diajukan untuk memperkenalkan pembungkus respons API (*API response wrapper*) yang generik di seluruh proyek (`{ success, data, message, errors, status, paging, code, timestamp }`), beserta sebuah folder raksasa `models/` yang berisi DTO respons membengkak (contohnya: sebuah `UserResponse` yang selalu menarik semua data berelasi di `organizationMembers`, `workspaceMembers`, dan `projectMembers`).)_

## Root Cause (Akar Masalah)

A desire for strict, explicit uniformity across all API endpoints often leads to duplicating features that the underlying protocols and frameworks already provide. This is a common architectural anti-pattern where developers recreate HTTP status codes, headers (like Date/timestamp), and success indicators inside the JSON payload itself. Furthermore, defaulting to heavy relation loading in base DTOs stems from optimizing for a "fetch everything once" mindset, which doesn't scale.
_(Hasrat yang kuat untuk menerapkan keseragaman yang absolut dan serba nyata pada seluruh bentuk *endpoint API*, acapkali bermuara dalam penggandaan beraneka fitur / properti; padahal semua itu diam-diam juga sudah dibereskan oleh jenis framework/protokol yang ditumpangi di baliknya. Hal tersebut di atas dipastikan merupakan jenis 'anti-pattern' langganan perusak arsitektural yang paling jamak ditemukan ketika ada seorang developer yang bertindak bodoh mengarang ulang deretan kode status HTTP, metadata pada parameter kepala / Header HTTP (macam tanggalan/waktu), hingga mengulangi konfirmasi bahwa proses tersebut dinyatakan berjalan sukses dari ke dalam *Payload JSON* itu tersendiri. Berhubungan dengan itu, membiasakan diri mengambil langsung relasi objek maha berat ketika mengambil nilai awal / pondasi (*base DTO*) umumnya dikarenakan keobsesian dalam pengoptimalan berkedok: *Ambil Semua dalam Sekali Gerak*... Yang pastinya itu tak terbukti berjalan mulus bila kita mengulas dan menakar kemampuan skala jangka panjang (*skalabilitas/scale*).)_

## Investigation (Investigasi)

- Reviewed the proposed global API Response wrapper. The existing `ResponseInterceptor` already wraps responses, but adding `success`, `status`, `code`, and `timestamp` directly to the payload is redundant with HTTP standard behaviors (2xx status codes naturally denote success, headers contain timestamps, etc.).
  _(Menginvestigasi struktur global *Response wrapper* usulan tersebut. Interceptor `ResponseInterceptor` andalan yang lama rupanya sudah sukses menjalankan hal serupa. Melengkapi properti json macam parameter `success`, `status`, `code`, plus `timestamp` untuk diterjunkan langsung bersama muatan akhir JSON cuma memamerkan tingkat kemubaziran nan tak terhingga dan menyalahi *best-practice* dari sifat alami si HTTP: (Deret awalan status 2xx sudah alamiah bermakna pertanda jalan mulus/kesuksesan, metadata pada parameter header/kepala tak akan ketinggalan membawa keterangan deret stempel-waktu/timestamp.))_
- Reviewed the proposed `models/` folder. The application already utilizes a robust `dto/` structure within each NestJS module (mandated by the handbook), so adding an external `models/` folder for identical purposes creates duplicate sources of truth.
  _(Menyelami proposal folder usulan bernama `models/`. Secara struktur aplikasi sesungguhnya telah ditopang deretan struktur validasi tangguh berupa kawanan `dto/` yang mendiami setiap sekat relung nestjs (sebagaimana tertuang di dalam instruksi kerja/handbook), oleh karenanya mengarang folder `models/` dari sisi luar namun demi pencapaian ambisi serupa bakal seketika merusak kaidah *Single Source of Truth* alias sumber kebenaran data berganda.)_
- Reviewed the `UserResponse` relations. Returning nested arrays of organizations, workspaces, and projects on every user fetch creates severe N+1 query risks and over-fetching, as most endpoints do not require the entire relation tree.
  _(Meninjau deret baris kode relasional dari `UserResponse`. Melemparkan rincian balik berupa *nested array / larik berantai* seputar organisasi, workspace (bilik kerja), sampai menjalar jauh ke area *projects* pada sembarang tindakan permintaan informasi pengguna perorangan merupakan wujud paling menyeramkan terkait ancaman *Badai Query* / `N+1` termasuk wujud aksi ambil berlebih / `over-fetching`; sedangkan ironisnya rata-rata sebagian dominan titik akhir pengaksesan API tak sedikit pun mementingkan kerimbunan *relasi data beruntun* semacam itu.)_

## Solution (Solusi)

- **Rejected (Ditolak)** the reinvented HTTP envelope to preserve standard REST practices and the existing public API contract.
  _(**Ditolak Mentah-mentah** - Mengubah/merekayasa ulang rincian amplop protokol HTTP agar senantiasa merawat prinsip keselarasan REST secara utuh sekaligus menghargai warisan lama dalam struktur kesepakatan umum / kontrak *API Publik*.)_
- **Rejected (Ditolak)** the creation of the global `models/` directory in favor of existing module-scoped DTOs and Prisma-generated types.
  _(**Dibatalkan Penuh** - Rencana pembangunan kawasan global `models/` dikarenakan lebih bersimpati dalam menaungi keberlangsungan kumpulan DTO berskala modul (Module-Scoped) bersisian berdampingan bersama jajaran Tipe Statis Data garapan mesin *Prisma*.)_
- **Rejected (Ditolak)** embedding heavy relations in base response objects. Relations must be explicitly loaded only on endpoints that require them.
  _(**Ditentang Sepenuhnya** - Upaya membenamkan aneka ragam data-data relasi raksasa menyatu mendarah daging bercampur dengan pondasi awal sebuah pengiriman respon (Base Response). Hal semacam `Relationship/Relasi Berantai` pantang ditarik sebelum endpoint secara sadar / terencana mensyaratkan hal sedemikian besarnya. )_

Net: **0 files changed**. Maintained a lean architecture by avoiding unnecessary abstractions, boilerplate models, and over-fetching.
_(Hitungan Bersih: **0 Modifikasi Pada File Apapun**. Berhasil melestarikan bentuk arsitektur tubuh ramping melalui penghindaran aksi asusila macam: abstraksi tak perlu, gerombolan model *boilerplate*, dan praktik maruk *over-fetching* data.)_

## Trade-offs (Kelemahan/Pertukaran)

- **Less explicit payload data (Data payload terkesan kurang ekspresif)**: Clients must rely on HTTP status codes and headers to determine success or timestamp, rather than reading it from the JSON body. This is standard REST, but some legacy clients prefer envelope patterns.
  _(Sang sisi konsumen alias Client terpaksa mendadak jadi harus peka dengan bergantung membaca pertanda di *HTTP status codes* &amp; jejeran *Header* untuk membedah riwayat kesuksesan jalan atau keterangan waku/jam (`timestamp`), tak bisa lagi menyuapkan data santai dari pembelahan `JSON body`. Konsep standar REST ya seperti inilah; meskipunn kaum / klien-klien warisan era primitif acapkali masih amat kecanduan dimanjakan lewat arsitektur *Envelope Patterns*.)_
- **Explicit relation loading (Penarikan Relasi yang Berbelit (eksplisit))**: Clients may need to make separate API calls (or use specific endpoints) to fetch relations like workspace members instead of getting them "for free" on the base user object.
  _(Sebuah ancaman bahwa Para Client boleh jadi bakal berurusan memanggil beberapa kali proses panggilan API dalam wujud berserakan / tak bertumpuk (atau dipaksa memakai endpoint dengan kriteria titik yang memusingkan) cuma untuk mendulang deretan jalinan hubungan data *seperti halnya para relawan anggota workspace*, daripada hanya rebahan mendulang info semacam itu dari data gratisan objek user yang cuma memuat hal-hal dasar belaka. )_

## Prevention (Pencegahan)

- Run `/ponytail-review` on proposed architectural changes before implementation to catch reinvention of standard library/protocol features.
  _(Gunakan tuas `/ponytail-review` terhadap proposal segala bentuk manuver revolusi struktural sistem sebelum direalisasikan supaya mampu mencegat oknum gila yang hendak mencipta roda baru di atas library standar / aneka fitur kerangka protokol resmi.)_
- Base DTOs should strictly reflect the scalar fields of the entity. Relational data should be added via extending DTOs (e.g., `UserWithRelationsDto`) only when explicitly needed by a specific use case.
  _(Pedoman Suci DTO Awalan (*Base DTO*) wajib hukumnya cuma bercermin berdasarkan variabel *Skalar / Scalar* sebuah objek / *Entity*. Kalaupun ada jalinan data keturunan silang, cukup dicantumkan berlandaskan *extending DTO* (semacam `UserWithRelationsDto`) cuma di saat titik darurat tak bersyarat yang membutuhkannya (*use case tertentu*).)_

## References (Referensi)

- [Ponytail Review Skill](../../.agents/skills/ponytail-review/SKILL.md)
