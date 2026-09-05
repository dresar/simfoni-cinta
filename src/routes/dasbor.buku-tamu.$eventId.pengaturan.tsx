import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
	Settings,
	Tag,
	Plus,
	Trash2,
	Save,
	AlertTriangle,
	X,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import {
	fetchGuestbookEvent,
	editGuestbookEvent,
	removeGuestbookEvent,
	fetchGuestCategories,
	addGuestCategory,
	removeGuestCategory,
} from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/pengaturan",
)({
	component: GuestbookSettingsPage,
});

interface CategoryItem {
	id: string;
	name: string;
	color: string;
	isDefault: boolean;
}

function GuestbookSettingsPage() {
	const { eventId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/pengaturan",
	});
	const { session } = useStore();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [formTitle, setFormTitle] = useState("");
	const [formDesc, setFormDesc] = useState("");
	const [formDate, setFormDate] = useState("");
	const [formTime, setFormTime] = useState("");
	const [formLocation, setFormLocation] = useState("");
	const [formNotes, setFormNotes] = useState("");
	const [formStatus, setFormStatus] = useState<
		"draft" | "active" | "completed" | "archived"
	>("active");
	const [saving, setSaving] = useState(false);

	const [categories, setCategories] = useState<CategoryItem[]>([]);
	const [newCatName, setNewCatName] = useState("");
	const [addingCat, setAddingCat] = useState(false);

	const [deleteModal, setDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const loadData = async () => {
		if (!session?.email || !eventId) return;
		try {
			const [eventRes, catRes] = await Promise.all([
				fetchGuestbookEvent({
					data: { eventId, userEmail: session.email },
				}),
				fetchGuestCategories({
					data: { eventId, userEmail: session.email },
				}),
			]);

			if (eventRes) {
				const ev: any = eventRes;
				setFormTitle(ev.title || "");
				setFormDesc(ev.description || "");
				setFormDate(ev.eventDate || "");
				setFormTime(ev.eventTime || "");
				setFormLocation(ev.location || "");
				setFormNotes(ev.notes || "");
				setFormStatus(ev.status || "active");
			}

			setCategories((catRes || []) as CategoryItem[]);
		} catch {
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [eventId, session?.email]);

	const handleSaveEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formTitle.trim() || !formDate || !session?.email) {
			toast.error("Nama dan tanggal acara wajib diisi.");
			return;
		}

		setSaving(true);
		try {
			await editGuestbookEvent({
				data: {
					eventId,
					body: {
						title: formTitle.trim(),
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
			toast.success("Pengaturan acara berhasil diperbarui!");
		} catch (err: any) {
			toast.error(err?.message || "Gagal menyimpan perubahan.");
		} finally {
			setSaving(false);
		}
	};

	const handleAddCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		const name = newCatName.trim();
		if (!name || !session?.email) return;

		setAddingCat(true);
		try {
			const newCat = await addGuestCategory({
				data: {
					eventId,
					body: { name, color: "emerald" },
					userEmail: session.email,
				},
			});
			setCategories((prev) => [...prev, newCat as CategoryItem]);
			setNewCatName("");
			toast.success(`Kategori "${name}" berhasil ditambahkan!`);
		} catch {
			toast.error("Gagal menambahkan kategori.");
		} finally {
			setAddingCat(false);
		}
	};

	const handleDeleteCategory = async (catId: string, name: string) => {
		if (!session?.email) return;
		try {
			await removeGuestCategory({
				data: { categoryId: catId, eventId, userEmail: session.email },
			});
			setCategories((prev) => prev.filter((c) => c.id !== catId));
			toast.success(`Kategori "${name}" dihapus.`);
		} catch {
			toast.error("Gagal menghapus kategori.");
		}
	};

	const handleDeleteEvent = async () => {
		if (!session?.email) return;
		setDeleting(true);
		try {
			await removeGuestbookEvent({
				data: { eventId, userEmail: session.email },
			});
			toast.success("Buku Tamu acara ini telah berhasil dihapus.");
			navigate({ to: "/dasbor/buku-tamu" });
		} catch {
			toast.error("Gagal menghapus acara.");
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<div className="py-16 text-center text-xs text-stone-400">
				Memuat pengaturan acara...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-xs">
				<div className="flex items-center gap-2">
					<Settings className="size-5 text-emerald-800" />
					<div>
						<h2 className="font-serif text-base font-bold text-stone-900 leading-tight">
							Pengaturan Buku Tamu Acara
						</h2>
						<p className="text-[11px] text-stone-500">
							Perbarui informasi acara, kelola kategori tamu, dan opsi data
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
				<div className="lg:col-span-7 space-y-4">
					<div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
						<h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
							Informasi Utama Acara
						</h3>

						<form onSubmit={handleSaveEvent} className="space-y-3.5">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nama Acara
								</label>
								<input
									type="text"
									required
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Tanggal Acara
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
										value={formTime}
										onChange={(e) => setFormTime(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Lokasi / Venue
								</label>
								<input
									type="text"
									value={formLocation}
									onChange={(e) => setFormLocation(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Deskripsi / Keterangan
								</label>
								<textarea
									rows={2}
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
									<option value="active">Aktif (Sedang Berjalan)</option>
									<option value="draft">Draf (Persiapan)</option>
									<option value="completed">Selesai (Acara Berakhir)</option>
									<option value="archived">Arsip</option>
								</select>
							</div>

							<div className="pt-2">
								<button
									type="submit"
									disabled={saving}
									className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
								>
									<Save className="size-3.5" />
									<span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>

				<div className="lg:col-span-5 space-y-4">
					<div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
						<div className="flex items-center justify-between border-b border-stone-100 pb-2">
							<div className="flex items-center gap-1.5">
								<Tag className="size-4 text-emerald-800" />
								<h3 className="font-serif text-sm font-bold text-stone-900">
									Kategori Tamu Kustom
								</h3>
							</div>
							<span className="text-[11px] text-stone-400 font-mono">
								{categories.length} Kategori
							</span>
						</div>

						<form onSubmit={handleAddCategory} className="flex gap-2">
							<input
								type="text"
								placeholder="Nama kategori baru..."
								value={newCatName}
								onChange={(e) => setNewCatName(e.target.value)}
								className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 outline-none focus:border-emerald-700"
							/>
							<button
								type="submit"
								disabled={addingCat}
								className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 shrink-0"
							>
								<Plus className="size-3.5" />
							</button>
						</form>

						<div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
							{categories.map((c) => (
								<div
									key={c.id}
									className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 p-2 text-xs"
								>
									<span className="font-semibold text-stone-800">
										{c.name}
									</span>
									<button
										type="button"
										onClick={() => handleDeleteCategory(c.id, c.name)}
										className="text-stone-400 hover:text-red-600 transition-colors p-1"
									>
										<Trash2 className="size-3" />
									</button>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-3">
						<div className="flex items-center gap-2 text-red-800">
							<AlertTriangle className="size-4 shrink-0" />
							<h4 className="text-xs font-bold">Zona Bahaya</h4>
						</div>
						<p className="text-[11px] text-red-700 leading-relaxed">
							Menghapus Buku Tamu ini akan menghapus seluruh data tamu, log kehadiran fisik, dan ucapan secara permanen.
						</p>
						<button
							type="button"
							onClick={() => setDeleteModal(true)}
							className="rounded-lg bg-red-600 hover:bg-red-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
						>
							Hapus Acara Ini
						</button>
					</div>
				</div>
			</div>

			{deleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl space-y-3.5 text-center">
						<div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
							<Trash2 className="size-5" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Hapus Acara Buku Tamu?
							</h3>
							<p className="text-xs text-stone-500">
								Apakah Anda yakin? Seluruh data tamu dan log kehadiran akan hilang permanen dan tidak dapat dikembalikan.
							</p>
						</div>
						<div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
							<button
								type="button"
								onClick={() => setDeleteModal(false)}
								className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600"
							>
								Batal
							</button>
							<button
								type="button"
								disabled={deleting}
								onClick={handleDeleteEvent}
								className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
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
