# 📊 `src/data/` — Data Tier, Manifests & Domain TypeScript Types

Direktori ini berfungsi sebagai pusat kontrak tipe data (*TypeScript types*), dataset uji (*mock data*), dan indeks konten statis (*content manifest*) yang digunakan di seluruh aplikasi Simfoni Cinta.

---

## 📋 Inventaris File

| File | Format | Ukuran | Peran & Deskripsi Fungsional |
|---|---|---|---|
| `mockData.ts` | TypeScript | ~18 KB (840 baris) | Master definisi TypeScript types entitas domain aplikasi, fungsi helper CRUD memori, serta dataset mock awal untuk pengujian offline dan fallback database. |
| `blog-manifest.json` | JSON | ~3.5 MB (69K+ baris) | Indeks metadata komprehensif ribuan artikel blog pernikahan (slug, judul, kategori, ringkasan, thumbnail, waktu baca, tanggal, tags, dan keywords SEO). |

---

## 🧬 Tipe Data Domain Utama (`mockData.ts`)

Berikut tipe data inti yang diekspor dari `mockData.ts` dan digunakan lintas komponen serta server:

| Type Name | Properti Kunci | Deskripsi Entitas |
|---|---|---|
| `Role` | `"admin" \| "user"` | Hak akses pengguna sistem. |
| `User` | `id`, `name`, `email`, `role`, `tier`, `invitations`, `quota`, `status`, `joined` | Profil akun pengguna, status tier langganan, dan kuota undangan. |
| `Invitation` | `id`, `slug`, `title`, `groom`, `bride`, `template`, `status`, `views`, `date`, `ownerId` | Data entitas website undangan pernikahan digital. |
| `Template` | `id`, `name`, `slug`, `tag`, `category`, `theme`, `thumb` | Definisi tema desain undangan (Tradisional, Modern, Signature, Religius, Artistik). |
| `Prayer` | `id`, `title`, `category`, `original`, `latin`, `translation` | Doa dan ucapan pernikahan lintas agama (Islam, Kristen, Katolik, Hindu, Buddha). |
| `Quote` | `id`, `content`, `author`, `source`, `category` | Kutipan mutiara asmara & pernikahan dari tokoh terkenal atau kitab suci. |
| `SacredText` | `id`, `surah`, `ayah`, `arabic`, `translation`, `religion` | Ayat suci Al-Qur'an (misal Ar-Rum: 21) atau Alkitab (misal 1 Korintus 13). |
| `Music` | `id`, `title`, `artist`, `duration`, `url`, `genre` | Track audio instrumen romantis untuk latar belakang undangan. |
| `Asset` | `id`, `name`, `type`, `url`, `size`, `uploadedAt` | File media yang diunggah pengguna (foto prewedding, ornamen, banner). |
| `RSVP` | `id`, `invitationId`, `name`, `attendance`, `guests`, `message`, `createdAt` | Konfirmasi kehadiran dan ucapan dari tamu undangan. |
| `Order` | `id`, `userId`, `packageId`, `amount`, `status`, `paymentMethod`, `createdAt` | Catatan transaksi pembelian paket undangan via Mayar. |
| `Guest` | `id`, `invitationId`, `name`, `phone`, `category`, `status`, `qrCode` | Data tamu undangan untuk distribusi WhatsApp dan scan QR kehadiran. |

---

## 💡 Panduan untuk AI
* Saat membutuhkan tipe entitas aplikasi, selalu import dari `@/data/mockData` atau skema database `@/lib/db/schema`.
* `blog-manifest.json` dibaca oleh route `src/routes/berita.*` untuk merender katalog blog edukasi pernikahan dan halaman artikel detail secara cepat tanpa overhead query database.
