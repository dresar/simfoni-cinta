import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/appStore";
import { ChevronDown, User } from "lucide-react";
import { navLinks } from "./data";

export function Logo({
	className,
	invert = false,
}: {
	className?: string;
	invert?: boolean;
}) {
	return (
		<a
			href="/#beranda"
			aria-label="Simfoni Cinta, kembali ke beranda"
			className={cn("group flex items-center gap-2.5", className)}
		>
			<img
				src="https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp"
				alt="Simfoni Cinta"
				width={40}
				height={40}
				onError={(e) => {
					(e.currentTarget as HTMLImageElement).src = "/logo.png";
				}}
				className="h-10 w-auto object-contain"
			/>
			<span className="leading-none">
				<span className="block font-serif text-[1.05rem] tracking-[0.16em] uppercase">
					Simfoni Cinta
				</span>
				<span
					className={cn(
						"mt-0.5 block text-[0.5rem] tracking-[0.34em] uppercase",
						invert ? "text-primary-foreground/60" : "text-muted-foreground",
					)}
				>
					Digital Invitation
				</span>
			</span>
		</a>
	);
}

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);
	const [mounted, setMounted] = useState(false);
	const { session } = useStore();
	const activeSession = mounted ? session : null;

	useEffect(() => {
		setMounted(true);
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	const handleNavClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		href: string,
		categoryFilter?: string,
	) => {
		if (categoryFilter) {
			window.dispatchEvent(
				new CustomEvent("filter-template-category", {
					detail: { category: categoryFilter },
				}),
			);
		}

		if (href.startsWith("/#") || href.startsWith("#")) {
			const hash = href.includes("#") ? `#${href.split("#")[1]}` : href;
			const isHomePage =
				window.location.pathname === "/" || window.location.pathname === "";

			if (isHomePage) {
				e.preventDefault();
				const targetEl = document.querySelector(hash);
				if (targetEl) {
					targetEl.scrollIntoView({ behavior: "smooth" });
					window.history.pushState(null, "", hash);
				}
			} else {
				e.preventDefault();
				window.location.href = href;
			}
		}
		setOpen(false);
	};

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 transition-all duration-500",
				scrolled || open
					? "border-b border-border bg-card/92 backdrop-blur-md shadow-soft"
					: "border-b border-transparent bg-transparent",
			)}
		>
			<nav
				aria-label="Navigasi utama"
				className="container-page flex h-16 items-center justify-between gap-4 md:h-[4.5rem]"
			>
				<Logo />

				<ul className="hidden items-center gap-6 lg:flex">
					{navLinks.map((l) => (
						<li key={l.href} className="relative group">
							{l.submenus && l.submenus.length > 0 ? (
								<div className="flex items-center gap-1 cursor-pointer">
									<a
										href={l.href}
										onClick={(e) => handleNavClick(e, l.href)}
										className="relative text-[0.82rem] tracking-wide text-foreground/75 transition-colors hover:text-primary py-2"
									>
										{l.label}
									</a>
									<ChevronDown className="size-3 text-muted-foreground group-hover:text-primary transition-transform duration-200 group-hover:rotate-180" />

									<div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
										<div className="w-64 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md space-y-1">
											{l.submenus.map((sub) => (
												<a
													key={sub.label}
													href={sub.href}
													onClick={(e) =>
														handleNavClick(e, sub.href, sub.categoryFilter)
													}
													className="block rounded-xl px-3 py-2 text-xs transition-colors hover:bg-primary/10 hover:text-primary"
												>
													<span className="font-semibold block text-foreground">
														{sub.label}
													</span>
													{sub.desc && (
														<span className="text-[10px] text-muted-foreground block line-clamp-1">
															{sub.desc}
														</span>
													)}
												</a>
											))}
										</div>
									</div>
								</div>
							) : (
								<a
									href={l.href}
									onClick={(e) => handleNavClick(e, l.href)}
									className="relative text-[0.82rem] tracking-wide text-foreground/75 transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100 py-2"
								>
									{l.label}
								</a>
							)}
						</li>
					))}
				</ul>

				<div className="flex items-center gap-2.5">
					{activeSession ? (
						<Link
							to={activeSession.role === "admin" ? "/admin" : "/dasbor"}
							className="hidden items-center gap-2 rounded-full border border-primary/25 bg-card/80 pl-1.5 pr-3.5 py-1 text-[0.8rem] font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-soft lg:inline-flex"
						>
							<img
								src={
									activeSession.avatar ||
									`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(activeSession.name)}&backgroundColor=d1fae5`
								}
								alt={activeSession.name}
								className="size-7 rounded-full object-cover border border-primary/20 bg-secondary/50"
							/>
							<span className="max-w-[120px] truncate font-semibold text-foreground">
								{activeSession.name.split(" ")[0]}
							</span>
							<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary uppercase tracking-wider">
								{activeSession.role === "admin" ? "Admin" : "Member"}
							</span>
						</Link>
					) : (
						<Link
							to="/login"
							className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-4 py-2 text-[0.8rem] font-semibold text-foreground/85 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:text-primary hover:shadow-soft lg:inline-flex"
						>
							<User className="size-3.5" />
							<span>Masuk</span>
						</Link>
					)}

					{activeSession && (
						<Link
							to={activeSession.role === "admin" ? "/admin" : "/dasbor"}
							className="flex items-center rounded-full border border-primary/25 bg-card/90 p-0.5 lg:hidden"
							title="Profil / Dasbor"
						>
							<img
								src={
									activeSession.avatar ||
									`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(activeSession.name)}&backgroundColor=d1fae5`
								}
								alt={activeSession.name}
								className="size-8 rounded-full object-cover border border-primary/20 bg-secondary/50"
							/>
						</Link>
					)}

					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
						aria-controls="mobile-nav"
						aria-label={open ? "Tutup menu" : "Buka menu"}
						className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card/70 lg:hidden"
					>
						<span className="relative block h-3.5 w-5">
							<span
								className={cn(
									"absolute left-0 h-px w-full bg-foreground transition-all duration-300",
									open ? "top-1.5 rotate-45" : "top-0",
								)}
							/>
							<span
								className={cn(
									"absolute top-1.5 left-0 h-px w-full bg-foreground transition-all duration-200",
									open && "opacity-0",
								)}
							/>
							<span
								className={cn(
									"absolute left-0 h-px w-full bg-foreground transition-all duration-300",
									open ? "top-1.5 -rotate-45" : "top-3",
								)}
							/>
						</span>
					</button>
				</div>
			</nav>

			<div
				id="mobile-nav"
				className={cn(
					"overflow-y-auto max-h-[85vh] border-t border-border bg-card/97 backdrop-blur-md transition-[max-height,opacity] duration-500 ease-out lg:hidden",
					open ? "opacity-100" : "max-h-0 opacity-0 pointer-events-none",
				)}
			>
				<ul className="container-page flex flex-col py-3">
					{navLinks.map((l, i) => (
						<li key={l.href} className="border-b border-border/60 py-2">
							{l.submenus && l.submenus.length > 0 ? (
								<div className="space-y-1">
									<div className="flex items-center justify-between py-2">
										<a
											href={l.href}
											onClick={(e) => handleNavClick(e, l.href)}
											className="font-serif text-lg text-foreground/90 font-medium"
										>
											{l.label}
										</a>
										<button
											type="button"
											onClick={() =>
												setOpenSubIndex(openSubIndex === i ? null : i)
											}
											aria-label={`Buka submenu ${l.label}`}
											className="p-2 text-muted-foreground"
										>
											<ChevronDown
												className={cn(
													"size-4 transition-transform duration-200",
													openSubIndex === i && "rotate-180",
												)}
											/>
										</button>
									</div>

									{openSubIndex === i && (
										<div className="pl-4 pb-2 space-y-1.5 border-l-2 border-primary/30">
											{l.submenus.map((sub) => (
												<a
													key={sub.label}
													href={sub.href}
													onClick={(e) =>
														handleNavClick(e, sub.href, sub.categoryFilter)
													}
													className="block py-1 text-xs text-foreground/80 hover:text-primary"
												>
													<span className="font-semibold block">
														{sub.label}
													</span>
													{sub.desc && (
														<span className="text-[10px] text-muted-foreground block">
															{sub.desc}
														</span>
													)}
												</a>
											))}
										</div>
									)}
								</div>
							) : (
								<a
									href={l.href}
									onClick={(e) => handleNavClick(e, l.href)}
									className="block py-3 font-serif text-lg text-foreground/90 font-medium"
								>
									{l.label}
								</a>
							)}
						</li>
					))}
					<li className="pt-4 pb-4">
						{activeSession ? (
							<div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-3">
								<div className="flex items-center gap-3">
									<img
										src={
											activeSession.avatar ||
											`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(activeSession.name)}&backgroundColor=d1fae5`
										}
										alt={activeSession.name}
										className="size-12 rounded-full object-cover border border-primary/20 bg-secondary/50 shrink-0"
									/>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-foreground truncate">
												{activeSession.name}
											</span>
											<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary uppercase tracking-wider shrink-0">
												{activeSession.role === "admin" ? "Admin" : "Member"}
											</span>
										</div>
										{activeSession.email && (
											<span className="text-xs text-muted-foreground truncate block">
												{activeSession.email}
											</span>
										)}
									</div>
								</div>
								<Link
									to={activeSession.role === "admin" ? "/admin" : "/dasbor"}
									onClick={() => setOpen(false)}
									className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary"
								>
									<span>Buka Dasbor</span>
								</Link>
							</div>
						) : (
							<Link
								to="/login"
								onClick={() => setOpen(false)}
								className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card/90 px-6 py-3.5 text-sm font-semibold text-foreground"
							>
								<User className="size-4" />
								<span>Masuk ke Akun</span>
							</Link>
						)}
					</li>
				</ul>
			</div>
		</header>
	);
}
