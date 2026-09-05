import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
	Action,
	Avatar,
	Field,
	GlassCard,
	ImageUploadField,
	initialsOf,
	PageHead,
	Pill,
	TextArea,
	TextInput,
} from "@/components/kit";
import { useStore } from "@/store/appStore";
import { fetchAdminSettings, updateAdminSettings } from "@/functions/settings";
import { uploadImageFn } from "@/functions/upload";
import type { AdminSettingsData } from "@/server/settings";
import {
	User,
	Lock,
	Palette,
	Check,
	Eye,
	EyeOff,
	Shield,
	Mail,
	Phone,
	FileText,
	Link2,
	X,
} from "lucide-react";

export const Route = createFileRoute("/admin/profil")({
	head: () => ({
		meta: [
			{ title: "Pusat Pengaturan — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Profil, keamanan, notifikasi, dan branding platform Simfoni Cinta.",
			},
			{ property: "og:title", content: "Pusat Pengaturan — Simfoni Cinta" },
		],
	}),
	loader: () => fetchAdminSettings(),
	component: AdminProfilePage,
});

type Tab = "profil" | "keamanan" | "branding";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
	{ id: "profil", label: "Profil Admin", icon: <User className="size-4" /> },
	{ id: "keamanan", label: "Keamanan", icon: <Lock className="size-4" /> },
	{ id: "branding", label: "Branding", icon: <Palette className="size-4" /> },
];

function SaveBadge({ show }: { show: boolean }) {
	if (!show) return null;
	return (
		<span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
			<Check className="size-3" />
			Tersimpan
		</span>
	);
}

function TabProfilAdmin({ settings }: { settings: AdminSettingsData }) {
	const router = useRouter();
	const { session, setSession } = useStore();
	const [form, setForm] = useState({
		name: session?.name || settings.adminName || "Eka Syarif Maulana",
		email: session?.email || settings.adminEmail || "eka.ckp16799@gmail.com",
		phone: settings.adminPhone || "082392115909",
		bio: settings.adminBio || "Master Developer & System Architect",
		avatar:
			session?.avatar ||
			settings.adminAvatar ||
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/avatars/1788085226131-asset-4e610a02.png",
	});
	const [saved, setSaved] = useState(false);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadDone, setUploadDone] = useState(false);

	function handleFile(file: File) {
		if (!file.type.startsWith("image/")) return;
		setUploading(true);
		setUploadProgress(20);
		setUploadDone(false);

		const timer1 = setTimeout(() => setUploadProgress(55), 200);
		const timer2 = setTimeout(() => setUploadProgress(85), 500);

		const reader = new FileReader();
		reader.onload = async (e) => {
			const result = e.target?.result;
			if (typeof result === "string") {
				try {
					const res = await uploadImageFn({
						data: { fileData: result, folder: "avatars" },
					});
					clearTimeout(timer1);
					clearTimeout(timer2);
					setUploadProgress(100);
					if (res?.url) {
						const fullUrl = res.url.startsWith("http")
							? res.url
							: `${window.location.origin}${res.url}`;
						setForm((prev) => ({ ...prev, avatar: fullUrl }));
						if (session) {
							setSession({ ...session, avatar: fullUrl });
						}
					}
					setUploadDone(true);
				} catch {
					setForm((prev) => ({ ...prev, avatar: result }));
				} finally {
					setUploading(false);
				}
			}
		};
		reader.readAsDataURL(file);
	}

	async function handleSave() {
		setSaving(true);
		await updateAdminSettings({
			data: {
				...settings,
				adminName: form.name,
				adminEmail: form.email,
				adminPhone: form.phone,
				adminBio: form.bio,
				adminAvatar: form.avatar,
			},
		});
		setSession({
			name: form.name,
			email: form.email,
			role: session?.role ?? "admin",
			tier: session?.tier ?? "Platinum",
			avatar: form.avatar,
		});
		await router.invalidate();
		setSaving(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 2500);
	}

	return (
		<div className="space-y-4">
			<GlassCard className="flex flex-col gap-5 p-5">
				<p className="text-xs font-semibold uppercase tracking-widest text-white/30">
					Foto Profil
				</p>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
					<div className="shrink-0">
						<div
							className="relative size-28 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] transition hover:border-amber-500/40"
							onClick={() =>
								document.getElementById("avatar-file-input")?.click()
							}
							role="button"
							tabIndex={0}
							onKeyDown={(e) =>
								e.key === "Enter" &&
								document.getElementById("avatar-file-input")?.click()
							}
							aria-label="Ganti foto profil"
						>
							{form.avatar ? (
								<>
									<img
										src={form.avatar}
										alt=""
										referrerPolicy="no-referrer"
										crossOrigin="anonymous"
										className="h-full w-full object-cover"
									/>
									<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
										<User className="size-5 text-white" />
									</div>
								</>
							) : (
								<div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
									<User className="size-7 text-white/25" />
									<span className="text-[10px] text-white/25">Pilih foto</span>
								</div>
							)}
							<input
								id="avatar-file-input"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleFile(file);
								}}
							/>
						</div>
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-2.5">
						<Field label="URL / CDN Avatar">
							<div className="relative max-w-sm">
								<Link2 className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
								<TextInput
									placeholder="https://cdn.example.com/avatar.jpg"
									value={form.avatar}
									onChange={(e) => setForm({ ...form, avatar: e.target.value })}
									className="pl-8 pr-8 font-mono text-xs"
								/>
								{form.avatar && (
									<button
										type="button"
										onClick={() => setForm({ ...form, avatar: "" })}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-full bg-white/10 text-white/40 transition hover:bg-rose-500/20 hover:text-rose-400"
										aria-label="Hapus URL avatar"
									>
										<X className="size-3" />
									</button>
								)}
							</div>
						</Field>

						{uploading && (
							<div className="flex flex-col gap-1.5 max-w-sm rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
								<div className="flex items-center justify-between text-[11px]">
									<span className="flex items-center gap-1.5 font-medium text-amber-400">
										<span className="size-2 animate-ping rounded-full bg-amber-400" />
										Mengunggah foto...
									</span>
									<span className="font-mono font-bold text-amber-400">
										{uploadProgress}%
									</span>
								</div>
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
									<div
										className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 ease-out"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							</div>
						)}

						{uploadDone && !uploading && (
							<div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl max-w-sm">
								<Check className="size-3.5" />
								<span>
									Foto berhasil diunggah! Klik <b>Simpan Profil</b> di bawah
									untuk menyimpan.
								</span>
							</div>
						)}

						<p className="text-xs text-white/25">
							Unggah foto langsung atau tempel URL CDN. Klik gambar di kiri
							untuk pilih file.
						</p>
					</div>
				</div>
			</GlassCard>

			<GlassCard className="flex flex-col gap-4 p-5">
				<p className="text-xs font-semibold uppercase tracking-widest text-white/30">
					Identitas
				</p>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Nama Lengkap">
						<TextInput
							placeholder="Nama lengkap"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</Field>
					<Field label="Email Utama">
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
							<TextInput
								placeholder="email@domain.com"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								className="pl-8"
							/>
						</div>
					</Field>
					<Field label="No. WhatsApp">
						<div className="relative">
							<Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
							<TextInput
								placeholder="+62..."
								value={form.phone}
								onChange={(e) => setForm({ ...form, phone: e.target.value })}
								className="pl-8"
							/>
						</div>
					</Field>
					<div className="sm:col-span-2">
						<Field label="Bio">
							<TextArea
								rows={3}
								placeholder="Deskripsi singkat admin..."
								value={form.bio}
								onChange={(e) => setForm({ ...form, bio: e.target.value })}
							/>
						</Field>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 pt-2">
					<SaveBadge show={saved} />
					<Action tone="gold" size="sm" onClick={handleSave} disabled={saving}>
						{saving ? "Menyimpan..." : "Simpan Profil"}
					</Action>
				</div>
			</GlassCard>
		</div>
	);
}

function TabKeamanan({ settings }: { settings: AdminSettingsData }) {
	const [form, setForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	async function handleSave() {
		if (form.newPassword !== form.confirmPassword) return;
		setSaving(true);
		await updateAdminSettings({ data: { ...settings } });
		setSaving(false);
		setSaved(true);
		setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
		setTimeout(() => setSaved(false), 2500);
	}

	return (
		<GlassCard className="flex flex-col gap-3.5 p-3.5 sm:p-4">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-widest text-white/30">
					Ubah Password
				</p>
				<SaveBadge show={saved} />
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="sm:col-span-2">
					<Field label="Password Saat Ini">
						<div className="relative">
							<TextInput
								type={showCurrent ? "text" : "password"}
								placeholder="Password lama"
								value={form.currentPassword}
								onChange={(e) =>
									setForm({ ...form, currentPassword: e.target.value })
								}
								className="pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowCurrent(!showCurrent)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
							>
								{showCurrent ? (
									<EyeOff className="size-4" />
								) : (
									<Eye className="size-4" />
								)}
							</button>
						</div>
					</Field>
				</div>
				<Field label="Password Baru">
					<div className="relative">
						<TextInput
							type={showNew ? "text" : "password"}
							placeholder="Password baru minimal 8 karakter"
							value={form.newPassword}
							onChange={(e) =>
								setForm({ ...form, newPassword: e.target.value })
							}
							className="pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowNew(!showNew)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
						>
							{showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
						</button>
					</div>
				</Field>
				<Field label="Konfirmasi Password">
					<TextInput
						type="password"
						placeholder="Ulangi password baru"
						value={form.confirmPassword}
						onChange={(e) =>
							setForm({ ...form, confirmPassword: e.target.value })
						}
					/>
				</Field>
			</div>
			<div className="flex justify-end">
				<Action
					tone="gold"
					size="sm"
					onClick={handleSave}
					disabled={saving || !form.newPassword}
				>
					{saving ? "Menyimpan..." : "Ubah Password"}
				</Action>
			</div>
		</GlassCard>
	);
}

function TabBranding({ settings }: { settings: AdminSettingsData }) {
	const [brand, setBrand] = useState({
		platformName: settings.platformName || "Simfoni Cinta",
		logoUrl:
			settings.logoUrl ||
			"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/gallery/1788085208638-asset-660c6d59.png",
		faviconUrl: settings.faviconUrl || "https://simfonicinta.my.id/favicon.ico",
		metaTitle:
			settings.metaTitle ||
			"Simfoni Cinta — Buat Undangan Pernikahan Digital Elegan & Eksklusif",
		metaDesc:
			settings.metaDesc ||
			"Platform pembuatan undangan pernikahan digital premium nomor #1 di Indonesia. Desain mewah, musik latar pilihan, RSVP real-time, buku tamu digital, dan sebar undangan WhatsApp tanpa batas.",
	});
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	async function handleSave() {
		setSaving(true);
		await updateAdminSettings({
			data: {
				...settings,
				platformName: brand.platformName,
				logoUrl: brand.logoUrl,
				faviconUrl: brand.faviconUrl,
				metaTitle: brand.metaTitle,
				metaDesc: brand.metaDesc,
			},
		});
		setSaving(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 2500);
	}

	return (
		<div className="space-y-4">
			<GlassCard className="flex flex-col gap-3.5 p-3.5 sm:p-4">
				<div className="flex items-center justify-between">
					<p className="text-xs font-semibold uppercase tracking-widest text-white/30">
						Identitas Platform
					</p>
					<SaveBadge show={saved} />
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					<Field label="Nama Platform">
						<TextInput
							placeholder="Simfoni Cinta"
							value={brand.platformName}
							onChange={(e) =>
								setBrand({ ...brand, platformName: e.target.value })
							}
						/>
					</Field>
					<Field label="Meta Title">
						<div className="relative">
							<FileText className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
							<TextInput
								placeholder="Meta title halaman..."
								value={brand.metaTitle}
								onChange={(e) =>
									setBrand({ ...brand, metaTitle: e.target.value })
								}
								className="pl-8 font-medium text-xs"
							/>
						</div>
					</Field>
					<div className="sm:col-span-2">
						<Field label="Meta Description">
							<TextArea
								rows={3}
								placeholder="Deskripsi SEO platform..."
								value={brand.metaDesc}
								onChange={(e) =>
									setBrand({ ...brand, metaDesc: e.target.value })
								}
							/>
						</Field>
					</div>
				</div>
			</GlassCard>

			<GlassCard className="flex flex-col gap-3.5 p-3.5 sm:p-4">
				<p className="text-xs font-semibold uppercase tracking-widest text-white/30">
					Logo & Favicon
				</p>
				<div className="grid gap-4 sm:grid-cols-2">
					<ImageUploadField
						label="Logo Platform"
						value={brand.logoUrl}
						onChange={(url) => setBrand({ ...brand, logoUrl: url })}
						aspect="video"
					/>
					<ImageUploadField
						label="Favicon (.ico / PNG)"
						value={brand.faviconUrl}
						onChange={(url) => setBrand({ ...brand, faviconUrl: url })}
						aspect="square"
					/>
				</div>
				<div className="flex items-center justify-end gap-3 pt-2">
					<SaveBadge show={saved} />
					<Action tone="gold" size="sm" onClick={handleSave} disabled={saving}>
						{saving ? "Menyimpan..." : "Simpan Branding"}
					</Action>
				</div>
			</GlassCard>
		</div>
	);
}

function AdminProfilePage() {
	const settings = Route.useLoaderData();
	const [activeTab, setActiveTab] = useState<Tab>("profil");

	return (
		<>
			<PageHead title="Pusat Pengaturan" subtitle="Profil & konfigurasi master">
				<Pill tone="gold">Super Admin</Pill>
			</PageHead>

			<div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
				{TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
							activeTab === tab.id
								? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
								: "text-white/40 hover:text-white/70"
						}`}
					>
						{tab.icon}
						{tab.label}
					</button>
				))}
			</div>

			{activeTab === "profil" && <TabProfilAdmin settings={settings} />}
			{activeTab === "keamanan" && <TabKeamanan settings={settings} />}
			{activeTab === "branding" && <TabBranding settings={settings} />}
		</>
	);
}
