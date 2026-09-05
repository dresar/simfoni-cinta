import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	ArrowLeft,
	ExternalLink,
	Sparkles,
	RotateCcw,
	Smartphone,
	FileText,
	Image as ImageIcon,
	Palette,
	Check,
} from "lucide-react";
import { TEMPLATE_REGISTRY } from "@/components/ai-studio/templates/registry";
import {
	DEFAULT_BATAK_ASSETS,
	DEFAULT_BATAK_DATA,
	DEFAULT_BATAK_THEME,
} from "@/components/ai-studio/templates/TemplateAdatBatak";
import { Preset001 } from "@/components/ai-studio/presets/001/Preset001";
import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
} from "@/components/ai-studio/types";

export const Route = createFileRoute("/admin/templates-ai")({
	component: AiTemplateStudioPage,
});

const DEMO_BATAK_ASSET_OPTIONS = [
	{
		id: "couple-photo",
		label: "Foto Pasangan",
		url: "/demo/batak-merah/assets/images/57164-gallery-1686266235.jpg",
	},
	{
		id: "bg-cover",
		label: "Latar Ulos",
		url: "/demo/batak-merah/assets/images/bg.webp",
	},
	{
		id: "rumah-tl",
		label: "Rumah Kiri",
		url: "/demo/batak-merah/assets/images/tl-2.webp",
	},
	{
		id: "rumah-tr",
		label: "Rumah Kanan",
		url: "/demo/batak-merah/assets/images/tr-2.webp",
	},
	{
		id: "border-tl",
		label: "Pita Samping",
		url: "/demo/batak-merah/assets/images/tl-1.webp",
	},
	{
		id: "shrub-bm",
		label: "Semak Bawah",
		url: "/demo/batak-merah/assets/images/bm.webp",
	},
	{
		id: "gallery-1",
		label: "Galeri 1",
		url: "/demo/batak-merah/assets/images/57164-gallery-1686267141.jpg",
	},
	{
		id: "gallery-2",
		label: "Galeri 2",
		url: "/demo/batak-merah/assets/images/57164-gallery-1686267285.jpg",
	},
	{
		id: "gallery-3",
		label: "Galeri 3",
		url: "/demo/batak-merah/assets/images/57164-gallery-1686267284.jpg",
	},
];

const THEME_PALETTES: {
	name: string;
	theme: PresetThemeTokens;
}[] = [
	{
		name: "Batak Maroon Gold",
		theme: DEFAULT_BATAK_THEME,
	},
	{
		name: "Royal Emerald Gold",
		theme: {
			invBg: "#0B2B26",
			invBase: "#ffffff",
			invAccent: "#D4AF37",
			invBorder: "#051A17",
			menuBg: "#051A17",
			menuInactive: "#cbd5e1",
			menuActive: "#D4AF37",
			fontBase: "serif",
			fontAccent: "serif",
			fontLatin: "serif",
		},
	},
	{
		name: "Midnight Obsidian",
		theme: {
			invBg: "#121214",
			invBase: "#ffffff",
			invAccent: "#E5A93C",
			invBorder: "#0A0A0C",
			menuBg: "#0A0A0C",
			menuInactive: "#94a3b8",
			menuActive: "#E5A93C",
			fontBase: "serif",
			fontAccent: "serif",
			fontLatin: "serif",
		},
	},
];

function AiTemplateStudioPage() {
	const currentTemplate = TEMPLATE_REGISTRY["adat-batak"];
	const [activeTab, setActiveTab] = useState<"data" | "assets" | "theme">(
		"data",
	);
	const [mobileView, setMobileView] = useState<"form" | "preview">("preview");

	const [customData, setCustomData] =
		useState<InvitationData>(DEFAULT_BATAK_DATA);
	const [customAssets, setCustomAssets] =
		useState<AssetSlots>(DEFAULT_BATAK_ASSETS);
	const [customTheme, setCustomTheme] =
		useState<PresetThemeTokens>(DEFAULT_BATAK_THEME);

	const handleResetDefault = () => {
		setCustomData(DEFAULT_BATAK_DATA);
		setCustomAssets(DEFAULT_BATAK_ASSETS);
		setCustomTheme(DEFAULT_BATAK_THEME);
	};

	const handleSelectAssetForSlot = (
		slotKey: keyof AssetSlots,
		assetUrl: string,
	) => {
		setCustomAssets((prev) => ({
			...prev,
			[slotKey]: assetUrl,
		}));
	};

	return (
		<div className="min-h-screen w-full bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans select-none flex flex-col">
			<header className="sticky top-0 z-30 h-14 px-4 sm:px-6 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md flex items-center justify-between flex-shrink-0">
				<div className="flex items-center gap-3">
					<a
						href="/admin"
						className="h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
						title="Kembali"
					>
						<ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
						<span>Kembali</span>
					</a>

					<div className="h-4 w-px bg-stone-300 dark:bg-stone-700 hidden sm:block" />

					<div className="flex items-center gap-2">
						<div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-xs">
							<Sparkles className="w-4 h-4" />
						</div>
						<div>
							<h1 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
								AI Template Studio
							</h1>
						</div>
						<span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
							Preset 001
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex sm:hidden items-center bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg">
						<button
							type="button"
							onClick={() => setMobileView("form")}
							className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
								mobileView === "form"
									? "bg-white dark:bg-stone-900 shadow-xs text-amber-600"
									: "text-stone-600 dark:text-stone-400"
							}`}
						>
							Form
						</button>
						<button
							type="button"
							onClick={() => setMobileView("preview")}
							className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
								mobileView === "preview"
									? "bg-white dark:bg-stone-900 shadow-xs text-amber-600"
									: "text-stone-600 dark:text-stone-400"
							}`}
						>
							Preview
						</button>
					</div>

					<button
						type="button"
						onClick={handleResetDefault}
						className="h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
						title="Reset Data"
					>
						<RotateCcw className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">Reset</span>
					</button>

					<a
						href={`/demo-ai/${currentTemplate.id}`}
						target="_blank"
						rel="noreferrer"
						className="h-8 px-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
					>
						<ExternalLink className="w-3.5 h-3.5" />
						<span>Tab Baru</span>
					</a>
				</div>
			</header>

			<div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
				<div
					className={`lg:col-span-7 flex flex-col gap-4 ${
						mobileView === "preview" ? "hidden lg:flex" : "flex"
					}`}
				>
					<div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<img
								src={currentTemplate.thumbnailUrl || customAssets.couplePhoto}
								alt={currentTemplate.name}
								className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
							/>
							<div>
								<div className="flex items-center gap-1.5">
									<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
										{currentTemplate.category}
									</span>
									<span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
										11 Slide Aktif
									</span>
								</div>
								<h2 className="font-bold text-sm text-stone-900 dark:text-stone-100 tracking-tight mt-0.5">
									{currentTemplate.name}
								</h2>
							</div>
						</div>

						<div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
							<button
								type="button"
								onClick={() => setActiveTab("data")}
								className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
									activeTab === "data"
										? "bg-white dark:bg-stone-900 text-amber-600 shadow-xs"
										: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
								}`}
							>
								<FileText className="w-3.5 h-3.5" />
								<span>Data</span>
							</button>

							<button
								type="button"
								onClick={() => setActiveTab("assets")}
								className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
									activeTab === "assets"
										? "bg-white dark:bg-stone-900 text-amber-600 shadow-xs"
										: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
								}`}
							>
								<ImageIcon className="w-3.5 h-3.5" />
								<span>Aset</span>
							</button>

							<button
								type="button"
								onClick={() => setActiveTab("theme")}
								className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
									activeTab === "theme"
										? "bg-white dark:bg-stone-900 text-amber-600 shadow-xs"
										: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
								}`}
							>
								<Palette className="w-3.5 h-3.5" />
								<span>Warna</span>
							</button>
						</div>
					</div>

					{activeTab === "data" && (
						<div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col gap-4">
							<div className="border-b border-stone-100 dark:border-stone-800 pb-2">
								<h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
									Data Tamu &amp; Undangan
								</h3>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Nama Tamu
									</label>
									<input
										type="text"
										value={customData.guestName}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												guestName: e.target.value,
											}))
										}
										placeholder="Nama Tamu"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>

								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Grup Tamu
									</label>
									<input
										type="text"
										value={customData.guestGroup}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												guestGroup: e.target.value,
											}))
										}
										placeholder="Grup Tamu"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>
							</div>

							<div className="border-b border-stone-100 dark:border-stone-800 pb-2 pt-2">
								<h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
									Data Kedua Mempelai
								</h3>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Panggilan Pria
									</label>
									<input
										type="text"
										value={customData.couple.groomName}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												couple: {
													...prev.couple,
													groomName: e.target.value,
												},
											}))
										}
										placeholder="Panggilan"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>

								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Nama Lengkap Pria
									</label>
									<input
										type="text"
										value={customData.couple.groomFullName}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												couple: {
													...prev.couple,
													groomFullName: e.target.value,
												},
											}))
										}
										placeholder="Nama Lengkap"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>

								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Panggilan Wanita
									</label>
									<input
										type="text"
										value={customData.couple.brideName}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												couple: {
													...prev.couple,
													brideName: e.target.value,
												},
											}))
										}
										placeholder="Panggilan"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>

								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Nama Lengkap Wanita
									</label>
									<input
										type="text"
										value={customData.couple.brideFullName}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												couple: {
													...prev.couple,
													brideFullName: e.target.value,
												},
											}))
										}
										placeholder="Nama Lengkap"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>
							</div>

							<div className="border-b border-stone-100 dark:border-stone-800 pb-2 pt-2">
								<h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
									Waktu &amp; Lokasi Acara
								</h3>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Tanggal Format
									</label>
									<input
										type="text"
										value={customData.weddingDateFormatted}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												weddingDateFormatted: e.target.value,
											}))
										}
										placeholder="Tanggal"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>

								<div>
									<label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
										Gedung / Tempat
									</label>
									<input
										type="text"
										value={customData.resepsi.venueName}
										onChange={(e) =>
											setCustomData((prev) => ({
												...prev,
												resepsi: {
													...prev.resepsi,
													venueName: e.target.value,
												},
											}))
										}
										placeholder="Tempat"
										className="w-full h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500"
									/>
								</div>
							</div>
						</div>
					)}

					{activeTab === "assets" && (
						<div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col gap-4">
							<div className="border-b border-stone-100 dark:border-stone-800 pb-2">
								<h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
									Pilih Gambar Aset Adat Batak
								</h3>
								<p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
									Klik aset di bawah untuk diterapkan langsung ke undangan:
								</p>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{DEMO_BATAK_ASSET_OPTIONS.map((asset) => (
									<div
										key={asset.id}
										className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col gap-2"
									>
										<div className="aspect-square w-full rounded-lg overflow-hidden bg-black/40 flex items-center justify-center p-1">
											<img
												src={asset.url}
												alt={asset.label}
												className="w-full h-full object-contain"
											/>
										</div>

										<div className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
											{asset.label}
										</div>

										<div className="grid grid-cols-2 gap-1 text-[9px]">
											<button
												type="button"
												onClick={() =>
													handleSelectAssetForSlot("couplePhoto", asset.url)
												}
												className="py-1 px-1 bg-stone-200 dark:bg-stone-700 hover:bg-amber-600 hover:text-white rounded font-medium transition-colors text-center cursor-pointer"
											>
												Pasangan
											</button>
											<button
												type="button"
												onClick={() =>
													handleSelectAssetForSlot("bgCover", asset.url)
												}
												className="py-1 px-1 bg-stone-200 dark:bg-stone-700 hover:bg-amber-600 hover:text-white rounded font-medium transition-colors text-center cursor-pointer"
											>
												Latar
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{activeTab === "theme" && (
						<div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col gap-4">
							<div className="border-b border-stone-100 dark:border-stone-800 pb-2">
								<h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
									Preset Palet Warna
								</h3>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{THEME_PALETTES.map((pal) => {
									const isSelected = customTheme.invBg === pal.theme.invBg;
									return (
										<button
											key={pal.name}
											type="button"
											onClick={() => setCustomTheme(pal.theme)}
											className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
												isSelected
													? "border-amber-500 bg-amber-50/20 shadow-xs ring-1 ring-amber-500"
													: "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
											}`}
										>
											<div className="flex items-center justify-between">
												<span className="text-xs font-bold text-stone-900 dark:text-stone-100">
													{pal.name}
												</span>
												{isSelected && (
													<Check className="w-3.5 h-3.5 text-amber-600" />
												)}
											</div>

											<div className="flex items-center gap-1.5">
												<span
													className="w-4 h-4 rounded-full border border-stone-300 shadow-xs"
													style={{ backgroundColor: pal.theme.invBg }}
												/>
												<span
													className="w-4 h-4 rounded-full border border-stone-300 shadow-xs"
													style={{ backgroundColor: pal.theme.invAccent }}
												/>
												<span
													className="w-4 h-4 rounded-full border border-stone-300 shadow-xs"
													style={{ backgroundColor: pal.theme.menuBg }}
												/>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<div
					className={`lg:col-span-5 flex flex-col items-center justify-center sticky top-20 ${
						mobileView === "form" ? "hidden lg:flex" : "flex"
					}`}
				>
					<div className="w-full max-w-[390px] flex items-center justify-between mb-2 px-2">
						<div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400">
							<Smartphone className="w-3.5 h-3.5" />
							<span>Pratinjau Mobile 390px</span>
						</div>
						<a
							href={`/demo-ai/${currentTemplate.id}`}
							target="_blank"
							rel="noreferrer"
							className="text-[11px] font-semibold text-amber-600 hover:underline flex items-center gap-1"
						>
							<span>Layar Penuh</span>
							<ExternalLink className="w-3 h-3" />
						</a>
					</div>

					<div className="relative w-[380px] max-w-full h-[760px] max-h-[88vh] rounded-none bg-black border border-stone-800 shadow-2xl overflow-hidden flex flex-col">
						<div className="relative flex-1 w-full h-full overflow-hidden bg-black">
							<Preset001
								assets={customAssets}
								data={customData}
								theme={customTheme}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
