import { useState, useEffect } from "react";
import {
	createFileRoute,
	Link,
	Outlet,
	useParams,
	useRouterState,
	useNavigate,
} from "@tanstack/react-router";
import {
	LayoutDashboard,
	UserCheck,
	Users,
	MessageSquare,
	BarChart3,
	History,
	Settings,
	Calendar,
	MapPin,
	ArrowLeft,
	Clock,
	Lock,
	ExternalLink,
	Sparkles,
	ShoppingBag,
	CheckCircle2,
} from "lucide-react";
import { initialsOf } from "@/components/kit";
import { useStore } from "@/store/appStore";
import {
	fetchGuestbookEvent,
	checkGuestbookAccess,
} from "@/functions/guestbook";

export const Route = createFileRoute("/dasbor/buku-tamu/$eventId")({
	component: GuestbookEventLayout,
});

interface EventData {
	id: string;
	title: string;
	description: string;
	eventDate: string;
	eventTime: string;
	location: string;
	notes: string;
	status: "draft" | "active" | "completed" | "archived";
	createdAt: string;
}

function GuestbookEventLayout() {
	const { eventId } = useParams({ from: "/dasbor/buku-tamu/$eventId" });
	const { session, isLoaded } = useStore();
	const navigate = useNavigate();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const [event, setEvent] = useState<EventData | null>(null);
	const [loading, setLoading] = useState(true);
	const [eligibility, setEligibility] = useState<{
		eligible: boolean;
		reason?: string;
		tier?: string;
	}>({ eligible: true });

	const loadEvent = async () => {
		if (!session?.email || !eventId) return;
		try {
			const [evRes, accessRes] = await Promise.all([
				fetchGuestbookEvent({
					data: { eventId, userEmail: session.email },
				}),
				checkGuestbookAccess({ data: session.email }),
			]);
			setEvent(evRes as EventData | null);
			if (accessRes) {
				setEligibility(accessRes);
			}
		} catch {
			setEvent(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEvent();
	}, [eventId, session?.email]);

	const tabs = [
		{
			to: `/dasbor/buku-tamu/${eventId}`,
			label: "Ringkasan",
			icon: LayoutDashboard,
			exact: true,
		},
		{
			to: `/dasbor/buku-tamu/${eventId}/kehadiran`,
			label: "Check-in Cepat",
			icon: UserCheck,
			highlight: true,
		},
		{
			to: `/dasbor/buku-tamu/${eventId}/tamu`,
			label: "Daftar Tamu",
			icon: Users,
		},
		{
			to: `/dasbor/buku-tamu/${eventId}/ucapan`,
			label: "Buku Ucapan",
			icon: MessageSquare,
		},
		{
			to: `/dasbor/buku-tamu/${eventId}/analitik`,
			label: "Statistik",
			icon: BarChart3,
		},
		{
			to: `/dasbor/buku-tamu/${eventId}/log`,
			label: "Log Aktivitas",
			icon: History,
		},
		{
			to: `/dasbor/buku-tamu/${eventId}/pengaturan`,
			label: "Pengaturan",
			icon: Settings,
		},
	];

	const isTabActive = (tabPath: string, exact?: boolean) => {
		if (exact) {
			return currentPath === tabPath || currentPath === `${tabPath}/`;
		}
		return currentPath.startsWith(tabPath);
	};

	if (loading) {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-[#faf8f5]">
				<div className="text-center space-y-2">
					<div className="size-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-xs text-stone-500 font-medium">
						Menyiapkan Buku Tamu Digital...
					</p>
				</div>
			</div>
		);
	}

	if (!eligibility.eligible) {
		return (
			<div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#faf8f5] p-4 text-stone-900">
				<div className="max-w-md w-full rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 text-center space-y-5 shadow-lg">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80">
						<Lock className="size-7" />
					</div>

					<div className="space-y-2">
						<div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
							<Sparkles className="size-3" />
							<span>Fitur Paket Aktif</span>
						</div>
						<h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							Buku Tamu Digital Belum Aktif
						</h2>
						<p className="text-xs text-stone-600 leading-relaxed">
							{eligibility.reason ||
								"Buku Tamu Digital hanya dapat diakses setelah pesanan paket undangan Anda berhasil diselesaikan/lunas."}
						</p>
					</div>

					<div className="space-y-2 pt-2 border-t border-stone-100">
						<Link
							to="/dasbor/pembelian"
							className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
						>
							<ShoppingBag className="size-3.5" />
							<span>Beli / Selesaikan Pesanan Paket</span>
						</Link>

						<Link
							to="/dasbor"
							className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 py-2 text-xs font-semibold text-stone-600 transition-colors"
						>
							<ArrowLeft className="size-3.5" />
							<span>Kembali ke Dasbor</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#faf8f5] p-4 text-stone-900">
				<div className="max-w-md w-full rounded-2xl border border-stone-200 bg-white p-8 text-center space-y-4 shadow-sm">
					<p className="text-base font-bold text-stone-900">
						Acara Tidak Ditemukan
					</p>
					<p className="text-xs text-stone-500">
						Acara ini mungkin telah dihapus atau Anda tidak memiliki hak akses.
					</p>
					<Link
						to="/dasbor/buku-tamu"
						className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs"
					>
						<ArrowLeft className="size-3.5" />
						<span>Kembali ke Daftar Acara</span>
					</Link>
				</div>
			</div>
		);
	}

	const userName = session?.name || "Pengguna";

	return (
		<div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
			<header className="sticky top-0 z-40 border-b border-stone-200/90 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-xs">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-7xl mx-auto">
					<div className="flex items-center justify-between md:justify-start gap-3">
						<div className="flex items-center gap-2.5">
							<Link
								to="/dasbor/buku-tamu"
								className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors shrink-0 cursor-pointer"
								title="Kembali ke Daftar Acara"
							>
								<ArrowLeft className="size-4" />
							</Link>

							<div className="flex items-center gap-2">
								<img
									src="/logo.png"
									alt="Simfoni Cinta"
									className="size-7 object-contain shrink-0 hidden sm:block"
								/>
								<div className="min-w-0">
									<div className="flex items-center gap-1.5 flex-wrap">
										<span className="font-serif text-sm sm:text-base font-bold text-stone-900 truncate leading-tight">
											{event.title}
										</span>
										<span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.2 text-[9px] font-bold">
											Buku Tamu Full
										</span>
									</div>
									<div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium truncate">
										<span>{event.eventDate}</span>
										{event.eventTime && (
											<>
												<span>·</span>
												<span>{event.eventTime}</span>
											</>
										)}
										{event.location && (
											<>
												<span>·</span>
												<span className="truncate max-w-[150px] sm:max-w-xs">{event.location}</span>
											</>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 md:hidden">
							<Link
								to="/dasbor"
								className="rounded-lg border border-stone-200 bg-stone-50 p-1.5 text-stone-600 text-[11px] font-semibold"
								title="Kembali ke Dasbor Utama"
							>
								Dasbor
							</Link>
						</div>
					</div>

					<div className="flex items-center justify-between md:justify-end gap-2">
						<nav
							className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none"
							aria-label="Navigasi Buku Tamu"
						>
							{tabs.map((t) => {
								const active = isTabActive(t.to, t.exact);
								return (
									<Link
										key={t.to}
										to={t.to}
										className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
											active
												? "bg-emerald-800 text-white shadow-xs"
												: t.highlight
													? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
													: "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
										}`}
									>
										<t.icon className="size-3.5" />
										<span>{t.label}</span>
									</Link>
								);
							})}
						</nav>

						<div className="hidden md:flex items-center gap-2 pl-3 border-l border-stone-200/80">
							<Link
								to="/dasbor"
								className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition-colors shadow-2xs cursor-pointer"
								title="Keluar ke Dasbor Utama"
							>
								<span>Dasbor</span>
								<ExternalLink className="size-3 text-stone-400" />
							</Link>

							<div
								className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 text-white font-bold text-xs shadow-xs"
								title={userName}
							>
								{initialsOf(userName)}
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto pb-16">
				<Outlet />
			</main>
		</div>
	);
}
