import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { useStore } from "@/store/appStore";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getShortPagination } from "@/lib/pagination";

export const Route = createFileRoute("/dasbor/template")({
	loader: async () => {
		try {
			const [templatesRes, categories] = await Promise.all([
				fetchTemplates({ data: { limit: 500 } }).catch(() => null),
				fetchTemplateCategories().catch(() => []),
			]);
			return {
				templates: templatesRes?.items || [],
				categories,
			};
		} catch {
			return { templates: [], categories: [] };
		}
	},
	head: () => ({
		meta: [
			{ title: "Katalog Template Undangan — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Pilih dari ratusan desain undangan digital pernikahan eksklusif, adat, modern, dan minimalis.",
			},
		],
	}),
	component: DasborTemplateCatalog,
});

const ITEMS_PER_PAGE = 32;

function DasborTemplateCatalog() {
	const { session } = useStore();
	const navigate = useNavigate();
	const { templates = [], categories: dbCategories = [] } =
		Route.useLoaderData();

	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("Semua Tema");
	const [page, setPage] = useState(1);
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
			const orderA = a.sortOrder ?? 999;
			const orderB = b.sortOrder ?? 999;
			if (orderA !== orderB) return orderA - orderB;
			return 0;
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

	const handleBuy = (slug: string) => {
		if (!session?.email) {
			toast.error("Masuk dahulu.");
			navigate({ to: "/login" });
			return;
		}
		navigate({
			to: "/dasbor/pembelian",
			search: { action: "checkout", template: slug },
		});
	};

	const handleUse = (slug: string) => {
		navigate({
			to: "/dasbor/undangan",
			search: { create: "true", template: slug },
		});
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Docked Sticky Search & Filter Toolbar */}
			<div
				className="sticky top-0 z-30 -mx-4 sm:-mx-8 -mt-5 lg:-mt-6 px-4 sm:px-8 py-1 bg-[#faf8f5]/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-xs"
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
							className="h-10 px-3.5 sm:px-4 flex items-center gap-2 rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700/60 shadow-2xs transition-colors shrink-0 select-none cursor-pointer"
						>
							<FadersHorizontal className="size-4 text-emerald-700 dark:text-emerald-400" weight="bold" />
							<span className="truncate max-w-[85px] sm:max-w-[140px]">
								{activeCategory === "Semua Tema" ? "Kategori" : activeCategory}
							</span>
							<CaretDown
								className={cn(
									"size-3 text-stone-400 transition-transform duration-200",
									openFilter && "rotate-180",
								)}
								weight="bold"
							/>
						</button>

						{/* Dropdown Menu Popup */}
						{openFilter && (
							<div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
								<div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400 px-2.5 py-1.5 border-b border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
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
														? "bg-emerald-700 text-white font-semibold"
														: "hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200",
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
					<div className="relative flex-1 flex items-stretch rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-2xs focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/30 transition-all">
						<input
							type="text"
							placeholder="Cari tema..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="flex-1 min-w-0 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 outline-none rounded-l-lg"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="px-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						)}
						<div className="px-3.5 flex items-center justify-center text-stone-400 border-l border-stone-200/80 dark:border-stone-700/80">
							<MagnifyingGlass className="size-4" weight="bold" />
						</div>
					</div>
				</div>
			</div>

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
					{paginatedList.map((tpl: any) => {
						const localFallback = LOCAL_COVERS[tpl.slug];
						const initialSrc =
							(tpl.thumb && tpl.thumb.trim() !== ""
								? tpl.thumb
								: null) ||
							(tpl.image && tpl.image.trim() !== ""
								? tpl.image
								: null) ||
							localFallback;

						const sortOrder = tpl.sortOrder ?? 999;
						const isTopRank = sortOrder <= 3;

						return (
							<article
								key={tpl.id || tpl.slug}
								className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md relative"
							>
								<a
									href={`/demo/${tpl.slug}`}
									target="_blank"
									rel="noreferrer"
									className="relative aspect-square w-full overflow-hidden block bg-muted select-none cursor-pointer"
								>
									{!initialSrc ? (
										<DefaultCoverCard
											name={tpl.name}
											category={tpl.category}
										/>
									) : (
										<img
											src={initialSrc}
											width={600}
											height={600}
											loading="lazy"
											alt={`Preview template ${tpl.name}`}
											className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
										/>
									)}
								</a>

								<div className="flex flex-1 flex-col p-2.5 sm:p-3 justify-between">
									<div>
										<span className="text-[11px] text-slate-500 dark:text-muted-foreground font-normal truncate block">
											{tpl.category || "Wedding"}
										</span>

										<h2 className="font-sans text-[13px] sm:text-[14px] font-bold text-slate-900 dark:text-white truncate mt-0.5">
											{tpl.name}
										</h2>
									</div>

									<div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
										<a
											href={`/demo/${tpl.slug}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center justify-center rounded-[5px] bg-[#cbd5e1] hover:bg-[#94a3b8]/70 dark:bg-slate-700 dark:hover:bg-slate-600 py-1.5 text-[11px] sm:text-[12px] font-semibold text-slate-900 dark:text-white transition-colors text-center cursor-pointer shadow-2xs"
										>
											Demo
										</a>
										{session?.email ? (
											<button
												type="button"
												onClick={() => handleUse(tpl.slug)}
												className="flex items-center justify-center rounded-[5px] border border-[#0891b2] dark:border-[#06b6d4] text-[#0891b2] dark:text-[#06b6d4] hover:bg-[#0891b2]/10 dark:hover:bg-[#06b6d4]/10 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors text-center cursor-pointer shadow-2xs"
											>
												Pilih
											</button>
										) : (
											<button
												type="button"
												onClick={() => handleBuy(tpl.slug)}
												className="flex items-center justify-center rounded-[5px] border border-[#0891b2] dark:border-[#06b6d4] text-[#0891b2] dark:text-[#06b6d4] hover:bg-[#0891b2]/10 dark:hover:bg-[#06b6d4]/10 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors text-center cursor-pointer shadow-2xs"
											>
												Pesan
											</button>
										)}
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mt-8 mb-6 sm:mb-2 pb-24 sm:pb-8 flex flex-col items-center justify-center gap-2">
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
											? "bg-emerald-800 dark:bg-emerald-700 text-white shadow-2xs font-bold"
											: "border border-border/80 bg-card text-muted-foreground hover:border-emerald-600/40 hover:text-foreground",
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
						Halaman {page} dari {totalPages} ({filteredTemplates.length} tema)
					</p>
				</div>
			)}
		</div>
	);
}
