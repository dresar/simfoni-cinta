import React, { useState } from "react";
import { FolderPlus, Trash2, Edit3, Loader2, Folder, Check } from "lucide-react";
import { addAssetFolder, updateAssetFolder, removeAssetFolder } from "@/functions/assetFolders";
import type { TemplateAssetFolder } from "@/lib/db/schema";

interface CustomFolderManagerProps {
	templateSlug: string;
	customFolders: TemplateAssetFolder[];
	onFoldersUpdated: () => void;
	onClose: () => void;
}

const COLOR_PRESETS = [
	"#6366f1", // Indigo
	"#ec4899", // Pink
	"#10b981", // Emerald
	"#f59e0b", // Amber
	"#06b6d4", // Cyan
	"#8b5cf6"  // Violet
];

export const CustomFolderManager: React.FC<CustomFolderManagerProps> = ({
	templateSlug,
	customFolders,
	onFoldersUpdated,
	onClose
}) => {
	const [newFolderName, setNewFolderName] = useState("");
	const [selectedColor, setSelectedColor] = useState("#6366f1");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCreateFolder = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newFolderName.trim()) return;

		setLoading(true);
		setError(null);
		try {
			await addAssetFolder({
				data: {
					templateSlug,
					folderName: newFolderName.trim(),
					color: selectedColor
				}
			});
			setNewFolderName("");
			onFoldersUpdated();
		} catch (err: any) {
			setError(err.message || "Gagal membuat folder baru.");
		} finally {
			setLoading(false);
		}
	};

	const handleRenameFolder = async (folderId: string) => {
		if (!editName.trim()) return;
		setLoading(true);
		try {
			await updateAssetFolder({
				data: {
					folderId,
					newFolderName: editName.trim()
				}
			});
			setEditingId(null);
			onFoldersUpdated();
		} catch (err: any) {
			setError(err.message || "Gagal mengubah nama folder.");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteFolder = async (folderId: string) => {
		if (!confirm("Hapus folder ini? Berkas di dalamnya akan kembali ke daftar utama.")) return;
		setLoading(true);
		try {
			await removeAssetFolder({ data: folderId });
			onFoldersUpdated();
		} catch (err: any) {
			setError(err.message || "Gagal menghapus folder.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
			<div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
				<div className="flex items-center justify-between pb-3 border-b border-slate-800">
					<div className="flex items-center gap-2">
						<FolderPlus className="w-5 h-5 text-indigo-400" />
						<h3 className="text-sm font-semibold text-white">Kelola Folder Virtual</h3>
					</div>
					<button
						onClick={onClose}
						className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
					>
						Tutup
					</button>
				</div>

				<form onSubmit={handleCreateFolder} className="space-y-3">
					<div>
						<label className="block text-xs font-medium text-slate-300 mb-1">
							Nama Folder Baru
						</label>
						<input
							type="text"
							value={newFolderName}
							onChange={(e) => setNewFolderName(e.target.value)}
							placeholder="Misal: Cover Utama, Galeri HD, Ornamen Emas"
							className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
							maxLength={50}
						/>
					</div>

					<div>
						<label className="block text-xs font-medium text-slate-300 mb-1.5">
							Warna Folder
						</label>
						<div className="flex items-center gap-2">
							{COLOR_PRESETS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setSelectedColor(c)}
									className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-transform hover:scale-110"
									style={{ backgroundColor: c }}
								>
									{selectedColor === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
								</button>
							))}
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || !newFolderName.trim()}
						className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
					>
						{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
						<span>Tambah Folder</span>
					</button>
				</form>

				{error && (
					<p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
						{error}
					</p>
				)}

				<div className="space-y-2 pt-2 border-t border-slate-800">
					<h4 className="text-xs font-medium text-slate-400">Daftar Folder Tersedia:</h4>
					{customFolders.length === 0 ? (
						<p className="text-xs text-slate-400 italic py-2">Belum ada folder khusus untuk template ini.</p>
					) : (
						<div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
							{customFolders.map((f) => (
								<div
									key={f.id}
									className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs"
								>
									<div className="flex items-center gap-2 truncate">
										<Folder className="w-4 h-4 shrink-0" style={{ color: f.color || "#6366f1" }} />
										{editingId === f.id ? (
											<input
												type="text"
												value={editName}
												onChange={(e) => setEditName(e.target.value)}
												className="px-2 py-0.5 bg-slate-900 border border-indigo-500 rounded text-xs text-white"
												autoFocus
											/>
										) : (
											<span className="text-slate-200 truncate">{f.folderName}</span>
										)}
									</div>

									<div className="flex items-center gap-1 shrink-0">
										{editingId === f.id ? (
											<button
												onClick={() => handleRenameFolder(f.id)}
												className="px-2 py-0.5 text-[11px] bg-indigo-600 text-white rounded hover:bg-indigo-500"
											>
												Simpan
											</button>
										) : (
											<button
												onClick={() => {
													setEditingId(f.id);
													setEditName(f.folderName);
												}}
												className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
												title="Ubah Nama"
											>
												<Edit3 className="w-3.5 h-3.5" />
											</button>
										)}
										<button
											onClick={() => handleDeleteFolder(f.id)}
											className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
											title="Hapus"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
