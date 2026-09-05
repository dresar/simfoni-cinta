import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookHeart,
	CreditCard,
	Eye,
	Mail,
	MessageSquareHeart,
	Music,
	Quote,
	ServerCog,
	Sparkles,
	TrendingUp,
	Users,
	ArrowRight,
	Activity,
} from "lucide-react";
import {
	Avatar,
	GlassCard,
	initialsOf,
	LinkAction,
	PageHead,
	Pill,
	formatIdr,
} from "@/components/kit";
import { fetchInvitations } from "@/functions/invitations";
import { fetchUsers } from "@/functions/users";
import { fetchRsvps, fetchOrders } from "@/functions/transaksi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
	loader: async () => {
		const [users, invitations, rsvps, orders] = await Promise.all([
			fetchUsers(),
			fetchInvitations(),
			fetchRsvps(),
			fetchOrders(),
		]);
		return { users, invitations, rsvps, orders };
	},
	head: () => ({
		meta: [
			{ title: "Ikhtisar Admin — Simfoni Cinta" },
			{
				name: "description",
				content: "Ringkasan performa platform undangan digital Simfoni Cinta.",
			},
		],
	}),
	component: AdminOverview,
});

const shortcuts = [
	{
		to: "/admin/template",
		label: "Template",
		icon: Sparkles,
		desc: "Kelola desain",
	},
	{
		to: "/admin/doa",
		label: "Doa & Ayat",
		icon: BookHeart,
		desc: "Konten doa",
	},
	{
		to: "/admin/quotes",
		label: "Quotes",
		icon: Quote,
		desc: "Kutipan mutiara",
	},
	{ to: "/admin/musik", label: "Musik", icon: Music, desc: "Library audio" },
	{
		to: "/admin/sistem",
		label: "Sistem",
		icon: ServerCog,
		desc: "Konfigurasi",
	},
];

type StatCardProps = {
	label: string;
	value: string;
	sub: string;
	icon: React.ElementType;
	accent: string;
	iconBg: string;
};

function StatCard({
	label,
	value,
	sub,
	icon: Icon,
	accent,
	iconBg,
}: StatCardProps) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-xl border bg-[#0f141c]/90 p-3 sm:p-4 transition-all duration-200 hover:scale-[1.01] shadow-xs",
				accent,
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
						{label}
					</p>
					<p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
						{value}
					</p>
					<div className="mt-1 flex items-center gap-1">
						<TrendingUp className="size-2.5 text-slate-500 shrink-0" />
						<p className="text-[10px] text-slate-400 truncate">{sub}</p>
					</div>
				</div>
				<div
					className={cn(
						"flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg",
						iconBg,
					)}
				>
					<Icon className="size-4" />
				</div>
			</div>
		</div>
	);
}

function SectionHeader({
	title,
	to,
	label,
}: {
	title: string;
	to: string;
	label: string;
}) {
	return (
		<div className="mb-3 flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Activity className="size-3.5 text-slate-500" />
				<h2 className="text-xs sm:text-sm font-semibold text-slate-200">
					{title}
				</h2>
			</div>
			<Link
				to={to}
				className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[#c9a96e]/80 transition-colors hover:text-[#c9a96e]"
			>
				{label}
				<ArrowRight className="size-3" />
			</Link>
		</div>
	);
}

function AdminOverview() {
	const { users, invitations, rsvps, orders } = Route.useLoaderData();

	const totalRevenue = orders
		.filter((o) => o.status === "Lunas")
		.reduce((sum, o) => sum + o.amount, 0);
	const hadirCount = rsvps.filter((r) => r.attendance === "Hadir").length;
	const aktifCount = invitations.filter((i) => i.status === "Aktif").length;
	const premiumUsers = users.filter((u) => u.tier !== "Free").length;

	return (
		<>
			<PageHead title="Ikhtisar" subtitle="Ringkasan performa platform">
				<LinkAction to="/admin/pengguna/baru" tone="ghost" size="sm">
					+ Pengguna
				</LinkAction>
				<LinkAction to="/admin/undangan/baru" tone="gold" size="sm">
					+ Undangan
				</LinkAction>
			</PageHead>

			<div className="grid gap-2.5 sm:gap-3 grid-cols-2 xl:grid-cols-4">
				<StatCard
					label="Total Pengguna"
					value={String(users.length)}
					sub={`${premiumUsers} premium`}
					icon={Users}
					accent="border-emerald-500/20 bg-emerald-500/5"
					iconBg="bg-emerald-500/15 text-emerald-400"
				/>
				<StatCard
					label="Undangan"
					value={String(invitations.length)}
					sub={`${aktifCount} aktif`}
					icon={Mail}
					accent="border-amber-500/20 bg-amber-500/5"
					iconBg="bg-amber-500/15 text-amber-400"
				/>
				<StatCard
					label="Total RSVP"
					value={String(rsvps.length)}
					sub={`${hadirCount} hadir`}
					icon={MessageSquareHeart}
					accent="border-blue-500/20 bg-blue-500/5"
					iconBg="bg-blue-500/15 text-blue-400"
				/>
				<StatCard
					label="Pendapatan"
					value={formatIdr(totalRevenue)}
					sub={`${orders.filter((o) => o.status === "Lunas").length} transaksi`}
					icon={CreditCard}
					accent="border-purple-500/20 bg-purple-500/5"
					iconBg="bg-purple-500/15 text-purple-400"
				/>
			</div>

			<div className="mt-5 grid gap-4 lg:grid-cols-2">
				<GlassCard className="p-5">
					<SectionHeader
						title="Undangan Terbaru"
						to="/admin/undangan"
						label="Lihat semua"
					/>
					<div className="space-y-2">
						{invitations.slice(0, 5).map((item) => (
							<div
								key={item.id}
								className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
							>
								<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9a96e]/10 text-[#c9a96e]">
									<Mail className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-slate-200">
										{item.groom} & {item.bride}
									</p>
									<p className="truncate font-mono text-[11px] text-slate-500">
										/u/{item.slug}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<span className="flex items-center gap-1 text-[11px] text-slate-500">
										<Eye className="size-3" />
										{item.views}
									</span>
									<Pill tone={item.status === "Aktif" ? "matcha" : "neutral"}>
										{item.status}
									</Pill>
								</div>
							</div>
						))}
						{invitations.length === 0 && (
							<p className="py-6 text-center text-sm text-slate-600">
								Belum ada undangan
							</p>
						)}
					</div>
				</GlassCard>

				<GlassCard className="p-5">
					<SectionHeader
						title="Pengguna Terbaru"
						to="/admin/pengguna"
						label="Lihat semua"
					/>
					<div className="space-y-2">
						{users.slice(0, 5).map((item) => (
							<div
								key={item.id}
								className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
							>
								<Avatar
									text={initialsOf(item.name)}
									tone={item.role === "admin" ? "gold" : "matcha"}
									size="sm"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-slate-200">
										{item.name}
									</p>
									<p className="truncate text-[11px] text-slate-500">
										{item.email}
									</p>
								</div>
								<Pill
									tone={
										item.tier === "Owner"
											? "gold"
											: item.tier === "Free"
												? "neutral"
												: "matcha"
									}
								>
									{item.tier}
								</Pill>
							</div>
						))}
						{users.length === 0 && (
							<p className="py-6 text-center text-sm text-slate-600">
								Belum ada pengguna
							</p>
						)}
					</div>
				</GlassCard>
			</div>

			<div className="mt-4">
				<p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
					Akses Cepat
				</p>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					{shortcuts.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="group flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all duration-200 hover:border-[#c9a96e]/20 hover:bg-[#c9a96e]/5"
						>
							<div className="flex size-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] transition-all group-hover:border-[#c9a96e]/30 group-hover:bg-[#c9a96e]/10">
								<item.icon className="size-4 text-slate-400 transition-colors group-hover:text-[#c9a96e]" />
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-300">
									{item.label}
								</p>
								<p className="text-[10px] text-slate-600">{item.desc}</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</>
	);
}
