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
import { addQuote } from "@/functions/konten";

export const Route = createFileRoute("/admin/quotes/baru")({
	head: () => ({
		meta: [
			{ title: "Tambah Quotes — Simfoni Cinta" },
			{
				name: "description",
				content: "Tambahkan kutipan cinta baru ke pustaka undangan.",
			},
		],
	}),
	component: NewQuotePage,
});

function NewQuotePage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ text: "", author: "", mood: "Islami" });
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		setLoading(true);
		await addQuote({
			data: {
				id: createId("q"),
				text: form.text || "Kutipan baru",
				author: form.author || "Anonim",
				mood: form.mood,
			},
		});
		setLoading(false);
		navigate({ to: "/admin/quotes" });
	};

	return (
		<>
			<PageHead title="Tambah Quotes" back="/admin/quotes" />
			<FormShell
				actions={
					<>
						<Action
							tone="ghost"
							onClick={() => navigate({ to: "/admin/quotes" })}
						>
							Batal
						</Action>
						<Action tone="gold" onClick={submit} disabled={loading}>
							{loading ? "Menyimpan…" : "Simpan"}
						</Action>
					</>
				}
			>
				<Field label="Kutipan">
					<TextArea
						placeholder="Teks"
						value={form.text}
						onChange={(event) => setForm({ ...form, text: event.target.value })}
					/>
				</Field>
				<Field label="Penulis">
					<TextInput
						placeholder="Penulis"
						value={form.author}
						onChange={(event) =>
							setForm({ ...form, author: event.target.value })
						}
					/>
				</Field>
				<Field label="Mood">
					<SelectInput
						value={form.mood}
						onChange={(event) => setForm({ ...form, mood: event.target.value })}
					>
						{[
							"Islami",
							"Kristen",
							"Katolik",
							"Hindu",
							"Buddha",
							"Romantis",
							"Puitis",
							"Filosofis",
							"Modern",
							"Minimalis",
							"Humor",
						].map((item) => (
							<option key={item}>{item}</option>
						))}
					</SelectInput>
				</Field>
			</FormShell>
		</>
	);
}
