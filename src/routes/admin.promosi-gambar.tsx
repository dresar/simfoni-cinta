import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
	Sparkles,
	Copy,
	Check,
	ExternalLink,
	Instagram,
	Video,
	MessageSquare,
	Code,
	FileText,
	Palette,
	CheckCircle2,
	Loader2,
	X,
	Layers,
	Clapperboard,
	Eye,
	Volume2,
	Film,
	Compass,
	Maximize2,
	Share2,
} from "lucide-react";
import {
	GlassCard,
	Action,
	SelectInput,
	TextArea,
} from "@/components/kit";
import { fetchTemplates, fetchTemplatePromoAssetsFn } from "@/functions/templates";
import { fetchAdminSettings } from "@/functions/settings";
import { generateUnifiedPromoStudioFn } from "@/functions/gemini";
import { LOCAL_COVERS } from "@/components/landing/sections-a";
import type { UnifiedStudioPromoResult } from "@/server/gemini";
import type { PromoVisualAsset } from "@/server/templates";

type PromosiGambarSearch = {
	template?: string;
};

export const Route = createFileRoute("/admin/promosi-gambar")({
	validateSearch: (search: Record<string, unknown>): PromosiGambarSearch => ({
		template: typeof search.template === "string" ? search.template : undefined,
	}),
	loader: async () => {
		const [templatesRes, settings] = await Promise.all([
			fetchTemplates({ data: { limit: 500 } }),
			fetchAdminSettings(),
		]);
		return {
			templates: templatesRes?.items || [],
			settings,
		};
	},
	head: () => ({
		meta: [
			{ title: "Studio Promosi AI (Gambar & Video) — Simfoni Cinta" },
			{
				name: "description",
				content: "Studio promosi visual dan video sinematik terpadu bertenaga AI dengan analisis aset CDN untuk Simfoni Cinta.",
			},
		],
	}),
	component: PromosiGambarPage,
});

const BRAND_PALETTE = [
	{ name: "Sage Green", hex: "#7ea67e" },
	{ name: "Champagne Gold", hex: "#c9a96e" },
	{ name: "Warm Ivory", hex: "#faf8f5" },
	{ name: "Deep Sage", hex: "#567c56" },
	{ name: "Dark Obsidian", hex: "#090c10" },
];

function isExcludedPromoAsset(val: string): boolean {
	if (!val) return false;
	const lower = val.toLowerCase();
	return (
		lower.includes("app_store") ||
		lower.includes("appstore") ||
		lower.includes("app-store") ||
		lower.includes("btn_app") ||
		lower.includes("play_store") ||
		lower.includes("playstore") ||
		lower.includes("play-store") ||
		lower.includes("btn_play") ||
		lower.includes("google_play") ||
		lower.includes("google-play") ||
		lower.includes("logo-bri") ||
		lower.includes("logo_bri") ||
		lower.includes("logo-bca") ||
		lower.includes("logo_bca") ||
		lower.includes("logo-mandiri") ||
		lower.includes("logo_mandiri") ||
		lower.includes("logo-bni") ||
		lower.includes("logo_bni") ||
		lower.includes("bank-bri") ||
		lower.includes("bank_bri") ||
		lower.includes("no-image") ||
		lower.includes("noimage") ||
		lower.includes("no_image") ||
		lower.includes("placeholder")
	);
}

function getTemplateCover(t?: { slug: string; thumb?: string | null } | null): string {
	if (!t) return "";
	if (t.thumb && t.thumb.trim() !== "") {
		if (t.thumb.startsWith("http://") || t.thumb.startsWith("https://") || t.thumb.startsWith("/")) {
			return t.thumb;
		}
		return `/${t.thumb}`;
	}
	if (LOCAL_COVERS[t.slug]) {
		return LOCAL_COVERS[t.slug];
	}
	return `/demo/${t.slug}/assets/images/${t.slug}.webp`;
}

function getAssetDisplayUrl(asset: { cdnUrl?: string | null; localPath?: string }): string {
	if (asset.cdnUrl && (asset.cdnUrl.startsWith("http://") || asset.cdnUrl.startsWith("https://"))) {
		return asset.cdnUrl;
	}
	if (asset.localPath) {
		if (asset.localPath.startsWith("http://") || asset.localPath.startsWith("https://") || asset.localPath.startsWith("/")) {
			return asset.localPath;
		}
		return `/${asset.localPath}`;
	}
	return "";
}

function getAssetExternalUrl(asset: { cdnUrl?: string | null; localPath?: string }): string {
	const display = getAssetDisplayUrl(asset);
	if (!display) return "";
	if (display.startsWith("http://") || display.startsWith("https://")) {
		return display;
	}
	return `https://simfonicinta.my.id${display}`;
}

function getPhotoLabel(name: string, isThumbnail?: boolean): string {
	if (isThumbnail) return "Cover Utama";
	const lower = name.toLowerCase();
	if (lower.includes("thumb")) return "Thumbnail";
	if (lower.includes("gallery")) {
		const match = lower.match(/gallery-([a-z0-9]+)/i);
		return match ? `Galeri (${match[1].slice(0, 4)})` : "Foto Galeri";
	}
	if (lower.includes("venue")) return "Lokasi Venue";
	if (lower.startsWith("bg-") || lower === "bg.webp" || lower.startsWith("bg.")) return "Background";
	if (lower.startsWith("bl")) return "Ornamen BL";
	if (lower.startsWith("br")) return "Ornamen BR";
	if (lower.startsWith("tl")) return "Ornamen TL";
	if (lower.startsWith("tr")) return "Ornamen TR";
	if (lower.startsWith("tm")) return "Ornamen TM";
	if (lower.startsWith("bm")) return "Ornamen BM";
	if (lower.startsWith("left")) return "Ornamen Kiri";
	if (lower.startsWith("right")) return "Ornamen Kanan";
	return name.replace(/\.[^.]+$/, "").slice(0, 16);
}

function getResolutionLabel(ratio: string): string {
	switch (ratio) {
		case "9:16":
			return "1080 x 1920 (Vertikal Story / Reels / TikTok)";
		case "1:1":
			return "1080 x 1080 (Persegi Instagram Feed)";
		case "4:5":
			return "1080 x 1350 (Potret Instagram Feed Optimal)";
		case "16:9":
			return "1920 x 1080 (Landscape Web / YouTube)";
		case "4:3":
			return "1600 x 1200 (Display Standar / Tablet)";
		default:
			return "1080 x 1920";
	}
}

function PromosiGambarPage() {
	const { templates, settings } = Route.useLoaderData();
	const search = Route.useSearch();

	const [selectedSlug, setSelectedSlug] = useState(() => {
		const q = search?.template;
		if (!q) return "";
		const match = templates.find((t) => t.slug === q || t.id === q);
		return match ? match.slug : q;
	});

	const [aspectRatio, setAspectRatio] = useState("9:16");
	const [contentType, setContentType] = useState<"all" | "visual" | "video">("all");
	const [cameraMotion, setCameraMotion] = useState("Slow 360-degree orbit and macro rack focus");
	const [platform, setPlatform] = useState("all");
	const [tone, setTone] = useState("Romantis & Puitis");
	const [angle, setAngle] = useState("Harga Hemat & Kemewahan Desain");
	const [targetAudience, setTargetAudience] = useState("Calon Pengantin & Wedding Organizer");
	const [cta, setCta] = useState("Coba Live Demo & Pesan Instan");
	const [customBrief, setCustomBrief] = useState("");

	const [templateAssets, setTemplateAssets] = useState<PromoVisualAsset[]>([]);
	const [selectedCdnAssets, setSelectedCdnAssets] = useState<string[]>([]);

	const [modalOpen, setModalOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generateProgress, setGenerateProgress] = useState(0);
	const [generateStatusText, setGenerateStatusText] = useState("");
	const [activeResultTab, setActiveResultTab] = useState<
		"json" | "chatgpt" | "video" | "instagram" | "tiktok" | "wa" | "cdn"
	>("chatgpt");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const [previewCoverOpen, setPreviewCoverOpen] = useState(false);

	const [internalResult, setInternalResult] = useState<UnifiedStudioPromoResult | null>(null);

	const lowestPrice = useMemo(() => {
		if (settings?.packages && settings.packages.length > 0) {
			return Math.min(...settings.packages.map((p) => p.price)).toLocaleString("id-ID");
		}
		return "15.000";
	}, [settings]);

	const selectedTemplate = useMemo(() => {
		return templates.find((t) => t.slug === selectedSlug || t.id === selectedSlug);
	}, [templates, selectedSlug]);

	const sortedTemplates = useMemo(() => {
		return [...templates].sort((a, b) => a.name.localeCompare(b.name, "id"));
	}, [templates]);

	useEffect(() => {
		if (search?.template) {
			const match = templates.find((t) => t.slug === search.template || t.id === search.template);
			if (match && selectedSlug !== match.slug) {
				setSelectedSlug(match.slug);
			}
		}
	}, [search?.template, templates]);

	useEffect(() => {
		const targetSlug = selectedTemplate?.slug || selectedSlug;
		if (!targetSlug) {
			setTemplateAssets([]);
			setSelectedCdnAssets([]);
			return;
		}

		fetchTemplatePromoAssetsFn({ data: targetSlug })
			.then((res) => {
				if (res?.assets) {
					setTemplateAssets(res.assets);
					const validPhotos = res.assets.filter(
						(a) =>
							Boolean(a.cdnUrl || a.localPath) &&
							/\.(webp|jpg|jpeg|png|svg)$/i.test(a.name || a.cdnUrl || a.localPath || "") &&
							!isExcludedPromoAsset(a.name) &&
							!isExcludedPromoAsset(a.localPath),
					);

					const thumb = validPhotos.find(
						(a) =>
							a.isThumbnail ||
							a.name?.toLowerCase().includes("thumb") ||
							a.localPath?.toLowerCase().includes("thumb"),
					);
					const thumbUrl = thumb ? getAssetExternalUrl(thumb) : "";

					const others = validPhotos
						.filter((a) => (thumb ? a !== thumb : true))
						.slice(0, 7)
						.map((a) => getAssetExternalUrl(a));

					setSelectedCdnAssets(
						thumbUrl ? [thumbUrl, ...others] : validPhotos.slice(0, 8).map((a) => getAssetExternalUrl(a)),
					);
				}
			})
			.catch(() => {});
	}, [selectedSlug, selectedTemplate]);

	const availableCdnImages = useMemo(() => {
		const raw: PromoVisualAsset[] = [...templateAssets];
		if (selectedTemplate) {
			const cover = getTemplateCover(selectedTemplate);
			const extCover = getAssetExternalUrl({ cdnUrl: selectedTemplate.thumb, localPath: cover });
			if (!raw.some((a) => (a.cdnUrl && a.cdnUrl === extCover) || a.localPath === cover)) {
				raw.unshift({
					id: `thumb-${selectedTemplate.slug}`,
					name: `${selectedTemplate.slug}-thumbnail.webp`,
					localPath: cover,
					cdnUrl: extCover,
					isSyncedCdn: Boolean(extCover.includes("cdn.jsdelivr.net") || extCover.startsWith("http")),
					fileType: "image",
					fileSize: 0,
					isThumbnail: true,
				});
			}
		}

		const filtered = raw.filter(
			(a) =>
				Boolean(
					(a.cdnUrl || a.localPath) &&
						/\.(webp|jpg|jpeg|png|svg)$/i.test(a.name || a.cdnUrl || a.localPath || ""),
				) &&
				!isExcludedPromoAsset(a.name) &&
				!isExcludedPromoAsset(a.localPath),
		);

		return filtered.sort((a, b) => {
			const aIsThumb = Boolean(
				a.isThumbnail ||
					a.name?.toLowerCase().includes("thumb") ||
					a.localPath?.toLowerCase().includes("thumb"),
			);
			const bIsThumb = Boolean(
				b.isThumbnail ||
					b.name?.toLowerCase().includes("thumb") ||
					b.localPath?.toLowerCase().includes("thumb"),
			);
			if (aIsThumb && !bIsThumb) return -1;
			if (!aIsThumb && bIsThumb) return 1;
			return 0;
		});
	}, [templateAssets, selectedTemplate]);

	const primaryThumbnailUrl = useMemo(() => {
		if (selectedTemplate) {
			return getAssetExternalUrl({
				cdnUrl: selectedTemplate.thumb,
				localPath: getTemplateCover(selectedTemplate),
			});
		}
		const thumbAsset = availableCdnImages.find((a) => a.isThumbnail);
		if (thumbAsset) return getAssetExternalUrl(thumbAsset);
		return availableCdnImages[0] ? getAssetExternalUrl(availableCdnImages[0]) : null;
	}, [selectedTemplate, availableCdnImages]);

	function handleCopy(text: string, key: string) {
		navigator.clipboard.writeText(text);
		setCopiedKey(key);
		toast.success("Tersalin ke clipboard");
		setTimeout(() => setCopiedKey(null), 2000);
	}

	function toggleAsset(url: string) {
		setSelectedCdnAssets((prev) =>
			prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
		);
	}

	const jsonString = useMemo(() => {
		if (!internalResult) return "";
		return JSON.stringify(internalResult, null, 2);
	}, [internalResult]);

	async function executeGenerate() {
		setModalOpen(true);
		setIsGenerating(true);
		setGenerateProgress(10);
		setGenerateStatusText("Membedah aset visual CDN & struktur template...");

		const primaryThumb = primaryThumbnailUrl || selectedCdnAssets[0] || "";
		const cdnListToSend = selectedCdnAssets.length > 0
			? selectedCdnAssets
			: primaryThumb
			? [primaryThumb, ...availableCdnImages.slice(0, 3).map((a) => a.cdnUrl!)]
			: [];

		const orderedCdn = primaryThumb && cdnListToSend.includes(primaryThumb)
			? [primaryThumb, ...cdnListToSend.filter((u) => u !== primaryThumb)]
			: cdnListToSend;

		const progressTimers: any[] = [];
		progressTimers.push(
			setTimeout(() => {
				setGenerateProgress(25);
				setGenerateStatusText("Mengekstrak palet warna, tipografi & motif ornamen...");
			}, 900),
		);
		progressTimers.push(
			setTimeout(() => {
				setGenerateProgress(50);
				setGenerateStatusText("Mengirim analisis ke Gemini 3.6 Flash Studio Engine...");
			}, 2200),
		);
		progressTimers.push(
			setTimeout(() => {
				setGenerateProgress(75);
				setGenerateStatusText("Menyusun Mega-Prompting ChatGPT & Storyboard Video Sinematik...");
			}, 4000),
		);
		progressTimers.push(
			setTimeout(() => {
				setGenerateProgress(90);
				setGenerateStatusText("Memvalidasi blueprint promosi & format JSON...");
			}, 5500),
		);

		try {
			const res = await generateUnifiedPromoStudioFn({
				data: {
					templateSlug: selectedSlug || undefined,
					aspectRatio,
					platform,
					tone,
					angle,
					targetAudience,
					cta,
					customBrief,
					contentType,
					cameraMotion,
					selectedCdnAssets: orderedCdn,
				},
			});

			progressTimers.forEach(clearTimeout);
			setGenerateProgress(100);
			setGenerateStatusText("Analisis selesai! Mega-Prompting siap digunakan.");
			setInternalResult(res);
			setIsGenerating(false);
			toast.success("Studio Promosi AI Berhasil Dihasilkan");
		} catch (err) {
			progressTimers.forEach(clearTimeout);
			setIsGenerating(false);
			setGenerateProgress(0);
			toast.error("Gagal menjalankan Studio Promosi AI");
		}
	}

	return (
		<div className="space-y-4 max-w-5xl mx-auto pb-20">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/8">
				<div>
					<div className="flex items-center gap-2">
						<Clapperboard className="size-5 text-[#c9a96e]" />
						<h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
							Studio Promosi AI (Gambar & Video)
						</h1>
					</div>
					<p className="text-xs text-white/50 mt-0.5">
						Mega-Prompting ChatGPT DALL-E 3, Veo 3 / Sora / Runway sinematik, 10-Slide Instagram, & naskah TikTok.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[11px] font-bold text-[#e8c98a] px-3 py-1.5 rounded-[6px] bg-[#c9a96e]/15 border border-[#c9a96e]/30">
						Mulai Rp {lowestPrice}
					</span>
				</div>
			</div>

			<GlassCard className="p-3.5 sm:p-4 space-y-3.5 border-white/8 bg-white/5 backdrop-blur-md rounded-[8px]">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Layers className="size-4 text-[#c9a96e]" />
						<h2 className="text-xs font-bold text-white uppercase tracking-wider">
							Pilih Template Desain
						</h2>
						<span className="text-[10px] text-white/40">
							({templates.length} Desain Tersedia)
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Palette className="size-3.5 text-[#c9a96e]" />
						<div className="flex items-center gap-1">
							{BRAND_PALETTE.map((c) => (
								<button
									key={c.hex}
									type="button"
									onClick={() => handleCopy(c.hex, c.hex)}
									className="size-3.5 rounded-full border border-white/20 transition-transform hover:scale-110 cursor-pointer"
									style={{ backgroundColor: c.hex }}
									title={`${c.name} (${c.hex})`}
								/>
							))}
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
					<div className="flex-1">
						<SelectInput
							value={selectedSlug}
							onChange={(e) => setSelectedSlug(e.target.value)}
							className="h-10 text-xs bg-white/5 border-white/10 text-white rounded-[6px] focus:border-[#c9a96e]"
						>
							<option value="" className="bg-[#12161f]">
								Semua Template (Katalog Umum Simfoni Cinta)
							</option>
							{sortedTemplates.map((t) => (
								<option key={t.slug} value={t.slug} className="bg-[#12161f]">
									{t.name} — [{t.category || "Pernikahan"}]
								</option>
							))}
						</SelectInput>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						{selectedTemplate ? (
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setPreviewCoverOpen(true)}
									className="group relative size-10 sm:size-11 rounded-[6px] overflow-hidden border border-[#c9a96e]/50 hover:border-[#c9a96e] transition-all cursor-pointer shrink-0 bg-black/60 shadow-sm"
									title="Klik untuk melihat thumbnail ukuran penuh"
								>
									<img
										src={getTemplateCover(selectedTemplate)}
										alt={selectedTemplate.name}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
										onError={(e) => {
											const target = e.currentTarget;
											const current = target.src;
											if (current.endsWith(".webp")) {
												target.src = current.replace(/\.webp$/, ".jpg");
											} else if (current.endsWith(".jpg")) {
												target.src = current.replace(/\.jpg$/, ".png");
											}
										}}
									/>
									<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
										<Eye className="size-3.5 text-white" />
									</div>
								</button>
								<div className="text-left hidden sm:block">
									<p className="text-xs font-bold text-[#e8c98a] truncate max-w-[180px]">
										{selectedTemplate.name}
									</p>
									<p className="text-[10px] text-white/50">
										{selectedTemplate.category || "Pernikahan"}
									</p>
								</div>
							</div>
						) : (
							<div className="size-10 sm:size-11 rounded-[6px] bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shrink-0">
								<Layers className="size-5" />
							</div>
						)}

						{selectedTemplate && (
							<div className="flex items-center gap-1.5">
								<Link
									to={`/demo/${selectedTemplate.slug}`}
									target="_blank"
									className="h-10 px-2.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1 shrink-0"
								>
									<span>Demo</span>
									<ExternalLink className="size-3" />
								</Link>
								<Link
									to="/admin/promosi-template/$id/aset"
									params={{ id: selectedTemplate.slug }}
									className="h-10 px-2.5 rounded-[6px] bg-[#c9a96e]/15 hover:bg-[#c9a96e]/25 text-[#e8c98a] text-xs font-semibold border border-[#c9a96e]/30 transition-all flex items-center gap-1 shrink-0"
								>
									<span>Aset CDN</span>
									<ExternalLink className="size-3" />
								</Link>
							</div>
						)}
					</div>
				</div>

				{selectedTemplate && availableCdnImages.length > 0 && (
					<div className="pt-2 border-t border-white/5 space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<label className="text-[11px] font-semibold text-white/80">
									Aset Visual CDN Terdeteksi ({selectedCdnAssets.length}/{availableCdnImages.length} Dipilih)
								</label>
								<span className="text-[10px] text-amber-400 font-medium">
									(Analisis Visual Gemini)
								</span>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() =>
										setSelectedCdnAssets(availableCdnImages.map((a) => getAssetExternalUrl(a)))
									}
									className="text-[10px] text-[#e8c98a] hover:underline cursor-pointer"
								>
									Pilih Semua
								</button>
								{selectedCdnAssets.length > 0 && (
									<button
										type="button"
										onClick={() => setSelectedCdnAssets([])}
										className="text-[10px] text-white/40 hover:text-white cursor-pointer"
									>
										Reset
									</button>
								)}
							</div>
						</div>

						<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto pr-1">
							{availableCdnImages.map((img, idx) => {
								const extUrl = getAssetExternalUrl(img);
								const displayUrl = getAssetDisplayUrl(img);
								const isChecked = selectedCdnAssets.includes(extUrl);
								const isThumb =
									img.isThumbnail ||
									extUrl === primaryThumbnailUrl ||
									img.name?.toLowerCase().includes("thumb") ||
									img.localPath?.toLowerCase().includes("thumb") ||
									idx === 0;
								const isCdn = Boolean(
									img.isSyncedCdn ||
									(img.cdnUrl && img.cdnUrl.startsWith("http")) ||
									(extUrl && extUrl.startsWith("http"))
								);
								const label = getPhotoLabel(img.name, isThumb);

								return (
									<button
										key={img.id || img.localPath}
										type="button"
										onClick={() => toggleAsset(extUrl)}
										className={`group relative aspect-square rounded-[6px] overflow-hidden border transition-all cursor-pointer select-none ${
											isChecked
												? "border-[#c9a96e] ring-1 ring-[#c9a96e]/50 bg-black/40 shadow-sm"
												: "border-white/10 opacity-70 hover:opacity-100 hover:border-white/20"
										}`}
									>
										<img
											src={displayUrl}
											alt={img.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											onError={(e) => {
												const target = e.currentTarget;
												const current = target.src;
												if (current.endsWith(".webp")) {
													target.src = current.replace(/\.webp$/, ".jpg");
												} else if (current.endsWith(".jpg")) {
													target.src = current.replace(/\.jpg$/, ".png");
												}
											}}
										/>
										<div className="absolute inset-x-0 bottom-0 bg-black/85 px-1 py-0.5">
											<p className="text-[8px] font-medium text-white truncate text-center">
												{label}
											</p>
										</div>
										<div className="absolute top-0.5 left-0.5 flex items-center gap-0.5">
											{isThumb && (
												<div className="px-1 py-0.2 rounded-[2px] bg-amber-500 text-black text-[7px] font-black uppercase shadow-xs">
													Utama
												</div>
											)}
											{isCdn && (
												<div className="px-1 py-0.2 rounded-[2px] bg-emerald-500/80 text-white text-[7px] font-bold uppercase shadow-xs">
													CDN
												</div>
											)}
										</div>
										{isChecked && (
											<div className="absolute top-0.5 right-0.5 size-3.5 rounded-full bg-[#c9a96e] text-black flex items-center justify-center text-[8px] font-black shadow-xs">
												✓
											</div>
										)}
									</button>
								);
							})}
						</div>
					</div>
				)}
			</GlassCard>

			<GlassCard className="p-3.5 sm:p-4 space-y-3.5 border-white/8 bg-white/5 backdrop-blur-md rounded-[8px]">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Sparkles className="size-4 text-[#c9a96e]" />
						<h2 className="text-xs font-bold text-white uppercase tracking-wider">
							Parameter Studio Promosi AI
						</h2>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
					<div>
						<label className="block text-[11px] font-semibold text-white/70 mb-1">
							Tipe Konten
						</label>
						<SelectInput
							options={[
								{ label: "Semua Konten (Visual Mockup + Video Sinematik)", value: "all" },
								{ label: "Visual Mockup (DALL-E 3 / ChatGPT Mega-Prompt)", value: "visual" },
								{ label: "Video Sinematik (Veo 3 / Sora / Runway)", value: "video" },
							]}
							value={contentType}
							onChange={(e: any) => setContentType(e?.target?.value ?? e)}
						/>
					</div>

					<div>
						<label className="block text-[11px] font-semibold text-white/70 mb-1">
							Rasio Visual
						</label>
						<SelectInput
							options={[
								{ label: "9:16 (Vertikal Story / Reels / TikTok)", value: "9:16" },
								{ label: "1:1 (Persegi Instagram Feed)", value: "1:1" },
								{ label: "4:5 (Potret Instagram Feed Optimal)", value: "4:5" },
								{ label: "16:9 (Landscape Web / YouTube)", value: "16:9" },
								{ label: "4:3 (Display Standar / Tablet)", value: "4:3" },
							]}
							value={aspectRatio}
							onChange={(e: any) => setAspectRatio(e?.target?.value ?? e)}
						/>
					</div>

					<div>
						<label className="block text-[11px] font-semibold text-white/70 mb-1">
							Pergerakan Kamera Video
						</label>
						<SelectInput
							options={[
								{ label: "Slow 360 Orbit + Macro Rack Focus", value: "Slow 360-degree orbit and macro rack focus" },
								{ label: "Downward Crane ke Layar Interaktif", value: "Downward crane descending smoothly to smartphone screen" },
								{ label: "Dolly Zoom In + Depth of Field Silky", value: "Dolly zoom in with shallow depth of field and warm bokeh" },
								{ label: "Handheld Cinematic Macro Glide", value: "Subtle handheld cinematic glide across phone edge and wedding rings" },
							]}
							value={cameraMotion}
							onChange={(e: any) => setCameraMotion(e?.target?.value ?? e)}
						/>
					</div>

					<div>
						<label className="block text-[11px] font-semibold text-white/70 mb-1">
							Gaya Bahasa (Tone)
						</label>
						<SelectInput
							options={[
								{ label: "Romantis & Puitis", value: "Romantis & Puitis" },
								{ label: "Elegan & Mewah", value: "Elegan & Mewah" },
								{ label: "Modern & Minimalis", value: "Modern & Minimalis" },
								{ label: "Islami & Syar'i", value: "Islami & Syar'i" },
								{ label: "Tradisional & Adat Nusantara", value: "Tradisional & Adat Nusantara" },
								{ label: "Ceria & Santai", value: "Ceria & Santai" },
								{ label: "Hard Selling & Promo Terbatas", value: "Hard Selling & Promo Terbatas" },
							]}
							value={tone}
							onChange={(e: any) => setTone(e?.target?.value ?? e)}
						/>
					</div>

					<div>
						<label className="block text-[11px] font-semibold text-white/70 mb-1">
							Fokus Promosi (Angle)
						</label>
						<SelectInput
							options={[
								{ label: `Harga Hemat (Mulai Rp ${lowestPrice})`, value: `Harga Hemat Mulai Rp ${lowestPrice}` },
								{ label: "Fitur RSVP & Amplop QRIS Instan", value: "Fitur RSVP & Amplop QRIS Instan" },
								{ label: "Kemewahan Desain Tanpa Batas Kuota", value: "Kemewahan Desain Tanpa Batas Kuota" },
								{ label: "Sebar Cepat ke Ribuan Tamu via WA", value: "Sebar Cepat ke Ribuan Tamu via WA" },
								{ label: "Proses Jadi Cepat & Aktif Selamanya", value: "Proses Jadi Cepat & Aktif Selamanya" },
							]}
							value={angle}
							onChange={(e: any) => setAngle(e?.target?.value ?? e)}
						/>
					</div>

					<div>
						<label className="block text-[11px] font-semibold text-white/70 mb-1">
							Target Audiens
						</label>
						<SelectInput
							options={[
								{ label: "Calon Pengantin & Wedding Organizer", value: "Calon Pengantin & Wedding Organizer" },
								{ label: "Gen Z & Pasangan Muda Kreatif", value: "Gen Z & Pasangan Muda Kreatif" },
								{ label: "Pasangan Hemat Budget", value: "Pasangan Hemat Budget" },
								{ label: "Keluarga Adat Nusantara", value: "Keluarga Adat Nusantara" },
							]}
							value={targetAudience}
							onChange={(e: any) => setTargetAudience(e?.target?.value ?? e)}
						/>
					</div>
				</div>

				<div>
					<label className="block text-[11px] font-semibold text-white/70 mb-1">
						Instruksi Tambahan (Brief Kustom)
					</label>
					<TextArea
						placeholder="Misal: Tonjolkan warna emas champagne dan kemudahan kirim amplop digital QRIS untuk pernikahan adat..."
						value={customBrief}
						onChange={(e) => setCustomBrief(e.target.value)}
						rows={2}
						className="text-xs bg-white/5 border-white/10 text-white rounded-[6px]"
					/>
				</div>

				<Action
					type="button"
					variant="primary"
					onClick={executeGenerate}
					icon={<Sparkles className="size-4" />}
					className="w-full justify-center py-2.5 rounded-[6px] font-bold text-xs bg-[#c9a96e] hover:bg-[#d8b87d] text-black shadow-md cursor-pointer active:scale-[0.99] transition-all"
				>
					Mulai Analisis CDN & Generate Mega-Prompt
				</Action>
			</GlassCard>

			{internalResult && (
				<GlassCard className="p-4 space-y-3.5 border-[#c9a96e]/30 bg-black/40 rounded-[8px]">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/8">
						<div className="flex items-center gap-2">
							<Sparkles className="size-4 text-[#c9a96e]" />
							<div>
								<h3 className="text-sm font-bold text-white tracking-tight">
									Hasil Blueprint Studio Promosi AI
								</h3>
								<p className="text-[11px] text-white/50">
									{internalResult.templateName} — Rasio {internalResult.aspectRatio} ({getResolutionLabel(internalResult.aspectRatio)})
								</p>
							</div>
						</div>

						<div className="flex items-center gap-1.5 flex-wrap">
							<button
								type="button"
								onClick={() => handleCopy(jsonString, "json_main")}
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#c9a96e] hover:bg-[#d8b87d] text-black text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm"
							>
								{copiedKey === "json_main" ? (
									<Check className="size-3.5" />
								) : (
									<Copy className="size-3.5" />
								)}
								<span>{copiedKey === "json_main" ? "Tersalin!" : "Salin JSON"}</span>
							</button>

							<a
								href="https://chatgpt.com"
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
							>
								<span>Buka ChatGPT</span>
								<ExternalLink className="size-3" />
							</a>

							<button
								type="button"
								onClick={() => setModalOpen(true)}
								className="px-2.5 py-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer active:scale-[0.98]"
							>
								Modal Cepat
							</button>
						</div>
					</div>

					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
						<button
							type="button"
							onClick={() => setActiveResultTab("chatgpt")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "chatgpt"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<FileText className="size-3" />
							<span>Mega-Prompt ChatGPT</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveResultTab("video")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "video"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<Film className="size-3" />
							<span>Video Sinematik (Veo/Sora/Runway)</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveResultTab("instagram")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "instagram"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<Instagram className="size-3" />
							<span>Instagram (10-Slide)</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveResultTab("tiktok")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "tiktok"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<Video className="size-3" />
							<span>TikTok / Reels</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveResultTab("wa")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "wa"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<MessageSquare className="size-3" />
							<span>WhatsApp Suite</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveResultTab("cdn")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "cdn"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<Compass className="size-3" />
							<span>Analisis CDN ({internalResult.assetAnalysis.detectedCdnAssetsCount})</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveResultTab("json")}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${
								activeResultTab === "json"
									? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40"
									: "text-white/60 hover:text-white bg-white/5"
							}`}
						>
							<Code className="size-3" />
							<span>JSON Blueprint</span>
						</button>
					</div>

					{activeResultTab === "chatgpt" && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold text-[#e8c98a]">
									Mega-Prompt DALL-E 3 / ChatGPT (Ultra-Photorealistic Mockup)
								</p>
								<button
									type="button"
									onClick={() => handleCopy(internalResult.chatgptMegaPrompt, "cg_p")}
									className="text-xs text-[#e8c98a] hover:underline flex items-center gap-1 cursor-pointer"
								>
									{copiedKey === "cg_p" ? <Check className="size-3" /> : <Copy className="size-3" />}
									<span>{copiedKey === "cg_p" ? "Tersalin!" : "Salin Mega Prompt"}</span>
								</button>
							</div>
							<pre className="p-3.5 rounded-[8px] bg-black/60 border border-white/10 text-white/90 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto select-all">
								{internalResult.chatgptMegaPrompt}
							</pre>
							<div className="p-3 rounded-[6px] bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
								<p className="font-bold">Tips Eksekusi di ChatGPT:</p>
								<p className="text-white/70">
									Salin teks di atas dan paste langsung ke ChatGPT Plus / DALL-E 3. Prompt telah diatur dengan parameter anti-orang (no humans), anti-bunga norak buatan AI, dan berfokus 100% pada kemewahan mockup smartphone dengan warna asli CDN template.
								</p>
							</div>
						</div>
					)}

					{activeResultTab === "video" && (
						<div className="space-y-3.5">
							<div className="flex items-center justify-between">
								<p className="text-xs font-bold text-white">
									Konsep Video: <span className="text-[#e8c98a]">{internalResult.videoCinematics.concept}</span>
								</p>
								<span className="text-[10px] text-white/50 px-2 py-0.5 rounded bg-white/5 border border-white/10">
									Durasi {internalResult.videoCinematics.durationSeconds} Detik
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
								<div className="p-3 rounded-[6px] bg-black/50 border border-white/10 space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold text-emerald-400">Google Veo 3</span>
										<button
											type="button"
											onClick={() => handleCopy(internalResult.videoCinematics.veo3Prompt, "veo3")}
											className="text-[10px] text-[#e8c98a] hover:underline cursor-pointer"
										>
											{copiedKey === "veo3" ? "Tersalin!" : "Salin"}
										</button>
									</div>
									<p className="text-[11px] text-white/80 font-mono leading-relaxed line-clamp-4">
										{internalResult.videoCinematics.veo3Prompt}
									</p>
								</div>

								<div className="p-3 rounded-[6px] bg-black/50 border border-white/10 space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold text-cyan-400">OpenAI Sora</span>
										<button
											type="button"
											onClick={() => handleCopy(internalResult.videoCinematics.soraPrompt, "sora")}
											className="text-[10px] text-[#e8c98a] hover:underline cursor-pointer"
										>
											{copiedKey === "sora" ? "Tersalin!" : "Salin"}
										</button>
									</div>
									<p className="text-[11px] text-white/80 font-mono leading-relaxed line-clamp-4">
										{internalResult.videoCinematics.soraPrompt}
									</p>
								</div>

								<div className="p-3 rounded-[6px] bg-black/50 border border-white/10 space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold text-violet-400">Runway Gen-3</span>
										<button
											type="button"
											onClick={() => handleCopy(internalResult.videoCinematics.runwayPrompt, "runway")}
											className="text-[10px] text-[#e8c98a] hover:underline cursor-pointer"
										>
											{copiedKey === "runway" ? "Tersalin!" : "Salin"}
										</button>
									</div>
									<p className="text-[11px] text-white/80 font-mono leading-relaxed line-clamp-4">
										{internalResult.videoCinematics.runwayPrompt}
									</p>
								</div>

								<div className="p-3 rounded-[6px] bg-black/50 border border-white/10 space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold text-amber-400">Kling AI</span>
										<button
											type="button"
											onClick={() => handleCopy(internalResult.videoCinematics.klingPrompt, "kling")}
											className="text-[10px] text-[#e8c98a] hover:underline cursor-pointer"
										>
											{copiedKey === "kling" ? "Tersalin!" : "Salin"}
										</button>
									</div>
									<p className="text-[11px] text-white/80 font-mono leading-relaxed line-clamp-4">
										{internalResult.videoCinematics.klingPrompt}
									</p>
								</div>
							</div>

							<div className="p-3 rounded-[6px] bg-white/5 border border-white/10 space-y-1">
								<div className="flex items-center gap-1.5 text-xs font-semibold text-[#e8c98a]">
									<Volume2 className="size-3.5" />
									<span>Desain Suara & Foley Audio:</span>
								</div>
								<p className="text-xs text-white/80">
									{internalResult.videoCinematics.soundDesign}
								</p>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-bold text-white uppercase tracking-wider">
									Storyboard Sinematik ({internalResult.videoCinematics.storyboard.length} Shot)
								</p>
								<div className="space-y-2">
									{internalResult.videoCinematics.storyboard.map((st) => (
										<div
											key={st.shot}
											className="p-3 rounded-[6px] bg-black/50 border border-white/8 space-y-1 text-xs"
										>
											<div className="flex items-center justify-between text-[#e8c98a] font-mono text-[11px]">
												<span className="font-bold">Shot #{st.shot} ({st.timestamp})</span>
												<span>{st.cameraMovement}</span>
											</div>
											<p className="text-white font-medium">{st.visual}</p>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-white/60 pt-1 border-t border-white/5">
												<p><span className="text-white/40">Voiceover:</span> "{st.voiceover}"</p>
												<p><span className="text-white/40">Teks Layar:</span> {st.onScreenText}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{activeResultTab === "instagram" && (
						<div className="space-y-3.5">
							<div className="flex items-center justify-between">
								<h4 className="text-xs font-bold text-[#e8c98a]">
									{internalResult.instagram.headline}
								</h4>
								<button
									type="button"
									onClick={() => handleCopy(internalResult.instagram.caption, "ig_c")}
									className="text-xs text-[#e8c98a] hover:underline flex items-center gap-1 cursor-pointer"
								>
									{copiedKey === "ig_c" ? <Check className="size-3" /> : <Copy className="size-3" />}
									<span>{copiedKey === "ig_c" ? "Tersalin!" : "Salin Caption"}</span>
								</button>
							</div>

							<pre className="p-3.5 rounded-[8px] bg-black/60 border border-white/10 text-white/90 font-sans text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
								{internalResult.instagram.caption}
							</pre>

							<div className="space-y-2">
								<p className="text-xs font-bold text-white uppercase tracking-wider">
									Struktur 10 Slide Carousel
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{internalResult.instagram.slides.map((sl) => (
										<div
											key={sl.slide}
											className="p-2.5 rounded-[6px] bg-black/50 border border-white/8 space-y-1 text-xs"
										>
											<div className="flex items-center justify-between text-[#c9a96e] font-bold text-[11px]">
												<span>Slide #{sl.slide}: {sl.title}</span>
												<span className="text-[10px] text-white/40">{sl.onScreenCallout}</span>
											</div>
											<p className="text-white font-medium">{sl.copy}</p>
											<p className="text-[10px] text-white/50">{sl.visualDirection}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{activeResultTab === "tiktok" && (
						<div className="space-y-3.5">
							<div className="p-3 rounded-[6px] bg-[#c9a96e]/15 border border-[#c9a96e]/30 space-y-1">
								<span className="text-[10px] font-bold text-[#e8c98a] uppercase tracking-wider">
									Hook 3 Detik Pertama (Pencegah Tamu Scroll):
								</span>
								<p className="text-sm font-bold text-white">
									"{internalResult.tiktok.hook3s}"
								</p>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-bold text-white uppercase tracking-wider">
									Naskah Script Video TikTok / Reels
								</p>
								<div className="space-y-2">
									{internalResult.tiktok.script.map((sc, idx) => (
										<div
											key={idx}
											className="p-3 rounded-[6px] bg-black/50 border border-white/8 space-y-1 text-xs"
										>
											<span className="text-emerald-400 font-mono text-[10px] font-bold">
												{sc.timestamp}
											</span>
											<p className="text-white font-semibold">"{sc.voiceover}"</p>
											<p className="text-white/50 text-[11px]">Visual: {sc.visual}</p>
											<p className="text-[#e8c98a] text-[11px]">Teks: {sc.onScreenText}</p>
										</div>
									))}
								</div>
							</div>

							<div className="flex items-center justify-between text-xs text-white/60 p-2.5 rounded-[6px] bg-white/5">
								<span>Musik Saran: <strong className="text-white">{internalResult.tiktok.musicSuggestion}</strong></span>
								<button
									type="button"
									onClick={() => handleCopy(internalResult.tiktok.caption, "tt_c")}
									className="text-[#e8c98a] hover:underline flex items-center gap-1 cursor-pointer"
								>
									{copiedKey === "tt_c" ? "Tersalin!" : "Salin Caption TikTok"}
								</button>
							</div>
						</div>
					)}

					{activeResultTab === "wa" && (
						<div className="space-y-3">
							<div className="p-3 rounded-[6px] bg-black/60 border border-white/10 space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-[#e8c98a]">1. Format Formal VIP (Untuk Tokoh / Keluarga Besar)</span>
									<button
										type="button"
										onClick={() => handleCopy(internalResult.whatsappSuite.formalVip, "wa_f")}
										className="text-xs text-[#e8c98a] hover:underline cursor-pointer"
									>
										{copiedKey === "wa_f" ? "Tersalin!" : "Salin Teks"}
									</button>
								</div>
								<pre className="text-xs text-white/85 font-sans leading-relaxed whitespace-pre-wrap">
									{internalResult.whatsappSuite.formalVip}
								</pre>
							</div>

							<div className="p-3 rounded-[6px] bg-black/60 border border-white/10 space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-emerald-400">2. Format Ramah & Santai (Untuk Sahabat / Teman Kerja)</span>
									<button
										type="button"
										onClick={() => handleCopy(internalResult.whatsappSuite.casualFriendly, "wa_c")}
										className="text-xs text-[#e8c98a] hover:underline cursor-pointer"
									>
										{copiedKey === "wa_c" ? "Tersalin!" : "Salin Teks"}
									</button>
								</div>
								<pre className="text-xs text-white/85 font-sans leading-relaxed whitespace-pre-wrap">
									{internalResult.whatsappSuite.casualFriendly}
								</pre>
							</div>

							<div className="p-3 rounded-[6px] bg-black/60 border border-white/10 space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-amber-400">3. Format Promo & Penawaran Terbatas</span>
									<button
										type="button"
										onClick={() => handleCopy(internalResult.whatsappSuite.promoLimited, "wa_p")}
										className="text-xs text-[#e8c98a] hover:underline cursor-pointer"
									>
										{copiedKey === "wa_p" ? "Tersalin!" : "Salin Teks"}
									</button>
								</div>
								<pre className="text-xs text-white/85 font-sans leading-relaxed whitespace-pre-wrap">
									{internalResult.whatsappSuite.promoLimited}
								</pre>
							</div>
						</div>
					)}

					{activeResultTab === "cdn" && (
						<div className="space-y-3.5">
							<div className="p-3 rounded-[6px] bg-white/5 border border-white/10 space-y-1 text-xs">
								<p className="font-bold text-white">Ringkasan Estetika Tema:</p>
								<p className="text-white/70 leading-relaxed">
									{internalResult.assetAnalysis.themeSummary}
								</p>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-bold text-white uppercase tracking-wider">
									Palet Warna Dominan Terdeteksi
								</p>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
									{internalResult.assetAnalysis.dominantColors.map((col) => (
										<div
											key={col.hex}
											className="p-2.5 rounded-[6px] bg-black/50 border border-white/10 flex items-center gap-2.5"
										>
											<div
												className="size-7 rounded-[4px] border border-white/20 shrink-0 shadow-xs"
												style={{ backgroundColor: col.hex }}
											/>
											<div className="min-w-0">
												<p className="text-xs font-bold text-white truncate">{col.name}</p>
												<p className="text-[10px] text-white/50 font-mono">{col.hex}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
								<div className="p-3 rounded-[6px] bg-black/50 border border-white/8 space-y-1">
									<p className="font-bold text-[#e8c98a]">Analisis Tipografi:</p>
									<p className="text-white/70 leading-relaxed">
										{internalResult.assetAnalysis.typographyAnalysis}
									</p>
								</div>
								<div className="p-3 rounded-[6px] bg-black/50 border border-white/8 space-y-1">
									<p className="font-bold text-[#e8c98a]">Analisis Ornamen & Grafis:</p>
									<p className="text-white/70 leading-relaxed">
										{internalResult.assetAnalysis.ornamentDetails}
									</p>
								</div>
							</div>

							<div className="space-y-1.5">
								<p className="text-xs font-bold text-white uppercase tracking-wider">
									Link Referensi CDN Resmi ({internalResult.assetAnalysis.cdnReferences.length})
								</p>
								<div className="space-y-1 max-h-40 overflow-y-auto pr-1">
									{internalResult.assetAnalysis.cdnReferences.map((refUrl, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between p-2 rounded-[4px] bg-black/40 border border-white/5 text-[11px]"
										>
											<span className="text-white/70 truncate mr-2 font-mono">{refUrl}</span>
											<a
												href={refUrl}
												target="_blank"
												rel="noreferrer"
												className="text-[#e8c98a] hover:underline flex items-center gap-1 shrink-0"
											>
												<span>Buka</span>
												<ExternalLink className="size-2.5" />
											</a>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{activeResultTab === "json" && (
						<pre className="p-3.5 rounded-[8px] bg-black/70 border border-emerald-500/20 text-emerald-300 font-mono text-xs leading-relaxed max-h-96 overflow-auto select-all">
							{jsonString}
						</pre>
					)}
				</GlassCard>
			)}

			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
					<div className="w-full max-w-3xl bg-[#0f141c] border border-[#c9a96e]/40 rounded-[10px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
						<div className="p-3.5 sm:p-4 border-b border-white/8 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="size-8 rounded-[6px] bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center text-[#e8c98a]">
									{isGenerating ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Sparkles className="size-4" />
									)}
								</div>
								<div>
									<h3 className="text-sm font-bold text-white tracking-tight">
										Studio Promosi AI (Gambar & Video)
									</h3>
									<p className="text-[11px] text-white/50">
										{selectedTemplate?.name || "Katalog Umum Simfoni Cinta"} — Rasio {aspectRatio}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{jsonString && !isGenerating && (
									<button
										type="button"
										onClick={() => handleCopy(jsonString, "json_modal")}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#c9a96e] hover:bg-[#d8b87d] text-black text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm"
									>
										{copiedKey === "json_modal" ? (
											<Check className="size-3.5" />
										) : (
											<Copy className="size-3.5" />
										)}
										<span>{copiedKey === "json_modal" ? "Tersalin!" : "Salin JSON"}</span>
									</button>
								)}

								<button
									type="button"
									onClick={() => setModalOpen(false)}
									disabled={isGenerating}
									className="size-7 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
								>
									<X className="size-4" />
								</button>
							</div>
						</div>

						<div className="p-4 space-y-4 overflow-y-auto flex-1">
							{isGenerating ? (
								<div className="p-8 text-center space-y-4">
									<div className="size-14 mx-auto rounded-[8px] bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center text-[#e8c98a]">
										<Loader2 className="size-7 animate-spin" />
									</div>

									<div className="space-y-1">
										<p className="text-sm font-bold text-white">
											{generateStatusText}
										</p>
										<p className="text-xs text-white/50">
											Menganalisis aset visual CDN & mengeksekusi Gemini 3.6 Flash Engine
										</p>
									</div>

									<div className="max-w-md mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-[#c9a96e] via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
											style={{ width: `${generateProgress}%` }}
										/>
									</div>
								</div>
							) : jsonString ? (
								<div className="space-y-2.5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
											<CheckCircle2 className="size-3.5" />
											<span>Blueprint JSON Siap Digunakan</span>
										</div>

										<span className="text-[11px] text-white/40 font-mono">
											{internalResult?.assetAnalysis.cdnReferences.length || 0} Aset CDN
										</span>
									</div>

									<pre className="p-3.5 rounded-[8px] bg-black/70 border border-emerald-500/30 text-emerald-300 font-mono text-xs leading-relaxed max-h-[60vh] overflow-auto select-all shadow-inner">
										{jsonString}
									</pre>
								</div>
							) : (
								<div className="text-center py-10 text-white/40 text-xs">
									Belum ada hasil promosi yang dibuat.
								</div>
							)}
						</div>

						<div className="p-3 sm:p-3.5 border-t border-white/8 flex items-center justify-between gap-2 bg-[#0c1017]">
							<span className="text-[11px] text-white/40">
								{isGenerating ? "Sedang memproses AI..." : "Standard JSON Package"}
							</span>

							<button
								type="button"
								onClick={() => setModalOpen(false)}
								disabled={isGenerating}
								className="px-3 py-1.5 rounded-[6px] bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
							>
								Tutup
							</button>
						</div>
					</div>
				</div>
			)}

			{previewCoverOpen && selectedTemplate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
					<div className="w-full max-w-lg bg-[#0f141c] border border-[#c9a96e]/40 rounded-[10px] shadow-2xl overflow-hidden">
						<div className="p-3 border-b border-white/8 flex items-center justify-between">
							<div>
								<h3 className="text-sm font-bold text-white">{selectedTemplate.name}</h3>
								<p className="text-[10px] text-white/50">{selectedTemplate.category || "Pernikahan"}</p>
							</div>
							<button
								type="button"
								onClick={() => setPreviewCoverOpen(false)}
								className="size-7 rounded-[6px] bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer"
							>
								<X className="size-4" />
							</button>
						</div>
						<div className="p-3 bg-black flex items-center justify-center">
							<img
								src={getTemplateCover(selectedTemplate)}
								alt={selectedTemplate.name}
								className="max-h-[60vh] w-auto object-contain rounded-[6px] border border-white/10"
							/>
						</div>
						<div className="p-3 border-t border-white/8 flex items-center justify-between bg-[#0c1017]">
							<span className="text-[11px] text-white/50">Cover Resolusi Asli</span>
							<div className="flex items-center gap-2">
								<Link
									to={`/demo/${selectedTemplate.slug}`}
									target="_blank"
									className="px-2.5 py-1 rounded-[5px] bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1"
								>
									<span>Buka Demo</span>
									<ExternalLink className="size-3" />
								</Link>
								<button
									type="button"
									onClick={() => setPreviewCoverOpen(false)}
									className="px-2.5 py-1 rounded-[5px] bg-[#c9a96e] text-black text-xs font-bold"
								>
									Tutup
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
