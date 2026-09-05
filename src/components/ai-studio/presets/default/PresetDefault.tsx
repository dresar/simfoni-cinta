import React, { useState, useEffect, useRef } from "react";
import {
	MapPin,
	Calendar,
	Clock,
	Copy,
	Check,
	Send,
	Image,
	Heart,
	ExternalLink,
	User,
} from "lucide-react";
import type { PresetDefaultProps, SlideKeyDefault } from "./types";
import { DEFAULT_BLANK_THEME } from "./theme.config";
import { DEFAULT_BLANK_DATA } from "./data.config";
import { BottomNavDockDefault } from "./BottomNavDockDefault";
import { FloatingStackDefault } from "./FloatingStackDefault";

const ALL_SLIDE_KEYS: SlideKeyDefault[] = [
	"cover",
	"opening",
	"couple",
	"events",
	"location",
	"gallery",
	"gifts",
	"wishes",
	"closing",
];

export function PresetDefault({
	assets = {},
	data: inputData = {},
	theme: inputTheme = {},
	animations = {
		enableSway: false,
		swayIntensity: "subtle",
		enableEntranceExit: true,
		transitionDurationMs: 400,
	},
}: PresetDefaultProps) {
	const data = { ...DEFAULT_BLANK_DATA, ...inputData };
	const theme = { ...DEFAULT_BLANK_THEME, ...inputTheme };

	const [isOpen, setIsOpen] = useState(false);
	const [activeSlide, setActiveSlide] = useState<SlideKeyDefault>("cover");
	const [isPlaying, setIsPlaying] = useState(false);
	const [isAutoplay, setIsAutoplay] = useState(false);
	const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
	const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

	const [wishes, setWishes] = useState(data.greetings || []);
	const [wishName, setWishName] = useState("");
	const [wishMessage, setWishMessage] = useState("");
	const [wishPresence, setWishPresence] = useState<"Hadir" | "Ragu-ragu" | "Tidak Hadir">("Hadir");

	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const target = new Date(data.countdownTargetIso).getTime();
		const interval = setInterval(() => {
			const now = new Date().getTime();
			const diff = target - now;

			if (diff <= 0) {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
				clearInterval(interval);
				return;
			}

			setTimeLeft({
				days: Math.floor(diff / (1000 * 60 * 60 * 24)),
				hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
				minutes: Math.floor((diff / 1000 / 60) % 60),
				seconds: Math.floor((diff / 1000) % 60),
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [data.countdownTargetIso]);

	useEffect(() => {
		let timer: NodeJS.Timeout | null = null;
		if (isOpen && isAutoplay) {
			timer = setInterval(() => {
				setActiveSlide((curr) => {
					const idx = ALL_SLIDE_KEYS.indexOf(curr);
					const nextIdx = (idx + 1) % ALL_SLIDE_KEYS.length;
					return ALL_SLIDE_KEYS[nextIdx === 0 ? 1 : nextIdx];
				});
			}, 6000);
		}
		return () => {
			if (timer) clearInterval(timer);
		};
	}, [isOpen, isAutoplay]);

	const handleOpen = () => {
		setIsOpen(true);
		setSlideDirection("right");
		setActiveSlide("opening");
		if (audioRef.current && assets.audioUrl) {
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch(() => setIsPlaying(false));
		}
	};

	const handleSelectSlide = (key: SlideKeyDefault) => {
		const currIdx = ALL_SLIDE_KEYS.indexOf(activeSlide);
		const nextIdx = ALL_SLIDE_KEYS.indexOf(key);
		setSlideDirection(nextIdx >= currIdx ? "right" : "left");
		setActiveSlide(key);
	};

	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch(() => setIsPlaying(false));
		}
	};

	const handleCopy = (bankId: string, acc: string) => {
		navigator.clipboard.writeText(acc);
		setCopiedBankId(bankId);
		setTimeout(() => setCopiedBankId(null), 2500);
	};

	const handleWishSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!wishName.trim() || !wishMessage.trim()) return;

		setWishes((prev) => [
			{
				id: `wish-${Date.now()}`,
				name: wishName.trim(),
				presence: wishPresence,
				message: wishMessage.trim(),
				createdAt: "Baru saja",
			},
			...prev,
		]);
		setWishName("");
		setWishMessage("");
	};

	const slideAnimClass =
		slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

	return (
		<div
			className="relative w-full max-w-[360px] mx-auto h-full min-h-[100dvh] flex flex-col justify-between overflow-hidden font-sans select-none border-x border-slate-200"
			style={{
				backgroundColor: theme.invBg,
				color: theme.invBase,
			}}
		>
			{assets.audioUrl && (
				<audio ref={audioRef} src={assets.audioUrl} loop preload="auto" />
			)}

			<FloatingStackDefault
				isPlaying={isPlaying}
				onTogglePlay={togglePlay}
				isPlayingAutoplay={isAutoplay}
				onToggleAutoplay={() => setIsAutoplay((p) => !p)}
				isOpen={isOpen}
				whatsappNumber={data.contactWhatsappNumber}
				whatsappMessage={`Selamat atas pernikahan ${data.couple.groomName} & ${data.couple.brideName}!`}
				accentColor={theme.invAccent}
			/>

			<div className="relative flex-1 w-full h-full overflow-hidden flex flex-col z-10">
				{activeSlide === "cover" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-10 flex flex-col items-center">
							<span className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-semibold mb-2">
								{data.title || "The Wedding of"}
							</span>
							<h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
								{data.couple.groomName} &amp; {data.couple.brideName}
							</h1>
							<p className="text-xs text-slate-500 mt-2 font-medium">
								{data.weddingDateFormatted}
							</p>
						</div>

						<div className="w-48 h-48 my-auto rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
							<Image className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
							<span className="text-xs font-semibold text-slate-500">Slot Aset Cover</span>
							<span className="text-[10px] text-slate-400 mt-0.5">Latar Belakang Bersih</span>
						</div>

						<div className="w-full max-w-[280px] mx-auto flex flex-col items-center text-center pb-6">
							<div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs mb-3">
								<p className="text-xs text-slate-500 font-medium leading-tight">
									{data.guestGreetingPrefix}
									<br />
									{data.guestGreetingSub}
								</p>
								<div className="text-base font-bold text-slate-900 mt-1.5 tracking-wide">
									{data.guestName}
								</div>
							</div>

							<button
								type="button"
								onClick={handleOpen}
								className="h-10 px-8 rounded-full font-semibold text-xs tracking-wider shadow-sm flex items-center justify-center transition-all bg-slate-900 text-white hover:bg-slate-800 active:scale-95 cursor-pointer w-full"
							>
								{data.openButtonText || "Buka Undangan"}
							</button>
						</div>
					</div>
				)}

				{activeSlide === "opening" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Salam Pembuka
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">
								Assalamu'alaikum Wr. Wb.
							</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto text-center flex flex-col items-center gap-4">
							<div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
								<Heart className="w-5 h-5" />
							</div>

							<p className="text-xs leading-relaxed text-slate-600">
								Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami.
							</p>

							<div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center w-full">
								<p className="text-xs italic text-slate-600 leading-relaxed font-serif">
									"{data.sacredQuoteText}"
								</p>
								<p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
									— {data.sacredQuoteSource}
								</p>
							</div>
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Geser untuk melihat detail</span>
						</div>
					</div>
				)}

				{activeSlide === "couple" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Kedua Mempelai
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Profil Pasangan</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto flex flex-col gap-3">
							<div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3.5">
								<div className="w-14 h-14 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center flex-shrink-0 text-slate-400">
									<User className="w-6 h-6 opacity-60" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-slate-900">{data.couple.groomFullName}</h3>
									<p className="text-[11px] text-slate-500 mt-0.5">
										Putra dari Bpk. {data.couple.groomFather} &amp; Ibu {data.couple.groomMother}
									</p>
								</div>
							</div>

							<div className="flex justify-center text-slate-300">
								<Heart className="w-4 h-4" />
							</div>

							<div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3.5">
								<div className="w-14 h-14 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center flex-shrink-0 text-slate-400">
									<User className="w-6 h-6 opacity-60" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-slate-900">{data.couple.brideFullName}</h3>
									<p className="text-[11px] text-slate-500 mt-0.5">
										Putri dari Bpk. {data.couple.brideFather} &amp; Ibu {data.couple.brideMother}
									</p>
								</div>
							</div>
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Informasi Mempelai</span>
						</div>
					</div>
				)}

				{activeSlide === "events" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Rangkaian Acara
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Hari Bahagia</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto flex flex-col gap-3">
							<div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
								<div className="flex items-center gap-2 mb-1.5">
									<Calendar className="w-4 h-4 text-slate-600" />
									<h3 className="text-xs font-bold text-slate-900">{data.akad.title}</h3>
								</div>
								<p className="text-[11px] font-semibold text-slate-700">{data.akad.dayDate}</p>
								<div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
									<Clock className="w-3.5 h-3.5 text-slate-400" />
									<span>{data.akad.timeWindow}</span>
								</div>
								<p className="text-[11px] text-slate-600 mt-1.5">{data.akad.address}</p>
							</div>

							<div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
								<div className="flex items-center gap-2 mb-1.5">
									<Calendar className="w-4 h-4 text-slate-600" />
									<h3 className="text-xs font-bold text-slate-900">{data.resepsi.title}</h3>
								</div>
								<p className="text-[11px] font-semibold text-slate-700">{data.resepsi.dayDate}</p>
								<div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
									<Clock className="w-3.5 h-3.5 text-slate-400" />
									<span>{data.resepsi.timeWindow}</span>
								</div>
								<p className="text-[11px] text-slate-600 mt-1.5">{data.resepsi.address}</p>
							</div>

							<div className="grid grid-cols-4 gap-2 pt-1 text-center">
								<div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
									<div className="text-base font-bold text-slate-900">{timeLeft.days}</div>
									<div className="text-[9px] text-slate-500 uppercase font-semibold">Hari</div>
								</div>
								<div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
									<div className="text-base font-bold text-slate-900">{timeLeft.hours}</div>
									<div className="text-[9px] text-slate-500 uppercase font-semibold">Jam</div>
								</div>
								<div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
									<div className="text-base font-bold text-slate-900">{timeLeft.minutes}</div>
									<div className="text-[9px] text-slate-500 uppercase font-semibold">Menit</div>
								</div>
								<div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
									<div className="text-base font-bold text-slate-900">{timeLeft.seconds}</div>
									<div className="text-[9px] text-slate-500 uppercase font-semibold">Detik</div>
								</div>
							</div>
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Jadwal &amp; Hitung Mundur</span>
						</div>
					</div>
				)}

				{activeSlide === "location" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Denah Lokasi
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Peta &amp; Alamat</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto flex flex-col items-center">
							<div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 mb-3">
								<MapPin className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
								<span className="text-xs font-semibold text-slate-600">Slot Google Maps Embed</span>
								<span className="text-[10px] text-slate-400 mt-0.5">Iframe atau link peta interaktif</span>
							</div>

							<div className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-center">
								<h3 className="text-xs font-bold text-slate-900">{data.akad.venueName}</h3>
								<p className="text-[11px] text-slate-500 mt-1">{data.akad.address}</p>

								<a
									href={data.akad.mapsUrl || "https://maps.google.com"}
									target="_blank"
									rel="noreferrer"
									className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-all cursor-pointer"
								>
									<span>Buka Google Maps</span>
									<ExternalLink className="w-3.5 h-3.5" />
								</a>
							</div>
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Integrasi Lokasi</span>
						</div>
					</div>
				)}

				{activeSlide === "gallery" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Galeri Foto
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Momen Bahagia</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto grid grid-cols-2 gap-2.5">
							{[1, 2, 3, 4].map((num) => (
								<div
									key={num}
									className="h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400"
								>
									<Image className="w-5 h-5 mb-1 opacity-50" />
									<span className="text-[10px] font-medium text-slate-500">Slot Foto {num}</span>
								</div>
							))}
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Galeri Prewedding</span>
						</div>
					</div>
				)}

				{activeSlide === "gifts" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Tanda Kasih
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Amplop Digital</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto flex flex-col gap-3">
							<p className="text-xs text-slate-500 text-center">
								Doa restu Anda merupakan karunia terindah bagi kami. Apabila Anda ingin memberikan hadiah, silakan gunakan slot berikut:
							</p>

							{data.banks.map((b) => (
								<div key={b.bankId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
									<span className="text-[10px] uppercase font-bold text-slate-400">{b.bankName}</span>
									<div className="text-base font-bold text-slate-900 mt-0.5 tracking-wider">
										{b.accountNumber}
									</div>
									<p className="text-[11px] text-slate-500 mt-0.5">a.n. {b.accountHolder}</p>
									<button
										type="button"
										onClick={() => handleCopy(b.bankId, b.accountNumber)}
										className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
									>
										{copiedBankId === b.bankId ? (
											<>
												<Check className="w-3.5 h-3.5 text-emerald-600" />
												<span>Tersalin!</span>
											</>
										) : (
											<>
												<Copy className="w-3.5 h-3.5" />
												<span>Salin Rekening</span>
											</>
										)}
									</button>
								</div>
							))}
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Hadiah &amp; Rekening</span>
						</div>
					</div>
				)}

				{activeSlide === "wishes" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-6 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-6">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Doa &amp; Restu
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Buku Tamu &amp; RSVP</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto flex flex-col gap-2.5">
							<form onSubmit={handleWishSubmit} className="flex flex-col gap-2">
								<input
									type="text"
									value={wishName}
									onChange={(e) => setWishName(e.target.value)}
									placeholder="Nama Lengkap Anda"
									className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
								/>
								<div className="flex gap-1.5">
									{(["Hadir", "Ragu-ragu", "Tidak Hadir"] as const).map((opt) => (
										<button
											key={opt}
											type="button"
											onClick={() => setWishPresence(opt)}
											className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
												wishPresence === opt
													? "bg-slate-900 text-white border-slate-900"
													: "bg-slate-50 text-slate-600 border-slate-200"
											}`}
										>
											{opt}
										</button>
									))}
								</div>
								<textarea
									value={wishMessage}
									onChange={(e) => setWishMessage(e.target.value)}
									rows={2}
									placeholder="Tuliskan ucapan dan doa..."
									className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
								/>
								<button
									type="submit"
									className="w-full py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
								>
									<Send className="w-3.5 h-3.5" />
									<span>Kirim Ucapan</span>
								</button>
							</form>

							<div className="max-h-32 overflow-y-auto flex flex-col gap-1.5 pr-1">
								{wishes.map((w) => (
									<div key={w.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-left">
										<div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
											<span>{w.name}</span>
											<span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
												{w.presence}
											</span>
										</div>
										<p className="text-[11px] text-slate-600 mt-0.5">{w.message}</p>
									</div>
								))}
							</div>
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Interaktif RSVP &amp; Ucapan</span>
						</div>
					</div>
				)}

				{activeSlide === "closing" && (
					<div
						className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-5 overflow-hidden ${slideAnimClass}`}
					>
						<div className="w-full text-center pt-8">
							<span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Terima Kasih
							</span>
							<h2 className="text-xl font-bold text-slate-900 mt-0.5">Salam Hangat</h2>
						</div>

						<div className="w-full max-w-[300px] my-auto text-center flex flex-col items-center gap-3">
							<Heart className="w-8 h-8 text-slate-400" />
							<p className="text-xs leading-relaxed text-slate-600">
								Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
							</p>
							<div className="mt-2">
								<p className="text-xs text-slate-400">Kami yang berbahagia,</p>
								<h3 className="text-lg font-bold text-slate-900 mt-0.5">
									{data.couple.groomName} &amp; {data.couple.brideName}
								</h3>
							</div>
						</div>

						<div className="w-full pb-20 text-center">
							<span className="text-xs text-slate-400 font-medium">Slot Penutup Undangan</span>
						</div>
					</div>
				)}
			</div>

			{isOpen && (
				<BottomNavDockDefault
					activeSlide={activeSlide}
					onSelectSlide={handleSelectSlide}
					menuBg={theme.menuBg}
					activeColor={theme.menuActive}
					inactiveColor={theme.menuInactive}
				/>
			)}
		</div>
	);
}
