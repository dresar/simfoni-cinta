import React from "react";
import { Volume2, VolumeX, Play, Pause, MessageCircle } from "lucide-react";

interface FloatingStackDefaultProps {
	isPlaying: boolean;
	onTogglePlay: () => void;
	isPlayingAutoplay: boolean;
	onToggleAutoplay: () => void;
	isOpen: boolean;
	whatsappNumber?: string;
	whatsappMessage?: string;
	accentColor?: string;
}

export function FloatingStackDefault({
	isPlaying,
	onTogglePlay,
	isPlayingAutoplay,
	onToggleAutoplay,
	isOpen,
	whatsappNumber = "6281234567890",
	whatsappMessage = "Halo! Selamat atas pernikahannya.",
	accentColor = "#0f172a",
}: FloatingStackDefaultProps) {
	const handleWhatsapp = () => {
		const clean = whatsappNumber.replace(/[^0-9]/g, "");
		window.open(
			`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(whatsappMessage)}`,
			"_blank"
		);
	};

	return (
		<aside
			aria-label="Aksi Cepat"
			className={`absolute right-3 z-50 flex flex-col items-center gap-2 pointer-events-auto transition-all duration-300 ${
				isOpen ? "bottom-[84px]" : "bottom-5"
			}`}
		>
			<button
				type="button"
				onClick={handleWhatsapp}
				className="w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer bg-emerald-500 text-white border border-white/60"
				title="WhatsApp"
			>
				<MessageCircle className="w-4 h-4" />
			</button>

			<button
				type="button"
				onClick={onTogglePlay}
				className="w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer bg-white text-slate-800 border border-slate-200"
				title={isPlaying ? "Jeda Musik" : "Putar Musik"}
			>
				{isPlaying ? (
					<Volume2 className="w-4 h-4 text-slate-800" />
				) : (
					<VolumeX className="w-4 h-4 text-slate-400" />
				)}
			</button>

			<button
				type="button"
				onClick={onToggleAutoplay}
				className="w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer bg-white text-slate-800 border border-slate-200"
				title={isPlayingAutoplay ? "Jeda Otomatis" : "Putar Otomatis"}
			>
				{isPlayingAutoplay ? (
					<Pause className="w-4 h-4 text-blue-600" />
				) : (
					<Play className="w-4 h-4 text-slate-400" />
				)}
			</button>
		</aside>
	);
}
