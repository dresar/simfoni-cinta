import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
	Download,
	HardDrive,
	ImageIcon,
	Pencil,
	Search,
	Upload,
	X,
	Eye,
	Trash2,
	Link as LinkIcon,
} from "lucide-react";
import {
	DotsThreeVertical,
	CheckSquare,
	Square,
	Copy,
	FolderPlus,
	CheckCircle,
} from "@phosphor-icons/react";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
	Action,
	ConfirmDelete,
	GlassCard,
	ImageUploadField,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
} from "@/components/kit";
import {
	addAsset,
	fetchAssets,
	removeAsset,
	editAsset,
	bulkEditAssetCategory,
} from "@/functions/media";
import { createId } from "@/store/appStore";
import { cn } from "@/lib/utils";

export const UNIFIED_CATEGORIES = [
	"Background",
	"Ornamen",
	"Bingkai / Frame",
	"Foto Pasangan",
	"Thumbnail / Cover",
	"Dekorasi",
	"Icon",
] as const;

const kategoriTone: Record<string, "gold" | "matcha" | "info" | "neutral"> = {
	Background: "gold",
	"Bingkai / Frame": "matcha",
	Ornamen: "info",
	"Foto Pasangan": "neutral",
	"Thumbnail / Cover": "gold",
	Dekorasi: "matcha",
	Icon: "info",
};

type Asset = {
	id: string;
	name: string;
	category: string;
	size: string;
	url: string;
};

export const Route = createFileRoute("/admin/galeri-aset/")({
	loader: () => fetchAssets(),
	head: () => ({
		meta: [{ title: "Galeri Aset — Simfoni Cinta" }],
	}),
	component: GaleriAsetPage,
});

function LightboxModal({
	asset,
	onClose,
}: {
	asset: Asset;
	onClose: () => void;
}) {
	function handleDownload() {
		const a = document.createElement("a");
		a.href = asset.url;
		a.download = asset.name;
		a.target = "_blank";
		a.rel = "noopener noreferrer";
		a.click();
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
			onClick={onClose}
		>
			<div
				className="relative flex max-h-[90vh] max-w-4xl flex-col items-center gap-4"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
					<div className="flex flex-col">
						<span className="text-sm font-semibold text-white">
							{asset.name}
						</span>
						<span className="text-xs text-white/40">
							{asset.category} · {asset.size}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={handleDownload}
							className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400"
							aria-label="Unduh aset"
						>
							<Download className="size-4" />
						</button>
						<button
							onClick={onClose}
							className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-white/30 hover:text-white"
							aria-label="Tutup lightbox"
						>
							<X className="size-4" />
						</button>
					</div>
				</div>
				<img
					src={asset.url}
					alt={asset.name}
					className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl"
				/>
			</div>
		</div>
	);
}

function UploadModal({
	onClose,
	onUploaded,
}: {
	onClose: () => void;
	onUploaded: (asset: Asset) => void;
}) {
	const [imageUrl, setImageUrl] = useState("");
	const [selected, setSelected] = useState<File | null>(null);
	const [form, setForm] = useState({
		name: "",
		category: "Background",
	});
	const [saving, setSaving] = useState(false);

	function handleImageChange(url: string) {
		setImageUrl(url);
		if (url.startsWith("blob:") && selected) {
			setForm((prev) => ({
				...prev,
				name: prev.name || selected.name.replace(/\.[^.]+$/, ""),
			}));
		}
	}

	async function handleSave() {
		if (!form.name.trim()) {
			toast.error("Nama aset wajib diisi.");
			return;
		}
		if (!imageUrl.trim()) {
			toast.error("URL CDN atau file gambar wajib diisi.");
			return;
		}
		setSaving(true);
		const asset: Asset = {
			id: createId("ast"),
			name: form.name.trim(),
			category: form.category,
			size: selected ? `${Math.round(selected.size / 1024)} KB` : "—",
			url: imageUrl,
		};
		await addAsset({ data: asset });
		setSaving(false);
		toast.success(`Aset "${asset.name}" berhasil diunggah.`);
		onUploaded(asset);
		onClose();
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
			<GlassCard className="w-full max-w-md border-white/10 p-6">
				<div className="mb-5 flex items-center justify-between">
					<h2 className="font-serif text-lg font-bold text-white">
						Unggah Aset Baru
					</h2>
					<button
						onClick={onClose}
						className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-white/20 hover:text-white"
						aria-label="Tutup modal"
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="space-y-4">
					<ImageUploadField
						label="File Aset Ornamen / Foto"
						value={imageUrl}
						onChange={handleImageChange}
						aspect="square"
					/>

					<div>
						<label className="mb-1.5 block text-xs font-semibold text-white/50">
							Nama Aset
						</label>
						<TextInput
							placeholder="cth: bunga-mawar-emas"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>

					<div>
						<label className="mb-1.5 block text-xs font-semibold text-white/50">
							Kategori
						</label>
						<SelectInput
							value={form.category}
							onChange={(e) =>
								setForm({ ...form, category: e.target.value })
							}
						>
							{UNIFIED_CATEGORIES.map((k) => (
								<option key={k} value={k}>
									{k}
								</option>
							))}
						</SelectInput>
					</div>
				</div>

				<div className="mt-5 flex justify-end gap-3">
					<Action tone="ghost" onClick={onClose}>
						Batal
					</Action>
					<Action tone="matcha" onClick={handleSave} disabled={saving}>
						{saving ? "Menyimpan…" : "Simpan Aset"}
					</Action>
				</div>
			</GlassCard>
		</div>
	);
}

function EditModal({
	asset,
	onClose,
	onSaved,
}: {
	asset: Asset;
	onClose: () => void;
	onSaved: (updated: Partial<Asset>) => void;
}) {
	const [form, setForm] = useState({
		name: asset.name,
		category: asset.category,
	});
	const [saving, setSaving] = useState(false);

	async function handleSave() {
		if (!form.name.trim()) {
			toast.error("Nama aset tidak boleh kosong.");
			return;
		}
		setSaving(true);
		try {
			await editAsset({
				data: {
					id: asset.id,
					name: form.name.trim(),
					category: form.category,
				},
			});
			onSaved({ name: form.name.trim(), category: form.category });
			toast.success("Aset berhasil diperbarui.");
			onClose();
		} catch (err: any) {
			toast.error(err?.message || "Gagal memperbarui aset.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
			<GlassCard className="w-full max-w-sm border-white/10 p-6">
				<div className="mb-5 flex items-center justify-between">
					<h2 className="font-serif text-lg font-bold text-white">Edit Aset</h2>
					<button
						onClick={onClose}
						className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-white/20 hover:text-white"
						aria-label="Tutup modal"
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="space-y-3">
					<div>
						<label className="mb-1.5 block text-xs font-semibold text-white/50">
							Nama Aset
						</label>
						<TextInput
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div>
						<label className="mb-1.5 block text-xs font-semibold text-white/50">
							Kategori
						</label>
						<SelectInput
							value={form.category}
							onChange={(e) =>
								setForm({ ...form, category: e.target.value })
							}
						>
							{UNIFIED_CATEGORIES.map((k) => (
								<option key={k} value={k}>
									{k}
								</option>
							))}
						</SelectInput>
					</div>
				</div>

				<div className="mt-5 flex justify-end gap-3">
					<Action tone="ghost" onClick={onClose}>
						Batal
					</Action>
					<Action tone="gold" onClick={handleSave} disabled={saving}>
						{saving ? "Menyimpan…" : "Simpan"}
					</Action>
				</div>
			</GlassCard>
		</div>
	);
}

type ActionItem = {
	label: string;
	icon: React.ReactNode;
	danger?: boolean;
	onClick: () => void;
};

let globalMenuCloser: (() => void) | null = null;

function ActionMenu({ items }: { items: ActionItem[] }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleDoc(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleDoc);
		return () => document.removeEventListener("mousedown", handleDoc);
	}, []);

	const closeMenu = useCallback(() => setOpen(false), []);

	const toggle = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setOpen((prev) => {
			const next = !prev;
			if (next) {
				if (globalMenuCloser) globalMenuCloser();
				globalMenuCloser = closeMenu;
			} else {
				globalMenuCloser = null;
			}
			return next;
		});
	}, [closeMenu]);

	useEffect(() => {
		return () => {
			if (globalMenuCloser === closeMenu) {
				globalMenuCloser = null;
			}
		};
	}, [closeMenu]);

	return (
		<div ref={ref} className="absolute top-2 right-2 z-30 pointer-events-auto">
			<button
				type="button"
				onClick={toggle}
				onTouchEnd={(e) => e.stopPropagation()}
				className="relative flex size-8 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-white/80 backdrop-blur-md shadow-lg transition hover:bg-black/90 hover:text-white"
				aria-label="Menu aksi"
			>
				<DotsThreeVertical className="size-4" weight="bold" />
			</button>

			{open && (
				<div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-white/10 bg-[#1a1d24] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
					{items.map((item, idx) => (
						<button
							key={idx}
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setOpen(false);
								globalMenuCloser = null;
								item.onClick();
							}}
							onTouchEnd={(e) => e.stopPropagation()}
							className={cn(
								"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors",
								item.danger
									? "text-red-400 hover:bg-red-500/10"
									: "text-white/80 hover:bg-white/10",
							)}
						>
							<span className="shrink-0">{item.icon}</span>
							<span>{item.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function AssetCard({
	item,
	selected,
	onToggleSelect,
	onEdit,
	onDelete,
	onLightbox,
}: {
	item: Asset;
	selected: boolean;
	onToggleSelect: (id: string) => void;
	onEdit: (item: Asset) => void;
	onDelete: (id: string) => void;
	onLightbox: (item: Asset) => void;
}) {
	const handleCopy = () => {
		navigator.clipboard.writeText(item.url);
		toast.success("URL aset berhasil disalin!");
	};

	const menuItems: ActionItem[] = [
		{
			label: "Salin URL",
			icon: <LinkIcon className="size-3.5" />,
			onClick: handleCopy,
		},
		{
			label: "Perbesar",
			icon: <Eye className="size-3.5 text-sky-400" />,
			onClick: () => onLightbox(item),
		},
		{
			label: "Edit Aset",
			icon: <Pencil className="size-3.5 text-amber-400" />,
			onClick: () => onEdit(item),
		},
		{
			label: "Hapus Aset",
			icon: <Trash2 className="size-3.5" />,
			danger: true,
			onClick: () => onDelete(item.id),
		},
	];

	return (
		<GlassCard
			className={cn(
				"group relative overflow-hidden rounded-lg border transition-all",
				selected
					? "border-amber-400/80 bg-amber-500/10 ring-2 ring-amber-400/30"
					: "border-white/8 hover:border-white/15",
			)}
		>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onToggleSelect(item.id);
				}}
				className="absolute left-2 top-2 z-30 flex size-7 items-center justify-center rounded-lg bg-black/70 backdrop-blur-md text-white/80 hover:text-white transition-all cursor-pointer"
				title={selected ? "Batal pilih" : "Pilih aset"}
			>
				{selected ? (
					<CheckSquare weight="fill" className="size-4 text-amber-400" />
				) : (
					<Square weight="regular" className="size-4 text-white/50" />
				)}
			</button>

			<div className="relative">
				<button
					type="button"
					className="block w-full cursor-zoom-in select-none"
					onClick={() => onLightbox(item)}
					aria-label={`Perbesar gambar ${item.name}`}
				>
					<div className="aspect-square overflow-hidden rounded-t-lg bg-white/5">
						{item.url ? (
							<img
								src={item.url}
								alt={item.name}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						) : (
							<div className="flex h-full items-center justify-center">
								<ImageIcon className="size-8 text-white/15" />
							</div>
						)}
					</div>
				</button>

				<ActionMenu items={menuItems} />
			</div>

			<div className="p-2.5 space-y-1">
				<p className="truncate text-xs font-semibold text-white" title={item.name}>
					{item.name}
				</p>
				<div className="flex items-center justify-between gap-1">
					<Pill tone={kategoriTone[item.category] ?? "neutral"}>
						{item.category}
					</Pill>
					<div className="flex items-center gap-0.5 text-[10px] text-white/30">
						<HardDrive className="size-2.5" />
						{item.size}
					</div>
				</div>
			</div>
		</GlassCard>
	);
}

function GaleriAsetPage() {
	const loaderData = Route.useLoaderData();
	const router = useRouter();

	const [items, setItems] = useState<Asset[]>((loaderData as Asset[]) ?? []);
	const [kategori, setKategori] = useState<string>("Semua");
	const [query, setQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [uploadOpen, setUploadOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Asset | null>(null);
	const [pending, setPending] = useState<string | null>(null);
	const [lightbox, setLightbox] = useState<Asset | null>(null);
	const [batchLoading, setBatchLoading] = useState(false);

	const dynamicCategories = useMemo(() => {
		const defaults = [
			"Semua",
			"Background",
			"Ornamen",
			"Bingkai / Frame",
			"Foto Pasangan",
			"Thumbnail / Cover",
			"Dekorasi",
			"Icon",
		];
		const fromItems = items.map((i) => i.category).filter(Boolean);
		return Array.from(new Set([...defaults, ...fromItems]));
	}, [items]);

	const filtered = useMemo(() => {
		return items.filter((item) => {
			const matchKategori = kategori === "Semua" || item.category === kategori;
			const matchQuery = item.name.toLowerCase().includes(query.toLowerCase());
			return matchKategori && matchQuery;
		});
	}, [items, kategori, query]);

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const selectAllFiltered = () => {
		const ids = filtered.map((f) => f.id);
		setSelectedIds(ids);
	};

	const deselectAll = () => {
		setSelectedIds([]);
	};

	async function handleBatchMove(targetCategory: string) {
		if (selectedIds.length === 0 || !targetCategory) return;
		setBatchLoading(true);
		try {
			await bulkEditAssetCategory({
				data: { ids: selectedIds, category: targetCategory },
			});
			setItems((prev) =>
				prev.map((i) =>
					selectedIds.includes(i.id) ? { ...i, category: targetCategory } : i,
				),
			);
			toast.success(
				`${selectedIds.length} aset berhasil dipindahkan ke kategori "${targetCategory}".`,
			);
			setSelectedIds([]);
		} catch (err: any) {
			toast.error(err?.message || "Gagal memindahkan aset.");
		} finally {
			setBatchLoading(false);
		}
	}

	async function handleBatchDelete() {
		if (selectedIds.length === 0) return;
		setBatchLoading(true);
		try {
			for (const id of selectedIds) {
				await removeAsset({ data: id });
			}
			setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
			toast.success(`${selectedIds.length} aset berhasil dihapus.`);
			setSelectedIds([]);
		} catch (err: any) {
			toast.error(err?.message || "Gagal menghapus beberapa aset.");
		} finally {
			setBatchLoading(false);
		}
	}

	async function handleDelete() {
		if (!pending) return;
		await removeAsset({ data: pending });
		setItems((prev) => prev.filter((i) => i.id !== pending));
		setSelectedIds((prev) => prev.filter((id) => id !== pending));
		setPending(null);
		toast.success("Aset berhasil dihapus.");
	}

	function handleUploaded(asset: Asset) {
		setItems((prev) => [asset, ...prev]);
	}

	function handleEdited(id: string, updated: Partial<Asset>) {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
		);
	}

	return (
		<>
			<PageHead title="Galeri Aset" />

			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap gap-2">
					{dynamicCategories.map((k) => (
						<button
							key={k}
							onClick={() => setKategori(k)}
							className={cn(
								"rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
								kategori === k
									? "border-amber-500/40 bg-amber-500/15 text-amber-400"
									: "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/60",
							)}
						>
							{k}
						</button>
					))}
				</div>

				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
						<input
							type="search"
							placeholder="Cari nama aset…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="h-9 w-48 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-white/25 focus:border-amber-500/40 focus:bg-white/10 focus:outline-none"
						/>
					</div>
					<Action tone="matcha" size="sm" onClick={() => setUploadOpen(true)}>
						<Upload className="size-3.5" />
						Unggah
					</Action>
				</div>
			</div>

			<div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground border-b border-white/5 pb-2.5">
				<div className="flex items-center gap-2">
					<span>
						Total: <strong className="text-white">{filtered.length}</strong> aset
					</span>
					{selectedIds.length > 0 && (
						<span className="rounded-full bg-amber-400/10 text-amber-400 px-2 py-0.5 font-bold">
							{selectedIds.length} Dipilih
						</span>
					)}
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={selectAllFiltered}
						className="hover:text-white transition-colors cursor-pointer"
					>
						Pilih Semua
					</button>
					<span className="text-white/20">|</span>
					<button
						type="button"
						onClick={deselectAll}
						className="hover:text-white transition-colors cursor-pointer"
					>
						Batal Pilih
					</button>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10">
					<ImageIcon className="size-10 text-white/15" />
					<p className="text-sm text-white/30">
						{query || kategori !== "Semua"
							? "Tidak ada aset yang cocok."
							: "Belum ada aset."}
					</p>
					{!query && kategori === "Semua" && (
						<Action tone="matcha" size="sm" onClick={() => setUploadOpen(true)}>
							<Upload className="size-3.5" />
							Unggah Pertama
						</Action>
					)}
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-20">
					{filtered.map((item) => (
						<AssetCard
							key={item.id}
							item={item}
							selected={selectedIds.includes(item.id)}
							onToggleSelect={toggleSelect}
							onEdit={(asset) => setEditTarget(asset)}
							onDelete={(id) => setPending(id)}
							onLightbox={(asset) => setLightbox(asset)}
						/>
					))}
				</div>
			)}

			{selectedIds.length > 0 && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-500/40 bg-zinc-950/95 px-5 py-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4">
					<span className="text-xs font-bold text-amber-400 whitespace-nowrap">
						{selectedIds.length} Aset Terpilih
					</span>
					<div className="hidden sm:block h-4 w-px bg-white/15" />
					<div className="flex items-center gap-2">
						<span className="text-xs text-white/80 whitespace-nowrap">
							Pindah Kategori:
						</span>
						<select
							id="galeri-batch-select"
							defaultValue="Background"
							className="rounded-lg border border-white/20 bg-zinc-900 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
						>
							{UNIFIED_CATEGORIES.map((c) => (
								<option key={c} value={c} className="bg-zinc-900 text-white">
									{c}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={() => {
								const el = document.getElementById(
									"galeri-batch-select",
								) as HTMLSelectElement;
								handleBatchMove(el?.value || "Background");
							}}
							disabled={batchLoading}
							className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50"
						>
							{batchLoading ? "Menyimpan…" : "Terapkan Massal"}
						</button>
					</div>
					<div className="hidden sm:block h-4 w-px bg-white/15" />
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleBatchDelete}
							disabled={batchLoading}
							className="rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-2.5 py-1 text-xs font-semibold text-red-300 transition-all cursor-pointer"
						>
							Hapus Terpilih
						</button>
						<button
							type="button"
							onClick={deselectAll}
							className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer px-1"
						>
							Batal
						</button>
					</div>
				</div>
			)}

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>

			{uploadOpen && (
				<UploadModal
					onClose={() => setUploadOpen(false)}
					onUploaded={handleUploaded}
				/>
			)}

			{editTarget && (
				<EditModal
					asset={editTarget}
					onClose={() => setEditTarget(null)}
					onSaved={(updated) => handleEdited(editTarget.id, updated)}
				/>
			)}

			{lightbox && (
				<LightboxModal asset={lightbox} onClose={() => setLightbox(null)} />
			)}
		</>
	);
}
