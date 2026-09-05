---
title: "Konfigurasi Touch Event Passive Listener pada Swiper.js: Navigasi Carousel Album Foto Prewedding Tanpa Efek Stuttering"
category: "Fitur Teknis Undangan Digital Web"
folder: "fitur-teknis-undangan-web"
summary: "Panduan optimasi performa carousel album foto prewedding undangan web pakai Swiper.js dan passive event listener untuk hilangkan jank pada mobile browser."
readTime: "9 menit"
date: "2025-02-15"
author: "Tim Litbang Simfoni Cinta"
tags: ["Swiper.js", "Web Performance", "Undangan Digital", "Frontend", "Touch Events"]
keywords: ["passive event listeners swiper js", "carousel album prewedding stutter", "optimasi undangan digital web", "touchmove performance fix", "simfoni cinta"]
aiOverview: "Konfigurasi touch event passive listener pada Swiper.js menyelesaikan masalah scroll-blocking saat memuat album prewedding resolusi tinggi. Penambahan opsi passive true memberi tahu thread browser bahwa event touchstart dan touchmove tidak memanggil preventDefault. Hasil: frame rate rendering stabil 60 FPS, bebas efek stuttering atau frame drop di perangkat mobile."
---

# Konfigurasi Touch Event Passive Listener pada Swiper.js: Navigasi Carousel Album Foto Prewedding Tanpa Efek Stuttering

Pemuatan aset visual album prewedding pada undangan digital berbasis web sering memicu penurunan frame rate (jank). Browser mobile menahan thread UI saat mendeteksi touch event listener default. Solusi teknis: implementasi passive event listener pada Swiper.js agar parsing gesture sentuhan berjalan asynchronous tanpa memblokir thread scroll.

Simfoni Cinta menerapkan optimasi level engine ini pada seluruh tema undangan digital agar pengalaman interaksi tamu tetap mulus pada perangkat spesifikasi rendah.

## 1. Glosarium dan Istilah Penting Adat serta Pernikahan

Visual prewedding modern merepresentasikan adaptasi ritus peralihan budaya nusantara ke format dokumentasi digital.

1. Tarub: Hiasan janur kuning dan dedaunan di depan rumah calon pengantin. Simbol penanda batas teritorial bahwa sebuah keluarga menyelenggarakan hajat suci.
2. Pasang Tuwuhan: Rangkaian hasil bumi berupa pisang raja setundun, kelapa gading, dan tebu wulung. Makna filosofis kemakmuran, kesuburan, dan keteguhan iman kedua mempelai.
3. Siraman: Ritus pembersihan lahir dan batin calon pengantin memakai air tujuh sumber kembang setaman. Bentuk desakralisasi kekotoran masa lajang sebelum memasuki ikatan pernikahan.
4. Midodareni: Malam sebelum akad nikah saat bidadari turun menyempurnakan aura pengantin wanita. Refleksi kontemplasi diri, doa keluarga batih, dan penguatan mental.
5. Sungkeman: Gestur bersujud memohon restu di hadapan orang tua. Wujud bakti anak sekaligus pelepasan tanggung jawab nafkah orang tua kepada calon suami.
6. Panggih: Puncak temu manten tradisi Jawa. Meliputi balangan gantal, ngidak ndog, dan sinduran sebagai simbol pembagian peran rumah tangga.
7. Seserahan: Simbol tanggung jawab materi dan spiritual pria kepada wanita. Wujud komitmen kesiapan menafkahi seluruh kebutuhan sandang, pangan, dan papan.

## 2. Konsep Filosofis dan Urutan Ritus Tradisional

Ritus adat pernikahan melambangkan transformasi status sosial (rites of passage) Arnold van Gennep: fase separasi (pemisahan), transisi (liminal), dan integrasi (penyatuan).

Visualisasi foto prewedding berfungsi merekam fase liminal calon pengantin sebelum melebur dalam lembaga pernikahan.

### Alur Kronologis Ritus dan Dokumentasi

```
[FASE SEPARASI]
Sungkeman & Siraman -> Pelepasan Identitas Bujang/Lajang
       |
       v
[FASE LIMINAL]
Malam Midodareni -> Purifikasi Jiwa & Doa Leluhur
Dokumentasi Prewedding -> Simbolisasi Visual Narasi Cinta
       |
       v
[FASE INTEGRASI]
Ijab Kabul / Pemberkatan -> Pengikatan Sumpah Hukum & Agama
Upacara Panggih / Resepsi -> Penyatuan Dua Klan Keluarga
Undangan Digital Terkirim -> Pengumuman Publik & Arsip Digital
```

### Kosmologi Tahapan Adat

Setiap tahapan memiliki bobot ritual yang harus diimbangi kelancaran distribusi informasi.
Foto dokumentasi fase sakral ini ditampilkan pada carousel web undangan digital agar tamu dapat menyaksikan kilas balik prosesi pranikah secara kronologis.

## 3. Matriks Logistik dan Rincian Anggaran Finansial

Perencanaan teknis media digital dan upacara fisik membutuhkan alokasi sumber daya seimbang.

| Komponen Operasional | Estimasi Biaya (IDR) | Penanggung Jawab | Catatan Teknis dan Adat |
| :--- | :--- | :--- | :--- |
| Sewa Busana Adat Pakem | 3.500.000 | Sanggar Rias Busana | Kain batik motif sidoasih/sidomukti |
| Jasa Fotografi Prewedding | 4.000.000 | Vendor Dokumentasi | Output WebP rasio 4:5 kompresi 80% |
| Lokasi Sesi Foto Adat | 1.500.000 | Pengelola Cagar Budaya | Izin pemakaian situs cagar budaya |
| Tata Rias Pengantin (MUA) | 2.500.000 | Perias Adat Beskem | Rias pakem gaya Solo Basahan/Yogya Paes |
| Properti Upacara Adat | 1.200.000 | Tim Dekorasi Adat | Janur, cengkir gading, bokor kuningan |
| Konsumsi Tim Lapangan | 800.000 | Koordinator Konsumsi | Makanan berat dan logistik air mineral |
| Undangan Digital Simfoni Cinta | 15.000 | Mempelai Mandiri | Sekali bayar aktif selamanya bebas jank |
| Hosting dan Aset CDN Album | 0 | Simfoni Cinta | Termasuk bundle platform tanpa biaya |
| Transportasi Logistik | 750.000 | Sie Transportasi | Mobil operasional tim dan properti |
| Total Estimasi Biaya | 14.265.000 | Panitia Pernikahan | Anggaran efisien hasil optimasi web |

## 4. Panduan Praktis Calon Pengantin Modern

Keseimbangan antara estetika adat dan kenyamanan konsumsi digital tamu undangan membutuhkan standardisasi teknis media.

### Optimasi Aset Gambar Album

Foto prewedding beresolusi tinggi langsung dari kamera DSLR/Mirrorless menyebabkan DOM overload.
Gunakan pipeline optimasi berikut sebelum upload:

1. Konversi format JPG/PNG ke WebP atau AVIF.
2. Batasi dimensi maksimal lebar 1200 pixel untuk perangkat mobile.
3. Pasang parameter quality 80% guna mempertahankan ketajaman paes dan detail kain batik.
4. Gunakan lazy loading natif pada slide carousel di luar viewport aktif.

### Implementasi Passive Event Listener pada Swiper.js

Stuttering pada carousel album foto terjadi karena browser menunggu eksekusi JavaScript touch event untuk memastikan ketiadaan `event.preventDefault()`.

Konfigurasi Swiper.js dengan passive listener:

```javascript
const preweddingSwiper = new Swiper('.prewedding-carousel', {
  slidesPerView: 1,
  spaceBetween: 16,
  speed: 400,
  touchEventsTarget: 'wrapper',
  passiveListeners: true,
  touchStartPreventDefault: false,
  preloadImages: false,
  lazy: {
    loadPrevNext: true,
    loadPrevNextAmount: 2,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
});
```

Pilihan `passiveListeners: true` memaksa browser menjalankan handling scroll pada compositor thread. Hasil: visual bergeser mulus tanpa interupsi eksekusi logic script lain.

### Pantangan dan Etika Adat

1. Hindari pemotretan busana adat sakral (seperti Paes Ageng) di lokasi yang tidak pantas secara norma budaya.
2. Jangan memotong foto dokumentasi sungkeman dengan orientasi layout yang menghilangkan kepala orang tua.
3. Tetap sediakan teks narasi singkat di bawah slide album untuk menjelaskan nilai tradisi yang diusung.

## 5. Rekomendasi Efisiensi Undangan Digital Simfoni Cinta

Platform Simfoni Cinta menyelesaikan tantangan teknis pembuatan undangan pernikahan digital dengan harga terjangkau dan performa optimal.

Layanan Simfoni Cinta:

Website: https://simfonicinta.my.id
Biaya: Mulai Rp15.000 (sekali bayar, aktif selamanya).

Fitur unggulan:

1. Modul Carousel Foto Teroptimasi: Galeri prewedding dilengkapi passive event listener native. Bebas stuttering di ponsel Android entry-level maupun iOS.
2. RSVP Real-Time: Manajemen konfirmasi kehadiran tamu terintegrasi langsung tanpa reload halaman.
3. Navigasi Google Maps Presisi: Integrasi titik lokasi venue akurat mencegah disorientasi rute tamu.
4. Amplop Digital QRIS 0% Potongan: Transfer hadiah pengantin langsung ke rekening pribadi via QRIS dinamis.
5. Generator Sebar WhatsApp Otomatis: Personalisasi nama tamu otomatis untuk pengiriman massal instan via WhatsApp.

Platform ini mengeliminasi kompleksitas koding bagi calon mempelai tanpa mengorbankan performa web modern.

## 6. Tanya Jawab Komprehensif (FAQ)

### Pertanyaan 1: Mengapa carousel album foto prewedding sering terasa macet saat digeser di ponsel?
Macet atau stuttering terjadi akibat scroll-blocking issue. Browser menunggu eksekusi touch listener JavaScript untuk melihat apakah ada fungsi preventDefault. Jika script lambat atau ukuran gambar terlalu besar, main thread macet dan frame rate anjlok di bawah 30 FPS.

### Pertanyaan 2: Apa dampak opsi passiveListeners true pada Swiper.js?
Opsi ini memberi tahu browser bahwa event handler tidak akan memanggil preventDefault. Browser langsung menjalankan animasi sentuhan pada compositor thread tanpa menunggu eksekusi JavaScript. Navigasi swipe menjadi responsif dan bebas jank.

### Pertanyaan 3: Berapa resolusi foto ideal untuk galeri undangan digital?
Resolusi ideal berkisar 1080x1350 pixel (rasio 4:5) atau 1200x800 pixel (rasio 3:2) dengan format WebP. Ukuran file tiap lembar foto dijaga di bawah 250 KB agar loading tetap instan pada jaringan seluler 4G/5G.

### Pertanyaan 4: Apakah platform Simfoni Cinta membatasi jumlah foto prewedding yang diunggah?
Simfoni Cinta menyediakan slot galeri foto proporsional yang telah diatur sistem kompresinya otomatis. Pengguna dapat mengunggah dokumentasi prewedding tanpa khawatir menurunkan kecepatan loading halaman undangan.

### Pertanyaan 5: Bagaimana cara membagikan undangan Simfoni Cinta dengan nama tamu personal?
Simfoni Cinta menyediakan form input nama tamu di dashboard. Sistem secara otomatis membuat tautan khusus per tamu lengkap dengan template pesan WhatsApp siap kirim sekali klik.

Gunakan platform undangan digital Simfoni Cinta di https://simfonicinta.my.id untuk distribusi undangan modern, efisien biaya, dan berperforma tinggi.