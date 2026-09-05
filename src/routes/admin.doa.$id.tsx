import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Action,
	Field,
	FormShell,
	GlassCard,
	PageHead,
	SelectInput,
	TextArea,
	TextInput,
} from "@/components/kit";
import { fetchPrayer, editPrayer } from "@/functions/konten";

export const Route = createFileRoute("/admin/doa/$id")({
	loader: ({ params }) => fetchPrayer({ data: params.id }),
	head: () => ({
		meta: [
			{ title: "Edit Doa — Simfoni Cinta" },
			{
				name: "description",
				content: "Perbarui teks doa dan ayat suci pernikahan.",
			},
		],
	}),
	component: EditPrayerPage,
});

function EditPrayerPage() {
	const { id } = Route.useParams();
	const prayer = Route.useLoaderData();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		title: prayer?.title ?? "",
		category: prayer?.category ?? "Islam",
		original: prayer?.original ?? "",
		latin: prayer?.latin ?? "",
		translation: prayer?.translation ?? "",
	});
	const [loading, setLoading] = useState(false);

	if (!prayer) {
		return (
			<>
				<PageHead title="Edit Doa" back="/admin/doa" />
				<GlassCard className="p-6 text-sm text-helper">
					Data tidak ditemukan.
				</GlassCard>
			</>
		);
	}

	const submit = async () => {
		setLoading(true);
		await editPrayer({ data: { id, body: form } });
		setLoading(false);
		navigate({ to: "/admin/doa" });
	};

	return (
		<>
			<PageHead title="Edit Doa" back="/admin/doa" />
			<FormShell
				actions={
					<>
						<Action tone="ghost" onClick={() => navigate({ to: "/admin/doa" })}>
							Batal
						</Action>
						<Action tone="gold" onClick={submit} disabled={loading}>
							{loading ? "Menyimpan…" : "Simpan"}
						</Action>
					</>
				}
			>
				<Field label="Judul">
					<TextInput
						placeholder="Judul"
						value={form.title}
						onChange={(event) =>
							setForm({ ...form, title: event.target.value })
						}
					/>
				</Field>
				<Field label="Kategori">
					<SelectInput
						value={form.category}
						onChange={(event) =>
							setForm({ ...form, category: event.target.value })
						}
					>
						{["Islam", "Kristen", "Katolik", "Hindu", "Budha", "Nasional"].map(
							(item) => (
								<option key={item}>{item}</option>
							),
						)}
					</SelectInput>
				</Field>
				<Field label="Teks Asli">
					<TextArea
						placeholder="Teks"
						value={form.original}
						onChange={(event) =>
							setForm({ ...form, original: event.target.value })
						}
					/>
				</Field>
				<Field label="Latin">
					<TextArea
						placeholder="Latin"
						value={form.latin}
						onChange={(event) =>
							setForm({ ...form, latin: event.target.value })
						}
					/>
				</Field>
				<Field label="Terjemahan">
					<TextArea
						placeholder="Arti"
						value={form.translation}
						onChange={(event) =>
							setForm({ ...form, translation: event.target.value })
						}
					/>
				</Field>
			</FormShell>
		</>
	);
}
