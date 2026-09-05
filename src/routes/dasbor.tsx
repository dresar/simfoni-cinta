import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	Home,
	LogOut,
	Sparkles,
	Menu,
	X,
	User,
	ShoppingBag,
	ScrollText,
	Lock,
	Share2,
	BookOpen,
} from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { initialsOf } from "@/components/kit";
import { useStore } from "@/store/appStore";
import { fetchUserEntitlements } from "@/functions/entitlements";

export const Route = createFileRoute("/dasbor")({
	component: UserLayout,
});

const navMain = [
	{ to: "/dasbor", label: "Beranda", icon: Home, exact: true },
	{ to: "/dasbor/template", label: "Katalog Template", icon: Sparkles },
];

const navInvitations = [
	{ to: "/dasbor/undangan", label: "Undangan Saya", icon: ScrollText },
	{ to: "/dasbor/sebar", label: "Sebar WA Undangan", icon: Share2 },
];

const navGuestbook = [
	{ to: "/dasbor/buku-tamu", label: "Buku Tamu Digital", icon: BookOpen },
];

const navPurchases = [
	{ to: "/dasbor/pembelian", label: "Pembelian Saya", icon: ShoppingBag },
];

const navAccount = [
	{ to: "/dasbor/profil", label: "Profil & Akun", icon: User },
];

function UserLayout() {
	const navigate = useNavigate();
	const routerState = useRouterState();
	const { session, isLoaded, signOut } = useStore();
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [availableCount, setAvailableCount] = useState<number>(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && isLoaded) {
			if (!session) {
				navigate({ to: "/login", replace: true });
			} else if (
				session.role === "admin" ||
				session.email?.trim().toLowerCase() === "eka.ckp16799@gmail.com"
			) {
				navigate({ to: "/admin", replace: true });
			}
		}
	}, [mounted, isLoaded, session, navigate]);

	useEffect(() => {
		if (session?.email) {
			fetchUserEntitlements({ data: session.email })
				.then((items) => {
					const avail = items.filter((i) => i.status === "available").length;
					setAvailableCount(avail);
				})
				.catch(() => {});
		}
	}, [session?.email]);

	const userName = session?.name || "Pengguna";

	const navLinkClass =
		"flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900 data-[status=active]:border data-[status=active]:border-emerald-700/20 data-[status=active]:bg-emerald-50/80 data-[status=active]:text-emerald-950 data-[status=active]:font-bold data-[status=active]:shadow-xs";

	function SidebarContent({
		onClose,
		isDrawer = false,
	}: {
		onClose?: () => void;
		isDrawer?: boolean;
	}) {
		return (
			<div
				className="flex flex-col justify-between h-full space-y-6"
				suppressHydrationWarning
			>
				<div className="space-y-6" suppressHydrationWarning>
					{!isDrawer && (
						<div
							className="flex items-center gap-2.5 px-2 py-1"
							suppressHydrationWarning
						>
							<img
								src="/logo.png"
								alt="Simfoni Cinta"
								className="size-8 object-contain shrink-0"
							/>
							<div suppressHydrationWarning>
								<span className="font-serif text-base font-bold text-stone-900 block leading-tight">
									Simfoni Cinta
								</span>
							</div>
						</div>
					)}

					<div className="space-y-1" suppressHydrationWarning>
						<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
							Utama
						</p>
						<nav className="space-y-0.5" aria-label="Navigasi utama">
							{navMain.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									onClick={onClose}
									activeOptions={{ exact: item.exact ?? false }}
									className={navLinkClass}
								>
									<item.icon className="size-4 shrink-0 text-stone-400" />
									<span>{item.label}</span>
								</Link>
							))}
						</nav>
					</div>

					<div className="space-y-1" suppressHydrationWarning>
						<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
							Undangan
						</p>
						{navInvitations.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								onClick={onClose}
								className={navLinkClass}
							>
								<item.icon className="size-4 shrink-0 text-stone-400" />
								<span>{item.label}</span>
							</Link>
						))}
					</div>

					<div className="space-y-1" suppressHydrationWarning>
						<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
							Buku Tamu
						</p>
						{navGuestbook.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								onClick={onClose}
								className={navLinkClass}
							>
								<item.icon className="size-4 shrink-0 text-stone-400" />
								<span>{item.label}</span>
							</Link>
						))}
					</div>

					<div className="space-y-1" suppressHydrationWarning>
						<p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
							Transaksi
						</p>
						{navPurchases.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								onClick={onClose}
								className={navLinkClass}
							>
								<item.icon className="size-4 shrink-0 text-stone-400" />
								<span>{item.label}</span>
							</Link>
						))}
					</div>
				</div>

				<div
					className="space-y-2 pt-4 border-t border-stone-200/60"
					suppressHydrationWarning
				>
					{navAccount.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							onClick={onClose}
							className={navLinkClass}
						>
							<item.icon className="size-4 shrink-0 text-stone-400" />
							<span>{item.label}</span>
						</Link>
					))}
					<div
						className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200/60 p-2"
						suppressHydrationWarning
					>
						<div
							className="flex items-center gap-2 min-w-0"
							suppressHydrationWarning
						>
							{mounted && session?.avatar ? (
								<img
									src={session.avatar}
									alt={userName}
									referrerPolicy="no-referrer"
									crossOrigin="anonymous"
									className="size-7 shrink-0 rounded-full object-cover border border-emerald-300 shadow-xs"
								/>
							) : (
								<div
									className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 text-white font-bold text-xs shadow-xs"
									suppressHydrationWarning
								>
									{mounted ? initialsOf(userName) : ""}
								</div>
							)}
							<div className="min-w-0" suppressHydrationWarning>
								<p
									className="text-xs font-bold text-stone-900 truncate leading-snug"
									suppressHydrationWarning
								>
									{mounted ? userName : "Pengguna"}
								</p>
								<p
									className="text-[10px] font-mono text-stone-500 truncate"
									suppressHydrationWarning
								>
									{mounted ? session?.email : ""}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => {
								signOut();
								navigate({ to: "/login" });
							}}
							className="flex size-6.5 items-center justify-center rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
							title="Keluar"
						>
							<LogOut className="size-3.5" />
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (
		mounted &&
		session &&
		(session.role === "admin" ||
			session.email?.trim().toLowerCase() === "eka.ckp16799@gmail.com")
	) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#faf8f5] text-stone-900">
				<div className="text-center space-y-3 p-6 max-w-md bg-white rounded-xl border border-stone-200 shadow-sm">
					<div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
						<Lock className="size-5" />
					</div>
					<h2 className="font-serif text-lg font-bold text-stone-900">
						Akses Dasbor Khusus Pengantin
					</h2>
					<p className="text-xs text-stone-500">
						Anda masuk sebagai Master Admin. Silakan kelola sistem dan undangan melalui Admin Panel.
					</p>
					<Link
						to="/admin"
						className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
					>
						Buka Admin Panel
					</Link>
				</div>
			</div>
		);
	}

	const isGuestbookEventFullPage =
		routerState.location.pathname.startsWith("/dasbor/buku-tamu/") &&
		routerState.location.pathname !== "/dasbor/buku-tamu" &&
		routerState.location.pathname !== "/dasbor/buku-tamu/";

	if (isGuestbookEventFullPage) {
		return (
			<div
				className="h-screen w-screen flex flex-col overflow-hidden bg-[#faf8f5] text-stone-900"
				suppressHydrationWarning
			>
				<main className="flex-1 min-w-0 overflow-y-auto" id="main-content">
					<Outlet />
				</main>
			</div>
		);
	}

	return (
		<div
			className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden bg-[#faf8f5] text-stone-900"
			suppressHydrationWarning
		>
			<aside
				className="hidden lg:flex w-60 shrink-0 flex-col justify-between border-r border-stone-200/80 bg-white p-4 h-screen overflow-y-auto shadow-xs z-30"
				suppressHydrationWarning
			>
				<SidebarContent />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
				<header className="shrink-0 border-b border-stone-200/80 bg-white/95 px-4 sm:px-6 h-13 flex items-center justify-between backdrop-blur-md z-30">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setMobileDrawerOpen(true)}
							className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors lg:hidden cursor-pointer"
							aria-label="Buka Menu"
						>
							<Menu className="size-4" />
						</button>
						<Link to="/dasbor" className="flex items-center gap-2 group">
							<img
								src="/logo.png"
								alt="Simfoni Cinta"
								className="size-7 object-contain shrink-0 transition-transform group-hover:scale-105"
							/>
							<span className="font-serif text-sm sm:text-base font-bold text-stone-900">
								Simfoni Cinta
							</span>
						</Link>
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								signOut();
								navigate({ to: "/login" });
							}}
							className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-xs"
							title="Keluar dari akun"
						>
							<LogOut className="size-3.5" />
							<span className="hidden sm:inline">Keluar</span>
						</button>
					</div>
				</header>

				<main
					className="flex-1 min-w-0 overflow-y-auto pb-28 lg:pb-6"
					id="main-content"
				>
					<div className="max-w-5xl mx-auto space-y-5 px-4 sm:px-8 py-5 lg:py-6">
						<Outlet />
					</div>
				</main>
			</div>

			<nav
				className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-lg px-3 py-1.5 pb-2 shadow-[0_-5px_25px_rgba(0,0,0,0.08)] select-none"
				aria-label="Navigasi dasbor mobile"
			>
				<div className="flex items-center justify-around max-w-md mx-auto relative">
					<Link
						to="/dasbor"
						activeOptions={{ exact: true }}
						className="flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold text-stone-500 data-[status=active]:text-emerald-800 data-[status=active]:font-bold transition-colors"
					>
						<Home className="size-5.5 mb-1" />
						<span>Beranda</span>
					</Link>

					<Link
						to="/dasbor/template"
						className="flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold text-stone-500 data-[status=active]:text-emerald-800 data-[status=active]:font-bold transition-colors"
					>
						<Sparkles className="size-5.5 mb-1" />
						<span>Template</span>
					</Link>

					<Link
						to="/dasbor/undangan"
						className="flex flex-col items-center justify-center -translate-y-4 group cursor-pointer"
					>
						<div className="size-12 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-[0_6px_20px_rgba(5,150,105,0.45)] ring-4 ring-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95">
							<ScrollText className="size-6 text-white stroke-[2.5]" />
						</div>
						<span className="text-[10.5px] font-bold text-emerald-800 mt-0.5">
							Undangan
						</span>
					</Link>

					<Link
						to="/dasbor/pembelian"
						className="flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold text-stone-500 data-[status=active]:text-emerald-800 data-[status=active]:font-bold transition-colors"
					>
						<ShoppingBag className="size-5.5 mb-1" />
						<span>Pesanan</span>
					</Link>

					<Link
						to="/dasbor/profil"
						className="flex flex-col items-center justify-center py-1 px-2.5 text-[11px] font-semibold text-stone-500 data-[status=active]:text-emerald-800 data-[status=active]:font-bold transition-colors"
					>
						<User className="size-5.5 mb-1" />
						<span>Profil</span>
					</Link>
				</div>
			</nav>

			{mobileDrawerOpen && (
				<div className="fixed inset-0 z-50 flex lg:hidden">
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
						onClick={() => setMobileDrawerOpen(false)}
					/>
					<div className="relative flex w-4/5 max-w-xs flex-1 flex-col justify-between bg-white p-4 shadow-2xl z-10 overflow-y-auto">
						<div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
							<div className="flex items-center gap-2">
								<img
									src="/logo.png"
									alt="Simfoni Cinta"
									className="size-7 object-contain shrink-0"
								/>
								<div>
									<span className="font-serif text-sm font-bold text-stone-900 block leading-tight">
										Simfoni Cinta
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setMobileDrawerOpen(false)}
								className="flex size-7 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						</div>
						<SidebarContent
							onClose={() => setMobileDrawerOpen(false)}
							isDrawer={true}
						/>
					</div>
				</div>
			)}

			<a
				href="https://wa.me/6282392115909?text=Halo%20Admin%20Aksara%20Cinta,%20saya%20butuh%20bantuan"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Bantuan CS via WhatsApp"
				className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group cursor-pointer"
				title="Bantuan CS WhatsApp"
			>
				<span className="relative flex size-12 sm:size-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-[0_6px_20px_rgba(16,185,129,0.45)] ring-3 ring-white shadow-emerald-900/20 transition-transform duration-200 group-hover:scale-110 active:scale-95">
					<span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-400">
						<span className="size-1.5 rounded-full bg-white animate-pulse" />
					</span>
					<WhatsappLogo weight="fill" className="size-6 sm:size-7 text-white drop-shadow-xs" />
				</span>
			</a>
		</div>
	);
}
