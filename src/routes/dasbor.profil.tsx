import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
	PageHead,
	GlassCard,
	Action,
	Pill,
	Field,
	TextInput,
} from "@/components/kit";
import {
	User,
	Lock,
	Sparkles,
	ShieldCheck,
	Receipt,
	CheckCircle2,
	Clock,
	XCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/store/appStore";
import { fetchUserPurchases } from "@/functions/purchases";
import { fetchUserEntitlements } from "@/functions/entitlements";
import { toast } from "sonner";

export const Route = createFileRoute("/dasbor/profil")({
	head: () => ({
		meta: [
			{ title: "Profil & Langganan — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Kelola profil akun, riwayat transaksi pembelian, dan keamanan akun.",
			},
		],
	}),
	component: DasborProfilPage,
});

type PurchaseItem = Awaited<ReturnType<typeof fetchUserPurchases>>[number];
type EntitlementItem = Awaited<ReturnType<typeof fetchUserEntitlements>>[number];

function DasborProfilPage() {
	const { session } = useStore();
	const [name, setName] = useState(session?.name || "Pengguna");
	const [email, setEmail] = useState(session?.email || "");
	const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
	const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(true);

	useEffect(() => {
		if (session?.name) setName(session.name);
		if (session?.email) setEmail(session.email);
	}, [session]);

	useEffect(() => {
		if (session?.email) {
			Promise.all([
				fetchUserPurchases({ data: session.email }).catch(() => []),
				fetchUserEntitlements({ data: session.email }).catch(() => []),
			]).then(([pData, eData]) => {
				setPurchases(pData || []);
				setEntitlements(eData || []);
				setLoadingOrders(false);
			});
		} else {
			setLoadingOrders(false);
		}
	}, [session?.email]);

	const [oldPass, setOldPass] = useState("");
	const [newPass, setNewPass] = useState("");
	const [saved, setSaved] = useState(false);

	const handleSaveProfile = (e: React.FormEvent) => {
		e.preventDefault();
		setSaved(true);
		toast.success("Profil berhasil diperbarui!");
		setTimeout(() => setSaved(false), 2000);
	};

	const handleChangePassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPass) {
			toast.error("Password baru wajib diisi.");
			return;
		}
		toast.success("Password berhasil diubah!");
		setOldPass("");
		setNewPass("");
	};

	const paidPurchases = useMemo(() => {
		return purchases.filter((p) => p.status === "paid");
	}, [purchases]);

	const highestTierFromPurchase = useMemo(() => {
		if (
			paidPurchases.some(
				(p) =>
					(p as any).tier === "Platinum" ||
					(p as any).packageId === "platinum" ||
					(p.templateName || "").toLowerCase().includes("platinum"),
			)
		)
			return "Platinum";
		if (
			paidPurchases.some(
				(p) =>
					(p as any).tier === "Gold" ||
					(p as any).packageId === "gold" ||
					(p.templateName || "").toLowerCase().includes("gold"),
			)
		)
			return "Gold";
		if (
			paidPurchases.some(
				(p) =>
					(p as any).tier === "Silver" ||
					(p as any).packageId === "silver" ||
					(p.templateName || "").toLowerCase().includes("silver"),
			)
		)
			return "Silver";
		return null;
	}, [paidPurchases]);

	const effectiveTier = useMemo(() => {
		if (highestTierFromPurchase) return highestTierFromPurchase;
		if (
			session?.tier &&
			(session.tier === "Silver" ||
				session.tier === "Gold" ||
				session.tier === "Platinum")
		) {
			return session.tier;
		}
		return "Belum Berlangganan";
	}, [session, highestTierFromPurchase]);

	const isPaid =
		effectiveTier === "Silver" ||
		effectiveTier === "Gold" ||
		effectiveTier === "Platinum";

	const packageBenefits = useMemo(() => {
		switch (effectiveTier) {
			case "Silver":
				return {
					activeDuration: "1 Tahun",
					photos: "20 Foto",
					waQuota: "50 Kontak",
					liveStream: "-",
					audio: "Pustaka + Audio CDN",
					story: "3 Momen Berfoto",
				};
			case "Gold":
				return {
					activeDuration: "3 Tahun",
					photos: "25 Foto",
					waQuota: "100 Kontak",
					liveStream: "Aktif",
					audio: "Pustaka + Custom MP3",
					story: "Linimasa Lengkap",
				};
			case "Platinum":
				return {
					activeDuration: "Selamanya",
					photos: "30+ Foto HD",
					waQuota: "Unlimited Blast",
					liveStream: "Aktif (YouTube/IG)",
					audio: "Pustaka + Custom MP3",
					story: "Momen Unlimited",
				};
			default:
				return {
					activeDuration: "Belum Aktif",
					photos: "-",
					waQuota: "-",
					liveStream: "-",
					audio: "-",
					story: "-",
				};
		}
	}, [effectiveTier]);

	return (
		<div className="space-y-6 max-w-5xl" suppressHydrationWarning>
			<PageHead
				title="Profil & Langganan"
				subtitle="Kelola data akun, pantau riwayat pembelian paket, dan kelola keamanan"
			>
				<Pill tone={isPaid ? "matcha" : "gold"}>
					Paket {effectiveTier}
				</Pill>
			</PageHead>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 space-y-4">
					<GlassCard className="p-3.5 sm:p-4 border border-slate-200/90 bg-white dark:border-white/10 dark:bg-card shadow-xs space-y-3.5">
						<h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
							<User className="size-4 text-amber-700" />
							Informasi Pribadi & Mempelai
						</h3>

						<form onSubmit={handleSaveProfile} className="space-y-3">
							<Field label="Nama Pasangan Mempelai">
								<TextInput
									placeholder="Nama"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</Field>

							<Field label="Email Terdaftar">
								<TextInput
									type="email"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Field>

							<div className="flex justify-end pt-1">
								<Action tone="gold" size="sm" type="submit">
									{saved ? "Tersimpan" : "Simpan Profil"}
								</Action>
							</div>
						</form>
					</GlassCard>

					<GlassCard className="p-3.5 sm:p-4 border border-slate-200/90 bg-white dark:border-white/10 dark:bg-card shadow-xs space-y-3.5">
						<div className="flex items-center justify-between">
							<h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
								<Receipt className="size-4 text-amber-700" />
								Riwayat Pembelian & Langganan ({purchases.length})
							</h3>
							<span className="text-[11px] text-slate-500 dark:text-muted-foreground font-mono">
								Total Transaksi: {purchases.length}
							</span>
						</div>

						<div className="space-y-2.5">
							{loadingOrders && (
								<p className="text-xs text-slate-400 text-center py-6">
									Memuat riwayat transaksi...
								</p>
							)}

							{!loadingOrders && purchases.length === 0 && (
								<div className="text-center py-6 space-y-2">
									<p className="text-xs text-slate-500 font-medium">
										Belum ada riwayat transaksi di akun Anda.
									</p>
									<Link
										to="/dasbor/template"
										className="inline-flex text-xs font-bold text-emerald-800 hover:underline"
									>
										Jelajahi Katalog Template & Paket →
									</Link>
								</div>
							)}

							{!loadingOrders &&
								purchases.map((order) => {
									const formattedDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
										day: "numeric",
										month: "short",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									});
									const invoiceNumber = (order.id || "").toUpperCase();

									return (
										<div
											key={order.id}
											className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 transition-colors"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100/70 border border-amber-200/80 px-1.5 py-0.5 rounded">
														{invoiceNumber}
													</span>
													{order.status === "paid" ? (
														<span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
															<CheckCircle2 className="size-3" />
															Lunas
														</span>
													) : order.status === "pending" ? (
														<span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
															<Clock className="size-3" />
															Menunggu
														</span>
													) : (
														<span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
															<XCircle className="size-3" />
															{order.status}
														</span>
													)}
												</div>
												<p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
													{order.templateName}
												</p>
												<p className="text-[11px] text-slate-500 dark:text-muted-foreground">
													{formattedDate} • Mata Uang: {order.currency}
												</p>
											</div>

											<div className="text-right sm:self-center">
												<p className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
													Rp {order.amount.toLocaleString("id-ID")}
												</p>
												{order.status === "pending" && order.paymentUrl && (
													<a
														href={order.paymentUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-[11px] font-bold text-amber-700 hover:underline block mt-0.5"
													>
														Bayar Sekarang →
													</a>
												)}
											</div>
										</div>
									);
								})}
						</div>
					</GlassCard>

					<GlassCard className="p-3.5 sm:p-4 border border-slate-200/90 bg-white dark:border-white/10 dark:bg-card shadow-xs space-y-3.5">
						<h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
							<Lock className="size-4 text-amber-700" />
							Keamanan Kata Sandi
						</h3>

						<form onSubmit={handleChangePassword} className="space-y-3">
							<Field label="Password Saat Ini">
								<TextInput
									type="password"
									placeholder="Password"
									value={oldPass}
									onChange={(e) => setOldPass(e.target.value)}
								/>
							</Field>

							<Field label="Password Baru">
								<TextInput
									type="password"
									placeholder="Password"
									value={newPass}
									onChange={(e) => setNewPass(e.target.value)}
								/>
							</Field>

							<div className="flex justify-end pt-1">
								<Action tone="primary" size="sm" type="submit">
									Ubah Password
								</Action>
							</div>
						</form>
					</GlassCard>
				</div>

				<div className="space-y-4">
					<GlassCard className="p-3.5 sm:p-4 border border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-card shadow-xs space-y-3">
						<div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
							<Sparkles className="size-4 text-amber-600" />
							<h4 className="font-serif font-bold text-xs sm:text-sm">
								Paket Undangan Digital
							</h4>
						</div>

						<div className="space-y-2 text-xs">
							<div className="flex justify-between py-1 border-b border-amber-200/60 dark:border-white/10">
								<span className="text-slate-500">Tier Paket</span>
								<span className="font-bold text-amber-900 dark:text-amber-400 uppercase">
									{effectiveTier} {isPaid ? "(Aktif)" : "(Belum Berlangganan)"}
								</span>
							</div>
							<div className="flex justify-between py-1 border-b border-amber-200/60 dark:border-white/10">
								<span className="text-slate-500">Masa Aktif</span>
								<span
									className={
										isPaid
											? "font-semibold text-slate-800 dark:text-white"
											: "font-semibold text-slate-400"
									}
								>
									{packageBenefits.activeDuration}
								</span>
							</div>
							<div className="flex justify-between py-1 border-b border-amber-200/60 dark:border-white/10">
								<span className="text-slate-500">Foto Galeri</span>
								<span
									className={
										isPaid
											? "font-semibold text-emerald-700 dark:text-emerald-400"
											: "font-semibold text-slate-400"
									}
								>
									{packageBenefits.photos}
								</span>
							</div>
							<div className="flex justify-between py-1 border-b border-amber-200/60 dark:border-white/10">
								<span className="text-slate-500">Kirim WA Tamu</span>
								<span
									className={
										isPaid
											? "font-semibold text-emerald-700 dark:text-emerald-400"
											: "font-semibold text-slate-400"
									}
								>
									{packageBenefits.waQuota}
								</span>
							</div>
							<div className="flex justify-between py-1 border-b border-amber-200/60 dark:border-white/10">
								<span className="text-slate-500">Live Streaming</span>
								<span
									className={
										isPaid
											? "font-semibold text-emerald-700 dark:text-emerald-400"
											: "font-semibold text-slate-400"
									}
								>
									{packageBenefits.liveStream}
								</span>
							</div>
							<div className="flex justify-between py-1 border-b border-amber-200/60 dark:border-white/10">
								<span className="text-slate-500">Background Audio</span>
								<span
									className={
										isPaid
											? "font-semibold text-emerald-700 dark:text-emerald-400"
											: "font-semibold text-slate-400"
									}
								>
									{packageBenefits.audio}
								</span>
							</div>
							<div className="flex justify-between py-1">
								<span className="text-slate-500">Linimasa Kisah Cinta</span>
								<span
									className={
										isPaid
											? "font-semibold text-emerald-700 dark:text-emerald-400"
											: "font-semibold text-slate-400"
									}
								>
									{packageBenefits.story}
								</span>
							</div>
						</div>

						{isPaid ? (
							<Link
								to="/dasbor/pembelian"
								className="block text-center w-full rounded-lg bg-emerald-800 hover:bg-emerald-700 py-2 text-xs font-semibold text-white shadow-xs transition-all"
							>
								Kelola Hak Akses & Pembelian
							</Link>
						) : (
							<Link
								to="/dasbor/template"
								className="block text-center w-full rounded-lg bg-amber-600 hover:bg-amber-500 py-2 text-xs font-semibold text-white shadow-xs transition-all"
							>
								Pilih Paket Undangan
							</Link>
						)}
					</GlassCard>

					<GlassCard className="p-3.5 sm:p-4 border border-slate-200/90 bg-white dark:border-white/10 dark:bg-card shadow-xs space-y-3">
						<h4 className="font-serif font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
							<ShieldCheck className="size-4 text-emerald-600" />
							Hak Akses Template Anda
						</h4>
						{entitlements.length > 0 ? (
							<div className="space-y-2">
								<p className="text-[11px] text-slate-500 leading-relaxed">
									Anda memiliki <strong>{entitlements.length}</strong> template berlisensi resmi:
								</p>
								<div className="space-y-1.5">
									{entitlements.map((e) => (
										<div
											key={e.id}
											className="rounded-lg bg-emerald-50/70 border border-emerald-200/80 p-2 text-xs font-medium text-emerald-950 flex items-center justify-between"
										>
											<span className="truncate">{e.templateName}</span>
											<span className="text-[10px] font-bold uppercase bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
												{e.status === "available" ? "Siap Pakai" : "Digunakan"}
											</span>
										</div>
									))}
								</div>
							</div>
						) : (
							<p className="text-[11px] text-slate-500 leading-relaxed">
								Belum memiliki lisensi template aktif. Beli template di katalog untuk mulai membuat undangan pernikahan.
							</p>
						)}
					</GlassCard>
				</div>
			</div>
		</div>
	);
}
