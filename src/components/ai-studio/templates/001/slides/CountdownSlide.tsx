import React from "react";
import { Calendar } from "lucide-react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface CountdownSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	timeLeft: {
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	};
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function CountdownSlide({
	data,
	theme,
	timeLeft,
	slideAnimClass,
	ornaments,
}: CountdownSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-5 overflow-hidden ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Menuju Hari Bahagia
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Hitung Mundur
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto my-auto z-10 flex flex-col items-center gap-4">
				<div className="grid grid-cols-4 gap-2 w-full animate-image-from-left">
					{[
						{ label: "Hari", val: timeLeft.days },
						{ label: "Jam", val: timeLeft.hours },
						{ label: "Menit", val: timeLeft.minutes },
						{ label: "Detik", val: timeLeft.seconds },
					].map((item, idx) => (
						<div
							key={idx}
							className="p-2.5 rounded-xl text-center backdrop-blur-md border border-white/15 shadow-xl"
							style={{ backgroundColor: `${theme.menuBg}ee` }}
						>
							<div className="text-xl font-bold text-amber-300 font-mono">
								{String(item.val).padStart(2, "0")}
							</div>
							<div className="text-[9px] uppercase tracking-wider text-stone-300 font-semibold mt-0.5">
								{item.label}
							</div>
						</div>
					))}
				</div>

				<p className="text-xs text-stone-200 text-center">
					{data.weddingDateFormatted}
				</p>

				<a
					href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(data.couple.groomName)}+%26+${encodeURIComponent(data.couple.brideName)}`}
					target="_blank"
					rel="noreferrer"
					className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer animate-image-from-right"
					style={{ backgroundColor: theme.invAccent }}
				>
					<Calendar className="w-3.5 h-3.5" />
					<span>Simpan Kalender</span>
				</a>
			</div>

			<div className="w-full pb-14 text-center z-10">
				<p className="text-[9px] text-stone-400">
					Aksara Cinta — Waktu Mengikat Janji
				</p>
			</div>
		</div>
	);
}
