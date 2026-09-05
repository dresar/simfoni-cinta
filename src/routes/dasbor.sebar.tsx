import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Share2,
	Plus,
	Search,
	Trash2,
	Copy,
	ExternalLink,
	Check,
	Users,
	Sparkles,
	Filter,
	MessageSquare,
	Phone,
	UserCheck,
	FileText,
	X,
	Info,
	HeartHandshake,
} from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useStore } from "@/store/appStore";
import { fetchUserInvitations } from "@/functions/invitations";
import { fetchUserPurchases } from "@/functions/purchases";
import {
	fetchGuests,
	addGuest,
	editGuest,
	removeGuest,
} from "@/functions/transaksi";

export const Route = createFileRoute("/dasbor/sebar")({
	component: GuestDistributionPage,
});

interface GuestItem {
	id: string;
	name: string;
	category: string;
	phone: string;
	pax: number;
	sent: boolean;
	invitationId?: string;
	ownerId?: string;
}

interface InvitationItem {
	id: string;
	title: string;
	slug: string;
	groom: string;
	bride: string;
	date: string;
	venueName: string;
	template: string;
	status: string;
	liveUrl: string;
}

const CATEGORY_OPTIONS = [
	{ label: "Keluarga", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
	{ label: "Saudara", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
	{ label: "Sahabat", color: "bg-amber-50 text-amber-800 border-amber-200" },
	{ label: "Teman Kantor", color: "bg-sky-50 text-sky-800 border-sky-200" },
	{ label: "VIP / Tokoh", color: "bg-purple-50 text-purple-800 border-purple-200" },
	{ label: "Tetangga", color: "bg-rose-50 text-rose-800 border-rose-200" },
	{ label: "Lainnya", color: "bg-stone-100 text-stone-700 border-stone-200" },
];

function normalizeWaPhone(phone: string): string {
	const cleaned = phone.replace(/[^0-9]/g, "");
	if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
	if (cleaned.startsWith("62")) return cleaned;
	if (cleaned.startsWith("8")) return "62" + cleaned;
	return cleaned;
}

function generateWaMessage({
	guestName,
	groom,
	bride,
	date,
	venue,
	url,
	templateType,
}: {
	guestName: string;
	groom: string;
	bride: string;
	date: string;
	venue: string;
	url: string;
	templateType: string;
}): string {
	const targetLink = url ? `${url}?to=${encodeURIComponent(guestName)}` : "";
	const coupleName =
		groom && bride ? `${groom} & ${bride}` : "Mempelai Pengantin";

	if (templateType === "islami") {
		return `Assalamu’alaikum Warahmatullahi Wabarakatuh\n\nKepada Yth.\nBapak/Ibu/Saudara/i: *${guestName}*\n\nTanpa mengurangi rasa hormat, dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami:\n\n👰🤵 *${coupleName}*\n📅 Tanggal: ${date || "Menyesuaikan"}\n📍 Lokasi: ${venue || "Lokasi Acara"}\n\nUntuk detail susunan acara, denah lokasi, dan konfirmasi kehadiran (RSVP), silakan buka tautan undangan digital berikut:\n👉 ${targetLink}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nWassalamu’alaikum Wr. Wb.\n\nSalam hangat,\n*${coupleName}*`;
	}

	if (templateType === "kasual") {
		return `Halo *${guestName}*! 👋\n\nKabar bahagia! Kami ingin mengundang kamu untuk hadir dan merayakan hari pernikahan kami:\n\n✨ *${coupleName}* ✨\n📅 Tanggal: ${date || "Menyesuaikan"}\n📍 Tempat: ${venue || "Lokasi Acara"}\n\nInfo lengkap & konfirmasi kehadiran bisa langsung dicek di link ini ya:\n👉 ${targetLink}\n\nKehadiran dan doa restumu sangat berarti buat kami. Sampai jumpa di hari bahagia kami!\n\nSalam hangat,\n*${coupleName}*`;
	}

	return `Kepada Yth.\nBapak/Ibu/Saudara/i: *${guestName}*\n\nSalam Sejahtera,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n👰🤵 *${coupleName}*\n📅 Tanggal: ${date || "Menyesuaikan"}\n📍 Lokasi: ${venue || "Lokasi Acara"}\n\nUntuk informasi rangkaian acara, lokasi, dan ucapan, silakan kunjungi tautan undangan digital kami:\n👉 ${targetLink}\n\nAtas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami ucapkan terima kasih yang tulus.\n\nHormat kami,\n*${coupleName}*`;
}

function GuestDistributionPage() {
	const { session } = useStore();
	const [invitations, setInvitations] = useState<InvitationItem[]>([]);
	const [selectedInvId, setSelectedInvId] = useState<string>("");
	const [guestsList, setGuestsList] = useState<GuestItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("Semua");
	const [statusFilter, setStatusFilter] = useState("Semua");
	const [templateType, setTemplateType] = useState<"formal" | "islami" | "kasual">("formal");

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [formName, setFormName] = useState("");
	const [formCategory, setFormCategory] = useState("Keluarga");
	const [formPhone, setFormPhone] = useState("");
	const [formPax, setFormPax] = useState(1);
	const [submitting, setSubmitting] = useState(false);

	const [purchases, setPurchases] = useState<any[]>([]);

	const userTier = useMemo(() => {
		const paidPurchases = purchases.filter((p: any) => p.status === "paid");
		if (
			paidPurchases.some(
				(p: any) =>
					p.tier === "Platinum" ||
					p.packageId === "platinum" ||
					(p.templateName || "").toLowerCase().includes("platinum"),
			)
		)
			return "Platinum";
		if (
			paidPurchases.some(
				(p: any) =>
					p.tier === "Gold" ||
					p.packageId === "gold" ||
					(p.templateName || "").toLowerCase().includes("gold"),
			)
		)
			return "Gold";
		if (
			paidPurchases.some(
				(p: any) =>
					p.tier === "Silver" ||
					p.packageId === "silver" ||
					(p.templateName || "").toLowerCase().includes("silver"),
			)
		)
			return "Silver";

		const t = session?.tier || "";
		if (t.includes("Platinum")) return "Platinum";
		if (t.includes("Gold")) return "Gold";
		if (t.includes("Silver")) return "Silver";
		return "None";
	}, [session?.tier, purchases]);

	const isMasterAdmin = useMemo(() => {
		if (!session) return false;
		return (
			session.role === "admin" ||
			session.email?.trim().toLowerCase() === "eka.ckp16799@gmail.com"
		);
	}, [session]);

	const maxQuota = useMemo(() => {
		if (isMasterAdmin || userTier === "Owner" || userTier === "Platinum") return 999999;
		if (userTier === "Gold") return 100;
		if (userTier === "Silver") return 50;
		return 0;
	}, [userTier, isMasterAdmin]);

	const loadInvitations = async () => {
		if (!session?.email) return;
		try {
			const res = await fetchUserInvitations({ data: session.email });
			const mapped: InvitationItem[] = (res || []).map((i: any) => ({
				id: i.id,
				title: i.title,
				slug: i.slug,
				groom: i.groom || "",
				bride: i.bride || "",
				date: i.date || "",
				venueName: i.venueName || "",
				template: i.template,
				status: i.status,
				liveUrl: i.liveUrl || "",
			}));
			setInvitations(mapped);
			if (mapped.length > 0 && !selectedInvId) {
				setSelectedInvId(mapped[0].id);
			}
		} catch {
			setInvitations([]);
		}
	};

	const loadGuests = async () => {
		if (!session?.email) return;
		try {
			const res = await fetchGuests({
				data: { ownerId: session.email, invitationId: selectedInvId },
			});
			setGuestsList((res || []) as GuestItem[]);
		} catch {
			setGuestsList([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session?.email) {
			loadInvitations();
			fetchUserPurchases({ data: session.email })
				.then((p) => setPurchases(p || []))
				.catch(() => setPurchases([]));
		}
	}, [session?.email]);

	useEffect(() => {
		if (session?.email) {
			loadGuests();
		}
	}, [session?.email, selectedInvId]);

	const activeInvitation = useMemo(() => {
		return invitations.find((i) => i.id === selectedInvId) || invitations[0];
	}, [invitations, selectedInvId]);

	const currentLiveUrl = useMemo(() => {
		if (!activeInvitation) return "";
		if (activeInvitation.liveUrl && activeInvitation.liveUrl.trim() !== "") {
			return activeInvitation.liveUrl.trim();
		}
		if (typeof window !== "undefined") {
			return `${window.location.origin}/demo/${activeInvitation.template}`;
		}
		return `https://simfonicinta.my.id/demo/${activeInvitation.template}`;
	}, [activeInvitation]);

	const isLiveUrlCustom = Boolean(
		activeInvitation?.liveUrl && activeInvitation.liveUrl.trim() !== "",
	);

	const filteredGuests = useMemo(() => {
		return guestsList.filter((g) => {
			const matchesSearch =
				g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				g.phone.includes(searchQuery);
			const matchesCategory =
				categoryFilter === "Semua" || g.category === categoryFilter;
			const matchesStatus =
				statusFilter === "Semua" ||
				(statusFilter === "Terkirim" && g.sent) ||
				(statusFilter === "Belum" && !g.sent);
			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [guestsList, searchQuery, categoryFilter, statusFilter]);

	const sentCount = guestsList.filter((g) => g.sent).length;
	const totalPax = guestsList.reduce((acc, g) => acc + (g.pax || 1), 0);
	const quotaPercent = Math.min(
		100,
		Math.round((guestsList.length / maxQuota) * 100),
	);

	const handleAddGuest = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = formName.trim();
		if (!trimmedName) {
			toast.error("Nama tamu wajib diisi.");
			return;
		}

		if (guestsList.length >= maxQuota) {
			toast.error(
				`Kuota tamu untuk paket ${userTier} telah mencapai batas maksimal (${maxQuota} tamu). Silakan upgrade paket Anda.`,
			);
			return;
		}

		if (!session?.email) return;

		setSubmitting(true);
		try {
			const newId = `gst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
			const newGuestData = {
				id: newId,
				name: trimmedName,
				category: formCategory,
				phone: formPhone.trim(),
				pax: Number(formPax) || 1,
				sent: false,
				invitationId: selectedInvId,
				ownerId: session.email,
			};

			await addGuest({ data: newGuestData });
			setGuestsList((prev) => [newGuestData, ...prev]);
			toast.success(`Tamu "${trimmedName}" berhasil ditambahkan!`);
			setIsAddModalOpen(false);
			setFormName("");
			setFormPhone("");
			setFormPax(1);
			setFormCategory("Keluarga");
		} catch (err: any) {
			toast.error(err?.message || "Gagal menambahkan tamu.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteGuest = async (id: string, name: string) => {
		try {
			await removeGuest({ data: id });
			setGuestsList((prev) => prev.filter((g) => g.id !== id));
			toast.success(`Tamu "${name}" telah dihapus.`);
		} catch {
			toast.error("Gagal menghapus tamu.");
		}
	};

	const handleSendWa = async (guest: GuestItem) => {
		if (!guest.phone || guest.phone.trim() === "") {
			toast.error("Nomor WhatsApp tamu belum diisi. Silakan isi nomor terlebih dahulu.");
			return;
		}

		const phoneWa = normalizeWaPhone(guest.phone);
		const message = generateWaMessage({
			guestName: guest.name,
			groom: activeInvitation?.groom || "",
			bride: activeInvitation?.bride || "",
			date: activeInvitation?.date || "",
			venue: activeInvitation?.venueName || "",
			url: currentLiveUrl,
			templateType,
		});

		const waUrl = `https://api.whatsapp.com/send?phone=${phoneWa}&text=${encodeURIComponent(message)}`;
		window.open(waUrl, "_blank");

		if (!guest.sent) {
			try {
				await editGuest({
					data: { id: guest.id, body: { sent: true } },
				});
				setGuestsList((prev) =>
					prev.map((g) => (g.id === guest.id ? { ...g, sent: true } : g)),
				);
			} catch {}
		}
	};

	const handleCopyMessage = (guest: GuestItem) => {
		const message = generateWaMessage({
			guestName: guest.name,
			groom: activeInvitation?.groom || "",
			bride: activeInvitation?.bride || "",
			date: activeInvitation?.date || "",
			venue: activeInvitation?.venueName || "",
			url: currentLiveUrl,
			templateType,
		});

		navigator.clipboard.writeText(message);
		toast.success(`Teks undangan untuk ${guest.name} berhasil disalin!`);
	};

	const handleCopyGuestLink = (guest: GuestItem) => {
		const link = `${currentLiveUrl}?to=${encodeURIComponent(guest.name)}`;
		navigator.clipboard.writeText(link);
		toast.success(`Link undangan personal untuk ${guest.name} berhasil disalin!`);
	};

	const samplePreviewText = useMemo(() => {
		return generateWaMessage({
			guestName: "Bapak H. Syarif & Keluarga",
			groom: activeInvitation?.groom || "Rangga",
			bride: activeInvitation?.bride || "Cinta",
			date: activeInvitation?.date || "2026-10-24",
			venue: activeInvitation?.venueName || "Grand Ballroom Hotel Indonesia",
			url: currentLiveUrl,
			templateType,
		});
	}, [activeInvitation, currentLiveUrl, templateType]);

	return (
		<div className="space-y-6 max-w-6xl mx-auto pb-16">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<WhatsappLogo className="size-5 text-emerald-600" weight="fill" />
						<h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
							Buku Tamu & Sebar Undangan WA
						</h1>
					</div>
					<p className="text-xs text-stone-500 mt-0.5">
						Kelola daftar tamu, keluarga, dan kirim pesan undangan personal dengan link WhatsApp otomatis.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsAddModalOpen(true)}
						className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
					>
						<Plus className="size-3.5" />
						<span>Tambah Tamu</span>
					</button>
				</div>
			</div>

			{invitations.length > 1 && (
				<div className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white p-3 shadow-xs">
					<span className="text-xs font-bold text-stone-600 shrink-0">
						Pilih Undangan:
					</span>
					<select
						value={selectedInvId}
						onChange={(e) => setSelectedInvId(e.target.value)}
						className="w-full max-w-xs rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-700 cursor-pointer"
					>
						{invitations.map((inv) => (
							<option key={inv.id} value={inv.id}>
								{inv.title} ({inv.template})
							</option>
						))}
					</select>
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-3">
				<div className="md:col-span-2 rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3.5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
						<div>
							<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
								Status Link Undangan
							</span>
							<h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
								{activeInvitation?.title || "Undangan Pernikahan"}
							</h3>
						</div>

						<div className="flex items-center gap-2">
							{isLiveUrlCustom ? (
								<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
									<Check className="size-3" />
									<span>Live URL Terverifikasi</span>
								</span>
							) : (
								<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium">
									<Info className="size-3" />
									<span>Pratinjau Mode Demo</span>
								</span>
							)}
						</div>
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-stone-50 border border-stone-200/70 p-2.5">
						<div className="min-w-0 flex-1">
							<span className="text-[10px] font-semibold text-stone-400 block">
								Tautan Induk Undangan
							</span>
							<a
								href={currentLiveUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-mono font-semibold text-emerald-800 hover:underline truncate block"
							>
								{currentLiveUrl}
							</a>
						</div>

						<div className="flex items-center gap-1.5 shrink-0">
							<button
								type="button"
								onClick={() => {
									navigator.clipboard.writeText(currentLiveUrl);
									toast.success("Link utama undangan disalin!");
								}}
								className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white hover:bg-stone-50 px-2 py-1 text-xs font-medium text-stone-700 transition-colors cursor-pointer"
							>
								<Copy className="size-3" />
								<span>Salin Link</span>
							</button>

							<a
								href={currentLiveUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex size-7 items-center justify-center rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
								title="Buka Halaman Live"
							>
								<ExternalLink className="size-3.5" />
							</a>
						</div>
					</div>

					{!isLiveUrlCustom && (
						<p className="text-[11px] text-stone-500 leading-relaxed">
							💡 <strong>Catatan:</strong> Link di atas saat ini menggunakan pratinjau template tema. Begitu tim admin mengisi Link Resmi domain kustom Anda, semua link tamu otomatis terhubung ke website utama Anda.
						</p>
					)}
				</div>

				<div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
					<div>
						<div className="flex items-center justify-between">
							<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
								Kuota Tamu
							</span>
							<span className="rounded-full bg-emerald-800 text-white px-2 py-0.5 text-[10px] font-bold">
								Paket {userTier}
							</span>
						</div>

						<div className="mt-2 flex items-baseline gap-1">
							<span className="font-serif text-2xl font-bold text-stone-900">
								{guestsList.length}
							</span>
							<span className="text-xs text-stone-400">
								/ {maxQuota === 999999 ? "∞ (Tanpa Batas)" : `${maxQuota} Tamu`}
							</span>
						</div>

						{maxQuota !== 999999 && (
							<div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
								<div
									className={`h-full transition-all duration-500 ${quotaPercent > 90 ? "bg-red-500" : "bg-emerald-600"}`}
									style={{ width: `${quotaPercent}%` }}
								/>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-center">
						<div className="rounded-lg bg-stone-50 p-1.5">
							<span className="text-[10px] text-stone-500 block">Terkirim</span>
							<span className="text-xs font-bold text-emerald-800">
								{sentCount} Tamu
							</span>
						</div>
						<div className="rounded-lg bg-stone-50 p-1.5">
							<span className="text-[10px] text-stone-500 block">Total Pax</span>
							<span className="text-xs font-bold text-stone-900">
								{totalPax} Orang
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
					<div className="flex items-center gap-1.5">
						<MessageSquare className="size-4 text-emerald-800" />
						<h3 className="font-serif text-sm font-bold text-stone-900">
							Template Pesan WhatsApp
						</h3>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => setTemplateType("formal")}
							className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${templateType === "formal" ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
						>
							Formal / Sopan
						</button>
						<button
							type="button"
							onClick={() => setTemplateType("islami")}
							className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${templateType === "islami" ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
						>
							Islami
						</button>
						<button
							type="button"
							onClick={() => setTemplateType("kasual")}
							className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${templateType === "kasual" ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
						>
							Santai / Sahabat
						</button>
					</div>
				</div>

				<div className="rounded-lg bg-stone-900 p-3 text-stone-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all max-h-36 overflow-y-auto">
					{samplePreviewText}
				</div>
			</div>

			<div className="rounded-xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
				<div className="p-3.5 sm:p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Users className="size-4 text-stone-500" />
						<span className="font-serif text-base font-bold text-stone-900">
							Daftar Nama Tamu
						</span>
						<span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
							{filteredGuests.length}
						</span>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<div className="relative min-w-[160px] sm:min-w-[200px]">
							<Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
							<input
								type="text"
								placeholder="Cari nama atau no WA..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 py-1.5 text-xs text-stone-900 outline-none focus:border-emerald-700"
							/>
						</div>

						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-emerald-700 cursor-pointer"
						>
							<option value="Semua">Semua Kategori</option>
							{CATEGORY_OPTIONS.map((c) => (
								<option key={c.label} value={c.label}>
									{c.label}
								</option>
							))}
						</select>

						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-emerald-700 cursor-pointer"
						>
							<option value="Semua">Semua Status</option>
							<option value="Belum">Belum Terkirim</option>
							<option value="Terkirim">Sudah Terkirim</option>
						</select>
					</div>
				</div>

				{loading ? (
					<div className="py-12 text-center text-xs text-stone-400">
						Memuat daftar tamu...
					</div>
				) : filteredGuests.length === 0 ? (
					<div className="py-16 text-center space-y-3 px-4">
						<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
							<HeartHandshake className="size-6" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-bold text-stone-900">
								Belum ada daftar tamu undangan
							</p>
							<p className="text-xs text-stone-500 max-w-sm mx-auto">
								Mulai susun nama-nama keluarga, sahabat, dan kerabat yang ingin Anda undang.
							</p>
						</div>
						<button
							type="button"
							onClick={() => setIsAddModalOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
						>
							<Plus className="size-3.5" />
							<span>Tambah Tamu Pertama</span>
						</button>
					</div>
				) : (
					<div className="divide-y divide-stone-100">
						{filteredGuests.map((guest) => {
							const categoryStyle =
								CATEGORY_OPTIONS.find((c) => c.label === guest.category)?.color ||
								"bg-stone-100 text-stone-700 border-stone-200";

							return (
								<div
									key={guest.id}
									className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 hover:bg-stone-50/80 transition-colors gap-3"
								>
									<div className="space-y-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-serif text-sm sm:text-base font-bold text-stone-900">
												{guest.name}
											</span>
											<span
												className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryStyle}`}
											>
												{guest.category}
											</span>
											<span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-mono text-stone-600">
												{guest.pax} Pax
											</span>
										</div>

										<div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
											{guest.phone ? (
												<span className="flex items-center gap-1">
													<Phone className="size-3 text-stone-400" />
													{guest.phone}
												</span>
											) : (
												<span className="text-stone-400 italic">
													(Tanpa no HP)
												</span>
											)}
											<span>·</span>
											{guest.sent ? (
												<span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold font-sans">
													<Check className="size-3" />
													Terkirim
												</span>
											) : (
												<span className="text-amber-700 font-sans">
													Belum Terkirim
												</span>
											)}
										</div>
									</div>

									<div className="flex items-center gap-1.5 shrink-0 flex-wrap">
										<button
											type="button"
											onClick={() => handleSendWa(guest)}
											className="inline-flex items-center gap-1 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
											title="Kirim Pesan WhatsApp Langsung"
										>
											<WhatsappLogo className="size-3.5" weight="fill" />
											<span>Kirim WA</span>
										</button>

										<button
											type="button"
											onClick={() => handleCopyMessage(guest)}
											className="inline-flex size-7.5 items-center justify-center rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
											title="Salin Teks Lengkap WA"
										>
											<FileText className="size-3.5" />
										</button>

										<button
											type="button"
											onClick={() => handleCopyGuestLink(guest)}
											className="inline-flex size-7.5 items-center justify-center rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
											title="Salin Link Personal Tamu"
										>
											<Copy className="size-3.5" />
										</button>

										<button
											type="button"
											onClick={() => handleDeleteGuest(guest.id, guest.name)}
											className="inline-flex size-7.5 items-center justify-center rounded-md border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
											title="Hapus Tamu"
										>
											<Trash2 className="size-3.5" />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{isAddModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-5 shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-stone-100 pb-3">
							<div>
								<h2 className="font-serif text-base font-bold text-stone-900">
									Tambah Tamu Undangan
								</h2>
								<p className="text-xs text-stone-500 mt-0.5">
									Sisa kuota tamu:{" "}
									<strong className="text-emerald-800">
										{maxQuota === 999999
											? "Tanpa Batas"
											: `${maxQuota - guestsList.length} Tamu`}
									</strong>
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="flex size-7.5 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						</div>

						<form onSubmit={handleAddGuest} className="space-y-3.5">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nama Tamu / Keluarga <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									autoFocus
									placeholder="Contoh: Bapak H. Syarif & Keluarga"
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700"
								/>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Kategori / Hubungan
									</label>
									<select
										value={formCategory}
										onChange={(e) => setFormCategory(e.target.value)}
										className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs font-medium text-stone-900 outline-none focus:border-emerald-700 cursor-pointer"
									>
										{CATEGORY_OPTIONS.map((c) => (
											<option key={c.label} value={c.label}>
												{c.label}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-1">
									<label className="text-xs font-bold text-stone-700">
										Jumlah Kehadiran (Pax)
									</label>
									<input
										type="number"
										min={1}
										max={10}
										value={formPax}
										onChange={(e) => setFormPax(Number(e.target.value))}
										className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">
									Nomor WhatsApp
								</label>
								<input
									type="tel"
									placeholder="Contoh: 081234567890"
									value={formPhone}
									onChange={(e) => setFormPhone(e.target.value)}
									className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700"
								/>
								<p className="text-[10px] text-stone-400">
									Format 08... otomatis disesuaikan ke format WhatsApp internasional.
								</p>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
								>
									<span>{submitting ? "Menyimpan..." : "Simpan Tamu"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
