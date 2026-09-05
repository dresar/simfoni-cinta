import { Preset002 } from "../presets/002/Preset002";
import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
	AnimationSettings,
} from "../types";

export const DEFAULT_JAWA_ASSETS: AssetSlots = {
	bgCover: "/demo/batak-merah/assets/images/bg.webp",
	frameTopLeft: "/demo/batak-merah/assets/images/tl-2.webp",
	frameTopRight: "/demo/batak-merah/assets/images/tr-2.webp",
	frameBottom: "/demo/batak-merah/assets/images/bm.webp",
	motifBorder: "/demo/batak-merah/assets/images/tl-1.webp",
	motifCenter: "/demo/batak-merah/assets/images/tr-1.webp",
	characterIllustration: "/demo/batak-merah/assets/images/bl-1_2.webp",
	groomFrame: "/demo/batak-merah/assets/images/bl-1.webp",
	brideFrame: "/demo/batak-merah/assets/images/bl-1_2.webp",
	groomPhoto: "/demo/batak-merah/assets/images/57164-gallery-1686267511.jpg",
	bridePhoto: "/demo/batak-merah/assets/images/57164-gallery-1686267509.jpg",
	couplePhoto: "/demo/batak-merah/assets/images/57164-gallery-1686266235.jpg",
	venuePhoto: "/demo/batak-merah/assets/images/57164-gallery-1686267428.jpg",
	galleryPhotos: [
		"/demo/batak-merah/assets/images/57164-gallery-1686267141.jpg",
		"/demo/batak-merah/assets/images/57164-gallery-1686266235.jpg",
		"/demo/batak-merah/assets/images/57164-gallery-1686267285.jpg",
		"/demo/batak-merah/assets/images/57164-gallery-1686267284.jpg",
	],
	audioUrl: "/demo/batak-merah/assets/music/dorman-manik-and-rany-simbolon-si-rokkap-ni-tondi.mp3",
};

export const DEFAULT_JAWA_THEME: PresetThemeTokens = {
	invBg: "#F8F3EB",
	invBase: "#1C1207",
	invAccent: "#B8966A",
	invBorder: "#B8966A",
	menuBg: "#1C1207",
	menuInactive: "#B8966A",
	menuActive: "#B8966A",
	fontBase: "serif",
	fontAccent: "serif",
	fontLatin: "serif",
};

export const DEFAULT_JAWA_DATA: InvitationData = {
	title: "Undangan Pernikahan",
	slug: "rizal-salsabila",
	guestGreetingPrefix: "Kepada Yth.",
	guestGreetingSub: "Bapak/Ibu/Saudara/i",
	guestName: "Nama Tamu",
	guestGroup: "Tamu Undangan",
	openButtonText: "Buka Undangan",
	weddingDateFormatted: "Sabtu, 12 April 2026",
	countdownTargetIso: "2026-04-12T09:00:00+07:00",
	sacredQuoteText:
		"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
	sacredQuoteSource: "QS. Ar-Rum: 21",
	loveQuoteText:
		"Cinta adalah kesabaran yang tak pernah habis, kebaikan yang tak pernah berhenti.",
	loveQuoteAuthor: "Rumi",
	respectGreeting:
		"Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan walimatul 'ursy putra-putri kami:",
	contactWhatsappNumber: "6281234567890",
	couple: {
		groomName: "Rizal",
		groomFullName: "Muhammad Rizal Aditya, S.T.",
		groomFather: "H. Bambang Sugiarto",
		groomMother: "Hj. Sri Wahyuni",
		groomInstagram: "@rizal_aditya",
		brideName: "Salsabila",
		brideFullName: "Salsabila Putri Rahayu, S.Pd.",
		brideFather: "H. Ahmad Fauzi",
		brideMother: "Hj. Nur Aini",
		brideInstagram: "@salsa_rahayu",
	},
	akad: {
		title: "Akad Nikah",
		dayDate: "Sabtu, 12 April 2026",
		timeWindow: "08.00 - 10.00 WIB",
		venueName: "Masjid Al-Ikhlas",
		address: "Jl. Merdeka No. 45, Yogyakarta",
		mapsUrl: "https://maps.google.com/?q=Masjid+Al-Ikhlas+Yogyakarta",
	},
	resepsi: {
		title: "Resepsi Pernikahan",
		dayDate: "Sabtu, 12 April 2026",
		timeWindow: "11.00 WIB - Selesai",
		venueName: "Pendopo Agung Keraton",
		address: "Jl. Keraton No. 1, Yogyakarta",
		mapsUrl: "https://maps.google.com/?q=Pendopo+Agung+Keraton+Yogyakarta",
	},
	timeline: [
		{
			year: "2021",
			title: "Pertemuan Pertama",
			story: "Bertemu dalam sebuah acara seminar pendidikan di Yogyakarta.",
		},
		{
			year: "2023",
			title: "Lamaran",
			story: "Prosesi lamaran secara adat Jawa yang penuh makna dan doa.",
		},
		{
			year: "2026",
			title: "Pernikahan",
			story: "Menyempurnakan separuh agama dan mengikat janji seumur hidup.",
		},
	],
	banks: [
		{
			bankId: "bca-rizal",
			bankName: "Bank BCA",
			accountNumber: "1230019283",
			accountHolder: "Muhammad Rizal Aditya",
		},
		{
			bankId: "bni-salsa",
			bankName: "Bank BNI",
			accountNumber: "0987654321",
			accountHolder: "Salsabila Putri Rahayu",
		},
	],
	greetings: [
		{
			id: "1",
			name: "Keluarga Besar Sugiarto",
			presence: "Hadir",
			message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fi khair. Semoga menjadi keluarga yang sakinah mawaddah warahmah.",
			createdAt: "Baru saja",
		},
		{
			id: "2",
			name: "Sahabat UGM",
			presence: "Hadir",
			message: "Selamat Rizal & Salsa! Semoga rumah tangga kalian selalu dipenuhi cinta dan keberkahan. Aamiin.",
			createdAt: "1 jam lalu",
		},
	],
};

export const DEFAULT_JAWA_ANIMATIONS: AnimationSettings = {
	enableSway: true,
	swayIntensity: "subtle",
	enableEntranceExit: true,
	transitionDurationMs: 450,
};

export interface TemplateJawaElegantProps {
	assets?: AssetSlots;
	theme?: PresetThemeTokens;
	data?: InvitationData;
	animations?: AnimationSettings;
}

export function TemplateJawaElegant({
	assets = DEFAULT_JAWA_ASSETS,
	theme = DEFAULT_JAWA_THEME,
	data = DEFAULT_JAWA_DATA,
	animations = DEFAULT_JAWA_ANIMATIONS,
}: TemplateJawaElegantProps) {
	return (
		<Preset002
			assets={assets}
			theme={theme}
			data={data}
			animations={animations}
		/>
	);
}

export const PresetJawaElegant = TemplateJawaElegant;
