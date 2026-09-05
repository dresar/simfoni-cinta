import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	Action,
	Avatar,
	ConfirmDelete,
	initialsOf,
	LinkAction,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
} from "@/components/kit";
import { fetchUsers, removeUser } from "@/functions/users";
import { CalendarDays, Mail, Phone, Layers } from "lucide-react";

export const Route = createFileRoute("/admin/pengguna/")({
	loader: () => fetchUsers(),
	head: () => ({
		meta: [
			{ title: "Kelola Pengguna — Simfoni Cinta" },
			{
				name: "description",
				content: "Daftar akun pengantin dan admin pada platform Simfoni Cinta.",
			},
		],
	}),
	component: UsersPage,
});

const tierTone: Record<string, "gold" | "matcha" | "info" | "neutral"> = {
	Owner: "gold",
	Gold: "gold",
	Platinum: "info",
	Free: "neutral",
};

const statusTone: Record<string, "matcha" | "danger" | "neutral"> = {
	Aktif: "matcha",
	Ditangguhkan: "danger",
	Diblokir: "danger",
};

function UserCard({
	item,
	onDelete,
}: {
	item: ReturnType<typeof useUsers>[number];
	onDelete: (id: string) => void;
}) {
	const isAdmin = item.role === "admin";

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition hover:border-white/[0.14] hover:bg-white/[0.05]">
			<div className="flex items-start gap-3 p-4">
				<Avatar
					text={initialsOf(item.name)}
					tone={isAdmin ? "gold" : "matcha"}
					size="lg"
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate font-display text-sm font-semibold text-white">
						{item.name}
					</p>
					<div className="mt-1 flex flex-wrap gap-1.5">
						<Pill tone={isAdmin ? "gold" : "matcha"} className="text-[10px]">
							{isAdmin ? "Admin" : "Pengantin"}
						</Pill>
						<Pill
							tone={tierTone[item.tier] ?? "neutral"}
							className="text-[10px]"
						>
							{item.tier}
						</Pill>
						<Pill
							tone={statusTone[item.status] ?? "neutral"}
							className="text-[10px]"
						>
							{item.status}
						</Pill>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-2 border-t border-white/[0.06] px-4 py-3">
				<div className="flex items-center gap-2 text-xs text-white/50">
					<Mail className="size-3 shrink-0 text-white/30" />
					<span className="truncate">{item.email}</span>
				</div>
				{"phone" in item && item.phone ? (
					<div className="flex items-center gap-2 text-xs text-white/50">
						<Phone className="size-3 shrink-0 text-white/30" />
						<span>{String(item.phone)}</span>
					</div>
				) : null}
				<div className="flex items-center justify-between text-xs text-white/40">
					<div className="flex items-center gap-2">
						<Layers className="size-3 shrink-0 text-white/30" />
						<span>
							{item.invitations} / {item.quota === 999 ? "∞" : item.quota}{" "}
							undangan
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<CalendarDays className="size-3 text-white/20" />
						<span>{item.joined}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
				<LinkAction
					to="/admin/pengguna/$id"
					params={{ id: item.id }}
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
					onClick={() => onDelete(item.id)}
				>
					Hapus
				</Action>
			</div>
		</div>
	);
}

function useUsers() {
	return Route.useLoaderData();
}

function UsersPage() {
	const users = Route.useLoaderData();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);

	const rows = useMemo(
		() =>
			users.filter((item) => {
				const matchQuery = `${item.name} ${item.email}`
					.toLowerCase()
					.includes(query.toLowerCase());
				const matchFilter =
					filter === "Semua" ||
					(filter === "Admin" ? item.role === "admin" : item.tier === filter);
				return matchQuery && matchFilter;
			}),
		[users, query, filter],
	);

	async function handleDelete() {
		if (!pending) return;
		await removeUser({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<PageHead title="Pengguna" subtitle="Akun terdaftar">
				<Pill tone="matcha">{users.length} akun</Pill>
				<TextInput
					placeholder="Cari nama atau email…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-40 sm:w-56"
				/>
				<SelectInput
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					className="w-32"
				>
					{["Semua", "Admin", "Free", "Gold", "Platinum"].map((item) => (
						<option key={item}>{item}</option>
					))}
				</SelectInput>
				<LinkAction to="/admin/pengguna/baru" tone="gold" size="sm">
					+ Tambah
				</LinkAction>
			</PageHead>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{rows.map((item) => (
					<UserCard key={item.id} item={item} onDelete={setPending} />
				))}
			</div>

			{rows.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
					<p className="text-sm font-medium text-white/30">
						Tidak ada pengguna ditemukan
					</p>
				</div>
			)}

			<div className="mt-4 text-xs text-white/30">
				{rows.length} dari {users.length} pengguna
			</div>

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
