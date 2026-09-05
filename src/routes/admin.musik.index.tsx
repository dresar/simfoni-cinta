import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pause, Play, Music2, Pencil, Trash2, Copy, Check } from "lucide-react";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
	Action,
	ConfirmDelete,
	GlassCard,
	LinkAction,
	PageHead,
	Pill,
	SelectInput,
	TextInput,
} from "@/components/kit";
import { fetchMusic, removeMusic } from "@/functions/media";

type Track = Awaited<ReturnType<typeof fetchMusic>>[number];

const KATEGORI_MUSIK = [
	"Semua",
	"Pop Romantis",
	"Instrumen Akustik",
	"Islami Religi",
	"Tradisional Batak",
	"Tradisional Jawa",
	"Tradisional Minang",
	"Orkestra Elegan",
];

const kategoriTone: Record<string, "gold" | "matcha" | "info" | "neutral"> = {
	"Pop Romantis": "gold",
	"Instrumen Akustik": "matcha",
	"Islami Religi": "info",
	"Tradisional Batak": "neutral",
	"Tradisional Jawa": "neutral",
	"Tradisional Minang": "neutral",
	"Orkestra Elegan": "gold",
};

const CDN_BASE = "https://cdn.jsdelivr.net/gh/invitedsimfonicinta-alt/aksara-cinta@main/public/music";

const BUILT_IN_TRACKS: Track[] = [
	{
		id: "m-love-story",
		title: "Love Story (Saxophone Cover)",
		artist: "Leon Chen",
		genre: "Pop Romantis",
		duration: "03:55",
		url: `${CDN_BASE}/love-story-sax-leon-chen.mp3`,
	},
	{
		id: "m-thousand-years",
		title: "A Thousand Years (Piano Romance)",
		artist: "The Piano Guys",
		genre: "Pop Romantis",
		duration: "04:15",
		url: `${CDN_BASE}/a-thousand-years-piano-romance.mp3`,
	},
	{
		id: "m-yoon-mirae",
		title: "Always (Korean Romance OST)",
		artist: "Yoon Mi-rae",
		genre: "Instrumen Akustik",
		duration: "03:25",
		url: `${CDN_BASE}/yoon-mirae-instrumental-ost.mp3`,
	},
	{
		id: "m-batak-rokkap",
		title: "Si Rokkap Ni Tondi",
		artist: "Dorman Manik & Rany Simbolon",
		genre: "Tradisional Batak",
		duration: "04:30",
		url: `${CDN_BASE}/dorman-manik-si-rokkap-ni-tondi.mp3`,
	},
	{
		id: "m-gamelan-jawa",
		title: "Gamelan Jawa Kahanan Tentrem",
		artist: "Karawitan Jawa",
		genre: "Tradisional Jawa",
		duration: "02:45",
		url: `${CDN_BASE}/gamelan-jawa-kahanan-tentrem.mp3`,
	},
	{
		id: "m-melayu-alunan",
		title: "Alunan Melayu Selayang Pandang",
		artist: "Orkes Tradisional Melayu",
		genre: "Tradisional Minang",
		duration: "03:15",
		url: `${CDN_BASE}/alunan-melayu-selayang-pandang.mp3`,
	},
	{
		id: "m-antassalam",
		title: "Antassalam",
		artist: "Maher Zain",
		genre: "Islami Religi",
		duration: "03:45",
		url: `${CDN_BASE}/maher-zain-antassalam.mp3`,
	},
	{
		id: "m-ramadan",
		title: "Ramadan (Malay Version)",
		artist: "Maher Zain",
		genre: "Islami Religi",
		duration: "04:10",
		url: `${CDN_BASE}/maher-zain-ramadan.mp3`,
	},
	{
		id: "m-lil-abi",
		title: "Lil Abi Wal Ummi (Shalawat)",
		artist: "Haddad Alwi ft. Yasmin",
		genre: "Islami Religi",
		duration: "04:20",
		url: `${CDN_BASE}/haddad-alwi-lil-abi-wal-ummi.mp3`,
	},
	{
		id: "m-nature-romance",
		title: "Nature Romantic Instrumental",
		artist: "Curry & Franks",
		genre: "Instrumen Akustik",
		duration: "03:10",
		url: `${CDN_BASE}/nature-romantic-instrumental.mp3`,
	},
	{
		id: "m-be-with-you",
		title: "Be With You (Acoustic)",
		artist: "Akon",
		genre: "Pop Romantis",
		duration: "03:50",
		url: `${CDN_BASE}/akon-be-with-you.mp3`,
	},
	{
		id: "m-celebration",
		title: "Celebration",
		artist: "Kool & The Gang",
		genre: "Pop Romantis",
		duration: "03:40",
		url: `${CDN_BASE}/kool-the-gang-celebration.mp3`,
	},
];

export const Route = createFileRoute("/admin/musik/")({
	loader: () => fetchMusic(),
	head: () => ({
		meta: [{ title: "Kelola Musik — Simfoni Cinta" }],
	}),
	component: MusikPage,
});

function VinylDisc({ spinning }: { spinning: boolean }) {
	return (
		<div
			className={`relative flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-inner ${spinning ? "animate-spin" : ""}`}
			style={{ animationDuration: "3s" }}
		>
			<div className="absolute inset-3 rounded-full border border-white/5 bg-zinc-900" />
			<div className="absolute inset-6 rounded-full bg-zinc-800" />
			<div className="size-2 rounded-full bg-amber-400/80" />
		</div>
	);
}

function WaveformEqualizer({ active }: { active: boolean }) {
	const heights = [3, 5, 7, 4, 6, 3, 8, 5, 4, 7, 6, 4];
	return (
		<div className="flex items-end gap-px h-6">
			{heights.map((h, i) => (
				<div
					key={i}
					className={`w-0.5 rounded-full transition-all ${active ? "bg-emerald-400" : "bg-white/20"}`}
					style={{
						height: active ? `${h * 2.5}px` : "3px",
						animation: active
							? `pulse ${0.35 + i * 0.06}s ease-in-out infinite alternate`
							: "none",
						animationDelay: `${i * 60}ms`,
					}}
				/>
			))}
		</div>
	);
}

function AudioDuration({
	audioRef,
	playing,
}: {
	audioRef: React.RefObject<HTMLAudioElement | null>;
	playing: boolean;
}) {
	const [current, setCurrent] = useState(0);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;
		const onTime = () => setCurrent(el.currentTime);
		const onMeta = () => setTotal(el.duration || 0);
		el.addEventListener("timeupdate", onTime);
		el.addEventListener("loadedmetadata", onMeta);
		if (el.duration) setTotal(el.duration);
		return () => {
			el.removeEventListener("timeupdate", onTime);
			el.removeEventListener("loadedmetadata", onMeta);
		};
	}, [audioRef, playing]);

	function fmt(s: number) {
		if (!isFinite(s)) return "0:00";
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60)
			.toString()
			.padStart(2, "0");
		return `${m}:${sec}`;
	}

	return (
		<span className="font-mono text-[10px] text-white/30 tabular-nums">
			{fmt(current)} / {fmt(total)}
		</span>
	);
}

interface ActionMenuItem {
	label: string;
	icon: ReactNode;
	danger?: boolean;
	onClick: () => void;
}

function ActionMenu({ items }: { items: ActionMenuItem[] }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="relative shrink-0 z-30 pointer-events-auto" ref={ref}>
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setOpen(!open);
				}}
				onTouchEnd={(e) => e.stopPropagation()}
				className="relative size-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center border border-white/10 shadow-sm transition-all cursor-pointer"
				aria-label="Menu Aksi"
			>
				<DotsThreeVertical className="size-4" weight="bold" />
			</button>

			{open && (
				<div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1a1d24] border border-white/10 text-white rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 p-1.5">
					{items.map((item, idx) => (
						<button
							key={idx}
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setOpen(false);
								item.onClick();
							}}
							onTouchEnd={(e) => e.stopPropagation()}
							className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
								item.danger
									? "text-red-400 hover:bg-red-500/10"
									: "text-white/80 hover:bg-white/10"
							}`}
						>
							<span className="shrink-0">{item.icon}</span>
							<span>{item.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function MusicCard({
	item,
	isPlaying,
	onTogglePlay,
	onDelete,
	audioRef,
}: {
	item: Track;
	isPlaying: boolean;
	onTogglePlay: (item: Track) => void;
	onDelete: (id: string) => void;
	audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
	const [copied, setCopied] = useState(false);
	const isBuiltIn = item.id.startsWith("builtin-");
	const tone = kategoriTone[item.genre] ?? "neutral";

	const handleCopyUrl = () => {
		navigator.clipboard.writeText(item.url);
		setCopied(true);
		toast.success("URL musik berhasil disalin!");
		setTimeout(() => setCopied(false), 2000);
	};

	const menuItems: ActionMenuItem[] = [
		{
			label: copied ? "Disalin!" : "Salin URL",
			icon: copied ? (
				<Check className="size-3.5 text-emerald-400" />
			) : (
				<Copy className="size-3.5" />
			),
			onClick: handleCopyUrl,
		},
		...(!isBuiltIn
			? [
					{
						label: "Edit",
						icon: <Pencil className="size-3.5 text-amber-400" />,
						onClick: () => {
							window.location.href = `/admin/musik/baru?id=${item.id}`;
						},
					},
					{
						label: "Hapus",
						icon: <Trash2 className="size-3.5" />,
						danger: true,
						onClick: () => onDelete(item.id),
					},
				]
			: []),
	];

	return (
		<GlassCard
			className={`relative flex flex-col justify-between gap-3 p-4 transition bg-[#0f141c]/80 rounded-lg ${
				isPlaying
					? "border-emerald-500/30 bg-emerald-500/[0.06]"
					: "border-white/10"
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<VinylDisc spinning={isPlaying} />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold text-white">
							{item.title}
						</p>
						<p className="truncate text-xs text-white/50">{item.artist}</p>
						<div className="mt-1.5 flex items-center gap-2">
							<Pill tone={tone} className="text-[10px]">
								{item.genre}
							</Pill>
							{isBuiltIn && (
								<span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
									Built-in
								</span>
							)}
						</div>
					</div>
				</div>

				{!isBuiltIn && (
					<ActionMenu
						items={menuItems.map((it) =>
							it.label === "Edit" ? { ...it, onClick: () => {} } : it,
						)}
					/>
				)}
			</div>

			<div className="flex items-center justify-between px-1">
				<WaveformEqualizer active={isPlaying} />
				<AudioDuration audioRef={audioRef} playing={isPlaying} />
			</div>

			<Action
				tone={isPlaying ? "matcha" : "ghost"}
				size="sm"
				className={`w-full justify-center gap-1.5 rounded-lg py-1.5 cursor-pointer ${
					isPlaying
						? ""
						: "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
				}`}
				onClick={() => onTogglePlay(item)}
			>
				{isPlaying ? (
					<Pause className="size-3.5" />
				) : (
					<Play className="size-3.5" />
				)}
				<span>{isPlaying ? "Jeda Lagu" : "Putar Lagu"}</span>
			</Action>
		</GlassCard>
	);
}

function MusikPage() {
	const tracks = Route.useLoaderData();
	const router = useRouter();

	const [playing, setPlaying] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [genre, setGenre] = useState("Semua");
	const [pending, setPending] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const allTracks = useMemo(() => {
		const dbTracks = (tracks as Track[]) || [];
		return [...dbTracks, ...BUILT_IN_TRACKS];
	}, [tracks]);

	const rows = useMemo(() => {
		return allTracks.filter((t) => {
			const matchQuery =
				t.title.toLowerCase().includes(query.toLowerCase()) ||
				t.artist.toLowerCase().includes(query.toLowerCase());
			const matchGenre = genre === "Semua" || t.genre === genre;
			return matchQuery && matchGenre;
		});
	}, [allTracks, query, genre]);

	function togglePlay(track: Track) {
		if (playing === track.id) {
			if (audioRef.current) {
				audioRef.current.pause();
			}
			setPlaying(null);
		} else {
			if (audioRef.current) {
				audioRef.current.src = track.url;
				audioRef.current.play().catch(() => {});
			}
			setPlaying(track.id);
		}
	}

	async function handleDelete() {
		if (!pending) return;
		await removeMusic({ data: pending });
		setPending(null);
		router.invalidate();
	}

	return (
		<>
			<audio
				ref={audioRef}
				onEnded={() => setPlaying(null)}
				className="hidden"
			/>
			<PageHead
				title="Daftar Musik Background"
				subtitle="Katalog musik latar pilihan"
			>
				<Pill tone="matcha">{allTracks.length} Lagu</Pill>
				<TextInput
					placeholder="Cari lagu / artis…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-44 sm:w-60 bg-[#0f141c] border-white/10 text-white placeholder:text-white/30"
				/>
				<SelectInput
					value={genre}
					onChange={(e) => setGenre(e.target.value)}
					className="w-44 bg-[#0f141c] border-white/10 text-white"
				>
					{KATEGORI_MUSIK.map((k) => (
						<option key={k}>{k}</option>
					))}
				</SelectInput>
				<LinkAction to="/admin/musik/baru" tone="gold" size="sm">
					+ Tambah
				</LinkAction>
			</PageHead>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{rows.map((item) => (
					<MusicCard
						key={item.id}
						item={item}
						isPlaying={playing === item.id}
						onTogglePlay={togglePlay}
						onDelete={(id) => setPending(id)}
						audioRef={audioRef}
					/>
				))}
			</div>

			{rows.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
					<Music2 className="size-10 text-white/10 mb-3" />
					<p className="text-sm font-medium text-white/30">
						Tidak ada musik ditemukan
					</p>
				</div>
			)}

			<ConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
