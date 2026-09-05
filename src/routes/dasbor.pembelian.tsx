import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
	ShoppingBag,
	Sparkles,
	CheckCircle2,
	Clock,
	XCircle,
	ArrowRight,
	ExternalLink,
	RefreshCw,
	ShieldCheck,
	Check,
	ArrowLeft,
	Loader2,
	Lock,
} from "lucide-react";
import {
	useStore,
	DEFAULT_PACKAGES,
	type PricingPackage,
} from "@/store/appStore";
import {
	fetchUserPurchases,
	verifyPurchaseAndGrant,
	createPurchaseOrder,
} from "@/functions/purchases";
import { fetchUserEntitlements } from "@/functions/entitlements";
import { fetchAdminSettings } from "@/functions/settings";
import { fetchTemplates } from "@/functions/media";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
	status: z.string().optional(),
	orderId: z.string().optional(),
	ref: z.string().optional(),
	action: z.string().optional(),
	template: z.string().optional(),
	package: z.string().optional(),
});

export const Route = createFileRoute("/dasbor/pembelian")({
	validateSearch: (search) => searchSchema.parse(search),
	loader: async () => {
		const [settings, templates] = await Promise.all([
			fetchAdminSettings().catch(() => null),
			fetchTemplates().catch(() => []),
		]);
		return { settings, templates };
	},
	head: () => ({
		meta: [
			{ title: "Pembelian & Checkout — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Daftar transaksi dan hak akses template undangan pernikahan Anda.",
			},
		],
	}),
	component: DasborPembelianPage,
});

type PurchaseItem = Awaited<ReturnType<typeof fetchUserPurchases>>[number];
type EntitlementItem = Awaited<
	ReturnType<typeof fetchUserEntitlements>
>[number];

function DasborPembelianPage() {
	const { settings, templates = [] } = Route.useLoaderData();
	const navigate = useNavigate();
	const { session } = useStore();
	const search = useSearch({ from: "/dasbor/pembelian" });

	const dbPackages: PricingPackage[] = useMemo(() => {
		if (settings?.packages && settings.packages.length > 0) {
			return settings.packages;
		}
		return DEFAULT_PACKAGES;
	}, [settings]);

	const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
	const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [verifying, setVerifying] = useState(false);
	const [selectedPackageId, setSelectedPackageId] = useState<string>(
		search.package || dbPackages[0]?.id || "silver",
	);
	const [isPurchasing, setIsPurchasing] = useState(false);

	const isCheckoutMode = search.action === "checkout" && !!search.template;
	const selectedTemplate = useMemo(() => {
		if (!search.template) return null;
		return templates.find((t) => t.slug === search.template) || templates[0];
	}, [search.template]);

	const activePackage = useMemo(() => {
		return dbPackages.find((p) => p.id === selectedPackageId) || dbPackages[0];
	}, [dbPackages, selectedPackageId]);

	const loadData = async () => {
		if (!session?.email) {
			setLoading(false);
			return;
		}
		try {
			const [purchasesData, entitlementsData] = await Promise.all([
				fetchUserPurchases({ data: session.email }),
				fetchUserEntitlements({ data: session.email }),
			]);
			setPurchases(purchasesData);
			setEntitlements(entitlementsData);
		} catch {
			toast.error("Gagal memuat data transaksi.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const targetOrderId = search.orderId || search.ref;
		if (search.status === "success" && targetOrderId) {
			setVerifying(true);
			verifyPurchaseAndGrant({ data: targetOrderId })
				.then((res) => {
					if (res) {
						toast.success(
							"Pembayaran terverifikasi! Hak pembuatan undangan baru telah aktif.",
						);
					} else {
						toast.error("Pembayaran belum terkonfirmasi oleh sistem Mayar.");
					}
					loadData();
				})
				.catch(() => {
					toast.error("Gagal memverifikasi status pembayaran.");
					loadData();
				})
				.finally(() => {
					setVerifying(false);
				});
		} else {
			loadData();
		}
	}, [session?.email, search.status, search.orderId, search.ref]);

	const handleProcessPayment = async () => {
		if (!session?.email || !selectedTemplate || !activePackage) {
			toast.error("Sesi pengguna atau paket tidak valid.");
			return;
		}

		setIsPurchasing(true);
		const baseUrl =
			typeof window !== "undefined"
				? window.location.origin
				: "https://simfonicinta.my.id";

		try {
			const res = await createPurchaseOrder({
				data: {
					body: {
						userId: session.email,
						templateId: selectedTemplate.id,
						templateName: `${selectedTemplate.name} (${activePackage.name})`,
						templateSlug: selectedTemplate.slug,
						packageId: activePackage.id,
						tier: activePackage.name.replace("Paket ", "").trim(),
						amount: activePackage.price,
						customerName: session.name || "Customer",
						customerEmail: session.email,
					},
					baseUrl,
				},
			});

			if (res.paymentUrl) {
				toast.success("Mengarahkan ke pembayaran aman Mayar...");
				window.location.href = res.paymentUrl;
			} else {
				toast.error("Gagal membuat sesi pembayaran.");
			}
		} catch (err: any) {
			toast.error(err?.message || "Gagal menghubungkan ke gateway pembayaran.");
		} finally {
			setIsPurchasing(false);
		}
	};

	const availableEntitlements = entitlements.filter(
		(e) => e.status === "available",
	);
	const usedEntitlements = entitlements.filter((e) => e.status === "used");

	if (isCheckoutMode && selectedTemplate) {
		return (
			<div className="space-y-5 max-w-5xl mx-auto pb-10 px-2 sm:px-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
					<div className="space-y-0.5">
						<Link
							to="/dasbor/template"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-800 transition-colors"
						>
							<ArrowLeft className="size-3.5" />
							<span>Kembali ke Katalog Template</span>
						</Link>
						<h1 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							Pilih Paket & Checkout Undangan
						</h1>
						<p className="text-xs text-stone-500">
							Tentukan paket fitur sesuai kebutuhan momen istimewa Anda sebelum
							melanjutkan ke pembayaran.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
							<ShieldCheck className="size-3.5 text-emerald-700" />
							<span>Pembayaran Aman Mayar</span>
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
					<div className="lg:col-span-7 space-y-3">
						<div className="flex items-center justify-between">
							<h2 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
								Pilihan Tingkatan Paket Fitur:
							</h2>
							<span className="text-[11px] text-stone-400">
								1 Pembelian = 1 Undangan Aktif
							</span>
						</div>

						<div className="space-y-2.5">
							{dbPackages.map((pkg) => {
								const isSelected = selectedPackageId === pkg.id;
								return (
									<div
										key={pkg.id}
										onClick={() => setSelectedPackageId(pkg.id)}
										className={`relative rounded-[10px] border p-3.5 sm:p-4 transition-all cursor-pointer flex flex-col gap-2 shadow-xs ${
											isSelected
												? "border-emerald-800 bg-emerald-50/50 ring-1 ring-emerald-800/30"
												: "border-stone-200/90 hover:border-stone-300 bg-white"
										}`}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2 min-w-0">
												<div
													className={`size-4 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
														isSelected
															? "border-emerald-800 bg-emerald-800 text-white"
															: "border-stone-300 bg-white"
													}`}
												>
													{isSelected && <Check className="size-3" />}
												</div>
												<span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
													{pkg.name}
												</span>
												{pkg.badge && (
													<span
														className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
															pkg.popular
																? "bg-amber-100 text-amber-800 border border-amber-200"
																: "bg-stone-100 text-stone-600"
														}`}
													>
														{pkg.badge}
													</span>
												)}
											</div>
											<div className="text-right shrink-0">
												<div className="flex items-center gap-1.5 justify-end">
													{pkg.originalPrice && pkg.originalPrice > pkg.price && (
														<span className="text-[11px] line-through text-stone-400">
															Rp {pkg.originalPrice.toLocaleString("id-ID")}
														</span>
													)}
													<span className="font-bold text-sm sm:text-base text-emerald-900">
														Rp {pkg.price.toLocaleString("id-ID")}
													</span>
												</div>
												<span className="text-[10px] text-stone-400 block font-normal">
													/ undangan
												</span>
											</div>
										</div>

										<div className="pl-6 pt-2 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-1">
											{pkg.features.map((feat) => (
												<div
													key={feat}
													className="inline-flex items-center gap-1 text-[11px] text-stone-700"
												>
													<Check className="size-3 text-emerald-700 shrink-0" />
													<span>{feat}</span>
												</div>
											))}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
						<div className="rounded-[10px] border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs space-y-3.5">
							<h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
								Ringkasan Pesanan
							</h3>

							<div className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/70 p-2.5">
								<img
									src={selectedTemplate.thumb}
									alt={selectedTemplate.name}
									className="size-12 rounded-lg object-cover border border-stone-200 shrink-0"
								/>
								<div className="min-w-0 flex-1 space-y-0.5">
									<span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
										{selectedTemplate.category}
									</span>
									<h4 className="font-serif text-xs sm:text-sm font-bold text-stone-900 truncate">
										{selectedTemplate.name}
									</h4>
									<p className="text-[10px] text-stone-500">
										{selectedTemplate.tag}
									</p>
								</div>
							</div>

							<div className="space-y-1.5 text-xs text-stone-600">
								<div className="flex items-center justify-between">
									<span className="text-stone-500">Paket Terpilih</span>
									<span className="font-semibold text-stone-900">
										{activePackage?.name}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-stone-500">Email Pemesan</span>
									<span className="font-semibold text-stone-900 truncate max-w-[180px]">
										{session?.email}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-stone-500">Metode Pembayaran</span>
									<span className="font-semibold text-stone-900">
										QRIS / E-Wallet / VA
									</span>
								</div>
							</div>

							<div className="border-t border-stone-100 pt-2.5 flex items-center justify-between">
								<div>
									<span className="text-[11px] text-stone-500 block">
										Total Pembayaran:
									</span>
									<div className="flex items-baseline gap-2">
										<span className="font-serif text-base sm:text-lg font-bold text-emerald-900">
											Rp {(activePackage?.price ?? 0).toLocaleString("id-ID")}
										</span>
										{activePackage?.originalPrice && activePackage.originalPrice > (activePackage.price ?? 0) && (
											<span className="text-xs line-through text-stone-400">
												Rp {activePackage.originalPrice.toLocaleString("id-ID")}
											</span>
										)}
									</div>
								</div>
								{activePackage?.originalPrice && activePackage.originalPrice > (activePackage.price ?? 0) && (
									<span className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
										Hemat {Math.round(((activePackage.originalPrice - activePackage.price) / activePackage.originalPrice) * 100)}%
									</span>
								)}
							</div>

							<button
								type="button"
								disabled={isPurchasing}
								onClick={handleProcessPayment}
								className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 py-2.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
							>
								{isPurchasing ? (
									<>
										<Loader2 className="size-3.5 animate-spin" />
										<span>Menghubungkan Mayar...</span>
									</>
								) : (
									<>
										<span>
											Bayar Sekarang • Rp{" "}
											{(activePackage?.price ?? 0).toLocaleString("id-ID")}
										</span>
										<ArrowRight className="size-3.5" />
									</>
								)}
							</button>

							<p className="text-center text-[10px] text-stone-400">
								Transaksi diproses secara instan & otomatis oleh Mayar (QRIS,
								VA, E-Wallet).
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto px-2 sm:px-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
				<div>
					<h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
						Pembelian & Hak Akses
					</h1>
					<p className="text-xs text-stone-500 mt-0.5">
						Kelola transaksi template dan kuota pembuatan undangan Anda.
					</p>
				</div>
				<Link
					to="/dasbor/template"
					className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-all self-start sm:self-auto cursor-pointer"
				>
					<Sparkles className="size-3.5" />
					<span>Katalog Template</span>
				</Link>
			</div>

			{verifying && (
				<div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 flex items-center gap-2.5">
					<RefreshCw className="size-3.5 animate-spin text-amber-800 shrink-0" />
					<p className="text-xs font-semibold text-amber-900">
						Sedang memverifikasi status pembayaran dari Mayar...
					</p>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<div className="rounded-[10px] border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs space-y-1">
					<div className="flex items-center justify-between text-stone-500 text-xs">
						<span>Hak Akses Aktif</span>
						<Sparkles className="size-4 text-emerald-700" />
					</div>
					<p className="text-xl sm:text-2xl font-bold text-stone-900">
						{availableEntitlements.length}
					</p>
					<p className="text-[11px] text-stone-400">
						Kuota pembuatan undangan siap pakai
					</p>
				</div>

				<div className="rounded-[10px] border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs space-y-1">
					<div className="flex items-center justify-between text-stone-500 text-xs">
						<span>Undangan Dibuat</span>
						<CheckCircle2 className="size-4 text-stone-400" />
					</div>
					<p className="text-xl sm:text-2xl font-bold text-stone-900">
						{usedEntitlements.length}
					</p>
					<p className="text-[11px] text-stone-400">
						Total instance undangan yang telah aktif
					</p>
				</div>

				<div className="rounded-[10px] border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs space-y-1">
					<div className="flex items-center justify-between text-stone-500 text-xs">
						<span>Total Transaksi</span>
						<ShoppingBag className="size-4 text-stone-400" />
					</div>
					<p className="text-xl sm:text-2xl font-bold text-stone-900">
						{purchases.length}
					</p>
					<p className="text-[11px] text-stone-400">
						Riwayat pesanan template di akun Anda
					</p>
				</div>
			</div>

			<div className="space-y-3">
				<h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
					Hak Akses Template Siap Pakai
				</h2>
				{availableEntitlements.length === 0 ? (
					<div className="rounded-[10px] border border-dashed border-stone-200 bg-white p-6 sm:p-8 text-center space-y-2.5">
						<ShoppingBag className="size-7 mx-auto text-stone-300" />
						<div className="space-y-0.5">
							<p className="text-xs font-semibold text-stone-700">
								Belum Ada Hak Akses Template Aktif
							</p>
							<p className="text-[11px] text-stone-400 max-w-sm mx-auto">
								Pilih desain favorit Anda di katalog template untuk mendapatkan
								hak pembuatan undangan baru.
							</p>
						</div>
						<Link
							to="/dasbor/template"
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
						>
							<span>Pilih Template</span>
							<ArrowRight className="size-3" />
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{availableEntitlements.map((ent) => (
							<div
								key={ent.id}
								className="rounded-[10px] border border-emerald-200/90 bg-emerald-50/50 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between gap-3"
							>
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
											Tersedia
										</span>
										<span className="text-[10px] text-stone-400 font-mono">
											{ent.id.slice(0, 10)}
										</span>
									</div>
									<h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 pt-0.5">
										{ent.templateName}
									</h3>
									<p className="text-[11px] text-stone-500">
										1 instance undangan dapat dibuat dengan template ini.
									</p>
								</div>

								<Link
									to="/dasbor/undangan"
									search={{ create: "true", template: ent.templateId }}
									className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-900 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
								>
									<Sparkles className="size-3.5" />
									<span>Buat Undangan Sekarang</span>
								</Link>
							</div>
						))}
					</div>
				)}
			</div>

			{usedEntitlements.length > 0 && (
				<div className="space-y-3 pt-1">
					<h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
						Hak Akses Yang Sedang Digunakan ({usedEntitlements.length})
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{usedEntitlements.map((ent) => (
							<div
								key={ent.id}
								className="rounded-[10px] border border-stone-200/90 bg-stone-50/70 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between gap-3"
							>
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<span className="rounded bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[9px] font-bold text-emerald-900 uppercase tracking-wider">
											Aktif Digunakan
										</span>
										<span className="text-[10px] text-stone-400 font-mono">
											{ent.id.slice(0, 10)}
										</span>
									</div>
									<h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 pt-0.5">
										{ent.templateName}
									</h3>
									<p className="text-[11px] text-stone-500 leading-relaxed">
										Hak akses template ini telah digunakan untuk 1 website undangan aktif Anda.
									</p>
								</div>

								<Link
									to="/dasbor/undangan"
									className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-all shadow-xs cursor-pointer"
								>
									<span>Buka Undangan Saya</span>
									<ArrowRight className="size-3.5" />
								</Link>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="space-y-3">
				<h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
					Riwayat Transaksi
				</h2>

				{loading ? (
					<div className="rounded-[10px] border border-stone-200 bg-white p-6 text-center text-xs text-stone-400">
						Memuat riwayat transaksi...
					</div>
				) : purchases.length === 0 ? (
					<div className="rounded-[10px] border border-stone-200 bg-white p-6 text-center text-xs text-stone-400">
						Belum ada riwayat transaksi.
					</div>
				) : (
					<div className="rounded-[10px] border border-stone-200/90 bg-white overflow-hidden shadow-xs">
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead className="border-b border-stone-100 bg-stone-50 text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider">
									<tr>
										<th className="px-4 py-3">ID Pesanan</th>
										<th className="px-4 py-3">Template</th>
										<th className="px-4 py-3">Nominal</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Tanggal</th>
										<th className="px-4 py-3 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-stone-100 text-stone-700">
									{purchases.map((p) => {
										const isPaid = p.status === "paid";
										const isPending = p.status === "pending";

										return (
											<tr key={p.id} className="hover:bg-stone-50/50">
												<td className="px-4 py-3 font-mono text-[11px] text-stone-500">
													{p.id}
												</td>
												<td className="px-4 py-3 font-semibold text-stone-900">
													{p.templateName}
												</td>
												<td className="px-4 py-3 font-bold text-emerald-900">
													Rp {p.amount.toLocaleString("id-ID")}
												</td>
												<td className="px-4 py-3">
													{isPaid ? (
														<span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
															<CheckCircle2 className="size-3" />
															<span>Lunas</span>
														</span>
													) : isPending ? (
														<span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
															<Clock className="size-3" />
															<span>Menunggu</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-800 border border-red-200">
															<XCircle className="size-3" />
															<span>{p.status}</span>
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-stone-400 text-[11px]">
													{new Date(p.createdAt).toLocaleDateString("id-ID", {
														day: "numeric",
														month: "short",
														year: "numeric",
													})}
												</td>
												<td className="px-4 py-3 text-right">
													{isPending && p.paymentUrl ? (
														<a
															href={p.paymentUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 rounded-lg bg-emerald-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-colors"
														>
															<span>Bayar</span>
															<ExternalLink className="size-3" />
														</a>
													) : isPaid ? (
														<Link
															to="/dasbor/undangan"
															className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-700"
														>
															<span>Gunakan</span>
															<ArrowRight className="size-3" />
														</Link>
													) : (
														<span className="text-stone-300">-</span>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
