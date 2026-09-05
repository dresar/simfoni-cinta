import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	Action,
	ConfirmDelete,
	GlassCard,
	LinkAction,
	PageHead,
	Pill,
	TextInput,
} from "@/components/kit";
import { fetchPrayers, removePrayer } from "@/functions/konten";

const KATEGORI_DOA = ["Semua", "Doa Pengantin", "Doa Berkah", "Doa Orang Tua"];

export const Route = createFileRoute("/admin/doa/")({
	loader: () => fetchPrayers(),
	head: () => ({
		meta: [
			{ title: "Kelola Doa — Simfoni Cinta" },
			{
				name: "description",
				content: "Kelola koleksi doa dan ayat suci untuk undangan pernikahan.",
			},
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: DoaPage,
});

function DoaPage() {
	const prayers = Route.useLoaderData();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [kategori, setKategori] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);

	const rows = useMemo(
		() =>
			prayers.filter((item) => {
				const matchText = `${item.title} ${item.category}`
					.toLowerCase()
					.includes(query.toLowerCase());
				const matchKat = kategori === "Semua" || item.category === kategori;
				return matchText && matchKat;
			}),
		[prayers, query, kategori],
	);

	async function handleDelete() {
		if (!pending) return;
		await removePrayer({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<PageHead title="Doa" subtitle="Konten doa & ayat">
				<Pill tone="matcha">{prayers.length} doa</Pill>
				{rows.length !== prayers.length && (
					<Pill tone="info" className="hidden sm:inline-flex">
						{rows.length} hasil
					</Pill>
				)}
				<TextInput
					placeholder="Cari doa..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-40 sm:w-56"
				/>
				<div className="flex flex-wrap gap-1.5">
					{KATEGORI_DOA.map((k) => (
						<button
							key={k}
							onClick={() => setKategori(k)}
							className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
								kategori === k
									? "border-emerald-500/60 bg-emerald-500/20 text-emerald-400"
									: "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
							}`}
						>
							{k}
						</button>
					))}
				</div>
				<LinkAction to="/admin/doa/baru" tone="gold" size="sm">
					+ Tambah Doa
				</LinkAction>
			</PageHead>

			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{rows.map((item) => (
					<GlassCard
						key={item.id}
						className="flex flex-col gap-4 border-white/10 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
					>
						<div className="flex items-start justify-between gap-2">
							<h2 className="font-serif text-base font-bold leading-snug text-foreground">
								{item.title}
							</h2>
							<Pill tone="matcha">{item.category}</Pill>
						</div>

						{item.original && (
							<p
								className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 text-center font-display text-lg leading-loose tracking-widest text-amber-300/90"
								dir="rtl"
								lang="ar"
							>
								{item.original}
							</p>
						)}

						{item.translation && (
							<div className="space-y-1 border-t border-white/5 pt-3">
								<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
									Arti & Makna
								</p>
								<p className="text-xs leading-relaxed text-foreground/80">
									{item.translation}
								</p>
							</div>
						)}

						<div className="flex gap-2 border-t border-white/5 pt-1">
							<LinkAction
								to="/admin/doa/$id"
								params={{ id: item.id }}
								tone="ghost"
								size="sm"
								className="flex-1 justify-center"
							>
								Edit
							</LinkAction>
							<Action
								tone="danger"
								size="sm"
								className="flex-1 justify-center"
								onClick={() => setPending(item.id)}
							>
								Hapus
							</Action>
						</div>
					</GlassCard>
				))}
			</div>

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
