# 💍 `src/components/wedding/` — Wedding Invitation Interactive Modules

Direktori ini berisi komponen-komponen fitur interaktif utama yang disematkan langsung pada halaman undangan pernikahan digital (baik pada pratinjau `/demo/$slug` maupun website undangan klien yang sudah dipublikasikan).

---

## 📋 Katalog Komponen Undangan

### 1. `CountdownCalendar.tsx` (Hitung Mundur & Kalender Acara)
* **Fungsi:** Menampilkan timer hitung mundur waktu nyata (Hari, Jam, Menit, Detik) menuju hari H pernikahan.
* **Fitur Utama:**
  * Sinkronisasi waktu lokal akurat via `setInterval`.
  * Integrasi tombol **"Simpan ke Kalender"**:
    * Ekspor langsung ke **Google Calendar** via Web URL parameter.
    * Ekspor ke **Microsoft Outlook / Office 365**.
    * Unduh file **iCal (`.ics`)** untuk kalender bawaan Apple iPhone / Mac / Windows Calendar.
* **Props:** `targetDate?: string`, `eventTitle?: string`, `eventLocation?: string`, `eventDescription?: string`.

### 2. `DigitalEnvelope.tsx` (Amplop & Hadiah Digital)
* **Fungsi:** Memfasilitasi pemberian tanda kasih / kado pernikahan secara cashless bagi tamu undangan.
* **Fitur Utama:**
  * Menampilkan daftar rekening bank penerima (BCA, Mandiri, BRI, BSI, dll) dan dompet digital (Dana, GoPay, OVO).
  * Tombol **"Salin Nomor Rekening"** dengan feedback toast otomatis.
  * Tampilan QRIS instan yang dapat discan tamu melalui aplikasi m-banking atau e-wallet manapun.
  * Modal konfirmasi kirim kado fisik / kirim bukti transfer.

### 3. `FloatingMusicPlayer.tsx` (Pemutar Musik Latar Mengambang)
* **Fungsi:** Pemutar audio latar belakang (*background music*) romantis yang melayang di sudut layar.
* **Fitur Utama:**
  * Kontrol Play / Pause dengan animasi piringan hitam (vinyl) yang berputar saat audio diputar.
  * Mekanisme **Autoplay Policy Bypass**: Otomatis memulai musik begitu tamu mengetuk tombol "Buka Undangan" pada cover depan.
  * Kontrol volume dan pemilihan track lagu jika template memiliki multi-track audio.

### 4. `GuestbookWall.tsx` (Dinding Doa & Ucapan Tamu)
* **Fungsi:** Feed interaktif doa dan ucapan selamat dari tamu undangan yang terhubung langsung ke database.
* **Fitur Utama:**
  * Formulir kirim ucapan, nama pengirim, relasi, dan status konfirmasi kehadiran (Hadir / Masih Ragu / Tidak Hadir).
  * Daftar ucapan dengan avatar inisial berwarna, badge kehadiran, dan timestamp relatif (misal: "5 menit yang lalu").
  * Paginasi otomatis atau infinite scroll untuk ribuan ucapan tamu.

### 5. `LoveStoryTimeline.tsx` (Linimasa Kisah Cinta)
* **Fungsi:** Menampilkan perjalanan kisah asmara kedua mempelai dalam bentuk linimasa (timeline) visual yang estetik.
* **Fitur Utama:**
  * Struktur milestone bertingkat: *Pertama Bertemu*, *Menyatakan Cinta*, *Lamaran*, hingga *Menuju Pelaminan*.
  * Dilengkapi tanggal momen bersejarah, foto kenangan, dan narasi cerita singkat.
  * Layout selang-seling (kiri-kanan) responsif di desktop dan vertikal rapi di mobile.

---

## 💡 Panduan Teknis untuk AI
* Seluruh komponen di folder ini dirancang untuk dapat beroperasi dengan aman baik saat memiliki data lengkap dari server maupun saat berjalan di mode demo dengan data fallback.
* Pastikan penanganan audio pada `FloatingMusicPlayer.tsx` selalu mematuhi kebijakan autoplay browser modern (harus diawali interaksi user `onClick`).
