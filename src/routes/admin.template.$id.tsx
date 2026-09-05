import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
	Action,
	Field,
	FormShell,
	ImageUploadField,
	PageHead,
	SelectInput,
	TextInput,
} from "@/components/kit";
import {
	fetchTemplate,
	editTemplate,
	fetchTemplateCategories,
} from "@/functions/media";
import { cn } from "@/lib/utils";

const PALET = [
	{
		label: "Emas Klasik",
		value: "gold",
		colors: ["#c9a96e", "#f5e6c8", "#1a1206"],
	},
	{
		label: "Zamrud Tropis",
		value: "emerald",
		colors: ["#10b981", "#a7f3d0", "#022c22"],
	},
	{
		label: "Mawar Merah",
		value: "rose",
		colors: ["#f43f5e", "#fecdd3", "#1c0008"],
	},
	{
		label: "Langit Biru",
		value: "sky",
		colors: ["#0ea5e9", "#bae6fd", "#012638"],
	},
	{
		label: "Lavender",
		value: "violet",
		colors: ["#8b5cf6", "#ede9fe", "#150b26"],
	},
	{
		label: "Cokelat Sutra",
		value: "copper",
		colors: ["#b45309", "#fde68a", "#18100a"],
	},
] as const;

export const Route = createFileRoute("/admin/template/$id")({
	loader: async ({ params }) => {
		const [template, categories] = await Promise.all([
			fetchTemplate({ data: params.id }),
			fetchTemplateCategories(),
		]);
		return { template, categories };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `Edit Template: ${loaderData?.template?.name ?? "Template"} — Simfoni Cinta`,
			},
			{
				name: "description",
				content: "Sunting detail dan konfigurasi template undangan.",
			},
		],
	}),
	component: EditTemplatePage,
});

function EditTemplatePage() {
	const { template, categories } = Route.useLoaderData();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [isCustomCat, setIsCustomCat] = useState(false);
	const [form, setForm] = useState({
		name: template?.name ?? "",
		slug: template?.slug ?? "",
		tag: template?.tag ?? "",
		category: template?.category ?? "Tradisional",
		theme: template?.theme ?? "gold",
		thumb: template?.thumb ?? "",
		sortOrder: template?.sortOrder ?? 999,
		active: true,
	});

	const categoryList = useMemo(() => {
		const list = categories.map((c) => c.name);
		if (form.category && !list.includes(form.category)) {
			list.push(form.category);
		}
		return list;
	}, [categories, form.category]);

	async function submit() {
		if (!form.name.trim()) {
			toast.error("Nama template wajib diisi.");
			return;
		}
		if (!form.category.trim()) {
			toast.error("Kategori wajib dipilih atau diisi.");
			return;
		}
		setLoading(true);
		try {
			await editTemplate({
				data: {
					id: template!.id,
					name: form.name,
					slug: form.slug,
					tag: form.tag,
					category: form.category,
					theme: form.theme,
					thumb: form.thumb,
					sortOrder: Number(form.sortOrder) || 999,
				},
			});
			toast.success("Template berhasil diperbarui.");
			navigate({ to: "/admin/template" });
		} catch (e: any) {
			toast.error(e.message || "Gagal memperbarui template.");
		} finally {
			setLoading(false);
		}
	}

	const selectedPalet = PALET.find((p) => p.value === form.theme) ?? PALET[0];

	return (
		<>
			<PageHead
				title={`Edit ${template?.name ?? "Template"}`}
				back="/admin/template"
			/>
			<div className="max-w-4xl mx-auto">
				<FormShell
					actions={
						<>
							<Action
								tone="ghost"
								onClick={() => navigate({ to: "/admin/template" })}
							>
								Batal
							</Action>
							<Action tone="gold" onClick={submit} disabled={loading}>
								{loading ? "Menyimpan…" : "Simpan Perubahan"}
							</Action>
						</>
					}
				>
					<Field label="Nama Template">
						<TextInput
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							placeholder="cth: Aksara Javanese Gold"
						/>
					</Field>

					<Field label="Slug URL">
						<TextInput
							value={form.slug}
							onChange={(e) =>
								setForm({
									...form,
									slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
								})
							}
							placeholder="cth: aksara-javanese-gold"
						/>
					</Field>

					<Field label="Tagline / Badge">
						<TextInput
							value={form.tag}
							onChange={(e) => setForm({ ...form, tag: e.target.value })}
							placeholder="cth: Adat Nusantara, Premium, New, Terlaris"
						/>
					</Field>

					<Field label="Nomor Urutan Prioritas (Sort Order)">
						<TextInput
							type="number"
							value={String(form.sortOrder)}
							onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
							placeholder="cth: 1 untuk urutan paling atas/pertama (001)"
						/>
					</Field>

					<Field label="Kategori">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<SelectInput
									value={form.category}
									onChange={(e) => {
										if (e.target.value === "__custom__") {
											setIsCustomCat(true);
											setForm({ ...form, category: "" });
										} else {
											setIsCustomCat(false);
											setForm({ ...form, category: e.target.value });
										}
									}}
									className="flex-1"
								>
									{categoryList.map((k) => (
										<option key={k} value={k}>
											{k}
										</option>
									))}
									<option value="__custom__">
										+ Ketik Kategori Kustom Baru…
									</option>
								</SelectInput>
							</div>

							{isCustomCat && (
								<div className="pt-1">
									<TextInput
										placeholder="Ketik nama kategori baru di sini…"
										value={form.category}
										onChange={(e) =>
											setForm({ ...form, category: e.target.value })
										}
										autoFocus
									/>
									<p className="text-[11px] text-primary/80 mt-1">
										Kategori baru ini akan otomatis tersimpan dan muncul di
										filter publik.
									</p>
								</div>
							)}
						</div>
					</Field>

					<Field label="Palet Warna">
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
							{PALET.map((palet) => (
								<button
									key={palet.value}
									type="button"
									onClick={() => setForm({ ...form, theme: palet.value })}
									className={cn(
										"group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all",
										form.theme === palet.value
											? "border-amber-500/60 bg-amber-500/10"
											: "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/5",
									)}
									aria-label={palet.label}
									aria-pressed={form.theme === palet.value}
								>
									<div className="flex gap-0.5">
										{palet.colors.map((color) => (
											<span
												key={color}
												className="block size-3.5 rounded-full ring-1 ring-black/20"
												style={{ backgroundColor: color }}
											/>
										))}
									</div>
									<span className="line-clamp-1 text-[9px] text-white/50">
										{palet.label}
									</span>
									{form.theme === palet.value && (
										<span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500">
											<Check className="size-2.5 text-white" />
										</span>
									)}
								</button>
							))}
						</div>
						{selectedPalet && (
							<p className="mt-2 text-xs text-white/30">
								Palet aktif: {selectedPalet.label} —{" "}
								{selectedPalet.colors.join(" · ")}
							</p>
						)}
					</Field>

					<Field label="Thumbnail Mockup Cover">
						<ImageUploadField
							value={form.thumb}
							onChange={(url) => setForm({ ...form, thumb: url })}
							aspect="video"
						/>
					</Field>

					<Field label="Status">
						<div className="flex items-center gap-3">
							<button
								type="button"
								role="switch"
								aria-checked={form.active}
								onClick={() => setForm({ ...form, active: !form.active })}
								className={cn(
									"relative inline-flex h-6 w-11 items-center rounded-full border transition-all",
									form.active
										? "border-amber-500/40 bg-amber-500/20"
										: "border-white/10 bg-white/5",
								)}
							>
								<span
									className={cn(
										"inline-block size-4 rounded-full shadow transition-all",
										form.active
											? "translate-x-6 bg-amber-400"
											: "translate-x-1 bg-white/30",
									)}
								/>
							</button>
							<span className="text-sm text-white/60">
								{form.active
									? "Aktif — tampil di katalog"
									: "Non-aktif — disembunyikan"}
							</span>
						</div>
					</Field>
				</FormShell>
			</div>
		</>
	);
}
