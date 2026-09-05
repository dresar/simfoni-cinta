# 🖥️ `src/server/` — Backend Service & Business Logic Layer

Direktori ini menaungi seluruh logika bisnis (*business logic*), query database langsung (Drizzle ORM), integrasi pihak ketiga, dan manajemen cache. Modul-modul di sini beroperasi **eksklusif di sisi server (pure TypeScript, zero React/DOM)** dan tidak boleh di-bundle ke sisi klien.

---

## 🏗️ Pola Arsitektur Server Service

Lapisan ini dipanggil langsung oleh:
1. **Server Functions** (`src/functions/*.ts` via `createServerFn`)
2. **Server Entrypoint** (`src/server.ts` untuk REST webhook / checkout endpoint)

```
[src/functions/*] atau [src/server.ts]
        │
        ▼ (Memanggil fungsi layanan)
[src/server/<service>.ts]
        │
        ├─► [src/lib/redis/client.ts] (Cek cache Redis)
        │
        └─► [src/lib/db/client.ts] (Query Drizzle ORM ke Neon DB)
```

---

## 📋 Inventaris Lengkap Modul Layanan Server (14 Modul)

| File Layanan | Fungsi Utama yang Diekspor | Peran & Logika Bisnis |
|---|---|---|
| **`users.ts`** | `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `initiateSocialLogin`, `resolveLatestSession` | CRUD pengguna, hashing/verifikasi sesi, sinkronisasi kuota undangan, dan manajemen tier (`Free`, `Gold`, `Platinum`, `Owner`). |
| **`invitations.ts`** | `getInvitations`, `getUserInvitations`, `getInvitationById`, `getInvitationBySlug`, `createInvitation`, `createInvitationWithEntitlement`, `updateInvitation`, `deleteInvitation`, `generateUniqueSlug`, `recordInvitationView` | Logika pembuatan dan modifikasi website undangan, pembuatan slug unik otomatis, konsumsi kuota entitlement, dan kalkulasi total pengunjung. |
| **`purchases.ts`** | `createTemplatePurchase`, `getTemplatePurchasesByUser`, `getTemplatePurchaseById`, `verifyAndGrantEntitlement` | Pengelolaan pesanan pembelian paket, verifikasi callback pelunasan dari Mayar Payment Gateway, dan otomatisasi aktivasi hak akses (*grant entitlement*). |
| **`entitlements.ts`** | `getUserEntitlements`, `getAvailableEntitlementCount`, `getAvailableEntitlementForTemplate`, `consumeEntitlement` | Buku besar hak akses fitur (*entitlement ledger*): menghitung sisa kuota pembuatan undangan per akun dan memvalidasi izin penggunaan template premium. |
| **`guestbook.ts`** | `checkGuestbookEligibility`, `getGuestbookEvents`, `getGuestbookEventById`, `createGuestbookEvent`, `updateGuestbookEvent`, `deleteGuestbookEvent`, `getEventGuests`, `recordAttendanceCheckIn`, `getGuestbookMessages`, `moderateGuestbookMessage`, `getGuestbookAnalytics` | Sistem penuh Buku Tamu Digital VIP: pengecekan kelayakan tier (Gold/Platinum), pendaftaran tamu + QR code token unik, scan presensi resepsionis, moderasi doa, dan grafik analitik kehadiran real-time. |
| **`templates.ts`** | `getTemplates`, `getTemplateBySlug`, `getTemplateAssets`, `getTemplateStats`, `getCategoriesSummary`, `createTemplate`, `updateTemplate`, `deleteTemplate` | Katalog tema undangan pernikahan, agregasi statistik kepopuleran tema, dan query aset template. |
| **`assetDetective.ts`** | `inspectTemplateAssets`, `getTemplateAssetTree`, `detectAssetTypes`, `getAssetDetails`, `scanAllTemplates` | Mesin inspeksi forensik aset template: memindai direktori ZIP / folder diekstrak, mengkategorikan file (Cover, Ornaments, Music, CSS, JS, HTML), dan memetakan status sinkronisasi CDN. |
| **`assetFolders.ts`** | `createAssetFolder`, `renameAssetFolder`, `deleteAssetFolder`, `moveAssetToFolder`, `getTemplateCustomFolders` | Manajemen struktur folder virtual untuk pengorganisasian aset template kustom. |
| **`gemini.ts`** | `getGeminiRotationStats`, `testGeminiConnection`, `generateTemplatePromotion`, `generateImagePrompts`, `generateVideoPrompts`, `generateSocialCarousels` | Engine integrasi Gemini 3.6 Flash dengan dukungan rotasi multi-API Key otomatis. Menghasilkan copywriting promosi, prompt gambar Midjourney/Flux, prompt video Kling AI, dan konten carousel medsos. |
| **`settings.ts`** | `getAdminSettings`, `saveAdminSettings`, skema Zod konfigurasi master | Konfigurasi master sistem (navigasi, harga paket `DEFAULT_PACKAGES`, FAQ, testimonial, SEO). Disimpan di tabel `adminSettings` dan dicache di Redis `api:admin_settings`. |
| **`media.ts`** | `getTemplateCategories`, `createTemplateCategory`, `getMusic`, `createMusic`, `deleteMusic`, `getAssets`, `createAsset`, `updateAssetCategory`, `bulkUpdateAssetCategory`, `deleteAsset` | Layanan pustaka lagu MP3 latar, kategori tema, dan galeri media bersama. |
| **`konten.ts`** | `getPrayers`, `getPrayerById`, `createPrayer`, `updatePrayer`, `deletePrayer`, `getQuotes`, `createQuote`, `updateQuote`, `deleteQuote`, `getSacredTexts`, `createSacredText`, `deleteSacredText` | CRUD pustaka doa multi-agama, kutipan asmara pengantin, dan ayat suci pernikahan. |
| **`transaksi.ts`** | `getRsvps`, `createRsvp`, `deleteRsvp`, `getOrders`, `createOrder`, `updateOrder`, `getGuests`, `createGuest`, `updateGuest`, `deleteGuest` | Layanan konfirmasi kehadiran RSVP tamu, pesanan manual admin, dan daftar kontak tamu WhatsApp. |
| **`upload.ts`** | `saveUploadedFile`, `deleteUploadedFileFromGitHub`, `deployTemplateFileToGitHub`, `syncSelectiveAssetsToGitHub` | Pipeline unggah file (foto/audio/template) ke repositori CDN GitHub Storage (`ponpesraudhatussalammahato-hue/wedding-cdn`) dengan fallback sistem file lokal. |

---

## 💡 Panduan & Aturan untuk AI
1. **Server-Only Execution:**
   * Jangan pernah mengimpor modul dari `src/server/*` ke dalam file komponen React atau file yang dijalankan di browser. Hal ini dapat membocorkan dependensi server (seperti `fs`, `crypto`, `child_process`) ke bundel klien.
2. **Kredensial Aman:**
   * Seluruh API Key (Gemini, Mayar, GitHub Storage Token) WAJIB dibaca dari `process.env`.
3. **Invalidasi Cache Konsisten:**
   * Setelah fungsi mutasi (`create*`, `update*`, `delete*`) berhasil mengubah data di tabel database, panggil helper `invalidate()` dari `@/lib/redis/client` untuk membersihkan cache terkait.
