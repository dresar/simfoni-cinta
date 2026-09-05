import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
	FileZip,
	ImageSquare,
	MusicNote,
	CheckSquare,
	Square,
	Plus,
	UploadSimple,
	Trash,
	X,
	Sparkle,
	FolderPlus,
	CheckCircle,
	Copy,
} from "@phosphor-icons/react";
import { PageHead } from "@/components/kit";
import {
	addAsset,
	addMusic,
	addTemplate,
	fetchTemplateCategories,
} from "@/functions/media";
import { deployTemplateFileFn, uploadImageFn } from "@/functions/upload";
import { createId } from "@/store/appStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/template/upload")({
	loader: () => fetchTemplateCategories(),
	head: () => ({
		meta: [
			{ title: "Upload Template Baru — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Unggah paket template ZIP lengkap dengan ekstraksi aset gambar dan audio ke Cloud Storage.",
			},
		],
	}),
	component: UploadTemplatePage,
});

type AssetCategory =
	| "Thumbnail/Cover"
	| "Ornamen"
	| "Background"
	| "Foto Pasangan"
	| "Musik Audio"
	| "Dekorasi"
	| "Icon"
	| string;

interface ExtractedAsset {
	id: string;
	filename: string;
	type: "image" | "audio";
	dataUrl: string;
	objectUrl: string;
	category: AssetCategory;
	selected: boolean;
	size: string;
	uploaded?: boolean;
	uploading?: boolean;
	cdnUrl?: string;
}

interface TemplateForm {
	name: string;
	slug: string;
	tag: string;
	category: string;
	theme: string;
	thumb: string;
}

interface UploadProgress {
	done: number;
	total: number;
	active: boolean;
}

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "svg"];
const AUDIO_EXTS = ["mp3", "wav", "m4a", "ogg"];
const DEFAULT_CATEGORIES: AssetCategory[] = [
	"Thumbnail / Cover",
	"Ornamen",
	"Background",
	"Bingkai / Frame",
	"Foto Pasangan",
	"Dekorasi",
	"Icon",
	"Musik Audio",
];

function getFileExt(name: string) {
	return name.split(".").pop()?.toLowerCase() ?? "";
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1048576).toFixed(1)} MB`;
}

function cleanZipName(filename: string): string {
	const base = filename
		.replace(/\.zip$/i, "")
		.replace(/[-_]+/g, " ")
		.trim();
	return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferCategory(
	filename: string,
	type: "image" | "audio",
	zipSlug?: string,
): AssetCategory {
	if (type === "audio") return "Musik Audio";
	const lower = filename.toLowerCase();
	const baseName = lower.replace(/\.[^/.]+$/, "");
	const cleanSlug = (zipSlug || "").toLowerCase();

	if (
		(cleanSlug && baseName === cleanSlug) ||
		(cleanSlug &&
			baseName.startsWith(cleanSlug) &&
			(lower.includes("cover") ||
				lower.includes("thumb") ||
				lower.includes("preview") ||
				lower.includes("mockup") ||
				lower.includes("banner") ||
				lower.includes("hero"))) ||
		lower.includes("cover") ||
		lower.includes("thumb") ||
		lower.includes("thumbnail") ||
		lower.includes("preview") ||
		lower.includes("featured") ||
		lower.includes("mockup")
	) {
		return "Thumbnail / Cover";
	}
	if (
		lower.includes("bg") ||
		lower.includes("background") ||
		lower.includes("latar")
	)
		return "Background";
	if (
		lower.includes("frame") ||
		lower.includes("bingkai") ||
		lower.includes("border")
	)
		return "Bingkai / Frame";
	if (
		lower.includes("ornamen") ||
		lower.includes("motif") ||
		lower.includes("batik") ||
		lower.includes("corner") ||
		lower.includes("pembatas")
	)
		return "Ornamen";
	if (
		lower.includes("pasangan") ||
		lower.includes("couple") ||
		lower.includes("bride") ||
		lower.includes("groom") ||
		lower.includes("mempelai")
	)
		return "Foto Pasangan";
	if (
		lower.includes("dekor") ||
		lower.includes("flower") ||
		lower.includes("bunga") ||
		lower.includes("floral")
	)
		return "Dekorasi";
	if (
		lower.includes("icon") ||
		lower.includes("logo") ||
		lower.includes("ikon")
	)
		return "Icon";
	return "Ornamen";
}

async function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function UploadTemplatePage() {
	const navigate = useNavigate();
	const dbCategories = Route.useLoaderData();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [form, setForm] = useState<TemplateForm>({
		name: "",
		slug: "",
		tag: "Adat Nusantara",
		category: dbCategories?.[0]?.name ?? "Tradisional",
		theme: "Emas & Maroon",
		thumb:
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/tpl-traditional.jpg",
	});

	const [isCustomTemplateCat, setIsCustomTemplateCat] = useState(false);
	const templateCategoriesList = useMemo(() => {
		const fromDb = (dbCategories ?? []).map((c: any) => c.name);
		const defaults = [
			"Tradisional",
			"Modern",
			"Signature",
			"Religius",
			"Artistik",
			"Floral & Sage",
			"Elegant & Luxury",
			"Minimalis",
			"Islamic & Syukuran",
		];
		const merged = Array.from(new Set([...fromDb, ...defaults]));
		if (form.category && !merged.includes(form.category)) {
			merged.push(form.category);
		}
		return merged;
	}, [dbCategories, form.category]);

	const [assets, setAssets] = useState<ExtractedAsset[]>([]);
	const [categories, setCategories] = useState<AssetCategory[]>([
		...DEFAULT_CATEGORIES,
	]);
	const [newCategoryInput, setNewCategoryInput] = useState("");
	const [showNewCategory, setShowNewCategory] = useState(false);
	const [progress, setProgress] = useState<UploadProgress>({
		done: 0,
		total: 0,
		active: false,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [formLoading, setFormLoading] = useState(false);

	const copyToClipboard = (text: string, label = "Link CDN") => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText(text);
			toast.success(`${label} disalin ke clipboard!`);
		}
	};

	const handleNameChange = (name: string) => {
		const autoSlug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		setForm((prev) => ({
			...prev,
			name,
			slug:
				prev.slug === "" || prev.slug === autoSlug.slice(0, -1)
					? autoSlug
					: prev.slug,
		}));
	};

	const processFiles = useCallback(async (files: File[]) => {
		const extracted: ExtractedAsset[] = [];

		for (const file of files) {
			const ext = getFileExt(file.name);

			if (ext === "zip") {
				const autoName = cleanZipName(file.name);
				const zipSlug = file.name
					.replace(/\.zip$/i, "")
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "");
				if (autoName) {
					handleNameChange(autoName);
				}
				const zip = await JSZip.loadAsync(file);
				const zipEntries = Object.values(zip.files).filter((f) => !f.dir);

				const hasIndex = zipEntries.some((e) =>
					e.name.toLowerCase().endsWith("index.html"),
				);
				if (hasIndex) {
					toast.info("Menyinkronkan pratinjau template ke Cloud CDN...");
					for (const entry of zipEntries) {
						entry.async("base64").then((base64Content) => {
							const relPath = entry.name.replace(/^\.\//, "").replace(/^\//, "");
							deployTemplateFileFn({
								data: {
									slug: zipSlug,
									relativePath: relPath,
									base64Content,
								},
							}).catch(() => {});
						});
					}
				}

				for (const entry of zipEntries) {
					const entryExt = getFileExt(entry.name);
					const isImage = IMAGE_EXTS.includes(entryExt);
					const isAudio = AUDIO_EXTS.includes(entryExt);
					if (!isImage && !isAudio) continue;

					const type = isImage ? "image" : "audio";
					const blob = await entry.async("blob");
					const mimeMap: Record<string, string> = {
						png: "image/png",
						jpg: "image/jpeg",
						jpeg: "image/jpeg",
						webp: "image/webp",
						svg: "image/svg+xml",
						mp3: "audio/mpeg",
						wav: "audio/wav",
						m4a: "audio/mp4",
						ogg: "audio/ogg",
					};
					const typedBlob = new Blob([blob], {
						type: mimeMap[entryExt] ?? "application/octet-stream",
					});
					const objectUrl = URL.createObjectURL(typedBlob);
					const asFile = new File(
						[typedBlob],
						entry.name.split("/").pop() ?? entry.name,
						{ type: typedBlob.type },
					);
					const dataUrl = await fileToDataUrl(asFile);
					const shortName = entry.name.split("/").pop() ?? entry.name;
					const category = inferCategory(shortName, type, zipSlug);

					extracted.push({
						id: createId("a"),
						filename: shortName,
						type,
						dataUrl,
						objectUrl,
						category,
						selected: true,
						size: formatBytes(typedBlob.size),
					});
				}
			} else if (IMAGE_EXTS.includes(ext) || AUDIO_EXTS.includes(ext)) {
				const type = IMAGE_EXTS.includes(ext) ? "image" : "audio";
				const objectUrl = URL.createObjectURL(file);
				const dataUrl = await fileToDataUrl(file);
				const category = inferCategory(file.name, type);
				extracted.push({
					id: createId("a"),
					filename: file.name,
					type,
					dataUrl,
					objectUrl,
					category,
					selected: true,
					size: formatBytes(file.size),
				});
			}
		}

		if (extracted.length > 0) {
			setAssets((prev) => [...prev, ...extracted]);
			const cover = extracted.find(
				(a) =>
					a.category === "Thumbnail / Cover" ||
					a.category === "Thumbnail/Cover",
			);
			if (cover) {
				setForm((prev) => ({ ...prev, thumb: cover.cdnUrl || cover.dataUrl }));
			}
			toast.success(`${extracted.length} aset berhasil diekstrak.`);
		}
	}, []);

	const toggleSelect = (id: string) => {
		setAssets((prev) =>
			prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)),
		);
	};

	const setAssetCategory = (id: string, category: AssetCategory) => {
		setAssets((prev) =>
			prev.map((a) => {
				if (a.id !== id) return a;
				if (
					category === "Thumbnail / Cover" ||
					category === "Thumbnail/Cover"
				) {
					setForm((f) => ({ ...f, thumb: a.cdnUrl || a.dataUrl }));
				}
				return { ...a, category };
			}),
		);
	};

	const removeAsset = (id: string) => {
		setAssets((prev) => prev.filter((a) => a.id !== id));
	};

	const addCustomCategory = () => {
		const trimmed = newCategoryInput.trim();
		if (!trimmed) return;
		if (!categories.includes(trimmed)) {
			setCategories((prev) => [...prev, trimmed]);
			toast.success(`Kategori "${trimmed}" ditambahkan.`);
		}
		setNewCategoryInput("");
		setShowNewCategory(false);
	};

	const uploadSelectedAssets = async () => {
		const selected = assets.filter((a) => a.selected && !a.uploaded);
		if (selected.length === 0) {
			toast.info("Pilih minimal satu aset yang belum diunggah.");
			return;
		}

		setProgress({ done: 0, total: selected.length, active: true });

		for (let i = 0; i < selected.length; i++) {
			const asset = selected[i];
			setAssets((prev) =>
				prev.map((a) => (a.id === asset.id ? { ...a, uploading: true } : a)),
			);

			try {
				const folder = asset.type === "audio" ? "music" : "templates";
				const result = await uploadImageFn({
					data: {
						fileData: asset.dataUrl,
						folder,
						originalName: asset.filename,
					},
				});

				if (result?.url) {
					if (asset.type === "audio") {
						await addMusic({
							data: {
								id: createId("mus"),
								title: asset.filename
									.replace(/\.[^/.]+$/, "")
									.replace(/[-_]/g, " "),
								artist: "Template Audio",
								genre: form.category,
								duration: "03:30",
								url: result.url,
							},
						});
					} else {
						await addAsset({
							data: {
								id: createId("ast"),
								name: asset.filename,
								category: asset.category,
								size: asset.size,
								url: result.url,
							},
						});
					}

					if (
						asset.category === "Thumbnail / Cover" ||
						asset.category === "Thumbnail/Cover"
					) {
						setForm((f) => ({ ...f, thumb: result.url }));
					}

					setAssets((prev) =>
						prev.map((a) =>
							a.id === asset.id
								? { ...a, uploading: false, uploaded: true, cdnUrl: result.url }
								: a,
						),
					);
				}
			} catch {
				setAssets((prev) =>
					prev.map((a) => (a.id === asset.id ? { ...a, uploading: false } : a)),
				);
			}

			setProgress((p) => ({ ...p, done: i + 1 }));
		}

		setProgress((p) => ({ ...p, active: false }));
		toast.success(
			"Semua aset terpilih berhasil diunggah ke Cloud Storage & Galeri Aset!",
		);
	};

	const submitTemplate = async () => {
		if (!form.name.trim()) {
			toast.error("Nama template wajib diisi.");
			return;
		}
		setFormLoading(true);
		try {
			let finalThumb = form.thumb.trim();
			if (finalThumb.startsWith("data:")) {
				toast.info("Mengunggah cover template ke Cloud Storage...");
				try {
					const uploadRes = await uploadImageFn({
						data: {
							fileData: finalThumb,
							folder: "templates",
							originalName: `${form.slug || "template"}-cover.webp`,
						},
					});
					if (uploadRes?.url) {
						finalThumb = uploadRes.url;
						setForm((p) => ({ ...p, thumb: uploadRes.url }));
					}
				} catch (upErr) {
					console.error("Cover upload fallback failed:", upErr);
				}
			}

			if (finalThumb.startsWith("data:")) {
				finalThumb = "https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/tpl-traditional.jpg";
			}

			await addTemplate({
				data: {
					id: createId("tpl"),
					name: form.name.trim(),
					slug:
						form.slug.trim() ||
						form.name
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, "-")
							.replace(/^-+|-+$/g, ""),
					tag: form.tag.trim() || "Adat Nusantara",
					category: form.category.trim() || "Tradisional",
					theme: form.theme.trim() || "Emas & Maroon",
					thumb:
						finalThumb ||
						"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/tpl-traditional.jpg",
				},
			});
			toast.success("Template berhasil disimpan dan dipublikasikan!");
			navigate({ to: "/admin/template" });
		} catch (err: any) {
			console.error("Error submitTemplate:", err);
			toast.error(err?.message || "Gagal menyimpan template.");
		} finally {
			setFormLoading(false);
		}
	};

	const selectedAssets = assets.filter((a) => a.selected);
	const percentage =
		progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-12">
			<PageHead title="Upload Template Baru" back="/admin/template" />

			<div
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setIsDragging(false);
					const droppedFiles = Array.from(e.dataTransfer.files);
					if (droppedFiles.length > 0) processFiles(droppedFiles);
				}}
				onClick={() => fileInputRef.current?.click()}
				className={[
					"relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
					isDragging
						? "border-primary bg-primary/10 scale-[1.01]"
						: "border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04]",
				].join(" ")}
			>
				<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/10">
					<FileZip weight="duotone" className="size-7" />
				</div>
				<div>
					<p className="text-sm font-semibold text-foreground">
						Tarik & Lepas Berkas ZIP Template atau File Aset
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Otomatis mengekstrak gambar (.png, .jpg, .webp, .svg) dan musik
						(.mp3, .wav, .m4a) langsung ke Cloud Storage
					</p>
				</div>
				<span className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
					Pilih Berkas ZIP / Aset
				</span>
				<input
					ref={fileInputRef}
					type="file"
					accept=".zip,image/*,audio/*"
					multiple
					className="hidden"
					onChange={(e) => {
						const selectedFiles = Array.from(e.target.files ?? []);
						if (selectedFiles.length > 0) processFiles(selectedFiles);
						e.target.value = "";
					}}
				/>
			</div>

			{assets.length > 0 && (
				<div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
						<div className="flex items-center gap-2">
							<Sparkle weight="duotone" className="size-5 text-primary" />
							<span className="text-sm font-bold text-foreground">
								Aset Terekstrak ({assets.length} Berkas)
							</span>
							<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
								{selectedAssets.length} Dipilih
							</span>
						</div>

						<div className="flex items-center gap-2">
							{assets.some((a) => a.uploaded && a.cdnUrl) && (
								<>
									<button
										type="button"
										onClick={() => {
											const allUrls = assets
												.filter((a) => a.uploaded && a.cdnUrl)
												.map((a) => `${a.filename}: ${a.cdnUrl}`)
												.join("\n");
											copyToClipboard(allUrls, "Semua Link CDN");
										}}
										className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
									>
										<Copy weight="bold" className="size-3" />
										Salin Semua CDN
									</button>
									<span className="text-white/20">|</span>
								</>
							)}
							<button
								type="button"
								onClick={() =>
									setAssets((prev) =>
										prev.map((a) => ({ ...a, selected: true })),
									)
								}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								Pilih Semua
							</button>
							<span className="text-white/20">|</span>
							<button
								type="button"
								onClick={() =>
									setAssets((prev) =>
										prev.map((a) => ({ ...a, selected: false })),
									)
								}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								Batal Pilih
							</button>
							<span className="text-white/20">|</span>
							<button
								type="button"
								onClick={() => setShowNewCategory((p) => !p)}
								className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
							>
								<Plus weight="bold" className="size-3" />
								Kategori Baru
							</button>
						</div>
					</div>

					{selectedAssets.length > 0 && (
						<div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-xs font-semibold text-primary">
									Pindahkan ({selectedAssets.length} Aset Terpilih) ke:
								</span>
								<select
									id="upload-batch-cat"
									defaultValue="Background"
									className="rounded-lg border border-primary/30 bg-zinc-900 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary"
								>
									{categories.map((c) => (
										<option key={c} value={c} className="bg-zinc-900 text-white">
											{c}
										</option>
									))}
								</select>
								<button
									type="button"
									onClick={() => {
										const el = document.getElementById(
											"upload-batch-cat",
										) as HTMLSelectElement;
										const targetCat = (el?.value || "Background") as AssetCategory;
										setAssets((prev) =>
											prev.map((a) =>
												a.selected ? { ...a, category: targetCat } : a,
											),
										);
										if (
											targetCat === "Thumbnail / Cover" ||
											targetCat === "Thumbnail/Cover"
										) {
											const first = assets.find((a) => a.selected);
											if (first) {
												setForm((f) => ({
													...f,
													thumb: first.cdnUrl || first.dataUrl,
												}));
											}
										}
										toast.success(
											`Kategori ${selectedAssets.length} aset diubah ke "${targetCat}".`,
										);
									}}
									className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
								>
									Terapkan Kategori
								</button>
							</div>
							<span className="text-[11px] text-muted-foreground">
								Pilih sebagian atau semua aset untuk mengatur kategori massal
							</span>
						</div>
					)}

					{showNewCategory && (
						<div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
							<FolderPlus
								weight="duotone"
								className="size-4 text-primary shrink-0"
							/>
							<input
								type="text"
								value={newCategoryInput}
								onChange={(e) => setNewCategoryInput(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
								placeholder="Nama kategori baru (misal: Bunga Sakura, Bingkai Gold)"
								className="min-w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
								autoFocus
							/>
							<button
								type="button"
								onClick={addCustomCategory}
								className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all"
							>
								Tambah
							</button>
						</div>
					)}

					{progress.active && (
						<div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
							<div className="flex items-center justify-between text-xs">
								<span className="flex items-center gap-1.5 text-primary font-medium">
									<span className="size-2 animate-ping rounded-full bg-primary" />
									Mengunggah ke Cloud Storage & Sinkronisasi Galeri (
									{progress.done}/{progress.total})...
								</span>
								<span className="font-mono font-bold text-primary">
									{percentage}%
								</span>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
								<div
									className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300"
									style={{ width: `${percentage}%` }}
								/>
							</div>
						</div>
					)}

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-h-[420px] overflow-y-auto pr-1">
						{assets.map((asset) => (
							<div
								key={asset.id}
								className={[
									"group relative rounded-xl border transition-all duration-200",
									asset.selected
										? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
										: "border-white/[0.06] bg-white/[0.02]",
								].join(" ")}
							>
								<button
									type="button"
									onClick={() => removeAsset(asset.id)}
									className="absolute right-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-black/60 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/80 hover:text-white"
								>
									<X weight="bold" className="size-3" />
								</button>

								<button
									type="button"
									onClick={() => toggleSelect(asset.id)}
									className="absolute left-1.5 top-1.5 z-10"
								>
									{asset.selected ? (
										<CheckSquare
											weight="fill"
											className="size-4 text-primary drop-shadow"
										/>
									) : (
										<Square weight="regular" className="size-4 text-white/40" />
									)}
								</button>

								<div className="overflow-hidden rounded-t-xl">
									{asset.type === "image" ? (
										<img
											src={asset.objectUrl || asset.cdnUrl || asset.dataUrl}
											onError={(e) => {
												if (asset.objectUrl) {
													(e.currentTarget as HTMLImageElement).src =
														asset.objectUrl;
												}
											}}
											alt={asset.filename}
											className="aspect-square w-full object-cover"
										/>
									) : (
										<div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
											<MusicNote
												weight="duotone"
												className="size-8 text-primary"
											/>
											<audio
												src={asset.objectUrl || asset.cdnUrl || asset.dataUrl}
												controls
												className="w-full px-2"
												style={{ height: 28 }}
											/>
										</div>
									)}
								</div>

								<div className="p-2 space-y-1.5">
									<p
										className="truncate text-[10px] font-medium text-foreground/80"
										title={asset.filename}
									>
										{asset.filename}
									</p>
									<p className="text-[9px] text-muted-foreground">
										{asset.size}
									</p>

									<select
										value={asset.category}
										onChange={(e) => setAssetCategory(asset.id, e.target.value)}
										className="w-full rounded-lg border border-white/10 bg-card px-1 py-1 text-[9px] text-foreground focus:outline-none focus:border-primary/40"
									>
										{categories.map((c) => (
											<option
												key={c}
												value={c}
												className="bg-zinc-900 text-white"
											>
												{c}
											</option>
										))}
									</select>

									<div className="pt-0.5 flex flex-col gap-1">
										<div className="flex items-center justify-between">
											{asset.uploaded ? (
												<span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
													<CheckCircle weight="fill" className="size-3" />
													CDN Aktif
												</span>
											) : asset.uploading ? (
												<span className="text-[9px] text-primary animate-pulse">
													Upload...
												</span>
											) : (
												<span className="text-[9px] text-white/30">Lokal</span>
											)}

											{asset.uploaded && asset.cdnUrl && (
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														copyToClipboard(asset.cdnUrl!, asset.filename);
													}}
													className="inline-flex items-center gap-1 rounded bg-white/10 hover:bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 hover:text-amber-200 transition-all cursor-pointer"
													title="Salin Link CDN"
												>
													<Copy weight="bold" className="size-2.5" />
													<span>Salin CDN</span>
												</button>
											)}
										</div>

										{asset.uploaded && asset.cdnUrl && (
											<input
												type="text"
												readOnly
												value={asset.cdnUrl}
												onClick={(e) => {
													(e.target as HTMLInputElement).select();
													copyToClipboard(asset.cdnUrl!, asset.filename);
												}}
												className="w-full rounded bg-black/40 border border-white/10 px-1.5 py-0.5 text-[8px] font-mono text-emerald-300 truncate cursor-pointer focus:outline-none"
												title="Klik untuk salin URL CDN"
											/>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="pt-2 flex justify-end">
						<button
							type="button"
							onClick={uploadSelectedAssets}
							disabled={
								progress.active ||
								selectedAssets.filter((a) => !a.uploaded).length === 0
							}
							className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
						>
							<UploadSimple weight="bold" className="size-3.5" />
							Upload ke Cloud Storage (
							{selectedAssets.filter((a) => !a.uploaded).length} Aset)
						</button>
					</div>
				</div>
			)}

			<div className="rounded-[10px] border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-4 space-y-3.5">
				<h2 className="text-xs sm:text-sm font-bold text-foreground">
					Detail Informasi Template
				</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-1">
						<label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Nama Template
						</label>
						<input
							type="text"
							placeholder="misal: Batak Horas Luxury"
							value={form.name}
							onChange={(e) => handleNameChange(e.target.value)}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Slug URL
						</label>
						<input
							type="text"
							placeholder="misal: batak-horas-luxury"
							value={form.slug}
							onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-mono"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Kategori Template
						</label>
						<select
							value={form.category}
							onChange={(e) => {
								if (e.target.value === "__custom__") {
									setIsCustomTemplateCat(true);
									setForm((p) => ({ ...p, category: "" }));
								} else {
									setIsCustomTemplateCat(false);
									setForm((p) => ({ ...p, category: e.target.value }));
								}
							}}
							className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
						>
							{templateCategoriesList.map((c) => (
								<option key={c} value={c} className="bg-zinc-900 text-white">
									{c}
								</option>
							))}
							<option
								value="__custom__"
								className="bg-zinc-900 text-amber-400 font-bold"
							>
								+ Ketik Kategori Kustom Baru…
							</option>
						</select>

						{isCustomTemplateCat && (
							<div className="pt-1.5">
								<input
									type="text"
									placeholder="Ketik nama kategori kustom baru…"
									value={form.category}
									onChange={(e) =>
										setForm((p) => ({ ...p, category: e.target.value }))
									}
									autoFocus
									className="w-full rounded-lg border border-primary/40 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
								/>
								<p className="text-[10px] text-primary/80 mt-1">
									Kategori baru ini akan otomatis tersimpan dan aktif di filter
									publik.
								</p>
							</div>
						)}
					</div>

					<div className="space-y-1">
						<label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Tagline / Badge
						</label>
						<input
							type="text"
							placeholder="Adat Nusantara"
							value={form.tag}
							onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Tema Warna
						</label>
						<input
							type="text"
							placeholder="Emas & Maroon"
							value={form.theme}
							onChange={(e) =>
								setForm((p) => ({ ...p, theme: e.target.value }))
							}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							URL Thumbnail Cover
						</label>
						<input
							type="text"
							placeholder="https://..."
							value={form.thumb}
							onChange={(e) =>
								setForm((p) => ({ ...p, thumb: e.target.value }))
							}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
						/>
					</div>
				</div>

				<div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-white/5">
					<button
						type="button"
						onClick={() => navigate({ to: "/admin/template" })}
						className="rounded-lg border border-white/10 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 transition-all"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={submitTemplate}
						disabled={formLoading}
						className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-60 transition-all"
					>
						{formLoading ? "Menyimpan…" : "Simpan & Publikasi Template"}
					</button>
				</div>
			</div>
		</div>
	);
}
