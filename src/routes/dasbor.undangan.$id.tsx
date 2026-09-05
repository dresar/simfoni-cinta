import {
	createFileRoute,
	useParams,
	useNavigate,
	Link,
} from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
	ArrowLeft,
	ArrowRight,
	Save,
	Heart,
	Calendar,
	CreditCard,
	BookHeart,
	Sparkles,
	CheckCircle2,
	Music,
	Image as ImageIcon,
	Upload,
	Trash2,
	Play,
	Pause,
	Info,
	Check,
	ChevronDown,
	Lock,
	MessageSquareText,
	BookOpen,
	Quote,
} from "lucide-react";
import { toast } from "sonner";
import { fetchInvitation, editInvitation } from "@/functions/invitations";
import { fetchTemplates, fetchMusic } from "@/functions/media";
import { fetchSacredTexts, fetchQuotes, fetchPrayers } from "@/functions/konten";
import { useStore } from "@/store/appStore";

export const Route = createFileRoute("/dasbor/undangan/$id")({
	loader: async ({ params }) => {
		try {
			const [invitation, templates, musicList, sacredTexts, quotes, prayers] =
				await Promise.all([
					fetchInvitation({ data: params.id }).catch(() => null),
					fetchTemplates().catch(() => []),
					fetchMusic().catch(() => []),
					fetchSacredTexts().catch(() => []),
					fetchQuotes().catch(() => []),
					fetchPrayers().catch(() => []),
				]);
			return {
				invitation: invitation || null,
				templates: Array.isArray(templates) ? templates : [],
				musicList: Array.isArray(musicList) ? musicList : [],
				sacredTexts: Array.isArray(sacredTexts) ? sacredTexts : [],
				quotes: Array.isArray(quotes) ? quotes : [],
				prayers: Array.isArray(prayers) ? prayers : [],
			};
		} catch {
			return {
				invitation: null,
				templates: [],
				musicList: [],
				sacredTexts: [],
				quotes: [],
				prayers: [],
			};
		}
	},
	head: () => ({
		meta: [
			{ title: "Formulir Pengisian Undangan — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Lengkapi data mempelai, jadwal acara, lokasi, galeri foto, musik, dan detail undangan pernikahan Anda.",
			},
		],
	}),
	component: CustomerInvitationEditPage,
});

type StepId = 1 | 2 | 3 | 4 | 5;

interface StepInfo {
	id: StepId;
	title: string;
	shortTitle: string;
	subtitle: string;
	icon: any;
}

const STEPS: StepInfo[] = [
	{
		id: 1,
		title: "Data Mempelai Pria & Wanita",
		shortTitle: "Mempelai",
		subtitle: "Identitas calon pengantin pria dan wanita",
		icon: Heart,
	},
	{
		id: 2,
		title: "Jadwal Akad, Resepsi & Lokasi",
		shortTitle: "Jadwal & Lokasi",
		subtitle: "Waktu pelaksanaan dan alamat venue acara",
		icon: Calendar,
	},
	{
		id: 3,
		title: "Galeri Foto & Kisah Cinta",
		shortTitle: "Galeri & Cerita",
		subtitle: "Unggah foto kenangan dan cerita perjalanan cinta",
		icon: ImageIcon,
	},
	{
		id: 4,
		title: "Musik Latar & Amplop Digital",
		shortTitle: "Musik & Rekening",
		subtitle: "Pilihan lagu romantis dan rekening kado digital",
		icon: Music,
	},
	{
		id: 5,
		title: "Pengaturan Publikasi Undangan",
		shortTitle: "Pengaturan",
		subtitle: "Pilihan template, judul, dan status aktif",
		icon: Sparkles,
	},
];

export type StoryMilestone = {
	id: string;
	year: string;
	title: string;
	description: string;
	image: string;
};

export const DEFAULT_MILESTONES: StoryMilestone[] = [
	{
		id: "m-1",
		year: "2021",
		title: "Pertama Berjumpa",
		description: "Awal mula perjumpaan manis yang mempertemukan langkah dan tujuan kami.",
		image: "",
	},
	{
		id: "m-2",
		year: "2023",
		title: "Menjalin Kasih",
		description: "Komitmen saling memahami, melangkah bersama melewati setiap proses kehidupan.",
		image: "",
	},
	{
		id: "m-3",
		year: "2025",
		title: "Momen Lamaran",
		description: "Mengucap janji suci di hadapan keluarga tercinta untuk melangkah ke pelaminan.",
		image: "",
	},
];

function CustomerInvitationEditPage() {
	const { invitation, templates, musicList, sacredTexts, quotes, prayers } =
		Route.useLoaderData();
	const { id } = useParams({ from: "/dasbor/undangan/$id" });
	const { session } = useStore();
	const navigate = useNavigate();

	const [currentStep, setCurrentStep] = useState<StepId>(1);
	const [stepSelectorOpen, setStepSelectorOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [autoSavedTime, setAutoSavedTime] = useState<string>("");
	const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const resolveAudioUrl = (url?: string) => {
		if (!url) return "/music/love-story-sax-leon-chen.mp3";
		if (
			typeof window !== "undefined" &&
			(window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1")
		) {
			const filename = url.split("/").pop();
			if (filename) return `/music/${filename}`;
		}
		return url;
	};

	const [formData, setFormData] = useState({
		title: invitation?.title || "",
		slug: invitation?.slug || "",
		template: invitation?.template || "minimal-clean",
		status: (invitation?.status || "Draf") as "Draf" | "Aktif",
		date: invitation?.date || new Date().toISOString().split("T")[0],
		groom: invitation?.groom || "",
		groomNick: (invitation as any)?.groomNick || "",
		groomParents: (invitation as any)?.groomParents || "",
		groomPhoto: (invitation as any)?.groomPhoto || "",
		bride: invitation?.bride || "",
		brideNick: (invitation as any)?.brideNick || "",
		brideParents: (invitation as any)?.brideParents || "",
		bridePhoto: (invitation as any)?.bridePhoto || "",
		akadTime: (invitation as any)?.akadTime || "08:00 - 10:00 WIB",
		resepsiTime: (invitation as any)?.resepsiTime || "11:00 - 14:00 WIB",
		venueName: (invitation as any)?.venueName || "",
		venueAddress: (invitation as any)?.venueAddress || "",
		mapsUrl: (invitation as any)?.mapsUrl || "",
		bankName: (invitation as any)?.bankName?.split(" | ")[0] || "BCA",
		bankAccount: (invitation as any)?.bankAccount?.split(" | ")[0] || "",
		accountHolder: (invitation as any)?.accountHolder?.split(" | ")[0] || "",
		bankName2: (invitation as any)?.bankName?.split(" | ")[1] || "Mandiri",
		bankAccount2: (invitation as any)?.bankAccount?.split(" | ")[1] || "",
		accountHolder2: (invitation as any)?.accountHolder?.split(" | ")[1] || "",
		musicTitle: (invitation as any)?.musicTitle || (musicList[0]?.title || "A Thousand Years"),
		story: (invitation as any)?.story || "",
		buyerNotes: (invitation as any)?.buyerNotes || "",
		adminNotes: (invitation as any)?.adminNotes || "",
		packageTier: (invitation as any)?.packageTier || "Silver",
		sacredTextId: (invitation as any)?.sacredTextId || "",
		sacredTextTitle: (invitation as any)?.sacredTextTitle || "",
		sacredTextContent: (invitation as any)?.sacredTextContent || "",
		quoteId: (invitation as any)?.quoteId || "",
		quoteText: (invitation as any)?.quoteText || "",
		quoteAuthor: (invitation as any)?.quoteAuthor || "",
		prayerId: (invitation as any)?.prayerId || "",
		prayerTitle: (invitation as any)?.prayerTitle || "",
		prayerContent: (invitation as any)?.prayerContent || "",
	});

	const [photos, setPhotos] = useState<string[]>([]);
	const [milestones, setMilestones] = useState<StoryMilestone[]>(DEFAULT_MILESTONES);
	const customAudioInputRef = useRef<HTMLInputElement>(null);

	const userTier = useMemo(() => {
		if (formData.packageTier) return formData.packageTier;
		const t = (invitation?.template || "").toLowerCase();
		if (t.includes("platinum") || session?.tier === "Platinum") return "Platinum";
		if (t.includes("gold") || session?.tier === "Gold") return "Gold";
		if (t.includes("silver") || session?.tier === "Silver") return "Silver";
		if (session?.tier && session.tier !== "Free") return session.tier;
		return "Silver";
	}, [formData.packageTier, invitation, session]);

	const isMasterAdmin = useMemo(() => {
		if (!session) return false;
		return (
			session.role === "admin" ||
			session.email?.trim().toLowerCase() === "eka.ckp16799@gmail.com"
		);
	}, [session]);

	const maxPhotos = useMemo(() => {
		if (isMasterAdmin || userTier === "Platinum" || userTier === "Owner") return 999;
		if (userTier === "Gold") return 25;
		return 10;
	}, [userTier, isMasterAdmin]);

	const hasStoryTimeline = useMemo(() => {
		if (isMasterAdmin || userTier === "Platinum" || userTier === "Gold" || userTier === "Owner") return true;
		return false;
	}, [userTier, isMasterAdmin]);

	const hasCustomAudio = useMemo(() => {
		if (isMasterAdmin || userTier === "Platinum" || userTier === "Gold" || userTier === "Owner") return true;
		return false;
	}, [userTier, isMasterAdmin]);

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && session && isMasterAdmin) {
			toast.info("Mengarahkan admin ke panel inspeksi undangan...");
			navigate({ to: "/admin/undangan/$id", params: { id }, replace: true });
		}
	}, [mounted, session, isMasterAdmin, id, navigate]);

	useEffect(() => {
		if (invitation) {
			const bName = (invitation as any).bankName || "";
			const bAcc = (invitation as any).bankAccount || "";
			const bHolder = (invitation as any).accountHolder || "";
			setFormData((prev) => ({
				...prev,
				title: invitation.title || prev.title,
				slug: invitation.slug || prev.slug,
				template: invitation.template || prev.template,
				status: (invitation.status || prev.status) as "Draf" | "Aktif",
				date: invitation.date || prev.date,
				groom: invitation.groom || prev.groom,
				groomNick: (invitation as any).groomNick || prev.groomNick,
				groomParents: (invitation as any).groomParents || prev.groomParents,
				groomPhoto: (invitation as any).groomPhoto || prev.groomPhoto,
				bride: invitation.bride || prev.bride,
				brideNick: (invitation as any).brideNick || prev.brideNick,
				brideParents: (invitation as any).brideParents || prev.brideParents,
				bridePhoto: (invitation as any).bridePhoto || prev.bridePhoto,
				akadTime: (invitation as any).akadTime || prev.akadTime,
				resepsiTime: (invitation as any).resepsiTime || prev.resepsiTime,
				venueName: (invitation as any).venueName || prev.venueName,
				venueAddress: (invitation as any).venueAddress || prev.venueAddress,
				mapsUrl: (invitation as any).mapsUrl || prev.mapsUrl,
				bankName: bName.includes(" | ") ? bName.split(" | ")[0] : bName || prev.bankName,
				bankAccount: bAcc.includes(" | ") ? bAcc.split(" | ")[0] : bAcc || prev.bankAccount,
				accountHolder: bHolder.includes(" | ") ? bHolder.split(" | ")[0] : bHolder || prev.accountHolder,
				bankName2: bName.includes(" | ") ? bName.split(" | ")[1] : prev.bankName2,
				bankAccount2: bAcc.includes(" | ") ? bAcc.split(" | ")[1] : prev.bankAccount2,
				accountHolder2: bHolder.includes(" | ") ? bHolder.split(" | ")[1] : prev.accountHolder2,
				musicTitle: (invitation as any).musicTitle || prev.musicTitle,
				story: (invitation as any).story || prev.story,
				buyerNotes: (invitation as any).buyerNotes ?? prev.buyerNotes,
				adminNotes: (invitation as any).adminNotes ?? prev.adminNotes,
				packageTier: (invitation as any).packageTier || prev.packageTier,
				sacredTextId: (invitation as any).sacredTextId ?? prev.sacredTextId,
				sacredTextTitle: (invitation as any).sacredTextTitle ?? prev.sacredTextTitle,
				sacredTextContent: (invitation as any).sacredTextContent ?? prev.sacredTextContent,
				quoteId: (invitation as any).quoteId ?? prev.quoteId,
				quoteText: (invitation as any).quoteText ?? prev.quoteText,
				quoteAuthor: (invitation as any).quoteAuthor ?? prev.quoteAuthor,
				prayerId: (invitation as any).prayerId ?? prev.prayerId,
				prayerTitle: (invitation as any).prayerTitle ?? prev.prayerTitle,
				prayerContent: (invitation as any).prayerContent ?? prev.prayerContent,
			}));

			if ((invitation as any).gallery) {
				try {
					const parsedGallery = JSON.parse((invitation as any).gallery);
					if (Array.isArray(parsedGallery)) {
						setPhotos(parsedGallery);
					}
				} catch {}
			}

			if (invitation.story) {
				try {
					const parsed = JSON.parse(invitation.story);
					if (Array.isArray(parsed) && parsed.length > 0) {
						setMilestones(parsed);
					}
				} catch {
					if (invitation.story.trim()) {
						setMilestones([
							{ id: "m-1", year: "2021", title: "Awal Cerita", description: invitation.story, image: "" },
							{ id: "m-2", year: "2023", title: "Menjalin Kasih", description: "Perjalanan bersama.", image: "" },
							{ id: "m-3", year: "2025", title: "Menuju Halal", description: "Melangkah ke pernikahan.", image: "" },
						]);
					}
				}
			}
		}
	}, [invitation]);

	const handleAddMilestone = () => {
		if (!hasStoryTimeline) {
			toast.error("Fitur Kisah Cinta hanya tersedia untuk Paket Gold & Platinum. Silakan upgrade paket Anda.");
			return;
		}
		const newM: StoryMilestone = {
			id: `m-${Date.now()}`,
			year: new Date().getFullYear().toString(),
			title: "Momen Bahagia",
			description: "",
			image: "",
		};
		setMilestones((prev) => [...prev, newM]);
		toast.success("Momen cerita baru ditambahkan.");
	};

	const handleRemoveMilestone = (milestoneId: string) => {
		if (milestones.length <= 1) {
			toast.error("Minimal harus ada 1 momen kisah cinta.");
			return;
		}
		setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
		toast.success("Momen cerita dihapus.");
	};

	const handleMilestoneChange = (
		milestoneId: string,
		field: keyof StoryMilestone,
		value: string,
	) => {
		setMilestones((prev) =>
			prev.map((m) => (m.id === milestoneId ? { ...m, [field]: value } : m)),
		);
	};

	const saveToDatabase = async (
		silent = false,
		overrides?: {
			photos?: string[];
			milestones?: StoryMilestone[];
			formData?: any;
		},
	) => {
		const targetForm = overrides?.formData || formData;
		const targetPhotos = overrides?.photos || photos;
		const targetMilestones = overrides?.milestones || milestones;

		const combinedBankName = targetForm.bankAccount2?.trim()
			? `${targetForm.bankName.trim()} | ${targetForm.bankName2.trim()}`
			: targetForm.bankName.trim();
		const combinedBankAccount = targetForm.bankAccount2?.trim()
			? `${targetForm.bankAccount.trim()} | ${targetForm.bankAccount2.trim()}`
			: targetForm.bankAccount.trim();
		const combinedAccountHolder = targetForm.bankAccount2?.trim()
			? `${targetForm.accountHolder.trim()} | ${targetForm.accountHolder2.trim()}`
			: targetForm.accountHolder.trim();

		setSaving(true);
		try {
			await editInvitation({
				data: {
					id,
					ownerId: session?.email,
					body: {
						title:
							targetForm.title.trim() ||
							`Undangan ${targetForm.groom || "Mempelai"} & ${targetForm.bride || "Mempelai"}`,
						groom: targetForm.groom.trim(),
						groomNick: targetForm.groomNick.trim(),
						groomParents: targetForm.groomParents.trim(),
						groomPhoto: targetForm.groomPhoto || "",
						bride: targetForm.bride.trim(),
						brideNick: targetForm.brideNick.trim(),
						brideParents: targetForm.brideParents.trim(),
						bridePhoto: targetForm.bridePhoto || "",
						date: targetForm.date,
						akadTime: targetForm.akadTime.trim(),
						resepsiTime: targetForm.resepsiTime.trim(),
						venueName: targetForm.venueName.trim(),
						venueAddress: targetForm.venueAddress.trim(),
						mapsUrl: targetForm.mapsUrl.trim(),
						bankName: combinedBankName,
						bankAccount: combinedBankAccount,
						accountHolder: combinedAccountHolder,
						musicTitle: targetForm.musicTitle.trim(),
						story: JSON.stringify(targetMilestones),
						gallery: JSON.stringify(targetPhotos),
						template: targetForm.template,
						status: targetForm.status,
						buyerNotes: (targetForm.buyerNotes || "").trim(),
						packageTier: targetForm.packageTier || "Silver",
						sacredTextId: targetForm.sacredTextId || "",
						sacredTextTitle: (targetForm.sacredTextTitle || "").trim(),
						sacredTextContent: (targetForm.sacredTextContent || "").trim(),
						quoteId: targetForm.quoteId || "",
						quoteText: (targetForm.quoteText || "").trim(),
						quoteAuthor: (targetForm.quoteAuthor || "").trim(),
						prayerId: targetForm.prayerId || "",
						prayerTitle: (targetForm.prayerTitle || "").trim(),
						prayerContent: (targetForm.prayerContent || "").trim(),
					},
				},
			});
			const now = new Date();
			setAutoSavedTime(
				`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
			);
			if (!silent) {
				toast.success("Data undangan berhasil disimpan!");
			}
			return true;
		} catch (err: any) {
			if (!silent) {
				toast.error(err?.message || "Gagal menyimpan data.");
			}
			return false;
		} finally {
			setSaving(false);
		}
	};

	const handleGroomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Ukuran foto maksimal 5MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => {
			const res = ev.target?.result as string;
			if (res) {
				const updated = { ...formData, groomPhoto: res };
				setFormData(updated);
				saveToDatabase(true, { formData: updated });
				toast.success("Foto mempelai pria berhasil diunggah & tersimpan.");
			}
		};
		reader.readAsDataURL(file);
	};

	const handleBridePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Ukuran foto maksimal 5MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => {
			const res = ev.target?.result as string;
			if (res) {
				const updated = { ...formData, bridePhoto: res };
				setFormData(updated);
				saveToDatabase(true, { formData: updated });
				toast.success("Foto mempelai wanita berhasil diunggah & tersimpan.");
			}
		};
		reader.readAsDataURL(file);
	};

	const handleMilestoneImageUpload = (
		milestoneId: string,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Ukuran file maksimal 5MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => {
			const res = ev.target?.result as string;
			if (res) {
				const updatedMilestones = milestones.map((m) =>
					m.id === milestoneId ? { ...m, image: res } : m,
				);
				setMilestones(updatedMilestones);
				saveToDatabase(true, { milestones: updatedMilestones });
				toast.success("Foto momen berhasil diunggah & tersimpan.");
			}
		};
		reader.readAsDataURL(file);
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleNextStep = async () => {
		if (currentStep === 1) {
			if (!formData.groom.trim() && !formData.bride.trim()) {
				toast.error("Silakan lengkapi setidaknya salah satu nama mempelai.");
				return;
			}
		}

		await saveToDatabase(true);

		if (currentStep < 5) {
			const next = (currentStep + 1) as StepId;
			setCurrentStep(next);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handlePrevStep = () => {
		if (currentStep > 1) {
			const prev = (currentStep - 1) as StepId;
			setCurrentStep(prev);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleFinalSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setFormData((prev) => ({ ...prev, status: "Aktif" }));
		setSaving(true);
		const combinedBankName = formData.bankAccount2?.trim()
			? `${formData.bankName.trim()} | ${formData.bankName2.trim()}`
			: formData.bankName.trim();
		const combinedBankAccount = formData.bankAccount2?.trim()
			? `${formData.bankAccount.trim()} | ${formData.bankAccount2.trim()}`
			: formData.bankAccount.trim();
		const combinedAccountHolder = formData.bankAccount2?.trim()
			? `${formData.accountHolder.trim()} | ${formData.accountHolder2.trim()}`
			: formData.accountHolder.trim();

		try {
			await editInvitation({
				data: {
					id,
					ownerId: session?.email,
					body: {
						title: formData.title.trim() || `Undangan ${formData.groom || "Mempelai"} & ${formData.bride || "Mempelai"}`,
						groom: formData.groom.trim(),
						groomNick: formData.groomNick.trim(),
						groomParents: formData.groomParents.trim(),
						groomPhoto: formData.groomPhoto || "",
						bride: formData.bride.trim(),
						brideNick: formData.brideNick.trim(),
						brideParents: formData.brideParents.trim(),
						bridePhoto: formData.bridePhoto || "",
						date: formData.date,
						akadTime: formData.akadTime.trim(),
						resepsiTime: formData.resepsiTime.trim(),
						venueName: formData.venueName.trim(),
						venueAddress: formData.venueAddress.trim(),
						mapsUrl: formData.mapsUrl.trim(),
						bankName: combinedBankName,
						bankAccount: combinedBankAccount,
						accountHolder: combinedAccountHolder,
						musicTitle: formData.musicTitle.trim(),
						story: JSON.stringify(milestones),
						gallery: JSON.stringify(photos),
						template: formData.template,
						status: "Aktif",
						buyerNotes: (formData.buyerNotes || "").trim(),
						packageTier: formData.packageTier || "Silver",
						sacredTextId: formData.sacredTextId || "",
						sacredTextTitle: (formData.sacredTextTitle || "").trim(),
						sacredTextContent: (formData.sacredTextContent || "").trim(),
						quoteId: formData.quoteId || "",
						quoteText: (formData.quoteText || "").trim(),
						quoteAuthor: (formData.quoteAuthor || "").trim(),
						prayerId: formData.prayerId || "",
						prayerTitle: (formData.prayerTitle || "").trim(),
						prayerContent: (formData.prayerContent || "").trim(),
					},
				},
			});
			toast.success("Undangan berhasil diterbitkan dan aktif!");
			navigate({ to: "/dasbor/undangan" });
		} catch (err: any) {
			toast.error(err?.message || "Gagal menyimpan data undangan.");
		} finally {
			setSaving(false);
		}
	};

	const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!hasCustomAudio) {
			toast.error("Unggah audio kustom hanya tersedia untuk Paket Gold & Platinum. Silakan upgrade paket Anda.");
			return;
		}
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 15 * 1024 * 1024) {
			toast.error("Ukuran file audio maksimal 15MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => {
			const res = ev.target?.result as string;
			if (res) {
				const cleanName = file.name.replace(/\.[^/.]+$/, "");
				const newMusicTitle = `${cleanName} (Custom MP3)`;
				const updated = {
					...formData,
					musicTitle: newMusicTitle,
				};
				setFormData(updated);
				if (audioRef.current) {
					audioRef.current.src = res;
					audioRef.current.play().catch(() => {});
				}
				setPlayingTrackId("custom-track");
				saveToDatabase(true, { formData: updated });
				toast.success(`Lagu kustom "${cleanName}" berhasil diunggah!`);
			}
		};
		reader.readAsDataURL(file);
	};

	const togglePlayMusic = (track: any) => {
		if (playingTrackId === track.id) {
			if (audioRef.current) {
				audioRef.current.pause();
			}
			setPlayingTrackId(null);
		} else {
			if (audioRef.current) {
				const resolvedUrl = resolveAudioUrl(track.url);
				audioRef.current.src = resolvedUrl;
				audioRef.current.play().catch(() => {
					if (track.url && resolvedUrl !== track.url) {
						if (audioRef.current) {
							audioRef.current.src = track.url;
							audioRef.current.play().catch(() => {});
						}
					}
				});
			}
			setPlayingTrackId(track.id);
			setFormData((prev) => ({
				...prev,
				musicTitle: `${track.title} — ${track.artist}`,
			}));
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		const remainingQuota = maxPhotos - photos.length;
		if (remainingQuota <= 0) {
			toast.error(`Batas foto untuk paket ${userTier} maksimal ${maxPhotos} foto.`);
			return;
		}
		const filesToProcess = Array.from(files).slice(0, remainingQuota);
		const newPhotos = [...photos];
		let loaded = 0;

		for (const file of filesToProcess) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`Ukuran file "${file.name}" melebihi 5MB.`);
				continue;
			}
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result as string;
				if (result) {
					newPhotos.push(result);
					loaded++;
					if (loaded === filesToProcess.length) {
						setPhotos(newPhotos);
						saveToDatabase(true, { photos: newPhotos });
						toast.success(`${loaded} foto galeri berhasil diunggah & tersimpan.`);
					}
				}
			};
			reader.readAsDataURL(file);
		}
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleRemovePhoto = (index: number) => {
		const updated = photos.filter((_, i) => i !== index);
		setPhotos(updated);
		saveToDatabase(true, { photos: updated });
		toast.success("Foto dihapus dari galeri.");
	};

	if (mounted && isMasterAdmin) {
		return (
			<div
				className="rounded-3xl border border-stone-200 bg-white p-10 text-center space-y-4 max-w-lg mx-auto mt-10 shadow-sm"
				suppressHydrationWarning
			>
				<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
					<Lock className="size-6" />
				</div>
				<p className="text-base font-bold text-stone-800">Dialihkan ke Admin Panel</p>
				<p className="text-xs text-stone-500">
					Akun Master Admin mengelola undangan melalui panel inspeksi admin.
				</p>
				<Link
					to="/admin/undangan/$id"
					params={{ id }}
					className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
				>
					<span>Buka di Admin Undangan</span>
				</Link>
			</div>
		);
	}

	if (!invitation) {
		return (
			<div
				className="rounded-3xl border border-stone-200 bg-white p-12 text-center space-y-4 max-w-lg mx-auto mt-10 shadow-sm"
				suppressHydrationWarning
			>
				<p className="text-base font-bold text-stone-800">Undangan Tidak Ditemukan</p>
				<p className="text-xs text-stone-500">
					Data undangan yang Anda cari tidak ditemukan atau telah dihapus.
				</p>
				<Link
					to="/dasbor/undangan"
					className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
				>
					<ArrowLeft className="size-3.5" />
					<span>Kembali ke Undangan Saya</span>
				</Link>
			</div>
		);
	}

	const currentStepData = STEPS[currentStep - 1];
	const progressPercent = (currentStep / STEPS.length) * 100;

	return (
		<div className="space-y-5 max-w-4xl mx-auto pb-24" suppressHydrationWarning>
			<audio
				ref={audioRef}
				onEnded={() => setPlayingTrackId(null)}
				className="hidden"
			/>
			<div
				className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-3.5"
				suppressHydrationWarning
			>
				<div
					className="flex items-center gap-2.5 min-w-0"
					suppressHydrationWarning
				>
					<Link
						to="/dasbor/undangan"
						className="flex size-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-xs shrink-0"
						title="Kembali ke Daftar Undangan"
					>
						<ArrowLeft className="size-3.5" />
					</Link>
					<div
						className="flex items-center gap-2 min-w-0"
						suppressHydrationWarning
					>
						<h1 className="font-serif text-lg sm:text-xl font-bold text-stone-900 truncate">
							{formData.title || "Pengisian Data Undangan"}
						</h1>
						<span
							className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
								formData.status === "Aktif"
									? "bg-emerald-100 text-emerald-800 border border-emerald-200"
									: "bg-amber-100 text-amber-800 border border-amber-200"
							}`}
						>
							{formData.status}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] text-stone-600 font-medium">
						<Check className="size-3 text-emerald-600" />
						{saving ? "Menyimpan..." : autoSavedTime ? `Draf ${autoSavedTime}` : "Tersimpan di Draf"}
					</span>
				</div>
			</div>

			<div className="block sm:hidden">
				<div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs space-y-2.5">
					<div className="flex items-center justify-between">
						<div>
							<span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
								Langkah {currentStep}/5
							</span>
							<p className="text-xs font-bold text-stone-900">{currentStepData.title}</p>
						</div>
						<button
							type="button"
							onClick={() => setStepSelectorOpen(!stepSelectorOpen)}
							className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-700"
						>
							<span>Pilih</span>
							<ChevronDown className={`size-3 transition-transform ${stepSelectorOpen ? "rotate-180" : ""}`} />
						</button>
					</div>

					<div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
						<div
							className="bg-emerald-800 h-full transition-all duration-300 rounded-full"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>

					{stepSelectorOpen && (
						<div className="pt-2 border-t border-stone-100 space-y-1">
							{STEPS.map((step) => {
								const isActive = currentStep === step.id;
								const isDone = currentStep > step.id;
								return (
									<button
										key={step.id}
										type="button"
										onClick={() => {
											saveToDatabase(true);
											setCurrentStep(step.id);
											setStepSelectorOpen(false);
										}}
										className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
											isActive
												? "bg-emerald-900 text-white font-bold"
												: "bg-stone-50 text-stone-700 hover:bg-stone-100"
										}`}
									>
										<div className="flex items-center gap-2">
											<div
												className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
													isActive
														? "bg-white text-emerald-900"
														: isDone
															? "bg-emerald-100 text-emerald-800"
															: "bg-stone-200 text-stone-600"
												}`}
											>
												{isDone ? <Check className="size-2.5" /> : step.id}
											</div>
											<span className="text-xs">{step.title}</span>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>

			<div className="hidden sm:grid sm:grid-cols-5 gap-1.5 bg-white rounded-xl p-1.5 border border-stone-200 shadow-xs">
				{STEPS.map((step) => {
					const isActive = currentStep === step.id;
					const isDone = currentStep > step.id;
					return (
						<button
							key={step.id}
							type="button"
							onClick={() => {
								saveToDatabase(true);
								setCurrentStep(step.id);
							}}
							className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								isActive
									? "bg-emerald-900 text-white shadow-xs"
									: isDone
										? "text-emerald-900 bg-emerald-50/60 hover:bg-emerald-50"
										: "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
							}`}
						>
							<div
								className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
									isActive
										? "bg-white text-emerald-900"
										: isDone
											? "bg-emerald-200 text-emerald-900"
											: "bg-stone-200 text-stone-600"
								}`}
							>
								{isDone ? <Check className="size-3" /> : step.id}
							</div>
							<span className="truncate">{step.shortTitle}</span>
						</button>
					);
				})}
			</div>

			<div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-xs">
				{currentStep === 1 && (
					<div className="space-y-6">
						<div>
							<h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
								Data Mempelai
							</h2>
							<p className="text-xs text-stone-500 mt-0.5">
								Informasi kedua mempelai dan orang tua.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="rounded-2xl border border-stone-200/90 bg-stone-50/30 p-5 space-y-4">
								<div className="flex items-center gap-2 border-b border-stone-200/60 pb-3">
									<div className="size-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
										1
									</div>
									<h3 className="font-serif text-sm font-bold text-stone-900">
										Mempelai Pria
									</h3>
								</div>

								<div className="space-y-3">
									<div className="space-y-1.5">
										<label className="text-xs font-bold text-stone-700">Foto Mempelai Pria</label>
										{formData.groomPhoto ? (
											<div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
												<img
													src={formData.groomPhoto}
													alt="Mempelai Pria"
													className="size-16 rounded-xl object-cover border border-stone-200"
												/>
												<div className="flex flex-col gap-1.5">
													<span className="text-xs font-bold text-emerald-800">Foto Pria Terpasang</span>
													<div className="flex items-center gap-2">
														<input
															type="file"
															id="groom-photo-input"
															accept="image/jpeg,image/png,image/webp,image/jpg"
															className="hidden"
															onChange={handleGroomPhotoUpload}
														/>
														<label
															htmlFor="groom-photo-input"
															className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 cursor-pointer"
														>
															<Upload className="size-3" />
															Ganti
														</label>
														<button
															type="button"
															onClick={() => {
																const updated = { ...formData, groomPhoto: "" };
																setFormData(updated);
																saveToDatabase(true, { formData: updated });
																toast.success("Foto pria dihapus.");
															}}
															className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
														>
															<Trash2 className="size-3" />
															Hapus
														</button>
													</div>
												</div>
											</div>
										) : (
											<div>
												<input
													type="file"
													id="groom-photo-input"
													accept="image/jpeg,image/png,image/webp,image/jpg"
													className="hidden"
													onChange={handleGroomPhotoUpload}
												/>
												<label
													htmlFor="groom-photo-input"
													className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-xs font-bold text-stone-600 hover:border-emerald-700 hover:bg-emerald-50/40 transition-all cursor-pointer"
												>
													<Upload className="size-4 text-stone-400" />
													<span>Unggah Foto Mempelai Pria</span>
												</label>
											</div>
										)}
									</div>

									<div className="space-y-1">
										<label className="text-xs font-bold text-stone-700">Nama Lengkap</label>
										<input
											type="text"
											placeholder="Nama Lengkap"
											value={formData.groom}
											onChange={(e) => setFormData({ ...formData, groom: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-bold text-stone-700">Nama Panggilan</label>
										<input
											type="text"
											placeholder="Panggilan"
											value={formData.groomNick}
											onChange={(e) => setFormData({ ...formData, groomNick: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-bold text-stone-700">Nama Orang Tua</label>
										<input
											type="text"
											placeholder="Nama Orang Tua"
											value={formData.groomParents}
											onChange={(e) => setFormData({ ...formData, groomParents: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-stone-200/90 bg-stone-50/30 p-5 space-y-4">
								<div className="flex items-center gap-2 border-b border-stone-200/60 pb-3">
									<div className="size-6 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center font-bold text-xs">
										2
									</div>
									<h3 className="font-serif text-sm font-bold text-stone-900">
										Mempelai Wanita
									</h3>
								</div>

								<div className="space-y-3">
									<div className="space-y-1.5">
										<label className="text-xs font-bold text-stone-700">Foto Mempelai Wanita</label>
										{formData.bridePhoto ? (
											<div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
												<img
													src={formData.bridePhoto}
													alt="Mempelai Wanita"
													className="size-16 rounded-xl object-cover border border-stone-200"
												/>
												<div className="flex flex-col gap-1.5">
													<span className="text-xs font-bold text-rose-800">Foto Wanita Terpasang</span>
													<div className="flex items-center gap-2">
														<input
															type="file"
															id="bride-photo-input"
															accept="image/jpeg,image/png,image/webp,image/jpg"
															className="hidden"
															onChange={handleBridePhotoUpload}
														/>
														<label
															htmlFor="bride-photo-input"
															className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 cursor-pointer"
														>
															<Upload className="size-3" />
															Ganti
														</label>
														<button
															type="button"
															onClick={() => {
																const updated = { ...formData, bridePhoto: "" };
																setFormData(updated);
																saveToDatabase(true, { formData: updated });
																toast.success("Foto wanita dihapus.");
															}}
															className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
														>
															<Trash2 className="size-3" />
															Hapus
														</button>
													</div>
												</div>
											</div>
										) : (
											<div>
												<input
													type="file"
													id="bride-photo-input"
													accept="image/jpeg,image/png,image/webp,image/jpg"
													className="hidden"
													onChange={handleBridePhotoUpload}
												/>
												<label
													htmlFor="bride-photo-input"
													className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-xs font-bold text-stone-600 hover:border-emerald-700 hover:bg-emerald-50/40 transition-all cursor-pointer"
												>
													<Upload className="size-4 text-stone-400" />
													<span>Unggah Foto Mempelai Wanita</span>
												</label>
											</div>
										)}
									</div>

									<div className="space-y-1">
										<label className="text-xs font-bold text-stone-700">Nama Lengkap</label>
										<input
											type="text"
											placeholder="Nama Lengkap"
											value={formData.bride}
											onChange={(e) => setFormData({ ...formData, bride: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-bold text-stone-700">Nama Panggilan</label>
										<input
											type="text"
											placeholder="Panggilan"
											value={formData.brideNick}
											onChange={(e) => setFormData({ ...formData, brideNick: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>

									<div className="space-y-1">
										<label className="text-xs font-bold text-stone-700">Nama Orang Tua</label>
										<input
											type="text"
											placeholder="Nama Orang Tua"
											value={formData.brideParents}
											onChange={(e) => setFormData({ ...formData, brideParents: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-stone-200/90 bg-white p-5 space-y-6 shadow-xs">
							<div className="flex items-center justify-between border-b border-stone-100 pb-3">
								<div className="flex items-center gap-2">
									<div className="size-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
										3
									</div>
									<div>
										<h3 className="font-serif text-sm font-bold text-stone-900">
											Ayat Suci, Quotes & Doa Restu
										</h3>
										<p className="text-[11px] text-stone-500">
											Pilih kutipan ayat suci, mutiara cinta, dan doa pernikahan dari pustaka atau buat teks sendiri.
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<BookOpen className="size-4 text-emerald-700" />
										<span className="text-xs font-bold text-stone-800">Ayat Suci / Surat</span>
									</div>
									{formData.sacredTextId && (
										<button
											type="button"
											onClick={() => {
												const updated = {
													...formData,
													sacredTextId: "",
													sacredTextTitle: "",
													sacredTextContent: "",
												};
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
											}}
											className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
										>
											Reset Pilihan
										</button>
									)}
								</div>
								<div className="space-y-1.5">
									<label className="text-[11px] font-semibold text-stone-600">Pilih dari Pustaka Surat</label>
									<select
										value={formData.sacredTextId || ""}
										onChange={(e) => {
											const selId = e.target.value;
											if (!selId) {
												const updated = { ...formData, sacredTextId: "" };
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
												return;
											}
											const found = sacredTexts?.find((st: any) => String(st.id) === selId);
											if (found) {
												const updated = {
													...formData,
													sacredTextId: selId,
													sacredTextTitle: found.title,
													sacredTextContent: found.body,
												};
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
												toast.success(`Surat ${found.title} dipilih.`);
											}
										}}
										className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-emerald-700 transition-colors"
									>
										<option value="">-- Kustom Teks Sendiri / Tanpa Pilihan Pustaka --</option>
										{sacredTexts?.map((st: any) => (
											<option key={st.id} value={String(st.id)}>
												{st.title} {st.category ? `(${st.category})` : ""}
											</option>
										))}
									</select>
								</div>

								<div className="grid grid-cols-1 gap-2 pt-1">
									<div className="space-y-1">
										<label className="text-[11px] font-semibold text-stone-600">Judul / Sumber Ayat</label>
										<input
											type="text"
											placeholder="Contoh: QS. Ar-Rum: 21"
											value={formData.sacredTextTitle}
											onChange={(e) => setFormData({ ...formData, sacredTextTitle: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[11px] font-semibold text-stone-600">Isi Teks Ayat / Terjemahan</label>
										<textarea
											rows={3}
											placeholder="Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu..."
											value={formData.sacredTextContent}
											onChange={(e) => setFormData({ ...formData, sacredTextContent: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 outline-none focus:border-emerald-700 transition-colors resize-y leading-relaxed"
										/>
									</div>
								</div>
							</div>

							<div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Quote className="size-4 text-amber-700" />
										<span className="text-xs font-bold text-stone-800">Kata Mutiara / Quotes</span>
									</div>
									{formData.quoteId && (
										<button
											type="button"
											onClick={() => {
												const updated = {
													...formData,
													quoteId: "",
													quoteText: "",
													quoteAuthor: "",
												};
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
											}}
											className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
										>
											Reset Pilihan
										</button>
									)}
								</div>
								<div className="space-y-1.5">
									<label className="text-[11px] font-semibold text-stone-600">Pilih dari Pustaka Quotes</label>
									<select
										value={formData.quoteId || ""}
										onChange={(e) => {
											const selId = e.target.value;
											if (!selId) {
												const updated = { ...formData, quoteId: "" };
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
												return;
											}
											const found = quotes?.find((q: any) => String(q.id) === selId);
											if (found) {
												const updated = {
													...formData,
													quoteId: selId,
													quoteText: found.text,
													quoteAuthor: found.author || "",
												};
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
												toast.success(`Quote karya ${found.author || "Anonim"} dipilih.`);
											}
										}}
										className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-emerald-700 transition-colors"
									>
										<option value="">-- Kustom Quotes Sendiri / Tanpa Pilihan Pustaka --</option>
										{quotes?.map((q: any) => (
											<option key={q.id} value={String(q.id)}>
												"{q.text.slice(0, 50)}..." - {q.author || "Anonim"}
											</option>
										))}
									</select>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
									<div className="sm:col-span-2 space-y-1">
										<label className="text-[11px] font-semibold text-stone-600">Isi Kutipan / Kata Mutiara</label>
										<textarea
											rows={2}
											placeholder="Cinta sejati tidak datang karena menemukan orang yang sempurna..."
											value={formData.quoteText}
											onChange={(e) => setFormData({ ...formData, quoteText: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 outline-none focus:border-emerald-700 transition-colors resize-y leading-relaxed"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[11px] font-semibold text-stone-600">Penulis / Tokoh</label>
										<input
											type="text"
											placeholder="Contoh: B.J. Habibie"
											value={formData.quoteAuthor}
											onChange={(e) => setFormData({ ...formData, quoteAuthor: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>
								</div>
							</div>

							<div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Heart className="size-4 text-rose-700" />
										<span className="text-xs font-bold text-stone-800">Doa Pernikahan & Keberkahan</span>
									</div>
									{formData.prayerId && (
										<button
											type="button"
											onClick={() => {
												const updated = {
													...formData,
													prayerId: "",
													prayerTitle: "",
													prayerContent: "",
												};
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
											}}
											className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
										>
											Reset Pilihan
										</button>
									)}
								</div>
								<div className="space-y-1.5">
									<label className="text-[11px] font-semibold text-stone-600">Pilih dari Pustaka Doa</label>
									<select
										value={formData.prayerId || ""}
										onChange={(e) => {
											const selId = e.target.value;
											if (!selId) {
												const updated = { ...formData, prayerId: "" };
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
												return;
											}
											const found = prayers?.find((p: any) => String(p.id) === selId);
											if (found) {
												const fullContent = [found.original, found.latin, found.translation]
													.filter(Boolean)
													.join("\n\n");
												const updated = {
													...formData,
													prayerId: selId,
													prayerTitle: found.title,
													prayerContent: fullContent,
												};
												setFormData(updated);
												saveToDatabase(true, { formData: updated });
												toast.success(`Doa ${found.title} dipilih.`);
											}
										}}
										className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-emerald-700 transition-colors"
									>
										<option value="">-- Kustom Doa Sendiri / Tanpa Pilihan Pustaka --</option>
										{prayers?.map((p: any) => (
											<option key={p.id} value={String(p.id)}>
												{p.title} {p.category ? `(${p.category})` : ""}
											</option>
										))}
									</select>
								</div>

								<div className="grid grid-cols-1 gap-2 pt-1">
									<div className="space-y-1">
										<label className="text-[11px] font-semibold text-stone-600">Nama / Judul Doa</label>
										<input
											type="text"
											placeholder="Contoh: Doa Keberkahan Mempelai (Barakallahu Laka)"
											value={formData.prayerTitle}
											onChange={(e) => setFormData({ ...formData, prayerTitle: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[11px] font-semibold text-stone-600">Teks Doa / Terjemahan</label>
										<textarea
											rows={3}
											placeholder="Baarakallahu laka wa baaraka 'alaika wa jama'a bainakuma fii khaiir..."
											value={formData.prayerContent}
											onChange={(e) => setFormData({ ...formData, prayerContent: e.target.value })}
											className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-900 outline-none focus:border-emerald-700 transition-colors resize-y leading-relaxed"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{currentStep === 2 && (
					<div className="space-y-6">
						<div>
							<h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
								Jadwal & Lokasi
							</h2>
							<p className="text-xs text-stone-500 mt-0.5">
								Waktu akad, resepsi, dan lokasi acara.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Tanggal</label>
								<input
									type="date"
									value={formData.date}
									onChange={(e) => setFormData({ ...formData, date: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Waktu Akad</label>
								<input
									type="text"
									placeholder="08:00 - 10:00 WIB"
									value={formData.akadTime}
									onChange={(e) => setFormData({ ...formData, akadTime: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Waktu Resepsi</label>
								<input
									type="text"
									placeholder="11:00 - 15:00 WIB"
									value={formData.resepsiTime}
									onChange={(e) => setFormData({ ...formData, resepsiTime: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Tempat Acara</label>
								<input
									type="text"
									placeholder="Nama Gedung / Lokasi"
									value={formData.venueName}
									onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Google Maps</label>
								<input
									type="text"
									placeholder="URL Maps"
									value={formData.mapsUrl}
									onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors font-mono text-[11px]"
								/>
							</div>

							<div className="sm:col-span-2 space-y-1">
								<label className="text-xs font-bold text-stone-700">Alamat Lengkap</label>
								<textarea
									rows={3}
									placeholder="Alamat Lengkap"
									value={formData.venueAddress}
									onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
							</div>
						</div>
					</div>
				)}

				{currentStep === 3 && (
					<div className="space-y-8">
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
								<div>
									<h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
										Galeri Foto Prewedding
									</h2>
									<p className="text-xs text-stone-500 mt-0.5">
										Unggah foto momen terbaik Anda sesuai kuota paket aktif.
									</p>
								</div>
								<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 self-start sm:self-auto">
									Kuota Galeri: {photos.length}/{maxPhotos} Foto ({userTier})
								</span>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{photos.map((src, idx) => (
									<div key={idx} className="relative group rounded-2xl overflow-hidden border border-stone-200 aspect-square bg-stone-100 shadow-2xs">
										<img src={src} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
										<button
											type="button"
											onClick={() => handleRemovePhoto(idx)}
											className="absolute top-2 right-2 size-7 rounded-lg bg-black/70 text-white flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
											title="Hapus foto"
										>
											<Trash2 className="size-3.5" />
										</button>
									</div>
								))}

								{photos.length < maxPhotos && (
									<>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleFileUpload}
											accept="image/jpeg,image/png,image/webp,image/jpg"
											multiple
											className="hidden"
										/>
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:bg-emerald-50/50 aspect-square transition-all p-4 text-center cursor-pointer"
										>
											<Upload className="size-5 text-stone-400 mb-1" />
											<span className="text-xs font-bold text-stone-700">Unggah Foto</span>
											<span className="text-[10px] text-stone-400">Pilih dari perangkat</span>
										</button>
									</>
								)}
							</div>
						</div>

						<div className="space-y-4 pt-4 border-t border-stone-200">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
								<div>
									<h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
										Kisah Perjalanan Cinta (Love Story)
										{!hasStoryTimeline && (
											<span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
												<Lock className="size-3" /> Paket Gold & Platinum
											</span>
										)}
									</h2>
									<p className="text-xs text-stone-500 mt-0.5">
										Rangkaian momen indah dari awal bertemu hingga menuju pelaminan beserta foto setiap momen.
									</p>
								</div>
								{hasStoryTimeline && (
									<button
										type="button"
										onClick={handleAddMilestone}
										className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-800/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors self-start sm:self-auto cursor-pointer"
									>
										<BookHeart className="size-3.5" />
										<span>+ Tambah Momen</span>
									</button>
								)}
							</div>

							{!hasStoryTimeline ? (
								<div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="space-y-1">
										<p className="text-xs font-bold text-stone-900">Fitur Eksklusif Paket Gold & Platinum</p>
										<p className="text-[11px] text-stone-600 leading-relaxed">
											Paket Silver Anda saat ini mencakup 10 Foto Galeri Prewedding. Untuk menambahkan Linimasa Kisah Perjalanan Cinta dan foto momen bertahap, silakan upgrade ke Paket Gold atau Platinum.
										</p>
									</div>
									<Link
										to="/dasbor/paket"
										className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs"
									>
										Upgrade ke Gold
									</Link>
								</div>
							) : (
								<div className="space-y-4">
								{milestones.map((m, idx) => (
									<div
										key={m.id}
										className="rounded-2xl border border-stone-200 bg-stone-50/40 p-4 sm:p-5 space-y-4 shadow-2xs"
									>
										<div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
											<div className="flex items-center gap-2">
												<span className="flex size-6 items-center justify-center rounded-full bg-emerald-900 text-white text-[11px] font-bold">
													{idx + 1}
												</span>
												<h3 className="text-xs font-bold text-stone-900">
													Momen {idx + 1}: {m.title || "Kisah Cinta"}
												</h3>
											</div>
											{milestones.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveMilestone(m.id)}
													className="text-stone-400 hover:text-red-600 transition-colors p-1"
													title="Hapus Momen"
												>
													<Trash2 className="size-3.5" />
												</button>
											)}
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<div className="space-y-1">
												<label className="text-[11px] font-bold text-stone-700">Tahun / Waktu</label>
												<input
													type="text"
													placeholder="Contoh: 2021"
													value={m.year}
													onChange={(e) => handleMilestoneChange(m.id, "year", e.target.value)}
													className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
												/>
											</div>

											<div className="sm:col-span-2 space-y-1">
												<label className="text-[11px] font-bold text-stone-700">Judul Momen</label>
												<input
													type="text"
													placeholder="Contoh: Pertama Berjumpa"
													value={m.title}
													onChange={(e) => handleMilestoneChange(m.id, "title", e.target.value)}
													className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
												/>
											</div>
										</div>

										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Cerita Momen</label>
											<textarea
												rows={2}
												placeholder="Ceritakan momen indah ini secara singkat..."
												value={m.description}
												onChange={(e) => handleMilestoneChange(m.id, "description", e.target.value)}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
											/>
										</div>

										<div className="pt-1">
											<label className="text-[11px] font-bold text-stone-700 block mb-1.5">Foto Momen Ini</label>
											{m.image ? (
												<div className="relative inline-block rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
													<img src={m.image} alt={m.title} className="h-28 w-40 object-cover" />
													<button
														type="button"
														onClick={() => handleMilestoneChange(m.id, "image", "")}
														className="absolute top-1.5 right-1.5 size-6 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
														title="Hapus foto momen"
													>
														<Trash2 className="size-3" />
													</button>
												</div>
											) : (
												<div>
													<input
														type="file"
														id={`milestone-file-${m.id}`}
														accept="image/jpeg,image/png,image/webp,image/jpg"
														className="hidden"
														onChange={(e) => handleMilestoneImageUpload(m.id, e)}
													/>
													<label
														htmlFor={`milestone-file-${m.id}`}
														className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-emerald-700 transition-colors cursor-pointer shadow-2xs"
													>
														<Upload className="size-3.5 text-stone-500" />
														<span>Unggah Foto Momen</span>
													</label>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
							)}
						</div>
					</div>
				)}

				{currentStep === 4 && (
					<div className="space-y-6">
						<div>
							<h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
								Musik & Rekening
							</h2>
							<p className="text-xs text-stone-500 mt-0.5">
								Pilih musik pengiring langsung dari database dan kelola rekening kado.
							</p>
						</div>

						{playingTrackId && (
							<div className="flex items-center justify-between rounded-2xl bg-emerald-950 text-white p-3.5 shadow-sm border border-emerald-900">
								<div className="flex items-center gap-3 min-w-0">
									<div className="flex size-9 items-center justify-center rounded-xl bg-emerald-800 text-emerald-200 shrink-0 animate-pulse">
										<Music className="size-4" />
									</div>
									<div className="min-w-0">
										<span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
											Sedang Diputar (Preview CDN)
										</span>
										<p className="text-xs font-bold truncate text-white">
											{formData.musicTitle}
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										audioEl?.pause();
										setPlayingTrackId(null);
									}}
									className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors shrink-0"
								>
									Berhenti
								</button>
							</div>
						)}

						<div className="space-y-5">
							<div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 space-y-3 shadow-2xs">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="size-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-xs">
											<Upload className="size-5" />
										</div>
										<div>
											<h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
												Unggah Lagu Custom (Audio MP3 Sendiri)
												{!hasCustomAudio && (
													<span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
														<Lock className="size-3" /> Paket Gold & Platinum
													</span>
												)}
											</h3>
											<p className="text-[11px] text-stone-500">
												{hasCustomAudio
													? "Tersedia untuk Paket Gold & Platinum. Format: MP3 / WAV / M4A (Maks. 15MB)."
													: "Paket Silver menyertakan Pustaka Musik Platform resmi di bawah. Untuk mengunggah MP3 sendiri, silakan upgrade ke Paket Gold."}
											</p>
										</div>
									</div>
									{hasCustomAudio ? (
										<>
											<input
												type="file"
												ref={customAudioInputRef}
												onChange={handleCustomAudioUpload}
												accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/*"
												className="hidden"
											/>
											<button
												type="button"
												onClick={() => customAudioInputRef.current?.click()}
												className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
											>
												<Upload className="size-3.5" />
												<span>Pilih File MP3</span>
											</button>
										</>
									) : (
										<Link
											to="/dasbor/paket"
											className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-xs"
										>
											Upgrade ke Gold
										</Link>
									)}
								</div>
								{formData.musicTitle?.includes("(Custom MP3)") && (
									<div className="flex items-center justify-between rounded-xl bg-white p-3 border border-emerald-200">
										<span className="text-xs font-bold text-emerald-900 truncate">
											✓ {formData.musicTitle}
										</span>
										<button
											type="button"
											onClick={() => {
												const fallback = musicList[0] ? `${musicList[0].title} — ${musicList[0].artist}` : "A Thousand Years";
												setFormData((prev) => ({ ...prev, musicTitle: fallback }));
												saveToDatabase(true, { formData: { ...formData, musicTitle: fallback } });
												toast.info("Lagu custom direset ke pilihan database.");
											}}
											className="text-xs text-rose-600 hover:underline font-semibold"
										>
											Ganti ke Database
										</button>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-xs font-bold text-stone-700">
									Atau Pilih dari Pustaka Musik Database Master
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
									{musicList.length > 0 ? (
										musicList.map((track: any) => {
											const isSelected = formData.musicTitle.includes(track.title);
											const isPlaying = playingTrackId === track.id;
											return (
												<div
													key={track.id}
													onClick={() => {
														setFormData({
															...formData,
															musicTitle: `${track.title} — ${track.artist}`,
														});
														saveToDatabase(true, {
															formData: {
																...formData,
																musicTitle: `${track.title} — ${track.artist}`,
															},
														});
													}}
													className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
														isSelected
															? "border-emerald-800 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-800/30"
															: "border-stone-200 bg-stone-50/50 hover:bg-stone-100"
													}`}
												>
													<div className="min-w-0 flex-1 pr-2">
														<p className="text-xs font-bold text-stone-900 truncate">
															{track.title}
														</p>
														<p className="text-[11px] text-stone-500 truncate">
															{track.artist} · {track.genre || track.category || "Pop"} · {track.duration || "3:30"}
														</p>
													</div>
													<div className="flex items-center gap-1.5 shrink-0">
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																togglePlayMusic(track);
															}}
															className={`size-7 rounded-lg flex items-center justify-center transition-colors ${
																isPlaying
																	? "bg-emerald-800 text-white"
																	: "bg-stone-200 text-stone-700 hover:bg-stone-300"
															}`}
															title={isPlaying ? "Pause" : "Play"}
														>
															{isPlaying ? (
																<Pause className="size-3.5" />
															) : (
																<Play className="size-3.5 ml-0.5" />
															)}
														</button>
													</div>
												</div>
											);
										})
									) : (
										<div className="sm:col-span-2 p-4 rounded-xl border border-stone-200 bg-stone-50 text-center text-xs text-stone-500">
											Belum ada lagu di database master musik.
										</div>
									)}
								</div>
							</div>

							<div className="border-t border-stone-200 pt-5 space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-serif text-sm font-bold text-stone-900">
											Rekening Amplop Digital (Bisa hingga 2 Rekening)
										</h3>
										<p className="text-xs text-stone-500 mt-0.5">
											Tamu undangan dapat mengirimkan hadiah atau amplop digital langsung ke rekening pengantin.
										</p>
									</div>
								</div>

								<div className="rounded-2xl border border-stone-200 bg-stone-50/40 p-4 space-y-3">
									<span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
										Rekening / E-Wallet 1 (Utama)
									</span>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Bank / E-Wallet</label>
											<select
												value={formData.bankName}
												onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
											>
												<option value="BCA">BCA</option>
												<option value="Mandiri">Mandiri</option>
												<option value="BRI">BRI</option>
												<option value="BNI">BNI</option>
												<option value="BSI">BSI</option>
												<option value="DANA">DANA</option>
												<option value="GoPay">GoPay</option>
												<option value="OVO">OVO</option>
												<option value="ShopeePay">ShopeePay</option>
												<option value="QRIS">QRIS</option>
											</select>
										</div>

										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Nomor Rekening</label>
											<input
												type="text"
												placeholder="Nomor Rekening"
												value={formData.bankAccount}
												onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors font-mono"
											/>
										</div>

										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Atas Nama</label>
											<input
												type="text"
												placeholder="Atas Nama"
												value={formData.accountHolder}
												onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors uppercase"
											/>
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-stone-200 bg-stone-50/40 p-4 space-y-3">
									<span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
										Rekening / E-Wallet 2 (Kedua / Opsional)
									</span>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Bank / E-Wallet</label>
											<select
												value={formData.bankName2}
												onChange={(e) => setFormData({ ...formData, bankName2: e.target.value })}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
											>
												<option value="Mandiri">Mandiri</option>
												<option value="BCA">BCA</option>
												<option value="BRI">BRI</option>
												<option value="BNI">BNI</option>
												<option value="BSI">BSI</option>
												<option value="DANA">DANA</option>
												<option value="GoPay">GoPay</option>
												<option value="OVO">OVO</option>
												<option value="ShopeePay">ShopeePay</option>
												<option value="QRIS">QRIS</option>
											</select>
										</div>

										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Nomor Rekening</label>
											<input
												type="text"
												placeholder="Nomor Rekening Kedua"
												value={formData.bankAccount2}
												onChange={(e) => setFormData({ ...formData, bankAccount2: e.target.value })}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors font-mono"
											/>
										</div>

										<div className="space-y-1">
											<label className="text-[11px] font-bold text-stone-700">Atas Nama</label>
											<input
												type="text"
												placeholder="Atas Nama Kedua"
												value={formData.accountHolder2}
												onChange={(e) => setFormData({ ...formData, accountHolder2: e.target.value })}
												className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors uppercase"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{currentStep === 5 && (
					<div className="space-y-6">
						<div>
							<h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
								Pengaturan
							</h2>
							<p className="text-xs text-stone-500 mt-0.5">
								Judul dan status publikasi.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Judul Undangan</label>
								<input
									type="text"
									placeholder="Judul Undangan"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-bold text-stone-700">Status</label>
								<select
									value={formData.status}
									onChange={(e) =>
										setFormData({
											...formData,
											status: e.target.value as "Aktif" | "Draf",
										})
									}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								>
									<option value="Draf">Draf</option>
									<option value="Aktif">Aktif</option>
								</select>
							</div>

							<div className="sm:col-span-2 space-y-1">
								<label className="text-xs font-bold text-stone-700">Template</label>
								<select
									value={formData.template}
									onChange={(e) => setFormData({ ...formData, template: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-900 font-semibold outline-none focus:border-emerald-700 transition-colors"
								>
									{templates.map((t) => (
										<option key={t.slug} value={t.slug}>
											{t.name} ({t.category})
										</option>
									))}
								</select>
							</div>

							<div className="sm:col-span-2 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 via-stone-50 to-emerald-50/40 p-4 shadow-xs">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-900 font-bold border border-amber-400/40 text-xs">
											✨
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-stone-900">Paket Undangan:</span>
												<span className="inline-flex items-center rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-950 border border-amber-300">
													{formData.packageTier || "Silver"}
												</span>
											</div>
											<p className="text-[11px] text-stone-600 mt-0.5">
												Paket aktif dilengkapi fitur lengkap, galeri foto HD, musik CDN, dan RSVP tamu interaktif.
											</p>
										</div>
									</div>
									<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
										<CheckCircle2 className="size-3 text-emerald-700" />
										<span>Terverifikasi</span>
									</span>
								</div>
							</div>

							<div className="sm:col-span-2 space-y-1.5 pt-1">
								<div className="flex items-center justify-between">
									<label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
										<MessageSquareText className="size-3.5 text-amber-700" />
										<span>Catatan dari Pembeli / Permintaan Khusus</span>
									</label>
									<span className="text-[10px] text-stone-500 font-medium">Opsional ke Tim Admin</span>
								</div>
								<textarea
									rows={3}
									placeholder="Tulis catatan atau permintaan khusus untuk tim kami di sini... (Contoh: Tolong proses secepat nya ya bang, mohon pastikan nama keluarga besar sesuai adat, request lagu khusus, dll.)"
									value={formData.buyerNotes}
									onChange={(e) => setFormData({ ...formData, buyerNotes: e.target.value })}
									className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 font-normal leading-relaxed outline-none focus:border-amber-600 focus:bg-white transition-all shadow-2xs"
								/>
								<p className="text-[11px] text-stone-500">
									Catatan ini akan langsung diterima dan ditindaklanjuti oleh tim admin Simfoni Cinta.
								</p>
							</div>

							{formData.adminNotes && (
								<div className="sm:col-span-2 rounded-xl border border-emerald-300/80 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 space-y-1">
									<div className="flex items-center gap-1.5 font-bold text-emerald-900">
										<CheckCircle2 className="size-3.5 text-emerald-700" />
										<span>Respon / Catatan dari Admin:</span>
									</div>
									<p className="text-emerald-900 leading-relaxed font-medium pl-5">
										{formData.adminNotes}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				<div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-stone-100">
					{currentStep > 1 ? (
						<button
							type="button"
							onClick={handlePrevStep}
							className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 sm:px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
						>
							<ArrowLeft className="size-3.5" />
							<span>Kembali</span>
						</button>
					) : (
						<Link
							to="/dasbor/undangan"
							className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 sm:px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
						>
							<ArrowLeft className="size-3.5" />
							<span>Kembali</span>
						</Link>
					)}

					{currentStep < 5 ? (
						<button
							type="button"
							onClick={handleNextStep}
							disabled={saving}
							className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 px-5 sm:px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
						>
							<span>{saving ? "Menyimpan..." : "Lanjut →"}</span>
						</button>
					) : (
						<button
							type="button"
							onClick={handleFinalSubmit}
							disabled={saving}
							className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
						>
							<Save className="size-3.5" />
							<span>{saving ? "Menyimpan..." : "Simpan & Terbitkan"}</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
