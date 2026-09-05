import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
	Users,
	UserCheck,
	Clock,
	MessageSquare,
	ArrowRight,
	Plus,
	CheckCircle2,
	AlertCircle,
	Sparkles,
	TrendingUp,
	FileText,
	ChevronRight,
} from "lucide-react";
import { useStore } from "@/store/appStore";
import {
	fetchEventAnalytics,
	fetchEventGuests,
	fetchActivityLogs,
} from "@/functions/guestbook";

export const Route = createFileRoute("/dasbor/buku-tamu/$eventId/")({
	component: EventOverviewDashboard,
});

function EventOverviewDashboard() {
	const { eventId } = useParams({ from: "/dasbor/buku-tamu/$eventId/" });
	const { session } = useStore();

	const [analytics, setAnalytics] = useState<any>(null);
	const [recentGuests, setRecentGuests] = useState<any[]>([]);
	const [recentActivities, setRecentActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const loadData = async () => {
		if (!session?.email || !eventId) return;
		try {
			const [anaRes, guestRes, actRes] = await Promise.all([
				fetchEventAnalytics({
					data: { eventId, userEmail: session.email },
				}),
				fetchEventGuests({
					data: {
						eventId,
						userEmail: session.email,
						filters: { isAttended: true },
					},
				}),
				fetchActivityLogs({
					data: { eventId, userEmail: session.email },
				}),
			]);

			setAnalytics(anaRes);
			setRecentGuests((guestRes || []).slice(0, 5));
			setRecentActivities((actRes || []).slice(0, 6));
		} catch {
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [eventId, session?.email]);

	if (loading) {
		return (
			<div className="py-12 text-center text-xs text-stone-400">
				Memuat ringkasan Buku Tamu...
			</div>
		);
	}

	const summary = analytics?.summary || {
		totalGuests: 0,
		totalPlannedPax: 0,
		totalAttendedGuests: 0,
		totalActualPax: 0,
		attendanceRate: 0,
		totalMessages: 0,
		approvedMessages: 0,
	};

	const rsvp = analytics?.rsvp || {
		attending: 0,
		pending: 0,
		maybe: 0,
		notAttending: 0,
	};

	return (
		<div className="space-y-6">
			<div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-850 to-stone-900 text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
				<div className="absolute right-0 top-0 translate-x-8 -translate-y-8 size-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
				<div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="space-y-1.5 max-w-xl">
						<div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-emerald-200 backdrop-blur-sm">
							<Sparkles className="size-3 text-amber-300" />
							<span>Mode Hari-H Siap Digunakan</span>
						</div>
						<h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
							Pencatatan Kehadiran Cepat di Meja Tamu
						</h2>
						<p className="text-xs text-emerald-100/80 leading-relaxed">
							Gunakan antarmuka Check-in Cepat saat acara berlangsung untuk mencari nama tamu dalam hitungan detik dan mencatat pax kehadiran aktual.
						</p>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						<Link
							to="/dasbor/buku-tamu/$eventId/kehadiran"
							params={{ eventId }}
							className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-stone-900 shadow-md transition-all cursor-pointer"
						>
							<UserCheck className="size-4" />
							<span>Buka Check-in Cepat</span>
							<ArrowRight className="size-3.5" />
						</Link>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
				<div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs">
					<div className="flex items-center justify-between text-stone-400">
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Total Tamu
						</span>
						<Users className="size-4 text-emerald-700" />
					</div>
					<div className="mt-2 flex items-baseline gap-1.5">
						<span className="font-serif text-2xl font-bold text-stone-900">
							{summary.totalGuests}
						</span>
						<span className="text-xs text-stone-400">Undangan</span>
					</div>
					<span className="text-[10px] text-stone-500 block mt-1">
						{summary.totalPlannedPax} Rencana Pax
					</span>
				</div>

				<div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
					<div className="flex items-center justify-between text-emerald-800">
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Kehadiran Fisik
						</span>
						<UserCheck className="size-4 text-emerald-700" />
					</div>
					<div className="mt-2 flex items-baseline gap-1.5">
						<span className="font-serif text-2xl font-bold text-emerald-900">
							{summary.totalAttendedGuests}
						</span>
						<span className="text-xs text-emerald-800 font-bold">Hadir</span>
					</div>
					<span className="text-[10px] text-emerald-700 font-medium block mt-1">
						{summary.totalActualPax} Pax Aktual ({summary.attendanceRate}%)
					</span>
				</div>

				<div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs">
					<div className="flex items-center justify-between text-stone-400">
						<span className="text-[10px] font-bold uppercase tracking-wider">
							RSVP Hadir
						</span>
						<CheckCircle2 className="size-4 text-emerald-600" />
					</div>
					<div className="mt-2 flex items-baseline gap-1.5">
						<span className="font-serif text-2xl font-bold text-stone-900">
							{rsvp.attending}
						</span>
						<span className="text-xs text-stone-400">Tamu</span>
					</div>
					<span className="text-[10px] text-stone-500 block mt-1">
						Konfirmasi awal
					</span>
				</div>

				<div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs">
					<div className="flex items-center justify-between text-stone-400">
						<span className="text-[10px] font-bold uppercase tracking-wider">
							RSVP Menunggu
						</span>
						<Clock className="size-4 text-amber-500" />
					</div>
					<div className="mt-2 flex items-baseline gap-1.5">
						<span className="font-serif text-2xl font-bold text-stone-900">
							{rsvp.pending}
						</span>
						<span className="text-xs text-stone-400">Tamu</span>
					</div>
					<span className="text-[10px] text-stone-500 block mt-1">
						Belum konfirmasi
					</span>
				</div>

				<div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
					<div className="flex items-center justify-between text-stone-400">
						<span className="text-[10px] font-bold uppercase tracking-wider">
							Buku Ucapan
						</span>
						<MessageSquare className="size-4 text-purple-600" />
					</div>
					<div className="mt-2 flex items-baseline gap-1.5">
						<span className="font-serif text-2xl font-bold text-stone-900">
							{summary.totalMessages}
						</span>
						<span className="text-xs text-stone-400">Pesan</span>
					</div>
					<span className="text-[10px] text-stone-500 block mt-1">
						{summary.approvedMessages} Disetujui
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
				<div className="lg:col-span-7 space-y-4">
					<div className="rounded-xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<div className="flex items-center gap-2">
								<TrendingUp className="size-4 text-emerald-800" />
								<h3 className="font-serif text-sm font-bold text-stone-900">
									Perbandingan Status RSVP Tamu
								</h3>
							</div>
							<Link
								to="/dasbor/buku-tamu/$eventId/analitik"
								params={{ eventId }}
								className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
							>
								<span>Lihat Analitik</span>
								<ChevronRight className="size-3" />
							</Link>
						</div>

						<div className="space-y-3 pt-1">
							<div>
								<div className="flex justify-between text-xs font-semibold mb-1">
									<span className="text-emerald-800">
										Akan Hadir ({rsvp.attending})
									</span>
									<span className="text-stone-500">
										{summary.totalGuests > 0
											? Math.round((rsvp.attending / summary.totalGuests) * 100)
											: 0}
										%
									</span>
								</div>
								<div className="h-2 rounded-full bg-stone-100 overflow-hidden">
									<div
										className="h-full bg-emerald-600 rounded-full"
										style={{
											width: `${summary.totalGuests > 0 ? (rsvp.attending / summary.totalGuests) * 100 : 0}%`,
										}}
									/>
								</div>
							</div>

							<div>
								<div className="flex justify-between text-xs font-semibold mb-1">
									<span className="text-amber-800">
										Belum Menjawab / Pending ({rsvp.pending})
									</span>
									<span className="text-stone-500">
										{summary.totalGuests > 0
											? Math.round((rsvp.pending / summary.totalGuests) * 100)
											: 0}
										%
									</span>
								</div>
								<div className="h-2 rounded-full bg-stone-100 overflow-hidden">
									<div
										className="h-full bg-amber-500 rounded-full"
										style={{
											width: `${summary.totalGuests > 0 ? (rsvp.pending / summary.totalGuests) * 100 : 0}%`,
										}}
									/>
								</div>
							</div>

							<div>
								<div className="flex justify-between text-xs font-semibold mb-1">
									<span className="text-purple-800">
										Ragu-ragu ({rsvp.maybe})
									</span>
									<span className="text-stone-500">
										{summary.totalGuests > 0
											? Math.round((rsvp.maybe / summary.totalGuests) * 100)
											: 0}
										%
									</span>
								</div>
								<div className="h-2 rounded-full bg-stone-100 overflow-hidden">
									<div
										className="h-full bg-purple-500 rounded-full"
										style={{
											width: `${summary.totalGuests > 0 ? (rsvp.maybe / summary.totalGuests) * 100 : 0}%`,
										}}
									/>
								</div>
							</div>

							<div>
								<div className="flex justify-between text-xs font-semibold mb-1">
									<span className="text-rose-800">
										Tidak Hadir ({rsvp.notAttending})
									</span>
									<span className="text-stone-500">
										{summary.totalGuests > 0
											? Math.round(
													(rsvp.notAttending / summary.totalGuests) * 100,
												)
											: 0}
										%
									</span>
								</div>
								<div className="h-2 rounded-full bg-stone-100 overflow-hidden">
									<div
										className="h-full bg-rose-500 rounded-full"
										style={{
											width: `${summary.totalGuests > 0 ? (rsvp.notAttending / summary.totalGuests) * 100 : 0}%`,
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<div className="flex items-center gap-2">
								<UserCheck className="size-4 text-emerald-800" />
								<h3 className="font-serif text-sm font-bold text-stone-900">
									Tamu yang Baru Saja Hadir
								</h3>
							</div>
							<Link
								to="/dasbor/buku-tamu/$eventId/kehadiran"
								params={{ eventId }}
								className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
							>
								<span>Check-in Cepat</span>
								<ChevronRight className="size-3" />
							</Link>
						</div>

						{recentGuests.length === 0 ? (
							<div className="py-6 text-center text-xs text-stone-400">
								Belum ada tamu yang tercatat hadir saat ini.
							</div>
						) : (
							<div className="divide-y divide-stone-100">
								{recentGuests.map((g) => (
									<div
										key={g.id}
										className="flex items-center justify-between py-2.5"
									>
										<div className="space-y-0.5 min-w-0">
											<p className="text-xs font-bold text-stone-900 truncate">
												{g.name}
											</p>
											<span className="text-[10px] text-stone-500">
												{g.categoryName} · {g.paxActual || 1} Pax Aktual
											</span>
										</div>
										<span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
											{g.attendedAt
												? new Date(g.attendedAt).toLocaleTimeString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
													})
												: "Hadir"}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="lg:col-span-5 space-y-4">
					<div className="rounded-xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<h3 className="font-serif text-sm font-bold text-stone-900">
								Riwayat Aktivitas Terakhir
							</h3>
							<Link
								to="/dasbor/buku-tamu/$eventId/log"
								params={{ eventId }}
								className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
							>
								<span>Semua Log</span>
								<ChevronRight className="size-3" />
							</Link>
						</div>

						{recentActivities.length === 0 ? (
							<div className="py-6 text-center text-xs text-stone-400">
								Belum ada catatan aktivitas.
							</div>
						) : (
							<div className="space-y-3">
								{recentActivities.map((act) => (
									<div key={act.id} className="flex items-start gap-2.5 text-xs">
										<div className="size-2 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-stone-800 font-medium leading-snug">
												{act.details || act.action}
											</p>
											<span className="text-[10px] text-stone-400 font-mono">
												{act.createdAt
													? new Date(act.createdAt).toLocaleString("id-ID", {
															day: "numeric",
															month: "short",
															hour: "2-digit",
															minute: "2-digit",
														})
													: ""}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4 space-y-2.5">
						<h4 className="text-xs font-bold text-stone-800">
							Aksi Cepat Buku Tamu
						</h4>
						<div className="grid grid-cols-2 gap-2">
							<Link
								to="/dasbor/buku-tamu/$eventId/tamu"
								params={{ eventId }}
								className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 p-2.5 text-xs font-semibold text-stone-700 shadow-2xs transition-colors text-center"
							>
								<Plus className="size-3.5" />
								<span>Tambah Tamu</span>
							</Link>
							<Link
								to="/dasbor/buku-tamu/$eventId/ucapan"
								params={{ eventId }}
								className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 p-2.5 text-xs font-semibold text-stone-700 shadow-2xs transition-colors text-center"
							>
								<MessageSquare className="size-3.5" />
								<span>Moderasi Ucapan</span>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
