# ⚡ `src/functions/` — TanStack Start Server Functions (RPC Bridge)

Direktori ini berisi seluruh **TanStack Start Server Functions** (`createServerFn`). Server functions bertindak sebagai lapisan jembatan Remote Procedure Call (RPC) yang aman dan berjenis data ketat (*type-safe*) antara antarmuka React di klien dengan lapisan logika backend di `src/server/*` dan database.

---

## 🏗️ Pola Arsitektur `createServerFn`

Setiap fungsi di folder ini menggunakan pola standar:
1. **Definisi Metode:** `.createServerFn({ method: "GET" | "POST" })`
2. **Validasi Input:** `.validator((data: unknown) => Schema.parse(data))` menggunakan `zod`
3. **Handler Server:** `.handler(async ({ data }) => { ... })` yang memanggil modul `src/server/*` atau Drizzle ORM langsung.

```
[Komponen Klien / Route Loader]
       │  (Memanggil fungsi seperti fetchInvitations({ data: { ownerId } }))
       ▼
[src/functions/invitations.ts] ──► Validasi Zod
       │
       ▼ (Eksekusi aman di Server)
[src/server/invitations.ts] ──► Drizzle ORM / Redis Cache
```

---

## 📋 Inventaris Lengkap Modul Server Functions

| File Modul | Daftar Fungsi Server yang Diekspor | Metode & Deskripsi Fungsional |
|---|---|---|
| **`payment.ts`** | `createMayarCheckoutFn`, `createDompetXCheckoutFn` | **POST:** Membuat sesi pembayaran Mayar / DompetX berdasar paket pilihan dan mengembalikan URL checkout. |
| **`purchases.ts`** | `fetchUserPurchases`, `createPurchaseOrder`, `verifyPurchaseAndGrant` | **GET/POST:** Riwayat pembelian paket pengguna, inisialisasi order baru, dan verifikasi status pembayaran untuk menerbitkan hak akses (*entitlements*). |
| **`entitlements.ts`** | `fetchUserEntitlements`, `fetchAvailableEntitlementCount`, `fetchAvailableEntitlementForTemplate` | **GET:** Mengambil hak akses paket pengguna dan kuota pembuatan undangan aktif yang belum terpakai. |
| **`invitations.ts`** | `fetchInvitations`, `fetchUserInvitations`, `fetchInvitation`, `addInvitation`, `addInvitationWithEntitlement`, `editInvitation`, `removeInvitation`, `incrementViews` | **GET/POST:** CRUD lengkap website undangan pernikahan pengguna, konsumsi kuota entitlement, dan tracking penambahan jumlah tayangan (*views*). |
| **`guestbook.ts`** | `fetchGuestbookEvents`, `fetchGuestbookEvent`, `addGuestbookEvent`, `editGuestbookEvent`, `removeGuestbookEvent`, `fetchGuestCategories`, `fetchEventGuests`, `recordAttendanceFn`, `fetchGuestbookStats`, dll | **GET/POST:** Manajemen penuh Buku Tamu Digital, verifikasi kelayakan tier akun, daftar tamu per acara, scan kehadiran QR code, dan audit log. |
| **`templates.ts`** | `fetchTemplates`, `fetchTemplateBySlug`, `fetchTemplateStats`, `fetchCategoriesSummary`, `updateTemplateMeta`, `removeTemplateFn` | **GET/POST:** Pengambilan katalog tema undangan, statistik template terpopuler, rekap kategori, dan pembaruan metadata tema. |
| **`assetFolders.ts`** | `fetchCustomFolders`, `addAssetFolder`, `updateAssetFolder`, `removeAssetFolder`, `moveAsset` | **GET/POST:** Pengorganisasian folder aset virtual untuk template Asset Detective. |
| **`gemini.ts`** | `getGeminiRotationStatsFn`, `testGeminiConnectionFn`, `generateTemplatePromoFn`, `generateImagePromptFn`, `generateVideoPromptFn`, `generateSocialCarouselFn`, `generateSeoMetadataFn` | **GET/POST:** Generator konten berbasis AI Gemini Flash (copywriting promosi, prompt Midjourney/Flux, skrip video Kling, dan carousel IG/TikTok). |
| **`graphify.ts`** | `fetchGraphifyStatsFn`, `triggerGraphifyRegenerateFn` | **GET/POST:** Mengambil metrik graf arsitektur kode (God Nodes, Komunitas modul) untuk visualisasi di `/admin/arsitektur`. |
| **`konten.ts`** | `fetchPrayers`, `fetchPrayer`, `addPrayer`, `editPrayer`, `removePrayer`, `fetchQuotes`, `addQuote`, `editQuote`, `removeQuote`, `fetchSacredTexts`, `addSacredText`, `removeSacredText` | **GET/POST:** CRUD koleksi doa pernikahan, kutipan romantis, dan ayat suci multi-religi. |
| **`media.ts`** | `fetchMusic`, `addMusic`, `removeMusic`, `fetchAssets`, `addAsset`, `editAsset`, `bulkEditAssetCategory`, `removeAsset`, `fetchTemplates`, `addTemplate`, `removeTemplate` | **GET/POST:** CRUD pustaka musik MP3 latar, aset gambar, dan registrasi tema baru. |
| **`transaksi.ts`** | `fetchRsvps`, `addRsvp`, `removeRsvp`, `fetchOrders`, `addOrder`, `editOrderStatus`, `fetchGuests`, `addGuest`, `editGuest`, `removeGuest` | **GET/POST:** CRUD konfirmasi kehadiran RSVP tamu, transaksi pesanan admin, dan daftar tamu WhatsApp. |
| **`upload.ts`** | `uploadImageFn`, `deployTemplateFileFn`, `syncSelectiveAssetsFn` | **POST:** Upload gambar/audio ke storage GitHub/CDN dan sinkronisasi selektif aset template. |
| **`users.ts`** | `fetchUsers`, `fetchUser`, `addUser`, `editUser`, `removeUser`, `resolveNeonOAuthSession`, `initiateSocialLogin`, `verifyUserSession` | **GET/POST:** Autentikasi pengguna, registrasi, manajemen akun oleh admin, dan verifikasi sesi login. |
| **`settings.ts`** | `fetchAdminSettings`, `updateAdminSettings` | **GET/POST:** Mengambil dan menyimpan konfigurasi master platform (menu, footer, paket harga, FAQ, SEO). |
| **`seed.ts`** | `runSeed` | **POST:** Menjalankan database seeder saat inisialisasi awal sistem. |

---

## 💡 Panduan untuk AI
* Selalu panggil fungsi di folder ini dari dalam `loader` route TanStack atau hook `useQuery` / `useMutation` di sisi klien.
* Jangan menulis query database SQL / Drizzle langsung di dalam komponen UI; delegasikan selalu melalui `src/functions/`.
