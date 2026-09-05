import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	Plus,
	Calendar,
	MapPin,
	Clock,
	ArrowRight,
	Trash2,
	X,
	Sparkles,
	CheckCircle2,
	FileText,
	Users,
	ExternalLink,
	Lock,
	ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import {
	fetchGuestbookEvents,
	addGuestbookEvent,
	removeGuestbookEvent,
	checkGuestbookAccess,
} from "@/functions/guestbook";

export const Route = createFileRoute("/dasbor/buku-tamu/")({
	head: () => ({
		meta: [
			{ title: "Buku Tamu Digital — Simfoni Cinta" },
			{
				name: "description",
				content: "Kelola daftar acara, tamu, dan pencatatan kehadiran digital Anda.",
			},
		],
	}),
	component: GuestbookEventsListPage,
});

interface GuestbookEventItem {
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

const STATUS_BADGES: Record<
	string,
	{ label: string; bg: string; text: string; border: string }
> = {
	active: {
		label: "Aktif",
		bg: "bg-emerald-50",
		text: "text-emerald-800",
		border: "border-emerald-200",
	},
	draft: {
		label: "Draf",
		bg: "bg-stone-100",
		text: "text-stone-700",
		border: "border-stone-200",
	},
	completed: {
		label: "Selesai",
		bg: "bg-sky-50",
		text: "text-sky-800",
		border: "border-sky-200",
	},
	archived: {
		label: "Arsip",
		bg: "bg-amber-50",
		text: "text-amber-800",
		border: "border-amber-200",
	},
};

function GuestbookEventsListPage() {
	const { session } = useStore();
	const navigate = useNavigate();
	const [events, setEvents] = useState<GuestbookEventItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [eligibility, setEligibility] = useState<{
		eligible: boolean;
		reason?: string;
		tier?: string;
	}>({ eligible: true });

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formTitle, setFormTitle] = useState("");
	const [formDesc, setFormDesc] = useState("");
	const [formDate, setFormDate] = useState("");
	const [formTime, setFormTime] = useState("08:00 - 13:00 WIB");
	const [formLocation, setFormLocation] = useState("");
	const [formNotes, setFormNotes] = useState("");
	const [formStatus, setFormStatus] = useState<
		"draft" | "active" | "completed" | "archived"
	>("active");
	const [submitting, setSubmitting] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [deleting, setDeleting] = useState(false);

	const loadEvents = async () => {
		if (!session?.email) return;
		try {
			const [res, accessRes] = await Promise.all([
				fetchGuestbookEvents({ data: session.email }),
				checkGuestbookAccess({ data: session.email }),
			]);
			setEvents((res || []) as GuestbookEventItem[]);
			if (accessRes) {
				setEligibility(accessRes);
			}
		} catch {
			setEvents([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEvents();
	}, [session?.email]);

	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!eligibility.eligible) {
			toast.error(
				"Selesaikan pembayaran paket Anda terlebih dahulu untuk membuat Buku Tamu.",
			);
			return;
		}

		const trimmedTitle = formTitle.trim();
		if (!trimmedTitle) {
			toast.error("Nama acara wajib diisi.");
			return;
		}
		if (!formDate) {
			toast.error("Tanggal acara wajib ditentukan.");
			return;
		}
		if (!session?.email) return;

		setSubmitting(true);
		try {
			const newEvent = await addGuestbookEvent({
				data: {
					body: {
						title: trimmedTitle,
						description: formDesc.trim(),
						eventDate: formDate,
						eventTime: formTime.trim(),
						location: formLocation.trim(),
						notes: formNotes.trim(),
						status: formStatus,
					},
					userEmail: session.email,
				},
			});

			toast.success(`Buku Tamu "${trimmedTitle}" berhasil dibuat!`);
			setIsModalOpen(false);
			setFormTitle("");
			setFormDesc("");
			setFormDate("");
			setFormLocation("");
			setFormNotes("");
			await loadEvents();

			if (newEvent?.id) {
				navigate({
					to: "/dasbor/buku-tamu/$eventId",
					params: { eventId: newEvent.id },
				});
			}
		} catch (err: any) {
			toast.error(err?.message || "Gagal membuat acara Buku Tamu.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget || !session?.email) return;
		setDeleting(true);
		try {
			await removeGuestbookEvent({
				data: { eventId: deleteTarget.id, userEmail: session.email },
			});
			setEvents((prev) => prev.filter((ev) => ev.id !== deleteTarget.id));
			toast.success(`Acara "${deleteTarget.title}" berhasil dihapus.`);
			setDeleteTarget(null);
		} catch {
			toast.error("Gagal menghapus acara.");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="space-y-6 max-w-6xl mx-auto pb-16">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<BookOpen className="size-5 text-emerald-800" />
						<h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
							Buku Tamu Digital
						</h1>
					</div>
					<p className="text-xs text-stone-500 mt-0.5">
						Kelola daftar acara, pencatatan kehadiran tamu di hari-H, RSVP, dan buku ucapan.
					</p>
				</div>

				<div className="flex items-center gap-2">
					{eligibility.eligible ? (
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
						>
							<Plus className="size-3.5" />
							<span>Buat Acara Baru</span>
						</button>
					) : (
						<Link
							to="/dasbor/pembelian"
							className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
						>
							<ShoppingBag className="size-3.5" />
							<span>Beli Paket Undangan</span>
						</Link>
					)}
				</div>
			</div>

			{!eligibility.eligible && (
				<div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 text-stone-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0 mt-0.5">
							<Lock className="size-5" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-sm sm:text-base font-bold text-amber-950">
								Fitur Buku Tamu Digital Memerlukan Paket Aktif
							</h3>
							<p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
								Buku Tamu Digital dapat diaktifkan setelah Anda menyelesaikan pesanan paket (Silver, Gold, atau Platinum). Selesaikan pembayaran untuk membuka akses penuh check-in kilat, manajemen tamu, dan buku ucapan.
							</p>
						</div>
					</div>

					<Link
						to="/dasbor/pembelian"
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm shrink-0"
					>
						<ShoppingBag className="size-3.5" />
						<span>Pilih & Bayar Paket</span>
					</Link>
				</div>
			)}

			{loading ? (
				<div className="py-20 text-center text-xs text-stone-400">
					Memuat daftar acara Buku Tamu...
				</div>
			) : events.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-stone-200 bg-white p-10 sm:p-16 text-center space-y-4 shadow-xs">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
						<BookOpen className="size-7" />
					</div>
					<div className="space-y-1 max-w-md mx-auto">
						<h3 className="font-serif text-lg font-bold text-stone-900">
							Belum Ada Acara Buku Tamu
						</h3>
						<p className="text-xs text-stone-500 leading-relaxed">
							Buat Buku Tamu pertama Anda untuk mulai mengelola daftar undangan, mencatat kehadiran tamu di lokasi, dan menerima ucapan doa.
						</p>
					</div>
					{eligibility.eligible ? (
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
						>
							<Plus className="size-3.5" />
							<span>Buat Buku Tamu Sekarang</span>
						</button>
					) : (
						<Link
							to="/dasbor/pembelian"
							className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
						>
							<ShoppingBag className="size-3.5" />
							<span>Beli Paket Undangan</span>
						</Link>
					)}
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{events.map((ev) => {
						const badge =
							STATUS_BADGES[ev.status] || STATUS_BADGES.active;

						return (
							<div
								key={ev.id}
								className="flex flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group"
							>
								<div className="space-y-3">
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<span
												className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}
											>
												{badge.label}
											</span>
											<h3 className="font-serif text-base font-bold text-stone-900 mt-1.5 truncate group-hover:text-emerald-800 transition-colors">
												{ev.title}
											</h3>
										</div>
									</div>

									{ev.description && (
										<p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
											{ev.description}
										</p>
									)}

									<div className="space-y-1.5 text-xs text-stone-600 pt-1">
										<div className="flex items-center gap-2">
											<Calendar className="size-3.5 text-stone-400 shrink-0" />
											<span className="truncate">{ev.eventDate}</span>
											{ev.eventTime && (
												<>
													<span>·</span>
													<span className="truncate text-stone-500">{ev.eventTime}</span>
												</>
											)}
										</div>

										{ev.location && (
											<div className="flex items-center gap-2">
												<MapPin className="size-3.5 text-stone-400 shrink-0" />
												<span className="truncate">{ev.location}</span>
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center gap-2 pt-4 mt-4 border-t border-stone-100">
									<Link
										to="/dasbor/buku-tamu/$eventId"
										params={{ eventId: ev.id }}
										target="_blank"
										className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
										title="Buka Buku Tamu di Tab Baru Full Screen"
									>
										<span>Buka Buku Tamu</span>
										<ExternalLink className="size-3.5" />
									</Link>

									<button
										type="button"
										onClick={() =>
											setDeleteTarget({ id: ev.id, title: ev.title })
										}
										className="flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
										title="Hapus Acara"
									>
										<Trash2 className="size-3.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<div className="flex items-center gap-2">
								<div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
									<BookOpen className="size-4" />
								</div>
								<div>
									<h2 className="font-serif text-base font-bold text-stone-900">
										Buat Buku Tamu Acara Baru
									</h2>
									<p className="text-xs text-stone-500">
										Isi detail informasi acara untuk buku tamu Anda.
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="flex size-7.5 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						</div>

						<form onSubmit={handleCreateEvent} className="space-y-3.5">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nama Acara / Event <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									autoFocus
									placeholder="Contoh: Resepsi Pernikahan Rangga & Cinta"
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Tanggal Acara <span className="text-red-500">*</span>
									</label>
									<input
										type="date"
										required
										value={formDate}
										onChange={(e) => setFormDate(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Waktu / Jam
									</label>
									<input
										type="text"
										placeholder="Contoh: 10:00 - 14:00 WIB"
										value={formTime}
										onChange={(e) => setFormTime(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Lokasi / Venue Acara
								</label>
								<input
									type="text"
									placeholder="Contoh: Grand Ballroom Hotel Indonesia Kempinski"
									value={formLocation}
									onChange={(e) => setFormLocation(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Deskripsi Singkat (Opsional)
								</label>
								<textarea
									rows={2}
									placeholder="Catatan atau keterangan mengenai acara..."
									value={formDesc}
									onChange={(e) => setFormDesc(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Status Acara
								</label>
								<select
									value={formStatus}
									onChange={(e) =>
										setFormStatus(
											e.target.value as
												| "draft"
												| "active"
												| "completed"
												| "archived",
										)
									}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-900 outline-none focus:border-emerald-700 cursor-pointer"
								>
									<option value="active">Aktif (Sedang Berjalan / Siap Digunakan)</option>
									<option value="draft">Draf (Persiapan)</option>
									<option value="completed">Selesai (Acara Telah Berakhir)</option>
									<option value="archived">Arsip</option>
								</select>
							</div>

							<div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
								>
									<span>{submitting ? "Menyimpan..." : "Buat Buku Tamu"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5 text-center">
						<div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
							<Trash2 className="size-5" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Hapus Buku Tamu?
							</h3>
							<p className="text-xs text-stone-500">
								Apakah Anda yakin ingin menghapus acara{" "}
								<strong className="text-stone-900">
									"{deleteTarget.title}"
								</strong>
								? Seluruh data tamu, log kehadiran, dan ucapan terkait akan ikut terhapus.
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setDeleteTarget(null)}
								className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
							>
								Batal
							</button>
							<button
								type="button"
								disabled={deleting}
								onClick={handleDelete}
								className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
							>
								{deleting ? "Menghapus..." : "Ya, Hapus Acara"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
