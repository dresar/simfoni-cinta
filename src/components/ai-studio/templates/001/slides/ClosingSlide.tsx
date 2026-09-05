import React from "react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface ClosingSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function ClosingSlide({
	data,
	theme,
	slideAnimClass,
	ornaments,
}: ClosingSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-5 overflow-hidden ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Ucapan Terima Kasih
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Doa &amp; Restu
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto my-auto z-10 flex flex-col items-center text-center px-1 animate-image-from-left">
				<div
					className="p-4 rounded-2xl backdrop-blur-md border border-white/15 shadow-2xl"
					style={{ backgroundColor: `${theme.menuBg}ee` }}
				>
					<p className="text-xs leading-relaxed text-stone-100">
						Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
					</p>
					<p className="text-[10px] text-stone-400 mt-3">
						Kami yang berbahagia:
					</p>
					<h3 className="text-lg font-bold tracking-tight text-amber-300 mt-1">
						{data.couple.groomName} &amp; {data.couple.brideName}
					</h3>
					<p className="text-[9px] text-stone-400 mt-1">
						Beserta Seluruh Keluarga Besar
					</p>
				</div>
			</div>

			<div className="w-full pb-14 text-center z-10">
				<p className="text-[9px] text-stone-400">
					Aksara Cinta — Simfoni Cinta Digital
				</p>
			</div>
		</div>
	);
}
