import type { InvitationData } from "../../types";

export const DEFAULT_BATAK_DATA: InvitationData = {
	title: "The Wedding of",
	slug: "andreas-vitalia",
	guestGreetingPrefix: "Kepada Yth;",
	guestGreetingSub: "Bapak/Ibu/Saudara/i",
	guestName: "Nama Tamu",
	guestGroup: "Tamu Undangan VIP",
	openButtonText: "Buka Undangan",
	weddingDateFormatted: "Minggu, 18 Oktober 2026",
	countdownTargetIso: "2026-10-18T10:00:00+07:00",
	sacredQuoteText:
		"Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
	sacredQuoteSource: "Matius 19 : 6",
	loveQuoteText:
		"Dan di atas semuanya itu: Kenakanlah KASIH, sebagai pengikat yang mempersatukan dan menyempurnakan.",
	loveQuoteAuthor: "Kolose 3 : 14",
	respectGreeting:
		"Dibagasan asi dohot holong ni roha Tuhanta Jesus Kristus jala mardongan las ni roha, marhite surat on ro do hami manggokhon huhut manjou hamu angka napinarsangapan ro mangadopi ulaon Pesta Parbagason ni anak dohot boru nami:",
	contactWhatsappNumber: "6281234567890",
	couple: {
		groomName: "Andreas",
		groomFullName: "Andreas Tobi Simbolon, S.T.",
		groomFather: "Amran Simbolon (+)",
		groomMother: "Helena Aruan",
		groomInstagram: "andreas_simbolon",
		brideName: "Vitalia",
		brideFullName: "Vitalia Donna L. Tobing, S.E.",
		brideFather: "Drs. Manahan L. Tobing (+)",
		brideMother: "Debora Sitompul",
		brideInstagram: "vitalia_tobing",
	},
	akad: {
		title: "Pemberkatan Kudus",
		dayDate: "Minggu, 18 Oktober 2026",
		timeWindow: "09.00 - 11.30 WIB",
		venueName: "Gereja HKBP Balige",
		address: "Jl. Gereja No. 12, Balige, Toba Samosir",
		mapsUrl: "https://maps.google.com/?q=Gereja+HKBP+Balige",
	},
	resepsi: {
		title: "Ulaon Unjuk Adat Batak",
		dayDate: "Minggu, 18 Oktober 2026",
		timeWindow: "12.00 WIB - Selesai",
		venueName: "Gedung Serbaguna HKBP Balige",
		address: "Jl. Gereja No. 12, Balige, Toba Samosir",
		mapsUrl: "https://maps.google.com/?q=Gedung+Serbaguna+HKBP+Balige",
	},
	timeline: [
		{
			year: "2020",
			title: "Pertemuan Pertama",
			story: "Pertama kali bertemu dalam suatu acara persekutuan pemuda di Medan.",
		},
		{
			year: "2023",
			title: "Martumpol & Marhusip",
			story: "Mengikat janji pertunangan gerejawi dan musyawarah adat keluarga besar.",
		},
		{
			year: "2026",
			title: "Pesta Parbagason",
			story: "Mengucap syukur dan mengikat janji suci pernikahan di hadapan Tuhan.",
		},
	],
	banks: [
		{
			bankId: "bca",
			bankName: "Bank BCA",
			accountNumber: "8280912345",
			accountHolder: "Andreas Tobi Simbolon",
		},
		{
			bankId: "mandiri",
			bankName: "Bank Mandiri",
			accountNumber: "1370019283741",
			accountHolder: "Vitalia Donna Tobing",
		},
	],
	greetings: [
		{
			id: "1",
			name: "Keluarga Besar Simbolon",
			presence: "Hadir",
			message: "Selamat atas pernikahan Andreas & Vitalia. Sai horas jala gabe ma keluargana!",
			createdAt: "Baru saja",
		},
		{
			id: "2",
			name: "Sahabat Kampus ITB",
			presence: "Hadir",
			message: "Happy Wedding Tobi & Donna! Semoga senantiasa diberkati dan bahagia selalu.",
			createdAt: "1 jam lalu",
		},
	],
};
