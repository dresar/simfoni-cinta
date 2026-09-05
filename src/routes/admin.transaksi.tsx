import { createFileRoute } from "@tanstack/react-router";
import { formatIdr, PageHead, Pill } from "@/components/kit";
import { fetchOrders } from "@/functions/transaksi";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
	TrendingUp,
	CheckCircle,
	Clock,
	XCircle,
	Search,
	X,
	Copy,
	ChevronDown,
	Receipt,
	User,
	Package,
	CreditCard,
	Calendar,
	BadgeCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/transaksi")({
	loader: () => fetchOrders(),
	head: () => ({
		meta: [
			{ title: "Transaksi Mayar — Simfoni Cinta" },
			{
				name: "description",
				content: "Riwayat pesanan dan pembayaran paket langganan Mayar.",
			},
		],
	}),
	component: TransactionsPage,
});

type Order = {
	id: string;
	customer: string;
	email: string;
	plan: string;
	amount: number;
	method: string;
	status: string;
	date: string;
};

type StatusFilter = "Semua" | "Lunas" | "Menunggu" | "Kadaluarsa";
type PlanFilter = "Semua" | "Silver" | "Gold" | "Platinum";

const STATUS_TABS: StatusFilter[] = [
	"Semua",
	"Lunas",
	"Menunggu",
	"Kadaluarsa",
];
const PLAN_OPTIONS: PlanFilter[] = ["Semua", "Silver", "Gold", "Platinum"];

function statusTone(status: string) {
	if (status === "Lunas") return "success";
	if (status === "Menunggu") return "gold";
	return "danger";
}

function planTone(plan: string) {
	if (plan === "Platinum") return "gold";
	if (plan === "Silver") return "neutral";
	return "matcha";
}

function KpiCard({
	icon,
	label,
	value,
	accent,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	accent: string;
}) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f141c] p-5 flex flex-col gap-3 shadow-lg",
				"transition-all duration-300 hover:border-white/20 hover:shadow-amber-500/5",
			)}
		>
			<div
				className={cn(
					"w-10 h-10 rounded-xl flex items-center justify-center",
					accent,
				)}
			>
				{icon}
			</div>
			<div>
				<p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1">
					{label}
				</p>
				<p className="text-xl font-bold text-white leading-tight">{value}</p>
			</div>
			<div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-[0.04] bg-white" />
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		Lunas: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
		Menunggu: "bg-amber-500/15 text-amber-300 border-amber-500/30",
		Kadaluarsa: "bg-rose-500/15 text-rose-300 border-rose-500/30",
	};
	const icons: Record<string, React.ReactNode> = {
		Lunas: <BadgeCheck size={12} />,
		Menunggu: <Clock size={12} />,
		Kadaluarsa: <XCircle size={12} />,
	};
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
				styles[status] ?? "bg-white/5 text-white/50 border-white/10",
			)}
		>
			{icons[status]}
			{status}
		</span>
	);
}

function DetailRow({
	icon,
	label,
	children,
}: {
	icon: React.ReactNode;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
			<div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">
					{label}
				</p>
				<div className="text-sm font-medium text-white">{children}</div>
			</div>
		</div>
	);
}

function TransactionModal({
	order,
	onClose,
}: {
	order: Order;
	onClose: () => void;
}) {
	const [copied, setCopied] = useState(false);

	function copyInfo() {
		const text = [
			`Invoice   : ${order.id}`,
			`Status    : ${order.status}`,
			`Pelanggan : ${order.customer}`,
			`Email     : ${order.email}`,
			`Paket     : ${order.plan}`,
			`Tagihan   : ${formatIdr(order.amount)}`,
			`Metode    : ${order.method}`,
			`Tanggal   : ${order.date}`,
		].join("\n");
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
			<div
				className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0d12] shadow-2xl shadow-black/60 overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="px-5 pt-5 pb-4 border-b border-white/8 flex items-start justify-between gap-3">
					<div>
						<div className="flex items-center gap-2 mb-1.5">
							<StatusBadge status={order.status} />
						</div>
						<p className="font-mono text-xs text-amber-400/70">{order.id}</p>
					</div>
					<button
						onClick={onClose}
						className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0"
					>
						<X size={14} />
					</button>
				</div>

				<div className="px-5 py-1">
					<DetailRow icon={<User size={14} />} label="Pelanggan">
						<span className="font-semibold">{order.customer}</span>
						<p className="text-xs text-white/40 font-normal mt-0.5">
							{order.email}
						</p>
					</DetailRow>
					<DetailRow icon={<Package size={14} />} label="Paket">
						<Pill tone={planTone(order.plan)}>{order.plan}</Pill>
					</DetailRow>
					<DetailRow icon={<Receipt size={14} />} label="Total Pembayaran">
						<span className="text-amber-300 font-bold text-base">
							{formatIdr(order.amount)}
						</span>
					</DetailRow>
					<DetailRow icon={<CreditCard size={14} />} label="Metode Pembayaran">
						{order.method}
					</DetailRow>
					<DetailRow icon={<Calendar size={14} />} label="Tanggal Transaksi">
						{order.date}
					</DetailRow>
				</div>

				<div className="px-5 pt-3 pb-5 flex gap-2.5">
					<button
						onClick={copyInfo}
						className={cn(
							"flex-1 h-10 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all",
							copied
								? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
								: "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
						)}
					>
						<Copy size={14} />
						{copied ? "Tersalin!" : "Salin Info"}
					</button>
					<button
						onClick={onClose}
						className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-white/70 hover:text-white transition-all"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	);
}

function TransactionsPage() {
	const orders = Route.useLoaderData();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
	const [planFilter, setPlanFilter] = useState<PlanFilter>("Semua");
	const [planOpen, setPlanOpen] = useState(false);
	const [selected, setSelected] = useState<Order | null>(null);

	const omset = orders
		.filter((o) => o.status === "Lunas")
		.reduce((sum, o) => sum + o.amount, 0);
	const countLunas = orders.filter((o) => o.status === "Lunas").length;
	const countMenunggu = orders.filter((o) => o.status === "Menunggu").length;
	const countGagal = orders.filter((o) => o.status === "Kadaluarsa").length;

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return orders.filter((o) => {
			const matchSearch =
				!q ||
				o.id.toLowerCase().includes(q) ||
				o.customer.toLowerCase().includes(q) ||
				o.email.toLowerCase().includes(q);
			const matchStatus = statusFilter === "Semua" || o.status === statusFilter;
			const matchPlan = planFilter === "Semua" || o.plan === planFilter;
			return matchSearch && matchStatus && matchPlan;
		});
	}, [orders, search, statusFilter, planFilter]);

	return (
		<div className="min-h-screen bg-[#090c10] text-white">
			<PageHead
				title="Transaksi"
				subtitle="Riwayat pesanan & pembayaran Mayar"
			/>

			<div className="px-4 md:px-6 pb-10 space-y-6 max-w-7xl mx-auto">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
					<KpiCard
						icon={<TrendingUp size={18} className="text-amber-400" />}
						label="Total Omset Lunas"
						value={formatIdr(omset)}
						accent="bg-amber-500/15 border border-amber-500/20"
					/>
					<KpiCard
						icon={<CheckCircle size={18} className="text-emerald-400" />}
						label="Transaksi Berhasil"
						value={String(countLunas)}
						accent="bg-emerald-500/15 border border-emerald-500/20"
					/>
					<KpiCard
						icon={<Clock size={18} className="text-sky-400" />}
						label="Menunggu Bayar"
						value={String(countMenunggu)}
						accent="bg-sky-500/15 border border-sky-500/20"
					/>
					<KpiCard
						icon={<XCircle size={18} className="text-rose-400" />}
						label="Gagal / Kadaluarsa"
						value={String(countGagal)}
						accent="bg-rose-500/15 border border-rose-500/20"
					/>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
					<div className="relative w-full sm:w-72">
						<Search
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
						/>
						<input
							type="text"
							placeholder="Cari invoice, nama, atau email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full h-9 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
						/>
						{search && (
							<button
								onClick={() => setSearch("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
							>
								<X size={12} />
							</button>
						)}
					</div>

					<div className="relative">
						<button
							onClick={() => setPlanOpen((p) => !p)}
							className="h-9 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 text-sm text-white/70 hover:text-white flex items-center gap-2 transition-all"
						>
							<Package size={13} className="text-amber-400/70" />
							Paket:{" "}
							<span className="text-amber-300 font-semibold">{planFilter}</span>
							<ChevronDown
								size={13}
								className={cn("transition-transform", planOpen && "rotate-180")}
							/>
						</button>
						{planOpen && (
							<div className="absolute right-0 top-11 z-20 w-36 rounded-xl border border-white/10 bg-[#0f141c] shadow-xl overflow-hidden">
								{PLAN_OPTIONS.map((p) => (
									<button
										key={p}
										onClick={() => {
											setPlanFilter(p);
											setPlanOpen(false);
										}}
										className={cn(
											"w-full px-4 py-2.5 text-sm text-left transition-colors",
											planFilter === p
												? "bg-amber-500/15 text-amber-300 font-semibold"
												: "text-white/60 hover:bg-white/5 hover:text-white",
										)}
									>
										{p}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="flex gap-1.5 flex-wrap">
					{STATUS_TABS.map((tab) => {
						const counts: Record<StatusFilter, number> = {
							Semua: orders.length,
							Lunas: countLunas,
							Menunggu: countMenunggu,
							Kadaluarsa: countGagal,
						};
						return (
							<button
								key={tab}
								onClick={() => setStatusFilter(tab)}
								className={cn(
									"h-8 px-4 rounded-full border text-[12px] font-semibold transition-all",
									statusFilter === tab
										? "border-amber-500/50 bg-amber-500/15 text-amber-300"
										: "border-white/8 bg-white/4 text-white/40 hover:border-white/15 hover:text-white/70",
								)}
							>
								{tab}
								<span
									className={cn(
										"ml-1.5 text-[10px] font-bold",
										statusFilter === tab ? "text-amber-400" : "text-white/25",
									)}
								>
									{counts[tab]}
								</span>
							</button>
						);
					})}
				</div>

				<div className="rounded-2xl border border-white/8 bg-[#0b0f16] overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-white/6">
									{[
										"Invoice",
										"Pelanggan",
										"Paket",
										"Tagihan",
										"Metode",
										"Status",
										"Tanggal",
									].map((h) => (
										<th
											key={h}
											className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td
											colSpan={7}
											className="px-4 py-16 text-center text-white/25 text-sm"
										>
											Tidak ada transaksi yang sesuai filter.
										</td>
									</tr>
								) : (
									filtered.map((item, i) => (
										<tr
											key={item.id}
											onClick={() => setSelected(item)}
											className={cn(
												"border-b border-white/4 last:border-0 cursor-pointer transition-all duration-150",
												"hover:bg-amber-500/5 hover:border-amber-500/10",
												i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]",
											)}
										>
											<td className="px-4 py-3.5 font-mono text-[11px] text-amber-400/80">
												{item.id}
											</td>
											<td className="px-4 py-3.5">
												<p className="font-semibold text-white leading-tight">
													{item.customer}
												</p>
												<p className="text-[11px] text-white/35 mt-0.5">
													{item.email}
												</p>
											</td>
											<td className="px-4 py-3.5">
												<Pill tone={planTone(item.plan)}>{item.plan}</Pill>
											</td>
											<td className="px-4 py-3.5 font-semibold text-white/90">
												{formatIdr(item.amount)}
											</td>
											<td className="px-4 py-3.5">
												<Pill tone="info">{item.method}</Pill>
											</td>
											<td className="px-4 py-3.5">
												<StatusBadge status={item.status} />
											</td>
											<td className="px-4 py-3.5 text-[11px] text-white/35 whitespace-nowrap">
												{item.date}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{filtered.length > 0 && (
						<div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
							<p className="text-[11px] text-white/25">
								Menampilkan{" "}
								<span className="text-white/50 font-semibold">
									{filtered.length}
								</span>{" "}
								dari{" "}
								<span className="text-white/50 font-semibold">
									{orders.length}
								</span>{" "}
								transaksi
							</p>
							<p className="text-[11px] text-white/25">
								Klik baris untuk detail
							</p>
						</div>
					)}
				</div>
			</div>

			{selected && (
				<TransactionModal order={selected} onClose={() => setSelected(null)} />
			)}
		</div>
	);
}
