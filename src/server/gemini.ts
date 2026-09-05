import { getAdminSettings } from "@/server/settings";
import { getTemplateBySlug } from "@/server/templates";
import { db } from "@/lib/db/client";
import { templateAssetItems, type Template } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
let currentGeminiKeyIndex = 0;

interface GeminiContentPart {
	text?: string;
}

interface GeminiCandidate {
	content?: {
		parts?: GeminiContentPart[];
	};
}

interface GeminiApiResponse {
	candidates?: GeminiCandidate[];
	error?: {
		message?: string;
		code?: number;
		status?: string;
	};
}

export interface ConnectionTestResult {
	success: boolean;
	latencyMs: number;
	model: string;
	message: string;
	activeKeyIndex?: number;
	totalKeys?: number;
}

export interface ExternalPromptsData {
	chatgptMetaPrompt: string;
	midjourneyPrompt: string;
	fluxDallePrompt: string;
	klingVideoPrompt: string;
	carousel3x3Concept: string;
}

export interface TemplatePromoResult {
	templateName: string;
	templateSlug: string;
	category: string;
	pricingInfo: string;
	thumbnailConcept: string;
	brandingNotes: string;
	instagram: {
		caption: string;
		slides: string[];
		hashtags: string[];
		cta: string;
	};
	tiktok: {
		hook: string;
		script: {
			timestamp: string;
			visual: string;
			voiceover: string;
			onScreenText: string;
		}[];
		caption: string;
		hashtags: string[];
		musicSuggestion: string;
	};
	targetAudience: string;
	angle: string;
	externalPrompts?: ExternalPromptsData;
	selectedCdnAssets?: string[];
}

export interface ImagePromptResult {
	concept: string;
	aspectRatio: string;
	chatgptPrompt: string;
	midjourneyPrompt: string;
	fluxPrompt: string;
	negativePrompt: string;
	tips: string;
	thumbnailGuide: {
		videoOverlayPosition: string;
		brandingSpecs: string;
		colorPaletteHex: string[];
		fontPairing: string;
		dynamicPriceTag: string;
	};
}

export interface VideoPromptResult {
	concept: string;
	veo3Prompt: string;
	soraPrompt: string;
	runwayPrompt: string;
	klingPrompt: string;
	cameraDirection: string;
	soundDesign: string;
	storyboardNotes: string;
	capcutEditingGuide: string;
	dynamicPricingHook: string;
}

export async function getGeminiRotationStats() {
	const settings = await getAdminSettings();
	const pool = settings.geminiApiKeys?.length
		? settings.geminiApiKeys
		: [
				settings.geminiApiKey ||
					process.env["GEMINI_API_KEY"] ||
					process.env["GOOGLE_API_KEY"] ||
					"",
			].filter(Boolean);

	return {
		totalKeys: pool.length,
		activeKeyIndex: pool.length > 0 ? currentGeminiKeyIndex % pool.length : 0,
		model: settings.geminiModel || DEFAULT_GEMINI_MODEL,
	};
}

async function resolveActiveKeyAndModel(
	customKey?: string,
	customModel?: string,
) {
	if (customKey && customKey.trim()) {
		return {
			key: customKey.trim(),
			model: customModel?.trim() || DEFAULT_GEMINI_MODEL,
			endpoint: "",
			useOpenAI: false,
		};
	}

	const settings = await getAdminSettings();
	const model = customModel?.trim() || settings.geminiModel || DEFAULT_GEMINI_MODEL;

	const pool: string[] = [];
	if (settings.geminiApiKeys && settings.geminiApiKeys.length > 0) {
		pool.push(...settings.geminiApiKeys);
	}
	if (settings.geminiApiKey?.trim() && !pool.includes(settings.geminiApiKey.trim())) {
		pool.unshift(settings.geminiApiKey.trim());
	}
	const envKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
	if (envKey && !pool.includes(envKey)) {
		pool.push(envKey);
	}

	const aiKey = (settings as any).aiApiKey?.trim?.() || "";
	const aiEp = (settings as any).aiEndpoint?.trim?.() || "";

	if (!customModel && aiKey && aiEp && !settings.geminiModel?.startsWith("gemini")) {
		return {
			key: aiKey,
			model: "claude-sonnet-4.5",
			endpoint: aiEp,
			useOpenAI: true,
		};
	}

	const key = pool.length > 0 ? pool[currentGeminiKeyIndex % pool.length] : "";

	return { key, model, endpoint: "", useOpenAI: false };
}

export async function testGeminiConnection(
	customKey?: string,
	customModel?: string,
): Promise<ConnectionTestResult> {
	const settings = await getAdminSettings();
	const model = customModel?.trim() || settings.geminiModel || DEFAULT_GEMINI_MODEL;

	const pool: string[] = [];
	if (settings.geminiApiKeys && settings.geminiApiKeys.length > 0) {
		pool.push(...settings.geminiApiKeys);
	}
	if (settings.geminiApiKey?.trim() && !pool.includes(settings.geminiApiKey.trim())) {
		pool.unshift(settings.geminiApiKey.trim());
	}
	const envKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
	if (envKey && !pool.includes(envKey)) {
		pool.push(envKey);
	}

	const activeIdx = pool.length > 0 ? currentGeminiKeyIndex % pool.length : 0;
	const key = customKey?.trim() || (pool.length > 0 ? pool[activeIdx] : "");

	if (!key) {
		return {
			success: false,
			latencyMs: 0,
			model,
			message: "API Key kosong. Masukkan API Key valid di Pengaturan AI.",
			activeKeyIndex: 0,
			totalKeys: 0,
		};
	}

	const startTime = Date.now();

	try {
		const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
		const res = await fetch(geminiEndpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: "Ping test. Balas 1 kata: OK" }] }],
			}),
		});

		const latencyMs = Date.now() - startTime;
		const json = (await res.json()) as GeminiApiResponse;

		if (!res.ok || json.error) {
			return {
				success: false,
				latencyMs,
				model,
				message: json.error?.message || `HTTP ${res.status}`,
				activeKeyIndex: activeIdx + 1,
				totalKeys: pool.length,
			};
		}

		currentGeminiKeyIndex = (activeIdx + 1) % Math.max(1, pool.length);

		return {
			success: true,
			latencyMs,
			model,
			message: `Terhubung (Gemini ${model} — Key #${activeIdx + 1} dari ${pool.length} Pool Aktif)`,
			activeKeyIndex: activeIdx + 1,
			totalKeys: pool.length,
		};
	} catch (err: unknown) {
		const latencyMs = Date.now() - startTime;
		const msg = err instanceof Error ? err.message : "Gagal koneksi";
		return {
			success: false,
			latencyMs,
			model,
			message: msg,
			activeKeyIndex: activeIdx + 1,
			totalKeys: pool.length,
		};
	}
}

async function requestGemini(
	prompt: string,
	systemInstruction?: string,
	modelOverride?: string,
): Promise<string> {
	const settings = await getAdminSettings();
	const model = modelOverride?.trim() || settings.geminiModel || DEFAULT_GEMINI_MODEL;

	const aiKey = (settings as any).aiApiKey?.trim?.() || "";
	const aiEp = (settings as any).aiEndpoint?.trim?.() || "";

	if (!modelOverride && aiKey && aiEp && !settings.geminiModel?.startsWith("gemini")) {
		const messages: Array<{ role: string; content: string }> = [];
		if (systemInstruction) {
			messages.push({ role: "system", content: systemInstruction });
		}
		messages.push({ role: "user", content: prompt });

		const res = await fetch(aiEp, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${aiKey}`,
			},
			body: JSON.stringify({
				model: "claude-sonnet-4.5",
				messages,
				max_tokens: 4000,
				temperature: 0.7,
			}),
		});

		if (res.ok) {
			const json = (await res.json()) as any;
			const text = json.choices?.[0]?.message?.content;
			if (text) return text.trim();
		}
	}

	const pool: string[] = [];
	if (settings.geminiApiKeys && settings.geminiApiKeys.length > 0) {
		pool.push(...settings.geminiApiKeys);
	}
	if (settings.geminiApiKey?.trim() && !pool.includes(settings.geminiApiKey.trim())) {
		pool.unshift(settings.geminiApiKey.trim());
	}
	const envKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
	if (envKey && !pool.includes(envKey)) {
		pool.push(envKey);
	}

	if (pool.length === 0) {
		throw new Error("API Key Gemini belum dikonfigurasi di database.");
	}

	const maxAttempts = Math.min(pool.length, 6);
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const activeIdx = (currentGeminiKeyIndex + attempt) % pool.length;
		const currentKey = pool[activeIdx];

		try {
			const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
			const requestBody: Record<string, unknown> = {
				contents: [
					{
						role: "user",
						parts: [{ text: prompt }],
					},
				],
				generationConfig: {
					temperature: 0.5,
					topP: 0.95,
					maxOutputTokens: 8192,
				},
			};

			if (systemInstruction) {
				requestBody["systemInstruction"] = {
					parts: [{ text: systemInstruction }],
				};
			}

			const res = await fetch(geminiEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			if (!res.ok) {
				const errJson = (await res.json().catch(() => ({}))) as GeminiApiResponse;
				const errMsg = errJson.error?.message || `Gemini API HTTP ${res.status}`;
				lastError = new Error(`Key #${activeIdx + 1}: ${errMsg}`);
				continue;
			}

			const json = (await res.json()) as GeminiApiResponse;
			const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

			if (!text) {
				lastError = new Error(`Key #${activeIdx + 1}: Respon kosong`);
				continue;
			}

			currentGeminiKeyIndex = (activeIdx + 1) % pool.length;
			return text.trim();
		} catch (err: unknown) {
			lastError = err instanceof Error ? err : new Error(String(err));
		}
	}

	throw (
		lastError ||
		new Error("Semua API Key Gemini dalam rotasi mengalami kendala koneksi.")
	);
}

function extractBrandingContext(settings: Awaited<ReturnType<typeof getAdminSettings>>) {
	const logo =
		settings.logoUrl ||
		settings.faviconUrl ||
		"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp";

	const packages = settings.packages || [];
	const pricingSummary =
		packages.length > 0
			? packages
					.map(
						(p) =>
							`${p.name}: Rp ${p.price.toLocaleString("id-ID")}${
								p.originalPrice
									? ` (Harga Normal: Rp ${p.originalPrice.toLocaleString("id-ID")})`
									: ""
							}`,
					)
					.join(" | ")
			: "Paket Silver: Rp 15.000 | Paket Gold: Rp 35.000 | Paket Platinum: Rp 75.000";

	const lowestPrice =
		packages.length > 0
			? Math.min(...packages.map((p) => p.price)).toLocaleString("id-ID")
			: "15.000";

	return {
		logo,
		pricingSummary,
		lowestPrice,
		brandColors: {
			primarySage: "#7ea67e",
			deepSage: "#567c56",
			champagneGold: "#c9a96e",
			lightGold: "#e8c98a",
			warmIvory: "#faf8f5",
			darkObsidian: "#090c10",
			charcoal: "#1a1a1a",
		},
		fonts: {
			heading: "Cormorant Garamond (Classic Luxury Serif)",
			coupleName: "Great Vibes / Alex Brush (Calligraphy)",
			body: "Inter / Montserrat (Modern Clean Sans-Serif)",
		},
	};
}

export async function generateTemplatePromotion(params: {
	templateSlug: string;
	platform?: "instagram" | "tiktok" | "all";
	tone?: string;
	customBrief?: string;
	selectedCdnAssets?: string[];
}): Promise<TemplatePromoResult> {
	const settings = await getAdminSettings();
	const brand = extractBrandingContext(settings);
	const template = await getTemplateBySlug(params.templateSlug);
	const templateName = template?.name || params.templateSlug;
	const category = template?.category || "Pernikahan Digital";
	const audio = template?.audioTitle || "Musik Romantis";
	const thumb = template?.thumb || "";
	const assetsCount = template?.assetsCount || 0;

	const toneDesc =
		params.tone === "viral"
			? "Gaya bahasa santai, relatable, hook tajam untuk TikTok dan Reels Gen Z"
			: params.tone === "formal"
				? "Gaya bahasa khidmat, santun, elegan nusantara, bernuansa sakral"
				: "Gaya bahasa romantis, estetik, menyentuh hati, mewah dan persuasif";

	const cdnListStr = params.selectedCdnAssets && params.selectedCdnAssets.length > 0
		? params.selectedCdnAssets.map((u, i) => `${i + 1}. ${u}`).join("\n")
		: (thumb.startsWith("http") ? `1. ${thumb}` : `1. ${brand.logo}`);

	const defaultExternalPrompts: ExternalPromptsData = {
		chatgptMetaPrompt: `Act as the Creative Director and Social Media Strategist for "Simfoni Cinta" (https://simfonicinta.my.id), a premier digital wedding invitation platform in Indonesia.

Brand Context & Assets:
- Template Name: "${templateName}" (${category})
- Theme / Nuance: "${template?.theme || "Elegan"}"
- Official CDN Logo: "${brand.logo}"
- Visual Reference Images (GitHub CDN):
${cdnListStr}
- Color Palette: Sage Green (${brand.brandColors.primarySage}), Deep Sage (${brand.brandColors.deepSage}), Champagne Gold (${brand.brandColors.champagneGold}), Warm Ivory (${brand.brandColors.warmIvory})
- Typography: ${brand.fonts.heading} (Headings), ${brand.fonts.coupleName} (Names), ${brand.fonts.body} (Body)
- Dynamic Pricing: ${brand.pricingSummary}. Lowest starts from Rp ${brand.lowestPrice}.

Your Task:
1. Analyze the visual elements and aesthetics of the provided CDN images.
2. Formulate 3 distinct high-converting hooks for Indonesian couples on Instagram and TikTok.
3. Write a high-converting 7-day social media campaign plan with detailed video storyboards and carousel concepts.
4. Output 3 production-ready prompts for Midjourney v6 and DALL-E 3 featuring realistic Indonesian wedding scenarios with empty smartphone screens for manual video overlay.`,

		midjourneyPrompt: `/imagine prompt: High-fashion Indonesian wedding invitation mockup for template "${templateName}", ${category} style, displayed on a sleek iPhone 16 Pro Max held gracefully by an Indonesian bride wearing traditional modern attire with intricate gold embroidery and henna art, luxury aesthetic, warm champagne gold (#c9a96e) and soft sage green (#7ea67e) accents, natural morning studio lighting, flowers and jasmine petals on silk tabletop, perfectly straight screen with blank transparent overlay cutout for video placement, ultra realistic 8k, shot on Hasselblad H6D-100c, 85mm f/1.4 lens --ar 9:16 --style raw --v 6.1 ${params.selectedCdnAssets?.[0] ? `--sref ${params.selectedCdnAssets[0]}` : ""}`.trim(),

		fluxDallePrompt: `A photorealistic high-end vertical 9:16 product advertisement for "Simfoni Cinta" digital wedding invitations. Feature: Template "${templateName}" (${category} theme). In the center, an elegant smartphone is propped up on a textured marble and sage green velvet pedestal, surrounded by white roses, jasmine blossoms, and gold calligraphy envelopes. The phone screen is clearly visible and straight, formatted as a blank mockup display ready for a video overlay. The overall ambiance is luminous, romantic, and prestigious, adhering strictly to the brand palette of Warm Champagne Gold (#c9a96e) and Muted Sage Green (#7ea67e). Dynamic price tag in bottom-left corner reads "Mulai Rp ${brand.lowestPrice}". Cinematic commercial photography, 8k resolution.`,

		klingVideoPrompt: `Cinematic vertical 9:16 video: Slow smooth dolly zoom in towards a luxury Indonesian wedding invitation on a flagship smartphone resting on a bed of fresh jasmine and cream silk ribbons. Soft morning light casts delicate shadows. Golden sparkles and gentle rose petals float slowly across the frame in ultra slow-motion (60fps). The camera smoothly glides around the phone with high-end commercial polish, ending on an inviting call-to-action view. Highly detailed, photorealistic 4k, 24fps film look.`,

		carousel3x3Concept: `Concept 3x3 Seamless Instagram Grid for "${templateName}":
- Row 1 (Post 1-3): Large panoramic hero visual of the couple's invitation header with floating gold logo (${brand.logo}) and romantic quote.
- Row 2 (Post 4-6): Interactive feature showcase (RSVP digital, QRIS angpau amplop, and Google Maps live routing) with smartphone screen cutouts.
- Row 3 (Post 7-9): Special price reveal starting from Rp ${brand.lowestPrice}, customer testimonial badges, and final CTA button to link in bio.
- Continuity: Connected continuous floral vine and sage green background texture linking all 9 posts seamlessly.`
	};

	const systemPrompt = `Kamu adalah Creative Marketing Director & Chief Copywriter Simfoni Cinta (https://simfonicinta.my.id).
Wajib patuhi Aturan Branding Simfoni Cinta:
1. Logo Resmi: ${brand.logo} (Logo monogram kaligrafi emas bernuansa mewah). Jaga konsistensi identitas 100%.
2. Palet Warna Wajib: Sage Green (${brand.brandColors.primarySage}), Champagne Gold (${brand.brandColors.champagneGold}), Warm Ivory (${brand.brandColors.warmIvory}), dan Dark Obsidian (${brand.brandColors.darkObsidian}). Feed Instagram harus serasi & harmonis.
3. Font Typography: ${brand.fonts.heading} untuk judul mewah, ${brand.fonts.coupleName} untuk nama pasangan, ${brand.fonts.body} untuk teks isi.
4. Daftar Harga Paket Dinamis (DILARANG HARDCODE): ${brand.pricingSummary}. Selalu sebutkan harga mulai dari Rp ${brand.lowestPrice}.
5. Panduan Thumbnail Video: Desain thumbnail harus memiliki area placeholder layar smartphone kosong untuk ditimpa (overlay) rekaman video undangan asli secara manual di CapCut/Premiere.
Jawab HANYA dalam format JSON valid tanpa tanda backtick atau markdown code fence.`;

	const prompt = `Hasilkan paket promosi terpadu untuk template undangan digital berikut:
Nama Template: ${templateName}
Kategori: ${category}
Tema: ${template?.theme || "Elegan"}
Latar Musik: ${audio}
Thumbnail Mockup: ${thumb}
Jumlah Aset Visual: ${assetsCount} aset
${params.selectedCdnAssets && params.selectedCdnAssets.length > 0 ? `Daftar CDN Gambar Terpilih (Gunakan untuk panduan visual akurat):\n${params.selectedCdnAssets.join("\n")}` : ""}
Gaya Tone: ${toneDesc}
Instruksi Tambahan: ${params.customBrief || "Fokus pada keanggunan visual, kemudahan sebar WA, dan fitur RSVP amplop digital"}

Struktur balasan JSON wajib:
{
  "templateName": "${templateName}",
  "templateSlug": "${params.templateSlug}",
  "category": "${category}",
  "pricingInfo": "Harga resmi paket Simfoni Cinta: ${brand.pricingSummary}",
  "thumbnailConcept": "Deskripsi tata letak thumbnail promosi dengan area layar smartphone untuk ditimpa video undangan",
  "brandingNotes": "Panduan warna Sage (#7ea67e) + Gold (#c9a96e) dan font Cormorant Garamond untuk feed Instagram",
  "instagram": {
    "caption": "Teks caption Instagram lengkap dengan emoji estetik dan storytelling memikat",
    "slides": [
      "Slide 1 Hook text",
      "Slide 2 Benefit visual",
      "Slide 3 Fitur canggih",
      "Slide 4 CTA"
    ],
    "hashtags": ["#UndanganDigital", "#UndanganPernikahan", "#SimfoniCinta", "#WeddingInvitation"],
    "cta": "Mulai dari Rp ${brand.lowestPrice}! Link di bio untuk coba demo dan pesan hari ini!"
  },
  "tiktok": {
    "hook": "Hook 3 detik pertama yang bikin calon pengantin langsung berhenti scroll",
    "script": [
      {
        "timestamp": "0:00 - 0:03",
        "visual": "Tampilan visual adegan pertama",
        "voiceover": "Kalimat yang diucapkan di 3 detik pertama",
        "onScreenText": "Teks bold di layar"
      },
      {
        "timestamp": "0:03 - 0:10",
        "visual": "Tampilan fitur interaktif template di smartphone",
        "voiceover": "Penjelasan keunggulan template",
        "onScreenText": "Teks penjelasan"
      },
      {
        "timestamp": "0:10 - 0:20",
        "visual": "Tamu menerima undangan & buka amplop digital",
        "voiceover": "Fitur RSVP & kirim hadiah instan",
        "onScreenText": "Teks fitur"
      },
      {
        "timestamp": "0:20 - 0:30",
        "visual": "Tampilan logo Simfoni Cinta & harga mulai Rp ${brand.lowestPrice}",
        "voiceover": "Ajakan pesan sebelum promo habis",
        "onScreenText": "Klik Keranjang Kuning / Bio"
      }
    ],
    "caption": "Caption TikTok pendek dan punchy dengan harga mulai Rp ${brand.lowestPrice}",
    "hashtags": ["#fyp", "#undanganviral", "#nikah2026", "#pernikahanimpian"],
    "musicSuggestion": "Sound trending romantis atau lagu pop akustik pernikahan"
  },
  "targetAudience": "Calon pengantin usia 22-35 tahun, Wedding Organizer, pasangan yang ingin pesta pernikahan rapi & modern",
  "angle": "Kemewahan desain, kemudahan sebar WA, harga terjangkau mulai Rp ${brand.lowestPrice}"
}`;

	let rawResponse = "";
	try {
		rawResponse = await requestGemini(prompt, systemPrompt);
	} catch {}
	const cleaned = rawResponse
		.replace(/```json/gi, "")
		.replace(/```/g, "")
		.trim();

	try {
		const parsed = JSON.parse(cleaned) as TemplatePromoResult;
		parsed.externalPrompts = defaultExternalPrompts;
		parsed.selectedCdnAssets = params.selectedCdnAssets;
		return parsed;
	} catch {
		return {
			templateName,
			templateSlug: params.templateSlug,
			category,
			pricingInfo: `Harga resmi: ${brand.pricingSummary}`,
			thumbnailConcept:
				"Frame mockup 9:16 elegan berlatar sutra sage green dan kelopak melati, dengan area layar smartphone terbuka di tengah untuk ditempeli rekaman video undangan di CapCut.",
			brandingNotes:
				"Dominasi warna Sage Green (#7ea67e) & Champagne Gold (#c9a96e), tipografi Cormorant Garamond pada judul.",
			instagram: {
				caption: `Abadikan momen sakral Anda dengan kemewahan ${templateName}. Dilengkapi RSVP online, amplop digital QRIS, musik romantis, dan navigasi Google Maps. Dapatkan promo spesial mulai Rp ${brand.lowestPrice}! ✨💍`,
				slides: [
					`Undangan Pernikahan Eksklusif ${templateName}`,
					"Desain mewah, elegan & responsif di semua smartphone",
					"Kirim undangan tanpa batas via WhatsApp",
					`Mulai Rp ${brand.lowestPrice} — Coba demo gratis sekarang di link bio!`,
				],
				hashtags: [
					"#UndanganDigital",
					"#SimfoniCinta",
					"#WeddingInvitation",
					"#UndanganElegan",
					"#PernikahanModern",
				],
				cta: `Klik link di bio untuk coba demo langsung mulai Rp ${brand.lowestPrice}!`,
			},
			tiktok: {
				hook: `Bikin undangan pernikahan semewah hotel bintang 5 cuma mulai Rp ${brand.lowestPrice}!`,
				script: [
					{
						timestamp: "0:00 - 0:03",
						visual: "Layar smartphone membuka undangan dengan alunan musik merdu",
						voiceover: `Ini rahasia nikahan kami terlihat mewah dan berkelas cuma modal Rp ${brand.lowestPrice}!`,
						onScreenText: "Undangan Digital Mewah",
					},
					{
						timestamp: "0:03 - 0:15",
						visual: "Scroll galeri foto prewedding dan maps venue interaktif",
						voiceover:
							"Tamu bisa langsung konfirmasi kehadiran dan kirim kado amplop via QRIS.",
						onScreenText: "Fitur Lengkap & Modern",
					},
					{
						timestamp: "0:15 - 0:30",
						visual: `Tampilan logo Simfoni Cinta dan harga mulai Rp ${brand.lowestPrice}`,
						voiceover:
							"Pilihan template terlengkap se-Indonesia hanya di Simfoni Cinta.",
						onScreenText: `Mulai Rp ${brand.lowestPrice} — Cek Link di Bio!`,
					},
				],
				caption: `Bikin undangan pernikahan semewah ini cuma hitungan menit mulai Rp ${brand.lowestPrice}! 💍✨ #fyp #undanganpernikahan #simfonicinta`,
				hashtags: ["#fyp", "#undanganviral", "#weddinginspiration"],
				musicSuggestion: "A Thousand Years (Acoustic Guitar Version)",
			},
			targetAudience:
				"Calon mempelai pria & wanita yang sedang merencanakan pernikahan",
			angle: `Hemat biaya cetak, praktis sebar WA, tampilan mewah seperti website VIP mulai Rp ${brand.lowestPrice}`,
			externalPrompts: defaultExternalPrompts,
			selectedCdnAssets: params.selectedCdnAssets,
		};
	}
}

export async function generateImagePrompts(params: {
	concept: string;
	templateSlug?: string;
	aspectRatio?: string;
	style?: string;
}): Promise<ImagePromptResult> {
	const settings = await getAdminSettings();
	const brand = extractBrandingContext(settings);

	let templateContext = "";
	if (params.templateSlug) {
		const t = await getTemplateBySlug(params.templateSlug);
		if (t) {
			templateContext = `Template Name: ${t.name}, Category: ${t.category}, Theme: ${t.theme}`;
		}
	}

	const ar = params.aspectRatio || "9:16";
	const stylePreset = params.style || "Photorealistic Luxury Wedding";

	const systemPrompt = `You are an elite AI Art Director & Visual Branding Strategist for Simfoni Cinta (https://simfonicinta.my.id).
Brand Identity Mandates:
1. Official CDN Logo: "${brand.logo}". Monogram calligraphy heart emblem in warm champagne gold. Must be 100% brand-accurate without distortion.
2. Color Palette Rules: Sage Green (${brand.brandColors.primarySage}), Deep Forest Sage (${brand.brandColors.deepSage}), Champagne Gold (${brand.brandColors.champagneGold}), Warm Ivory (${brand.brandColors.warmIvory}), Charcoal (${brand.brandColors.charcoal}). Maintain cohesive aesthetics across 3x3 Instagram feed grids.
3. Typography: ${brand.fonts.heading} for titles, ${brand.fonts.coupleName} for couple names, ${brand.fonts.body} for subtitles and badges.
4. Dynamic Pricing: Packages are ${brand.pricingSummary}. Lowest package starts from Rp ${brand.lowestPrice}.
5. Manual Video Overlay Thumbnail Structure: The composition MUST feature a clear, perfectly straight smartphone screen cutout/placeholder positioned cleanly in the layout so the user can easily overlay their screen-recorded invitation video on top in CapCut/Premiere.
Respond ONLY with valid JSON without markdown code fences.`;

	const userPrompt = `Generate hyper-detailed promotional prompts for ChatGPT DALL-E 3, Midjourney v6, and Flux:
User Concept: ${params.concept}
Template Context: ${templateContext || "Luxury Indonesian wedding invitation digital showcase"}
Aspect Ratio: ${ar}
Style Preset: ${stylePreset}
Brand Palette: Sage Green (${brand.brandColors.primarySage}), Champagne Gold (${brand.brandColors.champagneGold}), Warm Ivory (${brand.brandColors.warmIvory})
Official Logo URL: ${brand.logo}
Package Starting Price: Rp ${brand.lowestPrice}

Format strictly as JSON:
{
  "concept": "${params.concept}",
  "aspectRatio": "${ar}",
  "chatgptPrompt": "Extremely detailed English prompt for ChatGPT DALL-E 3 with explicit lighting, luxury props, color palette (#7ea67e sage green and #c9a96e champagne gold), and smartphone screen mockup designed for video overlay",
  "midjourneyPrompt": "High precision Midjourney v6 prompt with photography parameters, studio lighting, Hasselblad H6D-100c camera, 85mm f/1.4 lens, --ar ${ar} --v 6.1 --style raw --q 2",
  "fluxPrompt": "Flux Schnell/Dev style prompt focusing on hyper-detailed organic realism, soft daylight bokeh, and textured fabrics",
  "negativePrompt": "blurry, low quality, distorted text, watermark, deformed hands, oversaturated, plastic skin, cheap rendering",
  "tips": "Practical tip for applying this prompt on Instagram feed and video overlay",
  "thumbnailGuide": {
    "videoOverlayPosition": "Center screen coordinates and aspect ratio for CapCut overlay video",
    "brandingSpecs": "Logo Simfoni Cinta placement (top center or bottom) and typography hierarchy",
    "colorPaletteHex": ["${brand.brandColors.primarySage}", "${brand.brandColors.champagneGold}", "${brand.brandColors.warmIvory}", "${brand.brandColors.deepSage}"],
    "fontPairing": "Heading: Cormorant Garamond serif, Detail: Inter sans-serif",
    "dynamicPriceTag": "Mulai Rp ${brand.lowestPrice}"
  }
}`;

	const rawResponse = await requestGemini(userPrompt, systemPrompt);
	const cleaned = rawResponse
		.replace(/```json/gi, "")
		.replace(/```/g, "")
		.trim();

	try {
		const parsed = JSON.parse(cleaned) as ImagePromptResult;
		return parsed;
	} catch {
		return {
			concept: params.concept,
			aspectRatio: ar,
			chatgptPrompt: `Editorial studio photography of a luxury promotional frame for 'Simfoni Cinta' digital wedding invitations. A modern sleek smartphone rests angled on soft sage green (#7ea67e) silk and raw ivory linen (#faf8f5), surrounded by blooming white jasmine buds, delicate dried eucalyptus, and twin polished 18k champagne gold rings. The smartphone display is framed with subtle gold filigree, optimized with a clean center screen ready for digital invitation video overlay. Warm diffused morning sunlight from a nearby window, gentle soft shadows, Hasselblad 8k detail, ultra-clean aesthetic.`,
			midjourneyPrompt: `Luxury Indonesian wedding invitation mockup layout, high-end smartphone with clean screen frame for video composite, set against textured sage green songket cloth and travertine marble, jasmine petals, champagne gold accents, Hasselblad H6D-100c, 85mm f/1.4, natural soft lighting, photorealistic --ar ${ar} --v 6.1 --style raw --q 2`,
			fluxPrompt: `Hyper-realistic overhead flatlay of a digital wedding invitation promotion, sage green fabric backdrop, gold foil embellishments, clear smartphone screen placeholder, warm organic daylight, cinematic depth of field.`,
			negativePrompt:
				"blurry, ugly, distorted phone screen, misspelled text, low resolution, plastic appearance, noisy, artifacting",
			tips: `Gunakan rasio ${ar} untuk Instagram Story/Reels. Buka gambar di CapCut, letakkan rekaman video undangan pada Track 2 (Overlay) tepat di atas frame layar smartphone.`,
			thumbnailGuide: {
				videoOverlayPosition:
					"Tengah layar smartphone (Rasio 9:16 vertikal, scale 85% di CapCut)",
				brandingSpecs:
					"Logo Simfoni Cinta di sudut atas, badge harga di sudut bawah",
				colorPaletteHex: [
					brand.brandColors.primarySage,
					brand.brandColors.champagneGold,
					brand.brandColors.warmIvory,
					brand.brandColors.deepSage,
				],
				fontPairing:
					"Cormorant Garamond (Heading) + Inter SemiBold (Price & Body)",
				dynamicPriceTag: `Mulai Rp ${brand.lowestPrice}`,
			},
		};
	}
}

export async function generateVideoPrompts(params: {
	concept: string;
	templateSlug?: string;
	cameraMotion?: string;
	durationSeconds?: number;
}): Promise<VideoPromptResult> {
	const settings = await getAdminSettings();
	const brand = extractBrandingContext(settings);

	let templateContext = "";
	if (params.templateSlug) {
		const t = await getTemplateBySlug(params.templateSlug);
		if (t) {
			templateContext = `Template Name: ${t.name}, Category: ${t.category}, Theme: ${t.theme}`;
		}
	}

	const motion =
		params.cameraMotion || "Slow cinematic camera pan and macro rack focus";
	const duration = params.durationSeconds || 10;

	const systemPrompt = `You are an elite Cinematographer and AI Video Prompt Engineer for Simfoni Cinta (https://simfonicinta.my.id).
Brand Context:
- Brand Name: Simfoni Cinta
- Logo CDN: ${brand.logo}
- Palette: Sage Green (${brand.brandColors.primarySage}), Champagne Gold (${brand.brandColors.champagneGold}), Warm Ivory (${brand.brandColors.warmIvory})
- Typography: Cormorant Garamond serif & clean modern sans
- Dynamic Pricing: ${brand.pricingSummary}, starting from Rp ${brand.lowestPrice}
- Video Editing Manual: CapCut Track 1 = Generated background video, Track 2 = Screen recorded invitation demo, Track 3 = Price badge & CTA.
Respond ONLY with valid JSON without markdown code blocks.`;

	const userPrompt = `Generate cinematic AI video generation prompts for Google Veo 3, OpenAI Sora, Runway Gen-3, and Kling AI:
Concept: ${params.concept}
Template Context: ${templateContext || "Simfoni Cinta Luxury Wedding Invitation"}
Camera Movement: ${motion}
Target Duration: ${duration} seconds
Brand Colors: Sage Green (#7ea67e) & Champagne Gold (#c9a96e)
Pricing: Mulai Rp ${brand.lowestPrice}

Strict JSON format:
{
  "concept": "${params.concept}",
  "veo3Prompt": "Full Google Veo 3 prompt describing photorealistic video motion, camera speed, atmospheric volumetric lighting, subject transition, frame rate, 4k cinematic render",
  "soraPrompt": "OpenAI Sora prompt detailing dynamic physics, realistic textile and light interaction, smooth camera glide",
  "runwayPrompt": "Runway Gen-3 prompt with motion brush keywords, zoom and pan direction",
  "klingPrompt": "Kling AI prompt with high aesthetic Asian wedding cinematic details",
  "cameraDirection": "Camera movement instructions and focal point",
  "soundDesign": "Suggested sound effects and musical ambience (e.g. gentle string quartet with soft fabric rustle)",
  "storyboardNotes": "Quick note on how to edit and sequence the output in CapCut / Premiere",
  "capcutEditingGuide": "Track-by-track guide for overlaying the real invitation video on top of this background",
  "dynamicPricingHook": "Text hook overlay with dynamic price starting from Rp ${brand.lowestPrice}"
}`;

	const rawResponse = await requestGemini(userPrompt, systemPrompt);
	const cleaned = rawResponse
		.replace(/```json/gi, "")
		.replace(/```/g, "")
		.trim();

	try {
		const parsed = JSON.parse(cleaned) as VideoPromptResult;
		return parsed;
	} catch {
		return {
			concept: params.concept,
			veo3Prompt: `Cinematic 4K 60fps video: Slow elegant camera glide moving over an opulent Indonesian wedding hall decorated with sage green silk drapes (#7ea67e) and champagne gold arches (#c9a96e). Camera descends smoothly towards a sleek smartphone resting on an ivory marble table. Volumetric golden hour sunlight beams through tall windows, creating ethereal particle bokeh. Smooth slow-motion rack focus from white jasmine blossoms to the phone mockup. High-end commercial production value.`,
			soraPrompt: `Photorealistic cinematic tracking shot: The camera slowly orbits around a luxury smartphone mockup displaying an elegant wedding invitation interface. Gentle breeze moves sheer ivory linen curtains in the background. Soft candle flames flicker realistically, casting warm reflections across the phone glass and golden rings beside it. 35mm anamorphic aesthetic.`,
			runwayPrompt: `[Camera: Slow Orbit + Zoom In] A lavish Indonesian wedding invitation showcase in sage green and champagne gold palette, macro lens focusing on glistening gold foil details on digital mockup screen, warm candlelit ambience, 4k resolution.`,
			klingPrompt: `Cinematic video of elegant Indonesian wedding invitation presentation, smooth downward crane movement, traditional modern fusion decor, golden hour rim lighting, photorealistic textures.`,
			cameraDirection:
				"Slow 360-degree orbit around the phone, transitioning into a macro close-up on the invitation header.",
			soundDesign:
				"Acoustic cello intro with soft vinyl crackle, followed by romantic harp arpeggios and ambient outdoor breeze.",
			storyboardNotes:
				"Potong video menjadi klip 5-7 detik. Tambahkan efek transisi zoom-in di CapCut sebelum masuk ke demo interaktif.",
			capcutEditingGuide: `Track 1: Hasil video AI ini sebagai latar mewah. Track 2: Rekaman layar HP undangan digital (Overlay), dipotong pas di layar HP. Track 3: Stiker teks promo 'Mulai Rp ${brand.lowestPrice}'.`,
			dynamicPricingHook: `Pernikahan Mewah Impian Mulai Rp ${brand.lowestPrice} — Cek Link di Bio!`,
		};
	}
}

export interface UnifiedStudioPromoInput {
	templateSlug?: string;
	aspectRatio?: string;
	platform?: string;
	tone?: string;
	angle?: string;
	targetAudience?: string;
	cta?: string;
	customBrief?: string;
	contentType?: "all" | "visual" | "video";
	cameraMotion?: string;
	selectedCdnAssets?: string[];
}

export interface UnifiedStudioPromoResult {
	templateName: string;
	templateSlug: string;
	category: string;
	pricingInfo: string;
	lowestPrice: string;
	aspectRatio: string;
	assetAnalysis: {
		themeSummary: string;
		dominantColors: { name: string; hex: string; usage: string }[];
		typographyAnalysis: string;
		ornamentDetails: string;
		detectedCdnAssetsCount: number;
		cdnReferences: string[];
	};
	chatgptMegaPrompt: string;
	videoCinematics: {
		concept: string;
		cameraMotion: string;
		durationSeconds: number;
		veo3Prompt: string;
		soraPrompt: string;
		runwayPrompt: string;
		klingPrompt: string;
		soundDesign: string;
		storyboard: {
			shot: number;
			timestamp: string;
			visual: string;
			cameraMovement: string;
			lighting: string;
			voiceover: string;
			onScreenText: string;
		}[];
	};
	instagram: {
		headline: string;
		caption: string;
		slides: {
			slide: number;
			title: string;
			visualDirection: string;
			copy: string;
			onScreenCallout: string;
		}[];
		hashtags: string[];
		cta: string;
	};
	tiktok: {
		hook3s: string;
		caption: string;
		script: {
			timestamp: string;
			visual: string;
			voiceover: string;
			onScreenText: string;
		}[];
		hashtags: string[];
		musicSuggestion: string;
	};
	whatsappSuite: {
		formalVip: string;
		casualFriendly: string;
		promoLimited: string;
	};
	targetAudience: string;
	marketingAngle: string;
}

function buildFallbackUnifiedPromo(
	params: UnifiedStudioPromoInput,
	brand: ReturnType<typeof extractBrandingContext>,
	templateName: string,
	category: string,
	theme: string,
	cdnReferences: string[],
	targetRatio: string,
): UnifiedStudioPromoResult {
	return {
		templateName,
		templateSlug: params.templateSlug || "",
		category,
		pricingInfo: `Harga resmi Simfoni Cinta mulai Rp ${brand.lowestPrice}. ${brand.pricingSummary}`,
		lowestPrice: brand.lowestPrice,
		aspectRatio: targetRatio,
		assetAnalysis: {
			themeSummary: `Analisis estetika visual komprehensif untuk tema "${templateName}" (${category}). Desain memadukan keanggunan adat modern nusantara dengan aksen luxury minimalis. Tata letak responsif dirancang presisi untuk layar smartphone (${targetRatio}) dengan kontras rasio tinggi yang memanjakan mata tamu undangan.`,
			dominantColors: [
				{ name: "Champagne Gold", hex: "#c9a96e", usage: "Aksen kaligrafi, bingkai kartu, dan tombol aksi utama" },
				{ name: "Sage Green", hex: "#7ea67e", usage: "Latar belakang kanvas organik dan dekorasi daun tipis" },
				{ name: "Warm Ivory", hex: "#faf8f5", usage: "Kanvas utama kartu dan latar teks informasi acara" },
				{ name: "Dark Obsidian", hex: "#090c10", usage: "Frame luar smartphone dan kedalaman bayangan studio" },
			],
			typographyAnalysis: "Harmoni tipografi klasik Cormorant Garamond untuk judul acara, Alex Brush untuk nama kedua mempelai, dan Inter/Montserrat untuk kejelasan teks detail lokasi.",
			ornamentDetails: "Motif hiasan sudut geometris berbalut garis emas halus yang menyatu harmonis dengan tekstur kanvas digital tanpa efek norak.",
			detectedCdnAssetsCount: cdnReferences.length,
			cdnReferences,
		},
		chatgptMegaPrompt: `A hyper-realistic, high-end commercial studio product mockup shot of a modern flagship smartphone gracefully suspended and floating at a dynamic 15-degree angle in a pristine architectural luxury photography studio. The smartphone screen is vividly illuminated in ultra-high resolution OLED, showcasing the exact user interface of the digital wedding invitation titled "${templateName}" (${category} theme). The UI screen precisely mirrors the aesthetic, color palette, and intricate typography of the official reference assets: Champagne Gold (#c9a96e) and Muted Sage Green (#7ea67e) accents on a textured warm ivory canvas (#faf8f5), featuring elegant serif typography, romantic borders, interactive RSVP buttons, and digital envelope QRIS widgets. The phone body features a premium brushed natural titanium frame with micro-beveled edges and subtle glass light reflections. The background is a minimalist architectural set with soft curved travertine stone pedestals, delicate ivory silk fabric draping gently in the soft ambient breeze, and cinematic volumetric daylight streaming through high studio windows, creating soft ray-traced ambient occlusion and realistic ground contact shadows. Photography specifications: Captured on Hasselblad H6D-100c medium format camera, 85mm f/1.4 prime lens, aperture f/2.8 for silky depth of field, ISO 100, 1/250s shutter, studio strobe key light at 45 degrees diffused through a large octabox with warm golden reflector fill. STRICT NEGATIVE PARAMETERS: absolutely no human figures, no people, no faces, no hands, no fingers, no bride, no groom, no cartoonish illustrations, no messy or overgrown floral clutter, no blurry text, no distorted phone frame. Aspect ratio ${targetRatio}.`,
		videoCinematics: {
			concept: `Elegansi Sinematik Undangan Digital "${templateName}" di Meja Resepsi Mewah`,
			cameraMotion: params.cameraMotion || "Slow 360-degree orbit and macro rack focus",
			durationSeconds: 15,
			veo3Prompt: `Cinematic 4K 60fps advertisement for Simfoni Cinta digital wedding invitation "${templateName}". Camera begins with a dramatic macro descent towards a sleek smartphone floating above an ivory travertine pedestal draped in sage green raw silk. Soft golden hour light streams from window blinds, casting warm moving shadows. The phone screen turns on smoothly, displaying the luxury wedding invitation title and romantic couple names. Smooth slow rack focus from fine gold jewelry beside the phone to the crisp interactive UI. Ultra-smooth camera orbit, 8k resolution, cinematic commercial color grade.`,
			soraPrompt: `A photorealistic tracking shot in ${targetRatio} vertical ratio. A high-end smartphone showcasing the digital invitation "${templateName}" rests on an elegant marble table. Gentle morning light creates realistic caustics and highlights along the curved glass screen. A soft breeze sways a sheer ivory curtain in the blurred background. Warm candlelight flickers nearby, reflecting gracefully off the golden accents of the phone's displayed invitation layout. Shot on 35mm lens, film aesthetic, pristine physics simulation.`,
			runwayPrompt: `[Camera: Orbit 360 + Slow Dolly In] Commercial luxury showcase of digital wedding invitation "${templateName}" on flagship smartphone screen, champagne gold (#c9a96e) and sage green (#7ea67e) palette, macro textures, clean reflections, volumetric light beams, 4k 60fps.`,
			klingPrompt: `Ultra-detailed Indonesian modern wedding digital invitation showcase, camera glides slowly downward towards smartphone displaying "${templateName}", traditional modern aesthetic fusion, golden sparkles floating gently in the background, sharp 4k render.`,
			soundDesign: "Petikan harpa romantis lembut di awal, disambung melodi cello syahdu dengan ambient foley gemerisik kain sutra dan petikan jari halus saat layar menyala.",
			storyboard: [
				{
					shot: 1,
					timestamp: "00:00 - 00:03",
					visual: `Close-up makro bodi smartphone titanium melayang di atas meja marmer dengan pantulan cahaya emas halus.`,
					cameraMovement: "Slow downward crane",
					lighting: "Golden hour rim light",
					voiceover: "Jangan buang jutaan rupiah cuma buat kertas undangan yang bakal dibuang!",
					onScreenText: "Solusi Nikah Modern & Hemat",
				},
				{
					shot: 2,
					timestamp: "00:03 - 00:07",
					visual: `Layar smartphone menyala menampilkan nama kedua mempelai pada template "${templateName}" dengan tipografi kaligrafi mewah.`,
					cameraMovement: "Macro slow tracking",
					lighting: "Soft ambient studio",
					voiceover: `Beralih ke undangan digital eksklusif "${templateName}". Tampilannya memukau dan bikin tamu terharu sejak pertama kali buka.`,
					onScreenText: "Desain Mewah & Elegan",
				},
				{
					shot: 3,
					timestamp: "00:07 - 00:11",
					visual: `Layar bergerak menampilkan fitur RSVP interaktif, amplop digital QRIS, dan navigasi Google Maps akurat.`,
					cameraMovement: "360 gentle orbit",
					lighting: "Subtle backlight glow",
					voiceover: `Tamu bisa langsung konfirmasi kehadiran, kirim kado via QRIS, dan buka rute lokasi tanpa nyasar.`,
					onScreenText: "RSVP, QRIS & Google Maps",
				},
				{
					shot: 4,
					timestamp: "00:11 - 00:15",
					visual: `Tampilan akhir mockup smartphone berdampingan dengan logo Simfoni Cinta dan harga promo Rp ${brand.lowestPrice}.`,
					cameraMovement: "Smooth zoom out",
					lighting: "Warm cinematic daylight",
					voiceover: `Harganya mulai Rp ${brand.lowestPrice} aja, bayar sekali aktif selamanya! Cek link di bio untuk coba live demonya!`,
					onScreenText: `Mulai Rp ${brand.lowestPrice} — Coba Demo di Bio`,
				},
			],
		},
		instagram: {
			headline: `Mewahnya Undangan Pernikahan Digital "${templateName}" — Cuma Mulai Rp ${brand.lowestPrice}!`,
			caption: `Solusi pernikahan impian tanpa bikin dompet boncos! ✨\n\nKenalkan tema "${templateName}", mahakarya undangan digital bernuansa mewah yang dirancang khusus untuk calon pengantin modern. Praktis disebar lewat WhatsApp dan dilengkapi fitur terlengkap:\n\n✨ Konfirmasi kehadiran (RSVP) real-time\n✨ Kirim amplop kado instan via QRIS\n✨ Navigasi lokasi presisi tersambung Google Maps\n✨ Galeri foto romantis & cerita cinta\n✨ Musik romantis pilihan tanpa batas putar\n\nBayar sekali, undangan aktif selamanya tanpa batasan kuota tamu!\n\n👉 Klik link di bio untuk coba live demonya sekarang sebelum promo hari ini berakhir!`,
			slides: [
				{ slide: 1, title: "Hook", visualDirection: "Mockup smartphone vertikal menampilkan halaman cover undangan", copy: "Masih Zaman Cetak Undangan Kertas Mahal?", onScreenCallout: "Cek Alternatif Mewah Ini!" },
				{ slide: 2, title: "Solusi", visualDirection: "Layar smartphone swipe memperlihatkan nama mempelai", copy: "Undangan Digital Eksklusif Bernuansa Elegan", onScreenCallout: `Tema: ${templateName}` },
				{ slide: 3, title: "Kemudahan", visualDirection: "Tampilan teks WhatsApp dan tombol bagikan cepat", copy: "Sebar ke Ratusan Tamu Cuma 1 Kali Klik", onScreenCallout: "Tanpa Batas Kuota Tamu" },
				{ slide: 4, title: "Fitur RSVP", visualDirection: "Tampilan form RSVP dengan centang hadir/tidak", copy: "Tamu Konfirmasi Kehadiran Langsung di Web", onScreenCallout: "Rekap Tamu Otomatis" },
				{ slide: 5, title: "Amplop QRIS", visualDirection: "Layar menampilkan rekening bank dan barcode QRIS", copy: "Kirim Hadiah Pernikahan Lebih Praktis & Aman", onScreenCallout: "100% Masuk Rekening Pribadi" },
				{ slide: 6, title: "Google Maps", visualDirection: "Tampilan peta interaktif dengan tombol Buka Maps", copy: "Anti Nyasar dengan Panduan Rute Akurat", onScreenCallout: "Navigasi Langsung" },
				{ slide: 7, title: "Galeri Foto", visualDirection: "Grid foto prewedding estetik dengan efek transisi", copy: "Abadikan Momen Manis Bersama Pasangan", onScreenCallout: "Kualitas HD Jernih" },
				{ slide: 8, title: "Pilihan Musik", visualDirection: "Ikon pemutar musik melayang di sudut layar", copy: "Iringi Setiap Momen dengan Lagu Romantis", onScreenCallout: "Koleksi Lagu Lengkap" },
				{ slide: 9, title: "Garansi", visualDirection: "Tampilan badge garansi dan ulasan bintang 5", copy: "Dipercaya Lebih dari 1.000+ Pasangan Bahagia", onScreenCallout: "Pelayanan Terpercaya" },
				{ slide: 10, title: "Call to Action", visualDirection: "Tampilan kartu harga promo dengan tombol bio", copy: `Mulai dari Rp ${brand.lowestPrice} Saja!`, onScreenCallout: "Coba Demo Gratis di Bio!" },
			],
			hashtags: ["#UndanganDigital", "#UndanganPernikahan", "#SimfoniCinta", "#UndanganWebsite", "#Nikah2026", "#WeddingInspiration", "#CalonPengantin"],
			cta: `Mulai dari Rp ${brand.lowestPrice}! Bayar sekali aktif selamanya. Cek link di bio untuk coba demo dan pesan instan!`,
		},
		tiktok: {
			hook3s: `Undangan semewah ini harganya cuma mulai Rp ${brand.lowestPrice}?! Seriusan?!`,
			caption: `Bikin tamu takjub dari pertama buka undangan! Coba tema ${templateName} di link bio ya ✨ #undanganpernikahan #undanganviral #nikah2026 #fyp`,
			script: [
				{ timestamp: "00:00 - 00:03", visual: "Transisi cepat close up layar smartphone menampilkan UI mewah", voiceover: "Jangan buang jutaan rupiah cuma buat cetak undangan kertas yang akhirnya dibuang!", onScreenText: "Stop Buang Duit Buat Undangan Kertas!" },
				{ timestamp: "00:03 - 00:07", visual: "Swipe layar menampilkan RSVP dan barcode QRIS", voiceover: "Pake undangan digital ini, tamu bisa langsung RSVP dan kirim amplop via QRIS!", onScreenText: "RSVP & Amplop Digital Instan" },
				{ timestamp: "00:07 - 00:11", visual: "Peta lokasi tersambung langsung ke aplikasi Google Maps", voiceover: "Tersambung Google Maps akurat, dijamin gak ada drama tamu nyasar.", onScreenText: "Google Maps Akurat" },
				{ timestamp: "00:11 - 00:15", visual: "Teks harga promo Rp " + brand.lowestPrice + " dan link bio", voiceover: "Harganya mulai Rp " + brand.lowestPrice + " aja, bayar sekali aktif selamanya. Cek bio sekarang!", onScreenText: `Cuma Rp ${brand.lowestPrice} — Cek Bio!` },
			],
			hashtags: ["#undanganpernikahan", "#undanganviral", "#nikah2026", "#weddingtiktok", "#fyp"],
			musicSuggestion: "Lagu pop akustik romantis pernikahan tanpa vokal berat",
		},
		whatsappSuite: {
			formalVip: `Kepada Yth. Bapak/Ibu/Saudara/i,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri momen sakral pernikahan kami. Informasi lengkap mengenai waktu, lokasi, dan konfirmasi kehadiran dapat diakses melalui tautan undangan digital kami berikut:\n\nhttps://simfonicinta.my.id/demo/${params.templateSlug || ""}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`,
			casualFriendly: `Hai teman-teman tercinta! ✨\n\nKabar bahagia untuk kita semua! Kami mengundang kamu untuk hadir dan berbagi keceriaan di hari pernikahan kami. Detail acara, rute lokasi, dan RSVP bisa kamu cek langsung di link undangan ini ya:\n\nhttps://simfonicinta.my.id/demo/${params.templateSlug || ""}\n\nKehadiran dan doa restu kamu sangat berarti untuk kami. Sampai jumpa di hari bahagia nanti! ❤️`,
			promoLimited: `Halo Kak! Mau bikin undangan pernikahan semewah hotel bintang lima tapi budget tetap hemat? 💍\n\nPake tema "${templateName}" dari Simfoni Cinta! Fitur lengkap: RSVP otomatis, amplop QRIS, navigasi Google Maps, dan musik romantis. Biayanya cuma mulai Rp ${brand.lowestPrice} (bayar 1x aktif selamanya)!\n\nCoba live demonya gratis di sini:\nhttps://simfonicinta.my.id/demo/${params.templateSlug || ""}\n\nHubungi kami sekarang untuk amankan kuota promo hari ini!`,
		},
		targetAudience: params.targetAudience || "Calon pengantin muda modern usia 21-35 tahun, Wedding Organizer, dan pasangan hemat budget",
		marketingAngle: params.angle || `Kemewahan desain setara undangan cetak jutaan rupiah dengan harga hemat mulai Rp ${brand.lowestPrice}`,
	};
}

export async function generateUnifiedPromoStudio(
	params: UnifiedStudioPromoInput,
): Promise<UnifiedStudioPromoResult> {
	const settings = await getAdminSettings();
	const brand = extractBrandingContext(settings);

	let template: Template | null = null;
	if (params.templateSlug) {
		template = await getTemplateBySlug(params.templateSlug);
	}

	const templateName = template?.name || (params.templateSlug ? params.templateSlug : "Katalog Umum Simfoni Cinta");
	const category = template?.category || "Pernikahan Digital";
	const theme = template?.theme || "Elegan";
	const audio = template?.audioTitle || "Musik Romantis Nusantara";
	const targetRatio = params.aspectRatio || "9:16";

	let dbAssets: PromoVisualAsset[] = [];
	const targetSlug = template?.slug || params.templateSlug;
	if (targetSlug) {
		try {
			const rawDbAssets = await db
				.select()
				.from(templateAssetItems)
				.where(or(eq(templateAssetItems.templateSlug, targetSlug), eq(templateAssetItems.templateSlug, params.templateSlug || "")));

			dbAssets = rawDbAssets
				.filter(
					(item) =>
						(item.fileType === "image" ||
						/\.(webp|jpg|jpeg|png|svg)$/i.test(item.name || item.localPath)) &&
						!item.name?.toLowerCase().includes("app_store") &&
						!item.name?.toLowerCase().includes("play_store") &&
						!item.name?.toLowerCase().includes("no-image") &&
						!item.name?.toLowerCase().includes("logo-bri") &&
						!item.name?.toLowerCase().includes("logo_bri"),
				)
				.map((item) => ({
					id: item.id,
					name: item.name,
					localPath: item.localPath,
					cdnUrl: item.cdnUrl,
					isSyncedCdn: Boolean(item.isSyncedCdn || (item.cdnUrl && item.cdnUrl.startsWith("http"))),
					fileType: "image",
					fileSize: item.fileSize || 0,
					isThumbnail: Boolean(item.name?.toLowerCase().includes("thumb") || item.localPath?.toLowerCase().includes("thumb")),
				}));
		} catch {}
	}

	const cdnReferences: string[] = [];
	if (params.selectedCdnAssets && params.selectedCdnAssets.length > 0) {
		cdnReferences.push(...params.selectedCdnAssets);
	} else if (dbAssets.length > 0) {
		dbAssets.slice(0, 10).forEach((a) => {
			if (a.cdnUrl && a.cdnUrl.startsWith("http")) {
				cdnReferences.push(a.cdnUrl);
			} else if (a.localPath) {
				const p = a.localPath.startsWith("/") ? a.localPath : `/${a.localPath}`;
				cdnReferences.push(`https://simfonicinta.my.id${p}`);
			}
		});
	}

	if (template?.thumb) {
		const thumbUrl = template.thumb.startsWith("http")
			? template.thumb
			: `https://simfonicinta.my.id${template.thumb.startsWith("/") ? template.thumb : `/${template.thumb}`}`;
		if (!cdnReferences.includes(thumbUrl)) {
			cdnReferences.unshift(thumbUrl);
		}
	}

	const fallbackResult = buildFallbackUnifiedPromo(
		params,
		brand,
		templateName,
		category,
		theme,
		cdnReferences,
		targetRatio,
	);

	const systemPrompt = `Anda adalah Chief Creative Officer, Principal Visual Director, dan Social Media Strategist Eksekutif untuk "Simfoni Cinta" (https://simfonicinta.my.id).
Tugas Anda adalah membedah aset visual CDN resmi dan menghasilkan MEGA-PROMPT PROMOSI SUPER DETAIL (Comprehensive Blueprint) dalam format JSON murni.

ATURAN WAJIB & NON-NEGOTIABLE:
1. STRICTLY NO HUMAN FIGURES: DILARANG KERAS memunculkan manusia, orang, wajah, wanita, pria, pengantin, pasangan, atau tangan pada visual mockup. 100% objek mockup smartphone bersih di atas set studio kemewahan arsitektural.
2. NO WEIRD ARTIFICIAL FLORAL CLUTTER: DILARANG hiasan bunga liar norak buatan AI yang tidak natural. Hanya izinkan dekorasi studio minimalis, marmer, kain sutra ivory/sage, atau kelopak melati halus.
3. 100% MENIRU ASET CDN & WARNA ASLI: Perhatikan daftar aset CDN yang diberikan. Tiru 100% warna dominan, motif ornamen, dan tipografi dari aset referensi.
4. MEGA PROMPT CHATGPT / DALL-E 3: Buat teks prompt ChatGPT sangat panjang, deskriptif, detail, presisi teknis fotografi (kamera Hasselblad H6D-100c, 85mm f/1.4, ISO 100, pencahayaan soft volumetric studio daylight, ray-traced shadows, titanium chassis, layar smartphone OLED ultra-sharp menampilkan UI undangan digital).
5. VIDEO SORA / VEO 3 / RUNWAY: Rancang naskah video dan prompt sinematik lengkap dengan pergerakan kamera terstruktur, timestamp, audio foley, dan tata letak rekaman layar undangan.
6. OUTPUT WAJIB JSON MURNI tanpa backtick markdown code fence (\`\`\`json).`;

	const userPrompt = `ANALISIS & GENERATE MEGA PROMOSI KONTEN LENGKAP:
Template: "${templateName}" (${category})
Tema Visual: "${theme}"
Aspek Rasio: ${targetRatio}
Gaya Bahasa: ${params.tone || "Romantis & Puitis"}
Fokus Promosi: ${params.angle || `Harga Mulai Rp ${brand.lowestPrice}`}
Target Audiens: ${params.targetAudience || "Calon Pengantin & Wedding Organizer"}
Instruksi Tambahan: ${params.customBrief || "Fokus pada kemewahan UI dan konversi sebar WA"}
Daftar Link CDN Gambar Aset Resmi (${cdnReferences.length} item):
${cdnReferences.map((url, idx) => `[Aset #${idx + 1}]: ${url}`).join("\n")}

Hasilkan struktur JSON lengkap dengan semua field berikut tanpa terpotong:
- templateName: string
- templateSlug: string
- category: string
- pricingInfo: string
- lowestPrice: string
- aspectRatio: string
- assetAnalysis: { themeSummary, dominantColors: [{name, hex, usage}], typographyAnalysis, ornamentDetails, detectedCdnAssetsCount, cdnReferences }
- chatgptMegaPrompt: string (mega prompt 3-4 paragraf sangat detail dan deskriptif dalam bahasa Inggris)
- videoCinematics: { concept, cameraMotion, durationSeconds, veo3Prompt, soraPrompt, runwayPrompt, klingPrompt, soundDesign, storyboard: [{shot, timestamp, visual, cameraMovement, lighting, voiceover, onScreenText}] }
- instagram: { headline, caption, slides: [{slide, title, visualDirection, copy, onScreenCallout}], hashtags, cta }
- tiktok: { hook3s, caption, script: [{timestamp, visual, voiceover, onScreenText}], hashtags, musicSuggestion }
- whatsappSuite: { formalVip, casualFriendly, promoLimited }
- targetAudience: string
- marketingAngle: string`;

	try {
		const rawResponse = await requestGemini(userPrompt, systemPrompt);
		const cleaned = rawResponse
			.replace(/```json/gi, "")
			.replace(/```/g, "")
			.trim();
		const parsed = JSON.parse(cleaned) as UnifiedStudioPromoResult;

		if (!parsed.chatgptMegaPrompt || !parsed.instagram?.slides) {
			return fallbackResult;
		}

		parsed.templateName = templateName;
		parsed.templateSlug = params.templateSlug || "";
		parsed.category = category;
		parsed.lowestPrice = brand.lowestPrice;
		parsed.aspectRatio = targetRatio;
		if (!parsed.assetAnalysis) {
			parsed.assetAnalysis = fallbackResult.assetAnalysis;
		}
		parsed.assetAnalysis.cdnReferences = cdnReferences;
		parsed.assetAnalysis.detectedCdnAssetsCount = cdnReferences.length;

		return parsed;
	} catch {
		return fallbackResult;
	}
}

