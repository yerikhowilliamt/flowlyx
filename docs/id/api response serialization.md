# 📝 Dokumentasi Perubahan: API Serialization & Swagger Integration

Dokumen ini merangkum seluruh perubahan arsitektur, fitur, dan perbaikan bug yang dilakukan pada _branch_ `feature/api-response-serialization`. Fokus utama dari pengembangan ini adalah standarisasi bentuk _response_ API agar sesuai dengan level _production_ (Enterprise), sekaligus melengkapi dokumentasi interaktif Swagger.

---

## ✨ Fitur Baru & Perubahan Arsitektur

### 1. Sistem Serialisasi Otomatis (_Class-Transformer_)

- **Tujuan:** Memastikan bahwa API tidak pernah secara tidak sengaja membocorkan data sensitif (seperti `passwordHash` atau kolom _internal database_ lainnya) ke _client_.
- **Instalasi Dependensi:** Menambahkan `class-transformer` ke dalam `package.json` (`apps/api`).
- **Pembuatan Interceptor:** Membuat `SerializeInterceptor` (`src/common/interceptors/serialize.interceptor.ts`) yang membungkus _response_ menggunakan perintah `plainToInstance` dengan parameter strict `excludeExtraneousValues: true`.
- **Refactor Controller:** Menghapus logika pemotongan data secara manual (seperti `const { passwordHash, ...result } = user;`) dari Controller, karena sekarang pemotongan data dilakukan secara otomatis oleh Interceptor di latar belakang.

### 2. Standarisasi Format _Snake Case_

- **Tujuan:** Standar industri untuk _response_ JSON adalah menggunakan `snake_case` (misal: `access_token`), sementara di dalam kode TypeScript tetap menggunakan `camelCase` (misal: `accessToken`).
- **Transformasi Global:** Seluruh 100% _DTO Models_ (seperti `UserResponse`, `WorkspaceSummary`, dll) telah diperbarui secara otomatis.
- Menambahkan parameter `{ name: 'format_snake_case' }` pada _decorator_ `@ApiProperty` (agar Swagger selaras) dan `@Expose` (agar `class-transformer` mem-parsing data dengan nama tersebut).
- **Update Auth:** Mengubah struktur respon _endpoint_ `/auth/login` yang semula mengembalikan `{ accessToken }` menjadi `{ access_token }`.

### 3. Dokumentasi Swagger (OpenAPI) Menyeluruh

- **Grouping (@ApiTags):** Menambahkan `@ApiTags('Nama Modul')` secara otomatis ke semua _controller_ (`Auth`, `Users`, `Organizations`, `Workspaces`, `Projects`, `Boards`, `Lists`, `Tasks`, `Subtasks`, `Labels`, dan `Project Members`) agar rapi dan tidak menumpuk di label "default".
- **Spesifikasi Response:** Menyematkan `@ApiOperation`, `@ApiOkResponse`, dan `@ApiCreatedResponse` ke seluruh _endpoint_ CRUD di semua _controller_, serta mengarahkannya ke model yang relevan (contoh: `@ApiOkResponse({ type: [WorkspaceSummary] })`).

---

## 🔒 Konfirmasi Keamanan (Security Audit)

Sistem _Auth Token_ saat ini sudah di-_review_ dan dinyatakan sesuai dengan standar keamanan produksi untuk arsitektur _Single Page Application_ (SPA):

1. **Refresh Token** dikirim dengan aman melalui Cookie (`httpOnly: true`, `secure: true`, `sameSite: 'strict'`) untuk menghindari bahaya XSS (_Cross-Site Scripting_).
2. **Access Token** dikirim melalui _JSON body response_ untuk disimpan sementara di _memory (state)_ klien, menjaga sistem kebal dari eksploitasi CSRF (_Cross-Site Request Forgery_).
