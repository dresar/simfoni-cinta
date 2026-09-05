import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
	History,
	Search,
	Filter,
	UserCheck,
	UserPlus,
	Trash2,
	Edit,
	FileSpreadsheet,
	MessageSquare,
	Settings,
} from "lucide-react";
import { useStore } from "@/store/appStore";
import { fetchActivityLogs } from "@/functions/guestbook";

export const Route = createFileRoute(
	"/dasbor/buku-tamu/$eventId/log",
)({
	component: GuestbookAuditLogPage,
});

interface ActivityLogItem {
	id: string;
	actorName: string;
	action: string;
	targetType: string;
	targetId: string;
	details: string;
	createdAt: string;
}

function GuestbookAuditLogPage() {
	const { eventId } = useParams({
		from: "/dasbor/buku-tamu/$eventId/log",
	});
	const { session } = useStore();

	const [logs, setLogs] = useState<ActivityLogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [actionFilter, setActionFilter] = useState("all");

	const loadLogs = async () => {
		if (!session?.email || !eventId) return;
		try {
			const res = await fetchActivityLogs({
				data: { eventId, userEmail: session.email },
			});
			setLogs((res || []) as ActivityLogItem[]);
		} catch {
			setLogs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadLogs();
	}, [eventId, session?.email]);

	const filteredLogs = useMemo(() => {
		return logs.filter((l) => {
			const q = search.toLowerCase().trim();
			const matchSearch =
				!q ||
				l.details.toLowerCase().includes(q) ||
				l.actorName.toLowerCase().includes(q) ||
				l.action.toLowerCase().includes(q);

			const matchAction =
				actionFilter === "all" || l.action.includes(actionFilter);

			return matchSearch && matchAction;
		});
	}, [logs, search, actionFilter]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-xs">
				<div className="flex items-center gap-2">
					<History className="size-5 text-emerald-800" />
					<div>
						<h2 className="font-serif text-base font-bold text-stone-900 leading-tight">
							Log Aktivitas & Audit Trail
						</h2>
						<p className="text-[11px] text-stone-500">
							Riwayat seluruh tindakan operasional, check-in, dan perubahan data tamu
						</p>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
					<input
						type="text"
						placeholder="Cari aktivitas atau nama petugas..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 py-1.5 text-xs text-stone-900 outline-none focus:border-emerald-700"
					/>
				</div>

				<div className="flex items-center gap-1 shrink-0 overflow-x-auto text-xs">
					<select
						value={actionFilter}
						onChange={(e) => setActionFilter(e.target.value)}
						className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-emerald-700 cursor-pointer"
					>
						<option value="all">Semua Jenis Aksi</option>
						<option value="check_in">Pencatatan Kehadiran</option>
						<option value="guest">Perubahan Tamu</option>
						<option value="import">Import CSV</option>
						<option value="message">Moderasi Ucapan</option>
					</select>
				</div>
			</div>

			<div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
				{loading ? (
					<div className="py-16 text-center text-xs text-stone-400">
						Memuat log aktivitas...
					</div>
				) : filteredLogs.length === 0 ? (
					<div className="py-12 text-center text-xs text-stone-400">
						Belum ada log aktivitas yang tercatat.
					</div>
				) : (
					<div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
						{filteredLogs.map((log) => (
							<div key={log.id} className="relative text-xs">
								<div className="absolute -left-6 top-1 size-2 rounded-full bg-emerald-700 ring-4 ring-white" />
								<div className="rounded-lg border border-stone-100 bg-stone-50/50 p-3 space-y-1">
									<div className="flex items-center justify-between gap-2">
										<span className="font-bold text-stone-900">
											{log.details || log.action}
										</span>
										<span className="text-[10px] text-stone-400 font-mono">
											{log.createdAt
												? new Date(log.createdAt).toLocaleString("id-ID")
												: "-"}
										</span>
									</div>
									<div className="flex items-center gap-2 text-[11px] text-stone-500">
										<span>Pelaku: <strong>{log.actorName || "User"}</strong></span>
										<span>·</span>
										<span className="font-mono">{log.action}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
