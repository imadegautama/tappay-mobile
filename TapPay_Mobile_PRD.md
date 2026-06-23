# TapPay Mobile App - Product Requirements Document

## 1. Executive Summary

### Problem Statement

TapPay membutuhkan aplikasi mobile pendamping untuk pengguna akhir agar mereka dapat membuat akun, mengelola saldo virtual, melihat riwayat transaksi, dan memahami status enrollment sidik jari tanpa harus mengakses admin panel atau terminal fisik.

### Proposed Solution

Bangun aplikasi mobile iOS dan Android menggunakan Expo managed workflow. Aplikasi mobile akan menjadi user wallet companion untuk TapPay, terhubung ke backend Laravel API melalui REST endpoint `/api/v1`, menggunakan Laravel Sanctum token untuk autentikasi, dan menjaga terminal fingerprint sebagai perangkat enrollment/pembayaran terpisah.

### Success Criteria

- Pengguna dapat register, login, logout, dan kembali otomatis ke sesi valid setelah app restart.
- Pengguna dapat melihat saldo terbaru dan 3 transaksi terakhir dari backend.
- Pengguna dapat melakukan top-up virtual Rp 1.000 sampai Rp 1.000.000 dan saldo/riwayat ter-refresh setelah sukses.
- Pengguna dapat melihat, memfilter, memuat halaman lanjutan, dan membuka detail transaksi.
- Pengguna dapat memperbarui profil, mengosongkan nomor HP opsional, dan mengganti PIN 4 digit.
- App menangani state loading, empty, validation error, unauthorized, offline, dan timeout secara eksplisit.

### Current Backend State

Backend TapPay yang menjadi sumber kontrak saat ini berada di:

```text
/Users/imadegautama/Documents/codes/tappay-api
```

Status repo backend yang relevan untuk mobile:

- Framework: Laravel 13.
- Auth: Laravel Sanctum bearer token.
- Admin stack: Filament 5, tetapi admin panel bukan bagian dari scope PRD mobile.
- API response format: JSON envelope `status`, optional `message`, optional `data`, optional `meta`, dan error `code`.
- Base mobile API path: `/api/v1`.

## 2. Product Scope & Non-Goals

### In Scope for Mobile v1

- Register akun pengguna TapPay.
- Login, logout, session restore, dan expired-token handling.
- Home wallet: greeting, saldo, status enrollment, quick actions, dan transaksi terakhir.
- Top-up saldo virtual melalui aplikasi.
- Riwayat transaksi dengan filter, pagination, pull-to-refresh, empty state, dan detail transaksi.
- Profil pengguna, edit profil, status enrollment, dan ganti PIN.
- Instruksi enrollment sidik jari di terminal fisik.
- Error handling dan UX states untuk form, network, auth, dan API validation.

### Non-Goals for Mobile v1

- Mobile app tidak melakukan scan, capture, atau enroll fingerprint langsung.
- Mobile app tidak memanggil endpoint `/terminal/*`.
- Tidak ada real payment gateway, bank transfer, QRIS, atau settlement uang asli.
- Tidak ada admin panel, terminal provisioning, user management admin, atau analytics dashboard di aplikasi mobile.
- Tidak ada push notification, biometric unlock lokal, deep link pembayaran, atau multi-device session management di v1.

## 3. Personas & User Stories

### Personas

| Persona | Need | Context |
|---|---|---|
| Pengguna TapPay | Mengelola akun, saldo, PIN, dan riwayat transaksi | Mahasiswa atau user kampus yang membayar di terminal TapPay |
| Operator Terminal | Membantu user melakukan enrollment atau pembayaran | Menggunakan terminal fisik, bukan mobile app |
| Admin Sistem | Memantau user, terminal, dan transaksi | Menggunakan backend/admin panel, bukan mobile app |

### User Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| AUTH-01 | Sebagai pengguna baru, saya ingin daftar akun agar bisa memakai TapPay. | Register menerima nama, email, password, konfirmasi password, dan PIN 4 digit; validasi tampil inline; sukses menyimpan token dan masuk ke Home. |
| AUTH-02 | Sebagai pengguna terdaftar, saya ingin login agar dapat mengakses saldo dan transaksi. | Login memakai email/password; token disimpan di SecureStore; login gagal menampilkan pesan API; app restart memulihkan sesi jika token valid. |
| AUTH-03 | Sebagai pengguna, saya ingin logout agar token sesi tidak tersimpan di perangkat. | Logout memanggil API, menghapus token lokal, membersihkan cache user, dan redirect ke Login. |
| WALLET-01 | Sebagai pengguna, saya ingin melihat saldo terbaru agar tahu dana virtual yang tersedia. | Home dan Profile menampilkan saldo dari backend; pull-to-refresh memuat ulang profile/balance/transactions. |
| WALLET-02 | Sebagai pengguna, saya ingin top-up saldo virtual agar bisa mencoba pembayaran terminal. | Nominal valid Rp 1.000 sampai Rp 1.000.000; sukses menginvalidasi profile, balance, dan transaction queries. |
| TX-01 | Sebagai pengguna, saya ingin melihat riwayat transaksi agar bisa mengecek aktivitas saldo. | List mendukung filter semua/payment/topup, pagination, pull-to-refresh, empty state, dan warna nominal sesuai tipe. |
| TX-02 | Sebagai pengguna, saya ingin membuka detail transaksi agar melihat informasi lengkap termasuk terminal bila ada. | Detail memanggil `/transactions/{id}`; objek `terminal` hanya diharapkan dari endpoint detail. |
| PROFILE-01 | Sebagai pengguna, saya ingin mengubah nama dan nomor HP agar profil tetap akurat. | Email read-only; `phone` boleh null/kosong; sukses menginvalidasi profile query. |
| PROFILE-02 | Sebagai pengguna, saya ingin mengganti PIN agar pembayaran terminal tetap aman. | Form meminta PIN lama, PIN baru, konfirmasi PIN baru; error `INVALID_CURRENT_PIN` ditampilkan jelas. |
| ENROLL-01 | Sebagai pengguna, saya ingin tahu status sidik jari saya agar tahu apakah sudah bisa membayar di terminal. | Status enrollment tampil di Home dan Profile; jika belum enrolled, app menampilkan instruksi datang ke terminal TapPay. |

## 4. UX Flow & Screen Requirements

### Navigation Model

Gunakan Expo Router dengan protected route groups:

```text
app/
  _layout.tsx
  index.tsx
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx
  (app)/
    _layout.tsx
    (tabs)/
      _layout.tsx
      index.tsx
      topup.tsx
      history.tsx
      profile.tsx
    transactions/[id].tsx
    profile/edit.tsx
    profile/change-pin.tsx
```

Routing behavior:

- App boot membaca token dari SecureStore.
- Jika token kosong, arahkan ke `/(auth)/login`.
- Jika token ada, fetch `/user/profile`.
- Jika profile fetch sukses, render protected app group.
- Jika profile fetch menghasilkan 401, hapus token dan redirect ke login.
- Authenticated user yang membuka route auth diarahkan ke `/(app)/(tabs)/`.

### Login Screen

Purpose: masuk ke akun TapPay.

Required UI:

- Logo/nama TapPay.
- Subtitle singkat: "Smart fingerprint payment".
- Email input.
- Password input dengan toggle show/hide.
- Button Login.
- Link/button Daftar akun baru.
- Disabled "Lupa password?" boleh tampil dengan toast "Fitur belum tersedia" jika tetap ingin dimasukkan.

Behavior:

- `POST /auth/login`.
- Loading state pada button.
- Submit disabled saat request pending.
- Error invalid credentials memakai pesan API: "Email atau password salah."
- Sukses menyimpan token dan mengarahkan ke Home.
- Form tidak tertutup keyboard.

### Register Screen

Purpose: membuat akun TapPay baru.

Required UI:

- Nama lengkap.
- Email.
- Password.
- Konfirmasi password.
- PIN 4 digit.
- Info bahwa fingerprint enrollment dilakukan di terminal.

Behavior:

- `POST /auth/register`.
- Validasi lokal: email valid, password minimal 8 karakter, PIN tepat 4 digit angka, password confirmation cocok.
- Error 422 tampil inline berdasarkan `errors`.
- Sukses menyimpan token, masuk ke Home, dan menampilkan pesan enrollment.

### Home Screen

Purpose: ringkasan wallet pengguna.

Required UI:

- Greeting sesuai waktu lokal.
- Nama pengguna.
- Balance card dengan saldo Rupiah.
- Badge enrollment:
  - Enrolled: "Sidik jari terdaftar".
  - Not enrolled: "Belum enroll sidik jari".
- Banner instruksi enrollment jika `is_enrolled` false.
- Quick action Top-up.
- Quick action Cek saldo atau Refresh.
- 3 transaksi terakhir.
- Link ke Riwayat.

Behavior:

- Fetch profile/balance and latest transactions.
- Latest transactions memakai `GET /transactions?per_page=3`.
- Pull-to-refresh menginvalidasi profile, balance, dan latest transactions.
- Tapping enrollment banner membuka instruksi singkat, bukan endpoint terminal.

### Top-up Screen

Purpose: menambah saldo virtual.

Required UI:

- Saldo saat ini.
- Preset nominal: Rp 10.000, Rp 25.000, Rp 50.000, Rp 100.000.
- Input nominal manual dengan format ribuan.
- Summary saldo setelah top-up.
- Button Konfirmasi top-up.
- Footer: "Saldo virtual untuk prototype TapPay."

Behavior:

- Valid amount integer dalam Rupiah.
- Minimum Rp 1.000.
- Maximum Rp 1.000.000.
- `POST /wallet/topup` body `{ "amount": number }`.
- Tampilkan confirmation dialog sebelum submit.
- Sukses: toast sukses, invalidate profile, balance, latest transactions, transaction list, lalu kembali ke Home atau tetap di Top-up dengan saldo baru.
- Double submit dicegah selama mutation pending.

### History Screen

Purpose: melihat semua transaksi user.

Required UI:

- Header "Riwayat transaksi".
- Filter tabs: Semua, Pembayaran, Top-up.
- Sectioned list by date.
- Pull-to-refresh.
- Infinite scroll.
- Empty state.
- Transaction row dengan tipe, deskripsi, waktu, amount, status, dan sisa saldo.

Behavior:

- `GET /transactions?page={page}&per_page=15`.
- Filter:
  - Semua: tanpa `type`.
  - Pembayaran: `type=payment`.
  - Top-up: `type=topup`.
- `per_page` default app: 15, API max: 50.
- List response tidak berisi `terminal`; row subtitle untuk payment memakai `description` atau fallback "Pembayaran TapPay".
- Tapping row membuka Transaction Detail.

### Transaction Detail Screen

Purpose: menampilkan informasi lengkap satu transaksi.

Required UI:

- Status transaksi.
- Tipe transaksi.
- Nominal.
- Saldo sebelum dan sesudah.
- Deskripsi.
- Waktu transaksi.
- Informasi terminal bila tersedia.

Behavior:

- `GET /transactions/{id}`.
- Endpoint detail dapat mengembalikan `terminal: null` atau `{ terminal_code, name }`.
- Jika 404, tampilkan state "Transaksi tidak ditemukan" dan CTA kembali.

### Profile Screen

Purpose: mengelola identitas pengguna dan keamanan dasar.

Required UI:

- Avatar initials.
- Nama.
- Email.
- Phone jika ada.
- Saldo.
- Enrollment status dan fingerprint ID jika tersedia.
- Menu Edit Profil.
- Menu Ganti PIN.
- Menu Logout.
- App version.

Behavior:

- Data berasal dari `/user/profile`.
- Logout meminta konfirmasi.
- Status belum enrolled memberi instruksi ke terminal.

### Edit Profile Screen

Purpose: update nama dan nomor HP.

Required UI:

- Nama input.
- Email read-only.
- Phone input opsional.
- Button Simpan.

Behavior:

- `PUT /user/profile` body `{ "name": string, "phone": string | null }`.
- Jika user mengosongkan phone, kirim `phone: ""` atau `phone: null`; backend menormalkan string kosong ke null.
- Sukses invalidate profile.
- Error phone duplicate tampil inline.

### Change PIN Screen

Purpose: mengganti PIN pembayaran terminal.

Required UI:

- PIN lama.
- PIN baru.
- Konfirmasi PIN baru.
- Button Ubah PIN.

Behavior:

- `PUT /user/change-pin`.
- Body:

```json
{
  "current_pin": "1234",
  "new_pin": "5678",
  "new_pin_confirmation": "5678"
}
```

- Semua PIN harus string 4 digit.
- PIN baru dan konfirmasi harus cocok.
- Error `INVALID_CURRENT_PIN` ditampilkan sebagai error PIN lama.
- Sukses menampilkan toast dan kembali ke Profile.

## 5. Technical Architecture

### Recommended Tech Stack

| Layer | Standard |
|---|---|
| Framework | Expo SDK 54 managed workflow |
| Runtime | React Native + TypeScript |
| Routing | Expo Router protected route groups |
| Server state | TanStack Query v5 |
| Client/auth state | Zustand |
| Token storage | expo-secure-store |
| HTTP | Axios or typed API client with bearer-token interceptor |
| Forms | React Hook Form + Zod |
| UI styling | React Native StyleSheet or Nativewind, pilih satu dan konsisten |
| Safe area | react-native-safe-area-context |
| Visual support | expo-linear-gradient for balance card |
| Icons | @expo/vector-icons or lucide-compatible RN icon library |
| Build config | EAS profiles with env-based API URL |
| Testing | Jest + React Native Testing Library for units/components; manual device QA for critical flows |

### Documentation Notes from Context7

- Expo SDK 54 recommends Expo Router file-based routing and route group layouts for authentication boundaries.
- Expo SecureStore should store sensitive session token on native platforms.
- EAS build profiles can set environment variables such as API base URL or app variant.
- TanStack Query v5 should own server state and invalidation; it should not replace local client state like auth bootstrap/loading UI.
- React Native screens should use accessible roles/labels for custom controls, `Pressable` for touch interactions, virtualized lists for transaction history, and explicit keyboard behavior for forms.

### Project Structure

```text
tappay-mobile/
  app/
    _layout.tsx
    index.tsx
    (auth)/
    (app)/
  src/
    api/
      client.ts
      auth.ts
      user.ts
      wallet.ts
      transactions.ts
      types.ts
    components/
      ui/
      wallet/
      transactions/
      profile/
    constants/
      config.ts
      money.ts
      queryKeys.ts
    hooks/
      useSession.ts
    stores/
      authStore.ts
    utils/
      format.ts
      errors.ts
```

### State Ownership

| State | Owner | Notes |
|---|---|---|
| Token | SecureStore + Zustand session state | SecureStore persists, Zustand reflects runtime auth status |
| Profile | TanStack Query | Query key `['profile']` |
| Balance | TanStack Query | Query key `['wallet', 'balance']`; may be derived from profile where appropriate |
| Latest transactions | TanStack Query | Query key `['transactions', 'latest']` |
| History list | TanStack Query infinite query | Query key `['transactions', { type }]` |
| Transaction detail | TanStack Query | Query key `['transactions', id]` |
| Form state | React Hook Form | Zod schema per screen |
| Dismissed UI banners | Local client state | Optional AsyncStorage if persistence needed |

### Query Invalidation Rules

- Login/register success: set token, invalidate/fetch profile.
- Logout success/failure: clear token, clear QueryClient cache.
- Top-up success: invalidate `profile`, `wallet/balance`, `transactions/latest`, and `transactions`.
- Profile update success: invalidate `profile`.
- Change PIN success: no server-state invalidation required beyond optional profile refetch.
- 401 from any protected request: clear token, clear cache, redirect to Login.

### Environment Configuration

Use an environment-driven API URL. Example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api/v1
```

Requirements:

- Development devices must use LAN IP, not `localhost`, when testing on physical phones.
- Production/staging API URL must be configured through EAS profile env.
- API client base URL must already include `/api/v1` to avoid route mismatch.

## 6. API Contract

### Response Envelopes

Success:

```ts
type ApiSuccess<T> = {
  status: 'success';
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
```

Error:

```ts
type ApiError = {
  status: 'error';
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  data?: Record<string, unknown>;
};
```

Pagination:

```ts
type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
```

### Core Types

```ts
type AuthUser = {
  id: number;
  name: string;
  email: string;
  balance: number;
  is_enrolled: boolean;
};

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  balance: number;
  is_enrolled: boolean;
  fingerprint_id: number | null;
  created_at: string | null;
};

type TransactionType = 'payment' | 'topup';
type TransactionStatus = 'success' | 'failed';

type TransactionListItem = {
  id: number;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  status: TransactionStatus;
  created_at: string | null;
};

type TransactionDetail = TransactionListItem & {
  terminal: null | {
    terminal_code: string;
    name: string;
  };
};
```

### Mobile Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Register user and return token |
| POST | `/auth/login` | No | Login and return token |
| POST | `/auth/logout` | Bearer | Revoke current token |
| GET | `/user/profile` | Bearer | Get current profile |
| PUT | `/user/profile` | Bearer | Update name/phone |
| PUT | `/user/change-pin` | Bearer | Change payment PIN |
| GET | `/wallet/balance` | Bearer | Get balance and formatted balance |
| POST | `/wallet/topup` | Bearer | Add virtual balance |
| GET | `/transactions` | Bearer | Paginated transaction history |
| GET | `/transactions/{id}` | Bearer | Transaction detail |

### Endpoint Details

#### POST `/auth/register`

Request:

```json
{
  "name": "I Made Gautama",
  "email": "gautama@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "pin": "1234"
}
```

Validation:

- `name`: required string max 255.
- `email`: required email max 255 unique.
- `password`: required string min 8 confirmed.
- `pin`: required string digits 4.

Success `201`: `data.token`, `data.user`.

#### POST `/auth/login`

Request:

```json
{
  "email": "gautama@example.com",
  "password": "password123"
}
```

Success `200`: `data.token`, `data.user`.

Failure `401`: `code = INVALID_CREDENTIALS`.

#### GET `/user/profile`

Success `200`: `data` as `UserProfile`.

#### PUT `/user/profile`

Request:

```json
{
  "name": "Gautama Updated",
  "phone": "081234567890"
}
```

Validation:

- `name`: sometimes string max 255.
- `phone`: sometimes nullable string max 20 unique except current user.

Success `200`: updated `UserProfile`.

#### PUT `/user/change-pin`

Request:

```json
{
  "current_pin": "1234",
  "new_pin": "5678",
  "new_pin_confirmation": "5678"
}
```

Validation:

- `current_pin`: required string digits 4.
- `new_pin`: required string digits 4 confirmed.

Failure `400`: `code = INVALID_CURRENT_PIN`.

#### GET `/wallet/balance`

Success:

```json
{
  "status": "success",
  "data": {
    "balance": 100000,
    "formatted": "Rp 100.000"
  }
}
```

#### POST `/wallet/topup`

Request:

```json
{
  "amount": 50000
}
```

Validation:

- `amount`: required integer min 1000 max 1000000.

Success `200`:

```ts
type TopupResponse = {
  amount: number;
  balance_before: number;
  balance_after: number;
  transaction_id: number;
};
```

#### GET `/transactions`

Query:

- `page`: optional integer min 1.
- `per_page`: optional integer min 1 max 50.
- `type`: optional `payment | topup`.

Success `200`: `data: TransactionListItem[]`, `meta: PaginationMeta`.

Important: list response does not include `terminal`.

#### GET `/transactions/{id}`

Success `200`: `data: TransactionDetail`.

Important: detail response may include `terminal` for payment transactions.

## 7. State, Auth & Error Handling

### Auth Bootstrap

1. Root layout mounts session provider and QueryClientProvider.
2. Session provider reads token from SecureStore.
3. If no token exists, session becomes unauthenticated.
4. If token exists, fetch `/user/profile`.
5. If fetch succeeds, session becomes authenticated.
6. If fetch returns 401, token is deleted and user is redirected to Login.

### Token Storage

- Store only Sanctum token in SecureStore.
- Do not store password or PIN locally.
- Do not log bearer token in dev logs.
- Clear token and query cache on logout or unauthorized response.

### Error Mapping

| Condition | User Experience |
|---|---|
| 400 `INVALID_CURRENT_PIN` | Inline error on current PIN field |
| 401 `INVALID_CREDENTIALS` | Login error toast or inline form error |
| 401 protected request | Clear session and redirect to Login |
| 422 `VALIDATION_ERROR` | Map `errors` object to form fields |
| Timeout | Toast "Koneksi timeout. Coba lagi." |
| No response/offline | Toast "Tidak ada koneksi. Periksa jaringan." |
| 404 transaction detail | Dedicated not-found state |
| 5xx/generic | Toast using API `message`, fallback "Terjadi kesalahan." |

### Accessibility & Platform Requirements

- Use `Pressable` for custom touch targets with role/label where appropriate.
- Minimum effective touch target should be comfortable on mobile, with `hitSlop` for small icon buttons.
- Form screens must use keyboard-aware layout and explicit keyboard behavior.
- Transaction history must use virtualized list (`FlatList`, `SectionList`, or equivalent) instead of rendering all rows inside ScrollView.
- App must respect safe area on iOS and Android.
- Buttons must expose disabled/loading state visually and functionally.

## 8. Testing & Acceptance Criteria

### API Contract Tests

- Mobile types match current backend response envelopes.
- Auth success includes `data.token` and `data.user`.
- Profile includes `phone`, `fingerprint_id`, and `created_at`.
- Transaction list excludes `terminal`.
- Transaction detail includes `terminal` nullable object.
- Validation errors expose `code = VALIDATION_ERROR` and `errors`.

### Auth Flow

- Register valid data creates session and redirects to Home.
- Register duplicate email maps backend error to email field.
- Register invalid PIN blocks submit or shows inline PIN error.
- Login valid credentials stores token and redirects to Home.
- Login wrong password shows invalid credentials.
- Logout revokes token when possible, clears local state, and redirects to Login.
- App restart restores valid session.
- Expired/invalid token redirects to Login.

### Wallet

- Home shows balance in Rupiah format.
- Pull-to-refresh reloads profile, balance, and latest transactions.
- Top-up preset updates amount.
- Manual top-up input formats thousands separators.
- Top-up below Rp 1.000 or above Rp 1.000.000 cannot submit.
- Successful top-up updates balance and transaction history.
- Rapid double-tap does not send duplicate top-up mutation.

### Transactions

- History loads first page with default `per_page=15`.
- Filters call API with correct `type`.
- Infinite scroll loads next page until `current_page === last_page`.
- Empty history shows empty state.
- Pull-to-refresh resets to first page.
- Detail screen loads terminal info from detail endpoint when available.

### Profile & PIN

- Profile displays name, email, phone, balance, and enrollment status.
- Edit profile updates name and phone.
- Clearing phone results in null/empty phone after refresh.
- Change PIN validates 4 digit strings.
- Wrong current PIN shows inline error.
- Successful PIN change returns to Profile and shows success message.

### UX & Platform

- Screens render correctly on small Android and iPhone safe-area devices.
- Keyboard does not cover form submit buttons.
- Loading, error, empty, and success states are visible.
- Important controls have accessibility labels/roles.
- Transaction list remains performant with at least 100 rows.

## 9. Risks & Future Roadmap

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Physical device cannot reach local Laravel `localhost` | App appears offline during development | Use LAN IP in `EXPO_PUBLIC_API_URL` |
| Transaction list lacks terminal info | History row cannot always show terminal name | Use description on list; fetch detail for terminal |
| Top-up is virtual | Users may confuse prototype with real money | Add clear "saldo virtual" copy in Top-up |
| Fingerprint enrollment happens outside app | User may not know next step after register | Show enrollment banner and profile status |
| Token expires mid-session | User may see stale protected screen | Centralize 401 handling in API client |

### Roadmap

#### MVP

- Auth, wallet balance, top-up virtual, transaction history/detail, profile, change PIN, enrollment status.

#### v1.1

- Better offline indicators.
- Saved dismissed enrollment banner.
- Transaction search by description/date.
- Optional local biometric unlock for opening app, not for TapPay terminal auth.

#### v2.0

- Real payment gateway integration for top-up.
- Push notification for successful terminal payment.
- QR/deep-link support if TapPay expands beyond fingerprint terminal.
- Multi-device session management.
