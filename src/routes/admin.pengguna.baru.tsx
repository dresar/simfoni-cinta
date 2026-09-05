import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail, Phone, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Action,
	Field,
	GlassCard,
	ImageUploadField,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
} from "@/components/kit";
import { createId } from "@/store/appStore";
import { addUser } from "@/functions/users";
import { cn } from "@/lib/utils";

type Role = "user" | "admin";

const roleConfig: Record<
	Role,
	{ label: string; tone: "gold" | "matcha"; icon: typeof Shield }
> = {
	admin: { label: "Super Admin", tone: "gold", icon: Shield },
	user: { label: "Pengantin", tone: "matcha", icon: User },
};

export const Route = createFileRoute("/admin/pengguna/baru")({
	head: () => ({
		meta: [
			{ title: "Tambah Pengguna — Simfoni Cinta" },
			{
				name: "description",
				content: "Formulir pembuatan akun pengantin atau admin baru.",
			},
		],
	}),
	component: NewUserPage,
});

function ProfileCard({
	name,
	email,
	phone,
	role,
	quota,
	avatar,
}: {
	name: string;
	email: string;
	phone: string;
	role: Role;
	quota: number;
	avatar: string;
}) {
	const config = roleConfig[role];
	const RoleIcon = config.icon;
	const joinedDisplay = new Date().toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return (
		<GlassCard className="border-white/10 bg-white/[0.04] p-3.5 sm:p-4">
			<p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/30">
				Preview Kartu Profil
			</p>

			<div className="flex flex-col items-center gap-3 text-center">
				<div className="relative">
					{avatar ? (
						<img
							src={avatar}
							alt={name || "Avatar"}
							className="size-16 rounded-full object-cover ring-2 ring-amber-500/30 ring-offset-2 ring-offset-[#0f141c]"
						/>
					) : (
						<div className="flex size-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/10 ring-offset-2 ring-offset-[#0f141c]">
							<User className="size-6 text-white/30" />
						</div>
					)}
					<span
						className={cn(
							"absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-[#0f141c]",
							role === "admin" ? "bg-amber-500" : "bg-emerald-500",
						)}
					>
						<RoleIcon className="size-2.5 text-white" />
					</span>
				</div>

				<div className="space-y-0.5">
					<h3 className="font-serif text-sm sm:text-base font-bold text-white">
						{name || "Nama Pengguna"}
					</h3>
					<Pill tone={config.tone}>
						<RoleIcon className="size-2.5" />
						{config.label}
					</Pill>
				</div>

				<div className="w-full space-y-1.5 border-t border-white/8 pt-3">
					<div className="flex items-center gap-2 text-left">
						<Mail className="size-3.5 shrink-0 text-white/30" />
						<span className="truncate text-xs text-white/50">
							{email || "email@contoh.com"}
						</span>
					</div>
					{phone && (
						<div className="flex items-center gap-2 text-left">
							<Phone className="size-3.5 shrink-0 text-white/30" />
							<span className="truncate text-xs text-white/50">{phone}</span>
						</div>
					)}
				</div>

				<div className="w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-left">
					<p className="text-[10px] text-white/30">Kuota Undangan</p>
					<p className="mt-0.5 text-lg font-bold text-amber-400">{quota}</p>
				</div>

				<p className="text-[10px] text-white/20">Bergabung {joinedDisplay}</p>
			</div>
		</GlassCard>
	);
}

function NewUserPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		role: "user" as Role,
		quota: 1,
		avatar: "",
		password: "",
	});

	function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	async function submit() {
		if (!form.name || !form.email || !form.password) {
			toast.error("Nama, email, dan password wajib diisi.");
			return;
		}
		setLoading(true);
		try {
			await addUser({
				data: {
					id: createId("usr"),
					name: form.name,
					email: form.email,
					phone: form.phone,
					role: form.role,
					quota: form.quota,
					avatar: form.avatar,
					password: form.password,
				},
			});
			toast.success("Pengguna berhasil dibuat.");
			navigate({ to: "/admin/pengguna" });
		} catch {
			toast.error("Gagal membuat pengguna. Coba lagi.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<PageHead title="Tambah Pengguna Baru" back="/admin/pengguna" />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<GlassCard className="flex flex-col gap-4 p-3.5 sm:p-4 lg:col-span-2">
					<p className="text-xs font-semibold uppercase tracking-widest text-white/30">
						Identitas & Akses
					</p>

					<Field label="Foto Avatar">
						<ImageUploadField
							value={form.avatar}
							onChange={(url) => set("avatar", url)}
							aspect="square"
						/>
					</Field>

					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Nama Lengkap">
							<TextInput
								placeholder="Nama pengguna"
								value={form.name}
								onChange={(e) => set("name", e.target.value)}
							/>
						</Field>
						<Field label="Email">
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
								<TextInput
									type="email"
									placeholder="email@domain.com"
									value={form.email}
									onChange={(e) => set("email", e.target.value)}
									className="pl-8"
								/>
							</div>
						</Field>
						<Field label="No. WhatsApp">
							<div className="relative">
								<Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
								<TextInput
									placeholder="+62..."
									value={form.phone}
									onChange={(e) => set("phone", e.target.value)}
									className="pl-8"
								/>
							</div>
						</Field>
						<Field label="Role">
							<SelectInput
								value={form.role}
								onChange={(e) => set("role", e.target.value as Role)}
							>
								<option value="user">Pengantin</option>
								<option value="admin">Super Admin</option>
							</SelectInput>
						</Field>
						<Field label="Kuota Undangan">
							<TextInput
								type="number"
								min={1}
								value={form.quota}
								onChange={(e) => set("quota", Number(e.target.value))}
							/>
						</Field>
						<Field label="Password">
							<TextInput
								type="password"
								placeholder="Password minimal 8 karakter"
								value={form.password}
								onChange={(e) => set("password", e.target.value)}
							/>
						</Field>
					</div>

					<div className="mt-4 flex justify-end gap-2 border-t border-white/8 pt-3">
						<Action
							tone="ghost"
							size="sm"
							onClick={() => navigate({ to: "/admin/pengguna" })}
						>
							Batal
						</Action>
						<Action tone="gold" size="sm" onClick={submit} disabled={loading}>
							{loading ? "Menyimpan…" : "Buat Pengguna"}
						</Action>
					</div>
				</GlassCard>

				<ProfileCard
					name={form.name}
					email={form.email}
					phone={form.phone}
					role={form.role}
					quota={form.quota}
					avatar={form.avatar}
				/>
			</div>
		</>
	);
}
