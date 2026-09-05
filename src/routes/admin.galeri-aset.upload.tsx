import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
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
import { addAsset } from "@/functions/media";

export const Route = createFileRoute("/admin/galeri-aset/upload")({
	head: () => ({
		meta: [
			{ title: "Upload Aset — Simfoni Cinta" },
			{
				name: "description",
				content: "Unggah ornamen, bingkai, atau tekstur latar undangan.",
			},
			{ property: "og:title", content: "Upload Aset — Simfoni Cinta" },
			{
				property: "og:description",
				content: "Unggah ornamen, bingkai, atau tekstur latar undangan.",
			},
		],
	}),
	component: UploadAssetPage,
});

function UploadAssetPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: "",
		category: "Ornamen",
		size: "1024 x 1024",
		url: "",
	});

	const submit = async () => {
		await addAsset({
			data: {
				id: createId("a"),
				name: form.name || "aset-baru.png",
				category: form.category,
				size: form.size,
				url:
					form.url ||
					"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/cta-banner.jpg",
			},
		});
		navigate({ to: "/admin/galeri-aset" });
	};

	return (
		<>
			<PageHead title="Upload Aset" back="/admin/galeri-aset" />
			<FormShell
				actions={
					<>
						<Action
							tone="ghost"
							onClick={() => navigate({ to: "/admin/galeri-aset" })}
						>
							Batal
						</Action>
						<Action tone="gold" onClick={submit}>
							Simpan
						</Action>
					</>
				}
			>
				<div className="sm:col-span-2">
					<label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
						<ImagePlus className="size-7 text-primary" />
						<span className="text-sm font-semibold">Pilih berkas</span>
						<span className="text-[11px] text-helper">PNG / SVG</span>
						<input
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(event) =>
								setForm({
									...form,
									name: event.target.files?.[0]?.name ?? form.name,
								})
							}
						/>
					</label>
				</div>
				<Field label="Nama">
					<TextInput
						placeholder="Nama"
						value={form.name}
						onChange={(event) => setForm({ ...form, name: event.target.value })}
					/>
				</Field>
				<Field label="Kategori">
					<SelectInput
						value={form.category}
						onChange={(event) =>
							setForm({ ...form, category: event.target.value })
						}
					>
						{["Bingkai", "Ornamen", "Latar", "Pembatas", "Ikon"].map((item) => (
							<option key={item}>{item}</option>
						))}
					</SelectInput>
				</Field>
				<Field label="Dimensi">
					<TextInput
						placeholder="Dimensi"
						value={form.size}
						onChange={(event) => setForm({ ...form, size: event.target.value })}
					/>
				</Field>
				<Field label="URL CDN">
					<TextInput
						placeholder="URL"
						value={form.url}
						onChange={(event) => setForm({ ...form, url: event.target.value })}
					/>
				</Field>
			</FormShell>
		</>
	);
}
