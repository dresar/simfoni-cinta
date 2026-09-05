import React from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface EventsSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function EventsSlide({
	data,
	theme,
	slideAnimClass,
	ornaments,
}: EventsSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar pb-16 ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Jadwal Acara
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Waktu &amp; Tempat
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto z-10 flex flex-col gap-3 my-auto">
				<div
					className="p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xl animate-image-from-left"
					style={{ backgroundColor: `${theme.menuBg}dd` }}
				>
					<div className="flex items-center gap-2 mb-1.5">
						<Calendar className="w-3.5 h-3.5 text-amber-300" />
						<h3 className="text-xs font-bold text-white uppercase tracking-wider">
							{data.akad.title}
						</h3>
					</div>
					<p className="text-xs font-bold text-amber-300">
						{data.akad.dayDate}
					</p>
					<p className="text-[10px] text-stone-200 mt-0.5 flex items-center gap-1">
						<Clock className="w-2.5 h-2.5" />
						{data.akad.timeWindow}
					</p>
					<p className="text-[10px] text-stone-300 mt-1 font-medium">
						{data.akad.venueName}
					</p>
					<p className="text-[9px] text-stone-400 mt-0.5">
						{data.akad.address}
					</p>
				</div>

				<div
					className="p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xl animate-image-from-right"
					style={{ backgroundColor: `${theme.menuBg}dd` }}
				>
					<div className="flex items-center gap-2 mb-1.5">
						<Sparkles className="w-3.5 h-3.5 text-amber-300" />
						<h3 className="text-xs font-bold text-white uppercase tracking-wider">
							{data.resepsi.title}
						</h3>
					</div>
					<p className="text-xs font-bold text-amber-300">
						{data.resepsi.dayDate}
					</p>
					<p className="text-[10px] text-stone-200 mt-0.5 flex items-center gap-1">
						<Clock className="w-2.5 h-2.5" />
						{data.resepsi.timeWindow}
					</p>
					<p className="text-[10px] text-stone-300 mt-1 font-medium">
						{data.resepsi.venueName}
					</p>
					<p className="text-[9px] text-stone-400 mt-0.5">
						{data.resepsi.address}
					</p>
				</div>
			</div>
		</div>
	);
}
