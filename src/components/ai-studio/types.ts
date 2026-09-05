export interface AssetSlots {
	bgCover: string;
	frameTopLeft: string;
	frameTopRight: string;
	frameBottom: string;
	motifCenter: string;
	motifBorder?: string;
	characterIllustration: string;
	groomFrame: string;
	brideFrame: string;
	groomPhoto: string;
	bridePhoto: string;
	couplePhoto?: string;
	plantDecoration?: string;
	venuePhoto: string;
	galleryPhotos: string[];
	audioUrl: string;
}

export interface CoupleProfile {
	groomName: string;
	groomFullName: string;
	groomFather: string;
	groomMother: string;
	groomInstagram?: string;
	brideName: string;
	brideFullName: string;
	brideFather: string;
	brideMother: string;
	brideInstagram?: string;
}

export interface WeddingEventSchedule {
	title: string;
	dayDate: string;
	timeWindow: string;
	venueName: string;
	address: string;
	mapsUrl?: string;
}

export interface LoveStoryMilestone {
	year: string;
	title: string;
	story: string;
	photo?: string;
}

export interface BankAccountItem {
	bankId: string;
	bankName: string;
	accountNumber: string;
	accountHolder: string;
	qrisImage?: string;
}

export interface GuestGreeting {
	id: string;
	name: string;
	relationship?: string;
	presence: "Hadir" | "Ragu-ragu" | "Tidak Hadir";
	message: string;
	createdAt: string;
}

export interface InvitationData {
	title: string;
	slug: string;
	guestGreetingPrefix?: string;
	guestGreetingSub?: string;
	guestName: string;
	guestGroup: string;
	openButtonText?: string;
	weddingDateFormatted: string;
	countdownTargetIso: string;
	sacredQuoteText: string;
	sacredQuoteSource: string;
	loveQuoteText: string;
	loveQuoteAuthor: string;
	respectGreeting?: string;
	contactWhatsappNumber?: string;
	couple: CoupleProfile;
	akad: WeddingEventSchedule;
	resepsi: WeddingEventSchedule;
	timeline: LoveStoryMilestone[];
	banks: BankAccountItem[];
	greetings: GuestGreeting[];
}

export interface PresetThemeTokens {
	invBg: string;
	invBase: string;
	invAccent: string;
	invBorder: string;
	menuBg: string;
	menuInactive: string;
	menuActive: string;
	fontBase: string;
	fontAccent: string;
	fontLatin: string;
}

export interface AnimationSettings {
	enableSway: boolean;
	swayIntensity: "subtle" | "normal" | "playful";
	enableEntranceExit: boolean;
	transitionDurationMs: number;
}

export type ViewportDevice = "mobile-sm" | "mobile-lg" | "tablet" | "fullscreen";

export interface TemplatePresetMeta {
	id: string;
	name: string;
	category: string;
	author: string;
	description: string;
	sourceReference: string;
	thumbnailUrl?: string;
	tags?: string[];
	defaultAssets: AssetSlots;
	defaultTheme: PresetThemeTokens;
	defaultData: InvitationData;
}
