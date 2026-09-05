import React from "react";

export const MASTER_SLIDE_KEYS = [
	"cover",
	"opening",
	"quotes",
	"couple",
	"events",
	"countdown",
	"location",
	"gallery",
	"gifts",
	"wishes",
	"closing",
] as const;

export type MasterSlideKey = (typeof MASTER_SLIDE_KEYS)[number];

interface BottomNavigationDockProps {
	activeSlide: MasterSlideKey;
	onSelectSlide: (slide: MasterSlideKey) => void;
	backgroundColor?: string;
	activeColor?: string;
	inactiveColor?: string;
}

function HomeIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path d="M9.144 20.782v-3.067c0-.777.632-1.408 1.414-1.413h2.875c.786 0 1.423.633 1.423 1.413v3.058c0 .674.548 1.222 1.227 1.227h1.96a3.46 3.46 0 0 0 2.444-1 3.41 3.41 0 0 0 1.013-2.422V9.866c0-.735-.328-1.431-.895-1.902l-6.662-5.29a3.115 3.115 0 0 0-3.958.071L3.467 7.963A2.474 2.474 0 0 0 2.5 9.867v8.703C2.5 20.464 4.047 22 5.956 22h1.916c.327.002.641-.125.873-.354.232-.228.363-.54.363-.864h.036Z" fill="currentColor" />
		</svg>
	);
}

function QuotesIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M16.191 2H7.81C4.77 2 3 3.78 3 6.83v10.33C3 20.26 4.77 22 7.81 22h8.381C19.28 22 21 20.26 21 17.16V6.83C21 3.78 19.28 2 16.191 2" fill="currentColor" />
			<path fillRule="evenodd" clipRule="evenodd" d="M8.08 6.65v.01a.78.78 0 0 0 0 1.56h2.989c.431 0 .781-.35.781-.791a.781.781 0 0 0-.781-.779H8.08Zm7.84 6.09H8.08a.78.78 0 0 1 0-1.561h7.84a.781.781 0 0 1 0 1.561Zm0 4.57H8.08c-.3.04-.59-.11-.75-.36a.795.795 0 0 1 .75-1.21h7.84c.399.04.7.38.7.79 0 .399-.301.74-.7.78Z" fill="currentColor" />
		</svg>
	);
}

function HeartIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M11.776 21.837a36.258 36.258 0 0 1-6.328-4.957 12.668 12.668 0 0 1-3.03-4.805C1.278 8.535 2.603 4.49 6.3 3.288A6.282 6.282 0 0 1 12.007 4.3a6.291 6.291 0 0 1 5.706-1.012c3.697 1.201 5.03 5.247 3.893 8.787a12.67 12.67 0 0 1-3.013 4.805 36.58 36.58 0 0 1-6.328 4.957l-.25.163-.24-.163Z" fill="currentColor" />
			<path d="m12.01 22-.234-.163a36.316 36.316 0 0 1-6.337-4.957 12.667 12.667 0 0 1-3.048-4.805c-1.13-3.54.195-7.586 3.892-8.787a6.296 6.296 0 0 1 5.728 1.023V22Z" fill="currentColor" />
		</svg>
	);
}

function CalendarIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M3 16.87V9.257h18v7.674C21 20.07 19.024 22 15.863 22H8.127C4.996 22 3 20.03 3 16.87Zm4.96-2.46a.822.822 0 0 1-.85-.799c0-.46.355-.84.81-.861.444 0 .81.351.82.8a.822.822 0 0 1-.78.86Zm4.06 0a.822.822 0 0 1-.85-.799c0-.46.356-.84.81-.861.445 0 .81.351.82.8a.822.822 0 0 1-.78.86Zm4.03 3.68a.847.847 0 0 1-.82-.85.831.831 0 0 1 .81-.849h.01c.465 0 .84.38.84.849 0 .47-.375.85-.84.85Zm-4.88-.85c.02.46.395.821.85.8a.821.821 0 0 0 .78-.859.817.817 0 0 0-.82-.801.855.855 0 0 0-.81.86Zm-4.07 0c.02.46.395.821.85.8a.821.821 0 0 0 .78-.859.817.817 0 0 0-.82-.801.855.855 0 0 0-.81.86Zm8.14-3.639c0-.46.356-.83.81-.84.445 0 .8.359.82.8a.82.82 0 0 1-.79.849.814.814 0 0 1-.84-.799v-.01Z" fill="currentColor" />
			<path opacity=".4" d="M3.003 9.257c.013-.587.063-1.752.156-2.127.474-2.11 2.084-3.45 4.386-3.64h8.911c2.282.2 3.912 1.55 4.386 3.64.092.365.142 1.539.155 2.127H3.003Z" fill="currentColor" />
			<path d="M8.305 6.59c.435 0 .76-.329.76-.77V2.771A.748.748 0 0 0 8.306 2c-.435 0-.76.33-.76.771V5.82c0 .441.325.77.76.77ZM15.695 6.59c.425 0 .76-.329.76-.77V2.771a.754.754 0 0 0-.76-.771c-.435 0-.76.33-.76.771V5.82c0 .441.325.77.76.77Z" fill="currentColor" />
		</svg>
	);
}

function MapPinIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M8.532 2.937a6.89 6.89 0 0 1 7.034.058C17.71 4.327 19.012 6.705 19 9.26c-.05 2.54-1.447 4.929-3.193 6.775a18.727 18.727 0 0 1-3.358 2.82 1.173 1.173 0 0 1-.408.144.82.82 0 0 1-.39-.119 18.515 18.515 0 0 1-4.839-4.547A9.28 9.28 0 0 1 5 9.134c-.001-2.562 1.347-4.928 3.532-6.197Zm1.262 7.258a2.378 2.378 0 0 0 2.198 1.497 2.339 2.339 0 0 0 1.683-.701c.446-.454.696-1.07.694-1.713a2.423 2.423 0 0 0-1.462-2.243 2.346 2.346 0 0 0-2.594.52 2.455 2.455 0 0 0-.519 2.64Z" fill="currentColor" />
			<ellipse opacity=".4" cx="12" cy="21" rx="5" ry="1" fill="currentColor" />
		</svg>
	);
}

function GalleryIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Z" fill="currentColor" />
			<circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
			<path d="m5 18 4.5-6 3.5 4.5 2.5-3 3.5 4.5H5Z" fill="currentColor" />
		</svg>
	);
}

function GiftIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7h16Z" fill="currentColor" />
			<path d="M20 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM12 7V3M8 3h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function WishesIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M12.02 2C6.21 2 2 6.74 2 12c0 1.68.49 3.41 1.35 4.99.16.26.18.59.07.9l-.67 2.24c-.15.54.31.94.82.78l2.02-.6c.55-.18.98.05 1.491.36 1.46.86 3.279 1.3 4.919 1.3 4.96 0 10-3.83 10-10C22 6.65 17.7 2 12.02 2Z" fill="currentColor" />
			<path fillRule="evenodd" clipRule="evenodd" d="M11.98 13.29c-.71-.01-1.28-.58-1.28-1.29 0-.7.58-1.28 1.28-1.27.71 0 1.28.57 1.28 1.28 0 .7-.57 1.28-1.28 1.28Zm-4.61 0c-.7 0-1.28-.58-1.28-1.28 0-.71.57-1.28 1.28-1.28.71 0 1.28.57 1.28 1.28 0 .7-.57 1.27-1.28 1.28Zm7.94-1.28c0 .7.57 1.28 1.28 1.28.71 0 1.28-.58 1.28-1.28 0-.71-.57-1.28-1.28-1.28-.71 0-1.28.57-1.28 1.28Z" fill="currentColor" />
		</svg>
	);
}

function ClosingIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M16.34 2H7.67C4.28 2 2 4.38 2 7.92v8.17C2 19.62 4.28 22 7.67 22h8.67c3.39 0 5.66-2.38 5.66-5.91V7.92C22 4.38 19.73 2 16.34 2Z" fill="currentColor" />
			<path d="M10.813 15.248a.872.872 0 0 1-.619-.256l-2.373-2.373a.874.874 0 1 1 1.237-1.238l1.755 1.755 4.128-4.128a.874.874 0 1 1 1.237 1.238l-4.746 4.746a.872.872 0 0 1-.619.256Z" fill="currentColor" />
		</svg>
	);
}

const MENU_ITEMS: {
	key: MasterSlideKey;
	label: string;
	Icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ key: "opening", label: "Opening", Icon: HomeIcon },
	{ key: "quotes", label: "Quotes", Icon: QuotesIcon },
	{ key: "couple", label: "Mempelai", Icon: HeartIcon },
	{ key: "events", label: "Acara", Icon: CalendarIcon },
	{ key: "location", label: "Lokasi", Icon: MapPinIcon },
	{ key: "gallery", label: "Galeri", Icon: GalleryIcon },
	{ key: "gifts", label: "Hadiah", Icon: GiftIcon },
	{ key: "wishes", label: "Ucapan", Icon: WishesIcon },
	{ key: "closing", label: "Doa", Icon: ClosingIcon },
];

export function BottomNavigationDock({
	activeSlide,
	onSelectSlide,
	backgroundColor = "#6F1416",
	activeColor = "#DEB55B",
	inactiveColor = "#ffffff",
}: BottomNavigationDockProps) {
	const activeIndex = Math.max(
		0,
		MENU_ITEMS.findIndex((item) => item.key === activeSlide)
	);

	const maxScrollSteps = MENU_ITEMS.length - 5;
	const currentStep = Math.max(0, Math.min(activeIndex - 2, maxScrollSteps));
	const translateX = currentStep * -20;

	return (
		<nav
			aria-label="Navigasi Undangan"
			className="absolute bottom-0 inset-x-0 w-full h-[78px] z-50 pointer-events-auto rounded-t-[18px] border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.6)] overflow-hidden"
			style={{ backgroundColor }}
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
					const Icon = item.Icon;

					return (
						<div
							key={item.key}
							className="w-1/5 min-w-[20%] h-full flex-shrink-0 flex items-center justify-center p-1"
						>
							<button
								type="button"
								onClick={() => onSelectSlide(item.key)}
								className={`w-full h-full rounded-[14px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
									isActive ? "shadow-md scale-100" : "opacity-80 hover:opacity-100"
								}`}
								style={{
									backgroundColor: isActive ? activeColor : "transparent",
									color: isActive ? "#560A17" : inactiveColor,
								}}
							>
								<Icon className="w-5 h-5 mb-0.5" />
								<span
									className={`tracking-tight whitespace-nowrap leading-none ${
										isActive ? "text-[11px] font-bold" : "text-[10.5px] font-medium"
									}`}
								>
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
