import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ShoppingBag, Sparkles, UserPlus, Share2, X } from "lucide-react";

interface ActivityEvent {
	id: string;
	title: string;
	desc: string;
	time: string;
	iconType: "purchase" | "register" | "activate" | "share";
}

const ACTIVITIES: Omit<ActivityEvent, "id">[] = [
	{
		title: "Anisa & Rizky (Bandung)",
		desc: "Baru saja memesan Paket Gold",
		time: "Baru saja",
		iconType: "purchase",
	},
	{
		title: "Dimas & Putri (Jakarta Selatan)",
		desc: "Baru saja memesan Paket Platinum",
		time: "1 mnt lalu",
		iconType: "purchase",
	},
	{
		title: "Fajar & Dinda (Surabaya)",
		desc: "Baru saja memesan Paket Silver",
		time: "2 mnt lalu",
		iconType: "purchase",
	},
	{
		title: "Siti Rahmawati (Yogyakarta)",
		desc: "Mendaftar akun calon pengantin",
		time: "Baru saja",
		iconType: "register",
	},
	{
		title: "Budi & Citra (Tangerang)",
		desc: "Mengaktifkan undangan digital online",
		time: "Baru saja",
		iconType: "activate",
	},
	{
		title: "Fikri & Zahra (Semarang)",
		desc: "Menyebarkan 50 undangan WhatsApp Blast",
		time: "3 mnt lalu",
		iconType: "share",
	},
	{
		title: "Bayu & Sarah (Bekasi)",
		desc: "Baru saja memesan Paket Gold",
		time: "1 mnt lalu",
		iconType: "purchase",
	},
	{
		title: "Rian & Jessica (Medan)",
		desc: "Baru saja memesan Paket Platinum",
		time: "Baru saja",
		iconType: "purchase",
	},
	{
		title: "Eko Prasetyo (Malang)",
		desc: "Mendaftar akun baru Simfoni Cinta",
		time: "4 mnt lalu",
		iconType: "register",
	},
	{
		title: "Bram & Maya (Denpasar)",
		desc: "Baru saja memesan Paket Platinum",
		time: "Baru saja",
		iconType: "purchase",
	},
	{
		title: "Teguh & Laila (Pekanbaru)",
		desc: "Memilih template undangan elegan",
		time: "2 mnt lalu",
		iconType: "activate",
	},
	{
		title: "Kevin & Claudia (Jakarta Barat)",
		desc: "Baru saja memesan Paket Gold",
		time: "1 mnt lalu",
		iconType: "purchase",
	},
];

export function LivePurchaseNotification() {
	const [activeEvent, setActiveEvent] = useState<ActivityEvent | null>(null);
	const [visible, setVisible] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

	const triggerNextNotification = () => {
		const randomIndex = Math.floor(Math.random() * ACTIVITIES.length);
		const selected = ACTIVITIES[randomIndex];
		if (!selected) return;
		setActiveEvent({
			...selected,
			id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		});
		setVisible(true);

		if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		hideTimerRef.current = setTimeout(() => {
			setVisible(false);
			scheduleNextNotification();
		}, 4800);
	};

	const scheduleNextNotification = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		const randomDelay = Math.floor(Math.random() * 5000) + 5000;
		timerRef.current = setTimeout(() => {
			triggerNextNotification();
		}, randomDelay);
	};

	useEffect(() => {
		const initialTimer = setTimeout(() => {
			triggerNextNotification();
		}, 3000);

		return () => {
			clearTimeout(initialTimer);
			if (timerRef.current) clearTimeout(timerRef.current);
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		};
	}, []);

	if (!activeEvent) return null;

	const renderIcon = () => {
		switch (activeEvent.iconType) {
			case "purchase":
				return (
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
						<ShoppingBag className="size-4.5" />
					</div>
				);
			case "register":
				return (
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
						<UserPlus className="size-4.5" />
					</div>
				);
			case "activate":
				return (
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
						<Sparkles className="size-4.5" />
					</div>
				);
			case "share":
				return (
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
						<Share2 className="size-4.5" />
					</div>
				);
		}
	};

	return (
		<div
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			className={`fixed bottom-4 left-4 z-40 max-w-[340px] sm:max-w-xs transition-all duration-300 ${
				visible && !isPaused
					? "translate-y-0 opacity-100 pointer-events-auto"
					: visible && isPaused
						? "translate-y-0 opacity-100 pointer-events-auto"
						: "translate-y-4 opacity-0 pointer-events-none"
			}`}
		>
			<div className="relative flex items-center gap-3 rounded-xl border border-stone-200/90 bg-white/95 p-3 shadow-lg backdrop-blur-md">
				{renderIcon()}

				<div className="min-w-0 flex-1 pr-4">
					<div className="flex items-center gap-1.5">
						<span className="truncate text-xs font-bold text-stone-900">
							{activeEvent.title}
						</span>
						<CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
					</div>
					<p className="truncate text-[11px] font-medium text-emerald-800">
						{activeEvent.desc}
					</p>
					<span className="text-[9px] text-stone-400 font-medium">
						{activeEvent.time} • Terverifikasi
					</span>
				</div>

				<button
					type="button"
					onClick={() => setVisible(false)}
					className="absolute top-2 right-2 flex size-5 items-center justify-center rounded text-stone-400 hover:text-stone-700 transition-colors"
					title="Tutup Notifikasi"
				>
					<X className="size-3" />
				</button>
			</div>
		</div>
	);
}
