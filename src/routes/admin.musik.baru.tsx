import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Action,
	Field,
	FormShell,
	PageHead,
	SelectInput,
	TextInput,
} from "@/components/kit";
import { createId } from "@/store/appStore";
import { addMusic } from "@/functions/media";

export const Route = createFileRoute("/admin/musik/baru")({
	head: () => ({
		meta: [
			{ title: "Tambah Lagu — Simfoni Cinta" },
			{
				name: "description",
				content: "Tambahkan lagu latar baru ke pustaka musik undangan.",
			},
		],
	}),
	component: NewTrackPage,
});

function NewTrackPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		title: "",
		artist: "",
		genre: "Akustik",
		duration: "03:30",
		url: "",
	});
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		setLoading(true);
		await addMusic({
			data: {
				id: createId("m"),
				title: form.title || "Lagu Baru",
				artist: form.artist || "Anonim",
				genre: form.genre,
				duration: form.duration || "03:30",
				url:
					form.url ||
					"https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3",
			},
		});
		setLoading(false);
		navigate({ to: "/admin/musik" });
	};

	return (
		<>
			<PageHead title="Tambah Lagu" back="/admin/musik" />
			<FormShell
				actions={
					<>
						<Action
							tone="ghost"
							onClick={() => navigate({ to: "/admin/musik" })}
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
				<Field label="Artis">
					<TextInput
						placeholder="Artis"
						value={form.artist}
						onChange={(event) =>
							setForm({ ...form, artist: event.target.value })
						}
					/>
				</Field>
				<Field label="Genre">
					<SelectInput
						value={form.genre}
						onChange={(event) =>
							setForm({ ...form, genre: event.target.value })
						}
					>
						{[
							"Akustik",
							"Piano",
							"Romantis",
							"Islami",
							"Tradisional",
							"Orkestra",
						].map((item) => (
							<option key={item}>{item}</option>
						))}
					</SelectInput>
				</Field>
				<Field label="Durasi">
					<TextInput
						placeholder="Durasi"
						value={form.duration}
						onChange={(event) =>
							setForm({ ...form, duration: event.target.value })
						}
					/>
				</Field>
				<div className="sm:col-span-2">
					<Field label="URL Audio">
						<div className="flex gap-2">
							<TextInput
								placeholder="URL"
								value={form.url}
								onChange={(event) =>
									setForm({ ...form, url: event.target.value })
								}
							/>
							<Action
								tone="ghost"
								type="button"
								onClick={() => form.url && new Audio(form.url).play()}
							>
								Uji
							</Action>
						</div>
					</Field>
				</div>
			</FormShell>
		</>
	);
}
