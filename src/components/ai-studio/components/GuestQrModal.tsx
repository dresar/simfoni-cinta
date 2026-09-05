import { X, QrCode } from "lucide-react";

interface GuestQrModalProps {
	isOpen: boolean;
	onClose: () => void;
	guestName: string;
	guestGroup: string;
	coverImage?: string;
	accentColor?: string;
}

export function GuestQrModal({
	isOpen,
	onClose,
	guestName,
	guestGroup,
	coverImage,
	accentColor = "#c29b53",
}: GuestQrModalProps) {
	if (!isOpen) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="qr-modal-title"
			className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fade-in"
		>
			<div className="relative w-full max-w-[310px] bg-white text-stone-900 rounded-2xl overflow-hidden shadow-2xl animate-zoom-in border border-stone-200">
				<button
					type="button"
					onClick={onClose}
					className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
					aria-label="Tutup"
				>
					<X className="w-4 h-4" />
				</button>

				{coverImage ? (
					<div
						className="relative w-full h-24 bg-cover bg-center flex items-end p-3"
						style={{ backgroundImage: `url(${coverImage})` }}
					>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
						<div className="relative z-10 text-white">
							<span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
								Buku Tamu Digital
							</span>
							<h3 id="qr-modal-title" className="text-sm font-bold leading-tight">
								QR Presensi Kehadiran
							</h3>
						</div>
					</div>
				) : (
					<div
						className="w-full py-3 px-4 text-white"
						style={{ backgroundColor: accentColor }}
					>
						<span className="text-[10px] uppercase font-bold tracking-widest opacity-90">
							Buku Tamu Digital
						</span>
						<h3 id="qr-modal-title" className="text-sm font-bold leading-tight">
							QR Presensi Kehadiran
						</h3>
					</div>
				)}

				<div className="p-4 flex flex-col items-center text-center">
					<div className="p-3 bg-stone-50 border-2 border-stone-200 rounded-xl shadow-inner mb-3">
						<svg
							className="w-44 h-44 text-stone-900"
							viewBox="0 0 256 256"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect x="32" y="32" width="80" height="80" rx="16" />
							<rect x="48" y="48" width="48" height="48" rx="8" fill="#ffffff" />
							<rect x="58" y="58" width="28" height="28" rx="4" />

							<rect x="144" y="32" width="80" height="80" rx="16" />
							<rect x="160" y="48" width="48" height="48" rx="8" fill="#ffffff" />
							<rect x="170" y="58" width="28" height="28" rx="4" />

							<rect x="32" y="144" width="80" height="80" rx="16" />
							<rect x="48" y="160" width="48" height="48" rx="8" fill="#ffffff" />
							<rect x="58" y="170" width="28" height="28" rx="4" />

							<rect x="144" y="144" width="24" height="24" rx="4" />
							<rect x="176" y="144" width="24" height="24" rx="4" />
							<rect x="208" y="144" width="16" height="48" rx="4" />
							<rect x="144" y="176" width="40" height="16" rx="4" />
							<rect x="144" y="200" width="24" height="24" rx="4" />
							<rect x="176" y="200" width="48" height="24" rx="4" />
							<rect x="120" y="60" width="16" height="52" rx="4" />
							<rect x="60" y="120" width="52" height="16" rx="4" />
							<rect x="120" y="120" width="16" height="16" rx="4" />
							<rect x="120" y="144" width="16" height="32" rx="4" />
						</svg>
					</div>

					<div className="w-full border-t border-dashed border-stone-300 my-2" />

					<div className="w-full py-1">
						<p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
							Nama Tamu
						</p>
						<p className="text-sm font-bold text-stone-900 mt-0.5">
							{guestName || "Nama Tamu"}
						</p>

						<div className="mt-2">
							<span
								className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
								style={{ backgroundColor: accentColor }}
							>
								{guestGroup || "VIP"}
							</span>
						</div>

						<p className="text-[10px] text-stone-500 mt-3 leading-tight px-2">
							Tunjukkan kode QR ini kepada penerima tamu saat tiba di lokasi acara untuk presensi cepat.
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="w-full mt-3 py-2 px-4 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	);
}
