import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
	ArrowLeft,
	UploadCloud,
	RefreshCw,
	Copy,
	Check,
	CheckSquare,
	Square,
	ExternalLink,
	Bot,
	FileCode,
	Music,
	Image as ImageIcon,
	Search,
	X,
	CheckCircle2,
	AlertCircle,
	Loader2,
	Sparkles,
} from "lucide-react";
import {
	GlassCard,
	Action,
	TextInput,
} from "@/components/kit";
import { fetchTemplate } from "@/functions/media";
import {
	fetchTemplatePromoAssetsFn,
	checkCdnHealthFn,
	syncTemplateCdnAssetsFn,
} from "@/functions/templates";
import type { TemplatePromoAssetsResponse, PromoVisualAsset } from "@/server/templates";
import type { Template } from "@/lib/db/schema";
import { LOCAL_COVERS } from "@/components/landing/sections-a";

export const Route = createFileRoute("/admin/promosi-template/$id/aset")({
	loader: async ({ params }) => {
		const template = await fetchTemplate({ data: params.id });
		if (!template) {
			throw new Error("Template tidak ditemukan");
		}
		const assetsRes = await fetchTemplatePromoAssetsFn({ data: template.slug });
		return {
			template: template as Template,
			initialAssets: assetsRes,
		};
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `Aset CDN: ${loaderData?.template?.name || "Template"} — Simfoni Cinta`,
			},
		],
	}),
	component: TemplateAssetsPage,
});

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

function TemplateAssetsPage() {
	const { template, initialAssets } = Route.useLoaderData();
	const [assetsData, setAssetsData] = useState<TemplatePromoAssetsResponse | null>(initialAssets);
	const [checkingHealth, setCheckingHealth] = useState(false);
	const [cdnHealthMap, setCdnHealthMap] = useState<Record<string, { ok: boolean; status: number; message: string }>>({});
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadStatusText, setUploadStatusText] = useState("");
	const [uploadTotalCount, setUploadTotalCount] = useState(0);
	const [uploadResults, setUploadResults] = useState<
		Array<{ path: string; cdnUrl: string; status: "created" | "updated" | "failed" }>
	>([]);
	const [copiedModalUrl, setCopiedModalUrl] = useState<string | null>(null);

	async function reloadAssets() {
		try {
			const res = await fetchTemplatePromoAssetsFn({ data: template.slug });
			setAssetsData(res);
		} catch {
			toast.error("Gagal memuat data aset");
		}
	}

	const allAssets = useMemo(() => {
		const raw = assetsData?.assets || [];
		return raw.filter((a) => !isExcludedPromoAsset(a.name) && !isExcludedPromoAsset(a.localPath));
	}, [assetsData]);

	const filteredAssets = useMemo(() => {
		return allAssets.filter((a) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return a.name.toLowerCase().includes(q) || a.localPath.toLowerCase().includes(q);
		});
	}, [allAssets, searchQuery]);

	async function handleCheckHealth() {
		const cdnUrls = allAssets
			.filter((a) => a.isSyncedCdn && a.cdnUrl && (a.cdnUrl.startsWith("http://") || a.cdnUrl.startsWith("https://")))
			.map((a) => a.cdnUrl as string);

		if (cdnUrls.length === 0) {
			toast.info("Belum ada aset CDN untuk diperiksa");
			return;
		}

		setCheckingHealth(true);
		try {
			const res = await checkCdnHealthFn({ data: cdnUrls });
			setCdnHealthMap(res);
			toast.success("Pengecekan CDN selesai");
		} catch {
			toast.error("Gagal memeriksa kesehatan CDN");
		} finally {
			setCheckingHealth(false);
		}
	}

	async function startUpload(paths: string[]) {
		if (paths.length === 0) return;
		setUploadModalOpen(true);
		setIsUploading(true);
		setUploadTotalCount(paths.length);
		setUploadProgress(15);
		setUploadStatusText(`Menghubungkan ke GitHub CDN (${paths.length} berkas)...`);
		setUploadResults([]);

		const interval = setInterval(() => {
			setUploadProgress((prev) => (prev < 85 ? prev + 12 : prev));
		}, 500);

		try {
			setUploadStatusText(`Mengunggah ${paths.length} aset ke CDN...`);
			const res = await syncTemplateCdnAssetsFn({
				data: { slug: template.slug, assetPaths: paths },
			});
			clearInterval(interval);
			setUploadProgress(100);

			const results = res.results || [];
			setUploadResults(results);

			const successCount =
				res.uploadedCount ??
				res.syncedCount ??
				results.filter((r) => r.status !== "failed").length;

			if (successCount > 0) {
				setUploadStatusText(`Sukses! ${successCount} dari ${paths.length} aset berhasil diunggah.`);
				toast.success(`${successCount} aset berhasil diunggah ke CDN!`);
				setSelectedIds([]);
				await reloadAssets();
			} else {
				setUploadStatusText("Aset sudah tersedia di CDN.");
				toast.info("Aset sudah ada di CDN");
			}
		} catch {
			clearInterval(interval);
			setUploadProgress(100);
			setUploadStatusText("Gagal mengunggah aset ke GitHub CDN.");
			toast.error("Gagal mengunggah aset ke GitHub CDN");
		} finally {
			setIsUploading(false);
		}
	}

	async function handleUploadSelected() {
		if (selectedIds.length === 0) {
			toast.info("Pilih aset terlebih dahulu");
			return;
		}

		const selectedSet = new Set(selectedIds);
		const pathsToUpload = allAssets
			.filter((a) => selectedSet.has(a.id || a.localPath))
			.map((a) => a.localPath);

		await startUpload(pathsToUpload);
	}

	async function handleUploadSingle(localPath: string) {
		await startUpload([localPath]);
	}

	function handleCopy(text: string, key: string) {
		navigator.clipboard.writeText(text);
		setCopiedKey(key);
		toast.success("Tersalin");
		setTimeout(() => setCopiedKey(null), 2000);
	}

	function handleCopyModal(text: string) {
		navigator.clipboard.writeText(text);
		setCopiedModalUrl(text);
		toast.success("URL CDN tersalin");
		setTimeout(() => setCopiedModalUrl(null), 2000);
	}

	function handleCopyAllModalUrls() {
		const validUrls = uploadResults.filter((r) => r.cdnUrl).map((r) => r.cdnUrl);
		if (validUrls.length === 0) return;
		navigator.clipboard.writeText(validUrls.join("\n"));
		toast.success(`${validUrls.length} URL CDN berhasil disalin`);
	}

	const toggleSelect = (key: string) => {
		if (!key) return;
		setSelectedIds((prev) =>
			prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
		);
	};

	const selectAllFiltered = () => {
		setSelectedIds(filteredAssets.map((a) => a.id || a.localPath));
	};

	const deselectAll = () => {
		setSelectedIds([]);
	};

	const coverImg =
		(template.thumb && template.thumb.trim() !== "" ? template.thumb : null) ||
		LOCAL_COVERS[template.slug] ||
		`/demo/${template.slug}/assets/images/${template.slug}.webp`;

	return (
		<div className="space-y-4 max-w-7xl mx-auto pb-16">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
				<div className="flex items-center gap-3">
					<Link
						to="/admin/promosi-template"
						className="size-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white border border-white/5 transition-all active:scale-95 cursor-pointer shrink-0"
					>
						<ArrowLeft className="size-4" />
					</Link>
					<div className="relative size-10 sm:size-11 rounded-[6px] overflow-hidden bg-black/40 border border-white/10 shrink-0 shadow-inner">
						<img
							src={coverImg}
							alt={template.name}
							className="w-full h-full object-cover"
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
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
								{template.name}
							</h1>
							{template.category && (
								<span className="px-2 py-0.5 rounded-md bg-[#c9a96e]/20 text-[#e8c98a] text-[10px] font-bold border border-[#c9a96e]/30">
									{template.category}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Link
						to="/admin/promosi-gambar"
						search={{ template: template.slug }}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#c9a96e]/20 hover:bg-[#c9a96e]/30 text-[#e8c98a] text-xs font-semibold border border-[#c9a96e]/30 transition-all active:scale-[0.98] cursor-pointer"
					>
						<Sparkles className="size-3.5" />
						<span>Studio AI</span>
					</Link>
				</div>
			</div>

			<GlassCard className="p-3 space-y-2.5">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={selectAllFiltered}
							className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/5 transition-all cursor-pointer active:scale-95"
						>
							Pilih Semua ({filteredAssets.length})
						</button>
						{selectedIds.length > 0 && (
							<button
								type="button"
								onClick={deselectAll}
								className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-all cursor-pointer active:scale-95"
							>
								Batal ({selectedIds.length})
							</button>
						)}
					</div>

					<div className="flex items-center gap-1.5">
						<Action
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleCheckHealth}
							loading={checkingHealth}
							icon={<RefreshCw className="size-3.5" />}
						>
							Cek Status
						</Action>

						<Action
							type="button"
							variant="primary"
							size="sm"
							onClick={handleUploadSelected}
							loading={isUploading}
							disabled={selectedIds.length === 0}
							icon={<UploadCloud className="size-3.5" />}
						>
							Upload Terpilih ({selectedIds.length})
						</Action>
					</div>
				</div>

				<div className="pt-1">
					<TextInput
						placeholder="Cari aset..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						icon={<Search className="size-4 text-white/40" />}
						clearable
						onClear={() => setSearchQuery("")}
					/>
				</div>
			</GlassCard>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
				{filteredAssets.map((asset: PromoVisualAsset) => {
					const assetKey = asset.id || asset.localPath;
					const isSelected = selectedIds.includes(assetKey);
					const isImage =
						asset.fileType === "image" ||
						/\.(webp|jpg|jpeg|png|svg|gif|ico)$/i.test(asset.name) ||
						/\.(webp|jpg|jpeg|png|svg|gif|ico)/i.test(asset.localPath);
					const isMedia = /\.(mp3|mp4|webm|ogg|wav)$/i.test(asset.name);
					const health = asset.cdnUrl ? cdnHealthMap[asset.cdnUrl] : null;
					const hasValidCdn = Boolean(
						asset.isSyncedCdn &&
						asset.cdnUrl &&
						(asset.cdnUrl.startsWith("http://") || asset.cdnUrl.startsWith("https://"))
					);
					const rawLocal = asset.localPath || "";
					const localUrl = rawLocal.startsWith("http")
						? rawLocal
						: rawLocal.startsWith("/")
						? rawLocal
						: `/${rawLocal}`;
					const imgSrc = hasValidCdn ? asset.cdnUrl! : localUrl;

					return (
						<div
							key={assetKey}
							onClick={() => toggleSelect(assetKey)}
							className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 sm:gap-3 select-none group relative ${
								isSelected
									? "bg-[#c9a96e]/15 border-[#c9a96e]/50 ring-1 ring-[#c9a96e]/30 shadow-md"
									: "bg-[#12161f]/80 hover:bg-[#161c27] border-white/8 hover:border-white/15"
							}`}
						>
							<div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
								{isImage ? (
									<>
										<ImageIcon className="size-6 sm:size-8 text-white/10 absolute" />
										<img
											src={imgSrc}
											alt={asset.name}
											loading="lazy"
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-1"
											onError={(e) => {
												const target = e.currentTarget;
												if (localUrl && !target.src.endsWith(localUrl)) {
													target.src = localUrl;
												} else if (target.src.endsWith(".webp")) {
													target.src = target.src.replace(/\.webp$/, ".jpg");
												} else if (target.src.endsWith(".jpg")) {
													target.src = target.src.replace(/\.jpg$/, ".png");
												} else {
													target.style.display = "none";
												}
											}}
										/>
									</>
								) : isMedia ? (
									<Music className="size-8 sm:size-10 text-purple-400" />
								) : (
									<FileCode className="size-8 sm:size-10 text-cyan-400" />
								)}

								<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 text-[#e8c98a]">
									{isSelected ? (
										<CheckSquare className="size-4 sm:size-5 drop-shadow-md" />
									) : (
										<Square className="size-4 sm:size-5 text-white/50 drop-shadow-md group-hover:text-white" />
									)}
								</div>

								<div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
									{hasValidCdn ? (
										<span className="px-1.5 py-0.5 rounded bg-emerald-500/90 text-black text-[9px] sm:text-[10px] font-bold shadow-xs">
											CDN
										</span>
									) : (
										<span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[9px] sm:text-[10px] font-bold shadow-xs">
											Lokal
										</span>
									)}
								</div>

								{health && (
									<div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10">
										<span
											className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${
												health.ok
													? "bg-emerald-950/90 text-emerald-300 border border-emerald-700"
													: "bg-red-950/90 text-red-300 border border-red-700"
											}`}
										>
											{health.status}
										</span>
									</div>
								)}
							</div>

							<div className="min-w-0">
								<p
									className="text-[11px] sm:text-xs font-semibold text-white/90 truncate group-hover:text-[#e8c98a] transition-colors"
									title={asset.name}
								>
									{asset.name}
								</p>
							</div>

							<div
								className="pt-1.5 sm:pt-2 border-t border-white/5 flex items-center justify-between gap-1.5"
								onClick={(e) => e.stopPropagation()}
							>
								{hasValidCdn ? (
									<div className="flex items-center justify-between w-full gap-1.5">
										<button
											type="button"
											onClick={() => handleCopy(asset.cdnUrl!, assetKey)}
											className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] sm:text-xs font-semibold border border-white/5 transition-all cursor-pointer active:scale-95"
											title="Salin URL CDN"
										>
											{copiedKey === assetKey ? (
												<Check className="size-3 text-emerald-400" />
											) : (
												<Copy className="size-3" />
											)}
											<span>Salin</span>
										</button>

										<a
											href={asset.cdnUrl!}
											target="_blank"
											rel="noreferrer"
											className="size-7 sm:size-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all border border-white/5 shrink-0 active:scale-95"
											title="Buka URL CDN"
										>
											<ExternalLink className="size-3 sm:size-3.5" />
										</a>
									</div>
								) : (
									<button
										type="button"
										onClick={() => handleUploadSingle(asset.localPath)}
										disabled={isUploading}
										className="w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-semibold border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
									>
										<UploadCloud className="size-3.5" />
										<span>Upload</span>
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{filteredAssets.length === 0 && (
				<div className="text-center py-16 text-white/40 text-xs">
					Tidak ada aset visual ditemukan.
				</div>
			)}

			{uploadModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
					<div className="w-full max-w-xl bg-[#0f141c] border border-[#c9a96e]/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
						<div className="p-4 border-b border-white/8 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="size-9 rounded-xl bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center text-[#e8c98a]">
									{isUploading ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<UploadCloud className="size-4" />
									)}
								</div>
								<div>
									<h3 className="text-sm font-bold text-white tracking-tight">
										Progres Unggah CDN
									</h3>
									<p className="text-[11px] text-white/50">
										{template.name} ({uploadTotalCount} aset)
									</p>
								</div>
							</div>

							{!isUploading && (
								<button
									type="button"
									onClick={() => setUploadModalOpen(false)}
									className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
								>
									<X className="size-4" />
								</button>
							)}
						</div>

						<div className="p-4 space-y-4 overflow-y-auto flex-1">
							<div className="p-3.5 rounded-xl bg-black/40 border border-white/6 space-y-2.5">
								<div className="flex items-center justify-between text-xs">
									<span className="text-white/80 font-medium">
										{uploadStatusText}
									</span>
									<span className="font-mono text-[#e8c98a] font-bold">
										{uploadProgress}%
									</span>
								</div>

								<div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-[#c9a96e] via-amber-400 to-emerald-400 transition-all duration-300 rounded-full shadow-sm"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							</div>

							{uploadResults.length > 0 && (
								<div className="space-y-2.5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="size-4 text-emerald-400" />
											<h4 className="text-xs font-bold text-white">
												Pratinjau Hasil CDN ({uploadResults.length})
											</h4>
										</div>

										<button
											type="button"
											onClick={handleCopyAllModalUrls}
											className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#c9a96e]/15 hover:bg-[#c9a96e]/25 text-[#e8c98a] text-[11px] font-semibold border border-[#c9a96e]/30 transition-all cursor-pointer active:scale-95"
										>
											<Copy className="size-3" />
											<span>Salin Semua URL</span>
										</button>
									</div>

									<div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
										{uploadResults.map((item, idx) => {
											const isFailed = item.status === "failed";
											const fileName = item.path.split("/").pop() || item.path;
											const isCopied = copiedModalUrl === item.cdnUrl;

											return (
												<div
													key={idx}
													className="p-2.5 rounded-xl bg-[#141924] border border-white/6 flex flex-col justify-between gap-2"
												>
													<div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
														{item.cdnUrl ? (
															<img
																src={item.cdnUrl}
																alt={fileName}
																className="w-full h-full object-cover"
																onError={(e) => {
																	e.currentTarget.style.display = "none";
																}}
															/>
														) : (
															<AlertCircle className="size-6 text-rose-400" />
														)}
														<span
															className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
																isFailed
																	? "bg-rose-500 text-white"
																	: "bg-emerald-500 text-black"
															}`}
														>
															{isFailed ? "Gagal" : "CDN Aktif"}
														</span>
													</div>

													<div className="min-w-0">
														<p className="text-[11px] font-semibold text-white/90 truncate">
															{fileName}
														</p>
													</div>

													{item.cdnUrl && (
														<div className="flex items-center gap-1">
															<button
																type="button"
																onClick={() => handleCopyModal(item.cdnUrl)}
																className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[10px] font-medium border border-white/5 transition-all cursor-pointer active:scale-95"
															>
																{isCopied ? (
																	<Check className="size-3 text-emerald-400" />
																) : (
																	<Copy className="size-3" />
																)}
																<span>{isCopied ? "Tersalin" : "Salin"}</span>
															</button>

															<a
																href={item.cdnUrl}
																target="_blank"
																rel="noreferrer"
																className="size-6 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center border border-white/5 transition-all shrink-0 active:scale-95"
																title="Buka CDN"
															>
																<ExternalLink className="size-3" />
															</a>
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>

						<div className="p-3 sm:p-4 border-t border-white/8 flex items-center justify-end gap-2 bg-[#0c1017]">
							{isUploading ? (
								<button
									type="button"
									disabled
									className="px-4 py-2 rounded-xl bg-[#c9a96e]/20 text-[#e8c98a] text-xs font-semibold border border-[#c9a96e]/30 flex items-center gap-2 opacity-70"
								>
									<Loader2 className="size-3.5 animate-spin" />
									<span>Sedang Mengunggah...</span>
								</button>
							) : (
								<button
									type="button"
									onClick={() => setUploadModalOpen(false)}
									className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
								>
									Selesai
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
