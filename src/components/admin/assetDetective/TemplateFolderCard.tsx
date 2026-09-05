import React from "react";
import { Folder, FolderOpen, ExternalLink, Sparkles, CheckCircle2, HardDrive, Music } from "lucide-react";
import type { Template } from "@/lib/db/schema";

interface TemplateFolderCardProps {
	template: Template;
	onOpenFolder: (template: Template) => void;
}

function getCategoryColor(category: string): { folder: string; badge: string; border: string } {
	if (category.includes("Adat")) {
		return {
			folder: "text-amber-400 fill-amber-500/20",
			badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
			border: "group-hover:border-amber-500/40"
		};
	}
	if (category.includes("Floral")) {
		return {
			folder: "text-emerald-400 fill-emerald-500/20",
			badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
			border: "group-hover:border-emerald-500/40"
		};
	}
	if (category.includes("Luxury")) {
		return {
			folder: "text-purple-400 fill-purple-500/20",
			badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
			border: "group-hover:border-purple-500/40"
		};
	}
	if (category.includes("Islami")) {
		return {
			folder: "text-teal-400 fill-teal-500/20",
			badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
			border: "group-hover:border-teal-500/40"
		};
	}
	if (category.includes("Vintage") || category.includes("Rustic")) {
		return {
			folder: "text-orange-400 fill-orange-500/20",
			badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
			border: "group-hover:border-orange-500/40"
		};
	}
	return {
		folder: "text-blue-400 fill-blue-500/20",
		badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
		border: "group-hover:border-blue-500/40"
	};
}

export const TemplateFolderCard: React.FC<TemplateFolderCardProps> = ({ template, onOpenFolder }) => {
	const theme = getCategoryColor(template.category);

	return (
		<div
			className={`group relative flex flex-col justify-between p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 ${theme.border} rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer select-none`}
			onClick={() => onOpenFolder(template)}
		>
			<div>
				<div className="flex items-start justify-between gap-2 mb-2.5">
					<div className="relative">
						<Folder className={`w-12 h-12 ${theme.folder} transition-transform duration-200 group-hover:scale-105`} />
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<Sparkles className="w-3.5 h-3.5 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
						</div>
					</div>

					<span className={`px-2 py-0.5 text-[10px] font-medium border rounded-md ${theme.badge} truncate max-w-[110px]`}>
						{template.category}
					</span>
				</div>

				<div className="space-y-0.5">
					<h3 className="text-xs font-semibold text-slate-100 group-hover:text-white truncate" title={template.name}>
						{template.name}
					</h3>
					<p className="text-[11px] font-mono text-slate-400 truncate">
						{template.slug}
					</p>
				</div>
			</div>

			<div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1 text-[11px] text-slate-400">
				<div className="flex items-center gap-1">
					<HardDrive className="w-3 h-3 text-slate-400" />
					<span>{template.assetsCount || 35} aset</span>
				</div>

				<div className="flex items-center gap-1.5">
					<a
						href={`/demo/${template.slug}`}
						target="_blank"
						rel="noreferrer"
						className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded transition-colors"
						title="Buka Demo"
						onClick={(e) => e.stopPropagation()}
					>
						<ExternalLink className="w-3.5 h-3.5" />
					</a>
				</div>
			</div>
		</div>
	);
};
