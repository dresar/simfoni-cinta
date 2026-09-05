import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Volume2, Copy, Check, Upload, Music2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImageFn } from "@/functions/upload";
import { addMusic } from "@/functions/media";

interface MusicAsset {
	id: string;
	filename: string;
	dataUrl: string;
	objectUrl: string;
	size: number;
	bitrate?: string;
	duration?: number;
	title?: string;
	artist?: string;
	isSyncedCdn: boolean;
	cdnUrl?: string;
}

interface TemplateMusicManagerProps {
	audioAssets: MusicAsset[];
	templateSlug: string;
	onMusicUploaded?: (music: MusicAsset) => void;
	onSetAsDefault?: (music: MusicAsset) => void;
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function extractMusicMetadata(filename: string): { title: string; artist: string } {
	const baseName = filename.replace(/\.[^/.]+$/, "");
	const parts = baseName.split("-").map((p) => p.trim());

	if (parts.length >= 2) {
		return {
			title: parts[0],
			artist: parts.slice(1).join(" - "),
		};
	}

	return {
		title: baseName,
		artist: "Unknown Artist",
	};
}

function MusicCard({
	music,
	isPlaying,
	onTogglePlay,
	onUploadToCdn,
	onSetAsDefault,
	onCopyCdnLink,
}: {
	music: MusicAsset;
	isPlaying: boolean;
	onTogglePlay: () => void;
	onUploadToCdn: () => void;
	onSetAsDefault: () => void;
	onCopyCdnLink: () => void;
}) {
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(music.duration || 0);
	const [volume, setVolume] = useState(0.7);
	const [copied, setCopied] = useState(false);
	const [uploading, setUploading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const audio = new Audio(music.objectUrl);
		audioRef.current = audio;

		audio.addEventListener("loadedmetadata", () => {
			setDuration(audio.duration);
		});

		audio.addEventListener("timeupdate", () => {
			setCurrentTime(audio.currentTime);
		});

		audio.addEventListener("ended", () => {
			setCurrentTime(0);
		});

		audio.volume = volume;

		return () => {
			audio.pause();
			audio.src = "";
			audioRef.current = null;
		};
	}, [music.objectUrl]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	useEffect(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.play().catch(() => {
					toast.error("Tidak dapat memutar audio. Coba lagi.");
				});
			} else {
				audioRef.current.pause();
			}
		}
	}, [isPlaying]);

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = parseFloat(e.target.value);
		setCurrentTime(newTime);
		if (audioRef.current) {
			audioRef.current.currentTime = newTime;
		}
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(e.target.value);
		setVolume(newVolume);
	};

	const handleCopy = () => {
		if (music.cdnUrl) {
			navigator.clipboard.writeText(music.cdnUrl);
			setCopied(true);
			toast.success("Link CDN berhasil disalin");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleUpload = async () => {
		setUploading(true);
		try {
			await onUploadToCdn();
			toast.success("Musik berhasil diupload ke CDN");
		} catch (error) {
			toast.error("Gagal mengupload musik");
		} finally {
			setUploading(false);
		}
	};

	const metadata = extractMusicMetadata(music.filename);
	const ext = music.filename.split(".").pop()?.toUpperCase() || "AUDIO";

	return (
		<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 backdrop-blur-sm transition-all hover:border-white/20">
			<div className="flex items-start gap-4">
				<div className="relative flex-shrink-0">
					<div
						className={cn(
							"flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 transition-transform",
							isPlaying && "animate-pulse"
						)}
					>
						<Music2 className={cn("h-8 w-8 text-purple-300", isPlaying && "animate-bounce")} />
					</div>
					{music.isSyncedCdn && (
						<div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-1">
							<Check className="h-3 w-3 text-white" />
						</div>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<h4 className="truncate text-sm font-semibold text-white">
								{music.title || metadata.title}
							</h4>
							<p className="truncate text-xs text-white/50">
								{music.artist || metadata.artist}
							</p>
						</div>
						<button
							type="button"
							onClick={onTogglePlay}
							className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-white transition-all hover:bg-purple-600 active:scale-95"
						>
							{isPlaying ? (
								<Pause className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4 ml-0.5" />
							)}
						</button>
					</div>

					<div className="mt-3 space-y-2">
						<div className="flex items-center gap-2">
							<input
								type="range"
								min="0"
								max={duration || 100}
								value={currentTime}
								onChange={handleSeek}
								className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
							/>
						</div>

						<div className="flex items-center justify-between text-[10px] text-white/40">
							<span>{formatDuration(currentTime)}</span>
							<span>{formatDuration(duration)}</span>
						</div>

						<div className="flex items-center gap-2">
							<Volume2 className="h-3 w-3 text-white/40" />
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								value={volume}
								onChange={handleVolumeChange}
								className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
							/>
						</div>
					</div>

					<div className="mt-3 flex flex-wrap items-center gap-2">
						<span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60">
							{ext} {music.bitrate || "320kbps"} • {formatBytes(music.size)}
						</span>
						{music.isSyncedCdn ? (
							<span className="rounded-md bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
								Tersimpan di CDN
							</span>
						) : (
							<span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
								Belum di CDN
							</span>
						)}
					</div>

					<div className="mt-3 flex flex-wrap gap-2">
						{!music.isSyncedCdn && (
							<button
								type="button"
								onClick={handleUpload}
								disabled={uploading}
								className="flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-500/30 disabled:opacity-50"
							>
								<Upload className="h-3 w-3" />
								{uploading ? "Uploading..." : "Upload ke CDN"}
							</button>
						)}
						<button
							type="button"
							onClick={onSetAsDefault}
							className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/30"
						>
							Jadikan Default Template
						</button>
						{music.isSyncedCdn && music.cdnUrl && (
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition-all hover:bg-white/20"
							>
								{copied ? (
									<>
										<Check className="h-3 w-3" />
										Tersalin
									</>
								) : (
									<>
										<Copy className="h-3 w-3" />
										Salin Link CDN
									</>
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export function TemplateMusicManager({
	audioAssets,
	templateSlug,
	onMusicUploaded,
	onSetAsDefault,
}: TemplateMusicManagerProps) {
	const [playingId, setPlayingId] = useState<string | null>(null);
	const [musicList, setMusicList] = useState<MusicAsset[]>(audioAssets);

	useEffect(() => {
		setMusicList(audioAssets);
	}, [audioAssets]);

	const togglePlay = (id: string) => {
		setPlayingId((prev) => (prev === id ? null : id));
	};

	const handleUploadToCdn = async (music: MusicAsset) => {
		try {
			const result = await uploadImageFn({
				data: {
					fileData: music.dataUrl,
					folder: `music/${templateSlug}`,
					originalName: music.filename,
				},
			});

			const updatedMusic: MusicAsset = {
				...music,
				isSyncedCdn: result.uploadedToGitHub,
				cdnUrl: result.url,
			};

			setMusicList((prev) =>
				prev.map((m) => (m.id === music.id ? updatedMusic : m))
			);

			if (onMusicUploaded) {
				onMusicUploaded(updatedMusic);
			}

			return updatedMusic;
		} catch (error) {
			throw error;
		}
	};

	const handleSetAsDefault = async (music: MusicAsset) => {
		try {
			if (onSetAsDefault) {
				onSetAsDefault(music);
			}
			toast.success("Musik telah dijadikan default template");
		} catch (error) {
			toast.error("Gagal menyimpan musik sebagai default");
		}
	};

	const handleCopyCdnLink = (music: MusicAsset) => {
		if (music.cdnUrl) {
			navigator.clipboard.writeText(music.cdnUrl);
		}
	};

	if (musicList.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
				<Music2 className="mb-3 h-12 w-12 text-white/10" />
				<p className="text-sm font-medium text-white/30">
					Tidak ada musik ditemukan dalam template ini
				</p>
				<p className="mt-1 text-xs text-white/20">
					Upload template ZIP yang berisi file audio (.mp3, .wav, .m4a, .ogg)
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-sm font-semibold text-white">
						Musik Template ({musicList.length})
					</h3>
					<p className="text-xs text-white/50">
						Pilih musik untuk diupload ke CDN dan dijadikan asset global
					</p>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
				{musicList.map((music) => (
					<MusicCard
						key={music.id}
						music={music}
						isPlaying={playingId === music.id}
						onTogglePlay={() => togglePlay(music.id)}
						onUploadToCdn={() => handleUploadToCdn(music)}
						onSetAsDefault={() => handleSetAsDefault(music)}
						onCopyCdnLink={() => handleCopyCdnLink(music)}
					/>
				))}
			</div>
		</div>
	);
}
