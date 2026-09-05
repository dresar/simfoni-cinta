import { useEffect, useRef } from "react";
import {
	Home,
	Mail,
	Heart,
	FileText,
	Image as ImageIcon,
	CalendarDays,
	Clock,
	MapPin,
	Gift,
	MessageSquare,
	Sparkles,
} from "lucide-react";

export interface DockItem {
	id: string;
	label: string;
}

interface SlidingBottomDockProps {
	activeId: string;
	onSelect: (id: string) => void;
	isOpen?: boolean;
	menuBg?: string;
	menuActiveColor?: string;
	menuInactiveColor?: string;
	items?: DockItem[];
}

export const COMPLETE_11_DOCK_ITEMS: DockItem[] = [
	{ id: "cover", label: "Cover" },
	{ id: "opening", label: "Salam" },
	{ id: "couple", label: "Mempelai" },
	{ id: "quotes", label: "Kutipan" },
	{ id: "gallery", label: "Galeri" },
	{ id: "acara", label: "Acara" },
	{ id: "countdown", label: "Waktu" },
	{ id: "maps", label: "Lokasi" },
	{ id: "gift", label: "Amplop" },
	{ id: "wishes", label: "Ucapan" },
	{ id: "thanks", label: "Doa" },
];

export const COMPLETE_10_DOCK_ITEMS = COMPLETE_11_DOCK_ITEMS;

export function SlidingBottomDock({
	activeId,
	onSelect,
	isOpen = true,
	menuBg = "#380509",
	menuActiveColor = "#c29b53",
	menuInactiveColor = "#ffffff",
	items = COMPLETE_11_DOCK_ITEMS,
}: SlidingBottomDockProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);

	const scrollToIndex = (index: number) => {
		if (!containerRef.current) return;
		const container = containerRef.current;
		const containerWidth = container.clientWidth;
		const itemWidth = containerWidth * 0.2;
		const itemCenter = (index + 0.5) * itemWidth;
		const containerCenter = containerWidth / 2;
		const targetScrollLeft = itemCenter - containerCenter;
		const maxScrollLeft = container.scrollWidth - containerWidth;
		const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

		container.scrollTo({
			left: clampedScrollLeft,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		if (!isOpen) return;
		const activeIndex = items.findIndex((item) => item.id === activeId);
		if (activeIndex !== -1) {
			scrollToIndex(activeIndex);
		}
	}, [activeId, isOpen, items]);

	const handleItemClick = (id: string, index: number) => {
		onSelect(id);
		scrollToIndex(index);
	};

	const renderIcon = (id: string, isActive: boolean) => {
		const iconClass = "w-5 h-5 shrink-0 transition-transform duration-200";
		switch (id) {
			case "cover":
				return <Home className={iconClass} strokeWidth={2.2} />;
			case "opening":
				return <Mail className={iconClass} strokeWidth={2.2} />;
			case "couple":
				return (
					<Heart
						className={`${iconClass} ${isActive ? "fill-current" : ""}`}
						strokeWidth={isActive ? 1 : 2.2}
					/>
				);
			case "quotes":
				return <FileText className={iconClass} strokeWidth={2.2} />;
			case "gallery":
				return <ImageIcon className={iconClass} strokeWidth={2.2} />;
			case "acara":
				return <CalendarDays className={iconClass} strokeWidth={2.2} />;
			case "countdown":
				return <Clock className={iconClass} strokeWidth={2.2} />;
			case "maps":
				return <MapPin className={iconClass} strokeWidth={2.2} />;
			case "gift":
				return <Gift className={iconClass} strokeWidth={2.2} />;
			case "wishes":
				return <MessageSquare className={iconClass} strokeWidth={2.2} />;
			case "thanks":
				return <Sparkles className={iconClass} strokeWidth={2.2} />;
			default:
				return <Home className={iconClass} strokeWidth={2.2} />;
		}
	};

	return (
		<nav
			aria-label="Navigasi Bawah"
			className={`absolute bottom-0 inset-x-0 z-40 w-full select-none transition-all duration-500 ease-out border-t border-white/10 shadow-2xl ${
				isOpen
					? "translate-y-0 opacity-100 pointer-events-auto"
					: "translate-y-full opacity-0 pointer-events-none"
			}`}
			style={{ backgroundColor: menuBg }}
		>
			<div
				ref={containerRef}
				className="relative w-full h-[68px] flex items-center overflow-x-auto no-scrollbar scroll-smooth touch-pan-x"
			>
				<div className="flex items-center h-full w-full min-w-full">
					{items.map((item, index) => {
						const isActive = item.id === activeId;
						return (
							<div
								key={item.id}
								className="flex-[0_0_20%] w-[20%] min-w-[20%] max-w-[20%] h-full flex items-center justify-center px-0.5 py-1"
							>
								<button
									type="button"
									onClick={() => handleItemClick(item.id, index)}
									className={`w-full max-w-[68px] h-[56px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 focus:outline-hidden cursor-pointer ${
										isActive ? "shadow-md" : "hover:bg-white/5"
									}`}
									style={{
										backgroundColor: isActive ? menuActiveColor : "transparent",
										color: isActive ? menuBg : (menuInactiveColor || "#ffffff"),
									}}
								>
									{renderIcon(item.id, isActive)}
									<span
										className={`text-[10px] tracking-tight leading-tight whitespace-nowrap text-center px-0.5 max-w-full overflow-hidden ${
											isActive ? "font-bold" : "font-medium text-white"
										}`}
									>
										{item.label}
									</span>
								</button>
							</div>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
