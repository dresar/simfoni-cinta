import { useState, useEffect, useRef } from "react";
import {
	Copy,
	Check,
	Send,
	MapPin,
	Calendar,
	Clock,
	Instagram,
	ExternalLink,
	Heart,
} from "lucide-react";
import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
	AnimationSettings,
} from "../../types";
import { BottomNavDock002, SLIDE_KEYS_002, type SlideKey002 } from "./BottomNavDock002";
import { FloatingStack002 } from "./FloatingStack002";
import { GuestQrModal } from "../001/GuestQrModal";

export interface Preset002Props {
	assets: AssetSlots;
	data: InvitationData;
	theme: PresetThemeTokens;
	animations?: AnimationSettings;
}

export function Preset002({
	assets,
	data,
	theme,
	animations = {
		enableSway: true,
		swayIntensity: "normal",
		enableEntranceExit: true,
		transitionDurationMs: 600,
	},
}: Preset002Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeSlide, setActiveSlide] = useState<SlideKey002>("cover");
	const [isPlaying, setIsPlaying] = useState(false);
	const [isAutoplay, setIsAutoplay] = useState(false);
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
	const [wishes, setWishes] = useState(data.greetings || []);
	const [wishName, setWishName] = useState("");
	const [wishMessage, setWishMessage] = useState("");
	const [wishPresence, setWishPresence] = useState<"Hadir" | "Ragu-ragu" | "Tidak Hadir">("Hadir");
	const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	const audioRef = useRef<HTMLAudioElement | null>(null);

	const accent = theme.invAccent || "#B8966A";
	const menuBg = theme.menuBg || "#1C1207";

	useEffect(() => {
		const target = new Date(data.countdownTargetIso).getTime();
		const interval = setInterval(() => {
			const diff = target - Date.now();
			if (diff > 0) {
				setTimeLeft({
					days: Math.floor(diff / (1000 * 60 * 60 * 24)),
					hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
					minutes: Math.floor((diff / 1000 / 60) % 60),
					seconds: Math.floor((diff / 1000) % 60),
				});
			} else {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [data.countdownTargetIso]);

	useEffect(() => {
		if (!isOpen || !isAutoplay) return;
		const timer = setInterval(() => {
			setActiveSlide((cur) => {
				const idx = SLIDE_KEYS_002.indexOf(cur);
				const next = (idx + 1) % SLIDE_KEYS_002.length;
				return SLIDE_KEYS_002[next === 0 ? 1 : next] as SlideKey002;
			});
		}, 6000);
		return () => clearInterval(timer);
	}, [isOpen, isAutoplay]);

	const handleOpen = () => {
		setIsOpen(true);
		setActiveSlide("opening");
		audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
	};

	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
		else audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
	};

	const handleCopy = (bankId: string, num: string) => {
		navigator.clipboard.writeText(num);
		setCopiedBankId(bankId);
		setTimeout(() => setCopiedBankId(null), 2500);
	};

	const handleWish = (e: React.FormEvent) => {
		e.preventDefault();
		if (!wishName.trim() || !wishMessage.trim()) return;
		setWishes((prev) => [
			{ id: `w-${Date.now()}`, name: wishName.trim(), presence: wishPresence, message: wishMessage.trim(), createdAt: "Baru saja" },
			...prev,
		]);
		setWishName("");
		setWishMessage("");
	};

	const slideHeader = (label: string, title: string) => (
		<div className="w-full pt-10 text-center z-10 flex-shrink-0">
			<span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70" style={{ color: accent }}>
				{label}
			</span>
			<h2 className="text-lg font-bold tracking-tight mt-0.5" style={{ color: theme.invBase || "#1C1207" }}>
				{title}
			</h2>
			<div className="mx-auto mt-1.5 h-px w-12 opacity-30" style={{ backgroundColor: accent }} />
		</div>
	);

	const card = (children: React.ReactNode, extraClass = "") => (
		<div
			className={`rounded-2xl border p-4 shadow-lg ${extraClass}`}
			style={{
				backgroundColor: `${menuBg}12`,
				borderColor: `${accent}30`,
				backdropFilter: "blur(10px)",
			}}
		>
			{children}
		</div>
	);

	return (
		<div
			className="relative w-full max-w-[360px] mx-auto h-full min-h-[100dvh] flex flex-col overflow-hidden select-none"
			style={{ backgroundColor: theme.invBg || "#F8F3EB", color: theme.invBase || "#1C1207" }}
		>
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
				style={{ backgroundImage: `url(${assets.bgCover})`, opacity: 0.15 }}
			/>

			<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
				{assets.frameTopLeft && (
					<img
						src={assets.frameTopLeft}
						alt=""
						className="absolute top-0 left-0 w-[42%] max-w-[180px] h-auto object-contain drop-shadow-lg"
						style={{ filter: `sepia(0.3) saturate(1.5) hue-rotate(-5deg)` }}
					/>
				)}
				{assets.frameTopRight && (
					<img
						src={assets.frameTopRight}
						alt=""
						className="absolute top-0 right-0 w-[42%] max-w-[180px] h-auto object-contain drop-shadow-lg"
						style={{ filter: `sepia(0.3) saturate(1.5) hue-rotate(-5deg)` }}
					/>
				)}
				{assets.frameBottom && (
					<img
						src={assets.frameBottom}
						alt=""
						className="absolute bottom-0 inset-x-0 w-full h-auto object-contain opacity-80"
						style={{ filter: `sepia(0.3) saturate(1.5) hue-rotate(-5deg)` }}
					/>
				)}
			</div>

			<audio ref={audioRef} src={assets.audioUrl} loop preload="auto" />

			<FloatingStack002
				isPlaying={isPlaying}
				onTogglePlay={togglePlay}
				isPlayingAutoplay={isAutoplay}
				onToggleAutoplay={() => setIsAutoplay((p) => !p)}
				onOpenQrModal={() => setIsQrModalOpen(true)}
				isOpen={isOpen}
				whatsappNumber={data.contactWhatsappNumber || ""}
				whatsappMessage={`Selamat atas pernikahan ${data.couple.groomName} & ${data.couple.brideName}!`}
				accentColor={accent}
			/>

			<GuestQrModal
				isOpen={isQrModalOpen}
				onClose={() => setIsQrModalOpen(false)}
				guestName={data.guestName}
				guestGroup={data.guestGroup}
				coverImage={assets.bgCover}
				accentColor={accent}
			/>

			<div className="relative flex-1 w-full h-full overflow-hidden flex flex-col z-20">
				{activeSlide === "cover" && (
					<div className="relative h-full w-full flex flex-col justify-between py-6 px-5 overflow-hidden animate-zoom-in">
						<div className="w-full text-center z-30 flex flex-col items-center pt-16">
							<div className="inline-block px-4 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-4 border" style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}12` }}>
								{data.title || "Undangan Pernikahan"}
							</div>
							<p className="text-sm font-medium mb-1 opacity-70" style={{ color: theme.invBase }}>
								Bismillahirrahmanirrahim
							</p>
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight px-2 leading-tight font-serif" style={{ color: theme.invBase }}>
								{data.couple.groomName}
							</h1>
							<div className="my-2 flex items-center gap-2 justify-center opacity-50">
								<div className="h-px w-8" style={{ backgroundColor: accent }} />
								<Heart className="w-3.5 h-3.5" style={{ color: accent }} />
								<div className="h-px w-8" style={{ backgroundColor: accent }} />
							</div>
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight px-2 leading-tight font-serif" style={{ color: theme.invBase }}>
								{data.couple.brideName}
							</h1>
						</div>

						<div className="w-full max-w-[270px] mx-auto z-40 flex flex-col items-center text-center gap-3 pb-8">
							<div
								className="w-full p-3.5 rounded-2xl border"
								style={{ backgroundColor: `${menuBg}14`, borderColor: `${accent}30` }}
							>
								<p className="text-[11px] leading-tight opacity-70" style={{ color: theme.invBase }}>
									{data.guestGreetingPrefix || "Kepada Yth."}
									<br />
									{data.guestGreetingSub || "Bapak/Ibu/Saudara/i"}
								</p>
								<div className="text-base font-bold mt-1.5" style={{ color: theme.invBase }}>
									{data.guestName}
								</div>
							</div>
							<button
								type="button"
								onClick={handleOpen}
								className="h-11 px-10 rounded-full font-bold text-[11px] tracking-widest uppercase shadow-xl flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer"
								style={{ backgroundColor: accent, color: "#ffffff" }}
							>
								{data.openButtonText || "Buka Undangan"}
							</button>
						</div>
					</div>
				)}

				{activeSlide === "opening" && (
					<div className="relative h-full w-full flex flex-col justify-between p-5 overflow-hidden animate-zoom-in">
						{slideHeader("Salam Pembuka", "Dengan Hormat")}
						<div className="w-full max-w-[290px] mx-auto my-auto z-10 flex flex-col gap-4">
							{card(
								<>
									<p className="text-[11px] leading-relaxed opacity-80 text-center" style={{ color: theme.invBase }}>
										Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu kepada kedua mempelai.
									</p>
									<div className="mt-3 pt-3 border-t text-center" style={{ borderColor: `${accent}25` }}>
										<p className="text-[9px] uppercase tracking-wider opacity-50 mb-1" style={{ color: theme.invBase }}>Yang Mengundang</p>
										<p className="text-[11px] font-bold" style={{ color: accent }}>
											Keluarga Besar {data.couple.groomName} & {data.couple.brideName}
										</p>
									</div>
								</>
							)}
						</div>
						<div className="pb-16 text-center">
							<p className="text-[9px] opacity-40 tracking-widest uppercase" style={{ color: theme.invBase }}>
								Aksara Cinta · Digital Wedding
							</p>
						</div>
					</div>
				)}

				{activeSlide === "couple" && (
					<div className="relative h-full w-full flex flex-col p-4 overflow-y-auto no-scrollbar animate-zoom-in pb-20">
						{slideHeader("Mempelai Bahagia", "Kedua Pengantin")}
						<div className="w-full max-w-[290px] mx-auto z-10 flex flex-col gap-3 mt-4">
							{[
								{ name: data.couple.groomFullName, sub: `Putra dari ${data.couple.groomFather} & ${data.couple.groomMother}`, ig: data.couple.groomInstagram, photo: assets.groomPhoto || assets.couplePhoto },
								{ name: data.couple.brideFullName, sub: `Putri dari ${data.couple.brideFather} & ${data.couple.brideMother}`, ig: data.couple.brideInstagram, photo: assets.bridePhoto || assets.couplePhoto },
							].map((person, i) => (
								<div
									key={i}
									className="p-3.5 rounded-2xl border flex items-center gap-3"
									style={{ backgroundColor: `${menuBg}12`, borderColor: `${accent}30` }}
								>
									<div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: `${accent}60` }}>
										<img src={person.photo || ""} alt={person.name} className="w-full h-full object-cover" />
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-[13px] font-bold truncate" style={{ color: theme.invBase }}>
											{person.name}
										</h3>
										<p className="text-[10px] mt-0.5 opacity-60 leading-tight" style={{ color: theme.invBase }}>
											{person.sub}
										</p>
										{person.ig && (
											<a
												href={`https://instagram.com/${person.ig.replace("@", "")}`}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 text-[9px] mt-1 hover:underline"
												style={{ color: accent }}
											>
												<Instagram className="w-2.5 h-2.5" />
												<span>{person.ig}</span>
											</a>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeSlide === "quotes" && (
					<div className="relative h-full w-full flex flex-col justify-between p-5 overflow-hidden animate-zoom-in">
						{slideHeader("Firman Cinta", "Kutipan Suci")}
						<div className="w-full max-w-[290px] mx-auto my-auto z-10">
							{card(
								<div className="text-center">
									<Heart className="w-5 h-5 mx-auto mb-3" style={{ color: accent }} />
									<p className="text-[12px] leading-relaxed italic font-serif" style={{ color: theme.invBase }}>
										&ldquo;{data.sacredQuoteText}&rdquo;
									</p>
									<p className="text-[10px] font-bold mt-3 tracking-wider uppercase opacity-70" style={{ color: accent }}>
										— {data.sacredQuoteSource}
									</p>
								</div>
							)}
						</div>
						<div className="pb-16 text-center">
							<p className="text-[9px] opacity-40 tracking-widest uppercase" style={{ color: theme.invBase }}>
								Aksara Cinta · Janji Suci
							</p>
						</div>
					</div>
				)}

				{activeSlide === "gallery" && (
					<div className="relative h-full w-full flex flex-col p-4 overflow-y-auto no-scrollbar animate-zoom-in pb-20">
						{slideHeader("Dokumentasi", "Galeri Bahagia")}
						<div className="w-full max-w-[290px] mx-auto z-10 mt-4 grid grid-cols-2 gap-2">
							<div className="col-span-2 rounded-xl overflow-hidden border aspect-video" style={{ borderColor: `${accent}30` }}>
								<img src={assets.couplePhoto || assets.galleryPhotos[0]} alt="Utama" className="w-full h-full object-cover" />
							</div>
							{assets.galleryPhotos.slice(0, 4).map((p, i) => (
								<div key={i} className="rounded-xl overflow-hidden border aspect-square" style={{ borderColor: `${accent}30` }}>
									<img src={p} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
								</div>
							))}
						</div>
					</div>
				)}

				{activeSlide === "events" && (
					<div className="relative h-full w-full flex flex-col p-4 overflow-y-auto no-scrollbar animate-zoom-in pb-20">
						{slideHeader("Jadwal Acara", "Waktu & Tempat")}
						<div className="w-full max-w-[290px] mx-auto z-10 flex flex-col gap-3 mt-4">
							{[data.akad, data.resepsi].map((ev, i) => (
								<div key={i} className="p-4 rounded-2xl border" style={{ backgroundColor: `${menuBg}12`, borderColor: `${accent}30` }}>
									<div className="flex items-center gap-2 mb-2">
										<div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
											{i === 0 ? <Calendar className="w-3 h-3" style={{ color: accent }} /> : <Heart className="w-3 h-3" style={{ color: accent }} />}
										</div>
										<h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
											{ev.title}
										</h3>
									</div>
									<p className="text-[12px] font-bold" style={{ color: theme.invBase }}>{ev.dayDate}</p>
									<p className="text-[10px] flex items-center gap-1 mt-0.5 opacity-70" style={{ color: theme.invBase }}>
										<Clock className="w-2.5 h-2.5" /> {ev.timeWindow}
									</p>
									<p className="text-[10px] font-semibold mt-1.5" style={{ color: theme.invBase }}>{ev.venueName}</p>
									<p className="text-[9px] opacity-60 mt-0.5 leading-relaxed" style={{ color: theme.invBase }}>{ev.address}</p>
								</div>
							))}
						</div>
					</div>
				)}

				{activeSlide === "countdown" && (
					<div className="relative h-full w-full flex flex-col justify-between p-5 overflow-hidden animate-zoom-in">
						{slideHeader("Menuju Hari Bahagia", "Hitung Mundur")}
						<div className="w-full max-w-[290px] mx-auto my-auto z-10 flex flex-col items-center gap-4">
							<div className="grid grid-cols-4 gap-2 w-full">
								{[
									{ label: "Hari", val: timeLeft.days },
									{ label: "Jam", val: timeLeft.hours },
									{ label: "Menit", val: timeLeft.minutes },
									{ label: "Detik", val: timeLeft.seconds },
								].map((item, i) => (
									<div
										key={i}
										className="p-2.5 rounded-2xl border text-center"
										style={{ backgroundColor: `${menuBg}12`, borderColor: `${accent}30` }}
									>
										<div className="text-xl font-bold font-mono" style={{ color: accent }}>
											{String(item.val).padStart(2, "0")}
										</div>
										<div className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5" style={{ color: theme.invBase }}>
											{item.label}
										</div>
									</div>
								))}
							</div>
							<p className="text-[11px] opacity-70 text-center" style={{ color: theme.invBase }}>
								{data.weddingDateFormatted}
							</p>
							<a
								href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(data.couple.groomName)}+%26+${encodeURIComponent(data.couple.brideName)}`}
								target="_blank"
								rel="noreferrer"
								className="px-6 py-2.5 rounded-full text-[11px] font-bold flex items-center gap-2 transition-all hover:brightness-105 active:scale-95"
								style={{ backgroundColor: accent, color: "#ffffff" }}
							>
								<Calendar className="w-3.5 h-3.5" />
								<span>Simpan ke Kalender</span>
							</a>
						</div>
						<div className="pb-16 text-center">
							<p className="text-[9px] opacity-40 tracking-widest uppercase" style={{ color: theme.invBase }}>
								Aksara Cinta · Waktu Mengikat Janji
							</p>
						</div>
					</div>
				)}

				{activeSlide === "location" && (
					<div className="relative h-full w-full flex flex-col justify-between p-5 overflow-hidden animate-zoom-in">
						{slideHeader("Denah & Petunjuk", "Lokasi Acara")}
						<div className="w-full max-w-[290px] mx-auto my-auto z-10 flex flex-col gap-3">
							{card(
								<div className="text-center">
									<MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: accent }} />
									<h3 className="text-[13px] font-bold" style={{ color: theme.invBase }}>{data.resepsi.venueName}</h3>
									<p className="text-[10px] mt-1 opacity-70 leading-relaxed" style={{ color: theme.invBase }}>{data.resepsi.address}</p>
								</div>
							)}
							<a
								href={data.resepsi.mapsUrl || "https://maps.google.com"}
								target="_blank"
								rel="noreferrer"
								className="w-full py-3 px-4 rounded-full text-[11px] font-bold flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-95"
								style={{ backgroundColor: accent, color: "#ffffff" }}
							>
								<ExternalLink className="w-3.5 h-3.5" />
								<span>Buka Google Maps</span>
							</a>
						</div>
						<div className="pb-16 text-center">
							<p className="text-[9px] opacity-40 tracking-widest uppercase" style={{ color: theme.invBase }}>
								Aksara Cinta · Panduan Rute
							</p>
						</div>
					</div>
				)}

				{activeSlide === "gifts" && (
					<div className="relative h-full w-full flex flex-col p-4 overflow-y-auto no-scrollbar animate-zoom-in pb-20">
						{slideHeader("Tanda Kasih", "Amplop Digital")}
						<div className="w-full max-w-[290px] mx-auto z-10 flex flex-col gap-3 mt-4">
							<p className="text-[10px] text-center opacity-60 leading-relaxed" style={{ color: theme.invBase }}>
								Doa restu Anda adalah hadiah terindah. Bagi yang ingin berbagi tanda kasih:
							</p>
							{data.banks.map((bank) => {
								const copied = copiedBankId === bank.bankId;
								return (
									<div
										key={bank.bankId}
										className="p-3.5 rounded-2xl border flex items-center justify-between gap-2"
										style={{ backgroundColor: `${menuBg}12`, borderColor: `${accent}30` }}
									>
										<div>
											<div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: accent }}>{bank.bankName}</div>
											<div className="text-[12px] font-mono font-bold mt-0.5" style={{ color: theme.invBase }}>{bank.accountNumber}</div>
											<div className="text-[9px] opacity-60 mt-0.5" style={{ color: theme.invBase }}>a.n. {bank.accountHolder}</div>
										</div>
										<button
											type="button"
											onClick={() => handleCopy(bank.bankId, bank.accountNumber)}
											className="h-8 px-3 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer flex-shrink-0"
											style={{ backgroundColor: copied ? "#059669" : accent, color: "#fff" }}
										>
											{copied ? <><Check className="w-3 h-3" /><span>Salin</span></> : <><Copy className="w-3 h-3" /><span>Salin</span></>}
										</button>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{activeSlide === "wishes" && (
					<div className="relative h-full w-full flex flex-col p-4 overflow-y-auto no-scrollbar animate-zoom-in pb-20">
						{slideHeader("Buku Tamu", "Kirim Doa Restu")}
						<div className="w-full max-w-[290px] mx-auto z-10 flex flex-col gap-3 mt-4">
							<form
								onSubmit={handleWish}
								className="p-3.5 rounded-2xl border flex flex-col gap-2"
								style={{ backgroundColor: `${menuBg}10`, borderColor: `${accent}30` }}
							>
								<input
									type="text"
									value={wishName}
									onChange={(e) => setWishName(e.target.value)}
									placeholder="Nama Anda"
									required
									className="w-full h-9 px-3 rounded-xl text-[11px] border focus:outline-none"
									style={{ backgroundColor: `${menuBg}15`, borderColor: `${accent}25`, color: theme.invBase }}
								/>
								<select
									value={wishPresence}
									onChange={(e) => setWishPresence(e.target.value as typeof wishPresence)}
									className="w-full h-9 px-3 rounded-xl text-[11px] border focus:outline-none cursor-pointer"
									style={{ backgroundColor: `${menuBg}15`, borderColor: `${accent}25`, color: theme.invBase }}
								>
									<option value="Hadir">Hadir</option>
									<option value="Ragu-ragu">Ragu-ragu</option>
									<option value="Tidak Hadir">Tidak Hadir</option>
								</select>
								<textarea
									value={wishMessage}
									onChange={(e) => setWishMessage(e.target.value)}
									placeholder="Ucapan & Doa..."
									rows={2}
									required
									className="w-full p-2.5 rounded-xl text-[11px] border focus:outline-none resize-none"
									style={{ backgroundColor: `${menuBg}15`, borderColor: `${accent}25`, color: theme.invBase }}
								/>
								<button
									type="submit"
									className="h-9 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
									style={{ backgroundColor: accent, color: "#fff" }}
								>
									<Send className="w-3 h-3" />
									<span>Kirim Ucapan</span>
								</button>
							</form>

							<div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
								{wishes.map((item) => (
									<div
										key={item.id}
										className="p-2.5 rounded-xl border text-[10px]"
										style={{ backgroundColor: `${menuBg}10`, borderColor: `${accent}20` }}
									>
										<div className="flex items-center justify-between font-bold" style={{ color: accent }}>
											<span>{item.name}</span>
											<span className="text-[9px] px-2 py-0.5 rounded-full opacity-60" style={{ backgroundColor: `${accent}18`, color: theme.invBase }}>
												{item.presence}
											</span>
										</div>
										<p className="mt-0.5 opacity-70" style={{ color: theme.invBase }}>{item.message}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{activeSlide === "closing" && (
					<div className="relative h-full w-full flex flex-col justify-between p-5 overflow-hidden animate-zoom-in">
						{slideHeader("Ucapan Terima Kasih", "Doa & Restu")}
						<div className="w-full max-w-[290px] mx-auto my-auto z-10">
							{card(
								<div className="text-center">
									<p className="text-[11px] leading-relaxed opacity-80" style={{ color: theme.invBase }}>
										Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.
									</p>
									<div className="my-3 h-px w-12 mx-auto opacity-25" style={{ backgroundColor: accent }} />
									<p className="text-[9px] uppercase tracking-wider opacity-50 mb-1" style={{ color: theme.invBase }}>
										Kami yang berbahagia
									</p>
									<h3 className="text-[15px] font-bold tracking-tight font-serif" style={{ color: accent }}>
										{data.couple.groomName} & {data.couple.brideName}
									</h3>
									<p className="text-[9px] mt-1 opacity-50" style={{ color: theme.invBase }}>
										Beserta Seluruh Keluarga Besar
									</p>
								</div>
							)}
						</div>
						<div className="pb-16 text-center">
							<p className="text-[9px] opacity-40 tracking-widest uppercase" style={{ color: theme.invBase }}>
								Aksara Cinta · Simfoni Cinta Digital
							</p>
						</div>
					</div>
				)}
			</div>

			{isOpen && (
				<BottomNavDock002
					activeSlide={activeSlide}
					onSelectSlide={setActiveSlide}
					accentColor={accent}
					bgColor={menuBg}
					textColor={theme.menuInactive || "#B8966A"}
					activeTextColor={theme.invBg || "#F8F3EB"}
				/>
			)}
		</div>
	);
}
