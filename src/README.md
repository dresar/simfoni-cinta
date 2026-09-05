# 🏛️ Aksara Cinta / Simfoni Cinta — Core Source (`src/`) Architecture

Dokumentasi arsitektur resmi untuk direktori `src/`. Panduan ini dirancang sebagai referensi utama bagi AI dan developer agar dapat memahami struktur, alur data, peran setiap modul, dan konvensi proyek secara komprehensif tanpa perlu membaca ribuan baris kode sumber.

---

## 🚀 Ringkasan Teknologi (Tech Stack)

| Lapisan | Teknologi | Peran & Keterangan |
|---|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) + Vinxi | Fullstack React framework dengan SSR, file-based routing, dan server functions |
| **UI Library** | React 19 + TypeScript | UI deklaratif berbasis komponen modern |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Utility-first styling dengan CSS variables modern di `styles.css` |
| **Database** | Neon PostgreSQL (Serverless) | Database relational cloud dengan koneksi HTTP pooling |
| **ORM** | Drizzle ORM | Type-safe SQL query builder & schema definitions |
| **Cache & KV** | Upstash Redis | HTTP-based serverless Redis untuk caching query dan rate limiting |
| **Payment Gateway** | Mayar API (`api.mayar.id`) | Transaksi paket undangan online (QRIS, VA, E-Wallet) + Webhook |
| **CDN & Storage** | GitHub Storage API / jsDelivr / Cloudflare R2 | Penyimpanan aset gambar, musik, dan template undangan statis |
| **Runtime Target** | Cloudflare Workers / Node.js | Multi-runtime deployment dengan edge compatibility |

---

## 📁 Struktur Peta Direktori `src/`

```
src/
├── assets/             # Gambar statis, logo, hero banner, dan mockup UI
├── components/         # Komponen React modular (Admin, Landing, UI Primitives, Wedding)
│   ├── admin/          # Komponen khusus panel admin (Asset Detective, CDN uploader)
│   ├── landing/        # Komponen modular halaman promosi / landing page
│   ├── ui/             # Desain sistem & 35+ komponen primitif Shadcn UI
│   └── wedding/        # Komponen interaktif undangan (Musik, Amplop, Buku Tamu, dll)
├── data/               # Manifest blog, mock datasets, dan domain TypeScript types
├── functions/          # TanStack Start Server Functions (`createServerFn`) / RPC Bridge
├── hooks/              # Custom React hooks (useIsMobile, dll)
├── lib/                # Library utilitas inti, AI diff, Drizzle DB, dan Redis client
│   ├── ai/             # AI Visual Diff & multi-modal template inspection
│   ├── db/             # Drizzle client, full relational schema, dan database seeders
│   └── redis/          # Upstash Redis client dengan helper cached & invalidate
├── private/            # Metadata internal & Graphify code intelligence graph
├── routes/             # 70+ File-based routes (TanStack Router: /, /dasbor, /admin, /demo)
├── server/             # Pure TypeScript backend service layer (Zero React)
├── store/              # Client-side global state management (React Context / useAppStore)
├── routeTree.gen.ts    # Auto-generated route tree oleh TanStack Router (JANGAN EDIT MANUAL)
├── router.tsx          # Konfigurasi router instance & React Query integration
├── server.ts           # Server entrypoint (Cloudflare fetch handler, API & static routes)
├── start.ts            # Konfigurasi middleware TanStack Start (CSRF & Error Boundary)
└── styles.css          # Desain sistem global, token warna, typography, dan animasi
```

---

## 🔄 Alur Data & Siklus Permintaan (Request Lifecycle)

```
[Browser / Klien]
        │
        ▼ (HTTP Request / Navigasi)
[src/server.ts] ───(Jika file statis /demo/*)───► Cloudflare ASSETS / Local File
        │
        ├─► (Jika POST /api/payments/*) ───────► Handler Mayar Checkout/Webhook
        │
        ▼ (SSR / Navigasi Halaman)
[src/start.ts] (Error Middleware & CSRF Protection)
        │
        ▼
[src/routes/__root.tsx] (App Shell, QueryClientProvider, AppProvider, Toaster)
        │
        ▼
[src/routes/*.tsx] (Halaman Spesifik)
        │
        ├── Klien Interaktif ──► [src/components/*] & [src/store/appStore.tsx]
        │
        └── Ambil / Mutasi Data ──► [src/functions/*.ts] (`createServerFn`)
                                            │
                                            ▼ (RPC Boundary)
                                    [src/server/*.ts] (Service Layer)
                                            │
                                    ┌───────┴───────┐
                                    ▼               ▼
                        [src/lib/redis/client.ts] [src/lib/db/client.ts]
                                    │               │
                                    ▼               ▼
                              Upstash Redis   Neon PostgreSQL
```

---

## 📜 Deskripsi File Root di `src/`

### 1. `src/router.tsx`
* **Fungsi:** Menginisialisasi router TanStack Start melalui `getRouter()`.
* **Karakteristik:** Mengintegrasikan `QueryClient` dari `@tanstack/react-query`, mengaktifkan `scrollRestoration: true`, dan menyetel `defaultPreloadStaleTime: 0`.

### 2. `src/start.ts`
* **Fungsi:** Konfigurasi server runtime untuk TanStack Start via `createStart()`.
* **Karakteristik:**
  * `errorMiddleware`: Menangkap unhandled SSR error dan mengembalikan halaman error elegan via `renderErrorPage()`.
  * `csrfMiddleware`: Proteksi CSRF otomatis khusus untuk eksekusi `serverFn`.

### 3. `src/server.ts`
* **Fungsi:** Server entrypoint multi-runtime (Cloudflare Workers & Node.js).
* **Fitur Utama:**
  * Normalisasi environment variables dari Cloudflare `env` ke `process.env`.
  * Redirect canonical domain `www.simfonicinta.my.id` ➔ `simfonicinta.my.id` (301).
  * Static file server untuk folder `/demo/` dan ekstensi aset umum (gambar, audio, font, video).
  * Endpoint REST native:
    * `POST /api/payments/checkout`: Inisialisasi pembayaran Mayar.
    * `GET / POST /api/payments/webhook`: Webhook listener pembayaran Mayar berautentikasi token untuk aktivasi entitlement paket otomatis.
  * SSR Error Normalizer: Mencegah h3 swallowed error agar halaman error tetap tampil ramah pengguna.

### 4. `src/routeTree.gen.ts`
* **Fungsi:** Manifest pohon rute otomatis yang di-generate oleh CLI TanStack Router.
* **Perhatian:** File ini otomatis diperbarui saat file baru ditambahkan di `src/routes/`. **Dilarang diedit manual**.

### 5. `src/styles.css`
* **Fungsi:** Global stylesheet yang mendefinisikan custom CSS variables, palet warna elegan bertema pernikahan, font `@font-face`, utilitas glassmorphism, dan keyframe animasi.

---

## 🛡️ Prinsip & Konvensi Wajib untuk AI

1. **Strict Zero Comments (Nokomen):**
   * DILARANG menambahkan komentar (`//`, `/* */`, `<!-- -->`) ke dalam kode sumber (`.ts`, `.tsx`, `.css`). Kode harus ekspresif, rapi, dan self-documenting.
2. **Strict Zero Hardcoded Secrets:**
   * Kredensial (API Key Mayar, Token GitHub, Connection String Neon, Upstash Token) WAJIB dibaca secara eksklusif dari `process.env` atau file `.env`.
3. **Pemisahan Server vs Klien:**
   * Kode pada `src/server/` murni backend TypeScript (tidak boleh memuat hook React atau elemen DOM).
   * Akses dari UI ke database WAJIB melewati RPC bridge `src/functions/` via `createServerFn`.
4. **Caching Disiplin:**
   * Query database yang sering dibaca (Settings, Daftar Template, Quotes, Doa) wajib dibungkus fungsi `cached()` dari `@/lib/redis/client` dan di-`invalidate()` saat terjadi mutasi data.
