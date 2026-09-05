import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/appStore";

export function MobileBottomNav() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const [mounted, setMounted] = useState(false);
	const { session } = useStore();
	const user = mounted ? session : null;

	useEffect(() => {
		setMounted(true);
	}, []);

	if (
		currentPath.startsWith("/admin") ||
		currentPath.startsWith("/dasbor") ||
		currentPath.startsWith("/demo-ai") ||
		(currentPath.startsWith("/demo/") && currentPath !== "/demo" && currentPath !== "/demo/")
	) {
		return null;
	}

	const accountLink = user
		? user.role === "admin"
			? "/admin"
			: "/dasbor"
		: "/login";
	const createLink = user ? "/dasbor" : "/login";

	return (
		<nav
			aria-label="Navigasi Menu Mobile"
			className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/80 px-3 py-1.5 pb-2 shadow-[0_-5px_25px_rgba(0,0,0,0.08)] select-none"
		>
			<div className="flex items-center justify-around max-w-md mx-auto relative">
				<Link
					to="/"
					className={cn(
						"flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold transition-colors",
						currentPath === "/"
							? "text-primary font-bold"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<svg
						className={cn(
							"size-5.5 mb-1",
							currentPath === "/" ? "text-primary" : "text-muted-foreground",
						)}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					<span>Home</span>
				</Link>

				<Link
					to="/demo"
					className={cn(
						"flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold transition-colors",
						currentPath.startsWith("/demo")
							? "text-primary font-bold"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<svg
						className={cn(
							"size-5.5 mb-1",
							currentPath.startsWith("/demo")
								? "text-primary"
								: "text-muted-foreground",
						)}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect x="3" y="3" width="7" height="7" rx="1.5" />
						<rect x="14" y="3" width="7" height="7" rx="1.5" />
						<rect x="14" y="14" width="7" height="7" rx="1.5" />
						<rect x="3" y="14" width="7" height="7" rx="1.5" />
					</svg>
					<span>Template</span>
				</Link>

				<Link
					to={createLink}
					className="flex flex-col items-center justify-center -translate-y-4.5 group cursor-pointer"
				>
					<div className="size-12 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-[0_6px_20px_rgba(16,185,129,0.45)] ring-4 ring-card flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95">
						<svg
							className="size-6 text-white stroke-[2.5]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					</div>
					<span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
						Buat
					</span>
				</Link>

				<a
					href="/#harga"
					className="flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
				>
					<svg
						className="size-5.5 mb-1 text-muted-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M6 3h12l4 6-10 12L2 9z" />
						<path d="M11 3L8 9l4 12 4-12-3-6" />
						<path d="M2 9h20" />
					</svg>
					<span>Paket</span>
				</a>

				<Link
					to={accountLink}
					className={cn(
						"flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold transition-colors",
						currentPath.startsWith("/dasbor") ||
							currentPath.startsWith("/login")
							? "text-primary font-bold"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<svg
						className={cn(
							"size-5.5 mb-1",
							currentPath.startsWith("/dasbor") ||
								currentPath.startsWith("/login")
								? "text-primary"
								: "text-muted-foreground",
						)}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					<span suppressHydrationWarning>{user ? "Akun" : "Masuk"}</span>
				</Link>
			</div>
		</nav>
	);
}
