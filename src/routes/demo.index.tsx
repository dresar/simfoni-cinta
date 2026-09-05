import { useMemo, useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { getShortPagination } from "@/lib/pagination";
import { templates as mockTemplates } from "@/components/landing/data";
import { fetchTemplates } from "@/functions/templates";
import { fetchTemplateCategories } from "@/functions/media";
import {
	DefaultCoverCard,
	LOCAL_COVERS,
} from "@/components/landing/sections-a";
import {
	CaretLeft,
	CaretRight,
	FadersHorizontal,
	CaretDown,
	MagnifyingGlass,
	Check,
	X,
	Flame,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/demo/")({
	loader: async () => {
		try {
			const [templatesRes, categories] = await Promise.all([
				fetchTemplates({ data: { limit: 500 } }).catch(() => null),
				fetchTemplateCategories().catch(() => []),
			]);
			return { templates: templatesRes?.items || [], categories };
		} catch {
			return { templates: [], categories: [] };
		}
	},
	head: () => ({
		meta: [
			{ title: "Katalog Tema Undangan Pernikahan Digital — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Pilih dari ratusan desain undangan digital pernikahan eksklusif, adat, modern, dan minimalis.",
			},
		],
	}),
	component: RouteComponent,
});

interface DemoTemplateItem {
	id?: string;
	name: string;
	slug: string;
	category: string;
	categoryKey?: string;
	desc?: string;
	image?: string;
	thumb?: string;
	sortOrder?: number;
	tag?: string;
}

function DemoTemplateCard({ t }: { t: DemoTemplateItem }) {
	const [hasError, setHasError] = useState(false);
	const localFallback = LOCAL_COVERS[t.slug];
	const initialSrc =
		(t.thumb && t.thumb.trim() !== "" ? t.thumb : null) ||
		(t.image && t.image.trim() !== "" ? t.image : null) ||
		localFallback;

	const sortOrder = t.sortOrder ?? 999;
	const isTopRank = sortOrder <= 3;

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md relative">
			<a
				href={`/demo/${t.slug}/`}
				className="relative aspect-square w-full overflow-hidden block bg-muted select-none cursor-pointer"
			>
				{!initialSrc || hasError ? (
					<DefaultCoverCard name={t.name} category={t.category} />
				) : (
					<img
						src={initialSrc}
						width={600}
						height={600}
						loading="lazy"
						alt={`Preview template undangan ${t.name}`}
						onError={() => setHasError(true)}
						className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
					/>
				)}
			</a>

			<div className="flex flex-1 flex-col p-2.5 sm:p-3 justify-between">
				<div>
					<span className="text-[11px] text-slate-500 dark:text-muted-foreground font-normal truncate block">
						{t.category || "Wedding"}
					</span>

					<h2 className="font-sans text-[13px] sm:text-[14px] font-bold text-slate-900 dark:text-white truncate mt-0.5">
						{t.name}
					</h2>
				</div>

				<div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
					<a
						href={`/demo/${t.slug}/`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center rounded-[5px] bg-[#cbd5e1] hover:bg-[#94a3b8]/70 dark:bg-slate-700 dark:hover:bg-slate-600 py-1.5 text-[11px] sm:text-[12px] font-semibold text-slate-900 dark:text-white transition-colors text-center cursor-pointer shadow-2xs"
					>
						Demo
					</a>
					<a
						href={`/dasbor?template=${t.slug}`}
						className="flex items-center justify-center rounded-[5px] border border-[#0891b2] dark:border-[#06b6d4] text-[#0891b2] dark:text-[#06b6d4] hover:bg-[#0891b2]/10 dark:hover:bg-[#06b6d4]/10 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors text-center cursor-pointer shadow-2xs"
					>
						Pilih
					</a>
				</div>
			</div>
		</article>
	);
}

const ITEMS_PER_PAGE = 32;

function RouteComponent() {
	const loaderData = Route.useLoaderData();
	const dbTemplates = loaderData?.templates ?? [];

	const allTemplates = useMemo(() => {
		if (dbTemplates && dbTemplates.length > 0) {
			return dbTemplates.map((t: any) => ({
				id: t.id,
				name: t.name,
				slug: t.slug,
				category: t.category,
				categoryKey: t.category,
				desc: t.theme
					? `Konsep: ${t.theme}`
					: t.tag || "Tema eksklusif mobile-first premium.",
				image:
					(t.thumb && t.thumb.trim() !== "" ? t.thumb : null) ||
					(t.image && t.image.trim() !== "" ? t.image : null) ||
					LOCAL_COVERS[t.slug] ||
					undefined,
				thumb: t.thumb,
				sortOrder: t.sortOrder,
				tag: t.tag,
			}));
		}
		return mockTemplates;
	}, [dbTemplates]);

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

	const [active, setActive] = useState<string>("Semua Tema");
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [openFilter, setOpenFilter] = useState(false);
	const filterRef = useRef<HTMLDivElement>(null);

	const list = useMemo(() => {
		let res = allTemplates;

		if (active !== "Semua Tema") {
			const target = active.toLowerCase();
			res = res.filter((t) => {
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

		if (query.trim()) {
			const q = query.toLowerCase().trim();
			res = res.filter(
				(t) =>
					t.name.toLowerCase().includes(q) ||
					t.slug.toLowerCase().includes(q) ||
					(t.desc && t.desc.toLowerCase().includes(q)) ||
					t.category?.toLowerCase().includes(q),
			);
		}

		return [...res].sort((a: any, b: any) => {
			const orderA = Number(a.id || a.sortOrder || 9999);
			const orderB = Number(b.id || b.sortOrder || 9999);
			if (orderA !== orderB) return orderA - orderB;
			return String(a.name || a.slug).localeCompare(String(b.name || b.slug), undefined, { numeric: true });
		});
	}, [active, query, allTemplates]);

	useEffect(() => {
		setPage(1);
	}, [active, query]);

	const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
	const paginatedList = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return list.slice(start, start + ITEMS_PER_PAGE);
	}, [list, page]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
				setOpenFilter(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="min-h-screen bg-background">
			{/* Docked Sticky Top Search & Category Filter Toolbar */}
			<div
				className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-xs px-3 sm:px-5 md:px-7 xl:px-8 py-1"
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
							className="h-10 px-3.5 sm:px-4 flex items-center gap-2 rounded-lg border border-border bg-card text-xs sm:text-sm font-semibold text-foreground hover:bg-muted shadow-2xs transition-colors shrink-0 select-none cursor-pointer"
						>
							<FadersHorizontal
								className="size-4 text-primary"
								weight="bold"
							/>
							<span className="truncate max-w-[85px] sm:max-w-[140px]">
								{active === "Semua Tema" ? "Kategori" : active}
							</span>
							<CaretDown
								className={cn(
									"size-3 text-muted-foreground transition-transform duration-200",
									openFilter && "rotate-180",
								)}
								weight="bold"
							/>
						</button>

						{/* Dropdown Menu Popup */}
						{openFilter && (
							<div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
								<div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 border-b border-border/50 flex items-center justify-between">
									<span>Pilih Kategori</span>
									<span className="text-[9px] font-normal lowercase">
										{categories.length} opsi
									</span>
								</div>
								<div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
									{categories.map((c) => {
										const count =
											c === "Semua Tema"
												? allTemplates.length
												: allTemplates.filter((t) => {
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
															target.includes("modern") &&
															(cat.includes("minimalis") ||
																cat.includes("modern") ||
																cat.includes("clean"))
														)
															return true;
														if (
															target.includes("vintage") &&
															(cat.includes("vintage") ||
																cat.includes("rustic") ||
																cat.includes("classic"))
														)
															return true;
														if (
															target.includes("islami") &&
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
													setActive(c);
													setOpenFilter(false);
												}}
												className={cn(
													"w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer",
													active === c
														? "bg-primary text-primary-foreground font-semibold"
														: "hover:bg-muted text-foreground/80",
												)}
											>
												<span>{c}</span>
												<div className="flex items-center gap-1.5">
													<span className="text-[10px] opacity-75">
														({count})
													</span>
													{active === c && (
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
					<div className="relative flex-1 flex items-stretch rounded-lg border border-border bg-card shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
						<input
							type="text"
							placeholder="Cari tema..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="flex-1 min-w-0 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none rounded-l-lg"
						/>
						{query && (
							<button
								type="button"
								onClick={() => setQuery("")}
								className="px-2 text-muted-foreground hover:text-foreground cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						)}
						<div className="px-3.5 flex items-center justify-center text-muted-foreground border-l border-border/70">
							<MagnifyingGlass className="size-4" weight="bold" />
						</div>
					</div>
				</div>
			</div>

			<div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 md:px-7 xl:px-8 pb-32 sm:pb-20">
				{/* Grid List (4 cols desktop, 2 cols mobile) */}
				{list.length === 0 ? (
					<div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
						<p className="text-sm font-semibold">
							Belum ada tema
						</p>
						<button
							type="button"
							onClick={() => {
								setActive("Semua Tema");
								setQuery("");
							}}
							className="mt-3 px-4 py-1.5 rounded-[6px] bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
						>
							Reset
						</button>
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
						{paginatedList.map((t) => (
							<DemoTemplateCard key={t.id || t.slug} t={t} />
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mt-8 mb-6 sm:mb-2 flex flex-col items-center justify-center gap-2">
						<div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
							<button
								type="button"
								onClick={() => handlePageChange(page - 1)}
								disabled={page <= 1}
								aria-label="Halaman sebelumnya"
								className="h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1 rounded-lg border border-border/80 bg-card hover:bg-muted text-[12px] font-semibold text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
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
												? "bg-primary text-primary-foreground shadow-2xs font-bold"
												: "border border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
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
								className="h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1 rounded-lg border border-border/80 bg-card hover:bg-muted text-[12px] font-semibold text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
							>
								<span className="hidden sm:inline">Next</span>
								<CaretRight weight="bold" className="size-3.5" />
							</button>
						</div>

						<p className="text-[11px] text-muted-foreground">
							Halaman {page} dari {totalPages} ({list.length} tema)
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
