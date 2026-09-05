import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, Eye, X, MessageSquareText } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Action,
	Avatar,
	ConfirmDelete,
	GlassCard,
	LinkAction,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
	initialsOf,
} from "@/components/kit";
import { fetchInvitations, removeInvitation } from "@/functions/invitations";
import { fetchTemplates } from "@/functions/media";
import { fetchUsers } from "@/functions/users";
import { fetchOrders } from "@/functions/transaksi";

export const Route = createFileRoute("/admin/undangan/")({
	loader: async () => {
		const [invitations, templates, users, orders] = await Promise.all([
			fetchInvitations(),
			fetchTemplates(),
			fetchUsers(),
			fetchOrders(),
		]);
		return { invitations, templates, users, orders };
	},
	head: () => ({
		meta: [
			{ title: "Kelola Undangan — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Seluruh undangan pernikahan digital yang terdaftar di platform.",
			},
		],
	}),
	component: InvitationsPage,
});

function PreviewModal({
	slug,
	onClose,
}: {
	slug: string;
	onClose: () => void;
}) {
	const demoUrl = `/demo/${slug}/index.html`;
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
			onClick={onClose}
		>
			<div
				className="relative flex h-full max-h-[92vh] w-full max-w-sm flex-col gap-3"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
					<span className="font-mono text-xs text-white/50">/demo/{slug}</span>
					<div className="flex items-center gap-2">
						<a
							href={`/demo/${slug}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-amber-500/40 hover:text-amber-400"
							aria-label="Buka di tab baru"
						>
							<ExternalLink className="size-3.5" />
						</a>
						<button
							onClick={onClose}
							className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-white/20 hover:text-white"
							aria-label="Tutup preview"
						>
							<X className="size-3.5" />
						</button>
					</div>
				</div>
				<div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
					<iframe
						src={demoUrl}
						className="size-full border-0"
						title={`Preview template ${slug}`}
						loading="eager"
						allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
					/>
				</div>
			</div>
		</div>
	);
}

const STATUS_OPTIONS = ["Semua", "Aktif", "Draf"];

function InvitationsPage() {
	const { invitations, templates } = Route.useLoaderData();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Semua");
	const [templateFilter, setTemplateFilter] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const templateNames = useMemo(() => {
		const names = Array.from(new Set(invitations.map((i) => i.template)));
		return ["Semua", ...names];
	}, [invitations]);

	const rows = useMemo(
		() =>
			invitations.filter((item) => {
				const matchQuery =
					`${item.title} ${item.groom} ${item.bride} ${item.ownerName || ""} ${(item as any).buyerNotes || ""} ${(item as any).packageTier || ""}`
						.toLowerCase()
						.includes(query.toLowerCase());
				const matchStatus =
					statusFilter === "Semua" || item.status === statusFilter;
				const matchTemplate =
					templateFilter === "Semua" || item.template === templateFilter;
				return matchQuery && matchStatus && matchTemplate;
			}),
		[invitations, query, statusFilter, templateFilter],
	);

	async function handleDelete() {
		if (!pending) return;
		await removeInvitation({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<PageHead title="Undangan" subtitle="Seluruh undangan terdaftar">
				<Pill tone="gold">{invitations.length} undangan</Pill>
			</PageHead>

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<TextInput
					placeholder="Cari nama, slug, pemilik…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="min-w-0 flex-1 sm:max-w-xs"
				/>
				<SelectInput
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="w-36"
				>
					{STATUS_OPTIONS.map((s) => (
						<option key={s}>{s}</option>
					))}
				</SelectInput>
				<SelectInput
					value={templateFilter}
					onChange={(e) => setTemplateFilter(e.target.value)}
					className="w-44"
				>
					{templateNames.map((t) => (
						<option key={t}>{t}</option>
					))}
				</SelectInput>
				<span className="text-xs text-white/40">{rows.length} hasil</span>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{rows.map((item) => {
					const owner = item.ownerName;
					return (
						<GlassCard
							key={item.id}
							className="flex flex-col gap-0 overflow-hidden p-0"
						>
							<div className="flex items-start gap-3 p-4 pb-3">
								<Avatar
									text={initialsOf(`${item.groom} ${item.bride}`)}
									tone="gold"
									size="md"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate font-display text-sm font-semibold text-white">
										{item.groom} & {item.bride}
									</p>
									<p className="font-mono text-xs text-white/40">
										/u/{item.slug}
									</p>
									<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
										<Pill tone="gold" className="text-[10px]">
											Paket {(item as any).packageTier || "Silver"}
										</Pill>
										<Pill
											tone={item.status === "Aktif" ? "matcha" : "neutral"}
											className="text-[10px]"
										>
											{item.status}
										</Pill>
										<span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
											{item.template}
										</span>
										{item.liveUrl ? (
											<Pill tone="success" className="text-[10px]">
												Link Siap
											</Pill>
										) : item.status === "Aktif" ? (
											<Pill tone="matcha" className="text-[10px]">
												Siap Terbit
											</Pill>
										) : (
											<Pill tone="gold" className="text-[10px]">
												Pending Provider
											</Pill>
										)}
									</div>
								</div>
							</div>

							{(item as any).buyerNotes && (
								<div className="mx-4 mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs flex items-start gap-2">
									<MessageSquareText className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
									<div className="min-w-0 flex-1">
										<p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
											Catatan Pembeli:
										</p>
										<p className="line-clamp-2 text-[11px] text-amber-100 italic font-mono">
											"{(item as any).buyerNotes}"
										</p>
									</div>
								</div>
							)}

							<div className="border-t border-white/[0.06] px-4 py-2.5">
								<div className="flex items-center justify-between text-xs text-white/40">
									<span className="truncate">{owner}</span>
									<div className="flex items-center gap-2 pl-2 shrink-0">
										<Eye className="size-3" />
										<span>{item.views.toLocaleString("id")}</span>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
								<LinkAction
									to="/admin/undangan/$id"
									params={{ id: item.id }}
									tone="gold"
									size="sm"
									className="flex-1 justify-center"
								>
									🔍 Detail Pengajuan
								</LinkAction>

								<Action
									tone="danger"
									size="sm"
									className="flex size-8 shrink-0 items-center justify-center px-0"
									onClick={() => setPending(item.id)}
									aria-label="Hapus undangan"
								>
									<X className="size-3.5" />
								</Action>
							</div>
						</GlassCard>
					);
				})}
			</div>

			{rows.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
					<p className="text-sm font-medium text-white/30">
						Tidak ada undangan ditemukan
					</p>
				</div>
			)}

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>

			{preview !== null && (
				<PreviewModal slug={preview} onClose={() => setPreview(null)} />
			)}
		</>
	);
}
