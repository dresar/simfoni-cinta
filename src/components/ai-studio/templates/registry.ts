import type { TemplatePresetMeta } from "../types";
import {
	DEFAULT_BATAK_ASSETS,
	DEFAULT_BATAK_THEME,
	DEFAULT_BATAK_DATA,
} from "./TemplateAdatBatak";
import {
	DEFAULT_JAWA_ASSETS,
	DEFAULT_JAWA_THEME,
	DEFAULT_JAWA_DATA,
} from "./TemplateJawaElegant";

export const TEMPLATE_REGISTRY: Record<string, TemplatePresetMeta> = {
	"adat-batak": {
		id: "adat-batak",
		name: "Adat Batak (Ulos & Rumah Bolon)",
		category: "Batak Toba",
		author: "Preset 001 Engine",
		description:
			"Nuansa megah Batak Toba dengan motif Ulos mewah, atap Rumah Bolon, sliding bottom dock 5 menu besar, dan floating action stack.",
		sourceReference: "public/demo/adat-batak",
		thumbnailUrl: "/demo/adat-batak/assets/images/adat-batak.jpg",
		tags: ["11 Slide", "Rumah Bolon", "Ulos"],
		defaultAssets: DEFAULT_BATAK_ASSETS,
		defaultTheme: DEFAULT_BATAK_THEME,
		defaultData: DEFAULT_BATAK_DATA,
	},
	"jawa-elegant": {
		id: "jawa-elegant",
		name: "Jawa Elegant (Ivory & Gold)",
		category: "Jawa",
		author: "Preset 002 Engine",
		description:
			"Nuansa elegan Jawa modern dengan latar putih gading, aksen emas champagne, tipografi serif premium, dan bottom dock besar.",
		sourceReference: "public/demo/jawa-elegant",
		thumbnailUrl: "/demo/batak-merah/assets/images/bg.webp",
		tags: ["11 Slide", "Ivory", "Gold", "Islami"],
		defaultAssets: DEFAULT_JAWA_ASSETS,
		defaultTheme: DEFAULT_JAWA_THEME,
		defaultData: DEFAULT_JAWA_DATA,
	},
	default: {
		id: "default",
		name: "Preset Default (Blank White Starter)",
		category: "Starter Wireframe",
		author: "Preset Default Engine",
		description:
			"Preset kanvas putih bersih tanpa ornamen adat berat, ideal sebagai pondasi pembuatan template AI baru.",
		sourceReference: "preset-default",
		thumbnailUrl: "/logo-black.svg",
		tags: ["9 Slide", "White Canvas", "Minimal"],
		defaultAssets: {
			bgCover: "",
			frameTopLeft: "",
			frameTopRight: "",
			frameBottom: "",
			motifCenter: "",
			characterIllustration: "",
			groomFrame: "",
			brideFrame: "",
			groomPhoto: "",
			bridePhoto: "",
			venuePhoto: "",
			galleryPhotos: [],
			audioUrl: "",
		},
		defaultTheme: {
			invBg: "#ffffff",
			invBase: "#0f172a",
			invAccent: "#2563eb",
			invBorder: "#e2e8f0",
			menuBg: "#ffffff",
			menuInactive: "#64748b",
			menuActive: "#0f172a",
			fontBase: "sans-serif",
			fontAccent: "sans-serif",
			fontLatin: "sans-serif",
		},
		defaultData: DEFAULT_JAWA_DATA,
	},
};

export const PRESET_REGISTRY = TEMPLATE_REGISTRY;
