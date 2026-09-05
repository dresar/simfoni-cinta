import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import {
	ConfirmDelete,
	PageHead,
	TextInput,
} from "@/components/kit";
import { fetchTemplates } from "@/functions/templates";
import {
	removeTemplate,
	fetchTemplateCategories,
	addTemplateCategory,
	editTemplateCategory,
	removeTemplateCategory,
	editTemplate,
} from "@/functions/media";
import {
	DefaultCoverCard,
	LOCAL_COVERS,
} from "@/components/landing/sections-a";
import {
	PencilSimple,
	Trash,
	FolderPlus,
	Plus,
	FadersHorizontal,
	CaretDown,
	MagnifyingGlass,
	Check,
	DotsThreeVertical,
	Folder,
	Database,
	Tag,
	CaretLeft,
	CaretRight,
	X,
	Star,
	ArrowUp,
	Flame,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getShortPagination } from "@/lib/pagination";

export const Route = createFileRoute("/admin/template/")({
	loader: async () => {
		const [templatesRes, categories] = await Promise.all([
			fetchTemplates({ data: { limit: 500 } }),
			fetchTemplateCategories(),
		]);
		return { templates: templatesRes?.items || [], categories };
	},
	head: () => ({
		meta: [
			{ title: "Katalog Template Master — Simfoni Cinta" },
			{
				name: "description",
				content: "Kelola status aktif, kategori adat/modern, dan inspeksi folder aset template.",
			},
		],
	}),
	component: TemplatePage,
});

interface CategoryItem {
	id: string;
	name: string;
	slug: string;
	description?: string;
	order?: number;
}

function CategoryManagerModal({
	open,
	onClose,
	categories,
	templates,
}: {
	open: boolean;
	onClose: () => void;
	categories: CategoryItem[];
	templates: any[];
}) {
	const router = useRouter();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState({ name: "", slug: "", description: "" });
	const [saving, setSaving] = useState(false);
	const [deletePending, setDeletePending] = useState<string | null>(null);

	if (!open) return null;

	const handleStartAdd = () => {
		setEditingId("new");
		setForm({ name: "", slug: "", description: "" });
	};

	const handleStartEdit = (cat: CategoryItem) => {
		setEditingId(cat.id);
		setForm({
			name: cat.name,
			slug: cat.slug,
			description: cat.description || "",
		});
	};

	const handleSave = async () => {
		if (!form.name.trim()) {
			toast.error("Nama kategori wajib diisi.");
			return;
		}
		const slug =
			form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-");
		setSaving(true);

		try {
			if (editingId === "new") {
				await addTemplateCategory({
					data: {
						id: `cat-${Date.now()}`,
						name: form.name.trim(),
						slug,
						description: form.description.trim(),
						order: categories.length + 1,
						createdAt: new Date().toISOString(),
					},
				});
				toast.success(`Kategori "${form.name}" berhasil ditambahkan.`);
			} else if (editingId) {
				await editTemplateCategory({
					data: {
						id: editingId,
						name: form.name.trim(),
						slug,
						description: form.description.trim(),
					},
				});
				toast.success("Kategori berhasil diperbarui.");
			}
			setEditingId(null);
			setForm({ name: "", slug: "", description: "" });
			router.invalidate();
		} catch (e: any) {
			toast.error(e.message || "Gagal menyimpan kategori.");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await removeTemplateCategory({ data: id });
			toast.success("Kategori berhasil dihapus.");
			setDeletePending(null);
			router.invalidate();
		} catch (e: any) {
			toast.error(e.message || "Gagal menghapus kategori.");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-card border border-border w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between border-b border-border pb-3">
					<div>
						<h3 className="font-bold text-base text-foreground">
							Kelola Kategori Template
						</h3>
						<p className="text-xs text-muted-foreground">
							Tambah, ubah, atau hapus kategori untuk katalog template.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					>
						✕
					</button>
				</div>

				{editingId ? (
					<div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-primary">
								{editingId === "new" ? "Tambah Kategori Baru" : "Edit Kategori"}
							</span>
							<button
								type="button"
								onClick={() => setEditingId(null)}
								className="text-xs text-muted-foreground hover:text-foreground"
							>
								Batal
							</button>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="text-[11px] font-medium text-muted-foreground block mb-1">
									Nama Kategori *
								</label>
								<TextInput
									placeholder="cth: Adat Batak & Melayu"
									value={form.name}
									onChange={(e) => {
										const name = e.target.value;
										setForm({
											...form,
											name,
											slug:
												editingId === "new"
													? name.toLowerCase().replace(/\s+/g, "-")
													: form.slug,
										});
									}}
								/>
							</div>
							<div>
								<label className="text-[11px] font-medium text-muted-foreground block mb-1">
									Slug URL
								</label>
								<TextInput
									placeholder="cth: adat-batak-melayu"
									value={form.slug}
									onChange={(e) =>
										setForm({
											...form,
											slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
										})
									}
								/>
							</div>
						</div>
						<div>
							<label className="text-[11px] font-medium text-muted-foreground block mb-1">
								Deskripsi / Konsep
							</label>
							<TextInput
								placeholder="cth: Nuansa ornamen etnik nusantara autentik"
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-1">
							<button
								type="button"
								onClick={() => setEditingId(null)}
								className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted cursor-pointer"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleSave}
								disabled={saving}
								className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md transition-all cursor-pointer"
							>
								{saving ? "Menyimpan…" : "Simpan Kategori"}
							</button>
						</div>
					</div>
				) : (
					<div className="flex justify-end shrink-0">
						<button
							type="button"
							onClick={handleStartAdd}
							className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
						>
							<Plus weight="bold" className="size-3.5" />
							Tambah Kategori Baru
						</button>
					</div>
				)}

				<div className="flex-1 overflow-y-auto space-y-2 pr-1">
					{categories.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground text-xs">
							Belum ada kategori yang dibuat.
						</div>
					) : (
						categories.map((c) => {
							const usageCount = templates.filter(
								(t) => t.category === c.name,
							).length;
							return (
								<div
									key={c.id}
									className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card/60 hover:bg-secondary/30 transition-all"
								>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<Tag
												weight="duotone"
												className="size-4 text-primary shrink-0"
											/>
											<span className="font-semibold text-sm text-foreground truncate">
												{c.name}
											</span>
											<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
												{usageCount} template
											</span>
										</div>
										{c.description && (
											<p className="text-xs text-muted-foreground mt-0.5 truncate pl-6">
												{c.description}
											</p>
										)}
									</div>
									<div className="flex items-center gap-1.5 shrink-0">
										<button
											type="button"
											onClick={() => handleStartEdit(c)}
											className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
											title="Edit Kategori"
										>
											<PencilSimple
												weight="duotone"
												className="size-3.5 text-primary"
											/>
										</button>
										<button
											type="button"
											onClick={() => setDeletePending(c.id)}
											className="p-2 rounded-lg border border-destructive/20 hover:bg-destructive/15 text-destructive transition-all cursor-pointer"
											title="Hapus Kategori"
										>
											<Trash weight="duotone" className="size-3.5" />
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>

				<div className="border-t border-border pt-3 flex justify-between items-center text-xs text-muted-foreground">
					<span>Total {categories.length} kategori aktif</span>
					<button
						type="button"
						onClick={onClose}
						className="px-5 py-2 rounded-lg bg-secondary text-foreground font-semibold hover:bg-secondary/80 cursor-pointer"
					>
						Tutup
					</button>
				</div>
			</div>

			<ConfirmDelete
				open={deletePending !== null}
				onCancel={() => setDeletePending(null)}
				onConfirm={() => deletePending && handleDelete(deletePending)}
			/>
		</div>
	);
}

function AdminTemplateCard({
	item,
	onDelete,
	onToggleStatus,
	onPromote,
}: {
	item: any;
	onDelete: (id: string) => void;
	onToggleStatus: (id: string, currentStatus: boolean) => void;
	onPromote: (template: any) => void;
}) {
	const [hasError, setHasError] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const localFallback = LOCAL_COVERS[item.slug];
	const initialSrc =
		(item.thumb && item.thumb.trim() !== "" ? item.thumb : null) ||
		(item.image && item.image.trim() !== "" ? item.image : null) ||
		localFallback;

	const isActive = item.isActive !== undefined ? item.isActive : (item.status === "active" || item.status === true || !item.status);
	const tier = item.tier || "Pro";
	const sortOrder = item.sortOrder ?? 999;
	const isTopRank = sortOrder <= 3;

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md relative">
			<div className="relative aspect-square w-full overflow-hidden block bg-muted select-none">
				<a
					href={`/demo/${item.slug}`}
					target="_blank"
					rel="noreferrer"
					className="block h-full w-full cursor-pointer"
				>
					{!initialSrc || hasError ? (
						<DefaultCoverCard name={item.name} category={item.category} />
					) : (
						<img
							src={initialSrc}
							width={600}
							height={600}
							loading="lazy"
							alt={`Preview template undangan ${item.name}`}
							onError={() => setHasError(true)}
							className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
						/>
					)}
				</a>

				<div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none">
					<span className="px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold shadow-sm border bg-black/70 text-amber-400 border-amber-500/30 font-mono tracking-wider">
						#{String(item.id || item.sortOrder || 1).padStart(3, "0")}
					</span>
				</div>

				<div className="absolute top-2 right-2 flex gap-1.5 pointer-events-none">
					<span className={`px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold shadow-sm border ${
						tier === "Premium"
							? "bg-amber-500/95 text-white border-amber-600/50"
							: tier === "Pro"
							? "bg-blue-500/95 text-white border-blue-600/50"
							: "bg-emerald-500/95 text-white border-emerald-600/50"
					}`}>
						{tier}
					</span>
				</div>

				<div className="absolute bottom-2 left-2">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onToggleStatus(item.id, isActive);
						}}
						className={`px-2.5 py-1 rounded-md backdrop-blur-sm text-[10px] font-bold shadow-sm border transition-all cursor-pointer ${
							isActive
								? "bg-emerald-500/95 text-white border-emerald-600/50 hover:bg-emerald-600/95"
								: "bg-slate-400/95 text-white border-slate-500/50 hover:bg-slate-500/95"
						}`}
					>
						{isActive ? "Aktif" : "Nonaktif"}
					</button>
				</div>
			</div>

			<div className="flex flex-1 flex-col p-2.5 sm:p-3 justify-between">
				<div>
					<span className="text-[11px] text-slate-500 dark:text-muted-foreground font-normal truncate block">
						{item.category || "Wedding"}
					</span>
					<h2 className="font-sans text-[13px] sm:text-[14px] font-bold text-slate-900 dark:text-white truncate mt-0.5">
						{item.name}
					</h2>
				</div>

				<div className="mt-2.5 flex items-center gap-1.5 sm:gap-2">
					<a
						href={`/demo/${item.slug}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 h-8 flex items-center justify-center rounded-[6px] bg-[#cbd5e1] hover:bg-[#94a3b8]/70 dark:bg-slate-700 dark:hover:bg-slate-600 text-[11px] sm:text-[12px] font-semibold text-slate-900 dark:text-white transition-colors text-center cursor-pointer shadow-2xs"
					>
						Demo
					</a>

					<button
						type="button"
						onClick={() => onPromote(item)}
						className="size-8 sm:w-auto sm:px-2.5 h-8 flex items-center justify-center gap-1 rounded-[6px] border border-amber-600/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] sm:text-[12px] font-semibold transition-colors text-center cursor-pointer shadow-2xs shrink-0"
						title={`Nomor Urut #${String(item.id || item.sortOrder || 1).padStart(3, "0")} — Klik untuk jadikan No. 001`}
						aria-label={`Nomor Urut ${item.id}`}
					>
						<ArrowUp className="size-3.5" weight="bold" />
						<span className="hidden sm:inline font-mono">#{String(item.id || item.sortOrder || 1).padStart(3, "0")}</span>
					</button>

					<div className="relative" ref={menuRef}>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
							className="size-8 rounded-[6px] bg-[#cbd5e1] hover:bg-[#94a3b8]/70 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white flex items-center justify-center border border-border/40 transition-all cursor-pointer shrink-0"
							aria-label="Menu Aksi Template"
						>
							<DotsThreeVertical weight="bold" className="size-3.5" />
						</button>

						{menuOpen && (
							<div className="absolute right-0 bottom-full mb-1.5 w-44 rounded-lg border border-white/10 bg-[#1a1d24] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
								<button
									type="button"
									onClick={() => {
										setMenuOpen(false);
										onPromote(item);
									}}
									className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors text-left text-amber-400 hover:bg-amber-400/10 cursor-pointer"
								>
									<Flame weight="duotone" className="size-3.5 text-amber-400" />
									<span>Jadikan Terlaris (No. 1)</span>
								</button>

								<Link
									to="/admin/deteksi-aset"
									search={{ template: item.slug }}
									onClick={() => setMenuOpen(false)}
									className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors text-left text-white/80 hover:bg-white/10 cursor-pointer"
								>
									<Folder weight="duotone" className="size-3.5 text-emerald-400" />
									<span>Deteksi Aset</span>
								</Link>

								<Link
									to="/admin/template/$id"
									params={{ id: item.id }}
									onClick={() => setMenuOpen(false)}
									className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors text-left text-white/80 hover:bg-white/10 cursor-pointer"
								>
									<PencilSimple
										weight="duotone"
										className="size-3.5 text-sky-400"
									/>
									<span>Edit & Urutan</span>
								</Link>

								<div className="my-1 h-px bg-white/10" />

								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setMenuOpen(false);
										onDelete(item.id);
									}}
									className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors text-left cursor-pointer text-red-400 hover:bg-red-500/10"
								>
									<Trash weight="duotone" className="size-3.5" />
									<span>Hapus</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</article>
	);
}

const ITEMS_PER_PAGE = 32;

function TemplatePage() {
	const { templates, categories: dbCategories } = Route.useLoaderData();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("Semua Tema");
	const [page, setPage] = useState(1);
	const [pending, setPending] = useState<string | null>(null);
	const [openCatManager, setOpenCatManager] = useState(false);
	const [openFilter, setOpenFilter] = useState(false);
	const filterRef = useRef<HTMLDivElement>(null);

	const categories = useMemo(() => {
		return [
			"Semua Tema",
			"Adat & Nusantara",
			"Floral & Botanik",
			"Modern & Minimalis",
			"Luxury & Royal",
			"Vintage & Rustic",
			"Islami & Elegan",
		];
	}, []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
				setOpenFilter(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredTemplates = useMemo(() => {
		let list = templates;

		if (activeCategory !== "Semua Tema") {
			const target = activeCategory.toLowerCase();
			list = list.filter((t: any) => {
				const cat = (t.categoryKey || t.category || "").toLowerCase();
				if (
					target.includes("adat") &&
					(cat.includes("adat") ||
						cat.includes("tradisional") ||
						cat.includes("nusantara") ||
						cat.includes("batak") ||
						cat.includes("jawa") ||
						cat.includes("melayu") ||
						cat.includes("sunda") ||
						cat.includes("minang") ||
						cat.includes("bali") ||
						cat.includes("bugis") ||
						cat.includes("aceh") ||
						cat.includes("toraja") ||
						cat.includes("palembang") ||
						cat.includes("lampung"))
				)
					return true;
				if (
					target.includes("floral") &&
					(cat.includes("floral") ||
						cat.includes("sage") ||
						cat.includes("botanical") ||
						cat.includes("botanik") ||
						cat.includes("flower") ||
						cat.includes("bunga"))
				)
					return true;
				if (
					target.includes("luxury") &&
					(cat.includes("luxury") ||
						cat.includes("elegant") ||
						cat.includes("royal") ||
						cat.includes("gold") ||
						cat.includes("mewah") ||
						cat.includes("glamour"))
				)
					return true;
				if (
					target.includes("modern") &&
					(cat.includes("minimalis") ||
						cat.includes("modern") ||
						cat.includes("clean") ||
						cat.includes("minimalist") ||
						cat.includes("simpel") ||
						cat.includes("simple"))
				)
					return true;
				if (
					target.includes("vintage") &&
					(cat.includes("vintage") ||
						cat.includes("rustic") ||
						cat.includes("classic") ||
						cat.includes("klasik"))
				)
					return true;
				if (
					target.includes("islami") &&
					(cat.includes("islam") ||
						cat.includes("syukuran") ||
						cat.includes("arabesque") ||
						cat.includes("elegan") ||
						cat.includes("muslim"))
				)
					return true;
				return (
					cat === target || cat.includes(target) || target.includes(cat)
				);
			});
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(t: any) =>
					t.name.toLowerCase().includes(q) ||
					t.slug.toLowerCase().includes(q) ||
					(t.desc && t.desc.toLowerCase().includes(q)) ||
					t.category?.toLowerCase().includes(q),
			);
		}

		return [...list].sort((a: any, b: any) => {
			const orderA = Number(a.id || a.sortOrder || 9999);
			const orderB = Number(b.id || b.sortOrder || 9999);
			if (orderA !== orderB) return orderA - orderB;
			return String(a.name || a.slug).localeCompare(String(b.name || b.slug), undefined, { numeric: true });
		});
	}, [activeCategory, searchQuery, templates]);

	useEffect(() => {
		setPage(1);
	}, [activeCategory, searchQuery]);

	const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE) || 1;
	const paginatedList = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredTemplates, page]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	async function handleDelete() {
		if (!pending) return;
		await removeTemplate({ data: pending });
		setPending(null);
		toast.success("Template berhasil dihapus.");
		router.invalidate();
	}

	async function handleToggleStatus(id: string, currentStatus: boolean) {
		try {
			await editTemplate({
				data: {
					id,
					status: currentStatus ? "inactive" : "active",
				},
			});
			toast.success(`Status template berhasil diubah menjadi ${currentStatus ? "nonaktif" : "aktif"}.`);
			router.invalidate();
		} catch (e: any) {
			toast.error(e.message || "Gagal mengubah status template.");
		}
	}

	async function handlePromoteToTop(template: any) {
		toast.info(`Menaikkan ${template.name} ke urutan #001 (Terlaris)...`);
		try {
			await editTemplate({
				data: {
					id: template.id,
					sortOrder: 1,
					tag: "Terlaris",
				},
			});
			toast.success(`${template.name} berhasil dinaikkan ke nomor 001 (Terlaris)!`);
			router.invalidate();
		} catch (e: any) {
			toast.error(e.message || "Gagal mengubah urutan template.");
		}
	}

	async function handleSyncDatabase() {
		toast.info("Sinkronisasi database dimulai...");
		try {
			router.invalidate();
			toast.success("Database berhasil disinkronkan.");
		} catch (e: any) {
			toast.error(e.message || "Gagal menyinkronkan database.");
		}
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Docked Sticky Search & Filter Toolbar */}
			<div
				className="sticky top-0 z-30 -mx-4 sm:-mx-6 -mt-6 px-4 sm:px-6 py-1 bg-[#090c10]/95 backdrop-blur-md border-b border-white/10 shadow-xs"
				ref={filterRef}
			>
				<div className="max-w-4xl mx-auto flex items-stretch gap-2 sm:gap-3">
					{/* Category Filter Dropdown Trigger */}
					<div className="relative">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setOpenFilter((v) => !v);
							}}
							className="h-10 px-3.5 sm:px-4 flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 shadow-2xs transition-colors shrink-0 select-none cursor-pointer"
						>
							<FadersHorizontal className="size-4 text-emerald-400" weight="bold" />
							<span className="truncate max-w-[85px] sm:max-w-[140px]">
								{activeCategory === "Semua Tema" ? "Kategori" : activeCategory}
							</span>
							<CaretDown
								className={cn(
									"size-3 text-white/50 transition-transform duration-200",
									openFilter && "rotate-180",
								)}
								weight="bold"
							/>
						</button>

						{/* Dropdown Menu Popup */}
						{openFilter && (
							<div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl border border-white/10 bg-[#14181f] p-1.5 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
								<div className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between">
									<span>Pilih Kategori</span>
									<span className="text-[9px] font-normal lowercase">
										{categories.length} opsi
									</span>
								</div>
								<div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
									{categories.map((c) => {
										const count =
											c === "Semua Tema"
												? templates.length
												: templates.filter((t: any) => {
														const cat = (
															t.categoryKey ||
															t.category ||
															""
														).toLowerCase();
														const target = c.toLowerCase();
														if (
															target.includes("adat") &&
															(cat.includes("adat") ||
																cat.includes("tradisional") ||
																cat.includes("nusantara"))
														)
															return true;
														if (
															target.includes("floral") &&
															(cat.includes("floral") ||
																cat.includes("sage") ||
																cat.includes("botanical"))
														)
															return true;
														if (
															target.includes("luxury") &&
															(cat.includes("luxury") ||
																cat.includes("elegant") ||
																cat.includes("gold") ||
																cat.includes("mewah"))
														)
															return true;
														if (
															target.includes("minimalis") &&
															(cat.includes("minimalis") ||
																cat.includes("modern") ||
																cat.includes("clean"))
														)
															return true;
														if (
															target.includes("islamic") &&
															(cat.includes("islam") ||
																cat.includes("syukuran") ||
																cat.includes("arabesque"))
														)
															return true;
														return (
															cat === target ||
															cat.includes(target) ||
															target.includes(cat)
														);
													}).length;

										return (
											<button
												key={c}
												type="button"
												onClick={() => {
													setActiveCategory(c);
													setOpenFilter(false);
												}}
												className={cn(
													"w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer",
													activeCategory === c
														? "bg-emerald-600 text-white font-semibold"
														: "hover:bg-white/10 text-white/80",
												)}
											>
												<span>{c}</span>
												<div className="flex items-center gap-1.5">
													<span className="text-[10px] opacity-75">
														({count})
													</span>
													{activeCategory === c && (
														<Check className="size-3.5" weight="bold" />
													)}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						)}
					</div>

					{/* Search Input Box */}
					<div className="relative flex-1 flex items-stretch rounded-lg border border-white/15 bg-white/5 shadow-2xs focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
						<input
							type="text"
							placeholder="Cari tema..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="flex-1 min-w-0 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none rounded-l-lg"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="px-2 text-white/40 hover:text-white cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						)}
						<div className="px-3.5 flex items-center justify-center text-white/40 border-l border-white/10">
							<MagnifyingGlass className="size-4" weight="bold" />
						</div>
					</div>
				</div>
			</div>

			<PageHead
				title={`Katalog Template Master (${templates.length} Tema)`}
				subtitle="Kelola status aktif, kategori adat/modern, dan inspeksi folder aset template."
			>
				<Link
					to="/admin/deteksi-aset"
					className="inline-flex items-center gap-1.5 rounded-[6px] border border-emerald-700/30 bg-emerald-700/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-700/20 transition-all shadow-xs cursor-pointer"
					title="Deteksi Aset"
				>
					<Folder weight="duotone" className="size-4" />
					<span className="hidden sm:inline">Deteksi Aset</span>
				</Link>
				<button
					type="button"
					onClick={handleSyncDatabase}
					className="inline-flex items-center gap-1.5 rounded-[6px] border border-blue-700/30 bg-blue-700/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-700/20 transition-all shadow-xs cursor-pointer"
					title="Sinkronkan"
				>
					<Database weight="duotone" className="size-4" />
					<span className="hidden sm:inline">Sinkronkan</span>
				</button>
				<button
					type="button"
					onClick={() => setOpenCatManager(true)}
					className="inline-flex items-center gap-1.5 rounded-[6px] border border-primary/30 bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs cursor-pointer"
					title="Kategori"
				>
					<FolderPlus weight="duotone" className="size-4" />
					<span className="hidden sm:inline">Kategori</span>
				</button>
			</PageHead>

			{/* Grid List (4 cols desktop, 2 cols mobile) */}
			{filteredTemplates.length === 0 ? (
				<div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
					<p className="text-sm font-semibold">
						Belum ada tema
					</p>
					<button
						type="button"
						onClick={() => {
							setActiveCategory("Semua Tema");
							setSearchQuery("");
						}}
						className="mt-3 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
					>
						Reset
					</button>
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
					{paginatedList.map((item: any) => (
						<AdminTemplateCard
							key={item.id || item.slug}
							item={item}
							onDelete={(id) => setPending(id)}
							onToggleStatus={handleToggleStatus}
							onPromote={handlePromoteToTop}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mt-8 mb-6 sm:mb-2 pb-20 sm:pb-8 flex flex-col items-center justify-center gap-2">
					<div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
						<button
							type="button"
							onClick={() => handlePageChange(page - 1)}
							disabled={page <= 1}
							aria-label="Halaman sebelumnya"
							className="h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[12px] font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
						>
							<CaretLeft weight="bold" className="size-3.5" />
							<span className="hidden sm:inline">Prev</span>
						</button>

						<div className="flex items-center gap-1 flex-nowrap">
							{getShortPagination(page, totalPages).map((p) => (
								<button
									key={p}
									type="button"
									onClick={() => handlePageChange(p)}
									className={cn(
										"size-8 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer",
										page === p
											? "bg-emerald-600 text-white shadow-2xs font-bold"
											: "border border-white/10 bg-white/5 text-white/70 hover:border-emerald-500/40 hover:text-white",
									)}
								>
									{p}
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={() => handlePageChange(page + 1)}
							disabled={page >= totalPages}
							aria-label="Halaman selanjutnya"
							className="h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[12px] font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
						>
							<span className="hidden sm:inline">Next</span>
							<CaretRight weight="bold" className="size-3.5" />
						</button>
					</div>

					<p className="text-[11px] text-white/50">
						Halaman {page} dari {totalPages} ({filteredTemplates.length} tema)
					</p>
				</div>
			)}

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>

			<CategoryManagerModal
				open={openCatManager}
				onClose={() => setOpenCatManager(false)}
				categories={dbCategories}
				templates={templates}
			/>
		</div>
	);
}
