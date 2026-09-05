import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
	ArrowLeft,
	User,
	Phone,
	Mail,
	Tag,
	Users,
	Clock,
	CheckCircle2,
	Calendar,
	History,
	MessageSquare,
	Edit3,
	Trash2,
	RotateCcw,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import {
	fetchGuestDetail,
	checkInAttendance,
	cancelGuestAttendance,
} from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/tamu/$guestId",
)({
	component: GuestDetailPage,
});

function GuestDetailPage() {
	const { eventId, guestId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/tamu/$guestId",
	});
	const { session } = useStore();

	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const loadDetail = async () => {
		if (!session?.email || !eventId || !guestId) return;
		try {
			const res = await fetchGuestDetail({
				data: { guestId, eventId, userEmail: session.email },
			});
			setData(res);
		} catch {
			setData(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDetail();
	}, [eventId, guestId, session?.email]);

	if (loading) {
		return (
			<div className="py-16 text-center text-xs text-stone-400">
				Memuat detail tamu...
			</div>
		);
	}

	if (!data?.guest) {
		return (
			<div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-3">
				<p className="text-sm font-bold text-stone-900">
					Tamu Tidak Ditemukan
				</p>
				<Link
					to="/dasbor/buku-tamu/$eventId/tamu"
					params={{ eventId }}
					className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs"
				>
					<ArrowLeft className="size-3.5" />
					<span>Kembali ke Daftar Tamu</span>
				</Link>
			</div>
		);
	}

	const { guest, attendanceLogs = [], messages = [], activity = [] } = data;

	const handleQuickCheckIn = async () => {
		if (!session?.email) return;
		try {
			await checkInAttendance({
				data: {
					eventId,
					guestId: guest.id,
					body: {
						paxActual: guest.paxPlanned || 1,
						recordedBy: session.name || "Petugas",
					},
					userEmail: session.email,
				},
			});
			toast.success(`${guest.name} tercatat Hadir!`);
			await loadDetail();
		} catch {
			toast.error("Gagal mencatat kehadiran.");
		}
	};

	const handleCancelCheckIn = async () => {
		if (!session?.email) return;
		try {
			await cancelGuestAttendance({
				data: { eventId, guestId: guest.id, userEmail: session.email },
			});
			toast.success(`Kehadiran ${guest.name} dibatalkan.`);
			await loadDetail();
		} catch {
			toast.error("Gagal membatalkan kehadiran.");
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
				<div className="flex items-center gap-2">
					<Link
						to="/dasbor/buku-tamu/$eventId/tamu"
						params={{ eventId }}
						className="size-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
					>
						<ArrowLeft className="size-4" />
					</Link>
					<div>
						<h2 className="font-serif text-lg font-bold text-stone-900">
							{guest.name}
						</h2>
						<p className="text-[11px] text-stone-500">
							ID: {guest.id} · Terdaftar pada{" "}
							{guest.createdAt
								? new Date(guest.createdAt).toLocaleDateString("id-ID")
								: "-"}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{guest.isAttended ? (
						<button
							type="button"
							onClick={handleCancelCheckIn}
							className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-2xs transition-colors cursor-pointer"
						>
							<RotateCcw className="size-3.5" />
							<span>Batalkan Hadir</span>
						</button>
					) : (
						<button
							type="button"
							onClick={handleQuickCheckIn}
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
						>
							<Check className="size-3.5" />
							<span>Catat Hadir Sekarang</span>
						</button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="space-y-4">
					<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
						<h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
							Informasi Tamu
						</h3>

						<div className="space-y-2 text-xs">
							<div className="flex items-center justify-between">
								<span className="text-stone-400 flex items-center gap-1">
									<Tag className="size-3.5" /> Kategori:
								</span>
								<span className="font-semibold text-stone-800">
									{guest.categoryName}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-stone-400">Nomor Meja:</span>
								<span className="font-bold text-stone-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md text-[11px]">
									{guest.tableNumber || "Belum Ditentukan"}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-stone-400 flex items-center gap-1">
									<Phone className="size-3.5" /> WhatsApp:
								</span>
								<span className="font-mono text-stone-800 font-semibold">
									{guest.phone || "-"}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-stone-400 flex items-center gap-1">
									<Mail className="size-3.5" /> Email:
								</span>
								<span className="text-stone-800 truncate max-w-[150px]">
									{guest.email || "-"}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-stone-400 flex items-center gap-1">
									<Users className="size-3.5" /> Rencana Pax:
								</span>
								<span className="font-mono font-bold text-stone-900">
									{guest.paxPlanned} Orang
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-stone-400">Souvenir Fisik:</span>
								<span
									className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
										guest.isSouvenirTaken
											? "bg-amber-100 text-amber-900 border border-amber-300"
											: "bg-stone-100 text-stone-600"
									}`}
								>
									{guest.isSouvenirTaken
										? `Sudah Ambil (${guest.souvenirCount || 1} Pcs)`
										: "Belum Ambil"}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-stone-400">Status RSVP:</span>
								<span
									className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
										guest.rsvpStatus === "attending"
											? "bg-emerald-100 text-emerald-800"
											: guest.rsvpStatus === "maybe"
												? "bg-purple-100 text-purple-800"
												: guest.rsvpStatus === "not_attending"
													? "bg-rose-100 text-rose-800"
													: "bg-stone-100 text-stone-600"
									}`}
								>
									{guest.rsvpStatus}
								</span>
							</div>
						</div>

						{guest.notes && (
							<div className="pt-2 border-t border-stone-100 text-xs">
								<span className="text-stone-400 block text-[10px] uppercase font-bold">
									Catatan:
								</span>
								<p className="text-stone-700 mt-0.5">{guest.notes}</p>
							</div>
						)}
					</div>

					<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
						<h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
							Status Kehadiran Hari-H
						</h3>

						{guest.isAttended ? (
							<div className="space-y-2 text-xs">
								<div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-900">
									<CheckCircle2 className="size-5 text-emerald-700 shrink-0" />
									<div>
										<p className="font-bold text-xs">Telah Hadir di Lokasi</p>
										<span className="text-[10px] text-emerald-700 font-mono">
											{guest.attendedAt
												? new Date(guest.attendedAt).toLocaleString("id-ID")
												: "-"}
										</span>
									</div>
								</div>

								<div className="flex items-center justify-between pt-1">
									<span className="text-stone-500">Pax Aktual Hadir:</span>
									<strong className="font-mono text-sm text-stone-900">
										{guest.paxActual} Orang
									</strong>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-stone-500">Petugas Pencatat:</span>
									<span className="text-stone-800 font-medium">
										{guest.attendedBy || "-"}
									</span>
								</div>
							</div>
						) : (
							<div className="py-4 text-center text-xs text-stone-400">
								Tamu belum tercatat hadir di lokasi acara.
							</div>
						)}
					</div>
				</div>

				<div className="lg:col-span-2 space-y-4">
					<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
						<div className="flex items-center justify-between border-b border-stone-100 pb-2">
							<div className="flex items-center gap-2">
								<History className="size-4 text-emerald-800" />
								<h3 className="font-serif text-sm font-bold text-stone-900">
									Log Kehadiran & Riwayat Perubahan
								</h3>
							</div>
							<span className="text-[11px] text-stone-400 font-mono">
								{attendanceLogs.length} Catatan
							</span>
						</div>

						{attendanceLogs.length === 0 ? (
							<div className="py-8 text-center text-xs text-stone-400">
								Belum ada catatan log kehadiran untuk tamu ini.
							</div>
						) : (
							<div className="space-y-2.5">
								{attendanceLogs.map((log: any) => (
									<div
										key={log.id}
										className="flex items-start justify-between rounded-lg border border-stone-100 bg-stone-50/50 p-2.5 text-xs"
									>
										<div className="space-y-0.5">
											<span className="font-bold text-stone-900 block">
												{log.actionType === "check_in"
													? "Pencatatan Hadir"
													: log.actionType === "update_pax"
														? "Koreksi Pax"
														: "Pembatalan Hadir"}
											</span>
											<p className="text-stone-600 text-[11px]">
												{log.notes} ({log.paxActual} Pax) · Oleh:{" "}
												{log.recordedBy || "Petugas"}
											</p>
										</div>
										<span className="text-[10px] text-stone-400 font-mono shrink-0">
											{log.recordedAt
												? new Date(log.recordedAt).toLocaleString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
														day: "numeric",
														month: "short",
													})
												: ""}
										</span>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
						<div className="flex items-center justify-between border-b border-stone-100 pb-2">
							<div className="flex items-center gap-2">
								<MessageSquare className="size-4 text-purple-700" />
								<h3 className="font-serif text-sm font-bold text-stone-900">
									Ucapan dari Tamu Ini
								</h3>
							</div>
							<span className="text-[11px] text-stone-400 font-mono">
								{messages.length} Ucapan
							</span>
						</div>

						{messages.length === 0 ? (
							<div className="py-8 text-center text-xs text-stone-400">
								Tamu ini belum mengirimkan pesan ucapan.
							</div>
						) : (
							<div className="space-y-2">
								{messages.map((m: any) => (
									<div
										key={m.id}
										className="rounded-lg border border-stone-100 bg-purple-50/20 p-3 text-xs space-y-1"
									>
										<div className="flex items-center justify-between">
											<span className="font-bold text-stone-900">
												{m.senderName}
											</span>
											<span
												className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
													m.status === "approved"
														? "bg-emerald-100 text-emerald-800"
														: m.status === "rejected"
															? "bg-rose-100 text-rose-800"
															: "bg-stone-100 text-stone-600"
												}`}
											>
												{m.status}
											</span>
										</div>
										<p className="text-stone-700 italic leading-relaxed">
											"{m.message}"
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
