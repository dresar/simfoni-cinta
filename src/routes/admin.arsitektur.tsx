import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
	Network,
	Cpu,
	GitFork,
	Layers,
	RefreshCw,
	Maximize2,
	Minimize2,
	ExternalLink,
	FolderTree,
	GitCommit,
	Star,
	FileText,
	CheckCircle2,
	AlertCircle,
	Search,
	ShieldCheck,
	ArrowRight,
	Sparkles,
	Sliders,
	GitPullRequest,
	Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	fetchGraphifyStatsFn,
	triggerGraphifyRegenerateFn,
	type GraphifyStats,
} from "@/functions/graphify";

import graphHtml from "@/private/graphify/graph.html?raw";
import callflowHtml from "@/private/graphify/CALLFLOW.html?raw";
import treeHtml from "@/private/graphify/GRAPH_TREE.html?raw";

export const Route = createFileRoute("/admin/arsitektur")({
	loader: () => fetchGraphifyStatsFn(),
	component: AdminArsitekturPage,
});

type TabType =
	| "graph"
	| "callflow"
	| "tree"
	| "report-page"
	| "godnodes"
	| "communities";

function IsolatedViewer({
	htmlContent,
	title,
	isFullscreen,
}: {
	htmlContent: string;
	title: string;
	isFullscreen: boolean;
}) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (doc) {
				doc.open();
				doc.write(htmlContent);
				doc.close();
				return;
			}
		} catch {}
		try {
			iframe.srcdoc = htmlContent;
		} catch {}
	}, [htmlContent]);

	return (
		<iframe
			ref={iframeRef}
			title={title}
			sandbox="allow-scripts allow-same-origin allow-popups"
			className={cn(
				"w-full border-0 block bg-slate-950",
				isFullscreen ? "h-[calc(100vh-110px)]" : "h-[740px]",
			)}
		/>
	);
}

function AdminArsitekturPage() {
	const initialData = Route.useLoaderData();
	const [stats, setStats] = useState<GraphifyStats>(initialData);
	const [activeTab, setActiveTab] = useState<TabType>("graph");
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [regenerateStatus, setRegenerateStatus] = useState<{
		type: "success" | "error" | "info";
		message: string;
	} | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [mounted, setMounted] = useState(false);
	const iframeContainerRef = useRef<HTMLDivElement>(null);

	const loadData = async () => {
		try {
			const serverData = await fetchGraphifyStatsFn();
			if (serverData) {
				setStats(serverData);
			}
		} catch {}
	};

	useEffect(() => {
		setMounted(true);
		loadData();
	}, []);

	const handleRegenerate = async () => {
		setIsRegenerating(true);
		setRegenerateStatus({
			type: "info",
			message: "Memproses ekstraksi AST dan pembentukan klaster graf...",
		});

		try {
			const res = await triggerGraphifyRegenerateFn();
			if (res.success) {
				setRegenerateStatus({
					type: "success",
					message: "Peta arsitektur berhasil digenerate ulang dan disinkronkan!",
				});
				await loadData();
			} else {
				setRegenerateStatus({
					type: "info",
					message:
						"Mode private visualizer aktif. Data graf dimuat langsung dari memori aman aplikasi.",
				});
				await loadData();
			}
		} catch {
			setRegenerateStatus({
				type: "info",
				message: "Graf visual telah dimuat ulang dari snapshot memori aplikasi.",
			});
			await loadData();
		} finally {
			setIsRegenerating(false);
			setTimeout(() => {
				setRegenerateStatus(null);
			}, 5000);
		}
	};

	const toggleFullscreen = () => {
		setIsFullscreen((prev) => !prev);
	};

	const openInNewTab = (htmlContent: string) => {
		const blob = new Blob([htmlContent], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		window.open(url, "_blank");
	};

	const filteredGodNodes = (stats?.godNodes || []).filter((node) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return (
			node.label.toLowerCase().includes(q) ||
			node.sourceFile.toLowerCase().includes(q) ||
			node.community.toLowerCase().includes(q)
		);
	});

	const filteredCommunities = (stats?.topCommunities || []).filter((comm) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return (
			comm.name.toLowerCase().includes(q) ||
			comm.sampleNodes.some((sn) => sn.toLowerCase().includes(q))
		);
	});

	const getCurrentHtml = () => {
		if (activeTab === "callflow") return callflowHtml;
		if (activeTab === "tree") return treeHtml;
		return graphHtml;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
							<Network className="w-5 h-5" />
						</div>
						<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							Arsitektur & Knowledge Graph Sistem
						</h1>
						<Badge
							variant="outline"
							className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px]"
						>
							Private Admin
						</Badge>
					</div>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Eksplorasi visual AST (Abstract Syntax Tree), graph dependensi modul, God Nodes, dan alur panggilan sistem yang terenkapsulasi khusus panel admin.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRegenerate}
						disabled={isRegenerating}
						className="gap-2 text-xs h-8"
					>
						<RefreshCw
							className={cn("w-3.5 h-3.5", isRegenerating && "animate-spin")}
						/>
						{isRegenerating ? "Memproses Graf..." : "Generate Ulang Graf"}
					</Button>
					{(activeTab === "graph" ||
						activeTab === "callflow" ||
						activeTab === "tree") && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => openInNewTab(getCurrentHtml())}
							className="gap-2 text-xs h-8"
						>
							<ExternalLink className="w-3.5 h-3.5" />
							Buka Tab Baru
						</Button>
					)}
				</div>
			</div>

			{regenerateStatus && (
				<div
					className={cn(
						"flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-medium border transition-all",
						regenerateStatus.type === "success" &&
							"bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
						regenerateStatus.type === "error" &&
							"bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
						regenerateStatus.type === "info" &&
							"bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
					)}
				>
					{regenerateStatus.type === "success" && (
						<CheckCircle2 className="w-4 h-4 shrink-0" />
					)}
					{regenerateStatus.type === "error" && (
						<AlertCircle className="w-4 h-4 shrink-0" />
					)}
					{regenerateStatus.type === "info" && (
						<RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
					)}
					<span>{regenerateStatus.message}</span>
				</div>
			)}

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<Card className="p-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400">
							Total Simbol AST
						</span>
						<div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<Cpu className="w-4 h-4" />
						</div>
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold text-slate-900 dark:text-white">
							{stats?.totalNodes ?? 612}
						</span>
						<span className="text-xs text-slate-500 dark:text-slate-400">
							Node Terpetakan
						</span>
					</div>
					<div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
						<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
							Components & Routes
						</Badge>
					</div>
				</Card>

				<Card className="p-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400">
							Total Relasi Edges
						</span>
						<div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
							<GitFork className="w-4 h-4" />
						</div>
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold text-slate-900 dark:text-white">
							{stats?.totalEdges ?? 997}
						</span>
						<span className="text-xs text-slate-500 dark:text-slate-400">
							Koneksi Modul
						</span>
					</div>
					<div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
						<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
							Imports & Calls
						</Badge>
					</div>
				</Card>

				<Card className="p-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400">
							Klaster Komunitas
						</span>
						<div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<Layers className="w-4 h-4" />
						</div>
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-2xl font-bold text-slate-900 dark:text-white">
							{stats?.totalCommunities ?? 77}
						</span>
						<span className="text-xs text-slate-500 dark:text-slate-400">
							Klaster Fungsional
						</span>
					</div>
					<div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
						<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
							Modular Cohesion
						</Badge>
					</div>
				</Card>

				<Card className="p-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400">
							God Node Inti
						</span>
						<div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
							<Star className="w-4 h-4" />
						</div>
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-xl font-bold text-slate-900 dark:text-white truncate">
							{stats?.godNodes?.[0]?.label ?? "cn()"}
						</span>
						<span className="text-xs text-slate-500 dark:text-slate-400">
							({stats?.godNodes?.[0]?.degree ?? 235} relasi)
						</span>
					</div>
					<div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
						<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
							Pusat Gravitasi
						</Badge>
					</div>
				</Card>
			</div>

			<div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
				<div className="flex items-center gap-1">
					<Button
						variant={activeTab === "graph" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("graph")}
						className="gap-1.5 text-xs h-8"
					>
						<Network className="w-3.5 h-3.5" />
						Peta Visual Graf
					</Button>

					<Button
						variant={activeTab === "callflow" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("callflow")}
						className="gap-1.5 text-xs h-8"
					>
						<GitCommit className="w-3.5 h-3.5" />
						Alur Panggilan (Callflow)
					</Button>

					<Button
						variant={activeTab === "tree" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("tree")}
						className="gap-1.5 text-xs h-8"
					>
						<FolderTree className="w-3.5 h-3.5" />
						Pohon Kode (Tree)
					</Button>

					<Button
						variant={activeTab === "report-page" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("report-page")}
						className="gap-1.5 text-xs h-8"
					>
						<FileText className="w-3.5 h-3.5 text-amber-500" />
						Laporan Analisis Arsitektur
					</Button>

					<Button
						variant={activeTab === "godnodes" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("godnodes")}
						className="gap-1.5 text-xs h-8"
					>
						<Star className="w-3.5 h-3.5" />
						God Nodes
					</Button>

					<Button
						variant={activeTab === "communities" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActiveTab("communities")}
						className="gap-1.5 text-xs h-8"
					>
						<Layers className="w-3.5 h-3.5" />
						Klaster Komunitas
					</Button>
				</div>

				<div className="flex items-center gap-2">
					{(activeTab === "godnodes" || activeTab === "communities") && (
						<div className="relative w-48 sm:w-64">
							<Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
							<Input
								placeholder="Cari simbol / modul..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-8 pl-8 text-xs"
							/>
						</div>
					)}

					{(activeTab === "graph" ||
						activeTab === "callflow" ||
						activeTab === "tree") && (
						<Button
							variant="outline"
							size="sm"
							onClick={toggleFullscreen}
							className="h-8 px-2.5 text-xs gap-1"
							title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
						>
							{isFullscreen ? (
								<>
									<Minimize2 className="w-3.5 h-3.5" />
									<span>Kecilkan</span>
								</>
							) : (
								<>
									<Maximize2 className="w-3.5 h-3.5" />
									<span>Fullscreen</span>
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			<div
				ref={iframeContainerRef}
				className={cn(
					"transition-all duration-200",
					isFullscreen
						? "fixed inset-0 z-50 bg-slate-950 p-4 flex flex-col"
						: "relative",
				)}
			>
				{isFullscreen && (
					<div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
						<div className="flex items-center gap-2">
							<Network className="w-5 h-5 text-indigo-400" />
							<span className="font-semibold text-white text-sm">
								{activeTab === "graph" && "Peta Visual Interaktif Sistem (Private)"}
								{activeTab === "callflow" && "Alur Panggilan Arsitektur (Private)"}
								{activeTab === "tree" && "Hierarki Struktur Pohon Kode (Private)"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => openInNewTab(getCurrentHtml())}
								className="h-7 text-xs gap-1.5"
							>
								<ExternalLink className="w-3 h-3" />
								Tab Baru
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={toggleFullscreen}
								className="h-7 text-xs gap-1"
							>
								<Minimize2 className="w-3 h-3" />
								Tutup
							</Button>
						</div>
					</div>
				)}

				{activeTab === "graph" && (
					<Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-[#0f0f1a] shadow-xl flex-1">
						<div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
							<div className="flex items-center gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
								<span>Vis-Network 2D/3D Force Engine</span>
								<span className="text-slate-600">|</span>
								<span>Scroll untuk Zoom, Drag untuk Pan, Klik Simbol untuk Detail</span>
							</div>
							<Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300">
								Enkapsulasi Private
							</Badge>
						</div>
						{!mounted ? (
							<div
								className={cn(
									"w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2",
									isFullscreen ? "h-[calc(100vh-110px)]" : "h-[740px]",
								)}
							>
								<RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
								<span className="text-xs">Memuat visualizer graf privat...</span>
							</div>
						) : (
							<IsolatedViewer
								htmlContent={graphHtml}
								title="Interactive System Graph"
								isFullscreen={isFullscreen}
							/>
						)}
					</Card>
				)}

				{activeTab === "callflow" && (
					<Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-[#0f172a] shadow-xl flex-1">
						<div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
							<div className="flex items-center gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-sky-400" />
								<span>Mermaid Execution Sequence & Callflow Paths</span>
							</div>
							<Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300">
								Enkapsulasi Private
							</Badge>
						</div>
						{!mounted ? (
							<div
								className={cn(
									"w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2",
									isFullscreen ? "h-[calc(100vh-110px)]" : "h-[740px]",
								)}
							>
								<RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
								<span className="text-xs">Memuat alur panggilan privat...</span>
							</div>
						) : (
							<IsolatedViewer
								htmlContent={callflowHtml}
								title="System Callflow"
								isFullscreen={isFullscreen}
							/>
						)}
					</Card>
				)}

				{activeTab === "tree" && (
					<Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-[#f9f9f9] dark:bg-slate-900 shadow-xl flex-1">
						<div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
							<div className="flex items-center gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
								<span>D3 Collapsible Tree Hierarchy</span>
							</div>
							<Badge variant="outline" className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
								Enkapsulasi Private
							</Badge>
						</div>
						{!mounted ? (
							<div
								className={cn(
									"w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2",
									isFullscreen ? "h-[calc(100vh-110px)]" : "h-[740px]",
								)}
							>
								<RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
								<span className="text-xs">Memuat hierarki pohon kode privat...</span>
							</div>
						) : (
							<IsolatedViewer
								htmlContent={treeHtml}
								title="Graph Tree"
								isFullscreen={isFullscreen}
							/>
						)}
					</Card>
				)}

				{activeTab === "report-page" && (
					<div className="space-y-5">
						<Card className="p-5 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div>
									<div className="flex items-center gap-2">
										<Badge className="bg-indigo-600 text-white text-[11px]">
											Audit Arsitektur Sistem
										</Badge>
										<span className="text-xs text-slate-500">
											Graphify Engine v0.9.50
										</span>
									</div>
									<h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
										Laporan Komprehensif Arsitektur & Analisis Hub Sistem
									</h2>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
										Evaluasi otomatis modularitas, topologi relasi kode, God Nodes, dan integritas siklus impor codebase Simfoni Cinta.
									</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
										<ShieldCheck className="w-4 h-4" />
										<span>0 Siklus Impor (Bersih)</span>
									</div>
									<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-medium">
										<Zap className="w-4 h-4" />
										<span>98% Ekstraksi Otomatis</span>
									</div>
								</div>
							</div>
						</Card>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card className="p-4 border-slate-200 dark:border-slate-800">
								<div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
									<div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
										<Star className="w-4 h-4" />
									</div>
									<span>God Nodes Inti (Coupling Tinggi)</span>
								</div>
								<p className="text-[11px] text-slate-500 mt-1">
									Komponen pusat gravitasi yang menjadi fondasi konektivitas lintas halaman:
								</p>
								<div className="mt-3 space-y-2">
									<div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-xs">
										<span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">cn()</span>
										<Badge variant="default" className="text-[10px]">235 relasi</Badge>
									</div>
									<div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-xs">
										<span className="font-mono text-slate-700 dark:text-slate-300">compilerOptions</span>
										<Badge variant="secondary" className="text-[10px]">22 relasi</Badge>
									</div>
									<div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-xs">
										<span className="font-mono text-slate-700 dark:text-slate-300">buttonVariants</span>
										<Badge variant="secondary" className="text-[10px]">9 relasi</Badge>
									</div>
									<div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-xs">
										<span className="font-mono text-slate-700 dark:text-slate-300">scripts</span>
										<Badge variant="secondary" className="text-[10px]">7 relasi</Badge>
									</div>
									<div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-xs">
										<span className="font-mono text-slate-700 dark:text-slate-300">Reveal()</span>
										<Badge variant="secondary" className="text-[10px]">6 relasi</Badge>
									</div>
								</div>
							</Card>

							<Card className="p-4 border-slate-200 dark:border-slate-800">
								<div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
									<div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
										<GitPullRequest className="w-4 h-4" />
									</div>
									<span>Koneksi Tersembunyi (Surprising Calls)</span>
								</div>
								<p className="text-[11px] text-slate-500 mt-1">
									Jalur panggilan lintas file yang teridentifikasi oleh AST Engine:
								</p>
								<div className="mt-3 space-y-2">
									<div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-[11px] space-y-1">
										<div className="flex items-center justify-between font-mono font-medium text-slate-800 dark:text-slate-200">
											<span>MenubarShortcut()</span>
											<ArrowRight className="w-3 h-3 text-indigo-500" />
											<span className="text-indigo-500">cn()</span>
										</div>
										<span className="text-[10px] text-slate-400 block truncate">src/components/ui/menubar.tsx → utils.ts</span>
									</div>
									<div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-[11px] space-y-1">
										<div className="flex items-center justify-between font-mono font-medium text-slate-800 dark:text-slate-200">
											<span>SheetFooter()</span>
											<ArrowRight className="w-3 h-3 text-indigo-500" />
											<span className="text-indigo-500">cn()</span>
										</div>
										<span className="text-[10px] text-slate-400 block truncate">src/components/ui/sheet.tsx → utils.ts</span>
									</div>
									<div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-[11px] space-y-1">
										<div className="flex items-center justify-between font-mono font-medium text-slate-800 dark:text-slate-200">
											<span>BreadcrumbEllipsis()</span>
											<ArrowRight className="w-3 h-3 text-indigo-500" />
											<span className="text-indigo-500">cn()</span>
										</div>
										<span className="text-[10px] text-slate-400 block truncate">src/components/ui/breadcrumb.tsx → utils.ts</span>
									</div>
								</div>
							</Card>

							<Card className="p-4 border-slate-200 dark:border-slate-800">
								<div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
									<div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
										<ShieldCheck className="w-4 h-4" />
									</div>
									<span>Pemeriksaan Siklus & Integritas</span>
								</div>
								<p className="text-[11px] text-slate-500 mt-1">
									Kondisi siklus impor dan kesehatan dependency graph:
								</p>
								<div className="mt-3 space-y-2">
									<div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 shrink-0" />
										<div>
											<span className="font-semibold block">0 Circular Dependency</span>
											<span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
												Seluruh modul bebas ketergantungan melingkar.
											</span>
										</div>
									</div>
									<div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs flex items-center gap-2">
										<Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
										<div>
											<span className="font-semibold text-slate-900 dark:text-white block">Betweenness Centrality</span>
											<span className="text-[10px] text-slate-500">
												cn() bernilai 0.340 sebagai penghubung 18 klaster UI.
											</span>
										</div>
									</div>
								</div>
							</Card>
						</div>

						<Card className="p-5 border-slate-200 dark:border-slate-800">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className="text-sm font-semibold text-slate-900 dark:text-white">
										Daftar Komunitas Arsitektur & Kohesi Modul
									</h3>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
										Hasil clustering algoritma Leiden berdasarkan kepadatan koneksi antar file.
									</p>
								</div>
								<Badge variant="outline" className="text-xs">
									77 Total Komunitas
								</Badge>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
								<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
											sections-b.tsx
										</span>
										<Badge variant="secondary" className="text-[10px]">62 Node</Badge>
									</div>
									<p className="text-[11px] text-slate-500 mt-1">
										Komponen landing page, pricing, footer, dan komparasi fitur.
									</p>
								</div>

								<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
											devDependencies
										</span>
										<Badge variant="secondary" className="text-[10px]">48 Node</Badge>
									</div>
									<p className="text-[11px] text-slate-500 mt-1">
										Paket build Vite, ESLint, Prettier, dan compiler tooling.
									</p>
								</div>

								<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
											utils.ts
										</span>
										<Badge variant="secondary" className="text-[10px]">35 Node</Badge>
									</div>
									<p className="text-[11px] text-slate-500 mt-1">
										Komponen dialog, badge, pagination, dan helper formatting.
									</p>
								</div>

								<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
											sidebar.tsx
										</span>
										<Badge variant="secondary" className="text-[10px]">32 Node</Badge>
									</div>
									<p className="text-[11px] text-slate-500 mt-1">
										Komponen navigasi menu, context drawer, dan sidebar admin/dasbor.
									</p>
								</div>

								<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
											server.ts
										</span>
										<Badge variant="secondary" className="text-[10px]">13 Node</Badge>
									</div>
									<p className="text-[11px] text-slate-500 mt-1">
										Entry SSR, error boundary handler, dan server fetch logic.
									</p>
								</div>

								<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
									<div className="flex items-center justify-between">
										<span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
											routeTree.gen.ts
										</span>
										<Badge variant="secondary" className="text-[10px]">23 Node</Badge>
									</div>
									<p className="text-[11px] text-slate-500 mt-1">
										Router file-based otomatis TanStack Router & manifest rute.
									</p>
								</div>
							</div>
						</Card>

						<Card className="p-5 border-slate-200 dark:border-slate-800">
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white mb-2">
								<Sparkles className="w-4 h-4 text-indigo-500" />
								<span>Wawasan & Diagnostik Arsitektur Sistem</span>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
								<div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
									<span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
										Peran Strategis cn() Sebagai Bridge
									</span>
									<p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
										Fungsi cn() memiliki nilai betweenness centrality tertinggi (0.340) yang menghubungkan 18 komunitas komponen UI. Modifikasi pada lib/utils.ts harus dijaga tetap backwards-compatible karena mempengaruhi hampir seluruh elemen render visual.
									</p>
								</div>
								<div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
									<span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
										Isolasi Modul Landing Page
									</span>
									<p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
										Klaster sections-b.tsx dan sections-a.tsx terbukti memiliki kohesi modular yang baik untuk halaman publik tanpa mengikat modul logika backend undangan privat, menjaga performa loading awal tetap optimal.
									</p>
								</div>
							</div>
						</Card>
					</div>
				)}

				{activeTab === "godnodes" && (
					<Card className="p-4 border-slate-200 dark:border-slate-800">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h3 className="text-sm font-semibold text-slate-900 dark:text-white">
									Daftar God Nodes (Pusat Gravitasi & Komponen Paling Banyak Dipanggil)
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Komponen dan fungsi dengan tingkat coupling tinggi yang menjadi fondasi arsitektur sistem.
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								{filteredGodNodes.length} God Nodes Ditemukan
							</Badge>
						</div>

						<div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
							<table className="w-full text-left text-xs">
								<thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium">
									<tr>
										<th className="py-2.5 px-3">Peringkat</th>
										<th className="py-2.5 px-3">Nama Simbol / Fungsi</th>
										<th className="py-2.5 px-3">Jumlah Relasi (Degree)</th>
										<th className="py-2.5 px-3">File Sumber</th>
										<th className="py-2.5 px-3">Komunitas Klaster</th>
										<th className="py-2.5 px-3">Tipe</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
									{filteredGodNodes.map((node, idx) => (
										<tr
											key={node.id}
											className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
										>
											<td className="py-2.5 px-3 font-medium text-slate-500">
												#{idx + 1}
											</td>
											<td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
												<code>{node.label}</code>
											</td>
											<td className="py-2.5 px-3">
												<Badge
													variant={node.degree > 30 ? "default" : "secondary"}
													className="text-[11px] font-bold"
												>
													{node.degree} edges
												</Badge>
											</td>
											<td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
												{node.sourceFile}
											</td>
											<td className="py-2.5 px-3 text-slate-500">
												{node.community}
											</td>
											<td className="py-2.5 px-3">
												<Badge variant="outline" className="text-[10px]">
													{node.fileType}
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Card>
				)}

				{activeTab === "communities" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-semibold text-slate-900 dark:text-white">
									Klaster Komunitas & Modul Independen
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Pengelompokan modular otomatis berdasarkan kohesi dependensi internal.
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								{filteredCommunities.length} Klaster Ditampilkan
							</Badge>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{filteredCommunities.map((comm) => (
								<Card
									key={comm.name}
									className="p-3.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70"
								>
									<div className="flex items-center justify-between">
										<span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
											{comm.name}
										</span>
										<Badge variant="secondary" className="text-[10px]">
											{comm.count} Node
										</Badge>
									</div>
									<div className="mt-2.5 space-y-1">
										<span className="text-[11px] text-slate-500 block">
											Sample Komponen:
										</span>
										<div className="flex flex-wrap gap-1">
											{comm.sampleNodes.map((node) => (
												<span
													key={node}
													className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-mono"
												>
													{node}
												</span>
											))}
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
