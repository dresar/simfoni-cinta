import { cn } from "@/lib/utils";
import devicesShowcase from "@/assets/devices-showcase.jpg";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { featureGroups, templates } from "./data";
import {
	IconArrowRight,
	IconCalendar,
	IconCheck,
	IconGift,
	IconHeadset,
	IconLeaf,
	IconPalette,
	IconUsers,
} from "./icons";

import { useState, useMemo, useRef, useEffect } from "react";
import {
	FadersHorizontal,
	CaretDown,
	MagnifyingGlass,
	Check,
	Flame,
} from "@phosphor-icons/react";
import tplMatcha from "@/assets/tpl-matcha.jpg";
import tplButterfly from "@/assets/tpl-butterfly.jpg";
import tplFloral from "@/assets/tpl-floral.jpg";
import tplMinimalist from "@/assets/tpl-minimalist.jpg";
import tplKorean from "@/assets/tpl-korean.jpg";
import tplRustic from "@/assets/tpl-rustic.jpg";
import tplLuxury from "@/assets/tpl-luxury.jpg";
import tplTraditional from "@/assets/tpl-traditional.jpg";
import tplModern from "@/assets/tpl-modern.jpg";
import tplIslamic from "@/assets/tpl-islamic.jpg";

export const LOCAL_COVERS: Record<string, string> = {
	"batak-merah": tplTraditional,
	"batak-ulos": tplTraditional,
	"jawa-keraton": tplTraditional,
	"sunda-siger": tplTraditional,
	"blue-butterfly": tplButterfly,
	"matcha-elegan": tplMatcha,
	"sage-watercolor": tplMatcha,
	"minimalist-cream": tplMinimalist,
	"minimalis-modern": tplMinimalist,
	"melayu-padang": tplLuxury,
	"lion-february": tplModern,
	"emerald-uici": tplIslamic,
	"islami-arabesque": tplIslamic,
	"fresh-halal-bihalal": tplFloral,
	"rustic-floral": tplRustic,
	"korean-romance": tplKorean,
};

export function DefaultCoverCard({
	name,
	category,
}: {
	name: string;
	category?: string;
}) {
	return (
		<div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-black p-4 flex flex-col items-center justify-between border border-primary/20 select-none">
			<div className="w-full flex justify-between items-center z-10">
				<span className="text-[9px] font-mono tracking-widest text-primary/80 uppercase">
					Simfoni Cinta
				</span>
				<span className="text-[9px] px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider font-semibold">
					{category || "Eksklusif"}
				</span>
			</div>

			<div className="flex flex-col items-center justify-center text-center my-auto z-10">
				<div className="size-11 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
					<span className="font-serif text-lg font-bold text-primary">A&C</span>
				</div>
				<h4 className="font-serif text-sm sm:text-base font-medium text-amber-100/95 leading-snug max-w-[180px] line-clamp-2">
					{name}
				</h4>
			</div>

			<div className="w-full text-center z-10">
				<span className="text-[9px] text-stone-500 font-medium">
					Klik untuk Live Demo
				</span>
			</div>

			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />
			<div className="absolute inset-2 border border-primary/20 rounded-md pointer-events-none border-dashed" />
		</div>
	);
}

export interface TemplateShowcaseItem {
	id?: string;
	name: string;
	slug: string;
	category: string;
	theme?: string;
	tag?: string;
	thumb?: string;
	image?: string;
	desc?: string;
	couple?: string;
	sortOrder?: number;
}

function ShowcaseCard({
	t,
	index,
}: {
	t: TemplateShowcaseItem;
	index: number;
}) {
	const [hasError, setHasError] = useState(false);
	const localFallback = LOCAL_COVERS[t.slug];
	const initialSrc =
		(t.thumb && t.thumb.trim() !== "" ? t.thumb : null) ||
		(t.image && t.image.trim() !== "" ? t.image : null) ||
		localFallback;

	const sortOrder = t.sortOrder ?? 999;
	const isTopRank = sortOrder <= 3;

	return (
		<Reveal delay={(index % 5) * 80} className="min-w-0">
			<article className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md relative">
				<a
					href={`/demo/${t.slug}/`}
					aria-label={`Buka demo template ${t.name}`}
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

				<div className="flex flex-1 flex-col p-2.5 sm:p-3">
					<div className="flex-1">
						<span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
							{t.category || "Wedding"}
						</span>

						<h3 className="font-sans text-[13px] sm:text-[14px] font-bold text-slate-900 dark:text-white truncate mt-0.5">
							{t.name}
						</h3>
					</div>

					<div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
						<a
							href={`/demo/${t.slug}/`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Lihat preview template ${t.name}`}
							className="flex items-center justify-center rounded-[5px] bg-[#cbd5e1] hover:bg-[#94a3b8]/70 dark:bg-slate-700 dark:hover:bg-slate-600 py-1.5 text-[11px] sm:text-[12px] font-medium text-slate-900 dark:text-white transition-colors text-center cursor-pointer"
						>
							Preview
						</a>
						<a
							href={`/dasbor?template=${t.slug}`}
							aria-label={`Pilih dan pesan template ${t.name}`}
							className="flex items-center justify-center rounded-[5px] border border-[#0891b2] dark:border-[#06b6d4] text-[#0891b2] dark:text-[#06b6d4] hover:bg-[#0891b2]/10 dark:hover:bg-[#06b6d4]/10 py-1.5 text-[11px] sm:text-[12px] font-medium transition-colors text-center cursor-pointer"
						>
							Pesan
						</a>
					</div>
				</div>
			</article>
		</Reveal>
	);
}

export function TemplateShowcase({
	items,
}: {
	items?: TemplateShowcaseItem[];
}) {
	const allItems = items && items.length > 0 ? items : templates;
	const [activeCategory, setActiveCategory] = useState("Semua");
	const [searchQuery, setSearchQuery] = useState("");
	const [openFilter, setOpenFilter] = useState(false);
	const filterRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
				setOpenFilter(false);
			}
		};
		const handleCategoryFilter = (e: Event) => {
			const customEvent = e as CustomEvent<{ category: string }>;
			if (customEvent.detail?.category) {
				setActiveCategory(customEvent.detail.category);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("filter-template-category", handleCategoryFilter);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("filter-template-category", handleCategoryFilter);
		};
	}, []);

	const categoryTabs = useMemo(() => {
		const dynamicCats = Array.from(
			new Set(allItems.map((t) => t.category).filter(Boolean)),
		);
		const baseTabs = [
			"Adat Nusantara",
			"Floral & Sage",
			"Elegant & Luxury",
			"Minimalis",
			"Islamic & Syukuran",
		];
		const merged = Array.from(new Set([...baseTabs, ...dynamicCats]));
		return ["Semua", ...merged];
	}, [allItems]);

	const filteredList = useMemo(() => {
		const byCategory =
			activeCategory === "Semua"
				? allItems
				: allItems.filter((t) => {
						const cat = (t.category || "").toLowerCase();
						const target = activeCategory.toLowerCase();
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
							cat.toLowerCase() === target ||
							cat.includes(target) ||
							target.includes(cat)
						);
					});

		let list = byCategory;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = byCategory.filter(
				(t) =>
					t.name.toLowerCase().includes(q) ||
					t.category.toLowerCase().includes(q) ||
					t.desc?.toLowerCase().includes(q) ||
					t.slug.toLowerCase().includes(q),
			);
		}

		return [...list].sort((a: any, b: any) => {
			const orderA = Number(a.sortOrder ?? a.sort_order ?? 9999);
			const orderB = Number(b.sortOrder ?? b.sort_order ?? 9999);
			if (orderA !== orderB) return orderA - orderB;

			const nameA = String(a.name || a.slug || "");
			const nameB = String(b.name || b.slug || "");
			return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
		});
	}, [allItems, activeCategory, searchQuery]);

	const displayList = filteredList.slice(0, 10);

	return (
		<section
			id="template"
			className="pt-2 pb-8 sm:pt-4 sm:pb-10 md:pt-6 md:pb-12"
		>
			<div className="container-page">
				<SectionHeading
					eyebrow="Template Favorit"
					title="Pilihan Tema Elegan"
				/>

				{/* Unified Search & Category Filter Bar */}
				<div className="relative max-w-2xl mx-auto mt-5 z-30" ref={filterRef}>
					<div className="flex items-stretch rounded-xl border border-border bg-card shadow-xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
						{/* Category Filter Dropdown Trigger */}
						<div className="relative">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setOpenFilter((v) => !v);
								}}
								className="h-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-r border-border text-xs sm:text-sm font-semibold text-foreground/90 hover:bg-muted/70 transition-colors shrink-0 rounded-l-xl select-none cursor-pointer"
							>
								<FadersHorizontal
									className="size-4 text-primary"
									weight="bold"
								/>
								<span className="truncate max-w-[80px] sm:max-w-[150px]">
									{activeCategory === "Semua" ? "Filters" : activeCategory}
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
								<div className="absolute left-0 top-full mt-1.5 w-56 sm:w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl z-[999] animate-in fade-in-0 zoom-in-95 duration-150">
									<div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 border-b border-border/50 flex items-center justify-between">
										<span>Pilih Kategori</span>
										<span className="text-[9px] font-normal lowercase">
											{categoryTabs.length} opsi
										</span>
									</div>
									<div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
										{categoryTabs.map((c) => (
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
														? "bg-primary text-primary-foreground font-semibold"
														: "hover:bg-muted text-foreground/80",
												)}
											>
												<span>{c}</span>
												{activeCategory === c && (
													<Check className="size-3.5" weight="bold" />
												)}
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Search Input */}
						<input
							type="text"
							placeholder="Cari tema..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="flex-1 min-w-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
						/>

						{/* Search Button */}
						<button
							type="button"
							className="px-3.5 sm:px-5 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors shrink-0 rounded-r-xl"
							aria-label="Cari"
						>
							<MagnifyingGlass className="size-4" weight="bold" />
						</button>
					</div>
				</div>

				{/* 2-Column Mobile & 5-Column Desktop Grid Layout */}
				{displayList.length === 0 ? (
					<div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
						Tidak ada template yang cocok.{" "}
						<button
							type="button"
							onClick={() => {
								setActiveCategory("Semua");
								setSearchQuery("");
							}}
							className="text-primary font-bold hover:underline ml-1"
						>
							Reset Filter
						</button>
					</div>
				) : (
					<div className="mt-6 sm:mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
						{displayList.map((t, i) => (
							<ShowcaseCard key={t.slug || t.name} t={t} index={i} />
						))}
					</div>
				)}

				<div className="mt-8 sm:mt-10 text-center">
					<a
						href="/demo"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
					>
						<span>Lihat Semua Koleksi Template</span>
						<IconArrowRight className="h-3.5 w-3.5" />
					</a>
				</div>
			</div>
		</section>
	);
}

/* ---------------- All features ---------------- */

const groupIcons = [
	IconUsers,
	IconCalendar,
	IconPalette,
	IconGift,
	IconHeadset,
];

export function AllFeatures() {
	return (
		<section id="fitur" className="py-10 md:py-14">
			<div className="container-page">
				<SectionHeading
					eyebrow="Fitur Lengkap"
					title="Semua Fitur yang Kamu Butuhkan"
					desc="Tidak ada fitur penting yang disembunyikan di paket mahal. Semua tersedia sejak awal."
				/>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{featureGroups.map((g, gi) => {
						const Icon = groupIcons[gi] ?? IconLeaf;
						return (
							<Reveal key={g.title} delay={(gi % 3) * 110} className="min-w-0">
								<div
									className={cn(
										"flex h-full flex-col rounded-xl border border-border/70 p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-sm",
										gi % 2 === 0 ? "bg-card" : "bg-secondary/40",
									)}
								>
									<div className="flex items-center gap-3">
										<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sage/30 bg-background text-primary transition-transform duration-300 hover:scale-105">
											<Icon className="h-4.5 w-4.5" />
										</span>
										<div className="min-w-0">
											<h3 className="truncate font-serif text-base sm:text-lg font-bold">{g.title}</h3>
											<p className="truncate text-[0.72rem] text-muted-foreground">
												{g.caption}
											</p>
										</div>
									</div>
									<ul className="mt-4 space-y-2.5">
										{g.items.map((it) => (
											<li
												key={it}
												className="flex items-start gap-2 text-[0.82rem] leading-snug"
											>
												<IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
												<span>{it}</span>
											</li>
										))}
									</ul>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}

/* ---------------- Responsive devices ---------------- */

export function ResponsiveDevices() {
	return (
		<section className="py-10 md:py-14">
			<div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
				<Reveal variant="left">
					<span className="eyebrow">Responsive</span>
					<h2 className="mt-3 text-[2rem] leading-[1.12] sm:text-[2.6rem] lg:text-[3.1rem]">
						Satu Undangan, Semua Perangkat
					</h2>
					<p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
						Setiap tema dirancang responsive. Nyaman dibuka dari HP, tablet,
						maupun desktop tanpa perlu instal aplikasi apa pun.
					</p>
					<ul className="mt-7 grid gap-3 sm:grid-cols-2">
						{[
							"Ringan & cepat dibuka",
							"Tanpa aplikasi tambahan",
							"Tampil rapi di layar kecil",
							"Siap dibagikan via chat",
						].map((x) => (
							<li key={x} className="flex items-start gap-2.5 text-[0.85rem]">
								<IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
								<span>{x}</span>
							</li>
						))}
					</ul>
				</Reveal>

				<Reveal variant="scale" delay={120}>
					<div className="overflow-hidden rounded-xl border border-border/70 card-matcha shadow-xs">
						<img
							src="https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/devices-showcase-004016.webp"
							width={1408}
							height={912}
							loading="lazy"
							alt="Undangan digital Simfoni Cinta ditampilkan pada laptop, tablet, dan smartphone dengan tema berbeda"
							className="w-full object-cover"
						/>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
