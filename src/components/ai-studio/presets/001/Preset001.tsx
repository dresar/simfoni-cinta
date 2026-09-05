import { useState, useEffect, useRef } from "react";
import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
	AnimationSettings,
} from "../../types";
import {
	BottomNavigationDock,
	MASTER_SLIDE_KEYS,
	type MasterSlideKey,
} from "./BottomNavigationDock";
import { FloatingActionStack } from "./FloatingActionStack";
import { GuestQrModal } from "./GuestQrModal";
import {
	CoverSlide,
	OpeningSlide,
	CoupleSlide,
	QuotesSlide,
	EventsSlide,
	CountdownSlide,
	LocationSlide,
	GallerySlide,
	GiftsSlide,
	WishesSlide,
	ClosingSlide,
} from "../../templates/001/slides";

export interface PresetProps {
	assets: AssetSlots;
	data: InvitationData;
	theme: PresetThemeTokens;
	animations?: AnimationSettings;
}

export function Preset001({
	assets,
	data,
	theme,
	animations = {
		enableSway: true,
		swayIntensity: "normal",
		enableEntranceExit: true,
		transitionDurationMs: 600,
	},
}: PresetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeSlide, setActiveSlide] = useState<MasterSlideKey>("cover");
	const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");
	const [isPlaying, setIsPlaying] = useState(false);
	const [isAutoplay, setIsAutoplay] = useState(false);
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

	const [wishes, setWishes] = useState(data.greetings || []);
	const [wishName, setWishName] = useState("");
	const [wishMessage, setWishMessage] = useState("");
	const [wishPresence, setWishPresence] = useState<
		"Hadir" | "Ragu-ragu" | "Tidak Hadir"
	>("Hadir");

	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const targetTime = new Date(data.countdownTargetIso).getTime();

		const interval = setInterval(() => {
			const now = new Date().getTime();
			const difference = targetTime - now;

			if (difference > 0) {
				setTimeLeft({
					days: Math.floor(difference / (1000 * 60 * 60 * 24)),
					hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
					minutes: Math.floor((difference / 1000 / 60) % 60),
					seconds: Math.floor((difference / 1000) % 60),
				});
			} else {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [data.countdownTargetIso]);

	useEffect(() => {
		let autoplayTimer: ReturnType<typeof setInterval> | null = null;
		if (isOpen && isAutoplay) {
			autoplayTimer = setInterval(() => {
				setActiveSlide((current) => {
					const currentIndex = MASTER_SLIDE_KEYS.indexOf(current);
					const nextIndex = (currentIndex + 1) % MASTER_SLIDE_KEYS.length;
					return MASTER_SLIDE_KEYS[nextIndex === 0 ? 1 : nextIndex] as MasterSlideKey;
				});
			}, 6000);
		}
		return () => {
			if (autoplayTimer) clearInterval(autoplayTimer);
		};
	}, [isOpen, isAutoplay]);

	const handleOpenInvitation = () => {
		setIsOpen(true);
		setSlideDirection("right");
		setActiveSlide("opening");
		if (audioRef.current) {
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch(() => setIsPlaying(false));
		}
	};

	const togglePlayAudio = () => {
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

	const handleSelectSlide = (key: MasterSlideKey) => {
		const currentIdx = MASTER_SLIDE_KEYS.indexOf(activeSlide);
		const nextIdx = MASTER_SLIDE_KEYS.indexOf(key);
		setSlideDirection(nextIdx >= currentIdx ? "right" : "left");
		setActiveSlide(key);
	};

	const toggleAutoplay = () => {
		setIsAutoplay((prev) => !prev);
	};

	const handleCopyAccount = (bankId: string, accountNumber: string) => {
		navigator.clipboard.writeText(accountNumber);
		setCopiedBankId(bankId);
		setTimeout(() => setCopiedBankId(null), 2500);
	};

	const handleSubmitWish = (e: React.FormEvent) => {
		e.preventDefault();
		if (!wishName.trim() || !wishMessage.trim()) return;

		const newWish = {
			id: `wish-${Date.now()}`,
			name: wishName.trim(),
			presence: wishPresence,
			message: wishMessage.trim(),
			createdAt: "Baru saja",
		};

		setWishes((prev) => [newWish, ...prev]);
		setWishName("");
		setWishMessage("");
	};

	const renderSwayingOrnaments = () => {
		if (!animations.enableSway) return null;
		return (
			<div className="absolute top-0 inset-x-0 flex items-center justify-between px-2 pt-1 pointer-events-none z-10">
				{assets.frameTopLeft && (
					<div className="w-14 rotate-[-8deg] transform animate-sway-left opacity-90">
						<img
							src={assets.frameTopLeft}
							alt="Ornamen Kiri"
							className="w-full h-auto object-contain drop-shadow-md"
						/>
					</div>
				)}
				{assets.frameTopRight && (
					<div className="w-14 rotate-[8deg] transform animate-sway-right opacity-90">
						<img
							src={assets.frameTopRight}
							alt="Ornamen Kanan"
							className="w-full h-auto object-contain drop-shadow-md"
						/>
					</div>
				)}
			</div>
		);
	};

	const slideAnimClass = slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

	return (
		<div
			className="relative w-full max-w-[360px] mx-auto h-full min-h-[100dvh] flex flex-col justify-between overflow-hidden font-sans select-none"
			style={{
				backgroundColor: theme.invBg,
				color: theme.invBase,
			}}
		>
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
				style={{
					backgroundImage: `url(${assets.bgCover})`,
				}}
			/>

			<div
				className="absolute inset-0 pointer-events-none z-20 overflow-hidden transition-all duration-500"
				style={{
					bottom: isOpen ? "78px" : "0px",
				}}
			>
				<img
					src="/demo/adat-batak/assets/images/frame-tm.webp"
					alt="Frame Atas"
					className="absolute top-0 inset-x-0 w-full h-auto object-contain drop-shadow-md z-30"
				/>
				<img
					src="/demo/adat-batak/assets/images/frame-bm.webp"
					alt="Frame Bawah"
					className="absolute bottom-0 inset-x-0 w-full h-auto object-contain drop-shadow-md z-30"
				/>
			</div>

			<audio ref={audioRef} src={assets.audioUrl} loop preload="auto" />

			<FloatingActionStack
				isPlaying={isPlaying}
				onTogglePlay={togglePlayAudio}
				isPlayingAutoplay={isAutoplay}
				onToggleAutoplay={toggleAutoplay}
				onOpenQrModal={() => setIsQrModalOpen(true)}
				isOpen={isOpen}
				whatsappNumber={data.contactWhatsappNumber || ""}
				whatsappMessage={`Selamat atas pernikahan ${data.couple.groomName} & ${data.couple.brideName}!`}
				accentColor={theme.invAccent}
			/>

			<GuestQrModal
				isOpen={isQrModalOpen}
				onClose={() => setIsQrModalOpen(false)}
				guestName={data.guestName}
				guestGroup={data.guestGroup}
				coverImage={assets.bgCover}
				accentColor={theme.invAccent}
			/>

			<div className="relative flex-1 w-full h-full overflow-hidden flex flex-col z-30">
				{activeSlide === "cover" && (
					<CoverSlide
						key={activeSlide}
						data={data}
						theme={theme}
						onOpen={handleOpenInvitation}
						slideAnimClass={slideAnimClass}
					/>
				)}

				{activeSlide === "opening" && (
					<OpeningSlide
						key={activeSlide}
						data={data}
						theme={theme}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "couple" && (
					<CoupleSlide
						key={activeSlide}
						data={data}
						assets={assets}
						theme={theme}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "quotes" && (
					<QuotesSlide
						key={activeSlide}
						data={data}
						theme={theme}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "events" && (
					<EventsSlide
						key={activeSlide}
						data={data}
						theme={theme}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "countdown" && (
					<CountdownSlide
						key={activeSlide}
						data={data}
						theme={theme}
						timeLeft={timeLeft}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "location" && (
					<LocationSlide
						key={activeSlide}
						data={data}
						theme={theme}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "gallery" && (
					<GallerySlide
						key={activeSlide}
						assets={assets}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "gifts" && (
					<GiftsSlide
						key={activeSlide}
						data={data}
						theme={theme}
						copiedBankId={copiedBankId}
						onCopyAccount={handleCopyAccount}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "wishes" && (
					<WishesSlide
						key={activeSlide}
						theme={theme}
						wishes={wishes}
						wishName={wishName}
						setWishName={setWishName}
						wishPresence={wishPresence}
						setWishPresence={setWishPresence}
						wishMessage={wishMessage}
						setWishMessage={setWishMessage}
						onSubmitWish={handleSubmitWish}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}

				{activeSlide === "closing" && (
					<ClosingSlide
						key={activeSlide}
						data={data}
						theme={theme}
						slideAnimClass={slideAnimClass}
						ornaments={renderSwayingOrnaments()}
					/>
				)}
			</div>

			{isOpen && (
				<BottomNavigationDock
					activeSlide={activeSlide}
					onSelectSlide={handleSelectSlide}
					backgroundColor={theme.menuBg}
					activeColor={theme.menuActive}
					inactiveColor={theme.menuInactive}
				/>
			)}
		</div>
	);
}
