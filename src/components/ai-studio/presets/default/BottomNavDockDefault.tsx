import React from "react";
import {
	Home,
	BookOpen,
	Heart,
	Calendar,
	MapPin,
	Image,
	Gift,
	MessageSquare,
	Sparkles,
} from "lucide-react";
import type { SlideKeyDefault } from "./types";

interface BottomNavDockDefaultProps {
	activeSlide: SlideKeyDefault;
	onSelectSlide: (slide: SlideKeyDefault) => void;
	menuBg?: string;
	activeColor?: string;
	inactiveColor?: string;
}

interface NavItem {
	key: SlideKeyDefault;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

const MENU_ITEMS: NavItem[] = [
	{ key: "opening", label: "Opening", icon: Home },
	{ key: "couple", label: "Mempelai", icon: Heart },
	{ key: "events", label: "Acara", icon: Calendar },
	{ key: "location", label: "Lokasi", icon: MapPin },
	{ key: "gallery", label: "Galeri", icon: Image },
	{ key: "gifts", label: "Hadiah", icon: Gift },
	{ key: "wishes", label: "Ucapan", icon: MessageSquare },
	{ key: "closing", label: "Penutup", icon: Sparkles },
];

export function BottomNavDockDefault({
	activeSlide,
	onSelectSlide,
	menuBg = "#ffffff",
	activeColor = "#0f172a",
	inactiveColor = "#64748b",
}: BottomNavDockDefaultProps) {
	const activeIndex = Math.max(
		0,
		MENU_ITEMS.findIndex((item) => item.key === activeSlide)
	);

	const maxScrollSteps = MENU_ITEMS.length - 5;
	const currentStep = Math.max(0, Math.min(activeIndex - 2, maxScrollSteps));
	const translateX = currentStep * -20;

	return (
		<nav
			aria-label="Navigasi Standar"
			className="absolute bottom-0 inset-x-0 w-full h-[74px] z-50 pointer-events-auto rounded-t-[20px] border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] overflow-hidden"
			style={{ backgroundColor: menuBg }}
		>
			<div
				className="flex items-center h-full w-full"
				style={{
					transform: `translateX(${translateX}%)`,
					transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
				}}
			>
				{MENU_ITEMS.map((item) => {
					const isActive = activeSlide === item.key;
					const Icon = item.icon;

					return (
						<div
							key={item.key}
							className="w-1/5 min-w-[20%] h-full flex-shrink-0 flex items-center justify-center p-1"
						>
							<button
								type="button"
								onClick={() => onSelectSlide(item.key)}
								className={`w-full h-full rounded-[14px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
									isActive
										? "shadow-sm scale-100 font-semibold"
										: "opacity-75 hover:opacity-100 font-medium"
								}`}
								style={{
									backgroundColor: isActive ? activeColor : "transparent",
									color: isActive ? "#ffffff" : inactiveColor,
								}}
							>
								<Icon className="w-5 h-5 mb-0.5" />
								<span className="text-[11px] tracking-tight whitespace-nowrap leading-none">
									{item.label}
								</span>
							</button>
						</div>
					);
				})}
			</div>
		</nav>
	);
}
