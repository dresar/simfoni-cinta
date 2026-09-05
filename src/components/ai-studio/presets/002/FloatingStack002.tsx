import { Play } from "lucide-react";

interface FloatingStack002Props {
	isPlaying: boolean;
	onTogglePlay: () => void;
	isPlayingAutoplay: boolean;
	onToggleAutoplay: () => void;
	onOpenQrModal: () => void;
	isOpen: boolean;
	whatsappNumber?: string;
	whatsappMessage?: string;
	accentColor?: string;
}

export function FloatingStack002({
	isPlaying,
	onTogglePlay,
	isPlayingAutoplay,
	onToggleAutoplay,
	onOpenQrModal,
	isOpen,
	whatsappNumber = "6281234567890",
	whatsappMessage = "Selamat atas pernikahan kalian!",
	accentColor = "#B8966A",
}: FloatingStack002Props) {
	const handleWhatsapp = () => {
		const clean = whatsappNumber.replace(/[^0-9]/g, "");
		window.open(
			`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(whatsappMessage)}`,
			"_blank",
		);
	};

	return (
		<aside
			aria-label="Aksi Cepat"
			className={`absolute right-3.5 z-50 flex flex-col items-center gap-2.5 pointer-events-auto transition-all duration-300 ${
				isOpen ? "bottom-[96px]" : "bottom-8"
			}`}
		>
			<button
				type="button"
				onClick={handleWhatsapp}
				className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
				style={{ backgroundColor: "#25D366", border: "1.5px solid rgba(255,255,255,0.3)" }}
				title="WhatsApp"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
				</svg>
			</button>

			<button
				type="button"
				onClick={onOpenQrModal}
				className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
				style={{ backgroundColor: "#181818", border: "1.5px solid rgba(255,255,255,0.2)" }}
				title="QR Tamu"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffff" viewBox="0 0 256 256">
					<rect x="40" y="40" width="80" height="80" rx="16" />
					<rect x="40" y="136" width="80" height="80" rx="16" />
					<rect x="136" y="40" width="80" height="80" rx="16" />
					<path d="M144,184a8,8,0,0,0,8-8V144a8,8,0,0,0-16,0v32A8,8,0,0,0,144,184Z" />
					<path d="M208,152H184v-8a8,8,0,0,0-16,0v56H144a8,8,0,0,0,0,16h32a8,8,0,0,0,8-8V168h24a8,8,0,0,0,0-16Z" />
					<path d="M208,184a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V192A8,8,0,0,0,208,184Z" />
				</svg>
			</button>

			<button
				type="button"
				onClick={onToggleAutoplay}
				className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
				style={{
					backgroundColor: isPlayingAutoplay ? accentColor : "#181818",
					border: `1.5px solid ${isPlayingAutoplay ? accentColor : "rgba(255,255,255,0.2)"}`,
				}}
				title={isPlayingAutoplay ? "Jeda Otomatis" : "Putar Otomatis"}
			>
				{isPlayingAutoplay ? (
					<div className="flex items-center gap-1">
						<div className="w-1.5 h-3.5 rounded-full" style={{ backgroundColor: "#1C1207" }} />
						<div className="w-1.5 h-3.5 rounded-full" style={{ backgroundColor: "#1C1207" }} />
					</div>
				) : (
					<Play className="w-4 h-4 translate-x-0.5" style={{ fill: "#ffffff", color: "#ffffff" }} />
				)}
			</button>

			<button
				type="button"
				onClick={onTogglePlay}
				className="relative w-11 h-11 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden"
				style={{ backgroundColor: "#0F0F0F", border: `2px solid ${accentColor}` }}
				title={isPlaying ? "Jeda Musik" : "Putar Musik"}
			>
				<div
					className={`relative w-full h-full flex items-center justify-center ${isPlaying ? "animate-[spin_5s_linear_infinite]" : ""}`}
				>
					<div className="absolute inset-1.5 rounded-full" style={{ border: "1px solid #2a2a2a" }} />
					<div className="absolute inset-2.5 rounded-full" style={{ border: "1px solid #222" }} />
					<div
						className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center"
						style={{ backgroundColor: accentColor }}
					>
						<div className="w-1.5 h-1.5 rounded-full bg-black" />
					</div>
				</div>
			</button>
		</aside>
	);
}
