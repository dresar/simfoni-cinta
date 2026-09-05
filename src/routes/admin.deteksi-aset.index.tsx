import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
	Folder,
	Search,
	Sparkles,
	Layers,
	HardDrive,
	ExternalLink
} from "lucide-react";
import { fetchTemplates, fetchTemplateStats, fetchCategoriesSummary } from "@/functions/templates";
import { TemplateFolderGrid, TemplateAssetExplorer } from "@/components/admin/assetDetective";
import type { Template } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/deteksi-aset/")({
	validateSearch: (search: Record<string, unknown>): { template?: string } => ({
		template: typeof search.template === "string" ? search.template : undefined,
	}),
	loader: async () => {
		const [templatesRes, stats, categories] = await Promise.all([
			fetchTemplates({ data: { limit: 250 } }),
			fetchTemplateStats(),
			fetchCategoriesSummary()
		]);
		return {
			templates: templatesRes?.items || [],
			stats: stats || {
				totalTemplates: 192,
				totalCategories: 8,
				totalAdat: 48,
				totalModern: 64,
				totalFloral: 35,
				totalAssetsTracked: 8868
			},
			categories: categories || []
		};
	},
	component: AssetDetectivePage
});

function AssetDetectivePage() {
	const data = Route.useLoaderData();
	const search = Route.useSearch();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState<string>("Semua");
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

	useEffect(() => {
		if (search.template && data.templates.length > 0) {
			const found = data.templates.find((t) => t.slug === search.template);
			if (found) {
				setSelectedTemplate(found);
			}
		}
	}, [search.template, data.templates]);

	const categoryTabs = [
		"Semua",
		"Tradisional & Adat",
		"Floral & Sage",
		"Modern Luxury",
		"Vintage & Rustic",
		"Islami & Elegan",
		"Oriental & International",
		"Minimalist Clean",
		"Modern Elegan"
	];

	const filteredTemplates = useMemo(() => {
		return data.templates.filter((tpl) => {
			const matchesCategory =
				activeCategory === "Semua" || tpl.category === activeCategory;

			const matchesSearch =
				!searchQuery.trim() ||
				tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				tpl.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(tpl.category && tpl.category.toLowerCase().includes(searchQuery.toLowerCase()));

			return matchesCategory && matchesSearch;
		});
	}, [data.templates, activeCategory, searchQuery]);

	if (selectedTemplate) {
		return (
			<TemplateAssetExplorer
				template={selectedTemplate}
				onClose={() => {
					setSelectedTemplate(null);
					window.history.replaceState({}, "", "/admin/deteksi-aset");
				}}
			/>
		);
	}

	return (
		<div className="space-y-4 animate-fade-in">
			{/* Standard PageHead */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="font-serif text-2xl font-bold tracking-tight text-white">
						Deteksi Aset
					</h1>
					<p className="text-xs text-white/40 mt-0.5">
						192 folder tema ({data.stats.totalAssetsTracked} berkas)
					</p>
				</div>

				<div className="flex items-center gap-2">
					<a
						href="/admin/template"
						className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
					>
						Template
					</a>
					<a
						href="/admin/galeri-aset"
						className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
					>
						Galeri Aset
					</a>
				</div>
			</div>

			{/* Category Filter & Search Bar */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap gap-1.5">
					{categoryTabs.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setActiveCategory(cat)}
							className={cn(
								"rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
								activeCategory === cat
									? "border-amber-500/40 bg-amber-500/15 text-amber-400"
									: "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/60"
							)}
						>
							{cat}
						</button>
					))}
				</div>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
					<input
						type="search"
						placeholder="Cari"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="h-9 w-44 sm:w-56 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-white/25 focus:border-amber-500/40 focus:bg-white/10 focus:outline-none"
					/>
				</div>
			</div>

			{/* Sub-bar */}
			<div className="flex items-center justify-between gap-3 text-xs text-muted-foreground border-b border-white/5 pb-2.5">
				<span>
					Total: <strong className="text-white">{filteredTemplates.length}</strong> tema
				</span>
			</div>

			{/* Folder Grid */}
			<TemplateFolderGrid
				templates={filteredTemplates}
				onOpenFolder={(tpl) => {
					setSelectedTemplate(tpl);
					window.history.replaceState({}, "", `/admin/deteksi-aset?template=${tpl.slug}`);
				}}
			/>
		</div>
	);
}
