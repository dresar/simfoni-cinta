interface FloatingActionStackProps {
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

export function FloatingActionStack({
	isPlaying,
	onTogglePlay,
	isPlayingAutoplay,
	onToggleAutoplay,
	onOpenQrModal,
	isOpen,
	whatsappNumber = "6281234567890",
	whatsappMessage = "Selamat atas pernikahan kalian!",
	accentColor = "#BC9A53",
}: FloatingActionStackProps) {
	const handleWhatsapp = () => {
		const clean = whatsappNumber.replace(/[^0-9]/g, "");
		window.open(
			`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(whatsappMessage)}`,
			"_blank",
		);
	};

	return (
		<aside
			aria-label="Aksi Cepat Undangan"
			className={`absolute right-2.5 z-50 flex flex-col items-center gap-2 pointer-events-auto transition-all duration-300 ${
				isOpen ? "bottom-[86px]" : "bottom-6"
			}`}
		>
			<button
				type="button"
				onClick={handleWhatsapp}
				className="w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/30"
				style={{ backgroundColor: "#25D366" }}
				title="Ucapan WhatsApp"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
				</svg>
			</button>

			<button
				type="button"
				onClick={onOpenQrModal}
				className="w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/30"
				style={{ backgroundColor: accentColor }}
				title="QR Tamu"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="#ffffff">
					<path d="M68,68H108V108H68ZM148,68h40V108H148ZM68,148h40v40H68ZM164,148h8v8h-8ZM164,168h8v8h-8ZM172,160h8v8h-8ZM172,180h8v8h-8ZM180,148h8v8h-8ZM180,168h8v8h-8ZM28,28H120V120H28ZM44,44V104H104V44ZM28,136H120v84H28ZM44,152V204H104V152ZM136,28h84V120H136ZM152,44V104H204V44Z" />
				</svg>
			</button>

			<button
				type="button"
				onClick={onTogglePlay}
				className="w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/30"
				style={{ backgroundColor: accentColor }}
				title={isPlaying ? "Jeda Musik" : "Putar Musik"}
			>
				{isPlaying ? (
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
						<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
					</svg>
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
						<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
					</svg>
				)}
			</button>

			<button
				type="button"
				onClick={onToggleAutoplay}
				className="w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/30"
				style={{ backgroundColor: isPlayingAutoplay ? accentColor : `${accentColor}bb` }}
				title={isPlayingAutoplay ? "Jeda Otomatis" : "Putar Otomatis"}
			>
				{isPlayingAutoplay ? (
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
						<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
					</svg>
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
						<path d="M8 5v14l11-7z"/>
					</svg>
				)}
			</button>
		</aside>
	);
}
