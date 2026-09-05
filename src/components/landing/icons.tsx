import type { SVGProps } from "react";

const base = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 1.4,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
	viewBox: "0 0 24 24",
};

export function IconLeaf(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M4 20c0-8 6-14 16-15 1 10-5 16-13 16H4Z" />
			<path d="M4 20c4-4 8-7 13-9" />
		</svg>
	);
}

export function IconUsers(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
			<circle cx="9.5" cy="7" r="3" />
			<path d="M21 19v-1a4 4 0 0 0-3-3.87M16.5 4.2a3 3 0 0 1 0 5.6" />
		</svg>
	);
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<rect x="3" y="5" width="18" height="16" rx="3" />
			<path d="M3 10h18M8 3v4M16 3v4" />
		</svg>
	);
}

export function IconPalette(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-1.3-1-1.7-1-2.7 0-.7.6-1.3 1.4-1.3H16a5 5 0 0 0 5-5c0-4-4-7-9-7Z" />
			<circle cx="7.5" cy="11" r="1" />
			<circle cx="10.5" cy="7.5" r="1" />
			<circle cx="15" cy="8.5" r="1" />
		</svg>
	);
}

export function IconGift(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<rect x="3" y="9" width="18" height="12" rx="2" />
			<path d="M3 13h18M12 9v12M12 9S9.5 9 8.5 8a2 2 0 1 1 3.5-2M12 9s2.5 0 3.5-1a2 2 0 1 0-3.5-2" />
		</svg>
	);
}

export function IconHeadset(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M4 14v-2a8 8 0 0 1 16 0v2" />
			<rect x="2.5" y="13" width="4" height="6" rx="1.6" />
			<rect x="17.5" y="13" width="4" height="6" rx="1.6" />
			<path d="M19.5 19v.5a3 3 0 0 1-3 3H13" />
		</svg>
	);
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="m5 12.5 4.5 4.5L19 7" />
		</svg>
	);
}

export function IconArrowRight(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M4 12h15M13 6l6 6-6 6" />
		</svg>
	);
}

export function IconStar(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.6Z" />
		</svg>
	);
}

export function IconSparkle(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />
		</svg>
	);
}

export function IconDevice(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<rect x="2.5" y="4" width="13" height="11" rx="2" />
			<path d="M2.5 18h13" />
			<rect x="17" y="9" width="5" height="11" rx="1.6" />
		</svg>
	);
}

export function IconInfinity(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M6.5 8.5a3.5 3.5 0 1 0 0 7c3.5 0 4-7 8-7a3.5 3.5 0 1 1 0 7c-4 0-4.5-7-8-7Z" />
		</svg>
	);
}

export function IconTemplate(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<rect x="3" y="3" width="18" height="18" rx="2.5" />
			<path d="M3 9h18M9 21V9" />
		</svg>
	);
}

export function IconPen(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" />
			<path d="m13.5 6.5 4 4" />
		</svg>
	);
}

export function IconWallet(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<rect x="3" y="6" width="18" height="13" rx="2.5" />
			<path d="M3 10h18M17 14.5h.01" />
		</svg>
	);
}

export function IconSend(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z" />
		</svg>
	);
}

export function IconShield(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
			<path d="m9 12 2 2 4-4" />
		</svg>
	);
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
	return (
		<svg {...base} {...props}>
			<circle cx="11" cy="11" r="7" />
			<path d="m21 21-4.35-4.35" />
		</svg>
	);
}
