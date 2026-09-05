import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
	MessageSquare,
	Search,
	CheckCircle,
	XCircle,
	Trash2,
	Plus,
	Download,
	Filter,
	X,
	Check,
	Clock,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import {
	fetchGuestbookMessages,
	addGuestbookMessage,
	moderateMessage,
	removeGuestbookMessage,
	exportGuests,
	syncInvitationPrayers,
} from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/ucapan",
)({
	component: GuestbookMessagesPage,
});

interface MessageItem {
	id: string;
	senderName: string;
	message: string;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
}

function GuestbookMessagesPage() {
	const { eventId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/ucapan",
	});
	const { session } = useStore();

	const [messages, setMessages] = useState<MessageItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "approved" | "rejected"
	>("all");

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [formSender, setFormSender] = useState("");
	const [formMessage, setFormMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [syncing, setSyncing] = useState(false);

	const loadMessages = async () => {
		if (!session?.email || !eventId) return;
		try {
			const res = await fetchGuestbookMessages({
				data: { eventId, userEmail: session.email, status: statusFilter },
			});
			setMessages((res || []) as MessageItem[]);
		} catch {
			setMessages([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadMessages();
	}, [eventId, statusFilter, session?.email]);

	const filteredMessages = useMemo(() => {
		return messages.filter((m) => {
			const q = search.toLowerCase().trim();
			return (
				!q ||
				m.senderName.toLowerCase().includes(q) ||
				m.message.toLowerCase().includes(q)
			);
		});
	}, [messages, search]);

	const handleSyncPrayers = async () => {
		if (!session?.email || !eventId) return;
		setSyncing(true);
		try {
			const res = await syncInvitationPrayers({
				data: { eventId, userEmail: session.email },
			});
			toast.success(
				`Sinkronisasi selesai! ${res?.syncedCount || 0} ucapan baru berhasil dimasukkan ke Buku Tamu.`,
			);
			await loadMessages();
		} catch (err: any) {
			toast.error(err?.message || "Gagal melakukan sinkronisasi ucapan.");
		} finally {
			setSyncing(false);
		}
	};

	const handleModerate = async (
		id: string,
		status: "pending" | "approved" | "rejected",
	) => {
		if (!session?.email || !eventId) return;
		try {
			await moderateMessage({
				data: { messageId: id, eventId, status, userEmail: session.email },
			});
			setMessages((prev) =>
				prev.map((m) => (m.id === id ? { ...m, status } : m)),
			);
			toast.success(
				status === "approved"
					? "Ucapan disetujui untuk ditampilkan"
					: status === "rejected"
						? "Ucapan ditolak / disembunyikan"
						: "Status ucapan diubah ke pending",
			);
		} catch {
			toast.error("Gagal memperbarui status ucapan");
		}
	};

	const handleDelete = async (id: string, sender: string) => {
		if (!session?.email || !eventId) return;
		if (!confirm(`Hapus ucapan dari "${sender}"?`)) return;

		try {
			await removeGuestbookMessage({
				data: { messageId: id, eventId, userEmail: session.email },
			});
			setMessages((prev) => prev.filter((m) => m.id !== id));
			toast.success("Ucapan berhasil dihapus");
		} catch {
			toast.error("Gagal menghapus ucapan");
		}
	};

	const handleAddMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formSender.trim() || !formMessage.trim() || !session?.email || !eventId)
			return;

		setSubmitting(true);
		try {
			await addGuestbookMessage({
				data: {
					eventId,
					body: {
						senderName: formSender.trim(),
						message: formMessage.trim(),
					},
					userEmail: session.email,
				},
			});

			toast.success("Ucapan dan doa berhasil ditambahkan");
			setIsAddModalOpen(false);
			setFormSender("");
			setFormMessage("");
			loadMessages();
		} catch {
			toast.error("Gagal menambahkan ucapan");
		} finally {
			setSubmitting(false);
		}
	};

	const handleExport = async () => {
		if (!session?.email || !eventId) return;
		try {
			const res = await exportGuests({
				data: { eventId, exportType: "messages", userEmail: session.email },
			});
			if (res?.rows && res.rows.length > 0) {
				const csvContent =
					"data:text/csv;charset=utf-8," +
					[res.headers.join(","), ...res.rows.map((e) => e.join(","))].join(
						"\n",
					);
				const encodedUri = encodeURI(csvContent);
				const link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute(
					"download",
					`buku-ucapan-${eventId}-${new Date().toISOString().split("T")[0]}.csv`,
				);
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				toast.success("File CSV ucapan berhasil diunduh");
			} else {
				toast.info("Belum ada data ucapan untuk diekspor");
			}
		} catch {
			toast.error("Gagal mengekspor data ucapan");
		}
	};

	return (
		<div className="space-y-4 max-w-6xl mx-auto pb-12">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
				<div>
					<div className="flex items-center gap-2">
						<MessageSquare className="size-5 text-emerald-800" />
						<h1 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							Buku Ucapan & Doa Tamu
						</h1>
					</div>
					<p className="text-xs text-stone-500">
						Kelola pesan ucapan dari tamu resepsi dan sinkronkan ucapan dari website undangan online.
					</p>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					<button
						type="button"
						disabled={syncing}
						onClick={handleSyncPrayers}
						className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
						title="Tarik ucapan dari website undangan online ke buku tamu ini"
					>
						<RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
						<span>{syncing ? "Menyinkronkan..." : "Sinkronkan dari Website"}</span>
					</button>

					<button
						type="button"
						onClick={handleExport}
						className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
					>
						<Download className="size-3.5" />
						<span className="hidden sm:inline">Ekspor CSV</span>
					</button>

					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
					>
						<Plus className="size-3.5" />
						<span>Tulis Ucapan</span>
					</button>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-2.5">
				<div className="relative flex-1">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
					<input
						type="text"
						placeholder="Cari pengirim atau isi pesan ucapan..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-700 shadow-xs"
					/>
				</div>

				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
					{(["all", "approved", "pending", "rejected"] as const).map(
						(st) => (
							<button
								key={st}
								type="button"
								onClick={() => setStatusFilter(st)}
								className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
									statusFilter === st
										? "bg-emerald-800 text-white shadow-xs"
										: "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
								}`}
							>
								{st === "all"
									? "Semua Status"
									: st === "approved"
										? "Disetujui"
										: st === "pending"
											? "Menunggu"
											: "Ditolak"}
							</button>
						),
					)}
				</div>
			</div>

			{loading ? (
				<div className="py-16 text-center text-xs text-stone-400">
					Memuat buku ucapan...
				</div>
			) : filteredMessages.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center space-y-2">
					<MessageSquare className="size-8 text-stone-300 mx-auto" />
					<p className="text-sm font-bold text-stone-800">
						Belum Ada Pesan Ucapan
					</p>
					<p className="text-xs text-stone-400 max-w-sm mx-auto">
						Tulis ucapan manual atau klik "Sinkronkan dari Website" untuk menarik doa dari tamu undangan online.
					</p>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filteredMessages.map((msg) => (
						<div
							key={msg.id}
							className="flex flex-col justify-between rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-emerald-200 transition-all space-y-3"
						>
							<div className="space-y-2">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<h4 className="font-serif text-sm font-bold text-stone-900 truncate">
											{msg.senderName}
										</h4>
										<p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
											<Clock className="size-2.5" />
											<span>
												{msg.createdAt
													? new Date(msg.createdAt).toLocaleString("id-ID", {
															dateStyle: "medium",
															timeStyle: "short",
														})
													: "-"}
											</span>
										</p>
									</div>

									<span
										className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
											msg.status === "approved"
												? "bg-emerald-50 text-emerald-800 border border-emerald-200"
												: msg.status === "rejected"
													? "bg-rose-50 text-rose-800 border border-rose-200"
													: "bg-amber-50 text-amber-800 border border-amber-200"
										}`}
									>
										{msg.status === "approved"
											? "Disetujui"
											: msg.status === "rejected"
												? "Ditolak"
												: "Pending"}
									</span>
								</div>

								<p className="text-xs text-stone-700 leading-relaxed bg-stone-50/60 rounded-lg p-2.5 border border-stone-100">
									"{msg.message}"
								</p>
							</div>

							<div className="flex items-center justify-between pt-2 border-t border-stone-100">
								<div className="flex items-center gap-1">
									{msg.status !== "approved" && (
										<button
											type="button"
											onClick={() => handleModerate(msg.id, "approved")}
											className="inline-flex items-center gap-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer"
											title="Setujui ucapan"
										>
											<Check className="size-3" />
											<span>Setujui</span>
										</button>
									)}

									{msg.status !== "rejected" && (
										<button
											type="button"
											onClick={() => handleModerate(msg.id, "rejected")}
											className="inline-flex items-center gap-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer"
											title="Tolak / Sembunyikan ucapan"
										>
											<XCircle className="size-3" />
											<span>Tolak</span>
										</button>
									)}
								</div>

								<button
									type="button"
									onClick={() => handleDelete(msg.id, msg.senderName)}
									className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
									title="Hapus pesan"
								>
									<Trash2 className="size-3.5" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Tambah Ucapan & Doa Tamu
							</h3>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="text-stone-400 hover:text-stone-900"
							>
								<X className="size-4" />
							</button>
						</div>

						<form onSubmit={handleAddMessage} className="space-y-3">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nama Pengirim <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									autoFocus
									placeholder="Contoh: Budi Santoso & Keluarga"
									value={formSender}
									onChange={(e) => setFormSender(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Pesan Ucapan / Doa <span className="text-red-500">*</span>
								</label>
								<textarea
									rows={4}
									required
									placeholder="Tuliskan ucapan selamat dan doa restu untuk kedua mempelai..."
									value={formMessage}
									onChange={(e) => setFormMessage(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="rounded-lg bg-emerald-800 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
								>
									{submitting ? "Menyimpan..." : "Simpan Ucapan"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
