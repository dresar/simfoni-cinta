import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	Action,
	Avatar,
	DataTable,
	Field,
	FormShell,
	GlassCard,
	initialsOf,
	Metric,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
	formatIdr,
} from "@/components/kit";
import { fetchInvitation, editInvitation } from "@/functions/invitations";
import { fetchRsvps, fetchOrders } from "@/functions/transaksi";
import { fetchTemplates } from "@/functions/media";
import {
	Users,
	CheckCircle,
	Clock,
	XCircle,
	Hash,
	ExternalLink,
	MapPin,
	Music,
	Gift,
	Image as ImageIcon,
	Instagram,
	User,
	CreditCard,
	Heart,
	Upload,
	Trash2,
	Eye,
	Edit3,
	MessageSquareText,
	Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/undangan/$id")({
	loader: async ({ params }) => {
		const [invitation, templates, rsvps, orders] = await Promise.all([
			fetchInvitation({ data: params.id }),
			fetchTemplates(),
			fetchRsvps(),
			fetchOrders(),
		]);
		return { invitation, templates, rsvps, orders };
	},
	head: () => ({
		meta: [
			{ title: "Detail Pengajuan — Simfoni Cinta" },
			{
				name: "description",
				content: "Inspeksi dan pengaturan lengkap detail undangan.",
			},
		],
	}),
	component: InvitationDetailPage,
});

type InvitationData = NonNullable<Awaited<ReturnType<typeof fetchInvitation>>>;
type OrderData = Awaited<ReturnType<typeof fetchOrders>>[number];
type RsvpData = Awaited<ReturnType<typeof fetchRsvps>>[number];

function resolveEmbedSrc(rawUrl: string): string {
	if (!rawUrl) return "";
	try {
		const parsed = new URL(rawUrl);
		if (
			parsed.hostname.includes("google.com") &&
			parsed.pathname.startsWith("/maps/embed")
		) {
			return rawUrl;
		}
		const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/);
		if (placeMatch) {
			return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(decodeURIComponent(placeMatch[1]))}&zoom=16`;
		}
		const queryParam =
			parsed.searchParams.get("q") ??
			parsed.searchParams.get("query") ??
			rawUrl;
		return `https://maps.google.com/maps?q=${encodeURIComponent(queryParam)}&output=embed&zoom=16`;
	} catch {
		return `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&output=embed&zoom=16`;
	}
}

function SectionLabel({ children }: { children: string }) {
	return (
		<p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
			{children}
		</p>
	);
}

function InfoRow({
	label,
	value,
}: {
	label: string;
	value?: string | number | null;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			<span className="text-sm text-foreground">{value ?? "—"}</span>
		</div>
	);
}

function PhotoPreview({
	src,
	name,
	role,
}: {
	src?: string;
	name?: string;
	role: "Pria" | "Wanita";
}) {
	const isMale = role === "Pria";
	if (!src) {
		return (
			<div
				className={`flex size-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed text-center p-2 ${
					isMale
						? "border-sky-500/40 bg-sky-500/10 text-sky-400"
						: "border-rose-500/40 bg-rose-500/10 text-rose-400"
				}`}
			>
				{isMale ? <User className="size-6 mb-1 text-sky-400" /> : <Heart className="size-6 mb-1 text-rose-400" />}
				<span className="text-[10px] font-bold">
					{isMale ? "Foto Pria" : "Foto Wanita"}
				</span>
			</div>
		);
	}
	return (
		<div className="relative group size-24 shrink-0">
			<img
				src={src}
				alt={name ?? (isMale ? "Foto Mempelai Pria" : "Foto Mempelai Wanita")}
				className={`size-24 rounded-2xl border object-cover shadow-sm ${
					isMale ? "border-sky-500/50 ring-1 ring-sky-500/30" : "border-rose-500/50 ring-1 ring-rose-500/30"
				}`}
			/>
			<span
				className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase whitespace-nowrap shadow-md ${
					isMale
						? "bg-sky-500 text-slate-950"
						: "bg-rose-500 text-white"
				}`}
			>
				{isMale ? "Foto Pria" : "Foto Wanita"}
			</span>
		</div>
	);
}

function SpouseCard({
	role,
	name,
	nick,
	parents,
	bio,
	photo,
	instagram,
	tiktok,
}: {
	role: "Pria" | "Wanita";
	name?: string;
	nick?: string;
	parents?: string;
	bio?: string;
	photo?: string;
	instagram?: string;
	tiktok?: string;
}) {
	const isMale = role === "Pria";
	return (
		<GlassCard
			className={`p-5 rounded-2xl border transition-all ${
				isMale
					? "border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-[#0f141c]/90 to-[#0f141c]/80 shadow-[0_4px_20px_rgba(14,165,233,0.08)]"
					: "border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-[#0f141c]/90 to-[#0f141c]/80 shadow-[0_4px_20px_rgba(244,63,94,0.08)]"
			}`}
		>
			<div className="mb-4 flex items-center justify-between">
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
						isMale
							? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
							: "bg-rose-500/20 text-rose-300 border border-rose-500/40"
					}`}
				>
					{isMale ? <User className="size-3.5 text-sky-400" /> : <Heart className="size-3.5 text-rose-400" />}
					<span>{isMale ? "Mempelai Pria (Laki-laki)" : "Mempelai Wanita (Perempuan)"}</span>
				</span>
				<span
					className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
						photo
							? isMale
								? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
								: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
							: "bg-white/5 text-white/40 border border-white/10"
					}`}
				>
					{photo ? "Foto Terpasang" : "Belum Ada Foto"}
				</span>
			</div>
			<div className="mb-4 flex items-center gap-4">
				<PhotoPreview src={photo} name={name} role={role} />
				<div className="flex flex-col gap-1 min-w-0">
					<p className="font-semibold text-foreground truncate text-base">{name || "—"}</p>
					<p className="text-xs text-muted-foreground">
						{nick ? `Panggilan: "${nick}"` : "—"}
					</p>
					{instagram && (
						<a
							href={`https://instagram.com/${instagram.replace("@", "")}`}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
						>
							<Instagram className="size-3" />
							{instagram}
						</a>
					)}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
				<InfoRow label="Nama Lengkap" value={name} />
				<InfoRow label="Nama Panggilan" value={nick} />
				<InfoRow label="Orang Tua" value={parents} />
				<InfoRow label="Bio / Anak Ke-" value={bio} />
				<InfoRow label="Instagram" value={instagram} />
				<InfoRow label="TikTok" value={tiktok} />
			</div>
		</GlassCard>
	);
}

function formatDateIndo(rawDate?: string): string {
	if (!rawDate) return "—";
	try {
		const cleanDate = rawDate.split("T")[0];
		const parts = cleanDate.split("-");
		if (parts.length === 3) {
			const y = parseInt(parts[0], 10);
			const m = parseInt(parts[1], 10) - 1;
			const d = parseInt(parts[2], 10);
			const obj = new Date(y, m, d);
			if (!isNaN(obj.getTime())) {
				return obj.toLocaleDateString("id-ID", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric",
				});
			}
		}
		const fallback = new Date(rawDate);
		if (!isNaN(fallback.getTime())) {
			return fallback.toLocaleDateString("id-ID", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		}
	} catch {}
	return rawDate;
}

function formatTimeIndo(rawTime?: string): string {
	if (!rawTime) return "";
	const trimmed = rawTime.trim();
	if (
		trimmed.toUpperCase().endsWith("WIB") ||
		trimmed.toUpperCase().endsWith("WITA") ||
		trimmed.toUpperCase().endsWith("WIT")
	) {
		return ` · ${trimmed}`;
	}
	return ` · ${trimmed} WIB`;
}

function EventCard({
	label,
	tone,
	date,
	time,
	venue,
	address,
	mapsUrl,
}: {
	label: string;
	tone: "matcha" | "gold";
	date?: string;
	time?: string;
	venue?: string;
	address?: string;
	mapsUrl?: string;
}) {
	const embedSrc = useMemo(() => resolveEmbedSrc(mapsUrl ?? ""), [mapsUrl]);
	const dateDisplay = formatDateIndo(date);
	const timeDisplay = formatTimeIndo(time);

	return (
		<GlassCard className="overflow-hidden p-0">
			<div className="p-5">
				<Pill tone={tone} className="mb-3">
					{label}
				</Pill>
				<p className="font-display text-lg font-bold text-foreground">
					{venue || "—"}
				</p>
				{address && (
					<p className="mt-1 text-xs text-muted-foreground">{address}</p>
				)}
				{(date || time) && (
					<p className="mt-2 text-sm text-muted-foreground">
						{dateDisplay}
						{timeDisplay}
					</p>
				)}
				{mapsUrl && (
					<div className="mt-3 flex items-center gap-2">
						<MapPin className="size-3 shrink-0 text-primary" />
						<a
							href={mapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="min-w-0 flex-1 truncate font-mono text-xs text-primary hover:underline"
						>
							{mapsUrl}
						</a>
					</div>
				)}
			</div>
			{embedSrc && (
				<iframe
					src={embedSrc}
					title={`Peta ${label}`}
					className="h-40 w-full border-0 border-t border-border"
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
					allowFullScreen
				/>
			)}
		</GlassCard>
	);
}

function OrderCard({ order }: { order: OrderData }) {
	const statusTone =
		order.status === "Lunas"
			? "success"
			: order.status === "Menunggu"
				? "gold"
				: "danger";
	return (
		<GlassCard className="p-5">
			<SectionLabel>Info Pemesan</SectionLabel>
			<div className="flex flex-wrap items-center gap-3 mb-4">
				<Avatar text={initialsOf(order.customer)} tone="matcha" />
				<div>
					<p className="font-semibold text-foreground">{order.customer}</p>
					<p className="font-mono text-xs text-muted-foreground">
						{order.email}
					</p>
				</div>
				<Pill tone={statusTone}>
					<CreditCard className="size-3" />
					{order.status}
				</Pill>
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<InfoRow label="Nama Akun" value={order.customer} />
				<InfoRow label="Email" value={order.email} />
				<InfoRow label="No. WhatsApp" value="—" />
				<InfoRow label="Paket Template" value={order.plan} />
				<InfoRow label="Total Biaya" value={formatIdr(order.amount)} />
				<InfoRow label="Metode Bayar" value={order.method} />
				<InfoRow label="Status Pembayaran" value={order.status} />
				<InfoRow label="Tanggal Order" value={order.date} />
			</div>
		</GlassCard>
	);
}

function RsvpSummarySection({ rsvps }: { rsvps: RsvpData[] }) {
	const hadir = rsvps.filter((r) => r.attendance === "Hadir").length;
	const menunggu = rsvps.filter((r) => r.attendance === "Ragu").length;
	const tidakHadir = rsvps.filter((r) => r.attendance === "Tidak Hadir").length;
	const totalPax = rsvps.reduce((acc, r) => acc + r.pax, 0);

	return (
		<>
			<SectionLabel>Ringkasan Tamu & RSVP</SectionLabel>
			<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
				<Metric
					label="Total Tamu"
					value={String(rsvps.length)}
					sub="respons masuk"
					icon={<Users className="size-4" />}
					tone="info"
				/>
				<Metric
					label="Hadir"
					value={String(hadir)}
					sub="konfirmasi hadir"
					icon={<CheckCircle className="size-4" />}
					tone="success"
				/>
				<Metric
					label="Menunggu"
					value={String(menunggu)}
					sub="ragu-ragu"
					icon={<Clock className="size-4" />}
					tone="gold"
				/>
				<Metric
					label="Tidak Hadir"
					value={String(tidakHadir)}
					sub="tidak bisa hadir"
					icon={<XCircle className="size-4" />}
					tone="danger"
				/>
				<Metric
					label="Total Pax"
					value={String(totalPax)}
					sub="jumlah kursi"
					icon={<Hash className="size-4" />}
					tone="matcha"
				/>
			</div>
			{rsvps.length > 0 && (
				<DataTable head={["Tamu", "Kehadiran", "Pax", "Pesan", "Waktu"]}>
					{rsvps.map((item) => (
						<tr key={item.id} className="transition-colors hover:bg-surface/40">
							<td className="px-4 py-3 font-semibold">{item.guest}</td>
							<td className="px-4 py-3">
								<Pill
									tone={
										item.attendance === "Hadir"
											? "success"
											: item.attendance === "Ragu"
												? "gold"
												: "danger"
									}
								>
									{item.attendance}
								</Pill>
							</td>
							<td className="px-4 py-3">{item.pax}</td>
							<td className="px-4 py-3 max-w-xs truncate text-xs text-muted-foreground">
								{item.message || "—"}
							</td>
							<td className="px-4 py-3 text-xs text-muted-foreground">
								{item.time}
							</td>
						</tr>
					))}
				</DataTable>
			)}
		</>
	);
}

function InvitationDetailPage() {
	const { id } = Route.useParams();
	const { invitation, templates, rsvps, orders } = Route.useLoaderData();
	const navigate = useNavigate();
	const router = useRouter();

	const [form, setForm] = useState({
		title: invitation?.title ?? "",
		slug: invitation?.slug ?? "",
		groom: invitation?.groom ?? "",
		groomNick: (invitation as any)?.groomNick ?? "",
		groomParents: (invitation as any)?.groomParents ?? "",
		groomPhoto: (invitation as any)?.groomPhoto ?? "",
		bride: invitation?.bride ?? "",
		brideNick: (invitation as any)?.brideNick ?? "",
		brideParents: (invitation as any)?.brideParents ?? "",
		bridePhoto: (invitation as any)?.bridePhoto ?? "",
		date: invitation?.date ?? "",
		template: invitation?.template ?? "minimal-clean",
		status: invitation?.status ?? "Draf",
		akadTime: invitation?.akadTime ?? "08:00 - 10:00 WIB",
		resepsiTime: invitation?.resepsiTime ?? "11:00 - 14:00 WIB",
		venueName: invitation?.venueName ?? "",
		venueAddress: invitation?.venueAddress ?? "",
		mapsUrl: invitation?.mapsUrl ?? "",
		bankName: invitation?.bankName ?? "BCA",
		bankAccount: invitation?.bankAccount ?? "",
		accountHolder: invitation?.accountHolder ?? "",
		musicTitle: invitation?.musicTitle ?? "A Thousand Years — Christina Perri",
		story: invitation?.story ?? "",
		gallery: (invitation as any)?.gallery ?? "[]",
		liveUrl: invitation?.liveUrl ?? "",
		buyerNotes: invitation?.buyerNotes ?? "",
		adminNotes: invitation?.adminNotes ?? "",
		packageTier: (invitation as any)?.packageTier ?? "Silver",
	});
	const [loading, setLoading] = useState(false);
	const [saved, setSaved] = useState(false);
	const [activeTab, setActiveTab] = useState<"ringkasan" | "edit" | "rsvp">(
		"ringkasan",
	);

	const invitationRsvps = useMemo(
		() => (invitation ? rsvps.filter((r) => r.slug === invitation.slug) : []),
		[rsvps, invitation?.slug],
	);

	const invitationOrder = useMemo(
		() => (invitation ? (orders.find((o) => o.id === invitation.ownerId) ?? null) : null),
		[orders, invitation?.ownerId],
	);

	const galleryPhotos = useMemo(() => {
		try {
			const raw = form.gallery || (invitation as any)?.gallery;
			if (raw) {
				const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
				if (Array.isArray(parsed)) return parsed;
			}
		} catch {}
		return [];
	}, [form.gallery, invitation]);

	const milestones = useMemo(() => {
		try {
			if (form.story) {
				const parsed = JSON.parse(form.story);
				if (Array.isArray(parsed)) return parsed;
			}
		} catch {}
		return [];
	}, [form.story]);

	const packageTier = useMemo(() => {
		if (form.packageTier) return form.packageTier;
		const t = (invitation?.template || "").toLowerCase();
		const title = (invitation?.title || "").toLowerCase();
		if (t.includes("platinum") || title.includes("platinum")) return "Platinum";
		if (t.includes("gold") || title.includes("gold")) return "Gold";
		if (t.includes("silver") || title.includes("silver")) return "Silver";
		return "Silver";
	}, [form.packageTier, invitation]);

	if (!invitation) {
		return (
			<>
				<PageHead title="Detail Undangan" back="/admin/undangan" />
				<GlassCard className="p-6 text-sm text-muted-foreground">
					Data undangan tidak ditemukan.
				</GlassCard>
			</>
		);
	}

	const statusTone = form.status === "Aktif" ? "success" : "neutral";

	const handleGroomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const res = ev.target?.result as string;
			if (res) {
				setForm((prev) => ({ ...prev, groomPhoto: res }));
				setSaved(false);
			}
		};
		reader.readAsDataURL(file);
	};

	const handleBridePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const res = ev.target?.result as string;
			if (res) {
				setForm((prev) => ({ ...prev, bridePhoto: res }));
				setSaved(false);
			}
		};
		reader.readAsDataURL(file);
	};

	const submit = async () => {
		setLoading(true);
		await editInvitation({ data: { id, body: form } });
		setLoading(false);
		setSaved(true);
		router.invalidate();
	};

	return (
		<div className="space-y-6 max-w-5xl" suppressHydrationWarning>
			<PageHead
				title={form.title || "Detail Pengajuan Undangan"}
				subtitle="Inspeksi data mempelai, jadwal acara, musik, dan pengaturan publikasi"
				back="/admin/undangan"
			>
				<Pill tone="matcha">Paket {packageTier}</Pill>
				<Pill tone={statusTone}>{form.status}</Pill>

				{activeTab === "edit" ? (
					<Action tone="gold" size="sm" onClick={submit} disabled={loading}>
						{loading ? "Menyimpan…" : saved ? "Tersimpan ✓" : "Simpan Perubahan"}
					</Action>
				) : (
					<Action
						tone="gold"
						size="sm"
						onClick={() => setActiveTab("edit")}
					>
						<Edit3 className="size-3.5 mr-1" />
						<span>Edit Undangan</span>
					</Action>
				)}
			</PageHead>

			<div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 w-fit">
				<button
					type="button"
					onClick={() => setActiveTab("ringkasan")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
						activeTab === "ringkasan"
							? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40 shadow-xs font-bold"
							: "text-white/60 hover:text-white hover:bg-white/5"
					}`}
				>
					<Eye className="size-3.5" />
					<span>Ringkasan & Inspeksi</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("edit")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
						activeTab === "edit"
							? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40 shadow-xs font-bold"
							: "text-white/60 hover:text-white hover:bg-white/5"
					}`}
				>
					<Edit3 className="size-3.5" />
					<span>Formulir Edit Data</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("rsvp")}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
						activeTab === "rsvp"
							? "bg-[#c9a96e]/20 text-[#e8c98a] border border-[#c9a96e]/40 shadow-xs font-bold"
							: "text-white/60 hover:text-white hover:bg-white/5"
					}`}
				>
					<Users className="size-3.5" />
					<span>Tamu & RSVP ({invitationRsvps.length})</span>
				</button>
			</div>

			{activeTab === "ringkasan" && (
				<div className="space-y-6">
					<GlassCard className="p-5 border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-[#0f141c]/90 to-[#0f141c]/80 rounded-2xl shadow-xs space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
							<div className="flex items-center gap-2">
								<MessageSquareText className="size-4 text-amber-400" />
								<h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
									Catatan Pembeli & Tindak Lanjut Admin
								</h3>
							</div>
							<div className="flex items-center gap-2">
								<Pill tone="gold" className="text-[10px]">
									Paket {form.packageTier || "Silver"}
								</Pill>
								<Action
									tone="gold"
									size="xs"
									onClick={submit}
									disabled={loading}
								>
									{loading ? "Menyimpan…" : saved ? "Tersimpan ✓" : "Simpan Catatan & Paket"}
								</Action>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
										<span>Pesan / Catatan dari Pembeli:</span>
									</p>
									{form.buyerNotes && (
										<span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
											Ada Catatan Khusus
										</span>
									)}
								</div>
								{form.buyerNotes ? (
									<div className="rounded-lg border border-amber-500/30 bg-black/40 p-3 text-xs text-amber-100 leading-relaxed font-mono whitespace-pre-wrap">
										"{form.buyerNotes}"
									</div>
								) : (
									<p className="text-xs text-white/40 italic py-2">
										Pembeli belum menambahkan catatan atau permintaan khusus untuk undangan ini.
									</p>
								)}
							</div>

							<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
										Catatan Tindak Lanjut Admin:
									</p>
									<div className="flex items-center gap-1.5 text-[11px]">
										<span className="text-white/40">Tier:</span>
										<select
											value={form.packageTier}
											onChange={(e) => {
												setSaved(false);
												setForm({ ...form, packageTier: e.target.value });
											}}
											className="rounded-md border border-white/10 bg-black/50 px-2 py-0.5 text-xs text-amber-300 font-semibold outline-none focus:border-amber-500"
										>
											<option value="Silver">Silver (Default)</option>
											<option value="Gold">Gold</option>
											<option value="Platinum">Platinum</option>
										</select>
									</div>
								</div>
								<textarea
									rows={3}
									placeholder="Tulis respon atau instruksi tindak lanjut admin di sini (misal: Sudah dikonfirmasi, diproses kilat, nama gelar selesai disesuaikan)..."
									value={form.adminNotes}
									onChange={(e) => {
										setSaved(false);
										setForm({ ...form, adminNotes: e.target.value });
									}}
									className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500 leading-relaxed"
								/>
								<p className="text-[10px] text-white/40">
									Catatan ini akan tersimpan di database dan dapat dibaca oleh pembeli di dasbor mereka.
								</p>
							</div>
						</div>
					</GlassCard>

					{invitationOrder && (
						<div>
							<OrderCard order={invitationOrder} />
						</div>
					)}

					<GlassCard className="p-5 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs">
						<SectionLabel>Informasi Pemesan & Template</SectionLabel>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<InfoRow label="Owner ID" value={invitation.ownerId} />
							<InfoRow label="Template Desain" value={form.template} />
							<InfoRow label="Tanggal Acara" value={form.date || "—"} />
							<InfoRow label="Jumlah Views" value={invitation.views} />
						</div>
					</GlassCard>

					<div>
						<SectionLabel>Data Kedua Mempelai</SectionLabel>
						<div className="grid gap-4 sm:grid-cols-2">
							<SpouseCard
								role="Pria"
								name={form.groom || "Mempelai Pria"}
								nick={form.groomNick}
								parents={form.groomParents}
								photo={form.groomPhoto}
							/>
							<SpouseCard
								role="Wanita"
								name={form.bride || "Mempelai Wanita"}
								nick={form.brideNick}
								parents={form.brideParents}
								photo={form.bridePhoto}
							/>
						</div>
					</div>

					<div>
						<SectionLabel>Rangkaian Acara</SectionLabel>
						<div className="grid gap-4 sm:grid-cols-2">
							<EventCard
								label="Akad Nikah"
								tone="matcha"
								date={form.date}
								time={form.akadTime}
								venue={form.venueName || "Lokasi Belum Diisi"}
								address={form.venueAddress || "Alamat belum diatur"}
								mapsUrl={form.mapsUrl}
							/>
							<EventCard
								label="Resepsi Pernikahan"
								tone="gold"
								date={form.date}
								time={form.resepsiTime}
								venue={form.venueName || "Lokasi Belum Diisi"}
								address={form.venueAddress || "Alamat belum diatur"}
								mapsUrl={form.mapsUrl}
							/>
						</div>
					</div>

					<GlassCard className="p-5 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs space-y-4">
						<SectionLabel>Musik Latar & Rekening Kado</SectionLabel>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Musik Latar Aktif
								</p>
								<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
									<div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
										<Music className="size-4" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-xs font-bold text-white truncate">
											{form.musicTitle}
										</p>
										<p className="text-[10px] text-white/50">Streaming Audio Database Master</p>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Rekening Amplop Digital
								</p>
								<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
									<div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
										<CreditCard className="size-4" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-xs font-bold text-white truncate">
											{form.bankName}: {form.bankAccount || "—"}
										</p>
										<p className="text-[10px] text-white/50 uppercase">
											A.N {form.accountHolder || "—"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</GlassCard>

					<GlassCard className="p-5 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs space-y-5">
						<div className="flex items-center justify-between border-b border-white/5 pb-3">
							<SectionLabel>Galeri Foto & Linimasa Kisah Cinta</SectionLabel>
							<span className="text-[11px] text-white/40">Media Undangan</span>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Galeri Foto Prewedding & Dokumentasi ({galleryPhotos.length} Foto)
								</p>
								<span className="text-[10px] text-emerald-400 font-bold uppercase">
									{galleryPhotos.length > 0 ? "Foto Album Tersedia" : "Belum Ada Foto Prewedding"}
								</span>
							</div>

							{galleryPhotos.length === 0 ? (
								<div className="p-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center text-xs text-white/40">
									Belum ada foto galeri prewedding yang diunggah oleh pemesan.
								</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
									{galleryPhotos.map((src: string, idx: number) => (
										<div
											key={idx}
											className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-2xs"
										>
											<img
												src={src}
												alt={`Prewedding ${idx + 1}`}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
												<span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
													Prewedding #{idx + 1}
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{milestones.length > 0 && (
							<div className="pt-4 border-t border-white/5 space-y-3">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Linimasa Kisah Cinta ({milestones.length} Momen)
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									{milestones.map((m: any, idx: number) => (
										<div
											key={m.id || idx}
											className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2"
										>
											{m.image && (
												<div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-black/40">
													<img
														src={m.image}
														alt={m.title || "Momen"}
														className="w-full h-full object-cover"
													/>
												</div>
											)}
											<div className="space-y-0.5">
												<span className="text-[10px] font-mono font-bold text-amber-400">
													{m.year || `Momen ${idx + 1}`}
												</span>
												<p className="text-xs font-bold text-white truncate">
													{m.title || "—"}
												</p>
												<p className="text-[11px] text-white/60 line-clamp-2">
													{m.description || "—"}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</GlassCard>
				</div>
			)}

			{activeTab === "rsvp" && (
				<GlassCard className="p-5 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs">
					<RsvpSummarySection rsvps={invitationRsvps} />
				</GlassCard>
			)}

			{activeTab === "edit" && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
					className="space-y-6"
				>
				<GlassCard className="p-6 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs space-y-5">
					<div className="flex items-center justify-between border-b border-white/5 pb-3">
						<h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
							<User className="size-4 text-amber-400" />
							1. Informasi Mempelai & Publikasi
						</h3>
						<span className="text-[11px] text-white/40">Data Pokok Undangan</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Field label="Judul Undangan">
							<TextInput
								placeholder="Judul Undangan"
								value={form.title}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, title: e.target.value });
								}}
							/>
						</Field>

						<Field label="Template Desain">
							<SelectInput
								value={form.template}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, template: e.target.value });
								}}
							>
								{templates.map((item) => (
									<option key={item.id} value={item.slug}>
										{item.name} ({item.category})
									</option>
								))}
							</SelectInput>
						</Field>

						<Field label="Nama Mempelai Pria">
							<TextInput
								placeholder="Nama Lengkap Pria"
								value={form.groom}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, groom: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nama Panggilan Pria">
							<TextInput
								placeholder="Nama Panggilan"
								value={form.groomNick}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, groomNick: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nama Mempelai Wanita">
							<TextInput
								placeholder="Nama Lengkap Wanita"
								value={form.bride}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, bride: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nama Panggilan Wanita">
							<TextInput
								placeholder="Nama Panggilan"
								value={form.brideNick}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, brideNick: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nama Orang Tua Pria">
							<TextInput
								placeholder="Putra dari Bpk. ... & Ibu ..."
								value={form.groomParents}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, groomParents: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nama Orang Tua Wanita">
							<TextInput
								placeholder="Putri dari Bpk. ... & Ibu ..."
								value={form.brideParents}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, brideParents: e.target.value });
								}}
							/>
						</Field>

						<div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-3">
							<div className="flex items-center justify-between">
								<label className="text-xs font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wide">
									<User className="size-3.5" /> Foto Mempelai Pria (Laki-laki)
								</label>
								<span className="text-[10px] font-semibold text-white/50">
									{form.groomPhoto ? "✓ Terpasang" : "Kosong"}
								</span>
							</div>
							<div className="flex items-center gap-3">
								<PhotoPreview src={form.groomPhoto} name={form.groom} role="Pria" />
								<div className="flex flex-col gap-2">
									<input
										type="file"
										id="admin-groom-photo-input"
										accept="image/*"
										className="hidden"
										onChange={handleGroomPhotoUpload}
									/>
									<label
										htmlFor="admin-groom-photo-input"
										className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 cursor-pointer"
									>
										<Upload className="size-3.5" />
										<span>{form.groomPhoto ? "Ganti Foto Pria" : "Unggah Foto Pria"}</span>
									</label>
									{form.groomPhoto && (
										<button
											type="button"
											onClick={() => {
												setForm((prev) => ({ ...prev, groomPhoto: "" }));
												setSaved(false);
											}}
											className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer"
										>
											<Trash2 className="size-3" />
											<span>Hapus Foto Pria</span>
										</button>
									)}
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
							<div className="flex items-center justify-between">
								<label className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
									<Heart className="size-3.5" /> Foto Mempelai Wanita (Perempuan)
								</label>
								<span className="text-[10px] font-semibold text-white/50">
									{form.bridePhoto ? "✓ Terpasang" : "Kosong"}
								</span>
							</div>
							<div className="flex items-center gap-3">
								<PhotoPreview src={form.bridePhoto} name={form.bride} role="Wanita" />
								<div className="flex flex-col gap-2">
									<input
										type="file"
										id="admin-bride-photo-input"
										accept="image/*"
										className="hidden"
										onChange={handleBridePhotoUpload}
									/>
									<label
										htmlFor="admin-bride-photo-input"
										className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 cursor-pointer"
									>
										<Upload className="size-3.5" />
										<span>{form.bridePhoto ? "Ganti Foto Wanita" : "Unggah Foto Wanita"}</span>
									</label>
									{form.bridePhoto && (
										<button
											type="button"
											onClick={() => {
												setForm((prev) => ({ ...prev, bridePhoto: "" }));
												setSaved(false);
											}}
											className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer"
										>
											<Trash2 className="size-3" />
											<span>Hapus Foto Wanita</span>
										</button>
									)}
								</div>
							</div>
						</div>

						<Field label="Tanggal Acara">
							<TextInput
								type="date"
								value={form.date}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, date: e.target.value });
								}}
							/>
						</Field>

						<Field label="Status Publikasi">
							<SelectInput
								value={form.status}
								onChange={(e) => {
									setSaved(false);
									setForm({
										...form,
										status: e.target.value as typeof form.status,
									});
								}}
							>
								<option value="Aktif">Aktif</option>
								<option value="Draf">Draf</option>
							</SelectInput>
						</Field>
					</div>
				</GlassCard>

				<GlassCard className="p-6 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs space-y-5">
					<div className="flex items-center justify-between border-b border-white/5 pb-3">
						<h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
							<MapPin className="size-4 text-emerald-400" />
							2. Waktu & Lokasi Acara
						</h3>
						<span className="text-[11px] text-white/40">Jadwal & Venue</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Field label="Waktu Akad Nikah">
							<TextInput
								placeholder="08:00 - 10:00 WIB"
								value={form.akadTime}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, akadTime: e.target.value });
								}}
							/>
						</Field>

						<Field label="Waktu Resepsi">
							<TextInput
								placeholder="11:00 - 14:00 WIB"
								value={form.resepsiTime}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, resepsiTime: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nama Gedung / Tempat">
							<TextInput
								placeholder="Nama Gedung / Hotel / Rumah"
								value={form.venueName}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, venueName: e.target.value });
								}}
							/>
						</Field>

						<Field label="Alamat Lengkap">
							<TextInput
								placeholder="Alamat Jalan, Kelurahan, Kota"
								value={form.venueAddress}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, venueAddress: e.target.value });
								}}
							/>
						</Field>

						<div className="sm:col-span-2">
							<Field label="URL Google Maps">
								<TextInput
									placeholder="https://maps.app.goo.gl/..."
									value={form.mapsUrl}
									onChange={(e) => {
										setSaved(false);
										setForm({ ...form, mapsUrl: e.target.value });
									}}
									className="font-mono text-xs"
								/>
							</Field>
						</div>
					</div>
				</GlassCard>

				<GlassCard className="p-6 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs space-y-5">
					<div className="flex items-center justify-between border-b border-white/5 pb-3">
						<h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
							<CreditCard className="size-4 text-teal-400" />
							3. Musik & Rekening Hadiah
						</h3>
						<span className="text-[11px] text-white/40">Pengiring & Hadiah</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Field label="Bank / E-Wallet">
							<TextInput
								placeholder="BCA / Mandiri / BRI / DANA"
								value={form.bankName}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, bankName: e.target.value });
								}}
							/>
						</Field>

						<Field label="Nomor Rekening">
							<TextInput
								placeholder="Nomor Rekening"
								value={form.bankAccount}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, bankAccount: e.target.value });
								}}
							/>
						</Field>

						<Field label="Atas Nama Rekening">
							<TextInput
								placeholder="Nama Pemilik Rekening"
								value={form.accountHolder}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, accountHolder: e.target.value });
								}}
							/>
						</Field>

						<Field label="Musik Latar">
							<TextInput
								placeholder="Judul Musik — Artis"
								value={form.musicTitle}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, musicTitle: e.target.value });
								}}
							/>
						</Field>
					</div>
				</GlassCard>

				<GlassCard className="p-6 border border-white/10 bg-[#0f141c]/80 rounded-2xl shadow-xs space-y-5">
					<div className="flex items-center justify-between border-b border-white/5 pb-3">
						<h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
							<MessageSquareText className="size-4 text-amber-400" />
							4. Paket Undangan & Catatan Khusus
						</h3>
						<span className="text-[11px] text-white/40">Tier & Catatan Pelanggan</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="sm:col-span-2">
							<Field label="Paket Undangan (Tier)">
								<SelectInput
									value={form.packageTier}
									onChange={(e) => {
										setSaved(false);
										setForm({ ...form, packageTier: e.target.value });
									}}
								>
									<option value="Silver">Paket Silver (Standar Default)</option>
									<option value="Gold">Paket Gold</option>
									<option value="Platinum">Paket Platinum</option>
								</SelectInput>
							</Field>
						</div>

						<div className="sm:col-span-2 space-y-1">
							<label className="text-xs font-semibold text-white/80">
								Catatan dari Pembeli / Permintaan Khusus
							</label>
							<textarea
								rows={3}
								placeholder="Catatan yang ditulis oleh pembeli/user..."
								value={form.buyerNotes}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, buyerNotes: e.target.value });
								}}
								className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500 leading-relaxed font-mono"
							/>
						</div>

						<div className="sm:col-span-2 space-y-1">
							<label className="text-xs font-semibold text-white/80">
								Catatan Tindak Lanjut Admin
							</label>
							<textarea
								rows={3}
								placeholder="Catatan atau respon admin untuk undangan ini..."
								value={form.adminNotes}
								onChange={(e) => {
									setSaved(false);
									setForm({ ...form, adminNotes: e.target.value });
								}}
								className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500 leading-relaxed"
							/>
						</div>
					</div>
				</GlassCard>

				<div className="flex items-center justify-end gap-3 pt-2">
					<Action
						tone="ghost"
						onClick={() => setActiveTab("ringkasan")}
					>
						Kembali ke Ringkasan
					</Action>
					<Action tone="gold" type="submit" disabled={loading}>
						{loading ? "Menyimpan…" : "Simpan Perubahan"}
					</Action>
				</div>
			</form>
		)}
		</div>
	);
}
