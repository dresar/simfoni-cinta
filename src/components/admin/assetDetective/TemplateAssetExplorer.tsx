import React, { useState, useEffect, useMemo } from "react";
import {
	ArrowLeft,
	Folder,
	UploadCloud,
	Music,
	Image as ImageIcon,
	FileCode,
	Type,
	CheckSquare,
	Square,
	Play,
	Pause,
	CheckCircle2,
	ExternalLink,
	Sparkles,
	Search,
	Copy,
	Check,
	Loader2,
	RefreshCw,
	File,
	Maximize2,
	X,
	Download
} from "lucide-react";
import type { Template, TemplateAssetItem } from "@/lib/db/schema";
import { fetchTemplateAssets } from "@/functions/templates";
import { SelectiveCdnUploader } from "./SelectiveCdnUploader";
import { cn } from "@/lib/utils";

interface TemplateAssetExplorerProps {
	template: Template;
	onClose: () => void;
}

function formatBytes(bytes: number): string {
	if (!bytes || bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function categorizeItem(item: TemplateAssetItem): string {
	const lower = item.name.toLowerCase();
	if (item.fileType === "audio") return "Musik";
	if (item.fileType === "font") return "Font";
	if (item.fileType === "css" || item.fileType === "js" || item.fileType === "code") return "CSS & JS";
	
	if (item.fileType === "image") {
		if (lower.includes("gallery") || lower.includes("foto") || lower.includes("couple")) {
			return "Galeri";
		}
		if (
			lower.includes("tl") ||
			lower.includes("tr") ||
			lower.includes("bl") ||
			lower.includes("br") ||
			lower.includes("ornament") ||
			lower.includes("frame") ||
			lower.includes("border") ||
			lower.includes("flower") ||
			lower.includes("bunga") ||
			lower.includes("leaf") ||
			lower.includes("pinto") ||
			lower.includes("awan")
		) {
			return "Ornamen";
		}
		return "Cover";
	}
	return "Lainnya";
}

const TYPE_PRIORITY: Record<string, number> = {
	image: 1,
	audio: 2,
	font: 3,
	css: 4,
	js: 5,
	code: 6,
	other: 7
};

export const TemplateAssetExplorer: React.FC<TemplateAssetExplorerProps> = ({
	template,
	onClose
}) => {
	const [assets, setAssets] = useState<TemplateAssetItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState<string>("Semua");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
	const [showCdnUploader, setShowCdnUploader] = useState(false);
	const [playingAudio, setPlayingAudio] = useState<string | null>(null);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
	const [copiedPath, setCopiedPath] = useState<string | null>(null);
	const [previewAsset, setPreviewAsset] = useState<TemplateAssetItem | null>(null);

	const loadAssets = async () => {
		setLoading(true);
		try {
			const res = await fetchTemplateAssets({ data: template.slug });
			setAssets(res || []);
		} catch (e) {
			console.error("Error loading template assets:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAssets();
		return () => {
			if (audioElement) {
				audioElement.pause();
			}
		};
	}, [template.slug]);

	const assetsWithCategory = useMemo(() => {
		return assets.map((a) => ({
			...a,
			category: categorizeItem(a)
		}));
	}, [assets]);

	const categoriesList = useMemo(() => {
		const counts: Record<string, number> = {
			Semua: assetsWithCategory.length,
			Cover: 0,
			Ornamen: 0,
			Galeri: 0,
			Musik: 0,
			Font: 0,
			"CSS & JS": 0
		};

		for (const a of assetsWithCategory) {
			if (counts[a.category] !== undefined) {
				counts[a.category]++;
			}
		}

		return [
			{ id: "Semua", name: "Semua", count: counts.Semua },
			{ id: "Cover", name: "Cover", count: counts.Cover },
			{ id: "Ornamen", name: "Ornamen", count: counts.Ornamen },
			{ id: "Galeri", name: "Galeri", count: counts.Galeri },
			{ id: "Musik", name: "Musik", count: counts.Musik },
			{ id: "Font", name: "Font", count: counts.Font },
			{ id: "CSS & JS", name: "CSS & JS", count: counts["CSS & JS"] }
		];
	}, [assetsWithCategory]);

	const filteredAssets = useMemo(() => {
		const filtered = assetsWithCategory.filter((item) => {
			const matchesCategory =
				activeCategory === "Semua" || item.category === activeCategory;

			const matchesSearch =
				!searchQuery.trim() ||
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.localPath.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesCategory && matchesSearch;
		});

		return filtered.sort((a, b) => {
			const pA = TYPE_PRIORITY[a.fileType] || 99;
			const pB = TYPE_PRIORITY[b.fileType] || 99;
			if (pA !== pB) return pA - pB;
			return a.name.localeCompare(b.name);
		});
	}, [assetsWithCategory, activeCategory, searchQuery]);

	const selectAll = () => {
		setSelectedPaths(new Set(filteredAssets.map((a) => a.localPath)));
	};

	const deselectAll = () => {
		setSelectedPaths(new Set());
	};

	const toggleSelect = (path: string) => {
		const next = new Set(selectedPaths);
		if (next.has(path)) next.delete(path);
		else next.add(path);
		setSelectedPaths(next);
	};

	const handlePlayAudio = (url: string) => {
		if (playingAudio === url) {
			audioElement?.pause();
			setPlayingAudio(null);
		} else {
			if (audioElement) audioElement.pause();
			const audio = new Audio(url);
			audio.play();
			audio.onended = () => setPlayingAudio(null);
			setAudioElement(audio);
			setPlayingAudio(url);
		}
	};

	const copyCdn = (cdnUrl: string, key: string) => {
		navigator.clipboard.writeText(cdnUrl);
		setCopiedPath(key);
		setTimeout(() => setCopiedPath(null), 2000);
	};

	return (
		<div className="space-y-4 animate-fade-in">
			{/* Standard PageHead */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onClose}
						className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
						aria-label="Kembali"
						title="Kembali ke Folder"
					>
						<ArrowLeft className="size-4" />
					</button>

					<div>
						<div className="flex items-center gap-2">
							<h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
								{template.name}
							</h1>
							<span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-[11px] font-semibold">
								{template.category}
							</span>
						</div>
						<p className="text-xs text-white/40 mt-0.5">
							{assets.length} berkas aset terdeteksi
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={loadAssets}
						disabled={loading}
						className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
					>
						<RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
						Refresh
					</button>

					<a
						href={`/demo/${template.slug}/index.html`}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/40 bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
					>
						<ExternalLink className="size-3.5" />
						Live Demo
					</a>
				</div>
			</div>

			{/* Category Pills & Search Controls (Horizontal, No Sidebar) */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap gap-1.5">
					{categoriesList.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id)}
							className={cn(
								"rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
								activeCategory === cat.id
									? "border-amber-500/40 bg-amber-500/15 text-amber-400"
									: "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/60"
							)}
						>
							{cat.name} ({cat.count})
						</button>
					))}
				</div>

				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
						<input
							type="search"
							placeholder="Cari"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-9 w-44 sm:w-52 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-white/25 focus:border-amber-500/40 focus:bg-white/10 focus:outline-none"
						/>
					</div>

					{selectedPaths.size > 0 && (
						<button
							type="button"
							onClick={() => setShowCdnUploader(true)}
							className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-xs cursor-pointer animate-fade-in"
						>
							<UploadCloud className="size-3.5" />
							Sinkron ({selectedPaths.size})
						</button>
					)}
				</div>
			</div>

			{/* Sub-bar: Status and Multi-select triggers */}
			<div className="flex items-center justify-between gap-3 text-xs text-muted-foreground border-b border-white/5 pb-2.5">
				<div className="flex items-center gap-2">
					<span>
						Total: <strong className="text-white">{filteredAssets.length}</strong> berkas
					</span>
					{selectedPaths.size > 0 && (
						<span className="rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 font-bold text-[11px]">
							{selectedPaths.size} Dipilih
						</span>
					)}
				</div>

				<div className="flex items-center gap-2 text-xs">
					<button
						type="button"
						onClick={selectAll}
						className="hover:text-white transition-colors cursor-pointer text-white/50"
					>
						Pilih Semua
					</button>
					<span className="text-white/20">|</span>
					<button
						type="button"
						onClick={deselectAll}
						className="hover:text-white transition-colors cursor-pointer text-white/50"
					>
						Batal
					</button>
				</div>
			</div>

			{/* Clean 4-Column Grid (No unnecessary buttons) */}
			{loading ? (
				<div className="h-72 flex flex-col items-center justify-center gap-2 border border-white/10 bg-white/5 rounded-2xl">
					<Loader2 className="size-6 text-amber-400 animate-spin" />
					<p className="text-xs text-white/40">Memuat...</p>
				</div>
			) : filteredAssets.length === 0 ? (
				<div className="h-72 flex flex-col items-center justify-center gap-2 border border-white/10 bg-white/5 rounded-2xl p-6 text-center">
					<Folder className="size-8 text-white/20" />
					<p className="text-sm font-semibold text-white/60">Belum ada berkas</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{filteredAssets.map((asset) => {
						const isSelected = selectedPaths.has(asset.localPath);
						return (
							<div
								key={asset.id}
								className={cn(
									"group relative flex flex-col p-3 rounded-2xl border transition-all duration-200 select-none",
									isSelected
										? "border-blue-500/60 bg-blue-500/10 shadow-xs"
										: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
								)}
							>
								{/* Selection checkbox */}
								<button
									type="button"
									onClick={() => toggleSelect(asset.localPath)}
									className="absolute top-3 right-3 z-10 p-1 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
									title="Pilih Berkas"
								>
									{isSelected ? (
										<CheckSquare className="size-4 text-blue-400" />
									) : (
										<Square className="size-4 text-white/40 group-hover:text-white/80" />
									)}
								</button>

								{/* Image Preview / Icon Container */}
								<div 
									onClick={() => {
										if (asset.fileType === "image") {
											setPreviewAsset(asset);
										} else {
											toggleSelect(asset.localPath);
										}
									}}
									className="h-44 sm:h-48 w-full rounded-xl bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden mb-2.5 relative cursor-pointer"
								>
									{asset.fileType === "image" ? (
										<>
											<img
												src={asset.localPath}
												alt={asset.name}
												loading="lazy"
												className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
												onError={(e) => {
													(e.target as HTMLElement).style.display = "none";
												}}
											/>
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
												<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold backdrop-blur-sm shadow-md">
													<Maximize2 className="size-3.5 text-amber-400" />
													Perbesar
												</span>
											</div>
										</>
									) : asset.fileType === "audio" ? (
										<div className="flex flex-col items-center justify-center gap-2 text-white/60">
											<Music className="size-10 text-amber-400" />
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handlePlayAudio(asset.localPath);
												}}
												className="p-3 bg-amber-500/20 text-amber-300 rounded-full hover:scale-110 transition-transform cursor-pointer shadow-md"
											>
												{playingAudio === asset.localPath ? (
													<Pause className="size-4" />
												) : (
													<Play className="size-4" />
												)}
											</button>
										</div>
									) : asset.fileType === "font" ? (
										<div className="text-center p-3">
											<span className="text-2xl font-serif text-white/80 font-bold">Aa Bb Cc</span>
											<p className="text-[10px] text-white/40 font-mono mt-1">.woff2 font</p>
										</div>
									) : asset.fileType === "css" ? (
										<div className="flex flex-col items-center justify-center gap-1.5 text-cyan-400">
											<FileCode className="size-9" />
											<span className="text-[11px] font-mono text-white/60 font-bold">CSS STYLESHEET</span>
										</div>
									) : asset.fileType === "js" ? (
										<div className="flex flex-col items-center justify-center gap-1.5 text-yellow-400">
											<FileCode className="size-9" />
											<span className="text-[11px] font-mono text-white/60 font-bold">JAVASCRIPT</span>
										</div>
									) : (
										<File className="size-8 text-white/40" />
									)}
								</div>

								{/* Info */}
								<div className="space-y-1">
									<h4 className="text-xs font-semibold text-white truncate" title={asset.name}>
										{asset.name}
									</h4>
									<div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
										<span>{formatBytes(asset.fileSize || 0)}</span>
										{(Boolean(asset.isSyncedCdn) || Boolean(asset.cdnUrl && !asset.cdnUrl.includes(".github.io"))) && (
											<span className="flex items-center gap-1 text-emerald-400 font-sans font-medium text-[10px]">
												<CheckCircle2 className="size-3" />
												<span>CDN</span>
											</span>
										)}
									</div>
								</div>

								{/* Synced CDN Button (Appears when synced to GitHub CDN) */}
								{(Boolean(asset.isSyncedCdn) || Boolean(asset.cdnUrl && !asset.cdnUrl.includes(".github.io"))) && (
									<button
										type="button"
										onClick={() => copyCdn(asset.cdnUrl!, `cdn-${asset.id}`)}
										className="mt-2.5 flex w-full items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors cursor-pointer shadow-xs"
										title="Salin CDN URL"
									>
										{copiedPath === `cdn-${asset.id}` ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
										<span>{copiedPath === `cdn-${asset.id}` ? "Disalin" : "Salin CDN"}</span>
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Full Image Preview Lightbox Modal */}
			{previewAsset && (
				<div 
					onClick={() => setPreviewAsset(null)}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in cursor-pointer"
				>
					<div 
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-default"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/60">
							<div className="truncate pr-4">
								<h3 className="text-sm font-bold text-white truncate">{previewAsset.name}</h3>
								<p className="text-[11px] text-white/40 font-mono">{formatBytes(previewAsset.fileSize || 0)}</p>
							</div>
							<button
								type="button"
								onClick={() => setPreviewAsset(null)}
								className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
							>
								<X className="size-5" />
							</button>
						</div>

						{/* Full Image */}
						<div className="p-6 bg-black/60 flex items-center justify-center min-h-[350px] max-h-[70vh] overflow-auto">
							<img
								src={previewAsset.localPath}
								alt={previewAsset.name}
								className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg border border-white/5"
							/>
						</div>

						{/* Footer Actions */}
						<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 bg-slate-950/60">
							<span className="text-xs text-white/50">
								{previewAsset.category}
							</span>

							<div className="flex items-center gap-2">
								{previewAsset.isSyncedCdn && previewAsset.cdnUrl && (
									<button
										type="button"
										onClick={() => copyCdn(previewAsset.cdnUrl!, "modal-cdn")}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
									>
										{copiedPath === "modal-cdn" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
										Salin CDN
									</button>
								)}
								<a
									href={previewAsset.localPath}
									download={previewAsset.name}
									className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
								>
									<Download className="size-3.5" />
									Download
								</a>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* GitHub CDN Uploader Modal for manual selection */}
			{showCdnUploader && (
				<SelectiveCdnUploader
					templateSlug={template.slug}
					selectedPaths={Array.from(selectedPaths)}
					onSyncSuccess={() => {
						setSelectedPaths(new Set());
						loadAssets();
					}}
					onClose={() => setShowCdnUploader(false)}
				/>
			)}
		</div>
	);
};
