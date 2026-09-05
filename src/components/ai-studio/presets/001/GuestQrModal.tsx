import { X, QrCode, Sparkles } from "lucide-react";

interface GuestQrModalProps {
	isOpen: boolean;
	onClose: () => void;
	guestName: string;
	guestGroup?: string;
	coverImage?: string;
	accentColor?: string;
}

export function GuestQrModal({
	isOpen,
	onClose,
	guestName,
	guestGroup = "Tamu Undangan VIP",
	coverImage,
	accentColor = "#c29b53",
}: GuestQrModalProps) {
	if (!isOpen) return null;

	const dummyQrMatrix = [
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
		[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0],
		[1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1],
		[1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
		[1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
	];

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
			<div
				className="relative w-full max-w-[320px] rounded-3xl p-5 shadow-2xl border border-white/20 text-center flex flex-col items-center animate-zoom-in"
				style={{ backgroundColor: "#200609" }}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-all cursor-pointer"
					title="Tutup"
				>
					<X className="w-4 h-4" />
				</button>

				<div
					className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shadow-md"
					style={{ backgroundColor: `${accentColor}33`, color: accentColor }}
				>
					<QrCode className="w-5 h-5" />
				</div>

				<h3 className="text-sm font-bold text-white tracking-tight">
					QR Presensi Kehadiran
				</h3>
				<p className="text-[11px] text-stone-300 mt-0.5">
					Tunjukkan kode ini saat tiba di meja resepsionis
				</p>

				<div className="w-full my-3 p-3 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner">
					<div className="grid grid-cols-17 gap-[2px] p-2 bg-white rounded-lg">
						{dummyQrMatrix.flatMap((row, rIdx) =>
							row.map((cell, cIdx) => (
								<div
									key={`qr-${rIdx}-${cIdx}`}
									className={`w-2.5 h-2.5 rounded-[1px] ${
										cell === 1 ? "bg-black" : "bg-transparent"
									}`}
								/>
							)),
						)}
					</div>
					<div className="text-[9px] font-mono font-bold tracking-widest text-stone-700 mt-1">
						AKSR-{Math.abs(guestName.split("").reduce((a, b) => a + b.charCodeAt(0), 1000)).toString(16).toUpperCase()}
					</div>
				</div>

				<div className="w-full bg-white/5 rounded-xl p-2.5 border border-white/10 text-center">
					<div className="text-xs font-bold text-white">{guestName}</div>
					<div
						className="text-[10px] font-semibold mt-0.5"
						style={{ color: accentColor }}
					>
						{guestGroup}
					</div>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 active:scale-98 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
					style={{ backgroundColor: accentColor }}
				>
					<Sparkles className="w-3.5 h-3.5" />
					<span>Tutup QR</span>
				</button>
			</div>
		</div>
	);
}
