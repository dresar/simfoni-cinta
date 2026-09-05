import { useState, useEffect } from "react";
import {
	Heart,
	ChatCircleDots,
	PaperPlaneTilt,
	Sparkle,
	User,
	CheckCircle,
	WarningCircle,
} from "@phosphor-icons/react";
import { addRsvp, fetchRsvps } from "@/functions/transaksi";
import { createId } from "@/store/appStore";

type WishItem = {
	id: string;
	name: string;
	attendance: "Hadir" | "Ragu" | "Tidak Hadir";
	pax: number;
	message: string;
	date: string;
	likes: number;
};

export function GuestbookWall({ slug = "wedding-demo" }: { slug?: string }) {
	const [wishes, setWishes] = useState<WishItem[]>([]);
	const [loadingWishes, setLoadingWishes] = useState(true);

	const [form, setForm] = useState({
		name: "",
		attendance: "Hadir" as "Hadir" | "Ragu" | "Tidak Hadir",
		pax: 1,
		message: "",
	});

	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

	useEffect(() => {
		fetchRsvps({ data: slug })
			.then((rows) => {
				const mapped: WishItem[] = (rows || [])
					.map((r) => ({
						id: r.id,
						name: r.guest,
						attendance: r.attendance as "Hadir" | "Ragu" | "Tidak Hadir",
						pax: r.pax ?? 1,
						message: r.message ?? "",
						date: r.time ?? "",
						likes: 0,
					}));
				setWishes(mapped);
			})
			.catch(() => {})
			.finally(() => setLoadingWishes(false));
	}, [slug]);

	const handleLike = (id: string) => {
		const isCurrentlyLiked = !!likedIds[id];
		setLikedIds((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
		setWishes((prev) =>
			prev.map((w) =>
				w.id === id
					? { ...w, likes: w.likes + (isCurrentlyLiked ? -1 : 1) }
					: w,
			),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim() || !form.message.trim()) return;

		setSubmitting(true);
		setSubmitError(null);

		const newId = createId("w");
		const newWish: WishItem = {
			id: newId,
			name: form.name.trim(),
			attendance: form.attendance,
			pax: form.pax,
			message: form.message.trim(),
			date: "Baru saja",
			likes: 0,
		};

		try {
			await addRsvp({
				data: {
					id: newId,
					slug,
					guest: form.name.trim(),
					attendance: form.attendance,
					pax: form.pax,
					message: form.message.trim(),
					time: new Date().toLocaleTimeString("id-ID", {
						hour: "2-digit",
						minute: "2-digit",
					}),
				},
			});

			setWishes((prev) => [newWish, ...prev]);
			setForm({ name: "", attendance: "Hadir", pax: 1, message: "" });
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 4000);
		} catch {
			setSubmitError("Gagal mengirim ucapan. Periksa koneksi dan coba lagi.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
					<Sparkle weight="duotone" className="size-3.5" />
					Buku Tamu & Ucapan
				</div>
				<h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
					Doa & Ucapan Bahagia
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Berikan doa restu dan konfirmasi kehadiran Anda untuk kedua mempelai
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-lift transition-all mb-8"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-xs font-semibold text-foreground mb-1.5">
							Nama Lengkap
						</label>
						<div className="relative">
							<User
								weight="duotone"
								className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
							/>
							<input
								type="text"
								placeholder="Nama Anda atau Keluarga"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold text-foreground mb-1.5">
								Konfirmasi Kehadiran
							</label>
							<select
								value={form.attendance}
								onChange={(e) =>
									setForm({
										...form,
										attendance: e.target.value as
											| "Hadir"
											| "Ragu"
											| "Tidak Hadir",
									})
								}
								className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
							>
								<option value="Hadir">✨ Hadir</option>
								<option value="Ragu">🤔 Masih Ragu</option>
								<option value="Tidak Hadir">🙏 Berhalangan Hadir</option>
							</select>
						</div>

						<div>
							<label className="block text-xs font-semibold text-foreground mb-1.5">
								Jumlah Tamu (Pax)
							</label>
							<input
								type="number"
								min="1"
								max="5"
								value={form.pax}
								onChange={(e) =>
									setForm({ ...form, pax: parseInt(e.target.value) || 1 })
								}
								className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
							/>
						</div>
					</div>

					<div>
						<label className="block text-xs font-semibold text-foreground mb-1.5">
							Pesan Doa & Ucapan
						</label>
						<textarea
							rows={3}
							placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai…"
							value={form.message}
							onChange={(e) => setForm({ ...form, message: e.target.value })}
							className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
					>
						{submitting ? (
							"Mengirimkan Doa…"
						) : (
							<>
								<PaperPlaneTilt weight="duotone" className="size-4" />
								Kirim Ucapan & Konfirmasi
							</>
						)}
					</button>

					{submitted && (
						<div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
							<CheckCircle weight="duotone" className="size-4 shrink-0" />
							Terima kasih! Doa dan konfirmasi kehadiran Anda telah tersimpan.
						</div>
					)}

					{submitError && (
						<div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
							<WarningCircle weight="duotone" className="size-4 shrink-0" />
							{submitError}
						</div>
					)}
				</div>
			</form>

			<div className="space-y-4">
				<div className="flex items-center justify-between px-1">
					<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
						<ChatCircleDots weight="duotone" className="size-4 text-primary" />
						{loadingWishes
							? "Memuat ucapan…"
							: `${wishes.length} Doa & Ucapan Masuk`}
					</span>
				</div>

				{wishes.map((item) => (
					<div
						key={item.id}
						className="rounded-2xl border border-border bg-card p-4.5 shadow-sm hover:shadow-soft transition-all"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-2.5">
								<div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
									{item.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<h4 className="font-semibold text-sm text-foreground">
										{item.name}
									</h4>
									<div className="flex items-center gap-2 mt-0.5">
										<span
											className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
												item.attendance === "Hadir"
													? "bg-success/10 text-success border border-success/20"
													: item.attendance === "Ragu"
														? "bg-gold/10 text-gold border border-gold/20"
														: "bg-danger/10 text-danger border border-danger/20"
											}`}
										>
											{item.attendance} ({item.pax} pax)
										</span>
										<span className="text-[10px] text-muted-foreground">
											{item.date}
										</span>
									</div>
								</div>
							</div>

							<button
								onClick={() => handleLike(item.id)}
								className={`p-1.5 rounded-full flex items-center gap-1 text-xs transition-all ${
									likedIds[item.id]
										? "bg-danger/10 text-danger font-bold"
										: "bg-surface text-muted-foreground hover:text-danger"
								}`}
							>
								<Heart
									weight={likedIds[item.id] ? "fill" : "duotone"}
									className="size-4"
								/>
								<span>{item.likes}</span>
							</button>
						</div>

						<p className="mt-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans pl-10">
							"{item.message}"
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
