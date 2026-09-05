# 🗄️ `src/lib/db/` — Database Layer (Neon Serverless PostgreSQL & Drizzle ORM)

Direktori ini bertanggung jawab atas seluruh layer persistensi data relasional menggunakan **Neon Serverless PostgreSQL** via koneksi HTTP cepat (`@neondatabase/serverless`) dan **Drizzle ORM** (`drizzle-orm/neon-http`).

---

## 📋 Inventaris Modul

| File | Peran & Deskripsi Fungsional |
|---|---|
| `client.ts` | Inisialisasi koneksi database Drizzle (`db`) dan Neon SQL executor (`sql`). Menggunakan **Proxy Pattern** yang aman dari crash: jika `DATABASE_URL` belum disetel (mode offline / dev awal), sistem mengembalikan *chained fallback proxy* agar build/server tidak down seketika. |
| `schema.ts` | Definisi 25 tabel database relasional lengkap dengan tipe data pgTable (text, integer, timestamp, boolean, jsonb), primary key, relasi, dan default values. |
| `seed.ts` | Skrip seeder master untuk menginisialisasi akun admin default, paket harga, template awal, kategori doa, kutipan asmara, dan ayat suci ke database Neon yang masih kosong. |

---

## 🗂️ Peta 25 Tabel Skema Database (`schema.ts`)

| Kategori | Nama Tabel | Keterangan & Entitas yang Disimpan |
|---|---|---|
| **Akun & Sesi** | `users` | Pengguna platform (nama, email, role `admin`/`user`, tier `Free`/`Gold`/`Platinum`/`Owner`, kuota undangan). |
| **Undangan** | `invitations` | Entitas website undangan (slug, nama pengantin pria & wanita, tanggal resepsi, tema terpilih, status draf/aktif). |
| | `coupleProfiles` | Detail profil mendalam mempelai (orang tua, akun IG, foto profil). |
| **Katalog & Template** | `templates` | Data tema undangan (nama, slug, thumbnail, kategori, varian warna). |
| | `templateCategories`| Kategori tema (Tradisional, Modern, Religius, Rustic, Minimalis). |
| | `templateAssetFolders` | Folder virtual per kategori aset pada template Asset Detective. |
| | `templateAssetItems` | File aset individual (gambar, css, js, webp, mp3) dan status sinkronisasi CDN. |
| **Konten Pernikahan** | `prayers` | Doa dan ucapan pernikahan lintas agama (Islam, Kristen, Hindu, Buddha). |
| | `quotes` | Kutipan mutiara asmara & janji suci pernikahan. |
| | `sacredTexts` | Teks suci (Surah Al-Qur'an / Ayat Alkitab) beserta terjemahan Indonesia. |
| | `music` | Daftar instrumen musik romantis MP3 beserta durasi dan genre. |
| | `assets` | Galeri media foto prewedding dan file upload pengguna. |
| **Interaksi Tamu** | `rsvps` | Konfirmasi kehadiran tamu umum dan ucapan selamat. |
| | `guests` | Buku tamu undangan via nomor WhatsApp dan link personalisasi unik. |
| **Transaksi & Akses** | `orders` | Pesanan pembelian paket undangan. |
| | `payments` | Log riwayat pembayaran transaksi Mayar Payment Gateway. |
| | `templatePurchases` | Catatan aktivasi template/paket berbayar per akun. |
| | `entitlements` | Hak akses fitur dan kuota pembuatan undangan resmi (*entitlement ledger*). |
| **Buku Tamu Digital** | `guestbookEvents` | Event resepsi buku tamu digital terpisah. |
| | `guestCategories` | Kategori tamu khusus (VIP, Keluarga, Sahabat, Rekan Kerja). |
| | `eventGuests` | Tamu teregistrasi dengan token QR Code unik untuk scan resepsionis. |
| | `attendanceLogs` | Log waktu nyata check-in kehadiran tamu di meja resepsionis (via scanner QR). |
| | `guestbookMessages` | Doa dan pesan ucapan tamu buku tamu digital beserta status moderasi. |
| | `guestbookActivityLogs` | Audit trail aktivitas buku tamu digital. |
| **Konfigurasi Sistem** | `adminSettings` | Konfigurasi master platform (navigasi, FAQ, testimonial, paket harga, SEO, WA blast). |

---

## 💡 Panduan untuk AI
* Selalu import objek database dari `@/lib/db/client`:
  ```tsx
  import { db } from "@/lib/db/client";
  import { users, invitations } from "@/lib/db/schema";
  import { eq } from "drizzle-orm";
  ```
* Dilarang keras menaruh connection string database mentah di dalam file kode. Wajib selalu membaca dari `process.env.DATABASE_URL`.
* Saat mengubah skema di `schema.ts`, pastikan tabel yang berelasi memperhitungkan `onDelete: "cascade"` jika diperlukan integritas data.
