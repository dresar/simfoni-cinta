import { useState, useEffect } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
	BarChart3,
	TrendingUp,
	Users,
	UserCheck,
	CheckCircle2,
	Clock,
	PieChart,
	Activity,
} from "lucide-react";
import { useStore } from "@/store/appStore";
import { fetchEventAnalytics } from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/analitik",
)({
	component: GuestbookAnalyticsPage,
});

function GuestbookAnalyticsPage() {
	const { eventId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/analitik",
	});
	const { session } = useStore();

	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const loadAnalytics = async () => {
		if (!session?.email || !eventId) return;
		try {
			const res = await fetchEventAnalytics({
				data: { eventId, userEmail: session.email },
			});
			setAnalytics(res);
		} catch {
			setAnalytics(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAnalytics();
	}, [eventId, session?.email]);

	if (loading) {
		return (
			<div className="py-16 text-center text-xs text-stone-400">
				Memuat data statistik Buku Tamu...
			</div>
		);
	}

	if (!analytics) {
		return (
			<div className="py-12 text-center text-xs text-stone-400">
				Data analitik tidak tersedia saat ini.
			</div>
		);
	}

	const { summary, rsvp, timelineChart = [], categoryBreakdown = [] } = analytics;
	const maxHourlyCount = Math.max(1, ...timelineChart.map((t: any) => t.count));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-xs">
				<div className="flex items-center gap-2">
					<BarChart3 className="size-5 text-emerald-800" />
					<div>
						<h2 className="font-serif text-base font-bold text-stone-900 leading-tight">
							Statistik & Analitik Real-Time
						</h2>
						<p className="text-[11px] text-stone-500">
							Data ringkasan kehadiran fisik, konfirmasi RSVP, dan distribusi kedatangan
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
				<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
					<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
						Tingkat Kehadiran
					</span>
					<div className="mt-1 font-serif text-2xl font-bold text-emerald-800">
						{summary.attendanceRate}%
					</div>
					<span className="text-[11px] text-stone-500 mt-0.5 block">
						{summary.totalAttendedGuests} dari {summary.totalGuests} Tamu
					</span>
				</div>

				<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
					<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
						Total Pax Aktual
					</span>
					<div className="mt-1 font-serif text-2xl font-bold text-stone-900">
						{summary.totalActualPax} Pax
					</div>
					<span className="text-[11px] text-stone-500 mt-0.5 block">
						Rencana: {summary.totalPlannedPax} Pax
					</span>
				</div>

				<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
					<span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
						Souvenir Diberikan
					</span>
					<div className="mt-1 font-serif text-2xl font-bold text-amber-900">
						{summary.totalSouvenirCount || 0} Pcs
					</div>
					<span className="text-[11px] text-stone-500 mt-0.5 block">
						{summary.totalSouvenirTakenGuests || 0} Tamu Mengambil
					</span>
				</div>

				<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
					<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
						RSVP Konfirmasi
					</span>
					<div className="mt-1 font-serif text-2xl font-bold text-stone-900">
						{rsvp.attending} Tamu
					</div>
					<span className="text-[11px] text-stone-500 mt-0.5 block">
						{summary.totalGuests > 0
							? Math.round((rsvp.attending / summary.totalGuests) * 100)
							: 0}
						% dari total
					</span>
				</div>

				<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
					<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
						Ucapan & Doa
					</span>
					<div className="mt-1 font-serif text-2xl font-bold text-purple-900">
						{summary.totalMessages}
					</div>
					<span className="text-[11px] text-stone-500 mt-0.5 block">
						{summary.approvedMessages} Disetujui
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				<div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
					<div className="flex items-center justify-between border-b border-stone-100 pb-3">
						<div className="flex items-center gap-2">
							<Activity className="size-4 text-emerald-800" />
							<h3 className="font-serif text-sm font-bold text-stone-900">
								Distribusi Waktu Check-in Tamu
							</h3>
						</div>
						<span className="text-[11px] text-stone-400 font-mono">
							Berdasarkan Jam
						</span>
					</div>

					{timelineChart.length === 0 ? (
						<div className="py-12 text-center text-xs text-stone-400">
							Belum ada data check-in per jam saat ini.
						</div>
					) : (
						<div className="space-y-2 pt-2">
							{timelineChart.map((t: any) => (
								<div key={t.hour} className="space-y-1">
									<div className="flex justify-between text-xs font-semibold">
										<span className="text-stone-700 font-mono">{t.hour}</span>
										<span className="text-emerald-800 font-bold">
											{t.count} Orang
										</span>
									</div>
									<div className="h-2 rounded-full bg-stone-100 overflow-hidden">
										<div
											className="h-full bg-emerald-600 rounded-full transition-all"
											style={{
												width: `${(t.count / maxHourlyCount) * 100}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
					<div className="flex items-center justify-between border-b border-stone-100 pb-3">
						<div className="flex items-center gap-2">
							<PieChart className="size-4 text-emerald-800" />
							<h3 className="font-serif text-sm font-bold text-stone-900">
								Sebaran Berdasarkan Kategori Tamu
							</h3>
						</div>
						<span className="text-[11px] text-stone-400 font-mono">
							{categoryBreakdown.length} Kategori
						</span>
					</div>

					{categoryBreakdown.length === 0 ? (
						<div className="py-12 text-center text-xs text-stone-400">
							Belum ada data kategori tamu.
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{categoryBreakdown.map((cat: any) => (
								<div
									key={cat.name}
									className="flex items-center justify-between py-2.5 text-xs"
								>
									<div>
										<span className="font-bold text-stone-900">
											{cat.name}
										</span>
										<span className="text-[11px] text-stone-400 block">
											Total: {cat.total} Undangan ({cat.plannedPax} Pax Rencana)
										</span>
									</div>

									<div className="text-right">
										<span className="font-bold text-emerald-800">
											{cat.attended} Hadir
										</span>
										<span className="text-[11px] text-stone-500 block">
											{cat.actualPax} Pax Aktual
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
