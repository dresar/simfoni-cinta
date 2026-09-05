import { useRef, useEffect } from "react";

export const SLIDE_KEYS_002 = [
	"cover",
	"opening",
	"couple",
	"quotes",
	"gallery",
	"events",
	"countdown",
	"location",
	"gifts",
	"wishes",
	"closing",
] as const;

export type SlideKey002 = (typeof SLIDE_KEYS_002)[number];

interface NavDock002Props {
	activeSlide: SlideKey002;
	onSelectSlide: (slide: SlideKey002) => void;
	accentColor?: string;
	bgColor?: string;
	textColor?: string;
	activeTextColor?: string;
}

function CoverSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M9.02 2.84004L3.63 7.04004C2.73 7.74004 2 9.23004 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29004 21.19 7.74004 20.2 7.05004L14.02 2.72004C12.62 1.74004 10.37 1.79004 9.02 2.84004Z" fill="currentColor" />
			<path opacity=".4" d="M12 17.99V14.99" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function OpeningSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" fill="currentColor" />
			<path d="M12 12.87C11.02 12.87 10.03 12.59 9.26 12.02L6.21 9.72C5.83 9.44 5.75 8.9 6.03 8.52C6.31 8.14 6.85 8.06 7.23 8.34L10.28 10.64C11.23 11.35 12.76 11.35 13.71 10.64L16.76 8.34C17.14 8.06 17.69 8.13 17.96 8.52C18.24 8.9 18.17 9.45 17.78 9.72L14.73 12.02C13.97 12.59 12.98 12.87 12 12.87Z" fill="currentColor" />
		</svg>
	);
}

function CoupleSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M9 2C6.38 2 4.25 4.13 4.25 6.75C4.25 9.32 6.26 11.4 8.88 11.49C8.96 11.48 9.04 11.48 9.1 11.49C9.12 11.49 9.13 11.49 9.15 11.49C9.16 11.49 9.16 11.49 9.17 11.49C11.73 11.4 13.74 9.32 13.75 6.75C13.75 4.13 11.62 2 9 2Z" fill="currentColor" />
			<path d="M14.08 14.15C11.29 12.29 6.74 12.29 3.93 14.15C2.66 15 1.96 16.15 1.96 17.38C1.96 18.61 2.66 19.75 3.92 20.59C5.32 21.53 7.16 22 9 22C10.84 22 12.68 21.53 14.08 20.59C15.34 19.74 16.04 18.6 16.04 17.36C16.03 16.13 15.34 14.99 14.08 14.15Z" fill="currentColor" />
			<path opacity=".4" d="M19.99 7.34C19.83 9.28 18.44 10.93 16.55 11.17C16.54 11.17 16.54 11.17 16.53 11.17H16.5C16.44 11.17 16.38 11.17 16.33 11.19C15.37 11.24 14.49 10.93 13.83 10.36C14.86 9.47 15.44 8.14 15.33 6.68C15.26 5.89 14.99 5.16 14.58 4.54C14.97 4.34 15.42 4.21 15.89 4.17C17.85 3.99 19.63 5.39 19.99 7.34Z" fill="currentColor" />
			<path d="M21.99 16.59C21.92 17.48 21.36 18.26 20.41 18.8C19.5 19.32 18.35 19.57 17.21 19.54C17.88 18.93 18.27 18.17 18.34 17.36C18.43 16.18 17.83 15.04 16.67 14.13C16.01 13.62 15.23 13.2 14.38 12.89C16.55 12.27 19.27 12.72 20.96 14.11C21.79 14.77 22.07 15.69 21.99 16.59Z" fill="currentColor" />
		</svg>
	);
}

function QuotesSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M21.97 15C21.97 18.31 19.28 21 15.97 21L16.89 19.5C16.89 19.5 17.22 18.92 17.35 18.68C15.01 17.83 13.34 15.61 13.34 13V7.03C13.34 5.76 14.36 4.75 15.62 4.75H21.34C21.97 4.75 22.5 5.28 22.5 5.91V13C22.5 13.89 22.31 14.5 21.97 15Z" fill="currentColor" />
			<path d="M8.63 21C5.32 21 2.63 18.31 2.63 15V5.91C2.63 5.28 3.16 4.75 3.79 4.75H9.5C10.76 4.75 11.78 5.76 11.78 7.03V13C11.78 15.61 10.11 17.83 7.77 18.68C7.91 18.93 8.25 19.5 8.25 19.5L9.17 21H8.63Z" fill="currentColor" />
		</svg>
	);
}

function GallerySvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" fill="currentColor" />
			<path d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			<path opacity=".4" d="M15 5H21M18 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
			<path d="M2.67 18.95L7.6 15.64C8.39 15.13 9.53 15.19 10.24 15.77L10.57 16.05C11.35 16.69 12.61 16.69 13.39 16.05L17.55 12.5C18.33 11.86 19.59 11.86 20.37 12.5L22 13.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function EventsSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M15.69 13.7H15.699M15.69 16.7H15.699M11.994 13.7H12.003M11.994 16.7H12.003M8.294 13.7H8.303M8.294 16.7H8.303" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function CountdownSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" fill="currentColor" />
			<path d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function LocationSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M11.9999 13.43C13.723 13.43 15.1199 12.0331 15.1199 10.31C15.1199 8.58687 13.723 7.19 11.9999 7.19C10.2768 7.19 8.87988 8.58687 8.87988 10.31C8.87988 12.0331 10.2768 13.43 11.9999 13.43Z" fill="currentColor" />
			<path d="M3.61971 8.49C5.58971 -0.169998 18.4197 -0.159997 20.3797 8.5C21.5297 13.58 18.3697 17.88 15.5997 20.54C13.5897 22.48 10.4097 22.48 8.38971 20.54C5.62971 17.88 2.46971 13.57 3.61971 8.49Z" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

function GiftsSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M20 12.5V17.5C20 21.5 19 22.5 15 22.5H9C5 22.5 4 21.5 4 17.5V12.5H20Z" fill="currentColor" />
			<path d="M21 9.5V11C21 12.1 20.6 12.5 19.5 12.5H4.5C3.4 12.5 3 12.1 3 11V9.5C3 8.4 3.4 8 4.5 8H19.5C20.6 8 21 8.4 21 9.5Z" fill="currentColor" />
			<path opacity=".4" d="M11.64 8H6.77C6.54 7.74 6.53 7.35 6.74 7.07L8.17 5.2C8.41 4.87 8.91 4.86 9.17 5.17L11.64 8Z" fill="currentColor" />
			<path d="M17.2299 8H12.3599L14.8299 5.17C15.0899 4.86 15.5899 4.87 15.8299 5.2L17.2599 7.07C17.4699 7.35 17.4599 7.74 17.2299 8Z" fill="currentColor" />
			<path opacity=".4" d="M14.08 8H9.91997V12.5H14.08V8Z" fill="currentColor" />
			<path d="M14.08 12.5H9.91V22.5H14.08V12.5Z" fill="currentColor" />
		</svg>
	);
}

function WishesSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M8 2H16C19 2 21 4 21 7V13C21 16 19 18 16 18H15.5C15.19 18 14.89 18.15 14.7 18.4L13.2 20.4C12.54 21.28 11.46 21.28 10.8 20.4L9.3 18.4C9.14 18.18 8.78 18 8.5 18H8C5 18 3 17 3 13V7C3 4 5 2 8 2Z" fill="currentColor" />
			<path d="M15.9965 11H16.0054M11.9955 11H12.0045M7.99451 11H8.00349" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function ClosingSvg({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path opacity=".4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
			<path d="M7.75 11.9999L10.58 14.8299L16.25 9.16992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

const NAV_ITEMS = [
	{ key: "cover", label: "Cover", Icon: CoverSvg },
	{ key: "opening", label: "Salam", Icon: OpeningSvg },
	{ key: "couple", label: "Mempelai", Icon: CoupleSvg },
	{ key: "quotes", label: "Quotes", Icon: QuotesSvg },
	{ key: "gallery", label: "Galeri", Icon: GallerySvg },
	{ key: "events", label: "Acara", Icon: EventsSvg },
	{ key: "countdown", label: "Hitung", Icon: CountdownSvg },
	{ key: "location", label: "Lokasi", Icon: LocationSvg },
	{ key: "gifts", label: "Hadiah", Icon: GiftsSvg },
	{ key: "wishes", label: "Ucapan", Icon: WishesSvg },
	{ key: "closing", label: "Penutup", Icon: ClosingSvg },
] as const;

export function BottomNavDock002({
	activeSlide,
	onSelectSlide,
	accentColor = "#B8966A",
	bgColor = "#1C1207",
	textColor = "#E8DCC8",
	activeTextColor = "#1C1207",
}: NavDock002Props) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (activeRef.current && scrollRef.current) {
			const el = activeRef.current;
			const container = scrollRef.current;
			container.scrollTo({
				left: el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2,
				behavior: "smooth",
			});
		}
	}, [activeSlide]);

	return (
		<nav
			aria-label="Navigasi Undangan"
			className="absolute bottom-0 inset-x-0 w-full z-50 pointer-events-auto overflow-hidden"
			style={{
				height: "86px",
				backgroundColor: bgColor,
				borderTop: `1px solid ${accentColor}30`,
				boxShadow: "0 -6px 30px rgba(0,0,0,0.65)",
			}}
		>
			<div
				ref={scrollRef}
				className="flex items-center h-full px-2.5 gap-1 overflow-x-auto"
				style={{
					scrollbarWidth: "none",
					msOverflowStyle: "none",
				}}
			>
				{NAV_ITEMS.map(({ key, label, Icon }) => {
					const isActive = activeSlide === key;
					return (
						<button
							key={key}
							ref={isActive ? activeRef : null}
							type="button"
							onClick={() => onSelectSlide(key as SlideKey002)}
							className="flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
							style={{
								minWidth: isActive ? "80px" : "68px",
								height: "72px",
								borderRadius: "14px",
								backgroundColor: isActive ? accentColor : "transparent",
								color: isActive ? activeTextColor : textColor,
								padding: "0 10px",
							}}
						>
							<div style={{ marginBottom: "4px", opacity: isActive ? 1 : 0.75 }}>
								<Icon size={isActive ? 24 : 22} />
							</div>
							<span
								style={{
									fontSize: "10px",
									fontWeight: isActive ? 700 : 500,
									letterSpacing: "0.02em",
									lineHeight: 1,
									whiteSpace: "nowrap",
									opacity: isActive ? 1 : 0.8,
								}}
							>
								{label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
