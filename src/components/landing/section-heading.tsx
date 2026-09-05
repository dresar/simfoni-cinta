import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
	eyebrow,
	title,
	desc,
	align = "center",
	invert = false,
	className,
}: {
	eyebrow?: string;
	title: ReactNode;
	desc?: ReactNode;
	align?: "center" | "left";
	invert?: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"max-w-2xl",
				align === "center" ? "mx-auto text-center" : "text-left",
				className,
			)}
		>
			{eyebrow ? (
				<Reveal>
					<span
						className={cn("eyebrow", invert && "text-primary-foreground/70")}
					>
						{eyebrow}
					</span>
				</Reveal>
			) : null}
			<Reveal delay={80}>
				<h2
					className={cn(
						"mt-3 text-[2rem] leading-[1.12] sm:text-[2.6rem] lg:text-[3.1rem]",
						invert && "text-primary-foreground",
					)}
				>
					{title}
				</h2>
			</Reveal>
			{desc ? (
				<Reveal delay={150}>
					<p
						className={cn(
							"mt-4 text-[0.95rem] leading-relaxed text-muted-foreground",
							align === "center" && "mx-auto max-w-xl",
							invert && "text-primary-foreground/70",
						)}
					>
						{desc}
					</p>
				</Reveal>
			) : null}
		</div>
	);
}
