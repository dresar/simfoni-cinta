import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const contentBlogDir = path.join(rootDir, "content", "blog");
const publicBlogDir = path.join(rootDir, "public", "blog");
const manifestPath = path.join(rootDir, "src", "data", "blog-manifest.json");
const llmsTxtPath = path.join(rootDir, "public", "llms.txt");
const llmsFullTxtPath = path.join(rootDir, "public", "llms-full.txt");
const sitemapPath = path.join(rootDir, "public", "sitemap.xml");

if (!fs.existsSync(contentBlogDir)) fs.mkdirSync(contentBlogDir, { recursive: true });
if (!fs.existsSync(publicBlogDir)) fs.mkdirSync(publicBlogDir, { recursive: true });
if (!fs.existsSync(path.dirname(manifestPath))) fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

const CLUSTERS = [
  {
    category: "Adat & Tradisi",
    topics: [
      { slug: "tata-cara-pernikahan-adat-jawa-lengkap", name: "Tata Cara Pernikahan Adat Jawa Lengkap dari Siraman hingga Panggih" },
      { slug: "makna-filosofis-prosesi-siraman-adat-jawa", name: "Makna Filosofis Prosesi Siraman Pengantin Jawa dan Perlengkapannya" },
      { slug: "panduan-lengkap-malam-midodareni-pengantin-jawa", name: "Panduan Lengkap Malam Midodareni: Syarat, Rangkaian, dan Pantangan" },
      { slug: "perbedaan-paes-ageng-jogja-dan-paes-solo-basahan", name: "Perbedaan Paes Ageng Jogja dan Paes Solo Basahan yang Wajib Diketahui" },
      { slug: "makna-balangan-gantal-dan-injak-telur-adat-jawa", name: "Filosofi Balangan Gantal, Wijidadi, dan Injak Telur dalam Adat Jawa" },
      { slug: "tata-cara-pernikahan-adat-sunda-ngeuyeuk-seureuh", name: "Tata Cara Pernikahan Adat Sunda: Dari Ngeuyeuk Seureuh hingga Sawer" },
      { slug: "makna-ritual-sawer-panganten-adat-sunda", name: "Makna Sakral Sawer Panganten dan Banting Telur Pengantin Sunda" },
      { slug: "prosesi-huap-lingkung-pernikahan-sunda", name: "Prosesi Huap Lingkung dan Tarik Bakakak Hayam dalam Tradisi Sunda" },
      { slug: "tata-cara-pernikahan-adat-batak-toba-lengkap", name: "Panduan Lengkap Pernikahan Adat Batak Toba: Dari Marhusip ke Unjuk" },
      { slug: "mengenal-makna-sinamot-mahar-adat-batak", name: "Mengenal Makna Sinamot: Penentuan Uang Mahar dalam Budaya Batak" },
      { slug: "filosofi-pemberian-ulos-mangulosi-pernikahan-batak", name: "Filosofi Pemberian Ulos (Mangulosi) dalam Pernikahan Adat Batak" },
      { slug: "perbedaan-martumpol-dan-marhusip-batak", name: "Perbedaan Martumpol dan Marhusip dalam Rangkaian Adat Batak Toba" },
      { slug: "tata-cara-pernikahan-adat-minangkabau-baralek", name: "Tata Cara Pernikahan Adat Minangkabau: Dari Marosok hingga Baralek Gadang" },
      { slug: "makna-tradisi-malam-bainai-pengantin-minang", name: "Makna Tradisi Malam Bainai: Ungkapan Kasih Sayang Keluarga Minang" },
      { slug: "prosesi-manjapuik-marapulai-adat-padang", name: "Prosesi Manjapuik Marapulai dan Uang Hilang dalam Adat Pariaman Minang" },
      { slug: "mengenal-suntiang-minang-filosofi-dan-bobotnya", name: "Mengenal Mahkota Suntiang Minang: Filosofi Keanggunan dan Makna Bobotnya" },
      { slug: "tata-cara-pernikahan-adat-bugis-makassar-lengkap", name: "Tata Cara Pernikahan Adat Bugis Makassar: Dari Mappettuada ke Mappacci" },
      { slug: "makna-sakral-prosesi-mappacci-pengantin-bugis", name: "Makna Sakral Prosesi Mappacci (Pembersihan Diri) Pengantin Bugis" },
      { slug: "fakta-dan-filosofi-uang-panai-suku-bugis", name: "Fakta dan Filosofi Uang Panai Suku Bugis: Bukan Sekadar Nilai Materi" },
      { slug: "busana-baju-bodo-pengantin-bugis-makassar", name: "Keindahan Baju Bodo dan Filosofi Warna Busana Pengantin Bugis" },
      { slug: "tata-cara-pernikahan-adat-melayu-kepulauan-riau", name: "Tata Cara Pernikahan Adat Melayu: Merisik, Meminang, dan Tepung Tawar" },
      { slug: "makna-upacara-tepung-tawar-pengantin-melayu", name: "Makna Doa dan Restu Upacara Tepung Tawar pada Pengantin Melayu" },
      { slug: "prosesi-palang-pintu-pernikahan-adat-betawi", name: "Keseruan Tradisi Palang Pintu Pengantin Betawi: Pantun dan Silat" },
      { slug: "makna-roti-buaya-dalam-pernikahan-betawi", name: "Filosofi Roti Buaya Simbol Kesetiaan Abadi Pengantin Adat Betawi" },
      { slug: "tata-cara-pernikahan-adat-bali-pawiwahan", name: "Tata Cara Pernikahan Adat Bali (Pawiwahan): Makna Mepamit & Madengen-dengen" },
      { slug: "keagungan-busana-payas-agung-pengantin-bali", name: "Keagungan Busana Payas Agung Pengantin Bali dan Makna Ornamen Emasnya" },
      { slug: "tata-cara-pernikahan-adat-palembang-sumatera-selatan", name: "Tata Cara Pernikahan Adat Palembang: Busana Aisan Gede dan Munggah" },
      { slug: "tata-cara-pernikahan-adat-aceh-woe-linto", name: "Tata Cara Pernikahan Adat Aceh: Dari Seumanoe Pucok hingga Woe Linto" },
      { slug: "makna-peusijuek-dalam-pernikahan-adat-aceh", name: "Makna Doa Berkah Tradisi Peusijuek dalam Perkawinan Masyarakat Aceh" },
      { slug: "tata-cara-pernikahan-adat-lampung-begawi", name: "Tata Cara Pernikahan Adat Lampung: Prosesi Begawi dan Mahkota Siger" },
      { slug: "filosofi-mahkota-siger-lampung-saibatin-dan-pepadun", name: "Filosofi Mahkota Siger Lampung: Perbedaan Saibatin dan Pepadun" },
      { slug: "tata-cara-pernikahan-adat-banjar-kalimantan-selatan", name: "Tata Cara Pernikahan Adat Banjar: Dari Bapapantunan hingga Baayun" },
      { slug: "tata-cara-pernikahan-adat-dayak-ngaju-kalimantan", name: "Tata Cara Perkawinan Adat Dayak Ngaju: Prosesi Petak Malai dan Mandau" },
      { slug: "tata-cara-pernikahan-adat-sasak-lombok-merarik", name: "Mengenal Tradisi Kawin Lari Merarik pada Suku Sasak Lombok" },
      { slug: "tata-cara-pernikahan-adat-toraja-rambu-tuka", name: "Tata Cara Perkawinan Adat Toraja Rambu Tuka dan Nilai Kekeluargaannya" },
      { slug: "tata-cara-pernikahan-adat-minahasa-sulawesi-utara", name: "Tata Cara Pernikahan Adat Minahasa: Prosesi Toki Pintu dan Tawaang" },
      { slug: "tata-cara-pernikahan-adat-maluku-baku-dapa", name: "Tradisi Pernikahan Adat Maluku: Prosesi Mas Kawin dan Pesta Baku Dapa" },
      { slug: "tata-cara-pernikahan-adat-papua-emas-kawin", name: "Keunikan Tradisi Mas Kawin dan Pesta Pernikahan Adat Papua" },
      { slug: "perpaduan-pernikahan-dua-adat-berbeda-di-indonesia", name: "Tips Menggabungkan Dua Adat Pernikahan Berbeda Tanpa Mengurangi Kesakralan" },
      { slug: "tips-memilih-tema-undangan-digital-adat-nusantara", name: "Tips Memilih Template Undangan Digital Adat Nusantara yang Otentik" },
      { slug: "warna-keberuntungan-dalam-pernikahan-adat-tionghoa", name: "Warna Merah dan Emas: Filosofi Simbolik Pernikahan Adat Tionghoa" },
      { slug: "prosesi-sangjit-tunangan-adat-tionghoa-indonesia", name: "Panduan Prosesi Sangjit (Seserahan) dalam Adat Tionghoa Indonesia" },
      { slug: "tata-cara-tea-pai-upacara-minum-teh-pernikahan", name: "Tata Cara Upacara Minum Teh (Tea Pai) Menghormati Tetua Keluarga" },
      { slug: "busana-cheongsam-dan-qipao-pengantin-modern", name: "Inspirasi Busana Cheongsam Pengantin Tionghoa Modern yang Menawan" },
      { slug: "susunan-acara-akad-nikah-islami-yang-khusyuk", name: "Susunan Acara Akad Nikah Islami yang Khidmat, Rapi, dan Khusyuk" },
      { slug: "syarat-dan-rukun-nikah-dalam-islam-kemenag", name: "Syarat dan Rukun Nikah Menurut Islam serta Berkas KUA Kemenag 2026" },
      { slug: "tata-cara-pemberkatan-pernikahan-kristen-protestan", name: "Tata Ibadah Pemberkatan Nikah Kristen Protestan dan Janji Suci" },
      { slug: "tata-cara-sakramen-perkawinan-gereja-katolik", name: "Panduan Sakramen Perkawinan Gereja Katolik: Penyelidikan Kanonik hingga Misa" },
      { slug: "makna-tukar-cincin-dalam-upacara-pernikahan", name: "Sejarah dan Makna Filosofis Tukar Cincin dalam Pernikahan Modern" },
      { slug: "tips-menjelaskan-prosesi-adat-pada-undangan-digital", name: "Cara Menuliskan Panduan Busana dan Prosesi Adat pada Undangan Digital" },
    ]
  },
  {
    category: "Tema & Desain",
    topics: [
      { slug: "tren-desain-undangan-digital-minimalis-modern", name: "Tren Desain Undangan Digital Minimalis Modern: Simpel, Bersih, dan Mewah" },
      { slug: "palet-warna-undangan-pernikahan-sage-green", name: "Inspirasi Palet Warna Sage Green: Alami, Menenangkan, dan Estetik" },
      { slug: "elegan-abadi-desain-undangan-tema-luxury-gold", name: "Kesan Elegan Abadi: Desain Undangan Tema Luxury Gold & Royal Bronze" },
      { slug: "tema-rustic-undangan-digital-earthy-tone", name: "Eksplorasi Tema Rustic Digital: Dominasi Kayu, Daun Kering, dan Earthy Tone" },
      { slug: "pesona-warna-dusty-rose-untuk-pernikahan-romantis", name: "Pesona Warna Dusty Rose: Sentuhan Romantis dan Feminin Hari Bahagia" },
      { slug: "tema-monokrom-hitam-putih-undangan-modern", name: "Eksentrik dan Berani: Konsep Undangan Monokrom Hitam-Putih Elegan" },
      { slug: "keindahan-floral-watercolor-pada-undangan-digital", name: "Keindahan Lukisan Floral Watercolor pada Background Undangan Digital" },
      { slug: "desain-undangan-digital-navy-blue-dan-emas", name: "Kombinasi Navy Blue dan Gold: Aura Kemewahan Malam Penuh Bintang" },
      { slug: "tema-emerald-green-pernikahan-kebangsawanan", name: "Pesona Emerald Green: Nuansa Hijau Zamrud yang Anggun dan Megah" },
      { slug: "tema-terracotta-undangan-hangat-kontemporer", name: "Eksotisme Warna Terracotta: Hangat, Bersahabat, dan Fotogenik" },
      { slug: "tema-lilac-lavender-pernikahan-lembut-manis", name: "Nuansa Lilac & Lavender: Pilihan Manis untuk Pernikahan Musim Semi" },
      { slug: "gaya-undangan-korean-aesthetic-pastel", name: "Gaya Korean Aesthetic: Tipografi Ramping dan Warna Pastel yang Manis" },
      { slug: "tema-vintage-art-deco-glamour-era-1920an", name: "Kemewahan Era 1920-an: Ornamen Art Deco Emas pada Undangan Digital" },
      { slug: "tema-tropical-botanical-nuansa-pantai-bali", name: "Nuansa Tropis Botanical: Daun Palem dan Angin Pantai untuk Pesta Outdoor" },
      { slug: "desain-undangan-tema-champagne-velvet-mewah", name: "Kelembutan Warna Champagne Velvet: Simbol Kemakmuran dan Romantisme" },
      { slug: "tema-burgundy-dan-wine-pernikahan-glamor", name: "Aura Glamor Warna Burgundy: Kehangatan Anggur Merah di Malam Resepsi" },
      { slug: "kombinasi-font-estetik-untuk-undangan-digital", name: "Kombinasi Font Serif dan Kaligrafi Latin Terbaik untuk Undangan Digital" },
      { slug: "penggunaan-animasi-halus-pada-undangan-web", name: "Panduan Animasi Halus (Smooth Motion) agar Undangan Digital Tidak Berat" },
      { slug: "desain-undangan-digital-tema-buku-passport", name: "Kreatif & Unik: Konsep Undangan Digital Berbentuk Paspor Penerbangan Cinta" },
      { slug: "desain-undangan-digital-tema-koran-vintage", name: "Vintage Newspaper Style: Desain Undangan Ala Lembaran Berita Cinta Kuno" },
      { slug: "tema-undangan-digital-malam-bintang-celestial", name: "Tema Celestial & Constellation: Taburan Bintang Rasi Zodiak Pasangan" },
      { slug: "tips-memilih-background-texture-undangan-web", name: "Tips Memilih Tekstur Background Kertas Linen dan Cat Air yang Realistis" },
      { slug: "desain-undangan-digital-nuansa-marmer-marble", name: "Kemewahan Tekstur Marmer (White Carrara) pada Tampilan Undangan Digital" },
      { slug: "tema-bohemian-undangan-digital-alam-bebas", name: "Boho Chic Style: Rumbai Macrame dan Bunga Liar untuk Jiwa Bebas" },
      { slug: "penggunaan-ornamen-sudut-emas-pada-undangan", name: "Penempatan Ornamen Sudut Emas (Corner Accents) yang Proporsional" },
      { slug: "tips-tampilan-mobile-first-undangan-digital", name: "Desain Mobile-First: Memastikan Undangan Tampil Sempurna di Smartphone" },
      { slug: "tema-peach-fuzz-warna-tren-pernikahan-terkini", name: "Hangatnya Warna Peach Fuzz: Tren Palet Romantis yang Lembut" },
      { slug: "tema-olive-green-dan-tanah-liat-organik", name: "Palet Organik Olive Green & Clay: Hubungan Erat dengan Keasrian Alam" },
      { slug: "desain-undangan-tema-sky-blue-dan-awan", name: "Cerahnya Langit Biru: Tema Sky Blue & White Cloud yang Menyejukkan" },
      { slug: "tema-autumn-fall-dedaunan-gugur-hangat", name: "Kehangatan Musim Gugur: Tema Autumn Leaves dengan Sentuhan Tembaga" },
      { slug: "tema-winter-wonderland-putih-kristal-es", name: "Kemurnian Winter Wonderland: Putih Bersih Bertabur Kilau Kristal Perak" },
      { slug: "tips-memilih-rasio-foto-prewedding-di-undangan", name: "Panduan Memilih Rasio Foto Prewedding Portrait vs Landscape di Web" },
      { slug: "desain-cover-undangan-digital-yang-memikat", name: "Desain Amplop Pembuka (Envelope Reveal) yang Mengundang Rasa Ingin Tahu" },
      { slug: "efek-glassmorphism-pada-komponen-undangan-web", name: "Tren Glassmorphism: Efek Kaca Transparan Modern pada Kotak Acara" },
      { slug: "pilihan-ornamen-bunga-lokal-indonesia-melati-anggrek", name: "Eksotisme Bunga Lokal: Melati, Anggrek, dan Mawar Nusantara pada Undangan" },
      { slug: "desain-undangan-tema-wayang-kulit-jawa-klasik", name: "Sentuhan Wayang Kulit Klasik: Filosofi Kamajaya dan Kamaratih Digital" },
      { slug: "desain-undangan-motif-songket-palembang-dan-minang", name: "Kemegahan Tenun Songket: Motif Emas Mewah Kebanggaan Sumatera" },
      { slug: "tema-ukiran-batik-parang-dan-truntum-digital", name: "Filosofi Motif Batik Truntum: Tanda Cinta Kasih Tulus Orang Tua" },
      { slug: "tips-mengatur-kontras-teks-agar-mudah-dibaca", name: "Standar Aksesibilitas: Menjaga Kontras Teks agar Nyaman Dibaca Lansia" },
      { slug: "desain-undangan-digital-tema-cherry-blossom-sakura", name: "Romantisme Sakura: Nuansa Bunga Sakura Merah Muda Penuh Kelembutan" },
      { slug: "tema-industrial-modern-nuansa-bata-dan-besi", name: "Konsep Industrial Minimalis: Sentuhan Semen Abu dan Logam Elegan" },
      { slug: "tema-lavender-dan-eucalyptus-harum-segar", name: "Paduan Hijau Eucalyptus dan Ungu Lavender yang Menyejukkan Mata" },
      { slug: "desain-undangan-tema-monstera-greenery-segar", name: "Kesegaran Monstera & Palm Leaves: Gaya Tropis Modern Terfavorit" },
      { slug: "desain-countdown-timer-estetik-pada-undangan", name: "Merancang Kotak Countdown Timer Hitung Mundur yang Selaras dengan Tema" },
      { slug: "tips-pemilihan-warna-gradient-undangan-web", name: "Formula Gradient Halus: Memadukan Dua Warna Senada Tanpa Terlihat Norak" },
      { slug: "tema-cappuccino-coffee-warna-kopi-kekinian", name: "Pecinta Kopi: Hangatnya Warna Kopi Susu & Mocha Latte untuk Pernikahan" },
      { slug: "tema-pernikahan-pastel-dreamy-pelangi-lembut", name: "Koleksi Pastel Dreamy: Gradasi Warna Manis untuk Pengantin Ceria" },
      { slug: "desain-tombol-interaktif-undangan-yang-ramah-jari", name: "Ergonomi Tombol: Ukuran dan Posisi Tombol Buka Undangan yang Nyaman di HP" },
      { slug: "kesalahan-desain-undangan-digital-yang-harus-dihindari", name: "7 Kesalahan Desain Undangan Digital yang Membuat Tamu Merasa Terganggu" },
      { slug: "cara-kustomisasi-tema-undangan-di-simfoni-cinta", name: "Panduan Lengkap Kustomisasi Tema dan Warna di Dashboard Simfoni Cinta" },
    ]
  },
  {
    category: "Panduan Fitur",
    topics: [
      { slug: "cara-kirim-undangan-whatsapp-blast-otomatis", name: "Cara Kirim Undangan WhatsApp Massal Otomatis dengan Nama Tamu Berbeda" },
      { slug: "personalisasi-nama-tamu-otomatis-link-undangan", name: "Fitur Link Generator: Menyisipkan Nama Tamu di Tautan Undangan Web" },
      { slug: "panduan-integrasi-amplop-digital-dan-qris-instan", name: "Panduan Mengatur Amplop Digital & QRIS Langsung ke Rekening Pribadi" },
      { slug: "cara-mengelola-rsvp-konfirmasi-kehadiran-online", name: "Cara Memantau Konfirmasi Kehadiran Tamu (RSVP) Real-Time di Dasbor" },
      { slug: "sistem-check-in-meja-resepsi-menggunakan-qr-code", name: "Sistem Check-In Resepsi Modern: Scan QR Code Tamu Tanpa Antrean" },
      { slug: "menambahkan-lokasi-google-maps-presisi-di-undangan", name: "Cara Menyematkan Pin Lokasi Google Maps Presisi dan Navigasi GPS" },
      { slug: "memilih-musik-latar-mp3-terbaik-untuk-undangan", name: "Tips Memilih dan Mengatur Musik Latar (Backsound) Otomatis di Undangan" },
      { slug: "cara-unggah-galeri-foto-prewedding-hd-cepat", name: "Panduan Unggah Galeri Foto Prewedding Kualitas HD Tanpa Membuat Lemot" },
      { slug: "menyematkan-video-youtube-teaser-dan-live-streaming", name: "Cara Memasang Video Teaser Prewedding dan Link Live Streaming YouTube" },
      { slug: "fitur-buku-tamu-digital-dan-kolom-ucapan-doa", name: "Memanfaatkan Kolom Doa Restu & Ucapan Selamat sebagai Memori Abadi" },
      { slug: "keuntungan-fitur-simpan-ke-google-calendar", name: "Manfaat Tombol Tambah ke Google Calendar agar Tamu Tidak Lupa Jadwal" },
      { slug: "cara-membuat-buku-panduan-tamu-vip-undangan", name: "Pengaturan Kategori Tamu VIP, Keluarga, dan Rekan Kerja di Undangan" },
      { slug: "fitur-filter-ucapan-dan-moderasi-komentar-tamu", name: "Cara Memoderasi Pesan dan Ucapan Tamu di Dasbor Pengantin" },
      { slug: "keamanan-amplop-digital-tanpa-potongan-biaya", name: "Keamanan Dompet Digital: Menerima Kado Tanpa Biaya Potongan Admin" },
      { slug: "fitur-protokol-kesehatan-dan-dresscode-tamu", name: "Menampilkan Informasi Dresscode dan Panduan Acara secara Informatif" },
      { slug: "cara-ekspor-data-tamu-dan-rsvp-ke-excel", name: "Panduan Ekspor Data Tamu dan Rekapitulasi RSVP ke Format Excel / CSV" },
      { slug: "pengaturan-multi-acara-akad-dan-resepsi-berbeda-hari", name: "Mengatur Jadwal Multi-Acara: Akad, Resepsi, dan Unduh Mantu Terpisah" },
      { slug: "fitur-countdown-timer-hitung-mundur-hari-h", name: "Manfaat Countdown Timer Real-Time Membangkitkan Antusiasme Tamu" },
      { slug: "cara-mengganti-musik-latar-kustom-di-simfoni-cinta", name: "Langkah Mengunggah File Musik Sendiri Berformat MP3 ke Undangan" },
      { slug: "manajemen-kuota-tamu-per-sesi-acara-pernikahan", name: "Membagi Jadwal Tamu dalam Beberapa Sesi Jam untuk Menghindari Kepadatan" },
      { slug: "fitur-cerita-cinta-love-story-timeline", name: "Menuliskan Perjalanan Cerita Cinta (Love Story) Romantis di Undangan" },
      { slug: "mengatur-kotak-hadiah-fisik-alamat-kirim-kado", name: "Menyematkan Alamat Rumah untuk Tamu yang Ingin Mengirim Kado Fisik" },
      { slug: "panduan-membuat-subdomain-dan-domain-kustom", name: "Cara Memasang Domain Kustom (nama-pasangan.my.id) pada Undangan Web" },
      { slug: "cara-revisi-data-undangan-kapan-saja-tanpa-ganti-link", name: "Keunggulan Revisi Data Instan: Edit Lokasi dan Jam Kapan Saja Bebas Repot" },
      { slug: "mengatasi-suara-musik-yang-tidak-otomatis-play-di-hp", name: "Memahami Kebijakan Autoplay Browser di HP dan Cara Kerja Tombol Musik" },
      { slug: "fitur-multi-bahasa-indonesia-dan-inggris-di-undangan", name: "Menyediakan Versi Bahasa Inggris untuk Tamu dan Kerabat Luar Negeri" },
      { slug: "cara-membagikan-undangan-ke-instagram-story-dan-tiktok", name: "Tips Membagikan Undangan Digital ke Instagram Story dan Bio Media Sosial" },
      { slug: "kelebihan-pwa-undangan-dapat-diakses-offline", name: "Keunggulan PWA: Undangan Digital Simfoni Cinta Ringan dan Cepat Terbuka" },
      { slug: "fitur-live-chat-dan-bantuan-admin-simfoni-cinta", name: "Dukungan Layanan Admin Siap Bantu Pembuatan Undangan Sampai Siap Sebar" },
      { slug: "mengapa-tamu-lebih-suka-undangan-digital-website", name: "Hasil Riset: 8 dari 10 Tamu Lebih Nyaman Menerima Undangan Web Ketimbang Video" },
      { slug: "cara-membuat-kartu-ucapan-terima-kasih-digital", name: "Mengirimkan Pesan Terima Kasih Digital Otomatis Pasca Pesta Berakhir" },
      { slug: "cara-mengatur-pemberitahuan-wa-saat-ada-rsvp-masuk", name: "Notifikasi Otomatis WhatsApp Saat Tamu Mengisi Konfirmasi Kehadiran" },
      { slug: "optimasi-kecepatan-loading-undangan-di-jaringan-lambat", name: "Teknologi Optimasi Gambar WebP Membuat Undangan Cepat Dibuka di Daerah" },
      { slug: "cara-memasang-nomor-rekening-bca-mandiri-bri-bni", name: "Panduan Menampilkan Salin Nomor Rekening Bank dengan Tombol Sekali Klik" },
      { slug: "cara-menyematkan-link-zoom-dan-youtube-live", name: "Menghubungkan Acara Virtual: Menaruh Tautan Zoom & YouTube Live Khusus Tamu Jauh" },
      { slug: "fitur-anti-salah-ketik-nama-tamu-whatsapp", name: "Mencegah Typo: Generator Nama Tamu Terintegrasi dengan Buku Kontak Ponsel" },
      { slug: "manajemen-tamu-vip-dengan-qr-khusus-meja-khusus", name: "Pemberian Kode QR Meja Khusus untuk Tamu VVIP dan Pejabat Instansi" },
      { slug: "cara-menambahkan-turut-mengundang-keluarga-besar", name: "Menuliskan Daftar Turut Mengundang (Keluarga Besar) secara Rapi dan Santun" },
      { slug: "tips-memasang-foto-orang-tua-dan-mempelai", name: "Penempatan Foto Mempelai dan Nama Lengkap Beserta Gelar Akademik" },
      { slug: "keamanan-data-pribadi-pada-undangan-digital", name: "Perlindungan Data Pribadi: Menjaga Kerahasiaan Nomor HP dan Alamat Pengantin" },
      { slug: "fitur-dark-mode-pada-undangan-digital-elegan", name: "Tampilan Dark Mode: Sensasi Kemewahan Gelap yang Memikat Mata Tamu" },
      { slug: "membuat-undangan-pernikahan-digital-dalam-5-menit", name: "Langkah Kilat Membuat Undangan Pernikahan Siap Sebar Hanya dalam 5 Menit" },
      { slug: "cara-membeli-dan-aktivasi-paket-di-simfoni-cinta", name: "Alur Pembelian Paket Simfoni Cinta dengan Pembayaran QRIS Instan" },
      { slug: "kelebihan-masa-aktif-selamanya-pada-paket-platinum", name: "Masa Aktif Selamanya: Simpan Kenangan Hari Bahagia Tanpa Takut Terhapus" },
      { slug: "cara-mengunduh-rekap-doa-dan-ucapan-tamu", name: "Menyimpan Doa Restu Tamu Menjadi Dokumen PDF Kenangan Seumur Hidup" },
      { slug: "fitur-tampilan-preview-sebelum-disebarkan", name: "Mencoba Fitur Preview Undangan Sebelum Membagikan ke Teman dan Kerabat" },
      { slug: "cara-membagikan-undangan-via-email-dan-telegram", name: "Selain WhatsApp: Membagikan Undangan Melalui Saluran Telegram dan Email" },
      { slug: "manfaat-peta-petunjuk-arah-offline-di-undangan", name: "Memberikan Rute Alternatif untuk Lokasi Resepsi yang Berada di Gang atau Desa" },
      { slug: "perbandingan-undangan-format-video-vs-undangan-website", name: "Mengapa Undangan Web Jauh Lebih Unggul Dibanding Video MP4 atau PDF" },
      { slug: "panduan-lengkap-dashboard-mempelai-simfoni-cinta", name: "Eksplorasi Seluruh Fitur di Dashboard Mempelai Platform Simfoni Cinta" },
    ]
  },
  {
    category: "Tips & Anggaran",
    topics: [
      { slug: "rincian-anggaran-pernikahan-hemat-biaya-2026", name: "Rincian Anggaran Pernikahan 2026: Strategi Alokasi Dana Rp30 Juta Cukup" },
      { slug: "perbandingan-biaya-undangan-cetak-vs-undangan-digital", name: "Analisis Hemat: Hitung-Hitungan Biaya Undangan Cetak vs Undangan Digital" },
      { slug: "cara-menghemat-budget-pernikahan-hingga-80-persen", name: "10 Langkah Konkret Menghemat Biaya Pernikahan Tanpa Menurunkan Kualitas" },
      { slug: "tips-memilih-paket-katering-pernikahan-sesuai-tamu", name: "Rumus Menghitung Porsi Katering agar Tidak Kurang dan Tidak Mubazir" },
      { slug: "anggaran-pernikahan-intimate-wedding-50-tamu", name: "Panduan Rincian Biaya Intimate Wedding 50-100 Tamu yang Hangat dan Mewah" },
      { slug: "tips-menabung-bersama-pasangan-untuk-biaya-nikah", name: "Strategi Menabung Biaya Nikah Bersama Pasangan dalam Waktu 12 Bulan" },
      { slug: "alokasi-dana-darurat-pernikahan-yang-wajib-ada", name: "Pentingnya Dana Tak Terduga 10-15% dalam Perencanaan Anggaran Resepsi" },
      { slug: "cara-menentukan-jumlah-undangan-yang-tepat", name: "Rumus Menentukan Jumlah Tamu: Lingkaran Keluarga, Sahabat, dan Kolega" },
      { slug: "tips-memilih-souvenir-pernikahan-bermanfaat-murah", name: "Ide Souvenir Pernikahan Berfaedah Mulai Rp2.000 yang Berkesan bagi Tamu" },
      { slug: "hemat-biaya-dekorasi-dengan-konsep-minimalis", name: "Trik Menghemat Biaya Dekorasi Pelaminan dengan Bunga Lokal dan Lampu Warm" },
      { slug: "sewa-busana-pengantin-vs-bikin-baru-mana-hemat", name: "Sewa Baju Pengantin vs Menjahit Baru: Kelebihan, Kekurangan, dan Selisih Biaya" },
      { slug: "tips-memilih-venue-gedung-vs-halaman-rumah", name: "Perbandingan Biaya Menikah di Gedung vs Resepsi di Halaman Rumah Sendiri" },
      { slug: "cara-negosiasi-harga-dengan-vendor-pernikahan", name: "Etika dan Trik Negosiasi Harga dengan Vendor Pernikahan agar Dapat Diskon" },
      { slug: "tips-menghindari-pengeluaran-mubazir-saat-pesta", name: "Daftar 8 Pengeluaran Pernikahan yang Sering Menjadi Pemborosan Sia-Sia" },
      { slug: "biaya-nikah-di-kua-gratis-vs-di-luar-kantor-kua", name: "Biaya Nikah Resmi Kemenag: Nikah Gratis di KUA vs Rp600.000 di Luar KUA" },
      { slug: "tips-mengelola-amplop-kado-pernikahan-pasca-acara", name: "Manajemen Keuangan Pasca Nikah: Mengelola Uang Amplop untuk Modal Awal Rumah Tangga" },
      { slug: "pernikahan-tanpa-utang-panduan-realistis-anak-muda", name: "Menikah Tanpa Beban Utang: Panduan Finansial Realistis Pasangan Muda" },
      { slug: "tips-memilih-cincin-kawin-emas-vs-paladium", name: "Perbandingan Bahan Cincin Kawin: Emas Kuning, Emas Putih, Paladium, dan Platina" },
      { slug: "biaya-hantaran-dan-seserahan-pernikahan-efisien", name: "Menyusun Kotak Hantaran Seserahan yang Berisi Barang Kebutuhan Nyata" },
      { slug: "tips-memilih-mua-bagus-dengan-budget-terjangkau", name: "Cara Menemukan MUA Pengantin Berbakat Tanpa Harus Menguras Tabungan" },
      { slug: "tips-fotografi-wedding-paket-hemat-hasil-maksimal", name: "Memilih Paket Dokumentasi Foto & Video Wedding yang Bagus dan Sesuai Budget" },
      { slug: "menekan-biaya-cetak-buku-tamu-dengan-sistem-digital", name: "Mengganti Buku Tamu Kertas dengan QR Code Menghemat Waktu dan Kertas" },
      { slug: "tips-mengadakan-resepsi-di-kedai-kopi-kafe", name: "Tren Menikah di Coffee Shop: Konsep Kasual, Nyaman, dan Hemat Biaya" },
      { slug: "perhitungan-biaya-unduh-mantu-pihak-pria", name: "Mengatur Anggaran Acara Unduh Mantu / Ngunduh Mantu Pihak Pengantin Pria" },
      { slug: "tips-memilih-mc-dan-hiburan-musik-akustik", name: "Hiburan Pernikahan Hemat: Akustik Band 3 Personel vs Full Band Sound System" },
      { slug: "cara-menyusun-skala-prioritas-anggaran-pernikahan", name: "Matriks Prioritas: Komponen Apa yang Wajib Diutamakan dan Bisa Dipangkas" },
      { slug: "tips-memanfaatkan-promo-wedding-fair-dan-pameran", name: "Cara Cerdas Berburu Promo Paket Menikah di Wedding Expo dan Pameran" },
      { slug: "mengapa-undangan-digital-rp15000-adalah-investasi-terbaik", name: "Modal Rp15.000 Sekali Bayar: Manfaat Undangan Digital Simfoni Cinta" },
      { slug: "tips-kompromi-biaya-nikah-antara-orang-tua-dan-anak", name: "Seni Diplomasi dengan Orang Tua Soal Konsep Acara dan Batasan Anggaran" },
      { slug: "anggaran-bulan-madu-honeymoon-lokal-yang-romantis", name: "Alokasi Dana Bulan Madu Romantis di Dalam Negeri Tanpa Bikin Kantong Jebol" },
      { slug: "tips-mengatur-anggaran-seragam-bridesmaid-dan-keluarga", name: "Strategi Memberikan Bahan Seragam Keluarga dan Bridesmaid secara Efisien" },
      { slug: "menghindari-denda-overtime-sewa-gedung-pernikahan", name: "Pentingnya Mengatur Rundown Acara Ketat agar Terhindar Biaya Lembur Gedung" },
      { slug: "tips-memilih-waktu-pernikahan-low-season-harga-miring", name: "Menikah di Low Season: Trik Mendapatkan Potongan Harga Vendor Melimpah" },
      { slug: "anggaran-tes-kesehatan-pranikah-premarital-checkup", name: "Biaya dan Manfaat Premarital Check-Up di Puskesmas dan Laboratorium Klinik" },
      { slug: "tips-memilih-menu-pondokan-gubukan-favorit-tamu", name: "Kombinasi Menu Buffet dan Pondokan Populer yang Ramah di Kantong" },
      { slug: "biaya-administrasi-pernikahan-campuran-beda-negara", name: "Persiapan Biaya dan Dokumen Pernikahan Campuran Beda Kewarganegaraan" },
      { slug: "tips-membeli-souvenir-langsung-dari-pengrajin-pasar", name: "Berburu Souvenir Grosir ke Pusat Pasar Pengrajin untuk Selisih Harga Besar" },
      { slug: "manajemen-waktu-agar-tidak-cuti-kerja-terlalu-lama", name: "Perencanaan Cuti Menikah yang Efisien Tanpa Mengorbankan Karier Pekerjaan" },
      { slug: "tips-membuat-rundown-persiapan-dana-per-bulan", name: "Cashflow Planning Pernikahan: Jadwal Pembayaran DP dan Pelunasan Vendor" },
      { slug: "mengapa-banyak-pasangan-beralih-ke-undangan-digital", name: "Faktor Ekologis dan Ekonomis: Alasan Generasi Muda Meninggalkan Kertas Cetak" },
      { slug: "cara-mengatasi-kenaikan-harga-vendor-mendadak", name: "Pentingnya Kontrak Tertulis Bermaterai untuk Mengunci Harga Vendor" },
      { slug: "tips-mengatur-konsumsi-panitia-dan-keluarga-inti", name: "Memisahkan Anggaran Makanan Panitia Acara dan Tamu Undangan Utama" },
      { slug: "tips-memilih-mobil-pengantin-sewa-vs-mobil-pribadi", name: "Perlukah Sewa Mobil Pengantin Mewah? Alternatif Menghias Mobil Keluarga" },
      { slug: "anggaran-cetak-foto-kanvas-dan-album-kolase", name: "Memilih Paket Cetak Foto Kenangan: Album Kolase Digital vs Cetak Kanvas" },
      { slug: "tips-menghemat-biaya-pengiriman-undangan-jarak-jauh", name: "Nol Ongkos Kirim: Menyebarkan Undangan Web ke Kerabat di Luar Pulau dan Dunia" },
      { slug: "cara-mengukur-keberhasilan-efisiensi-anggaran-nikah", name: "Evaluasi Pasca Acara: Mengukur Selisih Rencana Anggaran dan Realisasi Biaya" },
      { slug: "mengatur-dana-pernikahan-jika-dibiayai-mandiri", name: "Kiat Bangga Menikah dengan Uang Sendiri Tanpa Membebani Orang Tua" },
      { slug: "tips-memilih-asuransi-perjalanan-bulan-madu", name: "Perlindungan Perjalanan Honeymoon untuk Rasa Nyaman Pasangan Baru" },
      { slug: "tips-membuat-rekening-bersama-persiapan-pernikahan", name: "Membuat Rekening Bank Bersama untuk Transparansi Keuangan Menjelang Nikah" },
      { slug: "ringkasan-penghematan-undangan-digital-simfoni-cinta", name: "Testimoni Riil: Pasangan yang Menghemat Jutaan Rupiah Berkat Simfoni Cinta" },
    ]
  },
  {
    category: "Kata-Kata & Doa",
    topics: [
      { slug: "kumpulan-doa-pernikahan-islami-ar-rum-21", name: "Teks Ayat Al-Qur'an Surat Ar-Rum Ayat 21 Lengkap Latin dan Artinya" },
      { slug: "doa-barakallahu-laka-wa-baraka-alaika-latin-dan-arti", name: "Doa Pernikahan Nabi SAW: Barakallahu Laka wa Baraka Alaika Lengkap" },
      { slug: "contoh-teks-undangan-pernikahan-islami-santun", name: "Contoh Susunan Teks Undangan Pernikahan Islami yang Santun dan Elegan" },
      { slug: "ayat-alkitab-pernikahan-kristen-1-korintus-13", name: "Kumpulan Ayat Alkitab Pernikahan Kristen Paling Populer: 1 Korintus 13 Kasih Sejati" },
      { slug: "contoh-doa-dan-teks-undangan-nikah-kristen-protestan", name: "Contoh Teks Undangan Pernikahan Kristen Protestan yang Penuh Berkat Tuhan" },
      { slug: "contoh-teks-undangan-pernikahan-katolik-resmi", name: "Format Teks Undangan Pernikahan Katolik Lengkap dengan Salam Pembuka Suci" },
      { slug: "kutipan-cinta-sastrawan-indonesia-sapardi-djoko-damono", name: "Kutipan Romantis Puisi Sapardi Djoko Damono untuk Undangan Pernikahan" },
      { slug: "kata-kata-mutiara-pernikahan-kahlil-gibran-menyentuh", name: "Untaian Kata Mutiara Pernikahan Kahlil Gibran yang Menyentuh Hati Tamu" },
      { slug: "pantun-pembuka-undangan-pernikahan-adat-melayu", name: "Kumpulan Pantun Pembuka Undangan Pernikahan Adat Melayu yang Elok" },
      { slug: "pantun-lucu-dan-akrab-undangan-pernikahan-betawi", name: "Koleksi Pantun Betawi Jenaka untuk Undangan Teman Kerja dan Sahabat" },
      { slug: "kata-kata-undangan-pernikahan-bahasa-jawa-kromo-inggil", name: "Serat Ulem Undangan Pernikahan Basa Jawa Kromo Inggil yang Halus" },
      { slug: "kata-kata-undangan-pernikahan-bahasa-sunda-lemes", name: "Uleman Nikah Basa Sunda Lemes: Kata-Kata Santun Penuh Keberkahan" },
      { slug: "contoh-teks-undangan-pernikahan-bahasa-inggris-elegan", name: "Contoh Wedding Invitation Wording Bahasa Inggris Formal dan Casual" },
      { slug: "contoh-kata-kata-undangan-pernikahan-singkat-via-wa", name: "Template Teks Pesan Singkat Sebar Undangan WhatsApp yang Ramah dan Sopan" },
      { slug: "teks-undangan-khusus-teman-kantor-dan-atasan-kerja", name: "Etika Mengundang Rekan Kantor dan Bos: Contoh Kata-Kata Formal Menghormati" },
      { slug: "kata-kata-undangan-pernikahan-tanpa-mengurangi-rasa-hormat", name: "Menuliskan Kalimat Permohonan Maaf Tanpa Mengurangi Rasa Hormat Digital" },
      { slug: "doa-kedua-mempelai-mohon-keturunan-shaleh-shalehah", name: "Doa Memohon Keturunan Shaleh dan Keluarga Sakinah Mawaddah Warahmah" },
      { slug: "contoh-ucapan-terima-kasih-di-undangan-pernikahan", name: "Untaian Kata Terima Kasih Pengantin Atas Doa Restu dan Kehadiran Tamu" },
      { slug: "teks-pengumuman-pernikahan-intimate-hanya-keluarga", name: "Cara Memberitahukan Konsep Intimate Wedding kepada Teman secara Halus" },
      { slug: "kata-kata-undangan-pernikahan-kedua-atau-duda-janda", name: "Contoh Teks Undangan Pernikahan Dewasa Penuh Syukur dan Kebijaksanaan" },
      { slug: "kutipan-hadits-nabi-tentang-keutamaan-pernikahan", name: "Kumpulan Hadits Shahih Tentang Keutamaan Menikah dan Menyempurnakan Agama" },
      { slug: "contoh-teks-undangan-unduh-mantu-ngunduh-mantu", name: "Format Teks Undangan Acara Ngunduh Mantu yang Sopan dari Keluarga Pria" },
      { slug: "kata-kata-undangan-khusus-tamu-vip-dan-tokoh-masyarakat", name: "Format Teks Undangan Eksklusif untuk Tamu Kehormatan dan Tokoh Adat" },
      { slug: "contoh-teks-undangan-pernikahan-outdoor-casual", name: "Gaya Bahasa Santai dan Hangat untuk Pesta Pernikahan Kebun Outdoor" },
      { slug: "kalimat-pengantar-amplop-digital-yang-sopan-santun", name: "Cara Menuliskan Informasi Kado / Amplop Digital Tanpa Terkesan Meminta" },
      { slug: "kata-kata-permintaan-doa-restu-orang-tua", name: "Kalimat Restu Orang Tua di Halaman Pembuka Undangan yang Menggetarkan Hati" },
      { slug: "contoh-teks-undangan-pernikahan-bahasa-arab-dan-arti", name: "Lafaz Undangan Berbahasa Arab: Walimatul Ursy Lengkap Terjemahannya" },
      { slug: "kutipan-surat-an-nur-ayat-32-kemandirian-menikah", name: "Kandungan dan Makna Surat An-Nur Ayat 32: Janji Allah Melapangkan Rezeki" },
      { slug: "kata-kata-undangan-pernikahan-anak-pertama-sulung", name: "Rasa Syukur Menikahkan Anak Pertama: Untaian Kata Haru Keluarga Besar" },
      { slug: "kata-kata-undangan-pernikahan-anak-bungsu", name: "Pelepasan Anak Bungsu Menuju Mahligai Rumah Tangga: Contoh Teks Undangan" },
      { slug: "contoh-pesan-pengingat-h-3-undangan-pernikahan", name: "Template Pesan Pengingat (Reminder H-3) Acara via WhatsApp yang Ramah" },
      { slug: "kata-kata-ucapan-selamat-menikah-terpopuler", name: "Inspirasi 20 Ucapan Selamat Menikah Terbaik untuk Tamu yang Mengisi Buku Tamu" },
      { slug: "doa-pengantin-baru-di-malam-pertama-menurut-sunnah", name: "Doa Memegang Kening Istri dan Shalat Sunnah Pengantin Menurut Tuntunan" },
      { slug: "contoh-puisi-cinta-pendek-untuk-halaman-undangan", name: "Kumpulan Puisi Romantis Singkat yang Cocok Disematkan pada Banner Undangan" },
      { slug: "kata-kata-bijak-pernikahan-habibie-dan-ainun", name: "Kisah Cinta Sejati B.J. Habibie dan Ainun: Inspirasi Kutipan Pernikahan Abadi" },
      { slug: "kutipan-pernikahan-tokoh-dunia-terkenal", name: "Quotes Pernikahan dari Tokoh Dunia yang Inspiratif dan Memperkaya Makna" },
      { slug: "contoh-teks-undangan-pernikahan-guru-dan-dosen", name: "Format Undangan Santun yang Ditujukan Khusus untuk Guru dan Dosen Tercinta" },
      { slug: "kata-kata-undangan-pernikahan-reuni-alumni-sekolah", name: "Mengundang Teman Sekolah dan Kuliah: Nuansa Nostalgia Penuh Kehangatan" },
      { slug: "teks-penjelasan-protokol-kehadiran-anak-anak", name: "Menjelaskan Kebijakan Kehadiran Anak Kecil (Adults-Only) secara Elegan" },
      { slug: "kata-kata-undangan-pernikahan-virtual-live-streaming", name: "Contoh Ajakan Menyaksikan Akad Nikah via Streaming YouTube dan Instagram" },
      { slug: "doa-nabi-ibrahim-untuk-keluarga-sakinah", name: "Doa Nabi Ibrahim AS dalam Membina Rumah Tangga yang Teguh Beribadah" },
      { slug: "contoh-teks-undangan-peringatan-ulang-tahun-pernikahan-perak", name: "Format Undangan Silver & Golden Wedding Anniversary 25 dan 50 Tahun" },
      { slug: "kata-kata-permohonan-maaf-karena-keterbatasan-tempat", name: "Kalimat Santun Memohon Maaf Kepada Kerabat yang Belum Sempat Terundang" },
      { slug: "contoh-teks-undangan-pernikahan-tema-alam-dan-lestari", name: "Pesan Lingkungan Hidup: Ajakan Mengurangi Sampah Plastik pada Pesta Pernikahan" },
      { slug: "doa-pembuka-acara-resepsi-pernikahan-nasional", name: "Teks Doa Pembuka Resepsi Pernikahan yang Khidmat untuk Dipimpin Pembawa Acara" },
      { slug: "pantun-penutup-undangan-pernikahan-berkesan", name: "Pantun Penutup Undangan Pernikahan yang Menancap di Ingatan Tamu" },
      { slug: "kata-kata-mutiara-kesetiaan-dalam-ikatan-suci", name: "Pesan Kesetiaan dan Janji Saling Menjaga dalam Suka Maupun Duka" },
      { slug: "contoh-teks-undangan-pernikahan-bahasa-batak", name: "Gonghon Dohot Jou-Jou: Susunan Teks Undangan Berbahasa Batak Toba Otentik" },
      { slug: "contoh-teks-undangan-pernikahan-bahasa-bali", name: "Atur Piuning Pemikatan Pawiwahan: Teks Undangan Tradisional Khas Bali" },
      { slug: "kumpulan-kata-kata-undangan-lengkap-di-simfoni-cinta", name: "Bank Kalimat dan Teks Undangan Siap Pakai di Aplikasi Simfoni Cinta" },
    ]
  },
  {
    category: "Vendor & Persiapan",
    topics: [
      { slug: "checklist-persiapan-pernikahan-12-bulan-lengkap", name: "Checklist Lengkap Persiapan Pernikahan 12 Bulan Menuju Hari-H Bahagia" },
      { slug: "tips-memilih-vendor-katering-pernikahan-terpercaya", name: "Panduan Memilih Vendor Katering: Uji Rasa (Food Tasting) dan Higienitas" },
      { slug: "cara-memilih-fotografer-dan-videografer-wedding", name: "Tips Memilih Tim Dokumentasi Foto & Video Wedding: Portofolio dan Chemistry" },
      { slug: "tips-memilih-makeup-artist-mua-tahan-lama", name: "Kriteria Memilih MUA Pengantin: Teknik Riasan, Portofolio, dan Uji Coba Makeup" },
      { slug: "panduan-memilih-venue-gedung-pernikahan-ideal", name: "Panduan Survei Gedung Pernikahan: Kapasitas Parkir, AC, dan Jam Sewa" },
      { slug: "tips-memilih-dekorasi-pelaminan-sesuai-tema", name: "Menyelaraskan Dekorasi Pelaminan, Bunga Meja, dan Pencahayaan Panggung" },
      { slug: "tugas-dan-tanggung-jawab-wedding-organizer-wo", name: "Peran Penting Wedding Organizer (WO): Koordinasi Hari-H Tanpa Stres" },
      { slug: "perbedaan-wedding-planner-dan-wedding-organizer", name: "Pahami Perbedaan Wedding Planner (Perencana) dan Wedding Organizer (Eksekutor)" },
      { slug: "tips-memilih-cincin-pernikahan-yang-nyaman-dipakai", name: "Panduan Memilih Ukuran dan Model Cincin Kawin untuk Pemakaian Sehari-hari" },
      { slug: "cara-mengurus-berkas-pernikahan-di-kua-kemenag", name: "Alur Lengkap Mengurus Dokumen Nikah di Kelurahan dan Kantor KUA Kemenag" },
      { slug: "syarat-mengurus-surat-numpang-nikah-beda-domisili", name: "Syarat dan Langkah Mengurus Surat Numpang Nikah Antar Kota atau Provinsi" },
      { slug: "panduan-membuat-rundown-acara-akad-nikah-dan-resepsi", name: "Contoh Rundown Acara Akad dan Resepsi Jam per Jam Bersama Tim Panitia" },
      { slug: "tips-memilih-souvenir-pernikahan-bermanfaat", name: "Rekomendasi Souvenir Pernikahan Berguna, Ringan Dibawa, dan Ramah Lingkungan" },
      { slug: "peran-bridesmaid-dan-groomsmen-tugas-hari-h", name: "Panduan Tugas Sahabat Pengantin (Bridesmaid & Groomsmen) Selama Acara" },
      { slug: "tips-menjaga-kebugaran-dan-kesehatan-menjelang-hari-h", name: "Tips Kesehatan dan Perawatan Kulit Calon Pengantin 1 Bulan Sebelum Nikah" },
      { slug: "cara-mengatasi-stres-dan-panik-menjelang-pernikahan", name: "Manajemen Stres Calon Pengantin (Wedding Jitters) dan Cara Mengatasinya" },
      { slug: "tips-memilih-sepatu-pengantin-yang-nyaman-berdiri-lama", name: "Memilih Sepatu Pengantin Wanita & Pria yang Nyaman Dipakai Berdiri 3 Jam" },
      { slug: "memilih-lagu-first-dance-dan-kirab-pengantin", name: "Daftar Lagu Pengiring Kirab Pengantin Masuk Gedung yang Megah dan Syahdu" },
      { slug: "panduan-gladi-bersih-rehearsal-sebelum-akad-nikah", name: "Pentingnya Gladi Bersih bagi Kedua Calon Mempelai dan Saksi Nikah" },
      { slug: "tips-memilih-jas-pengantin-pria-beskap-tuxedo", name: "Perbedaan Beskap Adat, Jas Formal Tuxedo, dan Setelan Modern Pengantin Pria" },
      { slug: "panduan-memilih-gaun-pengantin-hijab-elegan", name: "Inspirasi Gaun Pengantin Muslimah Berhijab: Menutup Aurat dan Tetap Menawan" },
      { slug: "tips-mengatur-meja-penerima-tamu-buku-hadir", name: "Mengelola Alur Meja Resepsi: Pembagian Souvenir dan Scan Barcode Tamu" },
      { slug: "perlengkapan-emergency-kit-pengantin-yang-wajib-ada", name: "Daftar Emergency Kit Pengantin Hari-H: Jarum Pentul, Obat Maag, hingga Tisu" },
      { slug: "tips-memilih-kue-pengantin-wedding-cake-estetik", name: "Tren Kue Pernikahan: Memilih Ukuran, Rasa, dan Dummy Cake yang Fotogenik" },
      { slug: "mengatur-area-photobooth-yang-disukai-tamu", name: "Merancang Spot Foto (Photobooth) Interaktif dengan Pencahayaan Optimal" },
      { slug: "tips-memilih-sound-system-dan-genset-cadangan", name: "Mencegah Insiden Mati Lampu: Pentingnya Genset Cadangan di Lokasi Acara" },
      { slug: "etika-mengundang-tamu-via-whatsapp-agar-tidak-spam", name: "Etika Sebar Undangan Digital: Waktu Pengiriman yang Pas dan Bahasa Santun" },
      { slug: "kapan-waktu-terbaik-menyebarkan-undangan-pernikahan", name: "Berapa Minggu Sebelum Acara Undangan Sebaiknya Disebar ke Tamu?" },
      { slug: "tips-mengatur-tempat-duduk-tamu-seating-chart", name: "Menyusun Denah Tempat Duduk (Seating Chart) untuk Acara Resepsi Formal" },
      { slug: "tips-memilih-vendor-lighting-efek-lampu-romantis", name: "Peran Efek Cahaya (Lighting Ambient) Membangun Suasana Magis di Gedung" },
      { slug: "memilih-paket-honeymoon-setelah-pesta-pernikahan", name: "Panduan Merencanakan Liburan Bulan Madu Tanpa Kelelahan Fisik" },
      { slug: "tips-briefing-keluarga-besar-dan-panitia-h-7", name: "Agenda Rapat Koordinasi Keluarga Besar (Kumbokarnan) H-7 Sebelum Acara" },
      { slug: "mengatur-parkir-dan-keamanan-di-lokasi-resepsi", name: "Koordinasi Keamanan, Petugas Parkir, dan Pengaturan Lalu Lintas Gedung" },
      { slug: "tips-memilih-cinderamata-orang-tua-dan-mertua", name: "Bentuk Ungkapan Syukur: Bingkisan Spesial untuk Kedua Orang Tua di Pelaminan" },
      { slug: "cara-menyimpan-gaun-dan-jas-pengantin-setelah-acara", name: "Tips Dry Cleaning dan Perawatan Busana Pengantin agar Tetap Awet Indah" },
      { slug: "manajemen-makanan-sisa-katering-pasca-resepsi", name: "Menyalurkan Kelebihan Makanan Katering ke Panti Asuhan dan Tetangga Sekitar" },
      { slug: "tips-mengelola-dokumen-buku-nikah-dan-kk-baru", name: "Mengurus Pembaruan KTP dan Kartu Keluarga Baru Setelah Sah Menikah" },
      { slug: "mengatasi-cuaca-hujan-saat-pernikahan-outdoor", name: "Rencana Cadangan (Plan B) Pernikahan Outdoor: Tenda Transparan dan Pawang Hujan" },
      { slug: "tips-memilih-kotak-cincin-dan-nampan-seserahan", name: "Estetika Nampan Seserahan Akrilik Transparan dan Kotak Cincin Kayu Ukir" },
      { slug: "peran-orang-tua-dalam-kelancaran-akad-nikah", name: "Kesiapan Wali Nikah dan Saksi Menjelang Pengucapan Ijab Kabul" },
      { slug: "tips-memilih-lagu-iringan-tari-adat-pernikahan", name: "Menyelaraskan Irama Musik Tradisional dengan Langkah Penari Pengiring" },
      { slug: "manfaat-menggunakan-undangan-digital-simfoni-cinta", name: "Mengapa Vendor Wedding Organizer Merekomendasikan Platform Simfoni Cinta" },
      { slug: "tips-memilih-sewa-tenda-pernikahan-di-rumah", name: "Panduan Memilih Tenda Plafon, Tenda Semi-VIP, dan Tenda Dekorasi Rumah" },
      { slug: "tips-menghindari-salah-paham-dengan-vendor-hari-h", name: "Pentingnya PIC (Person in Charge) dari Pihak Keluarga Menghadapi Vendor" },
      { slug: "tips-membuat-buku-panduan-acara-wedding-booklet", name: "Menyusun Buku Panduan Kecil Acara untuk Dibagikan ke Panitia Inti" },
      { slug: "tips-memilih-konsep-after-party-pernikahan-malam", name: "Konsep After Party Seru Bersama Teman Sebaya Pasca Resepsi Formal Selesai" },
      { slug: "tips-merawat-hubungan-harmonis-pasca-pernikahan", name: "Memulai Kehidupan Baru: Kunci Komunikasi Terbuka Pasangan Suami Istri" },
      { slug: "persiapan-mental-menjadi-suami-dan-istri-bertanggung-jawab", name: "Fondasi Keluarga Sakinah: Membangun Komitmen dan Kesabaran Bersama" },
      { slug: "evaluasi-vendor-pernikahan-dan-memberikan-ulasan", name: "Cara Memberikan Review Jujur dan Apresiasi bagi Vendor yang Bekerja Baik" },
      { slug: "simfoni-cinta-solusi-undangan-digital-terpercaya-indonesia", name: "Simfoni Cinta: Sahabat Terpercaya Setiap Pengantin Mewujudkan Pesta Impian" },
    ]
  }
];

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80"
];

console.log("Generating 300 AI-SEO optimized markdown blog articles...");

let totalGenerated = 0;
const articlesManifest = [];

for (const cluster of CLUSTERS) {
  for (const topic of cluster.topics) {
    totalGenerated++;
    const imgUrl = UNSPLASH_IMAGES[totalGenerated % UNSPLASH_IMAGES.length];
    const readTime = 5 + (totalGenerated % 4);
    const day = 1 + (totalGenerated % 28);
    const dateStr = `2026-08-${String(day).padStart(2, "0")}`;

    const summary = `${topic.name} menjadi panduan esensial bagi calon pengantin modern di Indonesia. Simfoni Cinta menghadirkan ulasan komprehensif mulai dari persiapan matang, makna filosofis mendalam, hingga solusi praktis undangan digital mulai Rp15.000 sekali bayar dengan fitur RSVP online, amplop digital QRIS, dan sebar WhatsApp instan.`;

    const points = [
      "Perencanaan Lebih Awal: Mulailah mempersiapkan aspek ini setidaknya 3 hingga 6 bulan sebelum hari-H untuk mengantisipasi perubahan jadwal atau ketersediaan vendor.",
      "Komunikasi Terbuka dengan Keluarga: Diskusikan ekspektasi kedua belah pihak keluarga secara transparan agar setiap keputusan disepakati bersama.",
      "Pemanfaatan Teknologi Digital: Gunakan platform undangan digital Simfoni Cinta untuk menyebarkan informasi acara secara rapi, cepat, dan tanpa batas kuota tamu.",
      "Efisiensi Anggaran: Alokasikan dana pada pos krusial seperti kenyamanan tamu dan katering sembari menghemat pos percetakan hingga 85% menggunakan undangan digital."
    ];

    const tableRows = [
      { aspect: "Biaya Pengeluaran", manual: "Jutaan rupiah untuk cetak & ongkir", digital: "Mulai Rp15.000 sekali bayar aktif selamanya" },
      { aspect: "Kecepatan Distribusi", manual: "Memerlukan hari via kurir", digital: "Terkirim seketika via WhatsApp & medsos" },
      { aspect: "Konfirmasi Kehadiran", manual: "Manual via telepon/chat terpisah", digital: "Sistem RSVP real-time langsung di dasbor" },
      { aspect: "Kado & Tanda Kasih", manual: "Tamu harus membawa uang tunai", digital: "Amplop digital & QRIS otomatis tanpa potongan" },
      { aspect: "Revisi Informasi", manual: "Cetak ulang mahal jika ada typo", digital: "Dapat diedit kapan saja secara realtime" }
    ];

    const faqs = [
      {
        q: `Kapan waktu terbaik mulai mempersiapkan topik ${topic.name}?`,
        a: "Waktu ideal adalah 3 hingga 6 bulan sebelum hari-H. Namun di platform Simfoni Cinta, informasi undangan dapat disesuaikan dalam hitungan menit."
      },
      {
        q: "Apakah topik ini relevan untuk intimate wedding?",
        a: "Sangat relevan. Format intimate wedding maupun pesta besar sama-sama membutuhkan struktur informasi yang rapi agar tamu merasa disambut dengan hormat."
      },
      {
        q: "Bagaimana cara mencantumkan informasi ini pada undangan digital?",
        a: "Anda dapat mencantumkan rute Google Maps, panduan busana (dresscode), susunan acara, hingga countdown timer langsung di dasbor Simfoni Cinta."
      }
    ];

    const mdContent = `---
title: "${topic.name}"
slug: "${topic.slug}"
category: "${cluster.category}"
summary: "${summary}"
thumbnail: "${imgUrl}"
readTime: ${readTime}
date: "${dateStr}"
author: "Tim Editorial Simfoni Cinta"
tags: ["undangan digital", "${cluster.category.toLowerCase()}", "pernikahan 2026", "simfoni cinta"]
keywords: ["${topic.name}", "undangan digital indonesia", "simfoni cinta", "tips pernikahan"]
---

# ${topic.name}

> **Ringkasan Inti (AI Overview / Direct Answer):**  
> ${summary}

---

## 1. Mengapa ${topic.name} Sangat Penting?

Merencanakan hari pernikahan membutuhkan ketelitian tingkat tinggi, keselarasan visi antar kedua keluarga, serta manajemen waktu dan anggaran yang efisien. Memahami setiap detail seputar **${topic.name}** akan membantu Anda dan pasangan menghindari kesalahpahaman, mengurangi stres menjelang hari bahagia, dan memastikan seluruh rangkaian acara terlaksana secara khidmat dan elegan.

Di era modern saat ini, perpaduan antara kearifan tradisi dan kemudahan teknologi digital menjadi kunci utama terciptanya pesta pernikahan yang berkesan bagi setiap tamu yang hadir.

---

## 2. Poin Kunci & Langkah Praktis

Berikut adalah poin-poin krusial yang wajib diperhatikan oleh calon mempelai:

${points.map((p, idx) => `${idx + 1}. **${p.split(":")[0]}:**${p.split(":")[1]}`).join("\n")}

---

## 3. Perbandingan Solusi Konvensional vs. Era Digital

| Aspek Pertimbangan | Metode Konvensional | Solusi Modern Simfoni Cinta |
| :--- | :--- | :--- |
${tableRows.map(r => `| ${r.aspect} | ${r.manual} | ${r.digital} |`).join("\n")}

---

## 4. Pertanyaan Umum (FAQ seputar ${topic.name})

${faqs.map((f, idx) => `### Q${idx + 1}: ${f.q}\n**Jawaban:** ${f.a}\n`).join("\n")}

---

Tertarik membuat undangan digital elegan dengan fitur terlengkap mulai Rp15.000? Kunjungi koleksi tema kami di [Simfoni Cinta](https://simfonicinta.my.id/#template) dan buat undangan impian Anda sekarang juga!
`;

    const contentFilePath = path.join(contentBlogDir, `${topic.slug}.md`);
    const publicFilePath = path.join(publicBlogDir, `${topic.slug}.md`);

    fs.writeFileSync(contentFilePath, mdContent, "utf-8");
    fs.writeFileSync(publicFilePath, mdContent, "utf-8");

    articlesManifest.push({
      slug: topic.slug,
      title: topic.name,
      category: cluster.category,
      summary,
      thumbnail: imgUrl,
      readTime,
      date: dateStr,
      author: "Tim Editorial Simfoni Cinta",
      tags: ["undangan digital", cluster.category.toLowerCase(), "pernikahan 2026", "simfoni cinta"],
      keywords: [topic.name, "undangan digital indonesia", "simfoni cinta", "tips pernikahan"],
      points,
      tableRows,
      faqs
    });
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(articlesManifest, null, 2), "utf-8");
console.log(`✓ Generated ${totalGenerated} articles in content/blog/ & public/blog/`);
console.log(`✓ Generated rich manifest at src/data/blog-manifest.json`);

// Update public/llms.txt
let llmsTxt = `# Simfoni Cinta

> Platform undangan digital pernikahan elegan, modern, dan lengkap di Indonesia dengan biaya hemat mulai dari Rp15.000 sekali bayar.

Simfoni Cinta (https://simfonicinta.my.id) adalah penyedia layanan pembuatan website undangan pernikahan digital interaktif di Indonesia. Menawarkan fitur lengkap seperti alunan musik latar romantis, amplop kado digital & QRIS otomatis, konfirmasi kehadiran tamu (RSVP) real-time, navigasi Google Maps presisi, galeri foto & video, serta generator link pesan WhatsApp otomatis tanpa batas jumlah tamu.

## Fitur Unggulan

- [Koleksi Template Desain](https://simfonicinta.my.id/#template): Desain bertema Adat Nusantara (Batak, Jawa, Minang, Sunda, Bali), Minimalis Modern, Floral Sage, dan Luxury Gold.
- [Amplop Digital & QRIS](https://simfonicinta.my.id/#fitur): Terima kado pernikahan langsung ke rekening bank atau dompet digital tanpa potongan pihak ketiga.
- [RSVP & Buku Tamu Online](https://simfonicinta.my.id/#fitur): Kelola konfirmasi kehadiran dan doa restu tamu secara real-time melalui dashboard mempelai.
- [Generator WhatsApp & Unlimited Tamu](https://simfonicinta.my.id/#fitur): Buat tautan undangan personal dengan nama tamu otomatis tanpa batasan kuota penerima.
- [Layar Sapa Resepsi QR Code](https://simfonicinta.my.id/#fitur): Sistem check-in modern di meja resepsi dengan pemindaian barcode tamu.

## Paket & Harga

- [Paket Silver (Rp15.000)](https://simfonicinta.my.id/#harga): Masa aktif 1 tahun, template standar, unlimited nama tamu, amplop 1 rekening bank.
- [Paket Gold (Rp35.000)](https://simfonicinta.my.id/#harga): Masa aktif selamanya, semua template premium, musik latar kustom, galeri 20 foto, multi rekening QRIS, RSVP real-time.
- [Paket Platinum (Rp75.000)](https://simfonicinta.my.id/#harga): Semua fitur Gold + domain kustom (.my.id / .com), layar sapa resepsi, buku tamu barcode, prioritas pembuatan kilat, dukungan admin prioritas 24/7.

## Panduan & Artikel Pernikahan (Knowledge Base 300 Artikel)

`;

for (const a of articlesManifest) {
  llmsTxt += `- [${a.title}](https://simfonicinta.my.id/berita/${a.slug}): ${a.summary}\n`;
}

llmsTxt += `\n## Informasi Resmi\n\n- URL Kanonikal: https://simfonicinta.my.id\n- Email Kontak: halo@simfonicinta.my.id\n`;
fs.writeFileSync(llmsTxtPath, llmsTxt, "utf-8");
console.log(`✓ Updated public/llms.txt with all 300 articles`);

// Update public/llms-full.txt
let llmsFullTxt = `# Simfoni Cinta — Full Knowledge Base & AI-SEO Documentation

Domain: https://simfonicinta.my.id
Platform: Platform Pembuatan Undangan Digital Elegan Mulai Rp15.000 Sekali Bayar Tanpa Biaya Berlangganan

---

`;

for (const a of articlesManifest) {
  llmsFullTxt += `## ${a.title}\nURL: https://simfonicinta.my.id/berita/${a.slug}\nMarkdown URL: https://simfonicinta.my.id/blog/${a.slug}.md\nKategori: ${a.category}\nRingkasan: ${a.summary}\n\n`;
}
fs.writeFileSync(llmsFullTxtPath, llmsFullTxt, "utf-8");
console.log(`✓ Updated public/llms-full.txt with 300 articles`);

// Update public/sitemap.xml
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://simfonicinta.my.id/</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/demo</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://simfonicinta.my.id/berita</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

for (const a of articlesManifest) {
  sitemap += `  <url>
    <loc>https://simfonicinta.my.id/berita/${a.slug}</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
}

sitemap += `  <url>
    <loc>https://simfonicinta.my.id/login</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap, "utf-8");
console.log(`✓ Updated public/sitemap.xml with all 300 article URLs`);
