import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	Action,
	ConfirmDelete,
	DataTable,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
} from "@/components/kit";
import { fetchRsvps, removeRsvp } from "@/functions/transaksi";

export const Route = createFileRoute("/admin/rsvp")({
	loader: () => fetchRsvps(),
	head: () => ({
		meta: [
			{ title: "RSVP — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Pantau dan kelola RSVP serta ucapan dari seluruh tamu undangan.",
			},
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: RsvpPage,
});

function RsvpPage() {
	const rsvps = Route.useLoaderData();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);

	const rows = useMemo(
		() =>
			rsvps.filter((item) => {
				const matchQuery = `${item.guest} ${item.slug}`
					.toLowerCase()
					.includes(query.toLowerCase());
				const matchFilter = filter === "Semua" || item.attendance === filter;
				return matchQuery && matchFilter;
			}),
		[rsvps, query, filter],
	);

	const hadir = rsvps.filter((r) => r.attendance === "Hadir").length;

	function exportCsv() {
		const headers = ["Tamu", "Undangan", "Kehadiran", "Pax", "Pesan", "Waktu"];
		const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
		const lines = [
			headers.join(","),
			...rows.map((r) =>
				[r.guest, r.slug, r.attendance, r.pax, r.message, r.time]
					.map(escape)
					.join(","),
			),
		];
		const blob = new Blob([lines.join("\r\n")], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "rsvp.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleDelete() {
		if (!pending) return;
		await removeRsvp({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<PageHead title="RSVP" subtitle="Respons tamu">
				<Pill tone="success">{hadir} hadir</Pill>
				<Pill tone="matcha">{rsvps.length} total</Pill>
				<TextInput
					placeholder="Cari"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-40 sm:w-56"
				/>
				<Action tone="matcha" size="sm" onClick={exportCsv}>
					Export CSV
				</Action>
				<SelectInput
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					className="w-36"
				>
					{["Semua", "Hadir", "Ragu", "Tidak Hadir"].map((item) => (
						<option key={item}>{item}</option>
					))}
				</SelectInput>
			</PageHead>

			<DataTable
				head={[
					"Tamu",
					"Undangan",
					"Kehadiran",
					"Pax",
					"Pesan",
					"Waktu",
					"Aksi",
				]}
			>
				{rows.map((item) => (
					<tr key={item.id} className="transition-colors hover:bg-surface/40">
						<td className="px-4 py-3 font-semibold">{item.guest}</td>
						<td className="px-4 py-3 font-mono text-xs text-helper">
							{item.slug}
						</td>
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
						<td className="px-4 py-3 text-xs text-helper max-w-xs truncate">
							{item.message}
						</td>
						<td className="px-4 py-3 text-xs text-helper">{item.time}</td>
						<td className="px-4 py-3">
							<Action
								tone="danger"
								size="sm"
								onClick={() => setPending(item.id)}
							>
								Hapus
							</Action>
						</td>
					</tr>
				))}
			</DataTable>

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
