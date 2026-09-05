import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	fetchUserInvitations,
	removeInvitationForOwner,
	generateSlug,
	addInvitationWithEntitlement,
} from "@/functions/invitations";
import { fetchUserEntitlements } from "@/functions/entitlements";
import { useState, useEffect } from "react";
import { useStore } from "@/store/appStore";
import { fetchTemplates } from "@/functions/media";
import {
	Plus,
	ScrollText,
	Trash2,
	Clock,
	CheckCircle2,
	Sparkles,
	AlertTriangle,
	X,
	ArrowRight,
	ShoppingBag,
	FileText,
	Share2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dasbor/undangan/")({
	loader: async () => {
		const templates = await fetchTemplates().catch(() => []);
		return { templates };
	},
	head: () => ({
		meta: [
			{ title: "Undangan Saya — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Kelola daftar instance undangan digital pernikahan Anda di Simfoni Cinta.",
			},
		],
	}),
	component: UndanganSayaPage,
});

type InvItem = Awaited<ReturnType<typeof fetchUserInvitations>>[number];

function StatusBadge({ status }: { status: string }) {
	if (status === "Aktif") {
		return (
			<span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
				<CheckCircle2 className="size-3" />
				Aktif
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
			<Clock className="size-3" />
			Draf
		</span>
	);
}

function DeleteConfirmModal({
	title,
	onConfirm,
	onCancel,
	loading,
}: {
	title: string;
	onConfirm: () => void;
	onCancel: () => void;
	loading: boolean;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="w-full max-w-sm rounded-[10px] bg-white p-4 sm:p-5 shadow-xl border border-stone-200 space-y-3.5">
				<div className="flex items-center gap-2.5">
					<div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
						<AlertTriangle className="size-4" />
					</div>
					<div>
						<h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
							Hapus Undangan
						</h3>
						<p className="text-[11px] text-stone-500">
							Tindakan ini tidak dapat dibatalkan
						</p>
					</div>
				</div>
				<p className="text-xs text-stone-700">
					Apakah Anda yakin ingin menghapus{" "}
					<span className="font-bold">"{title}"</span>?
				</p>
				<div className="flex gap-2 pt-1.5">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="flex-1 rounded-lg border border-stone-200 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
					>
						{loading ? "Menghapus..." : "Ya, Hapus"}
					</button>
				</div>
			</div>
		</div>
	);
}

function UndanganSayaPage() {
	const { templates = [] } = Route.useLoaderData();
	const { session } = useStore();
	const navigate = useNavigate();
	const [invitations, setInvitations] = useState<InvItem[]>([]);
	const [entitlements, setEntitlements] = useState<any[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [noQuotaModalOpen, setNoQuotaModalOpen] = useState(false);
	const [selectedTemplateSlug, setSelectedTemplateSlug] = useState(
		templates[0]?.slug || "matcha-garden",
	);
	const [newTitle, setNewTitle] = useState("");
	const [creating, setCreating] = useState(false);

	const loadData = async () => {
		if (!session?.email) {
			setLoaded(true);
			return;
		}
		try {
			const [invs, ents] = await Promise.all([
				fetchUserInvitations({ data: session.email }).catch(() => []),
				fetchUserEntitlements({ data: session.email }).catch(() => []),
			]);
			setInvitations(Array.isArray(invs) ? invs : []);
			setEntitlements(Array.isArray(ents) ? ents : []);
		} catch {
			setInvitations([]);
			setEntitlements([]);
		} finally {
			setLoaded(true);
		}
	};

	useEffect(() => {
		loadData();
	}, [session?.email]);

	const availableEntitlements = entitlements.filter(
		(e) => e.status === "available",
	);

	const handleStartCreate = () => {
		if (availableEntitlements.length === 0) {
			setNoQuotaModalOpen(true);
		} else {
			setCreateModalOpen(true);
		}
	};

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = newTitle.trim();
		if (!trimmed) {
			toast.error("Nama undangan wajib diisi.");
			return;
		}
		if (!session?.email) return;

		setCreating(true);
		try {
			const slug = await generateSlug({ data: trimmed });
			const newId = `inv-${Date.now().toString(36)}`;
			const targetEntitlement = availableEntitlements[0];

			await addInvitationWithEntitlement({
				data: {
					id: newId,
					title: trimmed,
					slug,
					template: selectedTemplateSlug,
					status: "Draf",
					views: 0,
					date: new Date().toISOString().split("T")[0],
					ownerId: session.email,
					entitlementId: targetEntitlement?.id,
					liveUrl: "",
				},
			});

			toast.success(`Undangan "${trimmed}" berhasil dibuat!`);
			setCreateModalOpen(false);
			setNewTitle("");
			await loadData();
		} catch (err: any) {
			toast.error(err?.message || "Gagal membuat undangan.");
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget || !session?.email) return;
		setDeleting(true);
		try {
			await removeInvitationForOwner({
				data: { id: deleteTarget.id, ownerId: session.email },
			});
			setInvitations((prev) =>
				prev.filter((inv) => inv.id !== deleteTarget.id),
			);
			toast.success("Undangan berhasil dihapus.");
		} catch {
			toast.error("Gagal menghapus undangan.");
		} finally {
			setDeleting(false);
			setDeleteTarget(null);
		}
	};

	return (
		<div className="space-y-6 max-w-5xl mx-auto pb-12">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<ScrollText className="size-4.5 text-emerald-800" />
						<h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
							Undangan Saya
						</h1>
					</div>
					<p className="text-xs text-stone-500 mt-0.5">
						Kelola dan lengkapi data undangan pernikahan Anda.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleStartCreate}
						className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
					>
						<Plus className="size-3.5" />
						<span>Buat Undangan</span>
					</button>
				</div>
			</div>

			{!loaded ? (
				<div className="flex items-center justify-center py-16 text-stone-400">
					<div className="size-5 rounded-full border-2 border-emerald-800 border-t-transparent animate-spin mr-2" />
					<span className="text-xs font-semibold">
						Memuat daftar...
					</span>
				</div>
			) : invitations.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-stone-300 bg-white py-12 px-6 text-center space-y-3">
					<div className="flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
						<ScrollText className="size-6" />
					</div>
					<div className="space-y-0.5 max-w-sm">
						<h2 className="font-serif text-sm sm:text-base font-bold text-stone-900">
							Belum Ada Undangan
						</h2>
						<p className="text-xs text-stone-500">
							{availableEntitlements.length > 0
								? "Hak akses template siap digunakan. Klik tombol di bawah untuk membuat undangan."
								: "Pilih template dan lakukan pembelian untuk mulai membuat undangan."}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 pt-1.5">
						{availableEntitlements.length > 0 ? (
							<button
								type="button"
								onClick={handleStartCreate}
								className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
							>
								<Plus className="size-3.5" />
								<span>Buat Undangan</span>
							</button>
						) : (
							<Link
								to="/dasbor/template"
								className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all"
							>
								<Sparkles className="size-3.5" />
								<span>Katalog Template</span>
							</Link>
						)}
						<Link
							to="/dasbor/pembelian"
							className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
						>
							<ShoppingBag className="size-3.5" />
							<span>Riwayat</span>
						</Link>
					</div>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2">
					{invitations.map((inv) => (
						<div
							key={inv.id}
							className="flex flex-col justify-between gap-3 rounded-[10px] border border-stone-200/80 bg-white p-3.5 sm:p-4 shadow-xs hover:shadow-sm hover:border-emerald-300 transition-all"
						>
							<Link
								to="/dasbor/undangan/$id"
								params={{ id: inv.id }}
								className="space-y-1.5 group block"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors truncate">
											{inv.title}
										</h3>
									</div>
									<StatusBadge status={inv.status} />
								</div>

								<div className="flex items-center gap-2 text-[11px] text-stone-500">
									<span className="rounded bg-stone-100 px-1.5 py-0.5 font-medium text-stone-600">
										{inv.template}
									</span>
									<span>·</span>
									<span>{inv.date}</span>
								</div>
							</Link>

							<div className="flex items-center gap-2 pt-2 border-t border-stone-100 flex-wrap sm:flex-nowrap">
								<Link
									to="/dasbor/undangan/$id"
									params={{ id: inv.id }}
									className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-900 py-1.5 px-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-xs"
								>
									<FileText className="size-3.5" />
									<span>Edit</span>
								</Link>
								<Link
									to="/dasbor/sebar"
									className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-700/30 bg-emerald-50 py-1.5 px-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
								>
									<Share2 className="size-3.5 text-emerald-700" />
									<span>Buku Tamu</span>
								</Link>
								<button
									type="button"
									onClick={() =>
										setDeleteTarget({ id: inv.id, title: inv.title })
									}
									className="flex size-7.5 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
									title="Hapus"
								>
									<Trash2 className="size-3.5" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{createModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-5 shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<div>
								<h2 className="font-serif text-base font-bold text-stone-900">
									Buat Undangan Baru
								</h2>
								<p className="text-xs text-stone-500 mt-0.5">
									Sisa kuota template tersedia:{" "}
									<span className="font-bold text-emerald-800">
										{availableEntitlements.length}
									</span>
								</p>
							</div>
							<button
								type="button"
								onClick={() => setCreateModalOpen(false)}
								className="flex size-7.5 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						</div>

						<form onSubmit={handleCreateSubmit} className="space-y-3.5">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Pilih Desain Template
								</label>
								<select
									value={selectedTemplateSlug}
									onChange={(e) => setSelectedTemplateSlug(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors cursor-pointer"
								>
									{templates.map((t) => (
										<option key={t.slug} value={t.slug}>
											{t.name} ({t.category})
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nama / Judul Undangan
								</label>
								<input
									type="text"
									required
									autoFocus
									placeholder="Contoh: Pernikahan Eka & Rina"
									value={newTitle}
									onChange={(e) => setNewTitle(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
								<p className="text-[10px] text-stone-400">
									1 hak akses template akan dikonsumsi untuk undangan ini.
								</p>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setCreateModalOpen(false)}
									className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={creating}
									className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
								>
									<span>{creating ? "Memproses..." : "Buat Undangan"}</span>
									<ArrowRight className="size-3.5" />
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{noQuotaModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-5 shadow-xl space-y-4 text-center">
						<div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
							<ShoppingBag className="size-6" />
						</div>
						<div className="space-y-1">
							<h3 className="font-serif text-base font-bold text-stone-900">
								Hak Akses Belum Tersedia
							</h3>
							<p className="text-xs text-stone-500">
								Setiap 1 undangan membutuhkan 1 hak akses template. Silakan beli
								template favorit Anda terlebih dahulu di katalog.
							</p>
						</div>
						<div className="flex flex-col gap-2 pt-2">
							<Link
								to="/dasbor/template"
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
							>
								<Sparkles className="size-3.5" />
								<span>Beli Template Sekarang</span>
							</Link>
							<button
								type="button"
								onClick={() => setNoQuotaModalOpen(false)}
								className="rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
							>
								Tutup
							</button>
						</div>
					</div>
				</div>
			)}

			{deleteTarget && (
				<DeleteConfirmModal
					title={deleteTarget.title}
					onConfirm={handleDelete}
					onCancel={() => setDeleteTarget(null)}
					loading={deleting}
				/>
			)}
		</div>
	);
}
