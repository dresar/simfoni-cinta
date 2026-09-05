import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
	Plus,
	Search,
	Filter,
	Download,
	Upload,
	Trash2,
	Edit3,
	Eye,
	CheckSquare,
	Square,
	Users,
	X,
	Check,
	AlertTriangle,
	FileSpreadsheet,
	HelpCircle,
	ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import {
	fetchEventGuests,
	fetchGuestCategories,
	addEventGuest,
	editEventGuest,
	removeEventGuest,
	bulkEditGuests,
	bulkRemoveGuests,
	importGuests,
	exportGuests,
} from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/tamu/",
)({
	component: GuestManagementPage,
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
	createdAt: string;
}

interface CategoryItem {
	id: string;
	name: string;
	color: string;
}

function GuestManagementPage() {
	const { eventId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/tamu/",
	});
	const { session } = useStore();

	const [guests, setGuests] = useState<GuestItem[]>([]);
	const [categories, setCategories] = useState<CategoryItem[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [rsvpFilter, setRsvpFilter] = useState("all");
	const [attendanceFilter, setAttendanceFilter] = useState("all");
	const [sortBy, setSortBy] = useState<"name" | "date" | "pax">("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
	const [formName, setFormName] = useState("");
	const [formPhone, setFormPhone] = useState("");
	const [formEmail, setFormEmail] = useState("");
	const [formCatId, setFormCatId] = useState("");
	const [formTableNumber, setFormTableNumber] = useState("");
	const [formPaxPlanned, setFormPaxPlanned] = useState(1);
	const [formRsvp, setFormRsvp] = useState<
		"pending" | "attending" | "maybe" | "not_attending"
	>("pending");
	const [formIsSouvenirTaken, setFormIsSouvenirTaken] = useState(false);
	const [formSouvenirCount, setFormSouvenirCount] = useState(1);
	const [formNotes, setFormNotes] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [importRawText, setImportRawText] = useState("");
	const [importing, setImporting] = useState(false);
	const [importReport, setImportReport] = useState<any>(null);

	const [bulkRsvpModal, setBulkRsvpModal] = useState(false);
	const [bulkRsvpValue, setBulkRsvpValue] = useState<
		"pending" | "attending" | "maybe" | "not_attending"
	>("attending");

	const [bulkCatModal, setBulkCatModal] = useState(false);
	const [bulkCatValue, setBulkCatValue] = useState("");

	const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
	const [bulkDeleting, setBulkDeleting] = useState(false);

	const [deleteSingleTarget, setDeleteSingleTarget] =
		useState<GuestItem | null>(null);

	const loadData = async () => {
		if (!session?.email || !eventId) return;
		try {
			const [guestRes, catRes] = await Promise.all([
				fetchEventGuests({
					data: { eventId, userEmail: session.email },
				}),
				fetchGuestCategories({
					data: { eventId, userEmail: session.email },
				}),
			]);
			setGuests((guestRes || []) as GuestItem[]);
			setCategories((catRes || []) as CategoryItem[]);
		} catch {
			setGuests([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [eventId, session?.email]);

	const filteredGuests = useMemo(() => {
		let list = guests.filter((g) => {
			const q = search.toLowerCase().trim();
			const matchSearch =
				!q ||
				g.name.toLowerCase().includes(q) ||
				(g.phone && g.phone.includes(q)) ||
				(g.email && g.email.toLowerCase().includes(q));

			const matchCat =
				categoryFilter === "all" ||
				g.categoryId === categoryFilter ||
				g.categoryName === categoryFilter;

			const matchRsvp =
				rsvpFilter === "all" || g.rsvpStatus === rsvpFilter;

			const matchAttendance =
				attendanceFilter === "all" ||
				(attendanceFilter === "attended" && g.isAttended) ||
				(attendanceFilter === "unattended" && !g.isAttended);

			return matchSearch && matchCat && matchRsvp && matchAttendance;
		});

		list.sort((a, b) => {
			if (sortBy === "name") {
				return sortOrder === "asc"
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name);
			}
			if (sortBy === "pax") {
				return sortOrder === "asc"
					? (a.paxPlanned || 1) - (b.paxPlanned || 1)
					: (b.paxPlanned || 1) - (a.paxPlanned || 1);
			}
			return sortOrder === "asc"
				? (a.createdAt || "").localeCompare(b.createdAt || "")
				: (b.createdAt || "").localeCompare(a.createdAt || "");
		});

		return list;
	}, [
		guests,
		search,
		categoryFilter,
		rsvpFilter,
		attendanceFilter,
		sortBy,
		sortOrder,
	]);

	const handleSelectAll = () => {
		if (selectedIds.length === filteredGuests.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(filteredGuests.map((g) => g.id));
		}
	};

	const handleToggleSelect = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const openAddModal = () => {
		setEditingGuest(null);
		setFormName("");
		setFormPhone("");
		setFormEmail("");
		setFormCatId(categories[0]?.id || "");
		setFormTableNumber("");
		setFormPaxPlanned(1);
		setFormRsvp("pending");
		setFormIsSouvenirTaken(false);
		setFormSouvenirCount(1);
		setFormNotes("");
		setIsAddModalOpen(true);
	};

	const openEditModal = (guest: GuestItem) => {
		setEditingGuest(guest);
		setFormName(guest.name);
		setFormPhone(guest.phone || "");
		setFormEmail(guest.email || "");
		setFormCatId(guest.categoryId || categories[0]?.id || "");
		setFormTableNumber(guest.tableNumber || "");
		setFormPaxPlanned(guest.paxPlanned || 1);
		setFormRsvp(guest.rsvpStatus);
		setFormIsSouvenirTaken(Boolean(guest.isSouvenirTaken));
		setFormSouvenirCount(guest.souvenirCount || 1);
		setFormNotes(guest.notes || "");
		setIsAddModalOpen(true);
	};

	const handleSaveGuest = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = formName.trim();
		if (!trimmedName || !session?.email || !eventId) {
			toast.error("Nama tamu wajib diisi.");
			return;
		}

		const chosenCat = categories.find((c) => c.id === formCatId);
		const catName = chosenCat?.name || "Keluarga";

		setSubmitting(true);
		try {
			if (editingGuest) {
				const updated = await editEventGuest({
					data: {
						guestId: editingGuest.id,
						eventId,
						body: {
							name: trimmedName,
							phone: formPhone.trim(),
							email: formEmail.trim(),
							categoryId: formCatId || null,
							categoryName: catName,
							tableNumber: formTableNumber.trim(),
							paxPlanned: Number(formPaxPlanned) || 1,
							rsvpStatus: formRsvp,
							isSouvenirTaken: formIsSouvenirTaken,
							souvenirCount: formIsSouvenirTaken
								? Math.max(1, Number(formSouvenirCount) || 1)
								: 0,
							notes: formNotes.trim(),
						},
						userEmail: session.email,
					},
				});
				setGuests((prev) =>
					prev.map((g) => (g.id === editingGuest.id ? (updated as GuestItem) : g)),
				);
				toast.success(`Data tamu "${trimmedName}" berhasil diperbarui.`);
			} else {
				const newGuest = await addEventGuest({
					data: {
						eventId,
						body: {
							name: trimmedName,
							phone: formPhone.trim(),
							email: formEmail.trim(),
							categoryId: formCatId || null,
							categoryName: catName,
							tableNumber: formTableNumber.trim(),
							paxPlanned: Number(formPaxPlanned) || 1,
							rsvpStatus: formRsvp,
							isSouvenirTaken: formIsSouvenirTaken,
							souvenirCount: formIsSouvenirTaken
								? Math.max(1, Number(formSouvenirCount) || 1)
								: 0,
							notes: formNotes.trim(),
						},
						userEmail: session.email,
					},
				});
				setGuests((prev) => [newGuest as GuestItem, ...prev]);
				toast.success(`Tamu "${trimmedName}" berhasil ditambahkan.`);
			}
			setIsAddModalOpen(false);
		} catch (err: any) {
			toast.error(err?.message || "Gagal menyimpan data tamu.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteSingle = async () => {
		if (!deleteSingleTarget || !session?.email || !eventId) return;
		try {
			await removeEventGuest({
				data: {
					guestId: deleteSingleTarget.id,
					eventId,
					userEmail: session.email,
				},
			});
			setGuests((prev) => prev.filter((g) => g.id !== deleteSingleTarget.id));
			setSelectedIds((prev) =>
				prev.filter((id) => id !== deleteSingleTarget.id),
			);
			toast.success(`Tamu "${deleteSingleTarget.name}" berhasil dihapus.`);
			setDeleteSingleTarget(null);
		} catch {
			toast.error("Gagal menghapus tamu.");
		}
	};

	const handleBulkRsvp = async () => {
		if (selectedIds.length === 0 || !session?.email || !eventId) return;
		try {
			await bulkEditGuests({
				data: {
					eventId,
					guestIds: selectedIds,
					updates: { rsvpStatus: bulkRsvpValue },
					userEmail: session.email,
				},
			});
			setGuests((prev) =>
				prev.map((g) =>
					selectedIds.includes(g.id)
						? { ...g, rsvpStatus: bulkRsvpValue }
						: g,
				),
			);
			toast.success(
				`${selectedIds.length} tamu diperbarui status RSVP menjadi ${bulkRsvpValue}.`,
			);
			setBulkRsvpModal(false);
			setSelectedIds([]);
		} catch {
			toast.error("Gagal memperbarui status RSVP massal.");
		}
	};

	const handleBulkCategory = async () => {
		if (selectedIds.length === 0 || !session?.email || !eventId) return;
		const targetCat = categories.find((c) => c.id === bulkCatValue);
		const catName = targetCat?.name || "Keluarga";

		try {
			await bulkEditGuests({
				data: {
					eventId,
					guestIds: selectedIds,
					updates: { categoryId: bulkCatValue, categoryName: catName },
					userEmail: session.email,
				},
			});
			setGuests((prev) =>
				prev.map((g) =>
					selectedIds.includes(g.id)
						? { ...g, categoryId: bulkCatValue, categoryName: catName }
						: g,
				),
			);
			toast.success(
				`${selectedIds.length} tamu dipindahkan ke kategori "${catName}".`,
			);
			setBulkCatModal(false);
			setSelectedIds([]);
		} catch {
			toast.error("Gagal mengubah kategori massal.");
		}
	};

	const handleBulkDelete = async () => {
		if (selectedIds.length === 0 || !session?.email || !eventId) return;
		setBulkDeleting(true);
		try {
			await bulkRemoveGuests({
				data: {
					eventId,
					guestIds: selectedIds,
					userEmail: session.email,
				},
			});
			setGuests((prev) => prev.filter((g) => !selectedIds.includes(g.id)));
			toast.success(`${selectedIds.length} tamu berhasil dihapus.`);
			setSelectedIds([]);
			setBulkDeleteModal(false);
		} catch {
			toast.error("Gagal menghapus tamu terpilih.");
		} finally {
			setBulkDeleting(false);
		}
	};

	const handleImportCsv = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!importRawText.trim() || !session?.email || !eventId) {
			toast.error("Data teks CSV tidak boleh kosong.");
			return;
		}

		setImporting(true);
		setImportReport(null);

		try {
			const lines = importRawText
				.trim()
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean);
			if (lines.length === 0) throw new Error("Format CSV tidak terbaca.");

			const headers = lines[0]
				.split(",")
				.map((h) => h.trim().toLowerCase().replace(/["']/g, ""));
			const rows: Array<Record<string, string>> = [];

			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
				const rowObj: Record<string, string> = {};

				headers.forEach((h, idx) => {
					const val = values[idx] || "";
					if (h.includes("nama") || h.includes("name")) rowObj.name = val;
					else if (h.includes("telepon") || h.includes("phone") || h.includes("hp") || h.includes("wa")) rowObj.phone = val;
					else if (h.includes("email")) rowObj.email = val;
					else if (h.includes("kategori") || h.includes("category") || h.includes("grup")) rowObj.category = val;
					else if (h.includes("pax") || h.includes("jumlah") || h.includes("orang")) rowObj.pax = val;
					else if (h.includes("rsvp")) rowObj.rsvp = val;
					else if (h.includes("catatan") || h.includes("notes")) rowObj.notes = val;
				});

				if (!rowObj.name && values[0]) rowObj.name = values[0];
				if (!rowObj.phone && values[1] && /\d/.test(values[1])) rowObj.phone = values[1];
				if (!rowObj.category && values[2]) rowObj.category = values[2];

				if (rowObj.name) rows.push(rowObj);
			}

			const report = await importGuests({
				data: { eventId, rows, userEmail: session.email },
			});

			setImportReport(report);
			toast.success(
				`Import selesai! ${report.importedCount} tamu berhasil diimpor.`,
			);
			await loadData();
		} catch (err: any) {
			toast.error(err?.message || "Gagal mengimpor data CSV.");
		} finally {
			setImporting(false);
		}
	};

	const handleExport = async (type: "all" | "rsvp" | "attended") => {
		if (!session?.email || !eventId) return;
		try {
			const res = await exportGuests({
				data: { eventId, exportType: type, userEmail: session.email },
			});

			const csvContent = [
				res.headers.join(","),
				...res.rows.map((r: any[]) => r.join(",")),
			].join("\n");

			const blob = new Blob(["\uFEFF" + csvContent], {
				type: "text/csv;charset=utf-8;",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`buku-tamu-${type}-${new Date().toISOString().split("T")[0]}.csv`,
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			toast.success("File CSV berhasil diekspor!");
		} catch {
			toast.error("Gagal mengekspor data.");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-xs">
				<div className="flex items-center gap-2">
					<Users className="size-5 text-emerald-800" />
					<div>
						<h2 className="font-serif text-base font-bold text-stone-900 leading-tight">
							Manajemen Daftar Tamu
						</h2>
						<p className="text-[11px] text-stone-500">
							Total: {guests.length} Undangan Terdaftar
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					<button
						type="button"
						onClick={openAddModal}
						className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
					>
						<Plus className="size-3.5" />
						<span>Tambah Tamu</span>
					</button>

					<button
						type="button"
						onClick={() => setIsImportModalOpen(true)}
						className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
					>
						<Upload className="size-3.5 text-stone-500" />
						<span>Import CSV</span>
					</button>

					<button
						type="button"
						onClick={() => handleExport("all")}
						className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
					>
						<Download className="size-3.5 text-stone-500" />
						<span>Export CSV</span>
					</button>
				</div>
			</div>

			<div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs space-y-2.5">
				<div className="flex flex-col sm:flex-row gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
						<input
							type="text"
							placeholder="Cari nama, nomor telepon, email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 py-1.5 text-xs text-stone-900 outline-none focus:border-emerald-700"
						/>
					</div>

					<div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-emerald-700 cursor-pointer"
						>
							<option value="all">Semua Kategori</option>
							{categories.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>

						<select
							value={rsvpFilter}
							onChange={(e) => setRsvpFilter(e.target.value)}
							className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-emerald-700 cursor-pointer"
						>
							<option value="all">Semua RSVP</option>
							<option value="attending">Hadir</option>
							<option value="pending">Menunggu</option>
							<option value="maybe">Ragu-ragu</option>
							<option value="not_attending">Tidak Hadir</option>
						</select>

						<select
							value={attendanceFilter}
							onChange={(e) => setAttendanceFilter(e.target.value)}
							className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-emerald-700 cursor-pointer"
						>
							<option value="all">Semua Kehadiran</option>
							<option value="attended">Telah Hadir</option>
							<option value="unattended">Belum Hadir</option>
						</select>
					</div>
				</div>

				{selectedIds.length > 0 && (
					<div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs animate-in fade-in duration-200">
						<span className="font-bold text-emerald-900">
							{selectedIds.length} tamu dipilih
						</span>

						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => setBulkRsvpModal(true)}
								className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-semibold text-emerald-800 hover:bg-emerald-100"
							>
								Ubah RSVP
							</button>
							<button
								type="button"
								onClick={() => setBulkCatModal(true)}
								className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-semibold text-emerald-800 hover:bg-emerald-100"
							>
								Ubah Kategori
							</button>
							<button
								type="button"
								onClick={() => setBulkDeleteModal(true)}
								className="rounded-md bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-700"
							>
								Hapus Terpilih
							</button>
						</div>
					</div>
				)}
			</div>

			<div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
				{loading ? (
					<div className="py-16 text-center text-xs text-stone-400">
						Memuat daftar tamu...
					</div>
				) : filteredGuests.length === 0 ? (
					<div className="py-16 text-center space-y-3 px-4">
						<p className="text-sm font-bold text-stone-900">
							Tidak ada tamu ditemukan
						</p>
						<p className="text-xs text-stone-500 max-w-sm mx-auto">
							Coba reset filter pencarian atau tambahkan tamu baru ke dalam acara Anda.
						</p>
						<button
							type="button"
							onClick={openAddModal}
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
						>
							<Plus className="size-3.5" />
							<span>Tambah Tamu Baru</span>
						</button>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs border-collapse">
							<thead>
								<tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
									<th className="p-3 w-8">
										<button
											type="button"
											onClick={handleSelectAll}
											className="text-stone-400 hover:text-stone-700 cursor-pointer"
										>
											{selectedIds.length === filteredGuests.length ? (
												<CheckSquare className="size-4 text-emerald-800" />
											) : (
												<Square className="size-4" />
											)}
										</button>
									</th>
									<th className="p-3">Nama Tamu</th>
									<th className="p-3">Kontak</th>
									<th className="p-3">Kategori</th>
									<th className="p-3 text-center">Meja</th>
									<th className="p-3 text-center">Pax Rencana</th>
									<th className="p-3">RSVP</th>
									<th className="p-3">Kehadiran Hari-H</th>
									<th className="p-3">Souvenir</th>
									<th className="p-3 text-right">Aksi</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stone-100">
								{filteredGuests.map((guest) => {
									const isSelected = selectedIds.includes(guest.id);
									return (
										<tr
											key={guest.id}
											className={`hover:bg-stone-50/80 transition-colors ${
												isSelected ? "bg-emerald-50/40" : ""
											}`}
										>
											<td className="p-3">
												<button
													type="button"
													onClick={() => handleToggleSelect(guest.id)}
													className="text-stone-400 hover:text-stone-700 cursor-pointer"
												>
													{isSelected ? (
														<CheckSquare className="size-4 text-emerald-800" />
													) : (
														<Square className="size-4" />
													)}
												</button>
											</td>
											<td className="p-3 font-semibold text-stone-900">
												<Link
													to="/dasbor/buku-tamu/$eventId/tamu/$guestId"
													params={{ eventId, guestId: guest.id }}
													className="hover:text-emerald-800 hover:underline block truncate max-w-[200px]"
												>
													{guest.name}
												</Link>
											</td>
											<td className="p-3 text-stone-500 font-mono text-[11px]">
												{guest.phone || guest.email || "-"}
											</td>
											<td className="p-3">
												<span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700">
													{guest.categoryName}
												</span>
											</td>
											<td className="p-3 text-center font-mono font-bold text-stone-800">
												{guest.tableNumber ? (
													<span className="inline-block rounded-md bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-[10px] text-purple-900">
														{guest.tableNumber}
													</span>
												) : (
													"-"
												)}
											</td>
											<td className="p-3 text-center font-mono font-bold text-stone-700">
												{guest.paxPlanned}
											</td>
											<td className="p-3">
												<span
													className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
														guest.rsvpStatus === "attending"
															? "bg-emerald-100 text-emerald-800"
															: guest.rsvpStatus === "maybe"
																? "bg-purple-100 text-purple-800"
																: guest.rsvpStatus === "not_attending"
																	? "bg-rose-100 text-rose-800"
																	: "bg-stone-100 text-stone-500"
													}`}
												>
													{guest.rsvpStatus === "attending"
														? "Hadir"
														: guest.rsvpStatus === "maybe"
															? "Ragu"
															: guest.rsvpStatus === "not_attending"
																? "Tidak"
																: "Pending"}
												</span>
											</td>
											<td className="p-3">
												{guest.isAttended ? (
													<span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
														<Check className="size-3" />
														<span>Hadir ({guest.paxActual} Pax)</span>
													</span>
												) : (
													<span className="text-[11px] text-stone-400">
														Belum Hadir
													</span>
												)}
											</td>
											<td className="p-3">
												{guest.isSouvenirTaken ? (
													<span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
														<span>✓ {guest.souvenirCount || 1} Pcs</span>
													</span>
												) : (
													<span className="text-[11px] text-stone-400">
														Belum
													</span>
												)}
											</td>
											<td className="p-3 text-right">
												<div className="flex items-center justify-end gap-1">
													<Link
														to="/dasbor/buku-tamu/$eventId/tamu/$guestId"
														params={{ eventId, guestId: guest.id }}
														className="size-7 flex items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100"
														title="Lihat Detail & Timeline"
													>
														<Eye className="size-3.5" />
													</Link>
													<button
														type="button"
														onClick={() => openEditModal(guest)}
														className="size-7 flex items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
														title="Edit Data Tamu"
													>
														<Edit3 className="size-3.5" />
													</button>
													<button
														type="button"
														onClick={() => setDeleteSingleTarget(guest)}
														className="size-7 flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
														title="Hapus Tamu"
													>
														<Trash2 className="size-3.5" />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<h3 className="font-serif text-base font-bold text-stone-900">
								{editingGuest ? "Edit Data Tamu" : "Tambah Tamu Baru"}
							</h3>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="flex size-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:text-stone-900"
							>
								<X className="size-3.5" />
							</button>
						</div>

						<form onSubmit={handleSaveGuest} className="space-y-3">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nama Tamu <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="Contoh: Bapak H. Syarif & Keluarga"
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700 font-semibold"
								/>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Kategori / Hubungan
									</label>
									<select
										value={formCatId}
										onChange={(e) => setFormCatId(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700 cursor-pointer"
									>
										{categories.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Pax Rencana
									</label>
									<input
										type="number"
										min={1}
										max={20}
										value={formPaxPlanned}
										onChange={(e) => setFormPaxPlanned(Number(e.target.value))}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										No WhatsApp / HP
									</label>
									<input
										type="tel"
										placeholder="081234567890"
										value={formPhone}
										onChange={(e) => setFormPhone(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Status RSVP
									</label>
									<select
										value={formRsvp}
										onChange={(e) =>
											setFormRsvp(
												e.target.value as
													| "pending"
													| "attending"
													| "maybe"
													| "not_attending",
											)
										}
										className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700 cursor-pointer"
									>
										<option value="pending">Belum Konfirmasi</option>
										<option value="attending">Hadir</option>
										<option value="maybe">Ragu-ragu</option>
										<option value="not_attending">Tidak Hadir</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Nomor / Nama Meja (Table No)
									</label>
									<input
										type="text"
										placeholder="Contoh: Meja 05, VIP A"
										value={formTableNumber}
										onChange={(e) => setFormTableNumber(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Status Souvenir Fisik
									</label>
									<div className="flex items-center gap-2 pt-1">
										<label className="inline-flex items-center gap-1.5 text-xs text-stone-700 font-semibold cursor-pointer">
											<input
												type="checkbox"
												checked={formIsSouvenirTaken}
												onChange={(e) =>
													setFormIsSouvenirTaken(e.target.checked)
												}
												className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 size-4"
											/>
											<span>Sudah Diambil</span>
										</label>
										{formIsSouvenirTaken && (
											<input
												type="number"
												min={1}
												max={10}
												value={formSouvenirCount}
												onChange={(e) =>
													setFormSouvenirCount(
														parseInt(e.target.value, 10) || 1,
													)
												}
												className="w-16 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-center font-bold"
												placeholder="Pcs"
											/>
										)}
									</div>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Catatan Tambahan
								</label>
								<input
									type="text"
									placeholder="Catatan khusus, alergi makanan, dll."
									value={formNotes}
									onChange={(e) => setFormNotes(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
								>
									{submitting ? "Menyimpan..." : "Simpan Data"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isImportModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<div className="flex items-center gap-2">
								<FileSpreadsheet className="size-5 text-emerald-800" />
								<div>
									<h3 className="font-serif text-base font-bold text-stone-900">
										Import Daftar Tamu CSV / Excel
									</h3>
									<p className="text-xs text-stone-500">
										Salin dan tempel data tabel tamu ke dalam kolom di bawah.
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setIsImportModalOpen(false)}
								className="flex size-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:text-stone-900"
							>
								<X className="size-3.5" />
							</button>
						</div>

						<form onSubmit={handleImportCsv} className="space-y-3">
							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<label className="text-xs font-bold text-stone-700">
										Format Kolom CSV (Baris pertama = Header)
									</label>
									<span className="text-[10px] text-stone-400 font-mono">
										Nama, Telepon, Kategori, Pax, RSVP
									</span>
								</div>
								<textarea
									rows={7}
									required
									placeholder={`Nama,Telepon,Kategori,Pax,RSVP\nBapak Ahmad,081234567890,Keluarga,2,Hadir\nIbu Rina,082345678901,Sahabat,1,Pending\nPak Joko & Istri,083456789012,VIP,2,Hadir`}
									value={importRawText}
									onChange={(e) => setImportRawText(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs font-mono text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							{importReport && (
								<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs space-y-1">
									<p className="font-bold text-emerald-900">
										Laporan Hasil Import:
									</p>
									<ul className="list-disc list-inside text-emerald-800 text-[11px] space-y-0.5">
										<li>Berhasil ditambahkan: {importReport.importedCount} tamu</li>
										<li>Dilewati karena duplikat: {importReport.duplicateCount} tamu</li>
										<li>Baris tidak valid: {importReport.invalidCount} baris</li>
									</ul>
								</div>
							)}

							<div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setIsImportModalOpen(false)}
									className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
								>
									Tutup
								</button>
								<button
									type="submit"
									disabled={importing}
									className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
								>
									{importing ? "Mengimpor Data..." : "Proses Import Data"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{bulkRsvpModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5">
						<h3 className="font-serif text-base font-bold text-stone-900">
							Ubah RSVP Massal ({selectedIds.length} Tamu)
						</h3>
						<div className="space-y-1">
							<label className="text-xs font-bold text-stone-700">
								Pilih Status RSVP Baru
							</label>
							<select
								value={bulkRsvpValue}
								onChange={(e) =>
									setBulkRsvpValue(
										e.target.value as
											| "pending"
											| "attending"
											| "maybe"
											| "not_attending",
									)
								}
								className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-700"
							>
								<option value="attending">Hadir (Attending)</option>
								<option value="pending">Menunggu Konfirmasi (Pending)</option>
								<option value="maybe">Ragu-ragu (Maybe)</option>
								<option value="not_attending">Tidak Hadir (Not Attending)</option>
							</select>
						</div>
						<div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setBulkRsvpModal(false)}
								className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleBulkRsvp}
								className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
							>
								Simpan Perubahan
							</button>
						</div>
					</div>
				</div>
			)}

			{bulkCatModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5">
						<h3 className="font-serif text-base font-bold text-stone-900">
							Ubah Kategori Massal ({selectedIds.length} Tamu)
						</h3>
						<div className="space-y-1">
							<label className="text-xs font-bold text-stone-700">
								Pilih Kategori Baru
							</label>
							<select
								value={bulkCatValue}
								onChange={(e) => setBulkCatValue(e.target.value)}
								className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-700"
							>
								<option value="">Pilih Kategori</option>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
						<div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setBulkCatModal(false)}
								className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleBulkCategory}
								className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
							>
								Terapkan Kategori
							</button>
						</div>
					</div>
				</div>
			)}

			{bulkDeleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5 text-center">
						<div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
							<Trash2 className="size-5" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Hapus {selectedIds.length} Tamu?
							</h3>
							<p className="text-xs text-stone-500">
								Seluruh data tamu terpilih beserta riwayat kehadiran akan dihapus permanen.
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setBulkDeleteModal(false)}
								className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600"
							>
								Batal
							</button>
							<button
								type="button"
								disabled={bulkDeleting}
								onClick={handleBulkDelete}
								className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
							>
								{bulkDeleting ? "Menghapus..." : "Ya, Hapus Terpilih"}
							</button>
						</div>
					</div>
				</div>
			)}

			{deleteSingleTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5 text-center">
						<div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
							<Trash2 className="size-5" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Hapus Tamu Undangan?
							</h3>
							<p className="text-xs text-stone-500">
								Apakah Anda yakin ingin menghapus data{" "}
								<strong>"{deleteSingleTarget.name}"</strong>?
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setDeleteSingleTarget(null)}
								className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleDeleteSingle}
								className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
							>
								Ya, Hapus
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
