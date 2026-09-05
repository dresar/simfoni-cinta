import { db } from "@/lib/db/client";
import { adminSettings } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { eq } from "drizzle-orm";
import { z } from "zod";

const SETTINGS_ID = "master";
const CACHE_KEY = "api:admin_settings";

export const FaqItemSchema = z.object({
	id: z.string(),
	question: z.string(),
	answer: z.string(),
	category: z.string().default("Umum"),
});

export const TestimonialItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	role: z.string().default("Pengantin Bahagia"),
	rating: z.number().default(5),
	text: z.string(),
	avatar: z.string().default(""),
	weddingDate: z.string().default(""),
});

export const SubMenuSchema = z.object({
	label: z.string(),
	href: z.string(),
	desc: z.string().optional(),
});

export const MenuItemSchema = z.object({
	label: z.string(),
	href: z.string(),
	submenus: z.array(SubMenuSchema).optional(),
});

export const PricingPackageSchema = z.object({
	id: z.enum(["silver", "gold", "platinum"]),
	name: z.string(),
	price: z.number(),
	originalPrice: z.number().default(75000),
	badge: z.string().optional().default(""),
	popular: z.boolean().optional().default(false),
	features: z.array(z.string()).default([]),
	maxPhotos: z.union([z.number(), z.literal("unlimited")]).default(10),
	maxWaQuota: z.union([z.number(), z.literal("unlimited")]).default(50),
	activeDuration: z.string().default("1 Tahun"),
	hasLiveStream: z.boolean().default(false),
	hasCustomMusic: z.boolean().default(false),
	hasStoryTimeline: z.boolean().default(false),
	hasCustomDomain: z.boolean().default(false),
});

export const AdminSettingsSchema = z.object({
	adminName: z.string().min(1),
	adminEmail: z.string().email(),
	adminPhone: z.string().default(""),
	adminBio: z.string().default(""),
	adminAvatar: z.string().default(""),
	twoFactorEnabled: z.boolean().default(false),
	waGatewayUrl: z.string().default(""),
	waApiKey: z.string().default(""),
	waSenderNumber: z.string().default(""),
	smtpHost: z.string().default(""),
	smtpPort: z.string().default("587"),
	smtpUser: z.string().default(""),
	smtpPass: z.string().default(""),
	smtpFrom: z.string().default(""),
	platformName: z.string().default("Simfoni Cinta"),
	domain: z.string().default("https://simfonicinta.my.id"),
	tagline: z
		.string()
		.default("Platform Undangan Pernikahan Digital Elegan & Modern Indonesia"),
	faviconUrl: z
		.string()
		.default(
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp",
		),
	logoUrl: z
		.string()
		.default(
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp",
		),
	heroBannerUrl: z
		.string()
		.default(
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
		),
	footerBannerUrl: z
		.string()
		.default(
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-footer-banner.webp",
		),
	conciergeBannerUrl: z
		.string()
		.default(
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-tidak-mau-ribet.webp",
		),
	ogImageUrl: z
		.string()
		.default(
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
		),
	metaTitle: z
		.string()
		.default("Simfoni Cinta — Undangan Pernikahan Digital Elegan & Modern"),
	metaDesc: z
		.string()
		.default(
			"Buat undangan pernikahan digital elegan bersama Simfoni Cinta. Fitur lengkap: RSVP online, amplop digital, musik latar, buku tamu QR, navigasi maps, dan sebar via WhatsApp.",
		),
	contactPhone: z.string().default("082392115909"),
	contactEmail: z.string().default("eka.ckp16799@gmail.com"),
	contactAddress: z.string().default("Jakarta & Pekanbaru, Indonesia"),
	socialInstagram: z.string().default("https://instagram.com/simfonicinta"),
	socialTiktok: z.string().default("https://tiktok.com/@simfonicinta"),
	socialYoutube: z.string().default("https://youtube.com/@simfonicinta"),
	socialFacebook: z.string().default("https://facebook.com/simfonicinta"),
	announcement: z
		.string()
		.default("✨ Promo Spesial Paket Platinum Diskon 50% — Berlaku Selamanya!"),
	announcementActive: z.boolean().default(true),
	footerText: z
		.string()
		.default(
			"Platform undangan pernikahan digital premium nomor #1 di Indonesia dengan fitur terlengkap, desain elegan, dan musik pilihan.",
		),
	faqs: z.array(FaqItemSchema).default([]),
	testimonials: z.array(TestimonialItemSchema).default([]),
	menus: z.array(MenuItemSchema).default([]),
	packages: z.array(PricingPackageSchema).default([]),
	geminiApiKey: z.string().default(""),
	geminiApiKeys: z.array(z.string()).default([]),
	geminiModel: z.string().default("gemini-3.6-flash"),
	geminiTone: z.string().default("romantis_elegan"),
	geminiCustomPrompt: z.string().default(""),
	aiApiKey: z.string().default(""),
	aiEndpoint: z.string().default("https://openagentic.id/api/v1/chat/completions"),
});

export type AdminSettingsData = z.infer<typeof AdminSettingsSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type PricingPackageItem = z.infer<typeof PricingPackageSchema>;

export const DEFAULT_PACKAGES: PricingPackageItem[] = [
	{
		id: "silver",
		name: "Paket Silver",
		price: 15000,
		originalPrice: 75000,
		badge: "Hemat",
		popular: false,
		features: [
			"10 Foto Galeri Prewedding",
			"50 Kuota Sebar Undangan WA",
			"Pustaka Musik Platform",
			"Hitung Mundur Acara",
			"Masa Aktif 1 Tahun",
		],
		maxPhotos: 10,
		maxWaQuota: 50,
		activeDuration: "1 Tahun",
		hasLiveStream: false,
		hasCustomMusic: false,
		hasStoryTimeline: false,
		hasCustomDomain: false,
	},
	{
		id: "gold",
		name: "Paket Gold",
		price: 35000,
		originalPrice: 120000,
		badge: "Paling Populer",
		popular: true,
		features: [
			"25 Foto Galeri Prewedding",
			"100 Kuota Sebar Undangan WA",
			"Video Prewedding YouTube",
			"Linimasa Cerita Cinta",
			"Pustaka Musik Lengkap & Kustom",
			"Masa Aktif 3 Tahun",
		],
		maxPhotos: 25,
		maxWaQuota: 100,
		activeDuration: "3 Tahun",
		hasLiveStream: false,
		hasCustomMusic: true,
		hasStoryTimeline: true,
		hasCustomDomain: false,
	},
	{
		id: "platinum",
		name: "Paket Platinum",
		price: 75000,
		originalPrice: 250000,
		badge: "Fitur Terlengkap",
		popular: false,
		features: [
			"Foto Galeri Unlimited",
			"Sebar WA Unlimited Blast",
			"Live Streaming YouTube/IG",
			"Pustaka Musik & Kustom MP3",
			"Linimasa Cerita Cinta Lengkap",
			"Domain Kustom / Subdomain Khusus",
			"Masa Aktif Selamanya",
		],
		maxPhotos: "unlimited",
		maxWaQuota: "unlimited",
		activeDuration: "Selamanya",
		hasLiveStream: true,
		hasCustomMusic: true,
		hasStoryTimeline: true,
		hasCustomDomain: true,
	},
];

const DEFAULT_FAQS: FaqItem[] = [
	{
		id: "faq-1",
		question: "Berapa lama proses pembuatan undangan digital di Simfoni Cinta?",
		answer:
			"Hanya butuh waktu 5 hingga 10 menit! Cukup pilih tema favorit, isi data kedua mempelai dan detail acara, lalu undangan langsung aktif dan siap disebarkan.",
		category: "Umum",
	},
	{
		id: "faq-2",
		question: "Bagaimana cara menyebarkan undangan ke kontak WhatsApp tamu?",
		answer:
			"Anda dapat menggunakan fitur generator teks WhatsApp di dasbor. Cukup masukkan nama tamu, lalu klik tombol kirim untuk membuka chat WhatsApp dengan sapaan nama tamu yang sudah otomatis terisi rapi.",
		category: "Fitur",
	},
	{
		id: "faq-3",
		question: "Apakah ada batasan jumlah tamu yang bisa diundang?",
		answer:
			"Tergantung paket yang Anda pilih. Paket Silver mendukung hingga 50 kuota nama tamu, Paket Gold hingga 350 tamu, dan Paket Platinum memberikan akses Unlimited tanpa batasan jumlah tamu.",
		category: "Paket",
	},
	{
		id: "faq-4",
		question: "Bagaimana cara kerja fitur Amplop Digital & Hadiah Pernikahan?",
		answer:
			"Tamu undangan dapat mengirimkan hadiah berupa transfer bank (tersedia nomor rekening dan tombol salin otomatis), scan QRIS instan, maupun mengirimkan kado fisik ke alamat pengiriman yang Anda cantumkan.",
		category: "Fitur",
	},
	{
		id: "faq-5",
		question: "Apakah dana amplop digital langsung masuk ke rekening pribadi saya?",
		answer:
			"Ya, 100% langsung masuk ke rekening bank atau dompet digital pribadi Anda tanpa potongan komisi sepeser pun dari Simfoni Cinta.",
		category: "Pembayaran",
	},
	{
		id: "faq-6",
		question: "Bisa kah saya mengganti lagu atau musik latar undangan sendiri?",
		answer:
			"Bisa! Kami menyediakan puluhan pustaka musik romantis pilihan. Untuk Paket Gold dan Platinum, Anda juga dapat mengunggah file audio/lagu MP3 kustom favorit Anda sendiri.",
		category: "Fitur",
	},
	{
		id: "faq-7",
		question: "Berapa lama masa aktif undangan pernikahan saya?",
		answer:
			"Paket Silver dan Gold aktif selama 1 tahun penuh sejak tanggal pembuatan, sedangkan Paket Platinum aktif selamanya (Lifetime Access) tanpa biaya langganan lanjutan.",
		category: "Paket",
	},
	{
		id: "faq-8",
		question: "Apakah data dan foto acara bisa diedit kembali setelah undangan aktif?",
		answer:
			"Tentu bisa! Anda bebas menyunting data mempelai, jadwal akad/resepsi, lokasi maps, galeri foto, maupun teks ucapan kapan saja melalui dasbor pengguna tanpa batasan revisi.",
		category: "Umum",
	},
	{
		id: "faq-9",
		question: "Apakah undangan digital Simfoni Cinta responsif di semua perangkat HP?",
		answer:
			"Ya, seluruh template dirancang mobile-first dan sangat ringan, sehingga tampil sempurna, estetik, dan cepat dibuka di perangkat Android, iPhone, tablet, maupun komputer desktop.",
		category: "Teknis",
	},
	{
		id: "faq-10",
		question: "Apakah tersedia fitur RSVP konfirmasi kehadiran dan ucapan doa?",
		answer:
			"Ya, tamu dapat mengisi konfirmasi kehadiran (Hadir/Tidak Hadir/Ragu) beserta jumlah tamu dan menuliskan doa restu yang langsung muncul realtime pada buku tamu undangan Anda.",
		category: "Fitur",
	},
	{
		id: "faq-11",
		question: "Bagaimana cara kerja fitur QR Code Check-in di meja penerima tamu?",
		answer:
			"Setiap tamu undangan memiliki QR code unik. Di hari resepsi, penerima tamu dapat memindai QR code tersebut menggunakan HP untuk pencatatan kehadiran instan yang bebas antrean.",
		category: "Fitur",
	},
	{
		id: "faq-12",
		question: "Metode pembayaran apa saja yang diterima untuk aktivasi paket?",
		answer:
			"Pembayaran diproses secara instan melalui QRIS otomatis (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay) serta Virtual Account bank resmi via Mayar.",
		category: "Pembayaran",
	},
	{
		id: "faq-13",
		question: "Berapa banyak foto yang bisa saya pasang di Galeri Prewedding?",
		answer:
			"Paket Silver mendukung hingga 10 foto, Paket Gold hingga 25 foto, dan Paket Platinum mendukung galeri foto tanpa batas (unlimited) dengan tampilan slider yang elegan.",
		category: "Paket",
	},
	{
		id: "faq-14",
		question: "Apakah bisa menyematkan video prewedding atau live streaming acara?",
		answer:
			"Bisa! Anda dapat menautkan video YouTube Shorts, YouTube Video, Instagram Reel, atau siaran langsung (Live Streaming) YouTube langsung di dalam halaman undangan.",
		category: "Fitur",
	},
	{
		id: "faq-15",
		question: "Apakah ada fitur petunjuk arah Google Maps ke lokasi gedung/akad?",
		answer:
			"Tentu ada. Terdapat tombol langsung yang terhubung ke Google Maps untuk navigasi rute GPS presisi menuju venue pernikahan bagi para tamu.",
		category: "Fitur",
	},
	{
		id: "faq-16",
		question: "Apakah ada pengingat kalender dan hitung mundur (Countdown) acara?",
		answer:
			"Ya, dilengkapi widget hitung mundur hari/jam/menit dan tombol integrasi 'Simpan ke Google Calendar' agar tamu tidak melewatkan hari bahagia Anda.",
		category: "Fitur",
	},
	{
		id: "faq-17",
		question: "Bagaimana jika saya membutuhkan bantuan teknis atau asistensi?",
		answer:
			"Tim support Concierge Simfoni Cinta siap membantu Anda via WhatsApp setiap hari untuk memandu pembuatan undangan hingga siap disebarkan.",
		category: "Umum",
	},
	{
		id: "faq-18",
		question: "Bisa kah menggunakan nama domain khusus sendiri (Custom Domain)?",
		answer:
			"Ya, khusus pengguna Paket Platinum kami menyediakan integrasi Custom Domain (misal: nama-pasangan.com) atau subdomain eksklusif.",
		category: "Paket",
	},
	{
		id: "faq-19",
		question: "Apakah saya bisa mencoba membuat undangan terlebih dahulu secara gratis?",
		answer:
			"Bisa! Anda dapat mendaftar akun, memilih tema, dan menyusun draf data undangan Anda terlebih dahulu secara gratis sebelum melakukan aktivasi paket.",
		category: "Umum",
	},
	{
		id: "faq-20",
		question: "Apakah foto dan data pribadi saya terjamin keamanannya?",
		answer:
			"Sangat aman. Seluruh aset foto disimpan di Content Delivery Network (CDN) terenkripsi, dan kami menerapkan proteksi privasi standar industri untuk data setiap pasangan.",
		category: "Teknis",
	},
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
	{
		id: "testi-1",
		name: "Dimas & Annisa",
		role: "Pengantin Jakarta",
		rating: 5,
		text: "Tamu undangan kami sangat terkesan dengan musik latar dan amplop digitalnya. Desainnya sangat mewah dan loading-nya super cepat!",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		weddingDate: "12 Januari 2026",
	},
	{
		id: "testi-2",
		name: "Rian & Felicia",
		role: "Pengantin Surabaya",
		rating: 5,
		text: "Fitur QR check-in di meja resepsi membuat antrean tamu jadi sangat tertib dan rapi. Terima kasih Simfoni Cinta!",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
		weddingDate: "28 Februari 2026",
	},
	{
		id: "testi-3",
		name: "Bimo & Larasati",
		role: "Pengantin Medan",
		rating: 5,
		text: "Template adat Batak-nya sangat otentik dan elegan. Admin juga sangat responsif saat kami butuh bantuan kustomisasi font.",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
		weddingDate: "15 Maret 2026",
	},
	{
		id: "testi-4",
		name: "Fajar & Nadira",
		role: "Pengantin Bandung",
		rating: 5,
		text: "Sangat menghemat budget percetakan! Sebar undangan ke 400 teman kantor lewat WhatsApp selesai dalam waktu setengah jam saja.",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
		weddingDate: "05 April 2026",
	},
	{
		id: "testi-5",
		name: "Aditya & Sekar",
		role: "Pengantin Yogyakarta",
		rating: 5,
		text: "Nuansa Jawa Modern-nya sangat pas dengan konsep pernikahan kami. Fitur cerita cinta dan galerinya bikin tamu terharu membaca perjalanan kami.",
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
		weddingDate: "18 Mei 2026",
	},
	{
		id: "testi-6",
		name: "Ilham & Zahra",
		role: "Pengantin Makassar",
		rating: 5,
		text: "Amplop digital QRIS langsung masuk ke rekening tanpa potongan apapun. Fitur RSVP memudahkan catering menghitung porsi makanan.",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
		weddingDate: "02 Juni 2026",
	},
	{
		id: "testi-7",
		name: "Wayan & Kadek",
		role: "Pengantin Bali",
		rating: 5,
		text: "Desain tropis estetiknya memukau semua tamu undangan dari luar kota. Integrasi Google Maps-nya juga sangat akurat sampai ke venue.",
		avatar:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
		weddingDate: "21 Juni 2026",
	},
	{
		id: "testi-8",
		name: "Taufik & Maya",
		role: "Pengantin Semarang",
		rating: 5,
		text: "Pilihan musik latarnya lengkap dan romantis. Undangan dibuka di HP jadul sekalipun tetap cepat tanpa patah-patah.",
		avatar:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
		weddingDate: "10 Juli 2026",
	},
	{
		id: "testi-9",
		name: "Hafiz & Aulia",
		role: "Pengantin Pekanbaru",
		rating: 5,
		text: "Customer care Simfoni Cinta sangat ramah dan sigap membantu kami memasukkan data doa dan ayat suci sampai selesai sempurna.",
		avatar:
			"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
		weddingDate: "25 Juli 2026",
	},
	{
		id: "testi-10",
		name: "Reza & Dinda",
		role: "Pengantin Malang",
		rating: 5,
		text: "Paket Platinum dengan masa aktif selamanya sangat worth it. Sampai sekarang website undangan kami masih sering dibuka untuk mengenang resepsi.",
		avatar:
			"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
		weddingDate: "08 Agustus 2026",
	},
	{
		id: "testi-11",
		name: "Bagas & Alisha",
		role: "Pengantin Solo",
		rating: 5,
		text: "Tipografi dan ornamen visualnya sangat berkelas. Banyak keluarga mengira kami menyewa agensi digital seharga jutaan rupiah!",
		avatar:
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
		weddingDate: "22 Agustus 2026",
	},
	{
		id: "testi-12",
		name: "Arya & Citra",
		role: "Pengantin Balikpapan",
		rating: 5,
		text: "Proses pembuatan hanya butuh waktu santai di rumah. Tampilan foto galeri prewedding sangat tajam dan responsif di layar iPhone.",
		avatar:
			"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
		weddingDate: "05 September 2026",
	},
	{
		id: "testi-13",
		name: "Gilang & Safira",
		role: "Pengantin Palembang",
		rating: 5,
		text: "Sangat praktis untuk kerabat kami yang tinggal di luar pulau. Cukup kirim link via WA, mereka langsung bisa RSVP dan kirim hadiah.",
		avatar:
			"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
		weddingDate: "19 September 2026",
	},
	{
		id: "testi-14",
		name: "Bram & Tiara",
		role: "Pengantin Bogor",
		rating: 5,
		text: "Pilihan tema rustic-nya sangat match dengan konsep garden party kami di Puncak. Fitur countdown-nya juga sangat aesthetic.",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		weddingDate: "03 Oktober 2026",
	},
	{
		id: "testi-15",
		name: "Farhan & Nabila",
		role: "Pengantin Tangerang",
		rating: 5,
		text: "Animasi buka amplopnya super halus dan tidak bikin pusing. Dasbor adminnya juga sangat mudah dipahami bahkan untuk pemula.",
		avatar:
			"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
		weddingDate: "17 Oktober 2026",
	},
	{
		id: "testi-16",
		name: "Satria & Pamela",
		role: "Pengantin Bekasi",
		rating: 5,
		text: "Teman-teman sebaya pada kagum sama undangan digital kami. Semua ucapan dan doa yang masuk bisa kami simpan sebagai kenang-kenangan abadi.",
		avatar:
			"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
		weddingDate: "31 Oktober 2026",
	},
	{
		id: "testi-17",
		name: "Eko & Ratna",
		role: "Pengantin Banjarmasin",
		rating: 5,
		text: "Pelayanan sangat profesional. Fitur live stream YouTube langsung di undangan membantu sanak famili yang berhalangan hadir secara langsung.",
		avatar:
			"https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
		weddingDate: "14 November 2026",
	},
	{
		id: "testi-18",
		name: "Yusuf & Rahma",
		role: "Pengantin Padang",
		rating: 5,
		text: "Ornamen Islami dan kaligrafi surat Ar-Rum terpampang indah di bagian awal. Sangat syahdu dan berkah.",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		weddingDate: "28 November 2026",
	},
	{
		id: "testi-19",
		name: "Christian & Jessica",
		role: "Pengantin Manado",
		rating: 5,
		text: "Desain modern minimalis dengan foto full screen membuat undangan terasa seperti majalah eksklusif. Mantap Simfoni Cinta!",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
		weddingDate: "12 Desember 2026",
	},
	{
		id: "testi-20",
		name: "Gede & Putu",
		role: "Pengantin Denpasar",
		rating: 5,
		text: "Fitur buku tamu QR barcode sangat membantu panitia resepsi mendata kehadiran 800 tamu tanpa ada yang terlewat.",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
		weddingDate: "26 Desember 2026",
	},
];

const DEFAULT_MENUS: MenuItem[] = [
	{ label: "Beranda", href: "/#beranda" },
	{
		label: "Template",
		href: "/#template",
		submenus: [
			{
				label: "Adat Nusantara",
				href: "/#template",
				desc: "Koleksi tema adat Batak, Jawa, Minang, Sunda",
			},
			{
				label: "Minimalis & Modern",
				href: "/#template",
				desc: "Desain simpel, bersih, dan kontemporer",
			},
			{
				label: "Luxury & Gold",
				href: "/#template",
				desc: "Nuansa emas berkilau dan mewah",
			},
			{
				label: "Islamic & Syukuran",
				href: "/#template",
				desc: "Ornamen kaligrafi dan nuansa islami",
			},
		],
	},
	{
		label: "Fitur Unggulan",
		href: "/#fitur",
		submenus: [
			{
				label: "Kirim WA Blast",
				href: "/#fitur",
				desc: "Sebar undangan otomatis ke ribuan kontak",
			},
			{
				label: "Amplop Digital & QRIS",
				href: "/#fitur",
				desc: "Terima hadiah transfer langsung ke rekening",
			},
			{
				label: "Buku Tamu & RSVP",
				href: "/#fitur",
				desc: "Konfirmasi kehadiran dan ucapan real-time",
			},
			{
				label: "Meja Resepsi QR",
				href: "/#fitur",
				desc: "Sistem scan kehadiran di lokasi acara",
			},
		],
	},
	{ label: "Paket & Harga", href: "/#harga" },
	{ label: "Tanya Jawab (FAQ)", href: "/#faq" },
	{
		label: "Berita & Tips",
		href: "/#blog",
		submenus: [
			{
				label: "Tips Memilih Undangan",
				href: "/#blog",
				desc: "Panduan praktis sebelum mencetak / membuat digital",
			},
			{
				label: "Tren Pernikahan 2026",
				href: "/#blog",
				desc: "Gaya dekorasi dan tema modern terpopuler",
			},
			{
				label: "Panduan Meja Resepsi",
				href: "/#blog",
				desc: "Cara efisien mengelola check-in tamu VIP",
			},
		],
	},
	{ label: "Kontak", href: "/#kontak" },
];

const DEFAULT_SETTINGS: AdminSettingsData = {
	adminName: "Eka Syarif Maulana",
	adminEmail: "eka.ckp16799@gmail.com",
	adminPhone: "082392115909",
	adminBio: "Master Developer & System Architect",
	adminAvatar:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/avatars/1788085226131-asset-4e610a02.png",
	twoFactorEnabled: false,
	waGatewayUrl: "",
	waApiKey: "",
	waSenderNumber: "",
	smtpHost: "",
	smtpPort: "587",
	smtpUser: "",
	smtpPass: "",
	smtpFrom: "",
	platformName: "Simfoni Cinta",
	domain: "https://simfonicinta.my.id",
	tagline: "Platform Undangan Pernikahan Digital Elegan & Modern Indonesia",
	faviconUrl:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp",
	logoUrl:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp",
	heroBannerUrl:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
	footerBannerUrl:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-footer-banner.webp",
	conciergeBannerUrl:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-tidak-mau-ribet.webp",
	ogImageUrl:
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
	metaTitle: "Simfoni Cinta — Undangan Pernikahan Digital Elegan & Modern",
	metaDesc:
		"Buat undangan pernikahan digital elegan bersama Simfoni Cinta. Fitur lengkap: RSVP online, amplop digital, musik latar, buku tamu QR, navigasi maps, dan sebar via WhatsApp.",
	contactPhone: "082392115909",
	contactEmail: "eka.ckp16799@gmail.com",
	contactAddress: "Jakarta & Pekanbaru, Indonesia",
	socialInstagram: "https://instagram.com/simfonicinta",
	socialTiktok: "https://tiktok.com/@simfonicinta",
	socialYoutube: "https://youtube.com/@simfonicinta",
	socialFacebook: "https://facebook.com/simfonicinta",
	announcement:
		"✨ Promo Spesial Paket Platinum Diskon 50% — Berlaku Selamanya!",
	announcementActive: true,
	footerText:
		"Platform undangan pernikahan digital premium nomor #1 di Indonesia dengan fitur terlengkap, desain elegan, dan musik pilihan.",
	faqs: DEFAULT_FAQS,
	testimonials: DEFAULT_TESTIMONIALS,
	menus: DEFAULT_MENUS,
	packages: DEFAULT_PACKAGES,
	geminiApiKey: "",
	geminiApiKeys: [],
	geminiModel: "gemini-3.6-flash",
	geminiTone: "romantis_elegan",
	geminiCustomPrompt: "",
	aiApiKey: "",
	aiEndpoint: "https://openagentic.id/api/v1/chat/completions",
};

export async function getAdminSettings(): Promise<AdminSettingsData> {
	return cached(CACHE_KEY, 300, async () => {
		const rows = await db
			.select()
			.from(adminSettings)
			.where(eq(adminSettings.id, SETTINGS_ID));
		if (!rows[0]) return DEFAULT_SETTINGS;
		try {
			const parsed = AdminSettingsSchema.safeParse(rows[0].data);
			if (parsed.success) {
				return {
					...DEFAULT_SETTINGS,
					...parsed.data,
					faqs: parsed.data.faqs?.length ? parsed.data.faqs : DEFAULT_FAQS,
					testimonials: parsed.data.testimonials?.length
						? parsed.data.testimonials
						: DEFAULT_TESTIMONIALS,
					menus: parsed.data.menus?.length ? parsed.data.menus : DEFAULT_MENUS,
					packages: parsed.data.packages?.length
						? parsed.data.packages
						: DEFAULT_PACKAGES,
				};
			}
			return DEFAULT_SETTINGS;
		} catch {
			return DEFAULT_SETTINGS;
		}
	});
}

export async function saveAdminSettings(
	body: unknown,
): Promise<AdminSettingsData> {
	const data = AdminSettingsSchema.parse(body);
	const existing = await db
		.select()
		.from(adminSettings)
		.where(eq(adminSettings.id, SETTINGS_ID));
	if (existing.length === 0) {
		await db
			.insert(adminSettings)
			.values({ id: SETTINGS_ID, data, updatedAt: new Date() });
	} else {
		await db
			.update(adminSettings)
			.set({ data, updatedAt: new Date() })
			.where(eq(adminSettings.id, SETTINGS_ID));
	}
	await invalidate(CACHE_KEY);
	return data;
}
