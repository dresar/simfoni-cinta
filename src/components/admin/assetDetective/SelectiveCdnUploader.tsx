import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Copy, Check } from "lucide-react";
import { syncSelectiveAssetsFn } from "@/functions/upload";

interface SelectiveCdnUploaderProps {
	templateSlug: string;
	selectedPaths: string[];
	onSyncSuccess: (results: Array<{ path: string; cdnUrl: string }>) => void;
	onClose: () => void;
}

export const SelectiveCdnUploader: React.FC<SelectiveCdnUploaderProps> = ({
	templateSlug,
	selectedPaths,
	onSyncSuccess,
	onClose
}) => {
	const [isSyncing, setIsSyncing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [results, setResults] = useState<Array<{ path: string; cdnUrl: string; status: string }>>([]);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleStartSync = async () => {
		setIsSyncing(true);
		setError(null);
		setProgress(20);

		try {
			const res = await syncSelectiveAssetsFn({
				data: {
					templateSlug,
					assetPaths: selectedPaths
				}
			});

			setProgress(100);
			if (res && res.success) {
				setResults(res.results || []);
				onSyncSuccess(res.results || []);
			} else {
				setError("Gagal menyinkronkan beberapa atau semua aset ke GitHub CDN.");
			}
		} catch (err: any) {
			setError(err.message || "Terjadi kesalahan saat sinkronisasi.");
		} finally {
			setIsSyncing(false);
		}
	};

	const handleCopyAllUrls = () => {
		const urls = results.filter(r => r.cdnUrl).map(r => r.cdnUrl).join("\n");
		navigator.clipboard.writeText(urls);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
			<div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
				<div className="flex items-center justify-between pb-3 border-b border-slate-800">
					<div className="flex items-center gap-2.5">
						<div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
							<UploadCloud className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-sm font-semibold text-white">Sinkronisasi Selektif ke CDN</h3>
							<p className="text-xs text-slate-400">Template: <span className="font-mono text-blue-400">{templateSlug}</span></p>
						</div>
					</div>
					<button
						onClick={onClose}
						disabled={isSyncing}
						className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
					>
						Tutup
					</button>
				</div>

				<div className="space-y-3">
					<div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
						<div className="flex justify-between text-xs text-slate-300 font-medium">
							<span>Aset Terpilih untuk Diunggah:</span>
							<span className="text-blue-400">{selectedPaths.length} berkas</span>
						</div>
						<div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
							{selectedPaths.map((p, idx) => (
								<div key={idx} className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded truncate">
									{p}
								</div>
							))}
						</div>
					</div>

					{isSyncing && (
						<div className="space-y-2">
							<div className="flex justify-between text-xs text-slate-400">
								<span>Mengunggah ke repo GitHub CDN...</span>
								<span>{progress}%</span>
							</div>
							<div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-blue-500 transition-all duration-300 rounded-full"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}

					{results.length > 0 && (
						<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
							<div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
								<span className="flex items-center gap-1.5">
									<CheckCircle2 className="w-4 h-4" />
									Berhasil Sinkron ({results.filter(r => r.status !== "failed").length}/{results.length})
								</span>
								<button
									onClick={handleCopyAllUrls}
									className="flex items-center gap-1 text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded transition-colors"
								>
									{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
									{copied ? "Tersalin!" : "Salin URL CDN"}
								</button>
							</div>
						</div>
					)}

					{error && (
						<div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
							<AlertCircle className="w-4 h-4 shrink-0" />
							<span>{error}</span>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isSyncing}
						className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
					>
						Batal
					</button>

					{results.length === 0 ? (
						<button
							type="button"
							onClick={handleStartSync}
							disabled={isSyncing || selectedPaths.length === 0}
							className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
						>
							{isSyncing ? (
								<>
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
									<span>Memproses...</span>
								</>
							) : (
								<>
									<UploadCloud className="w-3.5 h-3.5" />
									<span>Mulai Unggah ke CDN</span>
								</>
							)}
						</button>
					) : (
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
						>
							Selesai
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
