import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	BookHeart,
	CreditCard,
	Image,
	Folder,
	LayoutDashboard,
	LogOut,
	Mail,
	MessageSquare,
	Music,
	Newspaper,
	Quote,
	ScrollText,
	ServerCog,
	Sparkles,
	Users,
	Menu,
	X,
	ChevronRight,
	ChevronDown,
	User,
	Lock,
	Video,
	Bot,
	Network,
	PanelLeftClose,
	PanelLeftOpen,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/kit";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/appStore";
import { fetchAdminSettings } from "@/functions/settings";

export const Route = createFileRoute("/admin")({
	loader: () => fetchAdminSettings(),
	component: AdminLayout,
});

type NavSubItem = {
	to: string;
	label: string;
	icon: React.ElementType;
	exact?: boolean;
};

type NavItem = {
	to: string;
	label: string;
	icon: React.ElementType;
	exact?: boolean;
	badge?: string;
	target?: string;
	children?: NavSubItem[];
};

type NavGroup = {
	label: string;
	items: NavItem[];
};

const navGroups: NavGroup[] = [
	{
		label: "Utama",
		items: [
			{ to: "/admin", label: "Ikhtisar", icon: LayoutDashboard, exact: true },
			{ to: "/admin/undangan", label: "Undangan", icon: Mail },
			{ to: "/admin/template", label: "Template", icon: Sparkles },
			{
				to: "/admin/templates-ai",
				label: "Templates Powered by AI",
				icon: Bot,
				badge: "Studio Dev",
				target: "_blank",
			},
			{ to: "/admin/pengguna", label: "Pengguna", icon: Users },
		],
	},
	{
		label: "Komunikasi",
		items: [
			{
				to: "/admin/pesan-wa",
				label: "Template Pesan WA",
				icon: MessageSquare,
			},
		],
	},
	{
		label: "Konten",
		items: [
			{
				to: "/admin/promosi-template",
				label: "Promosi AI",
				icon: Sparkles,
				badge: "Gemini",
				children: [
					{
						to: "/admin/promosi-template",
						label: "Promosi Template",
						icon: Sparkles,
					},
					{
						to: "/admin/promosi-gambar",
						label: "Studio Promosi AI",
						icon: Image,
					},
					{
						to: "/admin/promosi-pengaturan",
						label: "Pengaturan AI",
						icon: Bot,
					},
				],
			},
			{ to: "/admin/deteksi-aset", label: "Deteksi Aset", icon: Folder },
			{ to: "/admin/galeri-aset", label: "Galeri Aset", icon: Image },
			{ to: "/admin/musik", label: "Musik", icon: Music },
			{ to: "/admin/doa", label: "Doa & Ayat", icon: BookHeart },
			{ to: "/admin/quotes", label: "Quotes", icon: Quote },
			{ to: "/admin/surat", label: "Surat", icon: ScrollText },
			{ to: "/admin/berita", label: "Berita & Artikel", icon: Newspaper },
		],
	},
	{
		label: "Sistem",
		items: [
			{ to: "/admin/paket", label: "Paket & Benefit", icon: CreditCard },
			{ to: "/admin/transaksi", label: "Transaksi", icon: CreditCard },
			{ to: "/admin/sistem", label: "Pengaturan", icon: ServerCog },
			{ to: "/admin/arsitektur", label: "Arsitektur Sistem", icon: Network },
		],
	},
];

function SidebarNavItem({
	item,
	onClose,
}: {
	item: NavItem;
	onClose: () => void;
}) {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const isParentActive = item.exact
		? currentPath === item.to
		: currentPath.startsWith(item.to);
	const hasChildren = Boolean(item.children && item.children.length > 0);
	const isChildActive = Boolean(
		item.children?.some((c) =>
			c.exact ? currentPath === c.to : currentPath.startsWith(c.to),
		),
	);
	const isActive = isParentActive || isChildActive;
	const [expanded, setExpanded] = useState(isActive);

	useEffect(() => {
		if (isChildActive) {
			setExpanded(true);
		}
	}, [isChildActive]);

	const Icon = item.icon;

	if (hasChildren && item.children) {
		return (
			<div className="space-y-1">
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className={cn(
						"group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer",
						isActive
							? "bg-[#c9a96e]/15 text-[#e8c98a] font-semibold"
							: "text-white/50 hover:bg-white/5 hover:text-white/80",
					)}
					aria-expanded={expanded}
				>
					{isActive && (
						<span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#c9a96e]" />
					)}
					<Icon
						className={cn(
							"size-4 shrink-0 transition-colors",
							isActive
								? "text-[#c9a96e]"
								: "text-white/40 group-hover:text-white/60",
						)}
						aria-hidden="true"
					/>
					<span className="truncate">{item.label}</span>
					{item.badge && (
						<span className="ml-1 rounded-[5px] bg-[#c9a96e]/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#e8c98a]">
							{item.badge}
						</span>
					)}
					<span className="ml-auto text-white/40 group-hover:text-white/70 transition-transform">
						{expanded ? (
							<ChevronDown className="size-3.5 text-[#c9a96e]" />
						) : (
							<ChevronRight className="size-3.5" />
						)}
					</span>
				</button>
				{expanded && (
					<div className="relative ml-4 space-y-0.5 border-l border-white/10 pl-2.5">
						{item.children.map((sub) => {
							const SubIcon = sub.icon;
							const isSubActive = sub.exact
								? currentPath === sub.to
								: currentPath.startsWith(sub.to);
							return (
								<Link
									key={sub.to}
									to={sub.to}
									onClick={onClose}
									className={cn(
										"group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition-colors",
										isSubActive
											? "bg-[#c9a96e]/20 text-[#e8c98a] font-semibold"
											: "text-white/50 hover:bg-white/5 hover:text-white/80",
									)}
								>
									<SubIcon
										className={cn(
											"size-3.5 shrink-0 transition-colors",
											isSubActive
												? "text-[#c9a96e]"
												: "text-white/30 group-hover:text-white/60",
										)}
									/>
									<span className="truncate">{sub.label}</span>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		);
	}

	return (
		<Link
			to={item.to}
			onClick={onClose}
			target={item.target}
			rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
			className={cn(
				"group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200",
				isActive
					? "bg-gradient-to-r from-[#c9a96e]/20 to-[#c9a96e]/5 text-[#e8c98a] font-semibold"
					: "text-white/50 hover:bg-white/5 hover:text-white/80",
			)}
			aria-current={isActive ? "page" : undefined}
		>
			{isActive && (
				<span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#c9a96e]" />
			)}
			<Icon
				className={cn(
					"size-4 shrink-0 transition-colors",
					isActive
						? "text-[#c9a96e]"
						: "text-white/40 group-hover:text-white/60",
				)}
				aria-hidden="true"
			/>
			<span className="truncate">{item.label}</span>
			{item.badge && (
				<span className="ml-auto rounded-[5px] bg-[#c9a96e]/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#e8c98a]">
					{item.badge}
				</span>
			)}
			{isActive && !item.badge && (
				<ChevronRight
					className="ml-auto size-3 text-[#c9a96e]/60"
					aria-hidden="true"
				/>
			)}
		</Link>
	);
}

function AdminSidebar({
	open,
	onClose,
	onNavClick,
}: {
	open: boolean;
	onClose: () => void;
	onNavClick: () => void;
}) {
	const navigate = useNavigate();
	const { session, signOut } = useStore();
	const settings = Route.useLoaderData();
	const adminName =
		session?.name || settings?.adminName || "Eka Syarif Maulana";
	const adminAvatar = session?.avatar || settings?.adminAvatar || "";

	function handleLogout() {
		signOut();
		navigate({ to: "/login" });
	}

	return (
		<aside
			className={cn(
				"flex h-full flex-col border-r border-white/8 bg-[#0d0d0f] shrink-0 transition-all duration-300 ease-in-out",
				"fixed inset-y-0 left-0 z-50 lg:relative shadow-2xl lg:shadow-none",
				open
					? "translate-x-0 w-[80%] max-w-[280px] lg:w-64 opacity-100"
					: "-translate-x-full w-[80%] max-w-[280px] lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0",
			)}
			aria-label="Navigasi admin"
		>
			<div className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 px-4 sm:px-5">
				<div className="flex items-center gap-2.5 min-w-0">
					<img
						src="/logo.png"
						alt="Simfoni Cinta"
						className="size-8 object-contain shrink-0"
					/>
					<div className="min-w-0">
						<p className="truncate text-xs sm:text-sm font-bold tracking-tight text-white">
							Simfoni Cinta
						</p>
						<p className="text-[9px] sm:text-[10px] text-[#c9a96e]/70 font-medium tracking-wide uppercase">
							Admin Panel
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="lg:hidden flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
					aria-label="Tutup menu"
				>
					<X className="size-5" />
				</button>
			</div>

			<nav
				className="flex-1 overflow-y-auto px-3 py-4 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				aria-label="Menu utama"
			>
				{navGroups.map((group) => (
					<div key={group.label}>
						<p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-white/25 uppercase">
							{group.label}
						</p>
						<div className="space-y-0.5">
							{group.items.map((item) => (
								<SidebarNavItem key={item.to} item={item} onClose={onNavClick} />
							))}
						</div>
					</div>
				))}
			</nav>

			<div className="shrink-0 border-t border-white/8 p-3">
				<div className="flex items-center gap-2 rounded-xl bg-white/4 p-2.5 ring-1 ring-white/8">
					<Link
						to="/admin/profil"
						onClick={onClose}
						className="flex min-w-0 flex-1 items-center gap-2.5 group"
						aria-label={`Profil admin ${adminName}`}
					>
						<div className="relative shrink-0">
							<Avatar
								src={adminAvatar || undefined}
								name={adminName}
								tone="gold"
								size="md"
							/>
							<span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#0d0d0f] bg-emerald-400" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-xs font-semibold text-white/90 group-hover:text-[#e8c98a] transition-colors">
								{adminName}
							</p>
							<span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#c9a96e]/20 to-[#a07840]/10 px-1.5 py-px text-[9px] font-bold tracking-wider text-[#c9a96e] uppercase ring-1 ring-[#c9a96e]/20">
								✦ Master Admin
							</span>
						</div>
					</Link>

					<button
						type="button"
						onClick={handleLogout}
						className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-rose-500/15 hover:text-rose-400 active:scale-95 cursor-pointer"
						aria-label="Logout"
						title="Keluar dari akun admin"
					>
						<LogOut className="size-3.5" aria-hidden="true" />
					</button>
				</div>
			</div>
		</aside>
	);
}

function AdminTopHeader({
	sidebarOpen,
	onToggleSidebar,
}: {
	sidebarOpen: boolean;
	onToggleSidebar: () => void;
}) {
	const navigate = useNavigate();
	const { session, signOut } = useStore();
	const settings = Route.useLoaderData();
	const adminName =
		session?.name || settings?.adminName || "Eka Syarif Maulana";
	const adminAvatar = session?.avatar || settings?.adminAvatar || "";

	function handleLogout() {
		signOut();
		navigate({ to: "/login" });
	}

	return (
		<header
			className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 bg-[#090c10]/95 px-4 sm:px-6 backdrop-blur-xl z-30"
			aria-label="Header admin"
		>
			<button
				type="button"
				onClick={onToggleSidebar}
				className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
				aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
			>
				{sidebarOpen ? (
					<PanelLeftClose className="size-4" aria-hidden="true" />
				) : (
					<Menu className="size-4" aria-hidden="true" />
				)}
			</button>

			<div className="flex min-w-0 flex-1 items-center gap-2 pl-2 sm:pl-0">
				<div className="hidden items-center gap-1.5 sm:flex">
					<span className="inline-block size-2 animate-pulse rounded-full bg-emerald-400" />
					<span className="text-xs font-medium text-emerald-400/90">
						Sistem Online
					</span>
					<span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
						0.1ms
					</span>
				</div>
				<div className="flex size-2 animate-pulse rounded-full bg-emerald-400 sm:hidden" />
			</div>

			<div className="flex shrink-0 items-center gap-1.5">
				<Link
					to="/admin/profil"
					className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-white/5 active:scale-95"
					aria-label={`Profil ${adminName}`}
				>
					<div className="relative">
						<Avatar
							{...(adminAvatar ? { src: adminAvatar } : {})}
							name={adminName}
							tone="gold"
							size="sm"
						/>
						<span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-[#0d0d0f] bg-emerald-400" />
					</div>
					<div className="hidden flex-col items-start lg:flex">
						<span className="text-[11px] font-semibold text-white/80 group-hover:text-[#e8c98a] transition-colors leading-none">
							{adminName}
						</span>
						<span className="text-[9px] font-bold tracking-wider text-[#c9a96e]/70 uppercase">
							Master Admin
						</span>
					</div>
					<User
						className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors lg:hidden"
						aria-hidden="true"
					/>
				</Link>

				<button
					type="button"
					onClick={handleLogout}
					className="hidden size-9 items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-rose-500/15 hover:text-rose-400 active:scale-95 lg:flex cursor-pointer"
					aria-label="Logout"
				>
					<LogOut className="size-3.5" aria-hidden="true" />
				</button>
			</div>
		</header>
	);
}

function AdminLayout() {
	const { session, isLoaded } = useStore();
	const navigate = useNavigate();
	const [sidebarOpen, setSidebarOpen] = useState(() => {
		if (typeof window === "undefined") return true;
		if (window.innerWidth < 1024) return false;
		const saved = localStorage.getItem("admin_sidebar_open");
		if (saved !== null) return saved === "true";
		return true;
	});
	const mainRef = useRef<HTMLElement>(null);
	const routerState = useRouterState();
	const pathname = routerState.location.pathname;

	function handleToggleSidebar() {
		setSidebarOpen((prev) => {
			const next = !prev;
			if (typeof window !== "undefined" && window.innerWidth >= 1024) {
				localStorage.setItem("admin_sidebar_open", String(next));
			}
			return next;
		});
	}

	function handleCloseSidebar() {
		setSidebarOpen(false);
	}

	function handleNavClick() {
		if (typeof window !== "undefined" && window.innerWidth < 1024) {
			setSidebarOpen(false);
		}
	}

	useEffect(() => {
		mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
		if (typeof window !== "undefined" && window.innerWidth < 1024) {
			setSidebarOpen(false);
		}
	}, [pathname]);

	useEffect(() => {
		if (!isLoaded) return;

		const userEmail = session?.email?.trim().toLowerCase();
		const isMasterOwner =
			session?.role === "admin" || userEmail === "eka.ckp16799@gmail.com";

		if (!session) {
			navigate({ to: "/login", replace: true });
		} else if (!isMasterOwner) {
			navigate({ to: "/dasbor", replace: true });
		}
	}, [session, isLoaded, navigate]);

	if (!isLoaded) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#090c10] text-white">
				<div className="flex flex-col items-center gap-3">
					<div className="size-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
					<p className="text-xs text-white/50">Memuat sesi admin...</p>
				</div>
			</div>
		);
	}

	const userEmail = session?.email?.trim().toLowerCase();
	const isMasterOwner =
		session?.role === "admin" || userEmail === "eka.ckp16799@gmail.com";

	if (!session || !isMasterOwner) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#090c10] text-white">
				<div className="text-center space-y-3 p-6">
					<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
						<Lock className="size-6" />
					</div>
					<h2 className="font-serif text-lg font-bold text-white">
						Akses Terbatas Master Admin
					</h2>
					<p className="text-xs text-white/50 max-w-sm">
						Halaman ini hanya dapat diakses oleh akun Master Owner
						(eka.ckp16799@gmail.com). Mengalihkan...
					</p>
				</div>
			</div>
		);
	}

	if (pathname.startsWith("/admin/templates-ai")) {
		return <Outlet />;
	}

	return (
		<div className="dark flex h-screen overflow-hidden bg-[#090c10] text-slate-100 relative">
			<AdminSidebar
				open={sidebarOpen}
				onClose={handleCloseSidebar}
				onNavClick={handleNavClick}
			/>

			{sidebarOpen && (
				<div
					className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
					onClick={handleCloseSidebar}
					aria-hidden="true"
				/>
			)}

			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<AdminTopHeader
					sidebarOpen={sidebarOpen}
					onToggleSidebar={handleToggleSidebar}
				/>

				<main
					ref={mainRef}
					className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					id="main-content"
				>
					<Outlet />
				</main>
			</div>

			{/* Admin Mobile Bottom Navigation Bar */}
			<nav
				className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0d0d0f]/95 backdrop-blur-md px-3 py-1.5 shadow-[0_-5px_25px_rgba(0,0,0,0.5)] select-none"
				aria-label="Navigasi admin mobile"
			>
				<div className="flex items-center justify-around max-w-md mx-auto relative">
					{/* 1. Ikhtisar */}
					<Link
						to="/admin"
						activeOptions={{ exact: true }}
						className="flex flex-col items-center justify-center py-1 px-2 text-[10px] font-semibold text-white/50 data-[status=active]:text-[#e8c98a] data-[status=active]:font-bold transition-colors"
					>
						<LayoutDashboard className="size-5 mb-0.5" />
						<span>Ikhtisar</span>
					</Link>

					{/* 2. Undangan */}
					<Link
						to="/admin/undangan"
						className="flex flex-col items-center justify-center py-1 px-2 text-[10px] font-semibold text-white/50 data-[status=active]:text-[#e8c98a] data-[status=active]:font-bold transition-colors"
					>
						<Mail className="size-5 mb-0.5" />
						<span>Undangan</span>
					</Link>

					{/* 3. Tengah: Template (Elevated Gold/Emerald Action Button) */}
					<Link
						to="/admin/template"
						className="flex flex-col items-center justify-center -translate-y-4 group cursor-pointer"
					>
						<div className="size-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.45)] ring-4 ring-[#0d0d0f] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95">
							<Sparkles className="size-6 text-slate-950 stroke-[2.5]" />
						</div>
						<span className="text-[10px] font-bold text-[#e8c98a] mt-0.5">
							Template
						</span>
					</Link>

					{/* 4. Pengguna */}
					<Link
						to="/admin/pengguna"
						className="flex flex-col items-center justify-center py-1 px-2 text-[10px] font-semibold text-white/50 data-[status=active]:text-[#e8c98a] data-[status=active]:font-bold transition-colors"
					>
						<Users className="size-5 mb-0.5" />
						<span>Pengguna</span>
					</Link>

					{/* 5. Menu Drawer */}
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="flex flex-col items-center justify-center py-1 px-2 text-[10px] font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
					>
						<Menu className="size-5 mb-0.5" />
						<span>Menu</span>
					</button>
				</div>
			</nav>

			{/* Backdrop Drawer Overlay on Mobile */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
					onClick={() => setSidebarOpen(false)}
					aria-hidden="true"
				/>
			)}
		</div>
	);
}
