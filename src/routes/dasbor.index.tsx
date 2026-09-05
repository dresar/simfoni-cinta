import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Sparkles,
	Plus,
	ScrollText,
	ShoppingBag,
	ArrowRight,
	ExternalLink,
	Clock,
	CheckCircle2,
	Palette,
	HeartHandshake,
	FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/store/appStore";
import { fetchUserInvitations } from "@/functions/invitations";
import { fetchUserEntitlements } from "@/functions/entitlements";

type InvItem = Awaited<ReturnType<typeof fetchUserInvitations>>[number];

export const Route = createFileRoute("/dasbor/")({
	head: () => ({
		meta: [
			{ title: "Beranda — Simfoni Cinta" },
			{
				name: "description",
				content: "Portal pengelolaan undangan digital pernikahan Simfoni Cinta.",
			},
		],
	}),
	component: DasborBeranda,
});

function InvCard({ inv }: { inv: InvItem }) {
	return (
		<div className="flex flex-col justify-between gap-3.5 rounded-[10px] border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-300 group">
			<div className="space-y-2.5">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-emerald-900 transition-colors">
							{inv.title}
						</h3>
					</div>
					{inv.status === "Aktif" ? (
						<span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
							<CheckCircle2 className="size-3 text-emerald-700" />
							Aktif
						</span>
					) : (
						<span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shrink-0">
							<Clock className="size-3 text-amber-700" />
							Draf
						</span>
					)}
				</div>
				<div className="flex items-center gap-2 text-[11px] text-stone-500">
					<span className="rounded bg-stone-100 px-1.5 py-0.5 font-medium text-stone-600">
						{inv.template}
					</span>
					<span>·</span>
					<span>{inv.date}</span>
				</div>
			</div>

			<div>
				<Link
					to="/dasbor/undangan/$id"
					params={{ id: inv.id }}
					className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-900 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-all shadow-xs group-hover:shadow-md cursor-pointer"
				>
					<FileText className="size-3.5" />
					<span>Isi Formulir Undangan</span>
				</Link>
			</div>
		</div>
	);
}

function DasborBeranda() {
	const { session } = useStore();
	const [invitations, setInvitations] = useState<InvItem[]>([]);
	const [availableCount, setAvailableCount] = useState<number>(0);
	const [purchasesCount, setPurchasesCount] = useState<number>(0);
	const [loaded, setLoaded] = useState(false);

	const userName = session?.name || "Pengguna";

	useEffect(() => {
		if (!session?.email) {
			setLoaded(true);
			return;
		}
		Promise.all([
			fetchUserInvitations({ data: session.email }),
			fetchUserEntitlements({ data: session.email }),
		])
			.then(([invs, ents]) => {
				setInvitations(invs);
				setPurchasesCount(ents.length);
				const avail = ents.filter((e) => e.status === "available").length;
				setAvailableCount(avail);
				setLoaded(true);
			})
			.catch(() => {
				setLoaded(true);
			});
	}, [session?.email]);

	const recent = invitations.slice(0, 4);

	return (
		<div className="space-y-4 sm:space-y-5">
			<div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-900 p-4 sm:p-5 text-white shadow-md">
				<div className="absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

				<div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="space-y-1.5 max-w-xl">
						<div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider backdrop-blur-md">
							<Sparkles className="size-3 text-amber-300" />
							<span>Dasbor Pengantin</span>
						</div>
						<h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
							Halo, {userName}
						</h1>
						<p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
							{availableCount > 0
								? `Anda memiliki ${availableCount} hak akses template aktif. Siap untuk membuat undangan digital impian Anda.`
								: "Pilih template eksklusif favorit Anda, pilih paket fitur, dan mulai wujudkan undangan pernikahan digital elegan."}
						</p>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						{availableCount > 0 ? (
							<Link
								to="/dasbor/undangan"
								search={{ create: "true" }}
								className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 px-3.5 py-2 text-xs font-bold text-stone-950 shadow-xs transition-all cursor-pointer"
							>
								<Plus className="size-3.5" />
								<span>Buat Undangan Baru</span>
							</Link>
						) : (
							<Link
								to="/dasbor/template"
								className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 px-3.5 py-2 text-xs font-bold text-stone-950 shadow-xs transition-all cursor-pointer"
							>
								<Sparkles className="size-3.5" />
								<span>Beli Template Baru</span>
							</Link>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<Link
					to="/dasbor/undangan"
					className="group flex flex-col justify-between gap-3 rounded-[10px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-400 transition-all duration-300"
				>
					<div className="flex items-center justify-between">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
							<ScrollText className="size-4" />
						</div>
						<ArrowRight className="size-3.5 text-emerald-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
					</div>
					<div>
						<p className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							{loaded ? invitations.length : "—"}
						</p>
						<p className="text-xs font-bold text-emerald-950 mt-0.5">
							Undangan Saya
						</p>
						<p className="text-[10px] text-stone-400 mt-0.5">
							Instance undangan aktif
						</p>
					</div>
				</Link>

				<Link
					to="/dasbor/pembelian"
					className="group flex flex-col justify-between gap-3 rounded-[10px] border border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-amber-400 transition-all duration-300"
				>
					<div className="flex items-center justify-between">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs group-hover:scale-105 transition-transform">
							<Sparkles className="size-4" />
						</div>
						<ArrowRight className="size-3.5 text-amber-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
					</div>
					<div>
						<p className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							{loaded ? availableCount : "—"}
						</p>
						<p className="text-xs font-bold text-amber-950 mt-0.5">
							Hak Akses Siap Pakai
						</p>
						<p className="text-[10px] text-stone-400 mt-0.5">
							Kuota template belum dipakai
						</p>
					</div>
				</Link>

				<Link
					to="/dasbor/template"
					className="group flex flex-col justify-between gap-3 rounded-[10px] border border-teal-200/70 bg-gradient-to-br from-teal-50/60 via-white to-teal-50/30 p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-teal-400 transition-all duration-300"
				>
					<div className="flex items-center justify-between">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs group-hover:scale-105 transition-transform">
							<Palette className="size-4" />
						</div>
						<ArrowRight className="size-3.5 text-teal-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
					</div>
					<div>
						<p className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							20+
						</p>
						<p className="text-xs font-bold text-teal-950 mt-0.5">
							Katalog Template
						</p>
						<p className="text-[10px] text-stone-400 mt-0.5">
							Pilihan desain eksklusif
						</p>
					</div>
				</Link>

				<Link
					to="/dasbor/pembelian"
					className="group flex flex-col justify-between gap-3 rounded-[10px] border border-stone-200/80 bg-gradient-to-br from-stone-50 via-white to-stone-100/50 p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-stone-400 transition-all duration-300"
				>
					<div className="flex items-center justify-between">
						<div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-stone-800 text-white shadow-xs group-hover:scale-105 transition-transform">
							<ShoppingBag className="size-4" />
						</div>
						<ArrowRight className="size-3.5 text-stone-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
					</div>
					<div>
						<p className="font-serif text-lg sm:text-xl font-bold text-stone-900">
							{loaded ? purchasesCount : "—"}
						</p>
						<p className="text-xs font-bold text-stone-900 mt-0.5">
							Riwayat Transaksi
						</p>
						<p className="text-[10px] text-stone-400 mt-0.5">
							Semua status pesanan
						</p>
					</div>
				</Link>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
						Undangan Terbaru Anda
					</h2>
					<Link
						to="/dasbor/undangan"
						className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-700 transition-colors"
					>
						<span>Lihat Semua</span>
						<ArrowRight className="size-3.5" />
					</Link>
				</div>

				{!loaded ? (
					<div className="rounded-[10px] border border-stone-200 bg-white p-6 text-center text-xs text-stone-400">
						Memuat daftar undangan...
					</div>
				) : invitations.length === 0 ? (
					<div className="rounded-[10px] border border-dashed border-stone-200 bg-white p-6 sm:p-8 text-center space-y-3">
						<div className="size-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
							<HeartHandshake className="size-5" />
						</div>
						<div className="space-y-0.5 max-w-sm mx-auto">
							<p className="text-xs sm:text-sm font-bold text-stone-900">
								Belum Ada Undangan yang Dibuat
							</p>
							<p className="text-xs text-stone-500">
								Beli atau gunakan hak akses template Anda untuk mulai mendesain
								undangan pernikahan online sekarang juga.
							</p>
						</div>
						<Link
							to="/dasbor/template"
							className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-xs"
						>
							<Sparkles className="size-3.5" />
							<span>Jelajahi Katalog Template</span>
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{recent.map((inv) => (
							<InvCard key={inv.id} inv={inv} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
