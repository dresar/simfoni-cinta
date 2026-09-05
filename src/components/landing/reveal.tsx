import {
	useEffect,
	useRef,
	useState,
	type ElementType,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "left" | "right" | "scale";

const variantClass: Record<RevealVariant, string> = {
	up: "reveal",
	left: "reveal-left",
	right: "reveal-right",
	scale: "reveal-scale",
};

export function Reveal({
	children,
	className,
	variant = "up",
	delay = 0,
	as: Tag = "div",
	once = false,
}: {
	children: ReactNode;
	className?: string;
	variant?: RevealVariant;
	delay?: number;
	as?: ElementType;
	once?: boolean;
}) {
	const ref = useRef<HTMLElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry) return;
				if (entry.isIntersecting) {
					setVisible(true);
					if (once) io.disconnect();
				} else if (!once && entry.boundingClientRect.top > 0) {
					setVisible(false);
				}
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [once]);

	return (
		<Tag
			ref={ref}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
			className={cn(variantClass[variant], visible && "is-visible", className)}
		>
			{children}
		</Tag>
	);
}

export function useInView<T extends HTMLElement>(threshold = 0.3) {
	const ref = useRef<T | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				const e = entries[0];
				if (!e) return;
				if (e.isIntersecting) {
					setInView(true);
					io.disconnect();
				}
			},
			{ threshold },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [threshold]);

	return { ref, inView };
}
