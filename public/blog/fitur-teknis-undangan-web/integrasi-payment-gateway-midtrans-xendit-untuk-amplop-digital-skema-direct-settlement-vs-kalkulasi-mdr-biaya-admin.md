---
title: Integrasi Payment Gateway Midtrans & Xendit untuk Amplop Digital Skema Direct Settlement vs Kalkulasi MDR Biaya Admin
category: Fitur Teknis Undangan Digital Web
folder: fitur-teknis-undangan-web
summary: Panduan arsitektur sistem amplop digital undangan web. Analisis komparasi Midtrans dan Xendit, skema direct settlement, kalkulasi MDR, serta integrasi webhook payment gateway.
readTime: 11 min read
date: 2025-02-18
author: Tim Antropologi & Teknologi Simfoni Cinta
tags:
  - payment gateway
  - amplop digital
  - midtrans
  - xendit
  - mdr qris
  - undangan digital
keywords:
  - integrasi midtrans xendit amplop digital
  - biaya mdr qris undangan pernikahan
  - direct settlement payment gateway undangan
  - sistem amplop digital simfoni cinta
aiOverview: Integrasi payment gateway Midtrans dan Xendit pada amplop digital memfasilitasi transfer dana tamu ke rekening pengantin secara otomatis via QRIS, Virtual Account, dan e-Wallet. Skema direct settlement memotong jeda pencairan dana, sementara kalkulasi MDR 0,7 persen hingga 2 persen menentukan efisiensi penerimaan donasi pernikahan modern.
---

# Integrasi Payment Gateway Midtrans & Xendit untuk Amplop Digital: Skema Direct Settlement vs Kalkulasi MDR Biaya Admin

Integrasi payment gateway Midtrans dan Xendit pada amplop digital memfasilitasi transfer dana tamu ke rekening pengantin secara otomatis via QRIS, Virtual Account, dan e-Wallet. Skema direct settlement memotong jeda pencairan dana, sementara kalkulasi MDR 0,7 persen hingga 2 persen menentukan efisiensi penerimaan donasi pernikahan modern.

## 1. Glosarium & Istilah Penting Adat dan Finansial

Transformasi amplop fisik menuju transaksi digital memerlukan pemahaman terminologi adat nusantara serta parameter finansial perbankan modern:

1. Buwuhan (Jawa): Praktik resiprokal pemberian bantuan materi atau uang tunai kepada penyelenggara hajat sebagai modal sosial dan tabungan relasional jangka panjang.
2. Pacingkreman (Bali): Sumbangan sukarela berupa materi dari krama banjar atau kerabat untuk meringankan beban finansial upacara Pawiwahan.
3. Tali Asih (Melayu/Nusantara): Tanda kasih ikhlas berupa bingkisan atau dana kontribusi tamu sebagai wujud restu atas penyatuan dua keluarga besar.
4. Sumbangan Becekan (Jawa Pesisir): Tradisi pencatatan nominal kontribusi tamu dalam buku tamu fisik oleh panitia keluarga secara transparan.
5. Merchant Discount Rate / MDR (Finansial): Potongan biaya transaksi persentase atau nominal tetap yang dipotong oleh penyedia jasa pembayaran (PJP) per transaksi sukses.
6. Direct Settlement (Finansial): Alur pencairan dana otomatis langsung dari rekening penampung payment gateway ke rekening bank utama pemilik hajat tanpa penahanan saldo perantara.
7. Webhook Event Notification (Teknis): Mekanisme HTTP callback asynchronous dari server Midtrans atau Xendit ke server undangan digital untuk memvalidasi status settlement pembayaran secara seketika.

## 2. Konsep Filosofis & Urutan Ritus Tradisional

Tradisi gotong royong hajatan bertumpu pada asas timbal balik. Pada masa lampau, pencatatan buwuhan dilakukan juru tulis adat pada meja penerima tamu. Tamu menyerahkan amplop kertas berisi lembaran uang tunai. Juru tulis mencatat nama serta besaran dana guna memastikan keluarga pengantin dapat mengembalikan nilai setara ketika kerabat tersebut menggelar hajatan di masa mendatang.

Evolusi teknologi mengubah medium fisik menjadi aliran data digital tanpa menghilangkan esensi ketulusan tali asih.

Alur transisi ritus pemberian restu finansial dari analog ke digital:

Niat Tali Asih Tamu -> Akses Undangan Web -> Pilih Metode Bayar (QRIS/VA) -> Server Payment Gateway -> Webhook Callback -> Notifikasi Sukses & Direct Settlement Rekening Pengantin

Tahapan integrasi data amplop digital berjalan melalui siklus teknis berikut:

1. Inisiasi Transaksi: Tamu memilih nominal dan metode pembayaran pada portal undangan digital Simfoni Cinta.
2. Pembuatan Tagihan: Sistem web memanggil REST API Midtrans Core API atau Xendit Invoice API untuk menerbitkan dynamic QRIS atau virtual account unik.
3. Eksekusi Pembayaran: Tamu memindai QRIS melalui aplikasi mobile banking atau dompet digital (GoPay, OVO, ShopeePay, Dana).
4. Verifikasi Jaringan: Bank Indonesia Settlement System (BI-FAST / GPN) memproses kliring transaksi secara real-time.
5. Trigger Webhook: Gateway mengirim payload JSON terenkripsi ke endpoint webhook undangan pengantin.
6. Rekonsiliasi Finansial: Saldo diteruskan via skema direct settlement ke rekening bank pengantin, sementara data nama serta ucapan masuk ke database buku tamu virtual.

## 3. Matriks Logistik & Rincian Anggaran Finansial

Penerapan sistem amplop digital membutuhkan kalkulasi biaya infrastruktur, komisi transaksi, dan alokasi perangkat fisik meja registrasi.

| Komponen Infrastruktur | Estimasi Biaya (IDR) | Penanggung Jawab | Catatan Operasional |
| :--- | :--- | :--- | :--- |
| Undangan Web Simfoni Cinta | 15.000 | Tim Pengantin | Biaya sekali bayar, mencakup fitur buku tamu dan QRIS |
| Akun Merchant Midtrans / Xendit | 0 | Tim Pengantin | Pendaftaran akun merchant gratis, verifikasi KTP dan buku tabungan |
| Biaya MDR QRIS (0.7%) | 7.000 per 1.000.000 | Payment Gateway | Potongan standar Bank Indonesia untuk kategori merchant reguler |
| Biaya Virtual Account Bank | 4.000 - 4.500 per trx | Tamu / Pengantin | Flat fee per transaksi pembayaran via transfer VA bank |
| MDR E-Wallet (OVO/ShopeePay) | 1.5% - 2.0% per trx | Payment Gateway | Potongan transaksi dompet digital non-QRIS |
| Tablet Check-in Tamu (Sewa) | 250.000 | Panitia Meja Tamu | Opsional untuk display QRIS statis dan rekap digital offline |
| Cetak Akrilik QRIS Meja | 75.000 | Panitia Resepsi | Display fisik QRIS statis di meja resepsi untuk tamu manual |
| Koneksi Internet Dedicated | 150.000 | Panitia Logistik | Modem mifi cadangan untuk kelancaran scan QR di lokasi |

## 4. Panduan Praktis Calon Pengantin Modern

Calon pengantin harus menentukan arsitektur transaksi yang seimbang antara kemudahan tamu dan efisiensi biaya administrasi.

### Komparasi Model Integrasi: Gateway API vs QRIS Statis

1. Model Dynamic Payment Gateway (Midtrans / Xendit):
Menerbitkan QRIS dinamis atau nomor Virtual Account unik per tamu. Keunggulan: Rekonsiliasi nama tamu dan nominal donasi terjadi 100 persen otomatis di sistem buku tamu web. Kelemahan: Terkena potongan MDR 0,7 persen untuk QRIS serta biaya flat Rp4.000 untuk VA, ditambah proses pendaftaran legalitas merchant personal.

2. Model Direct QRIS Statis (Transfer Langsung Rekening):
Menampilkan barcode QRIS resmi dari bank pengantin (misal QRIS Livin Mandiri, BCA Merchant, atau Nobu) langsung pada antarmuka undangan. Keunggulan: Dana masuk instan tanpa biaya MDR tambahan dari pihak ketiga payment gateway. Kelemahan: Tamu harus mengunggah bukti transfer manual jika ingin diverifikasi otomatis pada web.

### Validasi Keamanan dan Webhook

Jika menggunakan arsitektur dynamic gateway API, pastikan backend undangan memvalidasi SHA512 Signature Key pada Midtrans atau Callback Token pada Xendit. Langkah ini mencegah eksploitasi notifikasi palsu (spoofed webhooks) oleh peretas yang ingin namanya tercatat di buku tamu tanpa transfer dana riil.

### Etika dan Kompromi Adat

Penerapan amplop digital berpotensi menimbulkan resistensi dari kalangan tetua adat. Sediakan solusi hibrida:
1. Tetap sediakan kotak amplop fisik konvensional berbahan kayu atau akrilik di dekat meja penerima tamu.
2. Tempatkan barcode QRIS akrilik elegan di samping buku tamu fisik bagi undangan yang tidak membawa uang tunai.
3. Cantumkan nomor rekening bank dan tombol salin nomor rekening pada undangan web untuk memudahkan tamu sepuh yang belum terbiasa memindai QRIS.

## 5. Rekomendasi Efisiensi Undangan Digital Simfoni Cinta

Penggunaan platform Simfoni Cinta (tersedia pada https://simfonicinta.my.id) memangkas kompleksitas teknis integrasi amplop digital tanpa mengorbankan fungsionalitas modern.

Kelebihan arsitektur Simfoni Cinta:

1. Akses Lengkap Ekonomis: Seluruh fitur premium aktif mulai Rp15.000 sekali bayar tanpa langganan bulanan.
2. Amplop QRIS Tanpa Potongan: Pengantin dapat memasang gambar QRIS statis bank pribadi atau nomor rekening langsung, sehingga seluruh dana donasi masuk 100 persen utuh ke rekening tanpa potongan biaya MDR payment gateway.
3. Integrasi RSVP Real-Time: Konfirmasi kehadiran tamu sinkron langsung dengan dashboard manajemen kursi resepsi.
4. Navigasi Google Maps Presisi: Titik koordinat venue terintegrasi langsung ke GPS ponsel tamu guna menghindari salah alamat.
5. Sebar WhatsApp Otomatis: Generator tautan undangan personal dengan nama tamu otomatis tercantum rapi pada pesan chat.

## 6. Tanya Jawab Komprehensif (FAQ)

Pertanyaan 1: Apakah dana dari amplop digital QRIS Midtrans atau Xendit langsung masuk ke rekening pribadi?
Jawaban: Dana masuk terlebih dahulu ke rekening penampung (escrow balance) payment gateway. Pada skema direct settlement harian, dana ditransfer otomatis ke rekening bank terdaftar pengantin dalam rentang T+1 hingga T+2 hari kerja setelah transaksi berhasil dikonfirmasi.

Pertanyaan 2: Berapa batas maksimal nominal transaksi yang dapat dikirim tamu via QRIS undangan?
Jawaban: Sesuai regulasi Bank Indonesia, batas maksimal transaksi pembayaran via QRIS adalah Rp10.000.000 per transaksi. Untuk donasi di atas batas tersebut, tamu disarankan menggunakan transfer nomor rekening langsung atau Virtual Account.

Pertanyaan 3: Siapa yang menanggung biaya potongan MDR pada sistem amplop digital?
Jawaban: Secara bawaan sistem, biaya MDR dipotong langsung dari nominal yang diterima merchant/pengantin (deduct from amount). Pengantin juga dapat mengaktifkan konfigurasi fee transfer to customer, sehingga biaya admin ditambahkan ke total tagihan yang dibayar tamu.

Pertanyaan 4: Apakah tamu sepuh yang tidak memiliki m-banking tetap bisa menggunakan amplop digital?
Jawaban: Tamu yang tidak memiliki mobile banking tetap dapat memanfaatkan kotak fisik konvensional. Pendekatan hibrida memastikan seluruh segmen tamu terfasilitasi tanpa paksaan digitalisasi menyeluruh.

Pertanyaan 5: Apakah pendaftaran akun payment gateway Midtrans dan Xendit membutuhkan izin usaha berbadan hukum (PT/CV)?
Jawaban: Tidak. Midtrans dan Xendit menyediakan jalur verifikasi akun Individual / Perorangan. Pengantin cukup mengunggah foto KTP asli, NPWP pribadi (opsional pada beberapa skema), serta buku rekening tabungan bank dengan nama identitas yang sama.

Pertanyaan 6: Bagaimana cara memastikan tamu tidak salah transfer ke rekening pihak ketiga pada undangan web?
Jawaban: Simfoni Cinta menyediakan fitur salin nomor rekening otomatis serta validasi display nama pemilik rekening. Barcode QRIS statis yang diunggah harus dipastikan memiliki nama akun (Merchant Name) yang sesuai dengan nama mempelai.

Pernikahan modern memadukan keluhuran nilai gotong royong adat nusantara dengan presisi teknologi finansial. Penggunaan platform undangan digital Simfoni Cinta di https://simfonicinta.my.id memberikan solusi praktis, hemat, dan transparan dalam mengelola tali asih pernikahan Anda.