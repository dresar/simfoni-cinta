import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
	Action,
	Field,
	GlassCard,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
} from "@/components/kit";
import { cn } from "@/lib/utils";
import { createId } from "@/store/appStore";
import { addInvitation, checkSlug } from "@/functions/invitations";
import { fetchTemplates } from "@/functions/media";
import { fetchUsers } from "@/functions/users";

export const Route = createFileRoute("/admin/undangan/baru")({
	loader: async () => {
		const [templates, users] = await Promise.all([
			fetchTemplates(),
			fetchUsers(),
		]);
		return { templates, users };
	},
	head: () => ({
		meta: [
			{ title: "Buat Undangan — Simfoni Cinta" },
			{
				name: "description",
				content: "Formulir pembuatan undangan pernikahan digital baru.",
			},
		],
	}),
	component: NewInvitationPage,
});

type SlugStatus = "idle" | "checking" | "available" | "taken";

function NewInvitationPage() {
	const { templates, users } = Route.useLoaderData();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		slug: "",
		title: "",
		groom: "Mempelai Pria",
		bride: "Mempelai Wanita",
		ownerId: users[0]?.id ?? "u-1",
		template: templates[0]?.name ?? "Matcha Elegan",
		date: new Date().toISOString().slice(0, 10),
		active: true,
	});
	const [loading, setLoading] = useState(false);
	const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (!form.slug.trim()) {
			setSlugStatus("idle");
			return;
		}

		setSlugStatus("checking");

		debounceRef.current = setTimeout(async () => {
			const available = await checkSlug({ data: form.slug.trim() });
			setSlugStatus(available ? "available" : "taken");
		}, 400);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [form.slug]);

	const slugPill = () => {
		if (slugStatus === "checking") return <Pill tone="muted">Memeriksa…</Pill>;
		if (slugStatus === "available") return <Pill tone="success">Tersedia</Pill>;
		if (slugStatus === "taken") return <Pill tone="danger">Digunakan</Pill>;
		return null;
	};

	const submit = async () => {
		if (slugStatus === "taken") return;
		setLoading(true);
		await addInvitation({
			data: {
				id: createId("i"),
				slug: form.slug || createId("undangan"),
				title: form.title || "Undangan Baru",
				groom: form.groom,
				bride: form.bride,
				template: form.template,
				status: form.active ? "Aktif" : "Draf",
				views: 0,
				date: form.date || new Date().toISOString().slice(0, 10),
				ownerId: form.ownerId,
			},
		});
		setLoading(false);
		navigate({ to: "/admin/undangan" });
	};

	return (
		<>
			<PageHead title="Buat Undangan" back="/admin/undangan" />

			<GlassCard className="p-5 sm:p-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Slug">
						<div className="flex items-center gap-2">
							<span className="font-mono text-[11px] text-helper">
								simfonicinta.my.id/u/
							</span>
							<TextInput
								placeholder="Slug"
								value={form.slug}
								onChange={(event) =>
									setForm({ ...form, slug: event.target.value })
								}
							/>
							{slugPill()}
						</div>
					</Field>
					<Field label="Judul">
						<TextInput
							placeholder="Judul"
							value={form.title}
							onChange={(event) =>
								setForm({ ...form, title: event.target.value })
							}
						/>
					</Field>
					<Field label="Mempelai Pria">
						<TextInput
							placeholder="Pria"
							value={form.groom}
							onChange={(event) =>
								setForm({ ...form, groom: event.target.value })
							}
						/>
					</Field>
					<Field label="Mempelai Wanita">
						<TextInput
							placeholder="Wanita"
							value={form.bride}
							onChange={(event) =>
								setForm({ ...form, bride: event.target.value })
							}
						/>
					</Field>
					<Field label="Pemilik">
						<SelectInput
							value={form.ownerId}
							onChange={(event) =>
								setForm({ ...form, ownerId: event.target.value })
							}
						>
							{users.map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
						</SelectInput>
					</Field>
					<Field label="Tanggal">
						<TextInput
							type="date"
							value={form.date}
							onChange={(event) =>
								setForm({ ...form, date: event.target.value })
							}
						/>
					</Field>
				</div>

				<p className="mt-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Template
				</p>
				<div className="mt-2 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
					{templates.map((item) => (
						<button
							key={item.id}
							onClick={() => setForm({ ...form, template: item.name })}
							className={cn(
								"overflow-hidden rounded-2xl border text-left transition-all",
								form.template === item.name
									? "border-primary/60 glow-matcha"
									: "border-border hover:border-primary/30",
							)}
						>
							<img
								src={item.thumb}
								alt={item.name}
								loading="lazy"
								className="h-24 w-full object-cover"
							/>
							<div className="p-3">
								<p className="text-sm font-semibold">{item.name}</p>
								<Pill tone="gold">{item.tag}</Pill>
							</div>
						</button>
					))}
				</div>

				<div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-surface/50 p-3">
					<span className="text-sm font-semibold">Langsung aktif</span>
					<button
						onClick={() => setForm({ ...form, active: !form.active })}
						className={cn(
							"h-7 w-12 rounded-full transition-colors",
							form.active ? "bg-primary" : "bg-secondary",
						)}
						aria-label="Status"
					>
						<span
							className={cn(
								"block size-6 rounded-full bg-background transition-transform",
								form.active && "translate-x-5",
							)}
						/>
					</button>
				</div>

				<div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
					<Action
						tone="ghost"
						onClick={() => navigate({ to: "/admin/undangan" })}
					>
						Batal
					</Action>
					<Action
						tone="gold"
						onClick={submit}
						disabled={loading || slugStatus === "taken"}
					>
						{loading ? "Menyimpan…" : "Buat"}
					</Action>
				</div>
			</GlassCard>
		</>
	);
}
