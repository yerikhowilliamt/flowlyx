# Error Documentation: Phase 34 - Organization Billing (Placeholder)

## Symptoms

Saat menjalankan proses build (`npm run build`) untuk modul backend, compiler TypeScript (`tsc`) mengeluarkan pesan error:

```
src/modules/organization-billing/organization-billing.controller.ts:25:33 - error TS2339: Property 'ORG_ADMIN' does not exist on type 'typeof Role'.
```

## Root Cause

Pada `OrganizationBillingController`, dekorator autorisasi `@Roles()` awalnya dipasang dengan menggunakan nilai `Role.ORG_ADMIN` (yakni `@Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)`). Namun, _Role_ tersebut belum didefinisikan (atau memang tidak ada) pada _enum_ global role aplikasi yang berada di `apps/api/src/modules/rbac/enums/role.enum.ts`.

## Investigation

Dilakukan pengecekan pada _file_ `role.enum.ts`. Ditemukan bahwa nilai _Role_ yang tersedia dan disetujui di dalam repositori saat ini hanyalah:

- `USER`
- `ADMIN`
- `SUPER_ADMIN`

## Solution

1. Merevisi penggunaan `Role.ORG_ADMIN` menjadi `Role.ADMIN` di dalam `organization-billing.controller.ts`.
2. Melakukan _re-build_ dan memastikan `tsc` berhasil melewati proses pengecekan tipe dengan sempurna.

## Trade-offs

Tidak ada trade-off signifikan. Pengubahan _role_ ini semata-mata mengadaptasikan placeholder modul dengan standar otorisasi eksisting aplikasi. Jika ke depannya modul membutuhkan peran `ORG_ADMIN` khusus, maka _enum_ role utama aplikasi (`role.enum.ts`) harus diperbarui terlebih dahulu dan divalidasi ke semua lapisan keamanan (_guards_, database _seeders_, dll).

## Prevention

Sebelum mendeklarasikan tipe data (terutama untuk abstraksi RBAC), selalu periksa terlebih dahulu sumber aslinya (misalnya _enums_ atau struktur _interfaces_ yang sudah didefinisikan oleh tim).

## References

- `apps/api/src/modules/rbac/enums/role.enum.ts`
- TypeScript Enum type-checking (TS2339)
