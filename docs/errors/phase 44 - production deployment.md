# Phase 44 - Production Deployment

## Error: Nest can't resolve dependencies of the JwtAuthGuard

### Gejala

Ketika menjalankan _development server_ (`npm run dev`) pada `apps/api`, NestJS gagal memuat _dependencies_ dan menyebabkan aplikasi _crash_ dengan _stack trace_ sebagai berikut:

```text
Error: Nest can't resolve dependencies of the JwtAuthGuard (?, ConfigService). Please make sure that the argument JwtService at index [0] is available in the UsersModule context.

Potential solutions:
- Is UsersModule a valid NestJS module?
- If JwtService is a provider, is it part of the current UsersModule?
- If JwtService is exported from a separate @Module, is that module imported within UsersModule?
  @Module({
    imports: [ /* the Module containing JwtService */ ]
  })
```

### Penyebab

Error ini timbul pasca-perombakan arsitektur autentikasi (penghapusan Passport). Pada implementasi awal, `JwtAuthGuard` bawaan NestJS/Passport otomatis menangani _injection_. Setelah Passport dihapus, `JwtAuthGuard` kustom yang kita buat secara eksplisit membutuhkan injeksi `JwtService` pada konstruktornya:

```typescript
constructor(
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
) {}
```

Meskipun `JwtModule` sudah diregistrasi di dalam `AuthModule`, modul lain (misalnya `UsersModule`) menggunakan _decorator_ `@UseGuards(JwtAuthGuard)` tanpa mengimpor `AuthModule` maupun `JwtModule`. Hal ini menyebabkan kontainer _Dependency Injection_ NestJS gagal menemukan `JwtService` di dalam cakupan _module_ tersebut. `ConfigService` tidak mengalami masalah karena `ConfigModule` sudah diregistrasi secara global di `AppModule`.

### Solusi

Mengubah pendaftaran `JwtModule` di dalam `AuthModule` menjadi _global module_, sehingga `JwtService` tersedia untuk diinjeksi di modul apa pun di seluruh aplikasi.

**Perubahan pada file `apps/api/src/modules/auth/auth.module.ts`**:

```diff
@Module({
- imports: [UsersModule, JwtModule.register({})],
+ imports: [UsersModule, JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```
