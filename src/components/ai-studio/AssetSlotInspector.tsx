import { useState } from "react";
import {
	Image as ImageIcon,
	Music,
	Sliders,
	Palette,
	CheckCircle2,
	Layers,
	FileText,
	Settings2,
} from "lucide-react";
import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
	AnimationSettings,
} from "./types";

interface AssetSlotInspectorProps {
	assets: AssetSlots;
	data: InvitationData;
	theme: PresetThemeTokens;
	animations: AnimationSettings;
	selectedPresetId?: string;
	onSelectPreset?: (id: string) => void;
	onUpdateAssets: (updated: Partial<AssetSlots>) => void;
	onUpdateData: (updated: Partial<InvitationData>) => void;
	onUpdateTheme: (updated: Partial<PresetThemeTokens>) => void;
	onUpdateAnimations: (updated: Partial<AnimationSettings>) => void;
}

export function AssetSlotInspector({
	assets,
	data,
	theme,
	animations,
	selectedPresetId = "adat-batak",
	onSelectPreset,
	onUpdateAssets,
	onUpdateData,
	onUpdateTheme,
	onUpdateAnimations,
}: AssetSlotInspectorProps) {
	const [activeTab, setActiveTab] = useState<
		"assets" | "content" | "theme" | "animations"
	>("assets");

	const slotList: Array<{
		key: keyof AssetSlots;
		label: string;
		type: "image" | "audio" | "images";
		value?: string | string[];
	}> = [
		{ key: "bgCover", label: "Cover Background", type: "image", value: assets.bgCover },
		{ key: "frameTopLeft", label: "Ornamen Kiri Atas", type: "image", value: assets.frameTopLeft },
		{ key: "frameTopRight", label: "Ornamen Kanan Atas", type: "image", value: assets.frameTopRight },
		{ key: "frameBottom", label: "Ornamen Bawah", type: "image", value: assets.frameBottom },
		{ key: "motifBorder", label: "Batas Motif", type: "image", value: assets.motifBorder },
		{ key: "motifCenter", label: "Motif Tengah", type: "image", value: assets.motifCenter },
		{ key: "couplePhoto", label: "Foto Pasangan", type: "image", value: assets.couplePhoto },
		{ key: "groomPhoto", label: "Foto Pria", type: "image", value: assets.groomPhoto },
		{ key: "bridePhoto", label: "Foto Wanita", type: "image", value: assets.bridePhoto },
		{ key: "characterIllustration", label: "Ilustrasi Adat", type: "image", value: assets.characterIllustration },
		{ key: "audioUrl", label: "Musik Latar", type: "audio", value: assets.audioUrl },
	].filter((item) => Boolean(item.value));

	return (
		<div className="flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 w-full overflow-hidden text-stone-900 dark:text-stone-100">
			<div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-xs">
							<Settings2 className="w-4 h-4" />
						</div>
						<div>
							<h2 className="text-xs font-bold tracking-tight">Inspector Template</h2>
							<p className="text-[10px] text-stone-500">Parameter dan slot aset.</p>
						</div>
					</div>
				</div>

				{onSelectPreset && (
					<div className="mb-2.5 flex items-center gap-1 p-1 bg-stone-200/50 dark:bg-stone-800/60 rounded-lg overflow-x-auto">
						{[
							{ id: "adat-batak", label: "Adat Batak" },
							{ id: "aceh-jawa", label: "Aceh x Jawa" },
							{ id: "adat-aceh", label: "Adat Aceh" },
						].map((p) => (
							<button
								key={p.id}
								type="button"
								onClick={() => onSelectPreset(p.id)}
								className={`flex-1 py-1 px-2 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
									selectedPresetId === p.id
										? "bg-amber-600 text-white shadow-xs"
										: "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
								}`}
							>
								{p.label}
							</button>
						))}
					</div>
				)}

				<div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/60 dark:bg-stone-800/80 rounded-lg text-xs font-medium">
					<button
						type="button"
						onClick={() => setActiveTab("assets")}
						className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
							activeTab === "assets"
								? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-semibold shadow-xs"
								: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
						}`}
					>
						<Layers className="w-3 h-3" />
						<span>Slot</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("content")}
						className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
							activeTab === "content"
								? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-semibold shadow-xs"
								: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
						}`}
					>
						<FileText className="w-3 h-3" />
						<span>Data</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("theme")}
						className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
							activeTab === "theme"
								? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-semibold shadow-xs"
								: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
						}`}
					>
						<Palette className="w-3 h-3" />
						<span>Warna</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("animations")}
						className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
							activeTab === "animations"
								? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-semibold shadow-xs"
								: "text-stone-600 dark:text-stone-400 hover:text-stone-900"
						}`}
					>
						<Sliders className="w-3 h-3" />
						<span>Gerak</span>
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
				{activeTab === "assets" && (
					<div className="space-y-2.5">
						<div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-stone-800">
							<span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
								Slot Aset
							</span>
							<span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
								<CheckCircle2 className="w-3 h-3" />
								{slotList.length} Aktif
							</span>
						</div>

						{slotList.map((slot) => (
							<div
								key={slot.key}
								className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center gap-2.5"
							>
								{slot.type === "image" && typeof slot.value === "string" ? (
									<div className="w-10 h-10 rounded-md border bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
										<img
											src={slot.value}
											alt={slot.label}
											className="w-full h-full object-cover"
										/>
									</div>
								) : slot.type === "audio" ? (
									<div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0">
										<Music className="w-4 h-4" />
									</div>
								) : (
									<div className="w-10 h-10 rounded-md bg-stone-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
										<ImageIcon className="w-4 h-4 text-stone-500" />
									</div>
								)}

								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold truncate leading-tight">
										{slot.label}
									</p>
									<p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate mt-0.5">
										{String(slot.value)}
									</p>
								</div>
							</div>
						))}
					</div>
				)}

				{activeTab === "content" && (
					<div className="space-y-3">
						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Nama Tamu
							</label>
							<input
								type="text"
								value={data.guestName}
								onChange={(e) => onUpdateData({ guestName: e.target.value })}
								placeholder="Nama"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Tombol Buka
							</label>
							<input
								type="text"
								value={data.openButtonText || ""}
								onChange={(e) => onUpdateData({ openButtonText: e.target.value })}
								placeholder="Buka"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								WhatsApp
							</label>
							<input
								type="text"
								value={data.contactWhatsappNumber || ""}
								onChange={(e) => onUpdateData({ contactWhatsappNumber: e.target.value })}
								placeholder="Telepon"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Pengantin Pria
							</label>
							<input
								type="text"
								value={data.couple.groomName}
								onChange={(e) =>
									onUpdateData({
										couple: { ...data.couple, groomName: e.target.value },
									})
								}
								placeholder="Nama"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs mb-1"
							/>
							<input
								type="text"
								value={data.couple.groomFullName}
								onChange={(e) =>
									onUpdateData({
										couple: { ...data.couple, groomFullName: e.target.value },
									})
								}
								placeholder="Lengkap"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Pengantin Wanita
							</label>
							<input
								type="text"
								value={data.couple.brideName}
								onChange={(e) =>
									onUpdateData({
										couple: { ...data.couple, brideName: e.target.value },
									})
								}
								placeholder="Nama"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs mb-1"
							/>
							<input
								type="text"
								value={data.couple.brideFullName}
								onChange={(e) =>
									onUpdateData({
										couple: { ...data.couple, brideFullName: e.target.value },
									})
								}
								placeholder="Lengkap"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Tanggal
							</label>
							<input
								type="text"
								value={data.weddingDateFormatted}
								onChange={(e) =>
									onUpdateData({ weddingDateFormatted: e.target.value })
								}
								placeholder="Tanggal"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Venue
							</label>
							<input
								type="text"
								value={data.resepsi.venueName}
								onChange={(e) =>
									onUpdateData({
										resepsi: { ...data.resepsi, venueName: e.target.value },
									})
								}
								placeholder="Venue"
								className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
							/>
						</div>
					</div>
				)}

				{activeTab === "theme" && (
					<div className="space-y-3">
						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Latar Belakang
							</label>
							<div className="flex items-center gap-2">
								<input
									type="color"
									value={theme.invBg}
									onChange={(e) => onUpdateTheme({ invBg: e.target.value })}
									className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
								/>
								<span className="text-xs font-mono">{theme.invBg}</span>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Aksen Utama
							</label>
							<div className="flex items-center gap-2">
								<input
									type="color"
									value={theme.invAccent}
									onChange={(e) => onUpdateTheme({ invAccent: e.target.value })}
									className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
								/>
								<span className="text-xs font-mono">{theme.invAccent}</span>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Warna Menu Bawah
							</label>
							<div className="flex items-center gap-2">
								<input
									type="color"
									value={theme.menuBg}
									onChange={(e) => onUpdateTheme({ menuBg: e.target.value })}
									className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
								/>
								<span className="text-xs font-mono">{theme.menuBg}</span>
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
								Indikator Menu Aktif
							</label>
							<div className="flex items-center gap-2">
								<input
									type="color"
									value={theme.menuActive}
									onChange={(e) => onUpdateTheme({ menuActive: e.target.value })}
									className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
								/>
								<span className="text-xs font-mono">{theme.menuActive}</span>
							</div>
						</div>
					</div>
				)}

				{activeTab === "animations" && (
					<div className="space-y-3 text-xs">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={animations.enableSway}
								onChange={(e) =>
									onUpdateAnimations({ enableSway: e.target.checked })
								}
								className="rounded text-amber-600 cursor-pointer"
							/>
							<span>Goyang Sudut</span>
						</label>

						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={animations.enableEntranceExit}
								onChange={(e) =>
									onUpdateAnimations({ enableEntranceExit: e.target.checked })
								}
								className="rounded text-amber-600 cursor-pointer"
							/>
							<span>Animasi Transisi</span>
						</label>
					</div>
				)}
			</div>
		</div>
	);
}
