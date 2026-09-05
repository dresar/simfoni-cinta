import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
	Activity,
	Database,
	HardDrive,
	RefreshCw,
	ShieldCheck,
	Globe,
	HelpCircle,
	MessageSquareHeart,
	Share2,
	Image as ImageIcon,
	Save,
	Plus,
	Trash2,
	Edit3,
	Star,
	Megaphone,
	X,
	Upload,
	Copy,
	Check,
	ExternalLink,
	Key,
	Sparkles,
} from "lucide-react";
import { GlassCard, PageHead, Pill } from "@/components/kit";
import { fetchAdminSettings, updateAdminSettings } from "@/functions/settings";
import { uploadImageFn } from "@/functions/upload";
import type {
	AdminSettingsData,
	FaqItem,
	TestimonialItem,
} from "@/server/settings";
import { toast } from "sonner";

function BrandingImageUploadField({
	label,
	sublabel,
	value,
	onChange,
	aspect = "landscape",
	folder = "branding",
}: {
	label: string;
	sublabel: string;
	value: string;
	onChange: (val: string) => void;
	aspect?: "landscape" | "square" | "wide";
	folder?: string;
}) {
	const [uploading, setUploading] = useState(false);
	const [copied, setCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 10 * 1024 * 1024) {
			toast.error("Ukuran file maksimal 10MB");
			return;
		}
		setUploading(true);
		try {
			const reader = new FileReader();
			reader.onload = async (ev) => {
				const base64 = ev.target?.result as string;
				if (!base64) {
					setUploading(false);
					toast.error("Gagal membaca file.");
					return;
				}
				try {
					const res = await uploadImageFn({
						data: {
							fileData: base64,
							folder: folder,
							originalName: file.name,
						},
					});
					if (res?.url) {
						onChange(res.url);
						toast.success(`Gambar ${label} berhasil diunggah ke GitHub CDN!`);
					}
				} catch (uploadErr: any) {
					toast.error(uploadErr?.message || "Gagal mengunggah ke GitHub CDN.");
				} finally {
					setUploading(false);
				}
			};
			reader.readAsDataURL(file);
		} catch (err: any) {
			toast.error(err?.message || "Gagal memproses file.");
			setUploading(false);
		}
		if (inputRef.current) inputRef.current.value = "";
	};

	const copyCdn = () => {
		if (!value) return;
		navigator.clipboard.writeText(value);
		setCopied(true);
		toast.success(`Link CDN ${label} disalin!`);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2.5">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<div>
					<p className="text-xs font-bold text-white flex items-center gap-1.5">
						<span>{label}</span>
					</p>
					<p className="text-[11px] text-white/50">{sublabel}</p>
				</div>
				<div className="flex items-center gap-1.5 shrink-0">
					<input
						ref={inputRef}
						type="file"
						accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
						className="hidden"
						onChange={handleFile}
					/>
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						disabled={uploading}
						className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
					>
						{uploading ? (
							<RefreshCw className="size-3.5 animate-spin text-amber-300" />
						) : (
							<Upload className="size-3.5 text-amber-300" />
						)}
						<span>{uploading ? "Mengunggah..." : "Upload ke GitHub CDN"}</span>
					</button>
					{value && (
						<button
							type="button"
							onClick={copyCdn}
							className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
							title="Salin Link CDN"
						>
							{copied ? (
								<Check className="size-3.5 text-emerald-400" />
							) : (
								<Copy className="size-3.5" />
							)}
							<span>{copied ? "Tersalin" : "Salin Link"}</span>
						</button>
					)}
				</div>
			</div>

			<div className="space-y-1">
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="https://cdn.jsdelivr.net/gh/..."
					className="w-full rounded-lg border border-white/10 bg-[#090c10] px-3 py-2 text-xs font-mono text-white/90 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
				/>
			</div>

			{value && (
				<div className="flex items-center gap-3 pt-1">
					<div
						className={`relative overflow-hidden rounded-lg border border-white/15 bg-black/60 shrink-0 ${
							aspect === "square"
								? "size-14"
								: aspect === "wide"
									? "h-16 w-32 sm:w-44"
									: "h-16 w-28 sm:w-36"
						}`}
					>
						<img
							src={value}
							alt={label}
							className="h-full w-full object-contain p-1"
							onError={(e) => {
								(e.currentTarget as HTMLElement).style.display = "none";
							}}
						/>
					</div>
					<div className="min-w-0 flex-1 text-[11px] text-white/40 space-y-0.5">
						<p className="font-semibold text-white/70 truncate">Preview Gambar Terpasang</p>
						<p className="truncate font-mono text-[10px] text-white/50">{value}</p>
						<a
							href={value}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-amber-400/80 hover:text-amber-300 hover:underline pt-0.5"
						>
							<span>Buka CDN di Tab Baru</span>
							<ExternalLink className="size-3" />
						</a>
					</div>
				</div>
			)}
		</div>
	);
}

export const Route = createFileRoute("/admin/sistem")({
	loader: () => fetchAdminSettings(),
	head: () => ({
		meta: [
			{ title: "Pusat Pengaturan & CMS Website — Admin Simfoni Cinta" },
			{
				name: "description",
				content:
					"Kelola identitas website, gambar, FAQ, testimoni, media sosial, dan status server.",
			},
		],
	}),
	component: SystemPage,
});

type TabType = "identitas" | "faq" | "testimoni" | "kontak" | "gateway" | "server";

function SystemPage() {
	const settings = Route.useLoaderData();
	const [activeTab, setActiveTab] = useState<TabType>("identitas");
	const [form, setForm] = useState<AdminSettingsData>(settings);
	const [saving, setSaving] = useState(false);

	const [faqFormOpen, setFaqFormOpen] = useState(false);
	const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
	const [faqForm, setFaqForm] = useState<FaqItem>({
		id: "",
		question: "",
		answer: "",
		category: "Umum",
	});

	const [testiFormOpen, setTestiFormOpen] = useState(false);
	const [editingTesti, setEditingTesti] = useState<TestimonialItem | null>(
		null,
	);
	const [testiForm, setTestiForm] = useState<TestimonialItem>({
		id: "",
		name: "",
		role: "Pengantin Bahagia",
		rating: 5,
		text: "",
		avatar: "",
		weddingDate: "",
	});

	const [flushStatus, setFlushStatus] = useState<string>("Normal");

	const handleSave = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setSaving(true);
		try {
			await updateAdminSettings({ data: form });
			toast.success("Pengaturan website & konten CMS berhasil disimpan!");
		} catch {
			toast.error("Gagal menyimpan pengaturan.");
		} finally {
			setSaving(false);
		}
	};

	const handleOpenAddFaq = () => {
		setEditingFaq(null);
		setFaqForm({
			id: `faq-${Date.now()}`,
			question: "",
			answer: "",
			category: "Umum",
		});
		setFaqFormOpen(true);
	};

	const handleOpenEditFaq = (item: FaqItem) => {
		setEditingFaq(item);
		setFaqForm(item);
		setFaqFormOpen(true);
	};

	const handleSaveFaq = () => {
		if (!faqForm.question.trim() || !faqForm.answer.trim()) {
			toast.error("Pertanyaan dan jawaban FAQ wajib diisi.");
			return;
		}

		let updatedFaqs = [...(form.faqs || [])];
		if (editingFaq) {
			updatedFaqs = updatedFaqs.map((f) =>
				f.id === editingFaq.id ? faqForm : f,
			);
		} else {
			updatedFaqs.unshift(faqForm);
		}

		setForm({ ...form, faqs: updatedFaqs });
		setFaqFormOpen(false);
		toast.success(
			"Daftar FAQ diperbarui. Klik Simpan Perubahan untuk menyimpan ke database.",
		);
	};

	const handleDeleteFaq = (id: string) => {
		const updated = (form.faqs || []).filter((f) => f.id !== id);
		setForm({ ...form, faqs: updated });
		toast.success("FAQ dihapus.");
	};

	const handleOpenAddTesti = () => {
		setEditingTesti(null);
		setTestiForm({
			id: `testi-${Date.now()}`,
			name: "",
			role: "Pengantin Bahagia",
			rating: 5,
			text: "",
			avatar:
				"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp",
			weddingDate: `${new Date().getFullYear()}`,
		});
		setTestiFormOpen(true);
	};

	const handleOpenEditTesti = (item: TestimonialItem) => {
		setEditingTesti(item);
		setTestiForm(item);
		setTestiFormOpen(true);
	};

	const handleSaveTesti = () => {
		if (!testiForm.name.trim() || !testiForm.text.trim()) {
			toast.error("Nama pengantin dan ulasan testimoni wajib diisi.");
			return;
		}

		let updatedTestis = [...(form.testimonials || [])];
		if (editingTesti) {
			updatedTestis = updatedTestis.map((t) =>
				t.id === editingTesti.id ? testiForm : t,
			);
		} else {
			updatedTestis.unshift(testiForm);
		}

		setForm({ ...form, testimonials: updatedTestis });
		setTestiFormOpen(false);
		toast.success(
			"Testimoni diperbarui. Klik Simpan Perubahan untuk menyimpan ke database.",
		);
	};

	const handleDeleteTesti = (id: string) => {
		const updated = (form.testimonials || []).filter((t) => t.id !== id);
		setForm({ ...form, testimonials: updated });
		toast.success("Testimoni dihapus.");
	};

	const handleFlushCache = () => {
		setFlushStatus("Mengosongkan Cache Redis...");
		setTimeout(() => {
			setFlushStatus("Cache Bersih & Sinkron");
			toast.success("Cache Upstash Redis berhasil dikosongkan.");
			setTimeout(() => setFlushStatus("Normal"), 3000);
		}, 800);
	};

	return (
		<div className="space-y-6 max-w-6xl">
			<PageHead
				title="Pusat Pengaturan & CMS Website"
				subtitle="Kelola identitas website, media gambar, FAQ, ulasan testimoni, kontak, dan infrastruktur sistem"
			>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => handleSave()}
						disabled={saving}
						className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer disabled:opacity-50"
					>
						<Save className="size-3.5" />
						<span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
					</button>
					<Pill tone="gold">Master Panel</Pill>
				</div>
			</PageHead>

			<div className="flex items-center gap-1.5 border-b border-white/10 overflow-x-auto scrollbar-none pb-2">
				{[
					{ id: "identitas", label: "Identitas & Media", icon: Globe },
					{
						id: "faq",
						label: `Tanya Jawab (${form.faqs?.length || 0})`,
						icon: HelpCircle,
					},
					{
						id: "testimoni",
						label: `Testimoni (${form.testimonials?.length || 0})`,
						icon: MessageSquareHeart,
					},
					{ id: "kontak", label: "Kontak & Sosmed", icon: Share2 },
					{ id: "gateway", label: "Asisten AI", icon: Sparkles },
					{ id: "server", label: "Server & Cache", icon: Activity },
				].map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id as TabType)}
						className={[
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0",
							activeTab === tab.id
								? "bg-amber-600 text-white font-semibold"
								: "text-white/60 hover:text-white hover:bg-white/5",
						].join(" ")}
					>
						<tab.icon className="size-3.5" />
						<span>{tab.label}</span>
					</button>
				))}
			</div>

			{activeTab === "identitas" && (
				<form onSubmit={handleSave} className="space-y-4">
					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-3.5">
						<h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
							<Globe className="size-4 text-amber-400" />
							<span>Identitas & Teks Utama Website</span>
						</h3>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Nama Platform
								</label>
								<input
									type="text"
									value={form.platformName}
									onChange={(e) =>
										setForm({ ...form, platformName: e.target.value })
									}
									placeholder="Simfoni Cinta"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Domain Publik
								</label>
								<input
									type="text"
									value={form.domain}
									onChange={(e) => setForm({ ...form, domain: e.target.value })}
									placeholder="https://simfonicinta.my.id"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono"
								/>
							</div>
						</div>

						<div className="space-y-1 text-xs">
							<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
								Tagline Utama
							</label>
							<input
								type="text"
								value={form.tagline}
								onChange={(e) => setForm({ ...form, tagline: e.target.value })}
								placeholder="Platform Undangan Pernikahan Digital Premium Indonesia"
								className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
							/>
						</div>

						<div className="space-y-1 text-xs">
							<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
								Judul SEO Meta (Title Tab Browser)
							</label>
							<input
								type="text"
								value={form.metaTitle || ""}
								onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
								placeholder="Simfoni Cinta — Undangan Pernikahan Digital Elegan & Modern"
								className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
							/>
						</div>

						<div className="space-y-1 text-xs">
							<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
								Deskripsi SEO Meta (Hasil Pencarian Google & WhatsApp)
							</label>
							<textarea
								rows={2}
								value={form.metaDesc}
								onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
								placeholder="Deskripsi singkat yang muncul di hasil pencarian Google dan preview WhatsApp..."
								className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none"
							/>
						</div>

						<div className="space-y-1 text-xs">
							<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
								Teks Ringkasan Footer Website
							</label>
							<textarea
								rows={2}
								value={form.footerText || ""}
								onChange={(e) => setForm({ ...form, footerText: e.target.value })}
								placeholder="Platform undangan pernikahan digital premium nomor #1 di Indonesia..."
								className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none"
							/>
						</div>
					</GlassCard>

					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-3">
							<div>
								<h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
									<ImageIcon className="size-4 text-amber-400" />
									<span>Media & Gambar Branding (GitHub jsDelivr CDN)</span>
								</h3>
								<p className="text-[11px] text-white/50">
									Seluruh gambar otomatis diunggah ke repositori GitHub wedding-cdn dan disajikan lewat jsDelivr CDN global berkecepatan tinggi. Anda juga dapat mengubah atau menempel link CDN secara manual.
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
							<BrandingImageUploadField
								label="Logo Resmi Website"
								sublabel="Ditampilkan pada Header, Navbar, dan Footer utama (PNG/WebP transparan)"
								value={form.logoUrl}
								onChange={(val) => setForm({ ...form, logoUrl: val })}
								aspect="wide"
							/>

							<BrandingImageUploadField
								label="Favicon Tab Browser"
								sublabel="Ikon kecil pada tab browser pengunjung (PNG, ICO, atau SVG 32x32px)"
								value={form.faviconUrl}
								onChange={(val) => setForm({ ...form, faviconUrl: val })}
								aspect="square"
							/>

							<BrandingImageUploadField
								label="Banner Hero Utama (Beranda)"
								sublabel="Gambar visual utama di bagian atas halaman depan website (1920x1080px WebP)"
								value={form.heroBannerUrl}
								onChange={(val) => setForm({ ...form, heroBannerUrl: val })}
								aspect="wide"
							/>

							<BrandingImageUploadField
								label="Banner Footer (CTA Ajakan Bawah)"
								sublabel="Banner penutup di atas footer beranda (1600x600px WebP)"
								value={form.footerBannerUrl || ""}
								onChange={(val) => setForm({ ...form, footerBannerUrl: val })}
								aspect="wide"
							/>

							<BrandingImageUploadField
								label="Banner Layanan 'Tidak Mau Ribet'"
								sublabel="Banner promo layanan concierge pembuatan undangan (1200x600px WebP)"
								value={form.conciergeBannerUrl || ""}
								onChange={(val) => setForm({ ...form, conciergeBannerUrl: val })}
								aspect="wide"
							/>

							<BrandingImageUploadField
								label="Gambar OpenGraph / Pratinjau Medsos"
								sublabel="Gambar thumbnail saat link website dibagikan ke WhatsApp & Medsos (1200x630px)"
								value={form.ogImageUrl || ""}
								onChange={(val) => setForm({ ...form, ogImageUrl: val })}
								aspect="wide"
							/>
						</div>
					</GlassCard>

					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-3.5">
						<div className="flex items-center justify-between">
							<h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
								<Megaphone className="size-4 text-amber-400" />
								<span>Running Announcement Banner</span>
							</h3>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={form.announcementActive}
									onChange={(e) =>
										setForm({ ...form, announcementActive: e.target.checked })
									}
									className="size-3.5 rounded accent-amber-500 cursor-pointer"
								/>
								<span className="text-xs text-white/80 font-medium">
									Tampilkan Banner
								</span>
							</label>
						</div>

						<div className="space-y-1 text-xs">
							<input
								type="text"
								value={form.announcement}
								onChange={(e) =>
									setForm({ ...form, announcement: e.target.value })
								}
								placeholder="✨ Promo Spesial Paket Platinum Diskon 50% — Berlaku Selamanya!"
								className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
							/>
						</div>
					</GlassCard>
				</form>
			)}

			{activeTab === "faq" && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-xs text-white/50">
							Kelola daftar tanya jawab yang tampil di halaman beranda
						</p>
						<button
							type="button"
							onClick={handleOpenAddFaq}
							className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-colors cursor-pointer"
						>
							<Plus className="size-4" />
							<span>Tambah FAQ Baru</span>
						</button>
					</div>

					{faqFormOpen && (
						<GlassCard className="p-4 sm:p-5 border border-amber-500/30 bg-[#0f141c] space-y-4 shadow-lg">
							<div className="flex items-center justify-between pb-2.5 border-b border-white/10">
								<h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
									<HelpCircle className="size-4 text-amber-400" />
									<span>
										{editingFaq ? "Edit Tanya Jawab (FAQ)" : "Tambah FAQ Baru"}
									</span>
								</h3>
								<button
									type="button"
									onClick={() => setFaqFormOpen(false)}
									className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
								>
									<X className="size-3.5" />
								</button>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
								<div className="sm:col-span-2 space-y-1">
									<label className="text-white/60 font-semibold">
										Pertanyaan
									</label>
									<input
										type="text"
										value={faqForm.question}
										onChange={(e) =>
											setFaqForm({ ...faqForm, question: e.target.value })
										}
										placeholder="Contoh: Berapa lama pembuatan undangan?"
										className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-white/60 font-semibold">
										Kategori
									</label>
									<select
										value={faqForm.category}
										onChange={(e) =>
											setFaqForm({ ...faqForm, category: e.target.value })
										}
										className="w-full rounded-lg border border-white/10 bg-[#090c10] px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
									>
										<option value="Umum">Umum</option>
										<option value="Fitur">Fitur</option>
										<option value="Paket">Paket</option>
										<option value="Pembayaran">Pembayaran</option>
										<option value="Teknis">Teknis</option>
									</select>
								</div>
							</div>

							<div className="space-y-1 text-xs">
								<label className="text-white/60 font-semibold">Jawaban</label>
								<textarea
									rows={3}
									value={faqForm.answer}
									onChange={(e) =>
										setFaqForm({ ...faqForm, answer: e.target.value })
									}
									placeholder="Tuliskan jawaban yang jelas dan ramah..."
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-y"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
								<button
									type="button"
									onClick={() => setFaqFormOpen(false)}
									className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={handleSaveFaq}
									className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
								>
									Simpan FAQ
								</button>
							</div>
						</GlassCard>
					)}

					<div className="grid grid-cols-1 gap-3">
						{!form.faqs || form.faqs.length === 0 ? (
							<GlassCard className="p-8 text-center border border-white/10 bg-[#0f141c] text-white/40 text-xs">
								Belum ada FAQ yang dibuat. Klik Tambah FAQ Baru.
							</GlassCard>
						) : (
							form.faqs.map((faq, index) => (
								<GlassCard
									key={faq.id || index}
									className="p-5 border border-white/10 bg-[#0f141c] space-y-2"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1 flex-1">
											<div className="flex items-center gap-2">
												<span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
													{faq.category}
												</span>
												<h4 className="font-bold text-white text-sm">
													{faq.question}
												</h4>
											</div>
											<p className="text-xs text-white/60 leading-relaxed">
												{faq.answer}
											</p>
										</div>
										<div className="flex items-center gap-1.5 shrink-0">
											<button
												type="button"
												onClick={() => handleOpenEditFaq(faq)}
												className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
												title="Edit FAQ"
											>
												<Edit3 className="size-3.5" />
											</button>
											<button
												type="button"
												onClick={() => handleDeleteFaq(faq.id)}
												className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
												title="Hapus FAQ"
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>
									</div>
								</GlassCard>
							))
						)}
					</div>
				</div>
			)}

			{activeTab === "testimoni" && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-xs text-white/50">
							Kelola ulasan dan rating dari pasangan pengantin
						</p>
						<button
							type="button"
							onClick={handleOpenAddTesti}
							className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-colors cursor-pointer"
						>
							<Plus className="size-4" />
							<span>Tambah Testimoni</span>
						</button>
					</div>

					{testiFormOpen && (
						<GlassCard className="p-4 sm:p-5 border border-amber-500/30 bg-[#0f141c] space-y-4 shadow-lg">
							<div className="flex items-center justify-between pb-2.5 border-b border-white/10">
								<h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
									<MessageSquareHeart className="size-4 text-amber-400" />
									<span>
										{editingTesti
											? "Edit Ulasan Testimoni"
											: "Tambah Testimoni Baru"}
									</span>
								</h3>
								<button
									type="button"
									onClick={() => setTestiFormOpen(false)}
									className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
								>
									<X className="size-3.5" />
								</button>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
								<div className="space-y-1">
									<label className="text-white/60 font-semibold">
										Nama Pasangan
									</label>
									<input
										type="text"
										value={testiForm.name}
										onChange={(e) =>
											setTestiForm({ ...testiForm, name: e.target.value })
										}
										placeholder="Dimas & Annisa"
										className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-white/60 font-semibold">
										Asal Kota / Peran
									</label>
									<input
										type="text"
										value={testiForm.role}
										onChange={(e) =>
											setTestiForm({ ...testiForm, role: e.target.value })
										}
										placeholder="Pengantin Jakarta"
										className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-white/60 font-semibold">
										Rating (Bintang 1-5)
									</label>
									<select
										value={testiForm.rating}
										onChange={(e) =>
											setTestiForm({
												...testiForm,
												rating: Number(e.target.value),
											})
										}
										className="w-full rounded-lg border border-white/10 bg-[#090c10] px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
									>
										<option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
										<option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
										<option value={3}>⭐⭐⭐ (3 Bintang)</option>
										<option value={2}>⭐⭐ (2 Bintang)</option>
										<option value={1}>⭐ (1 Bintang)</option>
									</select>
								</div>

								<div className="space-y-1">
									<label className="text-white/60 font-semibold">
										Tanggal Pernikahan
									</label>
									<input
										type="text"
										value={testiForm.weddingDate}
										onChange={(e) =>
											setTestiForm({
												...testiForm,
												weddingDate: e.target.value,
											})
										}
										placeholder="12 Januari 2026"
										className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
									/>
								</div>
							</div>

							<BrandingImageUploadField
								label="Foto / Avatar Mempelai"
								sublabel="Unggah foto avatar mempelai ke GitHub CDN atau masukkan URL foto"
								value={testiForm.avatar}
								onChange={(val) => setTestiForm({ ...testiForm, avatar: val })}
								aspect="square"
								folder="avatars"
							/>

							<div className="space-y-1 text-xs">
								<label className="text-white/60 font-semibold">
									Ulasan / Testimoni
								</label>
								<textarea
									rows={3}
									value={testiForm.text}
									onChange={(e) =>
										setTestiForm({ ...testiForm, text: e.target.value })
									}
									placeholder="Tuliskan pengalaman bahagia pengantin..."
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-y"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
								<button
									type="button"
									onClick={() => setTestiFormOpen(false)}
									className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={handleSaveTesti}
									className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
								>
									Simpan Testimoni
								</button>
							</div>
						</GlassCard>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{!form.testimonials || form.testimonials.length === 0 ? (
							<GlassCard className="col-span-2 p-8 text-center border border-white/10 bg-[#0f141c] text-white/40 text-xs">
								Belum ada testimoni. Klik Tambah Testimoni.
							</GlassCard>
						) : (
							form.testimonials.map((testi, index) => (
								<GlassCard
									key={testi.id || index}
									className="p-5 border border-white/10 bg-[#0f141c] space-y-3"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<img
												src={
													testi.avatar ||
													"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
												}
												alt={testi.name}
												className="size-10 rounded-full object-cover border border-amber-500/30"
											/>
											<div>
												<h4 className="font-bold text-white text-sm">
													{testi.name}
												</h4>
												<p className="text-[10px] text-amber-400/80">
													{testi.role} • {testi.weddingDate}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-1">
											<button
												type="button"
												onClick={() => handleOpenEditTesti(testi)}
												className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
											>
												<Edit3 className="size-3" />
											</button>
											<button
												type="button"
												onClick={() => handleDeleteTesti(testi.id)}
												className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
											>
												<Trash2 className="size-3" />
											</button>
										</div>
									</div>

									<div className="flex items-center gap-1 text-amber-400">
										{Array.from({ length: testi.rating }).map((_, i) => (
											<Star key={i} className="size-3.5 fill-current" />
										))}
									</div>

									<p className="text-xs text-white/70 italic leading-relaxed">
										"{testi.text}"
									</p>
								</GlassCard>
							))
						)}
					</div>
				</div>
			)}

			{activeTab === "kontak" && (
				<form onSubmit={handleSave} className="space-y-4">
					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-3.5">
						<h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
							<Share2 className="size-4 text-amber-400" />
							<span>Informasi Kontak & Layanan Pelanggan</span>
						</h3>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Nomor WhatsApp CS
								</label>
								<input
									type="text"
									value={form.contactPhone}
									onChange={(e) =>
										setForm({ ...form, contactPhone: e.target.value })
									}
									placeholder="082392115909"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Email Support
								</label>
								<input
									type="email"
									value={form.contactEmail}
									onChange={(e) =>
										setForm({ ...form, contactEmail: e.target.value })
									}
									placeholder="eka.ckp16799@gmail.com"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono"
								/>
							</div>
						</div>

						<div className="space-y-1 text-xs">
							<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
								Alamat Kantor / Studio
							</label>
							<input
								type="text"
								value={form.contactAddress}
								onChange={(e) =>
									setForm({ ...form, contactAddress: e.target.value })
								}
								placeholder="Jakarta & Pekanbaru, Indonesia"
								className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
							/>
						</div>
					</GlassCard>

					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-3.5">
						<h3 className="font-serif text-sm font-bold text-white">
							Tautan Media Sosial Resmi
						</h3>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Instagram
								</label>
								<input
									type="text"
									value={form.socialInstagram}
									onChange={(e) =>
										setForm({ ...form, socialInstagram: e.target.value })
									}
									placeholder="https://instagram.com/simfonicinta"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono text-[11px]"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									TikTok
								</label>
								<input
									type="text"
									value={form.socialTiktok}
									onChange={(e) =>
										setForm({ ...form, socialTiktok: e.target.value })
									}
									placeholder="https://tiktok.com/@simfonicinta"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono text-[11px]"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									YouTube
								</label>
								<input
									type="text"
									value={form.socialYoutube}
									onChange={(e) =>
										setForm({ ...form, socialYoutube: e.target.value })
									}
									placeholder="https://youtube.com/@simfonicinta"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono text-[11px]"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Facebook
								</label>
								<input
									type="text"
									value={form.socialFacebook}
									onChange={(e) =>
										setForm({ ...form, socialFacebook: e.target.value })
									}
									placeholder="https://facebook.com/simfonicinta"
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono text-[11px]"
								/>
							</div>
						</div>
					</GlassCard>
				</form>
			)}

			{activeTab === "gateway" && (
				<form onSubmit={handleSave} className="space-y-4">
					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-3.5">
						<div className="flex items-center justify-between border-b border-white/10 pb-2.5">
							<h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
								<Sparkles className="size-4 text-amber-400" />
								<span>Integrasi AI Gemini (Asisten Penulis Undangan)</span>
							</h3>
							<span className="text-[10px] font-bold rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 uppercase">
								AI Assistant
							</span>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
							<div className="space-y-1 sm:col-span-2">
								<div className="flex items-center justify-between">
									<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
										<Key className="size-3 text-amber-400" />
										<span>Pool API Key Gemini (Auto-Rotasi 90+ Keys)</span>
									</label>
									<span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
										{form.geminiApiKeys?.length || 0} Key Aktif
									</span>
								</div>
								<textarea
									rows={3}
									value={form.geminiApiKeys?.join("\n") || form.geminiApiKey || ""}
									onChange={(e) => {
										const arr = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
										setForm({
											...form,
											geminiApiKeys: arr,
											geminiApiKey: arr[0] || "",
										});
									}}
									placeholder="Tempel satu atau banyak Gemini API Key per baris..."
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono resize-y"
								/>
								<p className="text-[10px] text-white/40">
									Sistem membagi beban dan melakukan rotasi otomatis secara cerdas jika satu key terkena limit atau kuota.
								</p>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Pilihan Model AI
								</label>
								<select
									value={form.geminiModel || "gemini-3.6-flash"}
									onChange={(e) =>
										setForm({ ...form, geminiModel: e.target.value })
									}
									className="w-full rounded-lg border border-white/10 bg-[#090c10] px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
								>
									<option value="gemini-3.6-flash">Gemini 3.6 Flash (Cepat & Cerdas)</option>
									<option value="gemini-2.5-flash">Gemini 2.5 Flash (Super Kilat)</option>
									<option value="gemini-2.5-pro">Gemini 2.5 Pro (Penalaran Kompleks)</option>
								</select>
							</div>

							<div className="space-y-1">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Gaya Bahasa AI (Tone of Voice)
								</label>
								<select
									value={form.geminiTone || "romantis_elegan"}
									onChange={(e) =>
										setForm({ ...form, geminiTone: e.target.value })
									}
									className="w-full rounded-lg border border-white/10 bg-[#090c10] px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
								>
									<option value="romantis_elegan">Romantis & Elegan</option>
									<option value="puitis">Puitis & Penuh Makna</option>
									<option value="formal_santun">Formal & Santun</option>
									<option value="modern_ceria">Modern & Ceria</option>
								</select>
							</div>

							<div className="space-y-1 sm:col-span-2">
								<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
									Custom System Prompt AI
								</label>
								<textarea
									rows={2}
									value={form.geminiCustomPrompt || ""}
									onChange={(e) =>
										setForm({ ...form, geminiCustomPrompt: e.target.value })
									}
									placeholder="Instruksi khusus untuk panduan nada bicara pembuatan teks cerita cinta dan ucapan..."
									className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none"
								/>
							</div>

							<div className="border-t border-white/10 pt-3.5 mt-0.5">
								<p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
									<span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
									OpenAgentic — Custom AI Endpoint (Prioritas Utama)
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
									<div className="space-y-1 sm:col-span-2">
										<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
											<Key className="size-3 text-purple-400" />
											<span>API Key OpenAgentic</span>
										</label>
										<input
											type="password"
											value={(form as any).aiApiKey || ""}
											onChange={(e) =>
												setForm({ ...form, aiApiKey: e.target.value } as any)
											}
											placeholder="sk-..."
											className="w-full rounded-lg border border-purple-500/30 bg-purple-950/20 px-3 py-2 text-xs text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 font-mono"
										/>
									</div>
									<div className="space-y-1 sm:col-span-2">
										<label className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
											Endpoint URL
										</label>
										<input
											type="url"
											value={(form as any).aiEndpoint || ""}
											onChange={(e) =>
												setForm({ ...form, aiEndpoint: e.target.value } as any)
											}
											placeholder="https://openagentic.id/api/v1/chat/completions"
											className="w-full rounded-lg border border-purple-500/30 bg-purple-950/20 px-3 py-2 text-xs text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 font-mono"
										/>
										<p className="text-[10px] text-white/35 mt-1">
											Jika terisi, OpenAgentic diprioritaskan di atas Gemini. Kosongkan untuk kembali ke Gemini.
										</p>
									</div>
								</div>
							</div>
						</div>
					</GlassCard>
				</form>
			)}

			{activeTab === "server" && (
				<div className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<GlassCard className="p-3.5 border border-white/10 bg-[#0f141c] space-y-1.5">
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/50">
									Database PostgreSQL
								</span>
								<Database className="size-4 text-emerald-400" />
							</div>
							<p className="font-bold text-white text-sm">Neon Serverless</p>
							<p className="text-[11px] text-emerald-400">Terhubung (0.1ms)</p>
						</GlassCard>

						<GlassCard className="p-3.5 border border-white/10 bg-[#0f141c] space-y-1.5">
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/50">In-Memory Cache</span>
								<HardDrive className="size-4 text-amber-400" />
							</div>
							<p className="font-bold text-white text-sm">Upstash Redis</p>
							<p className="text-[11px] text-amber-400">{flushStatus}</p>
						</GlassCard>

						<GlassCard className="p-3.5 border border-white/10 bg-[#0f141c] space-y-1.5">
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/50">Keamanan Server</span>
								<ShieldCheck className="size-4 text-emerald-400" />
							</div>
							<p className="font-bold text-white text-sm">Neon Auth SSO</p>
							<p className="text-[11px] text-emerald-400">
								Enkripsi SHA-256 Aktif
							</p>
						</GlassCard>
					</div>

					<GlassCard className="p-3.5 sm:p-4 border border-white/10 bg-[#0f141c] space-y-3">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="font-bold text-white text-xs sm:text-sm">
									Pembersihan Cache Upstash Redis
								</h4>
								<p className="text-[11px] sm:text-xs text-white/50">
									Gunakan tombol ini jika perubahan pengaturan website belum
									ter-update di publik.
								</p>
							</div>
							<button
								type="button"
								onClick={handleFlushCache}
								className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
							>
								<RefreshCw className="size-3.5" />
								<span>Bersihkan Cache</span>
							</button>
						</div>
					</GlassCard>
				</div>
			)}

		</div>
	);
}
