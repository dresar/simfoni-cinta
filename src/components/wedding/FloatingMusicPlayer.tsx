import { useState, useRef, useEffect } from "react";
import {
	Play,
	Pause,
	SpeakerSimpleHigh,
	SpeakerSimpleSlash,
	Disc,
} from "@phosphor-icons/react";

export function FloatingMusicPlayer({
	audioUrl = "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3",
	title = "Kisah Romansa",
	artist = "Simfoni Cinta Instrumental",
}: {
	audioUrl?: string;
	title?: string;
	artist?: string;
}) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// Attempt autoplay upon first user interaction
		const handleFirstInteraction = () => {
			if (audioRef.current && !isPlaying) {
				audioRef.current
					.play()
					.then(() => setIsPlaying(true))
					.catch(() => {});
			}
			window.removeEventListener("click", handleFirstInteraction);
			window.removeEventListener("touchstart", handleFirstInteraction);
		};

		window.addEventListener("click", handleFirstInteraction, { once: true });
		window.addEventListener("touchstart", handleFirstInteraction, {
			once: true,
		});

		return () => {
			window.removeEventListener("click", handleFirstInteraction);
			window.removeEventListener("touchstart", handleFirstInteraction);
		};
	}, []);

	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current.play();
			setIsPlaying(true);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
			<audio ref={audioRef} src={audioUrl} loop preload="auto" />

			{/* Expanded Track Info Card */}
			{expanded && (
				<div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md px-3.5 py-2 shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-right-4 duration-300">
					<div className="text-left">
						<p className="text-[11px] font-bold text-foreground truncate max-w-[120px]">
							{title}
						</p>
						<p className="text-[9px] text-muted-foreground truncate max-w-[120px]">
							{artist}
						</p>
					</div>
				</div>
			)}

			{/* Floating Vinyl Disc Button */}
			<button
				onClick={togglePlay}
				onMouseEnter={() => setExpanded(true)}
				onMouseLeave={() => setExpanded(false)}
				title={isPlaying ? "Jeda Musik" : "Putar Musik"}
				className={`size-12 rounded-full border-2 border-primary/40 bg-card shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
					isPlaying
						? "shadow-[0_0_20px_var(--primary)]"
						: "opacity-80 hover:opacity-100"
				}`}
			>
				<div
					className={`size-full rounded-full flex items-center justify-center bg-surface relative overflow-hidden ${
						isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
					}`}
				>
					{/* Vinyl grooves styling */}
					<div className="absolute inset-1 rounded-full border border-border/80" />
					<div className="absolute inset-2.5 rounded-full border border-border/50" />
					<div className="size-4 rounded-full bg-primary/20 flex items-center justify-center z-10">
						<div className="size-1.5 rounded-full bg-primary" />
					</div>
				</div>

				{/* Play / Pause overlay indicator */}
				<div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
					{isPlaying ? (
						<Pause weight="fill" className="size-4 text-white" />
					) : (
						<Play weight="fill" className="size-4 text-white" />
					)}
				</div>
			</button>
		</div>
	);
}
