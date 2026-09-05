import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
	Plus,
	Search,
	Eye,
	Pencil,
	Trash2,
	X,
	FileText,
	ArrowLeft,
	ExternalLink,
	Check,
	ChevronLeft,
	ChevronRight,
	SlidersHorizontal,
	BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getShortPagination } from "@/lib/pagination";
import blogData from "@/data/blog-manifest.json";

export const Route = createFileRoute("/admin/berita")({
	component: BeritaPage,
});

type ArticleStatus = "published" | "draft";

type Article = {
	id: string;
	slug: string;
	title: string;
	category: string;
	publishedAt: string;
	status: ArticleStatus;
	views: number;
	excerpt: string;
	author: string;
	content: string;
	thumbnail: string;
	readTime: number;
};

const CATEGORIES = [
	"Semua",
	"Pernikahan Adat Jawa",
	"Pernikahan Adat Sunda",
	"Pernikahan Adat Sumatera",
	"Pernikahan Adat Sulawesi & Kalimantan",
	"Pernikahan Adat Bali, NTT, NTB, Maluku & Papua",
	"Tradisi Tionghoa & Peranakan",
	"Akad Nikah, KUA & Upacara Agama",
	"Desain Tema Minimalis & Modern",
	"Desain Tema Mewah & Floral",
	"Desain Tema Rustic, Botanical & Outdoor",
	"Fitur Teknis Undangan Digital Web",
	"Distribusi Undangan & WhatsApp Blast",
	"Amplop Digital & Integrasi QRIS",
	"Manajemen Anggaran & Tips Hemat",
	"Manajemen Vendor Katering & Gedung",
	"Vendor MUA, Busana & Dekorasi",
	"Dokumentasi Foto, Video & WO",
	"Susunan Acara & Teks Doa Pernikahan",
	"Pantun, Puisi & Kata Mutiara",
	"Mental, Kesehatan Pranikah & Bulan Madu",
];

const INITIAL_ARTICLES: Article[] = (blogData as any[]).map((item, index) => ({
	id: item.slug || String(index + 1),
	slug: item.slug,
	title: item.title,
	category: item.category || "Panduan",
	publishedAt: item.date || "2026-08-20",
	status: "published" as ArticleStatus,
	views: 1200 + ((index * 37) % 4800),
	excerpt: item.summary || "",
	author: "Tim Simfoni Cinta",
	content: "",
	thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
	readTime: item.readTime || 5,
}));

function formatDate(dateStr: string) {
	try {
		return new Date(dateStr).toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	} catch {
		return dateStr;
	}
}

function formatViews(n: number) {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(n);
}

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const ITEMS_PER_PAGE = 20;

function BeritaPage() {
	const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
	const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
	const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
	const [deleteConfirmArticle, setDeleteConfirmArticle] = useState<Article | null>(null);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const [search, setSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState("Semua");
	const [currentPage, setCurrentPage] = useState(1);

	const [form, setForm] = useState<{
		title: string;
		slug: string;
		category: string;
		publishedAt: string;
		status: ArticleStatus;
		excerpt: string;
		author: string;
		content: string;
		thumbnail: string;
		readTime: number;
	}>({
		title: "",
		slug: "",
		category: "Pernikahan Adat Jawa",
		publishedAt: new Date().toISOString().split("T")[0],
		status: "published",
		excerpt: "",
		author: "Tim Simfoni Cinta",
		content: "",
		thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
		readTime: 5,
	});

	function showToast(msg: string) {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(null), 3000);
	}

	function handleStartCreate() {
		setForm({
			title: "",
			slug: "",
			category: "Pernikahan Adat Jawa",
			publishedAt: new Date().toISOString().split("T")[0],
			status: "published",
			excerpt: "",
			author: "Tim Simfoni Cinta",
			content: "",
			thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
			readTime: 5,
		});
		setSelectedArticle(null);
		setViewMode("create");
	}

	function handleStartEdit(article: Article) {
		setForm({
			title: article.title,
			slug: article.slug,
			category: article.category,
			publishedAt: article.publishedAt,
			status: article.status,
			excerpt: article.excerpt,
			author: article.author,
			content: article.content || "",
			thumbnail: article.thumbnail,
			readTime: article.readTime,
		});
		setSelectedArticle(article);
		setViewMode("edit");
	}

	function handleTitleChange(val: string) {
		setForm((f) => ({
			...f,
			title: val,
			slug: viewMode === "create" ? slugify(val) : f.slug,
		}));
	}

	function handleSaveForm(statusOverride?: ArticleStatus) {
		if (!form.title.trim()) {
			alert("Judul artikel wajib diisi!");
			return;
		}

		const finalStatus = statusOverride || form.status;
		const finalSlug = form.slug.trim() || slugify(form.title);

		if (viewMode === "create") {
			const newArticle: Article = {
				id: finalSlug,
				slug: finalSlug,
				title: form.title.trim(),
				category: form.category,
				publishedAt: form.publishedAt,
				status: finalStatus,
				views: 0,
				excerpt: form.excerpt.trim(),
				author: form.author.trim() || "Tim Simfoni Cinta",
				content: form.content.trim(),
				thumbnail: form.thumbnail.trim(),
				readTime: Number(form.readTime) || 5,
			};
			setArticles((prev) => [newArticle, ...prev]);
			showToast("Artikel berhasil dibuat dan ditambahkan ke daftar!");
		} else if (viewMode === "edit" && selectedArticle) {
			setArticles((prev) =>
				prev.map((a) =>
					a.id === selectedArticle.id
						? {
								...a,
								title: form.title.trim(),
								slug: finalSlug,
								category: form.category,
								publishedAt: form.publishedAt,
								status: finalStatus,
								excerpt: form.excerpt.trim(),
								author: form.author.trim() || "Tim Simfoni Cinta",
								content: form.content.trim(),
								thumbnail: form.thumbnail.trim(),
								readTime: Number(form.readTime) || 5,
							}
						: a,
				),
			);
			showToast("Perubahan artikel berhasil disimpan!");
		}

		setViewMode("list");
		setSelectedArticle(null);
	}

	function handleDeleteConfirm() {
		if (!deleteConfirmArticle) return;
		setArticles((prev) => prev.filter((a) => a.id !== deleteConfirmArticle.id));
		showToast(`Artikel "${deleteConfirmArticle.title.slice(0, 30)}..." berhasil dihapus.`);
		setDeleteConfirmArticle(null);
	}

	const filtered = useMemo(() => {
		return articles.filter((a) => {
			const matchSearch =
				!search.trim() ||
				a.title.toLowerCase().includes(search.toLowerCase()) ||
				a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
				a.slug.toLowerCase().includes(search.toLowerCase());
			const matchCategory =
				activeCategory === "Semua" || a.category === activeCategory;
			return matchSearch && matchCategory;
		});
	}, [articles, search, activeCategory]);

	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
	const safePage = Math.min(Math.max(currentPage, 1), totalPages);

	const paginatedArticles = useMemo(() => {
		const start = (safePage - 1) * ITEMS_PER_PAGE;
		return filtered.slice(start, start + ITEMS_PER_PAGE);
	}, [filtered, safePage]);

	const totalPublished = useMemo(() => articles.filter((a) => a.status === "published").length, [articles]);
	const totalDraft = useMemo(() => articles.filter((a) => a.status === "draft").length, [articles]);
	const totalViews = useMemo(() => articles.reduce((sum, a) => sum + a.views, 0), [articles]);

	if (viewMode === "create" || viewMode === "edit") {
		return (
			<div className="space-y-6 pb-16">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-4">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setViewMode("list")}
							className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
							title="Kembali ke Daftar"
						>
							<ArrowLeft className="size-4" />
						</button>
						<div>
							<h1 className="text-xl font-bold text-white">
								{viewMode === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
							</h1>
							<p className="text-xs text-white/40">
								{viewMode === "create"
									? "Buat artikel panduan pernikahan baru yang komprehensif"
									: `Mengedit artikel: ${selectedArticle?.title}`}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setViewMode("list")}
							className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
						>
							Batal
						</button>
						<button
							type="button"
							onClick={() => handleSaveForm("draft")}
							className="rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2.5 text-xs font-semibold text-[#e8c98a] hover:bg-[#c9a96e]/20 transition-colors"
						>
							Simpan Draft
						</button>
						<button
							type="button"
							onClick={() => handleSaveForm("published")}
							className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a07840] px-5 py-2.5 text-xs font-bold text-[#0d0d0f] hover:from-[#e8c98a] hover:to-[#c9a96e] active:scale-95 transition-all shadow-md shadow-[#c9a96e]/20"
						>
							<Check className="size-3.5" />
							Publikasikan Artikel
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-4">
						<div className="rounded-2xl border border-white/8 bg-white/4 p-5 space-y-4">
							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Judul Artikel <span className="text-rose-400">*</span>
								</label>
								<input
									type="text"
									value={form.title}
									onChange={(e) => handleTitleChange(e.target.value)}
									placeholder="Contoh: Tata Upacara Adat Jawa Lengkap dari Siraman hingga Panggih..."
									className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-white placeholder:text-white/30 focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									URL Slug
								</label>
								<div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50">
									<span className="shrink-0 text-white/30 mr-1 font-mono">/berita/</span>
									<input
										type="text"
										value={form.slug}
										onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
										placeholder="slug-artikel-otomatis"
										className="w-full bg-transparent text-white font-mono placeholder:text-white/30 focus:outline-none"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Ringkasan / Excerpt
								</label>
								<textarea
									value={form.excerpt}
									onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
									rows={3}
									placeholder="Ringkasan singkat artikel untuk preview cuplikan kartu dan meta description Google..."
									className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors leading-relaxed"
								/>
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<label className="text-xs font-semibold text-white/70">
										Konten Markdown
									</label>
									<span className="text-[10px] text-white/40 font-mono">
										{form.content ? `${form.content.split("\n").length} baris` : "0 baris"}
									</span>
								</div>
								<textarea
									value={form.content}
									onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
									rows={16}
									placeholder="# Judul Artikel&#10;&#10;Tulis isi artikel lengkap format Markdown di sini..."
									className="w-full font-mono text-xs leading-relaxed rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white/90 placeholder:text-white/20 focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="rounded-2xl border border-white/8 bg-white/4 p-5 space-y-4">
							<h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
								Pengaturan Publikasi
							</h2>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Kategori
								</label>
								<select
									value={form.category}
									onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
									className="w-full rounded-xl border border-white/10 bg-[#141416] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								>
									{CATEGORIES.filter((c) => c !== "Semua").map((c) => (
										<option key={c} value={c} className="bg-[#141416] text-white">
											{c}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Status
								</label>
								<select
									value={form.status}
									onChange={(e) =>
										setForm((f) => ({ ...f, status: e.target.value as ArticleStatus }))
									}
									className="w-full rounded-xl border border-white/10 bg-[#141416] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								>
									<option value="published">Published</option>
									<option value="draft">Draft</option>
								</select>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Tanggal Rilis
								</label>
								<input
									type="date"
									value={form.publishedAt}
									onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Estimasi Waktu Baca (Menit)
								</label>
								<input
									type="number"
									min={1}
									max={60}
									value={form.readTime}
									onChange={(e) => setForm((f) => ({ ...f, readTime: Number(e.target.value) || 5 }))}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									Penulis
								</label>
								<input
									type="text"
									value={form.author}
									onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								/>
							</div>
						</div>

						<div className="rounded-2xl border border-white/8 bg-white/4 p-5 space-y-4">
							<h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
								Thumbnail Cover
							</h2>
							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-white/70">
									URL Gambar
								</label>
								<input
									type="text"
									value={form.thumbnail}
									onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
									placeholder="https://..."
									className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
								/>
							</div>
							{form.thumbnail && (
								<div className="overflow-hidden rounded-xl border border-white/10 aspect-[16/9] bg-black/40">
									<img
										src={form.thumbnail}
										alt="Preview cover"
										className="w-full h-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												"https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
										}}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-16">
			{toastMsg && (
				<div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#c9a96e]/40 bg-[#161619] px-4 py-3 text-xs font-semibold text-[#e8c98a] shadow-xl shadow-black/50">
					<Check className="size-4 text-[#c9a96e]" />
					{toastMsg}
				</div>
			)}

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-bold text-white">
						Daftar Artikel & Berita ({articles.length})
					</h1>
					<p className="mt-0.5 text-xs text-white/40">
						Kelola seluruh konten panduan dan tips pernikahan untuk portal Simfoni Cinta.
					</p>
				</div>
				<button
					type="button"
					onClick={handleStartCreate}
					className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a07840] px-4 py-2.5 text-xs font-bold text-[#0d0d0f] hover:from-[#e8c98a] hover:to-[#c9a96e] active:scale-95 transition-all shadow-lg shadow-[#c9a96e]/20 self-start sm:self-auto"
				>
					<Plus className="size-4" aria-hidden="true" />
					Tulis Berita Baru
				</button>
			</div>

			<div className="grid grid-cols-4 gap-3">
				{[
					{ label: "Total Artikel", value: articles.length, color: "text-white" },
					{ label: "Published", value: totalPublished, color: "text-emerald-400" },
					{ label: "Draft", value: totalDraft, color: "text-amber-400" },
					{ label: "Total Views", value: formatViews(totalViews), color: "text-[#c9a96e]" },
				].map((s) => (
					<div
						key={s.label}
						className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center"
					>
						<p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
						<p className="text-[10px] font-medium text-white/40 mt-0.5">
							{s.label}
						</p>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search
							className="absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-white/30"
							aria-hidden="true"
						/>
						<input
							type="search"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Cari judul, kata kunci, atau slug artikel..."
							className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-white/30 focus:border-[#c9a96e]/50 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 transition-colors"
						/>
						{search && (
							<button
								type="button"
								onClick={() => {
									setSearch("");
									setCurrentPage(1);
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
							>
								<X className="size-3.5" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-2">
						<SlidersHorizontal className="size-3.5 text-white/40 shrink-0" />
						<select
							value={activeCategory}
							onChange={(e) => {
								setActiveCategory(e.target.value);
								setCurrentPage(1);
							}}
							className="rounded-xl border border-white/10 bg-[#141416] px-3 py-2.5 text-xs text-white font-medium focus:border-[#c9a96e]/50 focus:outline-none"
						>
							{CATEGORIES.map((c) => (
								<option key={c} value={c} className="bg-[#141416] text-white">
									{c}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex items-center justify-between text-xs text-white/40 px-1">
					<span>
						Menampilkan <strong className="text-white/80">{filtered.length}</strong> artikel
						{activeCategory !== "Semua" && ` dalam kategori "${activeCategory}"`}
					</span>
					<span>
						Halaman {safePage} dari {totalPages}
					</span>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-white/20">
							<FileText className="size-6" />
						</div>
						<p className="text-sm font-semibold text-white/40">
							Tidak ada artikel ditemukan
						</p>
						<p className="text-xs text-white/25">
							Coba ubah kata kunci atau pilih kategori lain
						</p>
					</div>
				) : (
					<div className="divide-y divide-white/8">
						<div className="hidden grid-cols-[1fr_170px_110px_90px_80px_110px] gap-4 px-5 py-3 sm:grid bg-white/2">
							{["Judul Artikel", "Kategori", "Tanggal", "Status", "Views", "Aksi"].map(
								(h) => (
									<span
										key={h}
										className="text-[10px] font-bold uppercase tracking-wider text-white/30"
									>
										{h}
									</span>
								),
							)}
						</div>
						{paginatedArticles.map((article) => (
							<div
								key={article.id}
								className="group flex flex-col gap-3 px-5 py-3.5 transition-colors hover:bg-white/3 sm:grid sm:grid-cols-[1fr_170px_110px_90px_80px_110px] sm:items-center sm:gap-4"
							>
								<div className="min-w-0">
									<p className="truncate text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
										{article.title}
									</p>
									<p className="mt-0.5 truncate text-[11px] text-white/30 font-mono">
										/berita/{article.slug}
									</p>
								</div>

								<div className="min-w-0">
									<span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium bg-white/5 text-white/70 border border-white/10 truncate max-w-full">
										<BookOpen className="size-2.5 shrink-0" />
										<span className="truncate">{article.category}</span>
									</span>
								</div>

								<span className="text-[11px] text-white/40">
									{formatDate(article.publishedAt)}
								</span>

								<div>
									<span
										className={cn(
											"inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1",
											article.status === "published"
												? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
												: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
										)}
									>
										{article.status === "published" ? "Published" : "Draft"}
									</span>
								</div>

								<span className="text-[11px] text-white/40 font-mono">
									{formatViews(article.views)}
								</span>

								<div className="flex items-center gap-1.5">
									<a
										href={`/berita/${article.slug}`}
										target="_blank"
										rel="noreferrer"
										className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-sky-500/15 hover:text-sky-400 transition-colors"
										title="Lihat di Web"
									>
										<ExternalLink className="size-3.5" />
									</a>
									<button
										type="button"
										onClick={() => handleStartEdit(article)}
										className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-[#c9a96e]/15 hover:text-[#c9a96e] transition-colors"
										title="Edit Artikel"
									>
										<Pencil className="size-3.5" />
									</button>
									<button
										type="button"
										onClick={() => setDeleteConfirmArticle(article)}
										className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
										title="Hapus Artikel"
									>
										<Trash2 className="size-3.5" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-white/8 px-4 sm:px-5 py-3 text-xs">
						<span className="text-[11px] text-white/50">
							Halaman {safePage} dari {totalPages} ({filtered.length} artikel)
						</span>
						<div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
							<button
								type="button"
								disabled={safePage <= 1}
								aria-label="Halaman sebelumnya"
								onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
								className="h-7 px-1.5 sm:px-2 flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
							>
								<ChevronLeft className="size-3.5" />
								<span className="hidden sm:inline text-[11px]">Prev</span>
							</button>

							<div className="flex items-center gap-1 flex-nowrap">
								{getShortPagination(safePage, totalPages).map((pageNum) => (
									<button
										key={pageNum}
										type="button"
										onClick={() => setCurrentPage(pageNum)}
										className={cn(
											"size-7 rounded-lg text-[11px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer",
											pageNum === safePage
												? "bg-emerald-600 text-white shadow-2xs font-bold"
												: "border border-white/10 bg-white/5 text-white/70 hover:border-emerald-500/40 hover:text-white",
										)}
									>
										{pageNum}
									</button>
								))}
							</div>

							<button
								type="button"
								disabled={safePage >= totalPages}
								aria-label="Halaman selanjutnya"
								onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
								className="h-7 px-1.5 sm:px-2 flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
							>
								<span className="hidden sm:inline text-[11px]">Next</span>
								<ChevronRight className="size-3.5" />
							</button>
						</div>
					</div>
				)}
			</div>

			{deleteConfirmArticle && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
					onClick={() => setDeleteConfirmArticle(null)}
				>
					<div
						className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d0f] shadow-2xl p-6 text-center space-y-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
							<Trash2 className="size-5" />
						</div>
						<div>
							<h2 className="text-sm font-bold text-white">Hapus Artikel?</h2>
							<p className="mt-1.5 text-xs text-white/50 leading-relaxed">
								Artikel{" "}
								<span className="font-semibold text-white/70">
									"{deleteConfirmArticle.title}"
								</span>{" "}
								akan dihapus dari daftar.
							</p>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setDeleteConfirmArticle(null)}
								className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleDeleteConfirm}
								className="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white hover:bg-rose-600 active:scale-95 transition-all"
							>
								Ya, Hapus
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
