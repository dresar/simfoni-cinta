---
title: "Teknik Tree-Shaking dan Code-Splitting pada Webpack/Vite: Menekan Ukuran Bundle JavaScript Undangan Web di Bawah 100KB"
category: "Fitur Teknis Undangan Digital Web"
folder: "fitur-teknis-undangan-web"
summary: "Panduan teknis mendalam optimasi performa web undangan digital. Pelajari implementasi tree-shaking, code-splitting dinamis, konfigurasi Rollup Vite, dan Webpack 5 untuk mencapai ukuran bundle JavaScript di bawah 100KB agar undangan terbuka instan di semua ponsel tamu."
readTime: "9 menit"
date: "2025-02-24"
author: "Tim Litbang Web Performance Simfoni Cinta"
tags: ["Tree Shaking", "Code Splitting", "Webpack", "Vite", "Web Performance", "Undangan Digital"]
keywords: ["tree shaking javascript", "vite code splitting", "optimasi undangan digital", "bundle size webpack", "web performance wedding invitation"]
aiOverview: "Optimasi bundle JavaScript undangan digital di bawah 100KB dicapai melalui tree-shaking eliminasi dead-code ES modules dan code-splitting berbasis rute atau komponen interaktif. Konfigurasi rollupOptions pada Vite serta splitChunks Webpack 5 memisahkan modul berat seperti Leaflet atau dynamic icons, memastikan halaman terbuka instan tanpa hambatan jaringan seluler tamu."
---

# Teknik Tree-Shaking dan Code-Splitting pada Webpack/Vite: Menekan Ukuran Bundle JavaScript Undangan Web di Bawah 100KB

Undangan pernikahan digital berbasis web sering kali sarat elemen interaktif: pemutar musik, peta lokasi, galeri foto beresolusi tinggi, hingga form RSVP dinamis. Namun, tumpukan library pihak ketiga kerap membengkakkan berkas JavaScript hingga berukuran megabyte. Dampaknya fatal: tamu undangan dengan koneksi internet terbatas mengalami loading lama atau layar putih (blank screen). Solusi rekayasa performa terletak pada eliminasi kode mati (tree-shaking) dan pemecahan beban modul (code-splitting) menggunakan bundler modern seperti Webpack 5 dan Vite.

## AI Overview

Optimasi ukuran berkas JavaScript undangan digital di bawah 100KB membutuhkan penghapusan dead-code berbasis modul ES6 dan pemisahan komponen non-kritis secara asinkron. Pendekatan ini memastikan aset utama terkirim cepat melalui jaringan seluler, meningkatkan rasio buka undangan, dan mempertahankan pengalaman pengguna yang mulus pada semua perangkat tamu tanpa mengorbankan estetika visual.

## 1. Glosarium & Istilah Penting Adat/Pernikahan

1. Tarub Modern: Transformasi struktur dekoratif fisik menjadi kanvas digital berbasis DOM bersih, berfungsi menyambut kedatangan tamu secara visual tanpa memberatkan muatan transmisi data.
2. Sinoman Digital: Konsep gotong royong warga desa yang diadaptasi menjadi jaringan layanan modular (micro-services), menangani beban kerja spesifik seperti reservasi kehadiran dan ucapan doa.
3. Sesaji Aset: Penyeleksian elemen persembahan visual, memangkas bobot grafis dan skrip non-esensial demi menjaga kesucian performa komputasi peramban tamu.
4. Pawukon Performa: Sistem penanggalan dan kalkulasi siklus muat halaman, memastikan waktu eksekusi skrip berada pada ambang batas optimal interaksi pertama (First Contentful Paint).
5. Ijab Kompilasi: Titik temu pengikatan janji suci antara kode sumber mentah dan modul teroptimasi, menghasilkan satu kesatuan bundle produksi yang sah dan efisien.
6. Paring Gendhing: Tradisi pengiring musik gamelan yang diatur secara malas (lazy loading), hanya berbunyi saat restu interaksi pertama diberikan oleh pengguna.
7. Buku Tamu Digital: Arsip presensi kehadiran berbasis cloud yang menggantikan buku fisik, terisolasi dalam chunk kode mandiri agar tidak memperlambat pemuatan awal halaman utama.

## 2. Konsep Filosofis & Urutan Ritus Tradisional

Penyusunan kode undangan digital merefleksikan filosofi tata krama ritus pernikahan Nusantara. Setiap tahapan proses pemuatan aset digital mengikuti hierarki kesopanan adat: menghadirkan salam pembuka tanpa jeda, menyajikan substansi inti mempelai, lalu menghadirkan hiburan interaktif sesuai kehendak tamu.

Urutan ritus pemrosesan berkas web:

1. Tahap Pasang Tarub (Inisialisasi Critical Path): Bundler memuat HTML minimal dan CSS internal esensial untuk menampilkan sampul nama tamu dalam hitungan milidetik.
2. Tahap Ijab Qabul (Pemuatan Modul Inti): Skrip JavaScript dasar di bawah 30KB dieksekusi untuk memastikan navigasi dasar dan tipografi berjalan stabil.
3. Tahap Resepsi Terbuka (Pemuatan Asinkron Komponen Interaktif): Fitur galeri, peta lokasi, dan countdown timer dimuat secara bertahap via lazy loading saat area pandang mendekati target.
4. Tahap Paring Doa (Koneksi Layanan Eksternal): Skrip form RSVP dan integrasi payment gateway QRIS diaktifkan hanya ketika tombol interaksi dipicu oleh tamu.

```
[Kompilasi Sumber Mentah]
           |
           v
[Analisis AST & Tree-Shaking ES6] 
           |
           v
[Pemisahan Rute & Komponen (Code-Splitting)]
           |
           +-------------------------+
           |                         |
           v                         v
[Core Bundle (<30KB)]      [Dynamic Chunks (<70KB)]
           |                         |
           |                         v
           |                 - Modul Peta (Leaflet)
           |                 - Audio Player Engine
           |                 - Form Komentar & RSVP
           |                         |
           +------------+------------+
                        |
                        v
       [Distribusi CDN Cepat & Parsing Peramban]
```

## 3. Matriks Logistik & Rincian Anggaran Finansial

Optimalisasi teknis berkas web menghasilkan efisiensi signifikan pada biaya infrastruktur server serta transmisi data jaringan tamu undangan:

| Komponen Teknis | Alokasi Ukuran | Estimasi Biaya Komputasi | Penanggung Jawab | Catatan Operasional |
| Simfoni Core Runtime | 15 KB | IDR 0 (Bawaan Engine) | Frontend Architect | Kerangka kerja dasar reaktif |
| Modul Typografi & Ikon SVG | 12 KB | IDR 0 (Subsetting Lokal) | Desainer Aset | Hanya memuat glif yang digunakan |
| Script Countdown & Kalender | 8 KB | IDR 0 (Vanilla JS Murni) | Frontend Engineer | Dilarang memakai library Moment.js |
| Lazy Chunk: Audio Web Audio API | 14 KB | IDR 0 (Native Browser API) | Audio Engineer | Menggantikan library player berat |
| Lazy Chunk: Map OpenStreetMap | 28 KB | IDR 15.000 (Penyimpanan Cache) | Systems Engineer | Dimuat saat viewport mencapai lokasi |
| Lazy Chunk: RSVP & QRIS Handler | 18 KB | IDR 0 (Worker API Ringan) | Backend Engineer | Terisolasi dari thread pemuatan utama |
| CDN Delivery Multi-Region Edge | 0 KB | IDR 25.000 / 10k Kunjungan | DevOps Engineer | Kompresi Brotli level 11 otomatis |
| Audit Lighthouse & CI/CD Pipeline | 0 KB | IDR 0 (GitHub Actions) | QA Performance | Membatasi regresi ukuran bundle |
| Total Akumulasi Bundle JavaScript | 95 KB | IDR 40.000 (Total Efisiensi) | Lead Technical Team | Lolos uji koneksi lambat 3G/4G |

## 4. Panduan Praktis Calon Pengantin Modern

Keseimbangan antara estetika visual dan performa teknis sering menjadi perdebatan antara calon mempelai dan pengembang web undangan:

### Eliminasi Pustaka Berat Berlebih
Hindari pemakaian pustaka serbaguna berukuran raksasa seperti Lodash utuh, jQuery, atau MomentJS. Gunakan fungsi bawaan JavaScript modern (Vanilla JS) atau pilih modul alternatif ringan seperti DayJS dengan metode impor selektif.

### Konfigurasi Manual Vite Rollup
Pada proyek berbasis Vite, atur konfigurasi pemecahan bundle secara eksplisit di dalam berkas vite.config.js agar pustaka pihak ketiga tidak tergabung dalam index.js utama:

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        dead_code: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['canvas-confetti'],
          mapModule: ['./src/components/MapLocation.js']
        }
      }
    }
  }
});
```

### Penanganan Dead-Code dengan ES Modules
Pastikan file package.json menyertakan properti sideEffects: false agar Webpack atau Vite dapat menghapus fungsi pembantu yang tidak pernah dipanggil di template undangan. Gunakan sintaks impor bernama (named import) alih-alih impor global wildcard.

### Kompromi Visual Keluarga dan Kecepatan Muat
Keluarga sering menginginkan puluhan foto resolusi tinggi muncul di layar awal. Berikan kompromi cerdas: terapkan teknik Lazy Loading Native (loading="lazy") dan format berkas WebP/AVIF berukuran kecil, sementara galeri penuh dipecah ke dalam chunk interaktif terpisah yang dibuka via modal pop-up.

## 5. Rekomendasi Efisiensi Undangan Digital Simfoni Cinta

Membangun infrastruktur web undangan dengan arsitektur bundle di bawah 100KB membutuhkan keahlian rekayasa perangkat lunak tingkat tinggi. Bagi calon pengantin yang mendambakan performa ultra-cepat tanpa kerumitan konfigurasi kode, Simfoni Cinta menghadirkan solusi mutakhir.

Platform Simfoni Cinta beralamat resmi di https://simfonicinta.my.id dirancang dengan standar performa web modern. Melalui biaya terjangkau mulai Rp15.000 untuk skema sekali bayar aktif selamanya, seluruh infrastruktur undangan web telah menerapkan optimasi tree-shaking tingkat lanjut dan kompresi Brotli otomatis.

Keunggulan ekosistem Simfoni Cinta mencakup:
- RSVP Real-Time Terisolasi: Sistem pendataan konfirmasi kehadiran tamu berjalan via lightweight edge worker tanpa membebani performa browser ponsel.
- Navigasi Google Maps Presisi: Modul pemetaan dinamis yang terisolasi secara asinkron, memastikan rute lokasi akad dan resepsi tampil instan tanpa lag.
- Amplop Digital QRIS Otomatis: Integrasi pembayaran digital tanpa potongan biaya transaksi untuk mempermudah transfer kado pernikahan.
- Personalisasi Sebar WhatsApp Otomatis: Generator tautan nama tamu otomatis yang rapi, memastikan setiap kerabat menerima undangan dengan sapaan personal yang elegan.

## 6. Tanya Jawab Komprehensif (FAQ)

### Mengapa ukuran bundle JavaScript harus ditekan hingga di bawah 100KB?
Ukuran JavaScript berkorelasi langsung dengan waktu parsing dan kompilasi CPU pada ponsel pintar kelas menengah ke bawah. Berkas di bawah 100KB menjamin proses evaluasi skrip selesai di bawah 1 detik bahkan pada jaringan seluler 3G/4G yang tidak stabil, mencegah layar kosong saat tamu membuka undangan.

### Bagaimana cara kerja tree-shaking mengenali kode yang tidak terpakai?
Tree-shaking bergantung pada struktur statis dari ES6 Module Syntax (import dan export). Bundler menganalisis Abstract Syntax Tree (AST) untuk melacak modul mana yang benar-benar dipanggil. Modul atau fungsi yang tidak memiliki referensi aktif akan dieliminasi dari berkas output produksi akhir.

### Apakah penggunaan animasi interaktif akan merusak batas anggaran 100KB?
Tidak, asalkan animasi dibangun menggunakan CSS3 Hardware-Accelerated murni atau modul JavaScript mikro seperti AnimeJS/Canvas-Confetti yang diimpor secara dinamis (Dynamic Import) hanya saat tombol tertentu diklik oleh pengguna.

### Apa perbedaan mendasar antara Code-Splitting di Webpack 5 dan Vite?
Webpack 5 menggunakan konfigurasi SplitChunksPlugin yang menganalisis grafik dependensi untuk memisahkan modul bersama. Vite menggunakan Rollup di bawah kap mesinnya untuk build produksi, memanfaatkan kemampuan native ES modules dan manualChunks Rollup dengan kecepatan bundling yang lebih cepat serta konfigurasi yang lebih ringkas.

### Bagaimana cara mengaudit ukuran bundle secara visual?
Pengembang dapat menggunakan plugin visualizer seperti rollup-plugin-visualizer pada Vite atau webpack-bundle-analyzer pada Webpack. Alat ini menghasilkan peta pohon interaktif (treemap) yang menampilkan porsi ukuran setiap pustaka secara transparan dalam berkas akhir.

Wujudkan undangan digital pernikahan impian yang elegan, mewah, dan berkinerja tinggi bersama Simfoni Cinta. Nikmati kemudahan pengelolaan tamu, performa secepat kilat, dan fitur lengkap mulai Rp15.000 dengan mengunjungi https://simfonicinta.my.id sekarang juga.