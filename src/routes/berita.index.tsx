import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
	Search,
	Clock,
	ArrowRight,
	BookOpen,
	Sparkles,
	Tag,
	ChevronLeft,
	ChevronRight,
	X,
	SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getShortPagination } from "@/lib/pagination";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections-b";
import { FloatingWa } from "@/components/landing/floating-wa";
import blogData from "@/data/blog-manifest.json";

export const Route = createFileRoute("/berita/")({
	head: () => ({
		meta: [
			{ title: "Kumpulan Berita, Panduan & Tips Pernikahan Terlengkap 2026 — Simfoni Cinta" },
			{
				name: "description",
				content:
					"300 panduan lengkap pernikahan adat nusantara, ide tema & desain undangan digital, tips hemat anggaran nikah, kata-kata doa restu, dan checklist vendor terbaik.",
			},
			{
				name: "keywords",
				content:
					"undangan digital, tips pernikahan, adat jawa, adat sunda, adat batak, anggaran nikah, rsvp online, qris pernikahan, simfoni cinta",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "Simfoni Cinta" },
			{ property: "og:title", content: "Berita & Tips Pernikahan — Simfoni Cinta" },
			{
				property: "og:description",
				content:
					"300 panduan lengkap pernikahan adat nusantara, ide tema & desain undangan digital, tips hemat anggaran nikah, kata-kata doa restu, dan checklist vendor terbaik.",
			},
			{ property: "og:url", content: "https://simfonicinta.my.id/berita" },
			{ property: "og:image", content: "https://simfonicinta.my.id/simfoni-cinta-og.jpg" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: "Berita & Tips Pernikahan — Simfoni Cinta" },
			{
				name: "twitter:description",
				content:
					"300 panduan lengkap pernikahan adat nusantara, ide tema & desain undangan digital, tips hemat anggaran nikah, kata-kata doa restu, dan checklist vendor terbaik.",
			},
			{ name: "twitter:image", content: "https://simfonicinta.my.id/simfoni-cinta-og.jpg" },
		],
		links: [{ rel: "canonical", href: "https://simfonicinta.my.id/berita" }],
	}),
	component: RouteComponent,
});

type Article = {
	slug: string;
	title: string;
	category: string;
	summary: string;
	thumbnail: string;
	readTime: number;
	date: string;
	tags: string[];
};

const ARTICLES: Article[] = blogData as Article[];

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

const CATEGORY_COLORS: Record<string, string> = {
	"Pernikahan Adat Jawa": "bg-gold/15 text-gold border border-gold/30",
	"Pernikahan Adat Sunda": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
	"Pernikahan Adat Sumatera": "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
	"Pernikahan Adat Sulawesi & Kalimantan": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
	"Pernikahan Adat Bali, NTT, NTB, Maluku & Papua": "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30",
	"Tradisi Tionghoa & Peranakan": "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
	"Akad Nikah, KUA & Upacara Agama": "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30",
	"Desain Tema Minimalis & Modern": "bg-primary/10 text-primary border border-primary/25",
	"Desain Tema Mewah & Floral": "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30",
	"Desain Tema Rustic, Botanical & Outdoor": "bg-sage/15 text-sage border border-sage/30",
	"Fitur Teknis Undangan Digital Web": "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
	"Distribusi Undangan & WhatsApp Blast": "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30",
	"Amplop Digital & Integrasi QRIS": "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30",
	"Manajemen Anggaran & Tips Hemat": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
	"Manajemen Vendor Katering & Gedung": "bg-amber-600/15 text-amber-700 dark:text-amber-300 border border-amber-600/30",
	"Vendor MUA, Busana & Dekorasi": "bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30",
	"Dokumentasi Foto, Video & WO": "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30",
	"Susunan Acara & Teks Doa Pernikahan": "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
	"Pantun, Puisi & Kata Mutiara": "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/30",
	"Mental, Kesehatan Pranikah & Bulan Madu": "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30",
};

const ITEMS_PER_PAGE = 12;

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function ArticleCard({ article }: { article: Article }) {
	return (
		<Link
			to="/berita/$slug"
			params={{ slug: article.slug }}
			className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
		>
			<div className="relative overflow-hidden h-48 bg-muted">
				<img
					src={article.thumbnail}
					alt={article.title}
					loading="lazy"
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
				/>
				<div className="absolute top-3 left-3">
					<span
						className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${CATEGORY_COLORS[article.category] ?? "bg-secondary/80 text-foreground/70 border border-border"}`}
					>
						{article.category}
					</span>
				</div>
			</div>
			<div className="p-5 flex flex-col flex-1">
				<p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground mb-2">
					{formatDate(article.date)}
				</p>
				<h3 className="font-serif text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
					{article.title}
				</h3>
				<p className="text-[0.84rem] text-muted-foreground leading-relaxed line-clamp-3 flex-1">
					{article.summary}
				</p>
				<div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
					<span className="flex items-center gap-1 text-[0.72rem] text-muted-foreground">
						<Clock className="w-3.5 h-3.5" />
						{article.readTime} menit baca
					</span>
					<span className="flex items-center gap-1 text-[0.78rem] font-medium text-primary group-hover:gap-2 transition-all">
						Baca <ArrowRight className="w-3.5 h-3.5" />
					</span>
				</div>
			</div>
		</Link>
	);
}

function RouteComponent() {
	const [activeCategory, setActiveCategory] = useState("Semua");
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = { Semua: ARTICLES.length };
		for (const a of ARTICLES) {
			counts[a.category] = (counts[a.category] || 0) + 1;
		}
		return counts;
	}, []);

	const filtered = useMemo(() => {
		return ARTICLES.filter((a) => {
			const matchCat =
				activeCategory === "Semua" || a.category === activeCategory;
			const matchSearch =
				!search.trim() ||
				a.title.toLowerCase().includes(search.toLowerCase()) ||
				a.summary.toLowerCase().includes(search.toLowerCase()) ||
				a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
			return matchCat && matchSearch;
		});
	}, [activeCategory, search]);

	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
	const safePage = Math.min(Math.max(currentPage, 1), totalPages);

	const paginatedArticles = useMemo(() => {
		const start = (safePage - 1) * ITEMS_PER_PAGE;
		return filtered.slice(start, start + ITEMS_PER_PAGE);
	}, [filtered, safePage]);

	const featured = ARTICLES[0];

	const handleCategoryChange = (cat: string) => {
		setActiveCategory(cat);
		setCurrentPage(1);
	};

	const handleSearchChange = (val: string) => {
		setSearch(val);
		setCurrentPage(1);
	};


	return (
		<div className="min-h-screen bg-background text-foreground">
			<Navbar />

			<div className="pt-16">
				<div className="border-b border-border/80 bg-gradient-to-b from-card/80 to-background py-8 md:py-10">
					<div className="container-page">
						<div className="max-w-2xl mx-auto">
							<div className="relative flex items-center">
								<Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
								<input
									type="text"
									placeholder="Cari topik, adat pernikahan, fitur undangan, atau tips..."
									value={search}
									onChange={(e) => handleSearchChange(e.target.value)}
									className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-card shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 text-sm text-foreground placeholder:text-muted-foreground transition-all"
								/>
								{search && (
									<button
										type="button"
										onClick={() => handleSearchChange("")}
										className="absolute right-3.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				{!search && activeCategory === "Semua" && safePage === 1 && (
					<div className="container-page mt-8 mb-10">
						<Link
							to="/berita/$slug"
							params={{ slug: featured.slug }}
							className="group relative block rounded-2xl overflow-hidden shadow-soft hover:shadow-lift transition-all duration-500 border border-border"
						>
							<img
								src={featured.thumbnail}
								alt={featured.title}
								className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
							<div className="absolute bottom-0 left-0 p-6 md:p-8 max-w-2xl">
								<span
									className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-md mb-3 inline-block ${CATEGORY_COLORS[featured.category] ?? "bg-white/20 text-white"}`}
								>
									{featured.category}
								</span>
								<h2 className="font-serif text-2xl md:text-3xl text-white leading-snug mb-2 group-hover:text-primary-foreground/90 transition-colors">
									{featured.title}
								</h2>
								<p className="text-white/75 text-[0.85rem] line-clamp-2 mb-3 leading-relaxed">
									{featured.summary}
								</p>
								<div className="flex items-center gap-3 text-white/70 text-[0.72rem]">
									<span className="flex items-center gap-1">
										<Clock className="w-3.5 h-3.5" />
										{featured.readTime} menit baca
									</span>
									<span>{formatDate(featured.date)}</span>
									<span className="flex items-center gap-1 text-gold font-semibold ml-auto group-hover:gap-2 transition-all">
										Baca Selengkapnya <ArrowRight className="w-4 h-4" />
									</span>
								</div>
							</div>
						</Link>
					</div>
				)}

				<div className="container-page mb-8 pt-6">
					<div className="flex flex-col gap-3 pb-4 border-b border-border/70">
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<div className="flex items-center gap-2">
								<SlidersHorizontal className="w-4 h-4 text-primary" />
								<span className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Kategori Artikel</span>
							</div>
							<div className="flex items-center gap-3">
								<select
									value={activeCategory}
									onChange={(e) => handleCategoryChange(e.target.value)}
									className="sm:hidden rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
								>
									{CATEGORIES.map((cat) => (
										<option key={cat} value={cat}>
											{cat} ({categoryCounts[cat] || 0})
										</option>
									))}
								</select>
								<span className="text-xs text-muted-foreground font-medium">
									Menampilkan <strong className="text-foreground font-semibold">{filtered.length}</strong> artikel
								</span>
							</div>
						</div>

						<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
							{CATEGORIES.map((cat) => {
								const count = categoryCounts[cat] || 0;
								const isActive = activeCategory === cat;
								return (
									<button
										key={cat}
										type="button"
										onClick={() => handleCategoryChange(cat)}
										className={cn(
											"flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border transition-all shrink-0 active:scale-[0.98]",
											isActive
												? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
												: "bg-card text-muted-foreground border-border/70 hover:border-primary/40 hover:text-foreground"
										)}
									>
										<span>{cat}</span>
										<span
											className={cn(
												"text-[10px] px-1.5 py-0.5 rounded-md font-mono",
												isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
											)}
										>
											{count}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<div className="container-page pb-12">
					{filtered.length === 0 ? (
						<div className="text-center py-20">
							<BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
							<p className="text-muted-foreground font-serif text-lg">
								Artikel tidak ditemukan.
							</p>
							<p className="text-muted-foreground text-[0.84rem] mt-1">
								Coba gunakan kata kunci atau pilih kategori lain.
							</p>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{paginatedArticles.map((article) => (
									<ArticleCard key={article.slug} article={article} />
								))}
							</div>

							{totalPages > 1 && (
								<div className="mt-10 pt-6 border-t border-border/80 flex flex-col items-center justify-center gap-2">
									<div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
										<button
											type="button"
											onClick={() => {
												setCurrentPage((p) => Math.max(p - 1, 1));
												window.scrollTo({ top: 400, behavior: "smooth" });
											}}
											disabled={safePage <= 1}
											aria-label="Halaman sebelumnya"
											className="h-8 px-2 sm:px-2.5 inline-flex items-center justify-center gap-1 rounded-lg border border-border/80 bg-card text-[12px] font-semibold text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
										>
											<ChevronLeft className="size-3.5" />
											<span className="hidden sm:inline">Sebelumnya</span>
										</button>

										<div className="flex items-center gap-1 flex-nowrap">
											{getShortPagination(safePage, totalPages).map((pageNum) => (
												<button
													key={pageNum}
													type="button"
													onClick={() => {
														setCurrentPage(pageNum);
														window.scrollTo({ top: 400, behavior: "smooth" });
													}}
													className={cn(
														"size-8 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer",
														pageNum === safePage
															? "bg-primary text-primary-foreground shadow-2xs font-bold"
															: "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40",
													)}
												>
													{pageNum}
												</button>
											))}
										</div>

										<button
											type="button"
											onClick={() => {
												setCurrentPage((p) => Math.min(p + 1, totalPages));
												window.scrollTo({ top: 400, behavior: "smooth" });
											}}
											disabled={safePage >= totalPages}
											aria-label="Halaman selanjutnya"
											className="h-8 px-2 sm:px-2.5 inline-flex items-center justify-center gap-1 rounded-lg border border-border/80 bg-card text-[12px] font-semibold text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
										>
											<span className="hidden sm:inline">Selanjutnya</span>
											<ChevronRight className="size-3.5" />
										</button>
									</div>

									<p className="text-[11px] text-muted-foreground">
										Halaman {safePage} dari {totalPages} ({filtered.length} artikel)
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<Footer />
			<FloatingWa />
		</div>
	);
}
