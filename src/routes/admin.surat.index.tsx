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
import { fetchSacredTexts, removeSacredText } from "@/functions/konten";

const KATEGORI_SURAT = [
	"Semua",
	"Surat Ar-Rum",
	"An-Nur",
	"Al-Furqan",
	"Kitab Suci",
];

export const Route = createFileRoute("/admin/surat/")({
	loader: () => fetchSacredTexts(),
	head: () => ({
		meta: [
			{ title: "Surat & Salam — Simfoni Cinta" },
			{
				name: "description",
				content: "Teks pembuka, salam sakral, dan doa penutup undangan.",
			},
		],
	}),
	component: SacredPage,
});

function SacredPage() {
	const sacredTexts = Route.useLoaderData();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [kategori, setKategori] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);

	const rows = useMemo(
		() =>
			sacredTexts.filter((item) => {
				const matchText = `${item.title} ${item.body}`
					.toLowerCase()
					.includes(query.toLowerCase());
				const matchKat = kategori === "Semua" || item.category === kategori;
				return matchText && matchKat;
			}),
		[sacredTexts, query, kategori],
	);

	async function handleDelete() {
		if (!pending) return;
		await removeSacredText({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<PageHead title="Surat & Salam" subtitle="Teks pembuka sakral">
				<Pill tone="gold">{sacredTexts.length} surat</Pill>
				{rows.length !== sacredTexts.length && (
					<Pill tone="info" className="hidden sm:inline-flex">
						{rows.length} hasil
					</Pill>
				)}
				<TextInput
					placeholder="Cari surat..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-40 sm:w-56"
				/>
				<div className="flex flex-wrap gap-1.5">
					{KATEGORI_SURAT.map((k) => (
						<button
							key={k}
							onClick={() => setKategori(k)}
							className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
								kategori === k
									? "border-amber-500/60 bg-amber-500/20 text-amber-400"
									: "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
							}`}
						>
							{k}
						</button>
					))}
				</div>
				<LinkAction to="/admin/surat/baru" tone="gold" size="sm">
					+ Tambah Surat
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
							<Pill tone="gold">{item.category}</Pill>
						</div>

						<p
							className="text-center font-display text-xl leading-loose tracking-widest text-amber-300/90"
							dir="rtl"
							lang="ar"
						>
							{item.body}
						</p>

						<div className="flex gap-2 border-t border-white/5 pt-1">
							<LinkAction
								to="/admin/surat/baru"
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
