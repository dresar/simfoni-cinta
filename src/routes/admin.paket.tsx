import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchAdminSettings, updateAdminSettings } from "@/functions/settings";
import { PageHead, GlassCard, Pill, Field, TextInput } from "@/components/kit";
import {
	CreditCard,
	CheckCircle,
	Plus,
	Trash,
	ArrowCounterClockwise,
	FloppyDisk,
} from "@phosphor-icons/react";
import {
	useStore,
	DEFAULT_PACKAGES,
	type PricingPackage,
} from "@/store/appStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/paket")({
	loader: async () => {
		const settings = await fetchAdminSettings();
		return { settings };
	},
	head: () => ({
		meta: [
			{ title: "Manajemen Paket & Benefit — Admin Simfoni Cinta" },
			{
				name: "description",
				content:
					"Kustomisasi nama paket, harga, kuota, dan daftar benefit langganan undangan.",
			},
		],
	}),
	component: AdminPaketPage,
});

function AdminPaketPage() {
	const { settings } = Route.useLoaderData();
	const router = useRouter();
	const { packages, updatePackage, resetPackages } = useStore();
	const dbPackages =
		settings?.packages && settings.packages.length > 0
			? settings.packages
			: packages;
	const [selectedId, setSelectedId] = useState<PricingPackage["id"]>(
		"silver",
	);
	const [newFeatureText, setNewFeatureText] = useState("");
	const [saved, setSaved] = useState(false);

	const activePkg =
		dbPackages.find((p) => p.id === selectedId) || dbPackages[0];

	const [formData, setFormData] = useState<Partial<PricingPackage>>({
		name: activePkg.name,
		price: activePkg.price,
		originalPrice: activePkg.originalPrice ?? 75000,
		badge: activePkg.badge ?? "",
		popular: activePkg.popular ?? false,
		activeDuration: activePkg.activeDuration,
		maxPhotos: activePkg.maxPhotos,
		maxWaQuota: activePkg.maxWaQuota,
		hasLiveStream: activePkg.hasLiveStream,
		hasCustomMusic: activePkg.hasCustomMusic,
		hasStoryTimeline: activePkg.hasStoryTimeline,
		hasCustomDomain: activePkg.hasCustomDomain,
		features: [...activePkg.features],
	});

	useEffect(() => {
		const pkg = dbPackages.find((p) => p.id === selectedId) || dbPackages[0];
		setFormData({
			name: pkg.name,
			price: pkg.price,
			originalPrice: pkg.originalPrice ?? 75000,
			badge: pkg.badge ?? "",
			popular: pkg.popular ?? false,
			activeDuration: pkg.activeDuration,
			maxPhotos: pkg.maxPhotos,
			maxWaQuota: pkg.maxWaQuota,
			hasLiveStream: pkg.hasLiveStream,
			hasCustomMusic: pkg.hasCustomMusic,
			hasStoryTimeline: pkg.hasStoryTimeline,
			hasCustomDomain: pkg.hasCustomDomain,
			features: [...pkg.features],
		});
		setSaved(false);
	}, [selectedId]);

	const handlePriceChange = (val: string) => {
		const num = parseInt(val.replace(/\D/g, ""), 10) || 0;
		setFormData((prev) => ({ ...prev, price: num }));
	};

	const handleOriginalPriceChange = (val: string) => {
		const num = parseInt(val.replace(/\D/g, ""), 10) || 0;
		setFormData((prev) => ({ ...prev, originalPrice: num }));
	};

	const handleSave = async () => {
		const nextPackages = dbPackages.map((p) =>
			p.id === activePkg.id ? { ...p, ...formData } : p,
		);
		await updateAdminSettings({
			data: { ...settings, packages: nextPackages },
		});
		updatePackage(activePkg.id, formData);
		router.invalidate();
		setSaved(true);
		toast.success(
			`Setelan ${formData.name || activePkg.name} berhasil disimpan!`,
		);
		setTimeout(() => setSaved(false), 3000);
	};

	const handleReset = async () => {
		await updateAdminSettings({
			data: { ...settings, packages: DEFAULT_PACKAGES },
		});
		resetPackages();
		router.invalidate();
		toast.success("Paket direset ke setelan awal pabrik.");
	};

	const handleAddFeature = () => {
		if (!newFeatureText.trim()) return;
		const nextFeatures = [...(formData.features ?? []), newFeatureText.trim()];
		setFormData((prev) => ({ ...prev, features: nextFeatures }));
		setNewFeatureText("");
		toast.success("Benefit baru ditambahkan!");
	};

	const handleRemoveFeature = (idx: number) => {
		const nextFeatures = (formData.features ?? []).filter((_, i) => i !== idx);
		setFormData((prev) => ({ ...prev, features: nextFeatures }));
		toast.info("Benefit dihapus.");
	};

	return (
		<div className="space-y-6 max-w-6xl">
			<PageHead
				title="Manajemen Paket & Benefit"
				subtitle="Atur harga, nama paket, kuota undangan, dan benefit langganan pengantin secara dinamis"
			>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleReset}
						className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
					>
						<ArrowCounterClockwise className="size-4" />
						<span>Reset Default</span>
					</button>
					<Pill tone="gold">3 Paket Aktif</Pill>
				</div>
			</PageHead>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
				{dbPackages.map((pkg) => {
					const isEditing = pkg.id === selectedId;
					return (
						<div
							key={pkg.id}
							onClick={() => setSelectedId(pkg.id)}
							className={[
								"relative rounded-[10px] p-3.5 sm:p-4 border transition-all cursor-pointer flex flex-col justify-between shadow-xs",
								isEditing
									? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
									: "border-white/10 bg-[#0f141c] hover:border-white/20",
							].join(" ")}
						>
							<div className="space-y-2.5">
								<div className="flex items-center justify-between">
									<span className="font-serif font-bold text-sm sm:text-base text-white">
										{pkg.name}
									</span>
									{pkg.badge && (
										<span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
											{pkg.badge}
										</span>
									)}
								</div>

								<div className="flex items-baseline gap-1">
									<span className="font-mono text-xl sm:text-2xl font-extrabold text-white">
										Rp {pkg.price.toLocaleString("id-ID")}
									</span>
									<span className="text-[11px] text-white/50">/ paket</span>
								</div>

								<p className="text-[11px] text-white/60">
									Masa Aktif:{" "}
									<strong className="text-white">{pkg.activeDuration}</strong>
								</p>

								<div className="space-y-1 pt-2.5 border-t border-white/10 text-xs">
									{pkg.features.slice(0, 4).map((f) => (
										<div
											key={f}
											className="flex items-start gap-1.5 text-white/70 text-[11px]"
										>
											<CheckCircle
												weight="fill"
												className="size-3.5 shrink-0 text-emerald-400 mt-0.5"
											/>
											<span className="truncate">{f}</span>
										</div>
									))}
									{pkg.features.length > 4 && (
										<p className="text-[10px] text-amber-400 font-medium">
											+{pkg.features.length - 4} benefit lainnya...
										</p>
									)}
								</div>
							</div>

							<div className="pt-3 mt-3 border-t border-white/10">
								<button
									type="button"
									className={[
										"w-full rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
										isEditing
											? "bg-amber-600 text-white"
											: "bg-white/5 text-white/60 hover:bg-white/10",
									].join(" ")}
								>
									{isEditing ? "Sedang Diedit" : "Pilih & Edit Paket"}
								</button>
							</div>
						</div>
					);
				})}
			</div>

			<GlassCard className="p-3.5 sm:p-4 space-y-4 border border-white/10 bg-[#0f141c]">
				<div className="flex items-center justify-between pb-3 border-b border-white/10">
					<div>
						<h3 className="font-serif font-bold text-sm sm:text-base text-white flex items-center gap-2">
							<CreditCard weight="duotone" className="size-4 text-amber-400" />
							Editor Paket:{" "}
							<span className="text-amber-400">{activePkg.name}</span>
						</h3>
						<p className="text-[11px] text-white/50 mt-0.5">
							Perubahan harga dan benefit langsung otomatis diterapkan pada
							halaman pembelian dasbor pengguna.
						</p>
					</div>
					<button
						type="button"
						onClick={handleSave}
						className={[
							"flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer",
							saved
								? "bg-emerald-600 hover:bg-emerald-500"
								: "bg-amber-600 hover:bg-amber-500",
						].join(" ")}
					>
						<FloppyDisk className="size-3.5" />
						<span>{saved ? "Tersimpan!" : "Simpan Perubahan"}</span>
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
					<Field label="Nama Paket">
						<TextInput
							value={formData.name ?? ""}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Contoh: Paket Silver"
						/>
					</Field>

					<Field label="Harga Promo (Rp)">
						<TextInput
							type="text"
							value={(formData.price ?? 0).toLocaleString("id-ID")}
							onChange={(e) => handlePriceChange(e.target.value)}
							placeholder="15000"
						/>
					</Field>

					<Field label="Harga Asli / Coret (Rp)">
						<TextInput
							type="text"
							value={(formData.originalPrice ?? 0).toLocaleString("id-ID")}
							onChange={(e) => handleOriginalPriceChange(e.target.value)}
							placeholder="75000"
						/>
					</Field>

					<Field label="Badge Promosi (Opsional)">
						<TextInput
							value={formData.badge ?? ""}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, badge: e.target.value }))
							}
							placeholder="Contoh: Favorit / Terlaris"
						/>
					</Field>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-white/10">
					<Field label="Masa Aktif Undangan">
						<TextInput
							value={formData.activeDuration ?? ""}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									activeDuration: e.target.value,
								}))
							}
							placeholder="Contoh: 1 Tahun / 3 Tahun / Selamanya"
						/>
					</Field>

					<Field label="Kuota Foto Galeri">
						<TextInput
							value={String(formData.maxPhotos ?? "")}
							onChange={(e) => {
								const v = e.target.value.toLowerCase();
								setFormData((prev) => ({
									...prev,
									maxPhotos:
										v === "unlimited"
											? "unlimited"
											: parseInt(v.replace(/\D/g, ""), 10) || 0,
								}));
							}}
							placeholder="Contoh: 10 atau unlimited"
						/>
					</Field>

					<Field label="Kuota Sebar WA">
						<TextInput
							value={String(formData.maxWaQuota ?? "")}
							onChange={(e) => {
								const v = e.target.value.toLowerCase();
								setFormData((prev) => ({
									...prev,
									maxWaQuota:
										v === "unlimited"
											? "unlimited"
											: parseInt(v.replace(/\D/g, ""), 10) || 0,
								}));
							}}
							placeholder="Contoh: 50 atau unlimited"
						/>
					</Field>
				</div>

				<div className="pt-4 border-t border-white/10 space-y-2">
					<label className="text-xs font-semibold uppercase tracking-wide text-white/60">
						Toggle Fitur Spesial
					</label>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
						<label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.popular ?? false}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										popular: e.target.checked,
									}))
								}
								className="rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500"
							/>
							Paket Populer
						</label>

						<label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.hasLiveStream ?? false}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										hasLiveStream: e.target.checked,
									}))
								}
								className="rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500"
							/>
							Live Streaming
						</label>

						<label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.hasCustomMusic ?? false}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										hasCustomMusic: e.target.checked,
									}))
								}
								className="rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500"
							/>
							Musik Bebas
						</label>

						<label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.hasStoryTimeline ?? false}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										hasStoryTimeline: e.target.checked,
									}))
								}
								className="rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500"
							/>
							Cerita Cinta
						</label>

						<label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.hasCustomDomain ?? false}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										hasCustomDomain: e.target.checked,
									}))
								}
								className="rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500"
							/>
							Domain Kustom
						</label>
					</div>
				</div>

				<div className="space-y-3 pt-4 border-t border-white/10">
					<div className="flex items-center justify-between">
						<h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
							Daftar Benefit & Keunggulan ({activePkg.features.length})
						</h4>
					</div>

					<div className="space-y-2">
						{(formData.features ?? []).map((feat, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white"
							>
								<div className="flex items-center gap-2 min-w-0">
									<CheckCircle
										weight="fill"
										className="size-4 text-emerald-400 shrink-0"
									/>
									<input
										type="text"
										value={feat}
										onChange={(e) => {
											const next = [...(formData.features ?? [])];
											next[idx] = e.target.value;
											setFormData((prev) => ({ ...prev, features: next }));
										}}
										className="bg-transparent border-none outline-none text-xs text-white w-full"
									/>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveFeature(idx)}
									className="flex size-6 items-center justify-center rounded-lg text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
								>
									<Trash className="size-3.5" />
								</button>
							</div>
						))}
					</div>

					<div className="flex items-center gap-2 pt-2">
						<input
							type="text"
							value={newFeatureText}
							onChange={(e) => setNewFeatureText(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
							placeholder="Ketik benefit baru lalu klik Tambah..."
							className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500"
						/>
						<button
							type="button"
							onClick={handleAddFeature}
							className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
						>
							<Plus className="size-4" />
							<span>Tambah Benefit</span>
						</button>
					</div>
				</div>
			</GlassCard>
		</div>
	);
}
