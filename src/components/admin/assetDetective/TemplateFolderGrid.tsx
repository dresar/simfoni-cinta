import React from "react";
import { TemplateFolderCard } from "./TemplateFolderCard";
import { FolderX, Sparkles } from "lucide-react";
import type { Template } from "@/lib/db/schema";

interface TemplateFolderGridProps {
	templates: Template[];
	onOpenFolder: (template: Template) => void;
	isLoading?: boolean;
}

export const TemplateFolderGrid: React.FC<TemplateFolderGridProps> = ({
	templates,
	onOpenFolder,
	isLoading = false
}) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
				{Array.from({ length: 18 }).map((_, i) => (
					<div
						key={i}
						className="h-36 bg-slate-900/60 border border-slate-800/60 rounded-xl animate-pulse p-3.5 flex flex-col justify-between"
					>
						<div className="flex justify-between items-start">
							<div className="w-10 h-10 bg-slate-800 rounded-lg" />
							<div className="w-16 h-4 bg-slate-800 rounded" />
						</div>
						<div className="space-y-1.5">
							<div className="w-3/4 h-3.5 bg-slate-800 rounded" />
							<div className="w-1/2 h-2.5 bg-slate-800 rounded" />
						</div>
						<div className="w-full h-3 bg-slate-800/80 rounded" />
					</div>
				))}
			</div>
		);
	}

	if (templates.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center">
				<FolderX className="w-12 h-12 text-slate-400 mb-3" />
				<h3 className="text-sm font-semibold text-slate-200">Tidak ada folder template</h3>
				<p className="text-xs text-slate-400 mt-1 max-w-sm">
					Coba sesuaikan kata kunci pencarian atau ubah filter kategori di atas.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
			{templates.map((tpl) => (
				<TemplateFolderCard
					key={tpl.id}
					template={tpl}
					onOpenFolder={onOpenFolder}
				/>
			))}
		</div>
	);
};
