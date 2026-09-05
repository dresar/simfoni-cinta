import { useState, useEffect, useMemo, useRef } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
	Search,
	UserCheck,
	Check,
	RotateCcw,
	Edit3,
	Users,
	Sparkles,
	Clock,
	X,
	CheckCircle2,
	AlertCircle,
	Volume2,
	Gift,
	Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import {
	fetchEventGuests,
	checkInAttendance,
	editAttendancePax,
	cancelGuestAttendance,
	toggleSouvenirStatus,
} from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/kehadiran",
)({
	component: FastManualCheckInPage,
});

interface GuestItem {
	id: string;
	name: string;
	phone: string;
	email: string;
	categoryId: string;
	categoryName: string;
	tableNumber: string;
	paxPlanned: number;
	paxActual: number;
	rsvpStatus: "pending" | "attending" | "maybe" | "not_attending";
	isAttended: boolean;
	attendedAt: string | null;
	attendedBy: string;
	isSouvenirTaken: boolean;
	souvenirCount: number;
	notes: string;
}

function FastManualCheckInPage() {
	const { eventId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/kehadiran",
	});
	const { session } = useStore();

	const [guests, setGuests] = useState<GuestItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusTab, setStatusTab] = useState<"all" | "unattended" | "attended">(
		"all",
	);
	const [categoryFilter, setCategoryFilter] = useState("all");

	const [editPaxTarget, setEditPaxTarget] = useState<GuestItem | null>(null);
	const [editPaxValue, setEditPaxValue] = useState(1);
	const [editPaxSubmitting, setEditPaxSubmitting] = useState(false);

	const [cancelTarget, setCancelTarget] = useState<GuestItem | null>(null);
	const [cancelSubmitting, setCancelSubmitting] = useState(false);

	const [souvenirModalTarget, setSouvenirModalTarget] = useState<GuestItem | null>(null);
	const [souvenirCountInput, setSouvenirCountInput] = useState(1);
	const [souvenirSubmitting, setSouvenirSubmitting] = useState(false);

	const searchInputRef = useRef<HTMLInputElement>(null);

	const loadGuests = async () => {
		if (!session?.email || !eventId) return;
		try {
			const res = await fetchEventGuests({
				data: { eventId, userEmail: session.email },
			});
			setGuests((res || []) as GuestItem[]);
		} catch {
			setGuests([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadGuests();
	}, [eventId, session?.email]);

	const categories = useMemo(() => {
		const set = new Set(guests.map((g) => g.categoryName).filter(Boolean));
		return Array.from(set);
	}, [guests]);

	const filteredGuests = useMemo(() => {
		return guests.filter((g) => {
			const q = search.toLowerCase().trim();
			const matchSearch =
				!q ||
				g.name.toLowerCase().includes(q) ||
				(g.phone && g.phone.includes(q)) ||
				(g.tableNumber && g.tableNumber.toLowerCase().includes(q)) ||
				(g.notes && g.notes.toLowerCase().includes(q));

			const matchStatus =
				statusTab === "all"
					? true
					: statusTab === "attended"
						? g.isAttended
						: !g.isAttended;

			const matchCategory =
				categoryFilter === "all" || g.categoryName === categoryFilter;

			return matchSearch && matchStatus && matchCategory;
		});
	}, [guests, search, statusTab, categoryFilter]);

	const stats = useMemo(() => {
		const total = guests.length;
		const attended = guests.filter((g) => g.isAttended).length;
		const totalPaxActual = guests.reduce(
			(acc, g) => acc + (g.isAttended ? g.paxActual || 1 : 0),
			0,
		);
		const souvenirCount = guests.reduce(
			(acc, g) => acc + (g.isSouvenirTaken ? g.souvenirCount || 1 : 0),
			0,
		);
		return { total, attended, totalPaxActual, souvenirCount };
	}, [guests]);

	const handleCheckIn = async (guest: GuestItem) => {
		if (!session?.email || !eventId) return;
		const currentRecorder = session?.name || "Petugas Resepsi";
		const plannedPax = guest.paxPlanned || 1;

		setGuests((prev) =>
			prev.map((g) =>
				g.id === guest.id
					? {
							...g,
							isAttended: true,
							attendedAt: new Date().toISOString(),
							paxActual: plannedPax,
							attendedBy: currentRecorder,
						}
					: g,
			),
		);

		try {
			await checkInAttendance({
				data: {
					eventId,
					guestId: guest.id,
					body: {
						paxActual: plannedPax,
						recordedBy: currentRecorder,
						notes: "Check-in cepat meja penerima tamu",
					},
					userEmail: session.email,
				},
			});

			toast.success(`Check-in berhasil: ${guest.name} (${plannedPax} Pax)${guest.tableNumber ? ` · Meja: ${guest.tableNumber}` : ""}`);
		} catch {
			toast.error(`Gagal mencatat kehadiran ${guest.name}`);
			loadGuests();
		}
	};

	const handleQuickToggleSouvenir = async (guest: GuestItem) => {
		if (!session?.email || !eventId) return;
		const nextState = !guest.isSouvenirTaken;
		const nextCount = nextState ? Math.max(1, guest.souvenirCount || 1) : 0;

		setGuests((prev) =>
			prev.map((g) =>
				g.id === guest.id
					? {
							...g,
							isSouvenirTaken: nextState,
							souvenirCount: nextCount,
						}
					: g,
			),
		);

		try {
			await toggleSouvenirStatus({
				data: {
					eventId,
					guestId: guest.id,
					isTaken: nextState,
					count: nextCount,
					userEmail: session.email,
				},
			});

			if (nextState) {
				toast.success(`Souvenir diberikan ke ${guest.name} (${nextCount} Pcs)`);
			} else {
				toast.info(`Souvenir untuk ${guest.name} dibatalkan`);
			}
		} catch {
			toast.error("Gagal memperbarui status souvenir");
			loadGuests();
		}
	};

	const handleSaveEditPax = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editPaxTarget || !session?.email || !eventId) return;

		setEditPaxSubmitting(true);
		try {
			await editAttendancePax({
				data: {
					eventId,
					guestId: editPaxTarget.id,
					paxActual: editPaxValue,
					userEmail: session.email,
				},
			});

			setGuests((prev) =>
				prev.map((g) =>
					g.id === editPaxTarget.id
						? { ...g, paxActual: editPaxValue }
						: g,
				),
			);
			toast.success(`Jumlah pax ${editPaxTarget.name} diperbarui menjadi ${editPaxValue} Pax`);
			setEditPaxTarget(null);
		} catch {
			toast.error("Gagal memperbarui jumlah pax");
		} finally {
			setEditPaxSubmitting(false);
		}
	};

	const handleConfirmCancel = async () => {
		if (!cancelTarget || !session?.email || !eventId) return;

		setCancelSubmitting(true);
		try {
			await cancelGuestAttendance({
				data: {
					eventId,
					guestId: cancelTarget.id,
					userEmail: session.email,
				},
			});

			setGuests((prev) =>
				prev.map((g) =>
					g.id === cancelTarget.id
						? {
								...g,
								isAttended: false,
								attendedAt: null,
								paxActual: 0,
								attendedBy: "",
							}
						: g,
				),
			);
			toast.success(`Kehadiran ${cancelTarget.name} berhasil dibatalkan`);
			setCancelTarget(null);
		} catch {
			toast.error("Gagal membatalkan kehadiran");
		} finally {
			setCancelSubmitting(false);
		}
	};

	return (
		<div className="space-y-4 max-w-7xl mx-auto pb-12">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div className="rounded-xl border border-stone-200/80 bg-white p-3 shadow-xs">
					<p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
						Total Undangan
					</p>
					<p className="text-xl font-serif font-bold text-stone-900 mt-0.5">
						{stats.total}{" "}
						<span className="text-xs font-sans font-normal text-stone-500">
							Nama
						</span>
					</p>
				</div>

				<div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 shadow-xs">
					<p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
						Sudah Hadir
					</p>
					<p className="text-xl font-serif font-bold text-emerald-900 mt-0.5">
						{stats.attended}{" "}
						<span className="text-xs font-sans font-normal text-emerald-700">
							Tamu
						</span>
					</p>
				</div>

				<div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-3 shadow-xs">
					<p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
						Total Orang (Pax)
					</p>
					<p className="text-xl font-serif font-bold text-teal-900 mt-0.5">
						{stats.totalPaxActual}{" "}
						<span className="text-xs font-sans font-normal text-teal-700">
							Orang
						</span>
					</p>
				</div>

				<div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 shadow-xs">
					<p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
						<Gift className="size-3 text-amber-700" />
						<span>Souvenir Keluar</span>
					</p>
					<p className="text-xl font-serif font-bold text-amber-950 mt-0.5">
						{stats.souvenirCount}{" "}
						<span className="text-xs font-sans font-normal text-amber-800">
							Pcs
						</span>
					</p>
				</div>
			</div>

			<div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-sm space-y-3">
				<div className="flex flex-col sm:flex-row gap-2.5">
					<div className="relative flex-1">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
						<input
							ref={searchInputRef}
							type="text"
							placeholder="Ketik Nama Tamu / No Meja / No HP untuk Check-in Cepat..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal outline-none focus:border-emerald-700 focus:bg-white transition-all shadow-inner"
						/>
						{search && (
							<button
								type="button"
								onClick={() => {
									setSearch("");
									searchInputRef.current?.focus();
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
							>
								<X className="size-3" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
						<button
							type="button"
							onClick={() => setStatusTab("all")}
							className={`rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
								statusTab === "all"
									? "bg-stone-900 text-white shadow-xs"
									: "bg-stone-100 text-stone-600 hover:bg-stone-200"
							}`}
						>
							Semua ({guests.length})
						</button>

						<button
							type="button"
							onClick={() => setStatusTab("unattended")}
							className={`rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
								statusTab === "unattended"
									? "bg-amber-800 text-white shadow-xs"
									: "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
							}`}
						>
							Belum Hadir ({stats.total - stats.attended})
						</button>

						<button
							type="button"
							onClick={() => setStatusTab("attended")}
							className={`rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
								statusTab === "attended"
									? "bg-emerald-800 text-white shadow-xs"
									: "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
							}`}
						>
							Sudah Hadir ({stats.attended})
						</button>
					</div>
				</div>

				{categories.length > 0 && (
					<div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-100 scrollbar-none">
						<span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
							Kategori:
						</span>
						<button
							type="button"
							onClick={() => setCategoryFilter("all")}
							className={`rounded-md px-2 py-0.8 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
								categoryFilter === "all"
									? "bg-stone-800 text-white"
									: "bg-stone-100 text-stone-600 hover:bg-stone-200"
							}`}
						>
							Semua Kategori
						</button>
						{categories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setCategoryFilter(cat)}
								className={`rounded-md px-2 py-0.8 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
									categoryFilter === cat
										? "bg-emerald-800 text-white"
										: "bg-stone-100 text-stone-600 hover:bg-stone-200"
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				)}
			</div>

			{loading ? (
				<div className="py-20 text-center text-xs text-stone-400 font-medium">
					Memuat data tamu...
				</div>
			) : filteredGuests.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center space-y-2">
					<Users className="size-8 text-stone-300 mx-auto" />
					<p className="text-sm font-bold text-stone-800">
						Tidak Ada Tamu yang Sesuai
					</p>
					<p className="text-xs text-stone-400">
						Coba ubah kata kunci pencarian atau ganti filter status di atas.
					</p>
				</div>
			) : (
				<div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
					{filteredGuests.map((guest) => {
						const isAtt = guest.isAttended;
						return (
							<div
								key={guest.id}
								className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
									isAtt
										? "border-emerald-300/80 bg-emerald-50/30 shadow-2xs"
										: "border-stone-200/90 bg-white shadow-xs hover:border-stone-300 hover:shadow-sm"
								}`}
							>
								<div className="space-y-2">
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<div className="flex items-center gap-1.5 flex-wrap">
												<span className="rounded-md bg-stone-100 text-stone-700 px-1.5 py-0.5 text-[9px] font-bold">
													{guest.categoryName}
												</span>
												{guest.tableNumber && (
													<span className="inline-flex items-center gap-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 px-1.5 py-0.5 text-[9px] font-bold">
														<Hash className="size-2.5" />
														<span>Meja: {guest.tableNumber}</span>
													</span>
												)}
												<span
													className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
														guest.rsvpStatus === "attending"
															? "bg-emerald-100 text-emerald-800"
															: guest.rsvpStatus === "not_attending"
																? "bg-rose-100 text-rose-800"
																: "bg-stone-100 text-stone-600"
													}`}
												>
													RSVP: {guest.rsvpStatus}
												</span>
											</div>

											<h3 className="font-serif text-base font-bold text-stone-900 mt-1 truncate">
												{guest.name}
											</h3>
										</div>

										<div className="shrink-0 text-right">
											{isAtt ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-bold shadow-2xs">
													<Check className="size-3" />
													<span>Hadir ({guest.paxActual} Pax)</span>
												</span>
											) : (
												<span className="rounded-full bg-stone-100 text-stone-500 px-2 py-0.5 text-[10px] font-semibold">
													Rencana: {guest.paxPlanned} Pax
												</span>
											)}
										</div>
									</div>

									{guest.notes && (
										<p className="text-[11px] text-stone-500 line-clamp-1 italic">
											"{guest.notes}"
										</p>
									)}

									{isAtt && guest.attendedAt && (
										<div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-emerald-200/50">
											<span className="flex items-center gap-1">
												<Clock className="size-3 text-stone-400" />
												<span>
													{new Date(guest.attendedAt).toLocaleTimeString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
													})}{" "}
													WIB
												</span>
											</span>
											{guest.attendedBy && (
												<span className="truncate max-w-[120px]">
													Oleh: {guest.attendedBy}
												</span>
											)}
										</div>
									)}
								</div>

								<div className="flex items-center gap-2 pt-3 mt-3 border-t border-stone-100">
									{!isAtt ? (
										<button
											type="button"
											onClick={() => handleCheckIn(guest)}
											className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
										>
											<UserCheck className="size-4" />
											<span>Check-in ({guest.paxPlanned} Pax)</span>
										</button>
									) : (
										<div className="flex items-center gap-1.5 w-full">
											<button
												type="button"
												onClick={() => {
													setEditPaxTarget(guest);
													setEditPaxValue(guest.paxActual || 1);
												}}
												className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 py-1.5 text-xs font-semibold text-stone-700 transition-colors shadow-2xs cursor-pointer"
												title="Ubah Jumlah Pax"
											>
												<Edit3 className="size-3.5 text-stone-500" />
												<span>Pax: {guest.paxActual}</span>
											</button>

											<button
												type="button"
												onClick={() => setCancelTarget(guest)}
												className="flex size-7.5 items-center justify-center rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
												title="Batalkan Kehadiran"
											>
												<RotateCcw className="size-3.5" />
											</button>
										</div>
									)}

									<button
										type="button"
										onClick={() => handleQuickToggleSouvenir(guest)}
										className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
											guest.isSouvenirTaken
												? "bg-amber-100 text-amber-900 border border-amber-300"
												: "bg-stone-100 text-stone-500 hover:bg-stone-200"
										}`}
										title={
											guest.isSouvenirTaken
												? `Souvenir telah diambil (${guest.souvenirCount || 1} Pcs)`
												: "Klik untuk tandai pengambilan souvenir"
										}
									>
										<Gift className="size-3.5" />
										<span>{guest.isSouvenirTaken ? "Souvenir ✓" : "Souvenir"}</span>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{editPaxTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Koreksi Jumlah Orang (Pax)
							</h3>
							<button
								type="button"
								onClick={() => setEditPaxTarget(null)}
								className="text-stone-400 hover:text-stone-900"
							>
								<X className="size-4" />
							</button>
						</div>

						<form onSubmit={handleSaveEditPax} className="space-y-3">
							<p className="text-xs text-stone-500">
								Tamu: <strong className="text-stone-900">{editPaxTarget.name}</strong>
							</p>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Pax Hadir Aktual
								</label>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setEditPaxValue((v) => Math.max(1, v - 1))}
										className="flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-bold text-sm hover:bg-stone-100"
									>
										-
									</button>
									<input
										type="number"
										min={1}
										max={50}
										required
										value={editPaxValue}
										onChange={(e) =>
											setEditPaxValue(parseInt(e.target.value, 10) || 1)
										}
										className="flex-1 text-center rounded-lg border border-stone-200 bg-white py-2 text-sm font-bold text-stone-900 outline-none focus:border-emerald-700"
									/>
									<button
										type="button"
										onClick={() => setEditPaxValue((v) => v + 1)}
										className="flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-bold text-sm hover:bg-stone-100"
									>
										+
									</button>
								</div>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setEditPaxTarget(null)}
									className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={editPaxSubmitting}
									className="rounded-lg bg-emerald-800 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
								>
									{editPaxSubmitting ? "Menyimpan..." : "Simpan Koreksi"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{cancelTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5 text-center">
						<div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
							<RotateCcw className="size-5" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Batalkan Kehadiran?
							</h3>
							<p className="text-xs text-stone-500">
								Status kehadiran <strong className="text-stone-900">{cancelTarget.name}</strong> akan dikembalikan menjadi belum hadir.
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setCancelTarget(null)}
								className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
							>
								Tutup
							</button>
							<button
								type="button"
								disabled={cancelSubmitting}
								onClick={handleConfirmCancel}
								className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
							>
								{cancelSubmitting ? "Membatalkan..." : "Ya, Batalkan"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
