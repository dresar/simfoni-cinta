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
import { fetchQuotes, removeQuote } from "@/functions/konten";

const KATEGORI_QUOTES = [
	"Semua",
	"Islami",
	"Kristen",
	"Katolik",
	"Hindu",
	"Buddha",
	"Romantis",
	"Puitis",
	"Filosofis",
];

const kategoriTone: Record<string, "gold" | "matcha" | "info" | "neutral"> = {
	Islami: "matcha",
	Kristen: "info",
	Katolik: "info",
	Hindu: "gold",
	Buddha: "gold",
	Romantis: "gold",
	Puitis: "neutral",
	Filosofis: "neutral",
};

export const Route = createFileRoute("/admin/quotes/")({
	loader: () => fetchQuotes(),
	head: () => ({
		meta: [{ title: "Kelola Quotes — Simfoni Cinta" }],
	}),
	component: QuotesPage,
});

function QuotesPage() {
	const quotes = Route.useLoaderData();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [kategori, setKategori] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);

	const rows = useMemo(
		() =>
			quotes.filter((item) => {
				const matchText = `${item.text} ${item.author}`
					.toLowerCase()
					.includes(query.toLowerCase());
				const matchKat = kategori === "Semua" || item.mood === kategori;
				return matchText && matchKat;
			}),
		[quotes, query, kategori],
	);

	async function handleDelete() {
		if (!pending) return;
		await removeQuote({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<PageHead title="Quotes" subtitle="Kata-kata cinta">
				<Pill tone="matcha">{quotes.length} kutipan</Pill>
				{rows.length !== quotes.length && (
					<Pill tone="info" className="hidden sm:inline-flex">
						{rows.length} hasil
					</Pill>
				)}
				<TextInput
					placeholder="Cari quotes..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-40 sm:w-56"
				/>
				<div className="relative inline-flex items-center">
					<select
						value={kategori}
						onChange={(e) => setKategori(e.target.value)}
						className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground outline-none transition-colors hover:border-white/20 focus:border-emerald-500/50 cursor-pointer"
						aria-label="Filter kategori"
					>
						{KATEGORI_QUOTES.map((k) => (
							<option key={k} value={k} className="bg-slate-900 text-white">
								{k === "Semua" ? "Semua Kategori" : k}
							</option>
						))}
					</select>
				</div>
				<LinkAction to="/admin/quotes/baru" tone="gold" size="sm">
					+ Tambah Quotes
				</LinkAction>
			</PageHead>

			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{rows.map((item) => (
					<GlassCard
						key={item.id}
						className="group flex flex-col justify-between gap-4 border-white/10 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
					>
						<div className="flex-1">
							<div className="mb-3 flex justify-end">
								<Pill tone={kategoriTone[item.mood] ?? "neutral"}>
									{item.mood}
								</Pill>
							</div>
							<blockquote className="font-serif text-sm italic leading-relaxed text-foreground/90">
								"{item.text}"
							</blockquote>
							{item.author && (
								<p className="mt-3 text-right text-xs font-semibold text-muted-foreground">
									— {item.author}
								</p>
							)}
						</div>

						<div className="flex gap-2 border-t border-white/5 pt-3">
							<LinkAction
								to="/admin/quotes/baru"
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
