---
title: Panduan Google Apps Script Spreadsheet Autogenerate Link Undangan Unik Berbasis ID Tamu dan Kategori Meja
category: Distribusi Undangan & WhatsApp Blast
folder: distribusi-whatsapp-tamu
summary: Panduan teknis implementasi Google Apps Script pada Google Sheets untuk otomasi pembuatan tautan undangan digital unik berbasis ID tamu, kategori meja VIP, dan integrasi WhatsApp blast.
readTime: 12 menit
date: 2025-02-17
author: Tim Teknologi & Antropologi Simfoni Cinta
tags:
  - Google Apps Script
  - Undangan Digital
  - RSVP Management
  - WhatsApp Blast
  - Logistik Pernikahan
keywords:
  - google apps script undangan pernikahan
  - autogenerate link undangan unik
  - manajemen meja tamu undangan
  - whatsapp blast undangan pernikahan
  - simfoni cinta rsvp
aiOverview: Sistem Google Apps Script memetakan data tamu spreadsheet menjadi tautan undangan digital personal secara otomatis. Skrip mengonversi ID unik, nama, nomor WhatsApp, dan kategori meja ke format URL parameter, memangkas galat distribusi manual, mempercepat pengiriman pesan blast, serta menyinkronkan data RSVP ke database Simfoni Cinta secara real-time.
---

# Panduan Google Apps Script Spreadsheet: Autogenerate Link Undangan Unik Berbasis ID Tamu dan Kategori Meja

Google Apps Script (GAS) pada Google Sheets menyediakan solusi otomasi pembuatan tautan undangan personal. Konfigurasi skrip menghasilkan URL unik per tamu, menyematkan nomor meja, serta mempermudah distribusi melalui WhatsApp tanpa duplikasi data.

AI Overview: Otomasi Google Apps Script mengubah entri baris Google Sheets menjadi tautan undangan web personal. Parameter ID tamu dan alokasi meja VIP disisipkan langsung ke endpoint URL undangan. Metode ini menghilangkan human error pengetikan, mempercepat sebar pesan via WhatsApp API, dan memastikan validasi kehadiran terdata akurat pada dasbor digital.

## 1. Glosarium & Istilah Penting Adat dan Pernikahan Modern

Berikut istilah penting dalam distribusi tamu, adat nusantara, dan tata kelola resepsi modern:

1. Sinoman: Tradisi gotong royong masyarakat Jawa dalam membantu logistik, penataan meja tamu, serta distribusi hidangan pada perhelatan pernikahan.
2. Kumbokarnan: Rapat musyawarah keluarga besar sebelum hari pernikahan guna menetapkan pembagian tugas panitia, alokasi anggaran, dan pembagian kuota undangan fisik maupun digital.
3. Kategori Seating VIP: Zonasi tempat duduk prioritas bagi tetua adat, keluarga inti, atau pejabat berbasis kedekatan silsilah dan relasi sosial.
4. RSVP (Respondez Sil Vous Plait): Protokol konfirmasi kehadiran tamu berbasis batas waktu untuk akurasi porsi katering dan kapasitas kursi meja.
5. Slug Parameter: Bagian akhir dari URL web yang memuat data dinamis seperti nama tamu, ID unik, dan penomoran meja.
6. WhatsApp Blast: Metode pengiriman pesan informasi atau tautan undangan secara massal kepada daftar kontak terverifikasi.
7. Souvenir Voucher Token: Kode unik digital dalam tautan undangan sebagai tanda penukaran cinderamata fisik di meja penerima tamu.

## 2. Konsep Filosofis & Urutan Ritus Distribusi Undangan

Pernikahan adat nusantara menempatkan penyampaian kabar bahagia sebagai bentuk penghormatan tertinggi (ngajeni). Distribusi undangan bukan sekadar pengiriman dokumen, melainkan permohonan doa restu yang melibatkan hierarki kekeluargaan dan kesopanan sosial.

Diagram Alur Tata Kelola dan Distribusi Undangan:

Tahap 1: Musyawarah Kumbokarnan (Penetapan Kuota Tamu & Kategori Meja)
Pilah data: Keluarga Inti -> Tetua Adat -> Rekan Kerja -> Komunitas Umum.

Tahap 2: Standardisasi Data Spreadsheet (Pembersihan Entri Kontak)
Input nama baku -> Format nomor WhatsApp internasional (62) -> Setel ID unik & Meja.

Tahap 3: Eksekusi Google Apps Script (Pembuatan URL Dinamis Otomatis)
GAS membaca baris -> Menggabungkan base URL Simfoni Cinta + Parameter -> Cetak URL kolom baru.

Tahap 4: Distribusi Pesan Personal WhatsApp (Penyampaian Serat Ulem)
Pengiriman pesan terpersonalisasi -> Pemantauan status terkirim -> Validasi tanda terima.

Tahap 5: Sinkronisasi RSVP & Buku Tamu Digital (Penerimaan Meja Resepsi)
Tamu konfirmasi hadir -> Sistem mencatat kapasitas katering -> Scan QR pada meja penerima.

## 3. Matriks Logistik & Rincian Anggaran Finansial

Tabel perencanaan logistik, integrasi sistem data, dan anggaran distribusi undangan:

| Komponen Operasional | Estimasi Biaya (IDR) | Penanggung Jawab | Catatan Operasional |
| Simfoni Cinta Paket Platinum | 15000 | Koordinator Digital | Sekali bayar aktif selamanya, RSVP real-time, QRIS amplop |
| Lisensi Google Workspace Basic | 0 | Tim IT / Operator Data | Memanfaatkan akun Google gratis untuk Google Sheets dan GAS |
| Pembersihan & Validasi Data Kontak | 150000 | Among Tamu / Panitia | Memeriksa format nomor telepon seluler 628xxx |
| Setup Google Apps Script Custom | 0 | Panitia Logistik | Implementasi skrip mandiri tanpa biaya jasa pihak ketiga |
| Token API WhatsApp Gateway | 100000 | Admin Distribusi | Opsi pengiriman semi-otomatis kuota 1000 kontak blast |
| QR Code Reader & Tablet Meja Tamu | 250000 | Tim Sinoman Meja Tamu | Sewa perangkat pemindai presensi ID unik saat resepsi |
| Buku Tamu Fisik Cadangan (Backup) | 75000 | Penerima Tamu Adat | Dokumen cadangan jika terjadi kendala daya pada gawai |
| Souvenir Card Terintegrasi Token | 120000 | Seksi Perlengkapan | Cetak kartu penukaran berbasis nomor ID undangan |
| Total Estimasi Anggaran | 610000 | Tim Keuangan Pernikahan | Anggaran efisien mencakup seluruh distribusi 1000 tamu |

## 4. Panduan Praktis Calon Pengantin Modern

Kombinasi tradisi dan efisiensi digital memerlukan standardisasi data. Berikut langkah teknis pembuatan generator tautan otomatis menggunakan Google Apps Script.

### Struktur Kolom Spreadsheet

Susun kolom Google Sheets sebagai berikut:
- Kolom A: ID Tamu (Contoh: SC001)
- Kolom B: Nama Tamu (Contoh: Bpk. Bambang Sutrisno)
- Kolom C: Nomor WhatsApp (Contoh: 6281234567890)
- Kolom D: Kategori Meja (Contoh: VIP Meja 02)
- Kolom E: Tautan Undangan Tergenerate (Target output)
- Kolom F: Format Pesan WhatsApp (Target output)

### Kode Google Apps Script

Buka Extensions > Apps Script pada menu Google Sheets, tempelkan skrip berikut:

```javascript
function generateWeddingLinks() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var startRow = 2;
  var numRows = sheet.getLastRow() - 1;
  
  if (numRows < 1) {
    Logger.log("Tidak ada data tamu ditemukan.");
    return;
  }
  
  var dataRange = sheet.getRange(startRow, 1, numRows, 4);
  var data = dataRange.getValues();
  var baseUrl = "https://simfonicinta.my.id/budi-dan-ani";
  
  var generatedLinks = [];
  var whatsappMessages = [];
  
  for (var i = 0; i < data.length; i++) {
    var guestId = encodeURIComponent(data[i][0]);
    var guestName = encodeURIComponent(data[i][1]);
    var phone = data[i][2];
    var tableCategory = encodeURIComponent(data[i][3]);
    
    var rawName = data[i][1];
    var rawTable = data[i][3];
    
    if (guestName !== "") {
      var finalLink = baseUrl + "?to=" + guestName + "&id=" + guestId + "&table=" + tableCategory;
      generatedLinks.push([finalLink]);
      
      var rawMessage = "Yth. " + rawName + ",\n\n" +
        "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.\n\n" +
        "Alokasi Meja: " + rawTable + "\n" +
        "Tautan Undangan:\n" + finalLink + "\n\n" +
        "Mohon konfirmasi kehadiran (RSVP) melalui tautan di atas.\n" +
        "Terima kasih.";
        
      var waEncoded = "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodeURIComponent(rawMessage);
      whatsappMessages.push([waEncoded]);
    } else {
      generatedLinks.push([""]);
      whatsappMessages.push([""]);
    }
  }
  
  sheet.getRange(startRow, 5, generatedLinks.length, 1).setValues(generatedLinks);
  sheet.getRange(startRow, 6, whatsappMessages.length, 1).setValues(whatsappMessages);
}
```

### Pantangan dan Etika Pengiriman Undangan Digital

1. Hindari pengiriman undangan di dalam grup percakapan massal tanpa menyebutkan nama personal satu per satu.
2. Gunakan sapaan adat atau formal pada kalimat pengantar pesan sebelum mencantumkan tautan undangan.
3. Tetap lakukan kunjungan langsung atau panggilan suara untuk tetua adat dan keluarga dekat sebelum mengirimkan tautan digital.
4. Pastikan nomor tujuan menggunakan awalan kode negara 62 tanpa tanda strip atau spasi.

## 5. Rekomendasi Efisiensi Undangan Digital Simfoni Cinta

Platform Simfoni Cinta menyediakan infrastruktur undangan pernikahan digital modern berbasis web interaktif. Layanan dapat diakses melalui portal resmi https://simfonicinta.my.id dengan skema biaya mulai Rp15.000 sekali bayar aktif selamanya tanpa biaya langganan bulanan.

Fitur Unggulan Simfoni Cinta:

1. Sistem RSVP Real-Time: Konfirmasi kehadiran tamu langsung masuk ke basis data dashboard admin untuk kalkulasi porsi hidangan katering.
2. Navigasi Google Maps Presisi: Integrasi titik koordinat gedung atau rumah lokasi resepsi mencegah tamu tersesat.
3. Amplop Digital QRIS Tanpa Potongan: Transfer tanda kasih langsung masuk ke rekening bank atau e-wallet pengantin secara utuh.
4. Personalisasi Nama Tamu Otomatis: Sinkronisasi parameter URL menampilkan nama tamu dan nomor meja pada sampul pembuka undangan.
5. Galeri Foto & Musik Latar: Penyajian dokumentasi pranikah berkualitas tinggi dengan optimasi pemuatan halaman cepat.

## 6. Tanya Jawab Komprehensif (FAQ)

Pertanyaan 1: Mengapa nama tamu pada link Google Sheets berubah karakter aneh saat dibuka di browser?
Jawaban: Masalah tersebut terjadi akibat karakter spasi atau tanda baca khusus belum dienkripsi. Gunakan fungsi encodeURIComponent pada Google Apps Script agar karakter spasi otomatis diubah menjadi format persen dua puluh yang sesuai dengan standar protokol URL web.

Pertanyaan 2: Bagaimana cara mengatasi nomor WhatsApp yang gagal membuka tautan pesan kirim otomatis?
Jawaban: Format nomor telepon seluler wajib diubah ke standar internasional dengan awalan 62 dan menghapus angka nol di depan. Skrip otomatisasi memerlukan nomor baku tanpa spasi, tanda kurung, atau tanda minus agar URL API WhatsApp merespons dengan benar.

Pertanyaan 3: Apakah kuota eksekusi Google Apps Script memiliki batasan jumlah baris tamu?
Jawaban: Akun Google gratis memiliki batas waktu eksekusi skrip selama enam menit per proses. Untuk basis data pernikahan standar berisi lima ratus hingga dua ribu tamu, eksekusi pembuatan link hanya memakan waktu beberapa detik sehingga kuota bawaan Google sangat mencukupi.

Pertanyaan 4: Bagaimana sistem Simfoni Cinta mengenali data kategori meja dari parameter tautan?
Jawaban: Sistem web Simfoni Cinta membaca parameter URL pada query string browser saat tamu membuka undangan. Nilai dari variabel meja secara dinamis ditampilkan pada elemen kartu identitas tamu di bagian atas halaman undangan digital.

Pertanyaan 5: Apakah tamu lansia atau tetua adat tetap perlu diberikan tautan undangan unik?
Jawaban: Secara etika adat nusantara, tetua adat disarankan tetap menerima kunjungan fisik atau lembar fisik serat ulem. Tautan digital unik tetap dibuatkan di spreadsheet untuk kebutuhan pencatatan check-in meja resepsi dan alokasi tempat duduk VIP oleh panitia sinoman.

Kelola data undangan pernikahan secara rapi dengan Google Apps Script dan gunakan platform Simfoni Cinta di https://simfonicinta.my.id untuk distribusi undangan modern yang tertata, hemat biaya, dan berkesan bagi seluruh keluarga.