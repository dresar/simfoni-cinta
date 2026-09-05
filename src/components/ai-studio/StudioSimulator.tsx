import { useState, type ReactNode } from "react";
import {
	Smartphone,
	Tablet,
	Maximize2,
	RotateCw,
	ZoomIn,
	ZoomOut,
	ExternalLink,
} from "lucide-react";
import type { ViewportDevice } from "./types";

interface StudioSimulatorProps {
	device: ViewportDevice;
	onDeviceChange: (device: ViewportDevice) => void;
	onRestartCover: () => void;
	selectedPresetId?: string;
	children: ReactNode;
}

export function StudioSimulator({
	device,
	onDeviceChange,
	onRestartCover,
	selectedPresetId = "adat-batak",
	children,
}: StudioSimulatorProps) {
	const [zoom, setZoom] = useState<number>(100);

	const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 130));
	const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 70));
	const handleResetZoom = () => setZoom(100);

	return (
		<div className="flex flex-col items-center justify-start w-full h-full p-2 sm:p-3 overflow-hidden select-none bg-stone-100/60 dark:bg-stone-950/60">
			<div className="flex items-center justify-between w-full max-w-xl px-3 py-1.5 mb-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex-shrink-0">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => onDeviceChange("mobile-sm")}
						className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
							device === "mobile-sm"
								? "bg-amber-600 text-white shadow-xs font-semibold"
								: "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
						}`}
						title="Mobile 375px"
					>
						<Smartphone className="w-3.5 h-3.5" />
						<span>375px</span>
					</button>

					<button
						type="button"
						onClick={() => onDeviceChange("mobile-lg")}
						className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
							device === "mobile-lg"
								? "bg-amber-600 text-white shadow-xs font-semibold"
								: "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
						}`}
						title="Mobile 414px"
					>
						<Smartphone className="w-3.5 h-3.5" />
						<span>414px</span>
					</button>

					<button
						type="button"
						onClick={() => onDeviceChange("tablet")}
						className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
							device === "tablet"
								? "bg-amber-600 text-white shadow-xs font-semibold"
								: "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
						}`}
						title="Tablet 540px"
					>
						<Tablet className="w-3.5 h-3.5" />
						<span>Tablet</span>
					</button>

					<button
						type="button"
						onClick={() => onDeviceChange("fullscreen")}
						className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
							device === "fullscreen"
								? "bg-amber-600 text-white shadow-xs font-semibold"
								: "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
						}`}
						title="Penuh"
					>
						<Maximize2 className="w-3.5 h-3.5" />
						<span>Penuh</span>
					</button>
				</div>

				<div className="flex items-center gap-1.5">
					<div className="flex items-center gap-0.5 border-r border-stone-200 dark:border-stone-800 pr-1.5">
						<button
							type="button"
							onClick={handleZoomOut}
							className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
							title="Perkecil"
						>
							<ZoomOut className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={handleResetZoom}
							className="text-[11px] font-mono px-1 py-0.5 rounded-sm hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold text-stone-600 dark:text-stone-300 cursor-pointer"
							title="Reset"
						>
							{zoom}%
						</button>
						<button
							type="button"
							onClick={handleZoomIn}
							className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
							title="Perbesar"
						>
							<ZoomIn className="w-3.5 h-3.5" />
						</button>
					</div>

					<button
						type="button"
						onClick={onRestartCover}
						className="h-7 px-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-lg flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all active:scale-95 cursor-pointer border border-amber-200 dark:border-amber-800/40"
						title="Reset Cover"
					>
						<RotateCw className="w-3.5 h-3.5" />
						<span>Reset</span>
					</button>

					<a
						href={`/demo-ai/${selectedPresetId}`}
						target="_blank"
						rel="noreferrer"
						className="h-7 px-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all active:scale-95"
						title="Buka Preview"
					>
						<ExternalLink className="w-3.5 h-3.5" />
						<span>Preview</span>
					</a>
				</div>
			</div>

			<div
				className="flex-1 w-full flex items-center justify-center overflow-hidden transition-transform duration-200"
				style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
			>
				{device === "fullscreen" ? (
					<div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-stone-950 p-2 sm:p-4">
						<div className="relative w-full h-full max-w-[430px] shadow-2xl bg-black rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between">
							{children}
						</div>
					</div>
				) : (
					<div
						className={`relative rounded-3xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)] bg-black overflow-hidden border-2 border-stone-800 dark:border-stone-700 flex flex-col transition-all duration-300 ${
							device === "tablet"
								? "h-[calc(100vh-120px)] max-h-[820px] w-[540px]"
								: device === "mobile-sm"
									? "h-[calc(100vh-120px)] max-h-[760px] w-[375px]"
									: "h-[calc(100vh-120px)] max-h-[820px] w-[414px]"
						}`}
					>
						<div className="relative flex-1 w-full h-full overflow-hidden flex flex-col bg-stone-900">
							{children}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
