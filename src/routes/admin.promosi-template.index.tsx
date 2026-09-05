import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
	Search,
	FolderTree,
	Bot,
} from "lucide-react";
import {
	PageHead,
	GlassCard,
	TextInput,
	SelectInput,
} from "@/components/kit";
import { fetchTemplates } from "@/functions/templates";
import { LOCAL_COVERS } from "@/components/landing/sections-a";
import type { Template } from "@/lib/db/schema";

export const Route = createFileRoute("/admin/promosi-template/")({
	loader: async () => {
		const res = await fetchTemplates({ data: { limit: 250 } });
		return {
			templates: res?.items || [],
		};
	},
	head: () => ({
		meta: [
			{ title: "Promosi Template — Simfoni Cinta" },
		],
	}),
	component: PromosiTemplateIndexPage,
});

function PromosiTemplateIndexPage() {
	const { templates } = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Semua");

	const categories = useMemo(() => {
		const set = new Set<string>();
		templates.forEach((t: Template) => {
			if (t.category) set.add(t.category);
		});
		return ["Semua", ...Array.from(set)];
	}, [templates]);

	const filteredTemplates = useMemo(() => {
		return templates.filter((t: Template) => {
			const matchSearch =
				!searchQuery ||
				t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchCategory =
				selectedCategory === "Semua" || t.category === selectedCategory;
			return matchSearch && matchCategory;
		});
	}, [templates, searchQuery, selectedCategory]);

	return (
		<div className="space-y-4 max-w-7xl mx-auto pb-12">
			<PageHead
				title="Promosi Template"
				description="Pilih template untuk kelola aset CDN atau studio materi promosi AI."
			/>

			<div className="grid grid-cols-2 gap-2">
				<TextInput
					placeholder="Cari"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					icon={<Search className="size-4 text-white/40" />}
					clearable
					onClear={() => setSearchQuery("")}
				/>
				<SelectInput
					options={categories.map((c) => ({ label: c, value: c }))}
					value={selectedCategory}
					onChange={(e: any) => setSelectedCategory(e?.target?.value ?? e)}
				/>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
				{filteredTemplates.map((template: Template) => {
					const coverImg =
						(template.thumb && template.thumb.trim() !== "" ? template.thumb : null) ||
						LOCAL_COVERS[template.slug] ||
						`/demo/${template.slug}/assets/images/${template.slug}.webp`;

					return (
						<GlassCard
							key={template.id}
							className="p-2 sm:p-3 flex flex-col justify-between hover:border-[#c9a96e]/40 transition-all gap-2 sm:gap-3 group"
						>
							<div className="space-y-2">
								<div className="relative aspect-[16/10] w-full rounded-lg sm:rounded-xl overflow-hidden bg-black/50 border border-white/10 shadow-inner">
									<img
										src={coverImg}
										alt={template.name}
										loading="lazy"
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										onError={(e) => {
											const target = e.currentTarget;
											const current = target.src;
											if (current.endsWith(".webp")) {
												target.src = current.replace(/\.webp$/, ".jpg");
											} else if (current.endsWith(".jpg")) {
												target.src = current.replace(/\.jpg$/, ".png");
											} else if (!current.includes("hero")) {
												target.src = "https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp";
											}
										}}
									/>
									{template.category && (
										<span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md bg-black/85 text-[8px] sm:text-[10px] text-[#e8c98a] border border-[#c9a96e]/30 font-bold backdrop-blur-xs">
											{template.category}
										</span>
									)}
								</div>

								<div>
									<h3 className="text-xs sm:text-base font-bold text-white truncate group-hover:text-[#e8c98a] transition-colors">
										{template.name}
									</h3>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-white/5">
								<Link
									to="/admin/promosi-template/$id/aset"
									params={{ id: template.id }}
									className="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-semibold transition-all border border-white/5 active:scale-95 cursor-pointer"
								>
									<FolderTree className="size-3 sm:size-3.5 text-amber-400 shrink-0" />
									<span className="truncate">Aset CDN</span>
								</Link>

								<Link
									to="/admin/promosi-gambar"
									search={{ template: template.slug }}
									className="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-[6px] bg-[#c9a96e]/20 hover:bg-[#c9a96e]/30 text-[#e8c98a] text-[10px] sm:text-xs font-semibold transition-all border border-[#c9a96e]/30 active:scale-[0.98] cursor-pointer"
								>
									<Bot className="size-3 sm:size-3.5 shrink-0" />
									<span className="truncate">Studio AI</span>
								</Link>
							</div>
						</GlassCard>
					);
				})}
			</div>

			{filteredTemplates.length === 0 && (
				<div className="text-center py-12 text-white/40 text-xs">
					Template tidak ditemukan.
				</div>
			)}
		</div>
	);
}
