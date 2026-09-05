import { useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingWa() {
	const [hovered, setHovered] = useState(false);

	return (
		<a
			href="https://wa.me/6282392115909"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Chat Admin Kami via WhatsApp"
			className="fixed bottom-24 sm:bottom-28 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<span
				className={cn(
					"absolute -inset-1.5 rounded-full opacity-0 transition-opacity duration-300",
					hovered && "opacity-100",
					"bg-green-400/20",
				)}
			/>
			<span className="absolute inset-0 rounded-full animate-ping bg-green-400/30" />
			<span className="absolute inset-0 rounded-full animate-pulse bg-green-500/10" />

			<span
				className={cn(
					"absolute right-full mr-3 whitespace-nowrap rounded-xl bg-[#0d0d0f] px-3 py-1.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 transition-all duration-200",
					hovered
						? "opacity-100 translate-x-0"
						: "opacity-0 translate-x-2 pointer-events-none",
				)}
			>
				Chat Admin Kami
				<span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2 rotate-45 bg-[#0d0d0f] ring-1 ring-white/10" />
			</span>

			<span className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30 ring-2 ring-green-400/40 transition-transform duration-200 group-hover:scale-110 active:scale-95">
				<span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-white bg-green-400">
					<span className="size-1.5 rounded-full bg-white animate-pulse" />
				</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					className="size-7 text-white drop-shadow"
					aria-hidden="true"
				>
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
					<path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.522 5.856L.057 23.882a.5.5 0 0 0 .612.612l6.044-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.003-1.37l-.36-.214-3.712.899.928-3.617-.235-.373A9.79 9.79 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
				</svg>
			</span>
		</a>
	);
}
