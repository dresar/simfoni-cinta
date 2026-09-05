import tplMatcha from "@/assets/tpl-matcha.jpg";
import tplButterfly from "@/assets/tpl-butterfly.jpg";
import tplFloral from "@/assets/tpl-floral.jpg";
import tplMinimalist from "@/assets/tpl-minimalist.jpg";
import tplKorean from "@/assets/tpl-korean.jpg";
import tplRustic from "@/assets/tpl-rustic.jpg";
import tplLuxury from "@/assets/tpl-luxury.jpg";
import tplTraditional from "@/assets/tpl-traditional.jpg";
import tplModern from "@/assets/tpl-modern.jpg";
import tplIslamic from "@/assets/tpl-islamic.jpg";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

export interface SubMenuItem {
	label: string;
	href: string;
	desc?: string;
	categoryFilter?: string;
}

export interface NavLinkItem {
	label: string;
	href: string;
	submenus?: SubMenuItem[];
}

export const navLinks: NavLinkItem[] = [
	{ label: "Beranda", href: "/#beranda" },
	{
		label: "Template",
		href: "/#template",
		submenus: [
			{
				label: "Adat Nusantara",
				href: "/#template",
				categoryFilter: "Adat Nusantara",
				desc: "Batak, Jawa, Minang, Sunda & Bali",
			},
			{
				label: "Minimalis & Modern",
				href: "/#template",
				categoryFilter: "Minimalis",
				desc: "Desain simpel, bersih & kontemporer",
			},
			{
				label: "Floral & Botanical",
				href: "/#template",
				categoryFilter: "Floral & Sage",
				desc: "Nuansa bunga sage romantis",
			},
			{
				label: "Luxury & Gold",
				href: "/#template",
				categoryFilter: "Elegant & Luxury",
				desc: "Kemewahan aksen emas berkilau",
			},
		],
	},
	{
		label: "Fitur",
		href: "/#fitur",
		submenus: [
			{
				label: "WhatsApp Blast",
				href: "/#fitur",
				desc: "Kirim undangan otomatis ke ribuan kontak",
			},
			{
				label: "Amplop Digital & QRIS",
				href: "/fitur",
				desc: "Penerimaan hadiah (Tahap Pengembangan)",
			},
			{
				label: "RSVP & Buku Tamu",
				href: "/fitur",
				desc: "Konfirmasi kehadiran (Tahap Pengembangan)",
			},
			{
				label: "Meja Resepsi QR",
				href: "/fitur",
				desc: "Check-in scan QR (Tahap Pengembangan)",
			},
		],
	},
	{ label: "Cara Kerja", href: "/#cara-kerja" },
	{ label: "Harga", href: "/#harga" },
	{ label: "FAQ", href: "/#faq" },
	{
		label: "Berita",
		href: "/berita",
		submenus: [
			{
				label: "Tips Memilih Undangan",
				href: "/berita/tips-memilih-vendor-catering",
				desc: "Panduan praktis sebelum mencetak digital",
			},
			{
				label: "Tren Pernikahan 2026",
				href: "/berita/tren-tema-pernikahan-2026",
				desc: "Gaya dekorasi dan tema modern",
			},
			{
				label: "Panduan Undangan Digital",
				href: "/berita/panduan-undangan-digital",
				desc: "Langkah mudah menyiapkan undangan",
			},
		],
	},
];

export type Template = {
	name: string;
	slug: string;
	category: string;
	categoryKey: string;
	desc: string;
	image: string;
	couple: string;
};

export const categories = [
	"Semua",
	"Adat Nusantara",
	"Minimalis",
	"Floral & Sage",
	"Elegant & Luxury",
	"Islamic & Syukuran",
	"Modern",
];

export const templates: Template[] = [
	{
		name: "Batak Merah Emas",
		slug: "batak-merah",
		category: "Adat Nusantara",
		categoryKey: "Adat Nusantara",
		desc: "Ornamen tenun Ulos Batak Toba & Karo bernuansa merah marun dan emas mewah.",
		image: tplTraditional,
		couple: "Bimo & Larasati",
	},
	{
		name: "Blue Butterfly",
		slug: "blue-butterfly",
		category: "Elegant & Luxury",
		categoryKey: "Elegant & Luxury",
		desc: "Biru pastel dengan kupu-kupu halus, ringan, modern, dan romantis.",
		image: tplButterfly,
		couple: "Bagas & Sekar",
	},
	{
		name: "Sage Watercolor",
		slug: "sage-watercolor",
		category: "Floral & Sage",
		categoryKey: "Floral & Sage",
		desc: "Hijau sage lembut dengan dedaunan cat air botanik yang menenangkan.",
		image: tplMatcha,
		couple: "Arya & Nadia",
	},
	{
		name: "Minimalist Cream",
		slug: "minimalist-cream",
		category: "Minimalis",
		categoryKey: "Minimalis",
		desc: "Bersih, luas, dan tenang. Fokus penuh pada tipografi nama mempelai.",
		image: tplMinimalist,
		couple: "Reza & Kirana",
	},
	{
		name: "Melayu Padang",
		slug: "melayu-padang",
		category: "Adat Nusantara",
		categoryKey: "Adat Nusantara",
		desc: "Motif songket Minangkabau dan Melayu dengan sentuhan emas megah.",
		image: tplLuxury,
		couple: "Farrel & Vania",
	},
	{
		name: "Lion Royal Gold",
		slug: "lion-february",
		category: "Elegant & Luxury",
		categoryKey: "Elegant & Luxury",
		desc: "Monogram kerajaan beraksen emas foil dengan bingkai geometris presisi.",
		image: tplModern,
		couple: "Adit & Nayla",
	},
	{
		name: "Emerald UICI",
		slug: "emerald-uici",
		category: "Islamic & Syukuran",
		categoryKey: "Islamic & Syukuran",
		desc: "Hijau zamrud dan kaligrafi emas dengan nuansa syar'i islami berkelas.",
		image: tplIslamic,
		couple: "Fikri & Zahra",
	},
	{
		name: "Fresh Halal Bihalal",
		slug: "fresh-halal-bihalal",
		category: "Islamic & Syukuran",
		categoryKey: "Islamic & Syukuran",
		desc: "Tema segar untuk syukuran pernikahan, reuni keluarga, dan silaturahmi akbar.",
		image: tplFloral,
		couple: "Dimas & Ayu",
	},
	{
		name: "Kalibrasi Hati",
		slug: "kalibrasi-hati",
		category: "Minimalis",
		categoryKey: "Minimalis",
		desc: "Estetika indie akustik yang intim, puitis, dan penuh kehangatan cerita cinta.",
		image: tplRustic,
		couple: "Ilham & Tari",
	},
	{
		name: "Nusantara Heritage",
		slug: "nusantara-gas",
		category: "Adat Nusantara",
		categoryKey: "Adat Nusantara",
		desc: "Koleksi motif ragam hias kebudayaan Nusantara yang kaya nilai tradisi.",
		image: tplTraditional,
		couple: "Yudha & Mira",
	},
	{
		name: "Sweet Pink Party",
		slug: "pink-party",
		category: "Floral & Sage",
		categoryKey: "Floral & Sage",
		desc: "Palet pink blossom yang ceria untuk pernikahan romantis dan pesta resepsi.",
		image: tplKorean,
		couple: "Aldi & Syifa",
	},
	{
		name: "Shalvynne Champagne",
		slug: "shalvynne",
		category: "Modern",
		categoryKey: "Modern",
		desc: "Warna champagne dan ivory kontemporer dengan tata letak editorial majalah.",
		image: tplModern,
		couple: "Rian & Natasha",
	},
	{
		name: "Shining Starlight",
		slug: "shining",
		category: "Elegant & Luxury",
		categoryKey: "Elegant & Luxury",
		desc: "Kilau bintang malam dan partikel cahaya lembut untuk resepsi malam hari.",
		image: tplLuxury,
		couple: "Dion & Felicia",
	},
	{
		name: "Bon Voyage Travel",
		slug: "bonvoyage-v4",
		category: "Modern",
		categoryKey: "Modern",
		desc: "Konsep boarding pass dan paspor petualangan untuk destination wedding.",
		image: tplRustic,
		couple: "Rifky & Amanda",
	},
	{
		name: "Buka Bersama Syukuran",
		slug: "buka-bersama",
		category: "Islamic & Syukuran",
		categoryKey: "Islamic & Syukuran",
		desc: "Nuansa lentera malam Ramadhan untuk acara buka bersama dan walimah khitan.",
		image: tplIslamic,
		couple: "Haikal & Keluarga",
	},
	{
		name: "ADM Gathering Family",
		slug: "adm-gathering",
		category: "Modern",
		categoryKey: "Modern",
		desc: "Undangan digital multi-acara untuk temu kangen, reuni akbar, dan gathering kantor.",
		image: tplFloral,
		couple: "Keluarga Besar ADM",
	},
];

export const featureGroups = [
	{
		title: "Tamu & Penyebaran",
		caption: "Kelola dan sebar undangan tanpa batas.",
		items: [
			"Sebar & Ubah Nama Tamu Tanpa Batas",
			"Ubah Nama Tamu Unlimited",
			"Tanpa Masa Aktif",
			"Sebar Ke Unlimited Penerima",
			"QRCode Buku Tamu",
			"Layar Sapa & Check-in Tamu",
			"Laporan Statistik Sebar",
			"Balas Ucapan Tamu",
		],
	},
	{
		title: "Konten & Tampilan",
		caption: "Format multimedia terlengkap dan interaktif.",
		items: [
			"Import Lagu Sendiri",
			"Video Background Cover",
			"Amplop Digital & QRIS Dinamis",
			"Navigasi Google Maps Presisi",
			"Love Story & Timeline Interaktif",
			"Galeri Foto Masonry & Lightbox",
			"Countdown Waktu Mundur",
			"Bebas Pilih Font & Warna",
		],
	},
	{
		title: "WhatsApp & Broadcast",
		caption: "Kirim undangan otomatis lewat WhatsApp.",
		items: [
			"Kirim WhatsApp Sekali Klik",
			"Template Pesan Personal",
			"Auto Mention Nama Tamu",
			"Status RSVP Masuk Notifikasi",
			"Filter Tamu VIP & Reguler",
			"Ekspor Kontak ke Excel / CSV",
			"Preview Link WhatsApp Cantik",
			"Dukungan WhatsApp Web & Mobile",
		],
	},
];

export const steps = [
	{
		step: "01",
		title: "Pilih Desain",
		desc: "Pilih dari 16+ template premium Nusantara, Modern, Floral, atau Syar'i.",
	},
	{
		step: "02",
		title: "Isi Data & Cerita",
		desc: "Masukkan detail mempelai, akad, resepsi, galeri foto, dan rekening amplop.",
	},
	{
		step: "03",
		title: "Sebar ke Semua Tamu",
		desc: "Bagikan link personal ke kontak WhatsApp tanpa batas penerima selamanya.",
	},
];

export const pricingPlans = [
	{
		name: "Silver",
		price: 15000,
		badge: "Ekonomis",
		desc: "Pilihan hemat untuk acara sederhana.",
		features: [
			"1 Pilihan Desain Standar",
			"Unlimited Nama Tamu",
			"Masa Aktif 1 Tahun",
			"Countdown & Google Maps",
			"Amplop Digital (1 Rekening)",
			"RSVP Standar",
		],
		popular: false,
	},
	{
		name: "Gold",
		price: 49000,
		badge: "Paling Populer",
		desc: "Pilihan terbaik untuk pernikahan lengkap dan elegan.",
		features: [
			"Bebas Ganti Semua Tema Premium",
			"Tanpa Masa Aktif (Selamanya)",
			"Unlimited Nama Tamu & Broadcast",
			"Musik Latar Kustom + Video Cover",
			"Amplop Digital QRIS + Multi Rekening",
			"Love Story & Galeri Foto 20 Foto",
			"QRCode Check-In Tamu",
			"Balas Ucapan Realtime",
		],
		popular: true,
	},
	{
		name: "Platinum",
		price: 99000,
		badge: "Eksklusif",
		desc: "Fitur VIP terlengkap dengan domain kustom.",
		features: [
			"Semua Fitur Paket Gold",
			"Domain Kustom (nama.com / .id)",
			"Layar Sapa Resepsi (Smart Display)",
			"Buku Tamu Digital + Cetak Barcode",
			"Prioritas Antrian Pembuatan (10 Menit)",
			"Dukungan Admin Khusus 24/7",
		],
		popular: false,
	},
];

export const testimonials = [
	{
		name: "Rian & Anisa",
		email: "r***n@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=RianAnisa&backgroundColor=d1fae5",
		event: "Pernikahan di Bandung",
		rating: 5,
		comment:
			"Keren banget! Tamu-tamu pada kagum waktu buka undangannya, ada musiknya dan amplop QRISnya langsung masuk rekening. Sebar ke 800 tamu gampang poll!",
	},
	{
		name: "Budi & Sarah",
		email: "b***i@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=BudiSarah&backgroundColor=fef9c3",
		event: "Pernikahan di Jakarta",
		rating: 5,
		comment:
			"Desain Batak Merah-nya mewah abis, ornamennya otentik banget. Loadingnya juga kenceng, gak berat sama sekali waktu dibuka di HP.",
	},
	{
		name: "Farhan & Dinda",
		email: "f***n@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=FarhanDinda&backgroundColor=dbeafe",
		event: "Resepsi di Surabaya",
		rating: 5,
		comment:
			"RSVP sama ucapannya langsung keliatan realtime, ngebantu banget buat hitung porsi katering. Gak ada drama salah hitung deh!",
	},
	{
		name: "Kevin & Naomi",
		email: "k***n@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=KevinNaomi&backgroundColor=fce7f3",
		event: "Pernikahan di Yogyakarta",
		rating: 5,
		comment:
			"Prosesnya cepet banget, dari pilih template sampe undangan jadi cuma sejam. Adminnya responsif dan sabar banget ladenin revisi berkali-kali.",
	},
	{
		name: "Aldi & Syifa",
		email: "a***i@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=AldiSyifa&backgroundColor=d1fae5",
		event: "Akad & Resepsi di Medan",
		rating: 5,
		comment:
			"Suka banget sama fitur broadcast WhatsApp-nya! Tinggal klik, nama tamu udah otomatis masuk ke pesannya. Hemat waktu & tenaga banget!",
	},
	{
		name: "Dimas & Ayu",
		email: "d***s@yahoo.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=DimasAyu&backgroundColor=ffe4e6",
		event: "Pernikahan di Semarang",
		rating: 5,
		comment:
			"Templatenya cantik-cantik semua, susah milihnya hehe. Akhirnya pilih Sage Watercolor dan tamu-tamu pada bilang undangannya 'aesthetic' banget!",
	},
	{
		name: "Ilham & Tari",
		email: "i***m@yahoo.co.id",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=IlhamTari&backgroundColor=fef3c7",
		event: "Walimah di Makassar",
		rating: 5,
		comment:
			"Fitur check-in QR Code di meja resepsinya kece banget. Tamu tinggal scan, langsung muncul nama di layar. Petugasnya juga jadi lebih mudah kerjanya.",
	},
	{
		name: "Gilang & Rossa",
		email: "g***g@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=GilangRossa&backgroundColor=e0e7ff",
		event: "Pernikahan di Bali",
		rating: 5,
		comment:
			"Galeri fotonya tampil rapi banget pake layout masonry. Tamu-tamu bilang undangan kami kayak website majalah, bukan undangan biasa. Worth it banget!",
	},
	{
		name: "Dion & Felicia",
		email: "d***n@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=DionFelicia&backgroundColor=fce7f3",
		event: "Resepsi di Surabaya",
		rating: 5,
		comment:
			"Amplop digital QRIS-nya praktis banget! Banyak saudara dari luar kota yang kirim hadiah lewat sini karena gak sempet hadir. Jadi tetep berasa hadir!",
	},
	{
		name: "Rifky & Amanda",
		email: "r***y@gmail.com",
		avatar:
			"https://api.dicebear.com/9.x/thumbs/svg?seed=RifkyAmanda&backgroundColor=d1fae5",
		event: "Destination Wedding di Lombok",
		rating: 5,
		comment:
			"Paket Terima Beres-nya juara! Tinggal kasih data, semua diurus adminnya sampe jadi. Fokus nyiapin hari-H aja tanpa drama bikin undangan.",
	},
];

export type ComparisonRow = {
	feature: string;
	silver: boolean | string;
	gold: boolean | string;
	platinum: boolean | string;
};

export const comparison: ComparisonRow[] = [
	{
		feature: "Pilihan Template",
		silver: "Standar",
		gold: "Semua Premium",
		platinum: "Semua Premium",
	},
	{
		feature: "Masa Aktif",
		silver: "1 Tahun",
		gold: "Selamanya",
		platinum: "Selamanya",
	},
	{ feature: "Unlimited Nama Tamu", silver: true, gold: true, platinum: true },
	{ feature: "Broadcast WhatsApp", silver: false, gold: true, platinum: true },
	{ feature: "Musik Latar Kustom", silver: false, gold: true, platinum: true },
	{
		feature: "Video Background Cover",
		silver: false,
		gold: true,
		platinum: true,
	},
	{
		feature: "Amplop Digital & QRIS",
		silver: "1 Rekening",
		gold: "Multi Rekening",
		platinum: "Multi Rekening",
	},
	{
		feature: "Galeri Foto",
		silver: false,
		gold: "20 Foto",
		platinum: "20 Foto",
	},
	{
		feature: "Love Story & Timeline",
		silver: false,
		gold: true,
		platinum: true,
	},
	{
		feature: "QRCode Check-In Tamu",
		silver: false,
		gold: true,
		platinum: true,
	},
	{
		feature: "Balas Ucapan Realtime",
		silver: false,
		gold: true,
		platinum: true,
	},
	{ feature: "Domain Kustom", silver: false, gold: false, platinum: true },
	{ feature: "Layar Sapa Resepsi", silver: false, gold: false, platinum: true },
	{
		feature: "Buku Tamu Digital + Barcode",
		silver: false,
		gold: false,
		platinum: true,
	},
	{
		feature: "Prioritas Pembuatan (10 Menit)",
		silver: false,
		gold: false,
		platinum: true,
	},
	{
		feature: "Dukungan Admin Khusus 24/7",
		silver: false,
		gold: false,
		platinum: true,
	},
];

export type FaqCategory = "Umum" | "Fitur" | "Paket" | "Pembayaran";

export type Faq = {
	q: string;
	a: string;
	category: FaqCategory;
};

export const faqs: Faq[] = [
	{
		q: "Apakah ada batasan jumlah tamu yang bisa saya undang?",
		a: "Tidak ada batasan sama sekali. Anda bebas membuat nama tamu sebanyak apapun dan menyebarkan undangan ke ribuan orang sekaligus tanpa biaya tambahan. Fitur unlimited tamu berlaku di semua paket termasuk paket Hemat.",
		category: "Umum",
	},
	{
		q: "Berapa lama undangan saya akan aktif?",
		a: "Untuk paket Gold dan Platinum, undangan Anda aktif selamanya tanpa masa kedaluwarsa. Paket Hemat memiliki masa aktif 1 tahun sejak tanggal pembuatan. Anda bisa upgrade kapan saja untuk mendapatkan akses selamanya.",
		category: "Umum",
	},
	{
		q: "Berapa lama proses pembuatan undangan?",
		a: "Sangat cepat — hanya sekitar 5 menit. Cukup pilih template, isi formulir data acara seperti nama mempelai, tanggal, dan lokasi, unggah foto, lalu undangan langsung bisa disebar. Tidak perlu keahlian desain apapun.",
		category: "Umum",
	},
	{
		q: "Apakah saya bisa mengedit data undangan setelah selesai dibuat?",
		a: "Ya, Anda bisa mengedit semua data undangan kapan saja dan sebanyak apapun secara realtime. Perubahan langsung tampil tanpa perlu membuat ulang link atau mengirim ulang ke tamu. Revisi tidak dibatasi di semua paket.",
		category: "Umum",
	},
	{
		q: "Bagaimana cara kerja amplop digital dan QRIS?",
		a: "Tamu cukup membuka undangan dan menekan tombol amplop digital. Mereka bisa langsung menyalin nomor rekening bank Anda (BCA, Mandiri, BRI, dll) atau memindai barcode QRIS dinamis langsung dari layar smartphone. Dana masuk langsung ke rekening Anda tanpa perantara.",
		category: "Fitur",
	},
	{
		q: "Apakah fitur broadcast WhatsApp benar-benar otomatis?",
		a: "Ya. Setelah daftar tamu diunggah, sistem kami menghasilkan link WhatsApp personal untuk setiap tamu dengan nama yang sudah tersemat otomatis di pesan. Anda cukup klik satu kali per kontak atau gunakan fitur batch untuk mengirim massal melalui WhatsApp Web. Nama tamu berubah otomatis di setiap pesan.",
		category: "Fitur",
	},
	{
		q: "Bagaimana sistem QR check-in di meja resepsi bekerja?",
		a: "Setiap tamu mendapatkan QR Code unik di undangan mereka. Petugas meja resepsi cukup membuka halaman Layar Sapa di tablet atau laptop, lalu scan QR Code tamu menggunakan kamera. Nama tamu langsung muncul di layar besar secara otomatis beserta ucapan selamat datang yang bisa dikustomisasi.",
		category: "Fitur",
	},
	{
		q: "Apakah musik latar bisa diputar di iPhone dan Android?",
		a: "Bisa di semua perangkat modern termasuk iPhone (iOS 14+) dan Android. Namun kebijakan browser Safari di iPhone mengharuskan pengguna berinteraksi dahulu (tap layar) sebelum audio dapat diputar secara otomatis — ini adalah batasan sistem operasi, bukan dari platform kami. Di Android, musik langsung berjalan otomatis.",
		category: "Fitur",
	},
	{
		q: "Apakah ucapan dan buku tamu bisa dimoderasi?",
		a: "Ya. Anda memiliki panel moderasi penuh untuk menyetujui, menyembunyikan, atau menghapus ucapan sebelum tampil di undangan. Anda juga bisa membalas ucapan tamu langsung dari dashboard, dan tamu yang mengirim ucapan akan melihat balasan Anda di halaman undangan.",
		category: "Fitur",
	},
	{
		q: "Apa perbedaan utama antara paket Hemat, Gold, dan Platinum?",
		a: "Paket Hemat (Rp15.000) cocok untuk kebutuhan dasar dengan template standar dan masa aktif 1 tahun. Paket Gold (Rp35.000) membuka semua template premium, masa aktif selamanya, musik kustom, video cover, QRIS multi rekening, galeri foto, dan QR check-in. Paket Platinum (Rp75.000) menambahkan domain kustom, Layar Sapa resepsi, buku tamu digital dengan barcode, serta dukungan admin khusus 24/7.",
		category: "Paket",
	},
	{
		q: "Apakah ada biaya tambahan setelah membeli paket?",
		a: "Tidak ada biaya tersembunyi. Harga yang tertera sudah mencakup semua fitur yang disebutkan di paket masing-masing. Satu-satunya biaya tambahan hanyalah jika Anda memilih upgrade paket atau menambahkan domain kustom yang dibeli terpisah.",
		category: "Paket",
	},
	{
		q: "Metode pembayaran apa saja yang tersedia?",
		a: "Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), dompet digital (GoPay, OVO, Dana, ShopeePay), dan QRIS dari semua aplikasi perbankan. Pembayaran dikonfirmasi oleh admin kami dalam waktu 5–15 menit pada jam operasional (08.00–21.00 WIB setiap hari). Setelah konfirmasi, undangan langsung aktif.",
		category: "Pembayaran",
	},
];

export const blogPosts = [
	{
		title: "7 Tips Memilih Vendor Catering Pernikahan yang Tepat",
		date: "20 Agustus 2026",
		category: "Tips Pernikahan",
		tag: "Tips",
		excerpt:
			"Memilih catering bukan sekadar soal rasa. Pelajari faktor-faktor penting yang wajib dipertimbangkan agar hari spesialmu berjalan sempurna.",
		image: blog1,
		slug: "tips-memilih-vendor-catering",
	},
	{
		title: "Tren Tema Pernikahan 2026: Dari Minimalis hingga Ethereal Garden",
		date: "15 Agustus 2026",
		category: "Tren Tema",
		tag: "Tren",
		excerpt:
			"Dunia pernikahan terus berevolusi. Temukan tema-tema yang paling diminati pasangan di tahun 2026 dan cari inspirasi untuk hari baikmu.",
		image: blog2,
		slug: "tren-tema-pernikahan-2026",
	},
	{
		title: "Panduan Lengkap Membuat Undangan Digital yang Berkesan",
		date: "10 Agustus 2026",
		category: "Panduan",
		tag: "Panduan",
		excerpt:
			"Undangan digital bukan sekadar pengganti kertas. Dengan fitur yang tepat, undanganmu bisa menjadi pengalaman yang tak terlupakan bagi tamu.",
		image: blog3,
		slug: "panduan-undangan-digital",
	},
];
