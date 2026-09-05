# 🛠️ `src/lib/` — Core Utilities, Gateway & Database Clients

Direktori ini berisi pustaka utilitas dasar (*shared utilities*), integrasi payment gateway, penanganan error SSR, klien database PostgreSQL (Neon/Drizzle), dan klien cache Upstash Redis.

---

## 📁 Struktur Subdirektori & Modul

```
src/lib/
├── ai/                # AI Visual Diff & Template Forensic Reconstructor
│   └── README.md      # Dokumentasi teknis modul AI
├── db/                # Drizzle ORM + Neon Database Serverless
│   └── README.md      # Dokumentasi skema database & seeder
├── redis/             # Upstash Redis client & helper caching
│   └── README.md      # Dokumentasi caching & invalidasi
├── error-capture.ts   # Out-of-band error logger untuk memulihkan stack trace SSR
├── error-page.ts      # Renderer halaman 500 fallback HTML mandiri
├── mayar.ts           # Integrasi Mayar Payment Gateway (Checkout & Webhook)
├── pagination.ts      # Logika perhitungan rentang halaman (pagination math)
├── utils.ts           # Helper kelas styling `cn()` (clsx + tailwind-merge)
└── README.md          # File ini (indeks utilitas)
```

---

## 📋 Detail Utilitas Root `src/lib/*`

### 1. `src/lib/utils.ts` (`cn`)
* **Fungsi:** Menggabungkan kelas styling Tailwind CSS secara kondisional tanpa konflik spesifisitas.
* **Implementasi:** Menggunakan `clsx` untuk parsing objek/array kondisi dan `tailwind-merge` untuk resolusi kelas bentrok.

### 2. `src/lib/mayar.ts` (Payment Gateway)
* **Fungsi:** Klien komunikasi HTTP ke Mayar API (`https://api.mayar.id/hl/v1`).
* **Fungsi Utama:**
  * `createMayarPayment(params: MayarPaymentRequest)`: Mengirim request pembuatan invoice / QRIS dinamis dan mengembalikan `checkoutUrl`.
  * Mode Simulasi Fallback: Jika environment variable `MAYAR_API_KEY` belum disetel, fungsi otomatis menghasilkan checkout mock simulasi agar developer tetap dapat menguji alur aplikasi tanpa gagal transaksi.

### 3. `src/lib/error-capture.ts` & `src/lib/error-page.ts` (SSR Crash Recovery)
* **Masalah yang Diatasi:** Server runtime Vinxi / h3 kerap menelan error internal SSR dan hanya mengembalikan payload generic JSON `{"status":500,"message":"HTTPError"}` tanpa jejak stack trace.
* **Solusi Teknis:**
  * `error-capture.ts`: Menangkap error asli di luar jalur (*out-of-band*) melalui hook console atau event, menyimpan jejak stack trace hingga 5 lapisan penyebab (`cause`).
  * `consumeLastCapturedError()`: Mengambil error tersimpan untuk dicatat di server log.
  * `renderErrorPage()`: Menghasilkan markup HTML 500 mandiri yang ramah pengguna.

### 4. `src/lib/pagination.ts` (`getShortPagination`)
* **Fungsi:** Menghitung daftar nomor halaman ringkas (maksimal 3 tombol angka berurutan) yang adaptif di layar smartphone sempit.

---

## 💡 Panduan untuk AI
* Untuk kebutuhan class name dinamis di React, selalu gunakan `cn(...)` dari `@/lib/utils`.
* Jangan memanggil API Mayar langsung dengan `fetch` ad-hoc; gunakan selalu fungsi pembungkus di `src/lib/mayar.ts`.
