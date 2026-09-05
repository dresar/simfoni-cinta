import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Action,
	Field,
	FormShell,
	PageHead,
	SelectInput,
	TextArea,
	TextInput,
} from "@/components/kit";
import { createId } from "@/store/appStore";
import { addSacredText } from "@/functions/konten";

export const Route = createFileRoute("/admin/surat/baru")({
	head: () => ({
		meta: [
			{ title: "Tambah Teks — Simfoni Cinta" },
			{
				name: "description",
				content: "Tambahkan salam pembuka atau doa penutup undangan.",
			},
		],
	}),
	component: NewSacredPage,
});

function NewSacredPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ title: "", category: "Islam", body: "" });
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		setLoading(true);
		await addSacredText({
			data: {
				id: createId("s"),
				title: form.title || "Teks Baru",
				category: form.category,
				body: form.body,
			},
		});
		setLoading(false);
		navigate({ to: "/admin/surat" });
	};

	return (
		<>
			<PageHead title="Tambah Teks" back="/admin/surat" />
			<FormShell
				actions={
					<>
						<Action
							tone="ghost"
							onClick={() => navigate({ to: "/admin/surat" })}
						>
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
						{[
							"Islam",
							"Kristen",
							"Katolik",
							"Hindu",
							"Budha",
							"Nasional",
							"Universal",
						].map((item) => (
							<option key={item}>{item}</option>
						))}
					</SelectInput>
				</Field>
				<div className="sm:col-span-2">
					<Field label="Teks">
						<TextArea
							placeholder="Teks"
							value={form.body}
							onChange={(event) =>
								setForm({ ...form, body: event.target.value })
							}
						/>
					</Field>
				</div>
			</FormShell>
		</>
	);
}
