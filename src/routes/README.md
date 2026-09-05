# 🛣️ `src/routes/` — TanStack Router File-Based Routing Map

Direktori ini mendefinisikan seluruh rute halaman aplikasi Simfoni Cinta menggunakan sistem **File-Based Routing** dari **TanStack Router / TanStack Start**. Setiap file `.tsx` di sini memetakan URL spesifik di browser.

> ⚠️ **Aturan Penting:**
> * File manifest `src/routeTree.gen.ts` digenerate secara otomatis oleh TanStack Router. **DILARANG mengedit `routeTree.gen.ts` secara manual**.
> * Layout root satu-satunya yang membungkus seluruh aplikasi adalah `src/routes/__root.tsx`.
> * Jangan membuat direktori `src/pages/` atau konvensi Next.js `app/layout.tsx`.

---

## 🗺️ Peta Lengkap Rute Halaman (70+ Routes)

### 1. Halaman Publik & Autentikasi
| File Rute | URL Path | Akses | Peran & Konten Halaman |
|---|---|---|---|
| `__root.tsx` | App Shell | Publik | Root layout: HTML `<head>`, Google Fonts, Meta SEO, Provider (`QueryClient`, `AppProvider`), dan Toast `Toaster`. |
| `index.tsx` | `/` | Publik | Landing page utama: Hero animasi, katalog tema, bento fitur, komparasi harga, testimonial, dan FAQ. |
| `fitur.tsx` | `/fitur` | Publik | Halaman komparasi fitur mendalam antar paket (Silver vs Gold vs Platinum). |
| `login.tsx` | `/login` | Publik | Halaman masuk pengguna (Magic link, OTP email, atau Google OAuth). |
| `masuk.tsx` | `/masuk` | Publik | Alias rute login untuk kompatibilitas tautan pemasaran berbahasa Indonesia. |
| `$.tsx` | `/*` (Splat) | Publik | Halaman 404 Not Found kustom jika rute tidak ditemukan. |

---

### 2. Katalog Tema & Demo Undangan (`/demo/*`)
| File Rute | URL Path | Akses | Peran & Konten Halaman |
|---|---|---|---|
| `demo.index.tsx` | `/demo` | Publik | Galeri interaktif seluruh tema undangan pernikahan yang dapat difilter per kategori. |
| `demo.$slug.tsx` | `/demo/:slug` | Publik | Halaman live preview tema undangan pernikahan (menampilkan audio, amplop digital, hitung mundur, dan galeri). |

---

### 3. Portal Berita & Edukasi Pernikahan (`/berita/*`)
| File Rute | URL Path | Akses | Peran & Konten Halaman |
|---|---|---|---|
| `berita.index.tsx` | `/berita` | Publik | Katalog artikel blog, inspirasi pernikahan, tips rundown, dan panduan WO. Membaca metadata dari `blog-manifest.json`. |
| `berita.$slug.tsx` | `/berita/:slug` | Publik | Halaman pembaca artikel lengkap dengan dukungan rich snippet schema SEO, estimasi waktu baca, dan tombol share. |

---

### 4. Panel Pengguna (`/dasbor/*`)
*Layout Shell:* `dasbor.tsx` (menyediakan sidebar navigasi dasbor, header profil, dan proteksi sesi login).

| File Rute | URL Path | Peran & Konten Halaman |
|---|---|---|
| `dasbor.index.tsx` | `/dasbor` | Beranda ringkasan dasbor: status undangan aktif, kuota WA, jumlah ucapan, dan tombol aksi cepat. |
| `dasbor.undangan.index.tsx` | `/dasbor/undangan` | Daftar seluruh undangan pernikahan yang dibuat oleh akun pengguna. |
| `dasbor.undangan.$id.tsx` | `/dasbor/undangan/:id` | Editor kustomisasi teks, tanggal, musik, dan tema undangan tertentu. |
| `dasbor.mempelai.tsx` | `/dasbor/mempelai` | Editor profil kedua mempelai (nama lengkap, nama panggilan, orang tua, foto, akun media sosial). |
| `dasbor.acara.tsx` | `/dasbor/acara` | Form jadwal acara: Akad Nikah, Pemberkatan, Resepsi, alamat venue, dan pin Google Maps. |
| `dasbor.cerita.tsx` | `/dasbor/cerita` | Editor perjalanan kisah cinta (*Love Story Timeline*). |
| `dasbor.galeri.tsx` | `/dasbor/galeri` | Pengelola album foto prewedding dan video YouTube embed. |
| `dasbor.hadiah.tsx` | `/dasbor/hadiah` | Pengaturan amplop digital: rekening bank pengantin, dompet digital, dan gambar QRIS. |
| `dasbor.tamu.tsx` | `/dasbor/tamu` | Manajemen buku tamu, import Excel/CSV, dan pembuatan link undangan personal (`?to=NamaTamu`). |
| `dasbor.sebar.tsx` | `/dasbor/sebar` | Generator teks WhatsApp blast undangan otomatis dengan template nama tamu dinamis. |
| `dasbor.template.tsx` | `/dasbor/template` | Pemilih tema desain untuk diaplikasikan ke undangan aktif. |
| `dasbor.paket.tsx` | `/dasbor/paket` | Halaman upgrade paket langganan (Silver, Gold, Platinum) dengan tombol checkout Mayar. |
| `dasbor.pembelian.tsx` | `/dasbor/pembelian` | Riwayat transaksi pembelian paket dan halaman tujuan redirect sukses dari Mayar. |
| `dasbor.profil.tsx` | `/dasbor/profil` | Pengaturan akun pengguna, ganti nama, email, dan keamanan. |

---

### 5. Modul Buku Tamu Digital VIP (`/dasbor/buku-tamu/*`)
*Layout Shell:* `dasbor.buku-tamu.$eventId.tsx` (khusus acara resepsi yang aktif).

| File Rute | URL Path | Peran & Konten Halaman |
|---|---|---|
| `dasbor.buku-tamu.index.tsx` | `/dasbor/buku-tamu` | Indeks daftar event buku tamu digital pengguna. |
| `dasbor.buku-tamu.$eventId.index.tsx` | `/dasbor/buku-tamu/:eventId` | Layar sambutan tamu waktu nyata (*Live Kiosk Welcoming Screen*) untuk layar proyektor venue. |
| `dasbor.buku-tamu.$eventId.kehadiran.tsx` | `/dasbor/buku-tamu/:eventId/kehadiran` | Scanner QR Code kamera untuk staf resepsionis mencatat kehadiran tamu seketika. |
| `dasbor.buku-tamu.$eventId.tamu.index.tsx` | `/dasbor/buku-tamu/:eventId/tamu` | Buku tamu terdaftar khusus untuk event resepsi terpilih. |
| `dasbor.buku-tamu.$eventId.tamu.$guestId.tsx` | `/dasbor/buku-tamu/:eventId/tamu/:guestId` | Kartu tamu detail, nomor meja (*table number*), status VIP, dan tombol cetak barcode. |
| `dasbor.buku-tamu.$eventId.ucapan.tsx` | `/dasbor/buku-tamu/:eventId/ucapan` | Moderasi ucapan dan doa yang masuk dari tamu pada layar live. |
| `dasbor.buku-tamu.$eventId.analitik.tsx` | `/dasbor/buku-tamu/:eventId/analitik` | Grafik dan statistik kehadiran real-time (jumlah hadir, belum hadir, tamu VIP, kurva jam kedatangan). |
| `dasbor.buku-tamu.$eventId.log.tsx` | `/dasbor/buku-tamu/:eventId/log` | Audit trail riwayat scan resepsionis per detik. |
| `dasbor.buku-tamu.$eventId.pengaturan.tsx` | `/dasbor/buku-tamu/:eventId/pengaturan` | Konfigurasi mode resepsionis, hak akses operator, dan suara notifikasi scan. |

---

### 6. Panel Kontrol Administrator (`/admin/*`)
*Layout Shell:* `admin.tsx` (proteksi ketat: hanya akun dengan `role === "admin"` yang diizinkan mengakses).

| File Rute | URL Path | Peran & Konten Halaman |
|---|---|---|
| `admin.index.tsx` | `/admin` | Metrik platform: total pengguna, pendapatan kotor (revenue Mayar), pesanan aktif, total undangan. |
| `admin.arsitektur.tsx` | `/admin/arsitektur` | Visualisasi interaktif struktur arsitektur kode (God Nodes, dependensi, dan graf modul via Graphify). |
| `admin.pengguna.*` | `/admin/pengguna[/baru \| /:id]` | Manajemen akun user, pemberian kuota khusus, dan penetapan tier (Gold/Platinum/Owner). |
| `admin.undangan.*` | `/admin/undangan[/baru \| /:id]` | Pengawasan seluruh undangan pengguna dan moderasi konten terlarang. |
| `admin.template.*` | `/admin/template[/upload \| /:id]` | Manajemen katalog tema, upload file ZIP template baru, dan status rilis. |
| `admin.templates-ai.tsx` | `/admin/templates-ai` | AI Template Studio: editor & generator undangan otomatis berbasis Master Presets (dibuka via tab baru dari sidebar). |
| `admin.deteksi-aset.index.tsx` | `/admin/deteksi-aset` | Tool Asset Detective: inspeksi file template, folder virtual, dan sinkronisasi ke CDN. |
| `admin.aset.index.tsx` | `/admin/aset` | Pengelola aset global platform. |
| `admin.galeri-aset.*` | `/admin/galeri-aset[/upload]` | Manajemen media library bersama. |
| `admin.musik.*` | `/admin/musik[/baru]` | Pustaka instrumen musik latar (tambah track MP3, atur judul & artis). |
| `admin.quotes.*` | `/admin/quotes[/baru]` | Pustaka kutipan romantis pernikahan. |
| `admin.doa.*` | `/admin/doa[/baru \| /:id]` | Pustaka doa pernikahan lintas agama. |
| `admin.surat.*` | `/admin/surat[/baru]` | Pustaka ayat suci Al-Qur'an dan Alkitab. |
| `admin.transaksi.tsx` | `/admin/transaksi` | Rekonsiliasi transaksi pembayaran Mayar dan audit status pelunasan invoice. |
| `admin.rsvp.tsx` | `/admin/rsvp` | Monitoring seluruh konfirmasi kehadiran tamu platform. |
| `admin.pesan-wa.tsx` | `/admin/pesan-wa` | Template pesan WhatsApp blast default platform. |
| `admin.paket.tsx` | `/admin/paket` | Editor harga dan konfigurasi fitur paket langganan secara dinamis. |
| `admin.promosi-*` | `/admin/promosi-[template\|gambar\|video\|pengaturan]` | Suite pemasaran AI: generator copy promosi Gemini, pembuatan aset banner, dan konfigurasi marketing automation. |
| `admin.berita.tsx` | `/admin/berita` | Content Management System (CMS) artikel blog edukasi. |
| `admin.sistem.tsx` | `/admin/sistem` | Diagnostik sistem: status variabel lingkungan (.env), latensi Neon DB, status Upstash Redis, dan verifikasi API Mayar. |
| `admin.profil.tsx` | `/admin/profil` | Profil administrator master. |

---

## 💡 Konvensi Penamaan File TanStack Router
* **Titik mewakili nesting segmen:** `admin.pengguna.index.tsx` menghasilkan URL `/admin/pengguna`.
* **Awalan `$` mewakili dynamic parameter:** `admin.pengguna.$id.tsx` membaca parameter via `useParams({ from: '/admin/pengguna/$id' })`.
* **Loader Function:** Gunakan properti `loader` pada `createFileRoute` untuk prefetch data di server sebelum halaman dirender di klien.
