import React from "react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface OpeningSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function OpeningSlide({
	data,
	theme,
	slideAnimClass,
	ornaments,
}: OpeningSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-5 overflow-hidden ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Undangan Pernikahan
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Salam Hormat Kami
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto my-auto z-10 flex flex-col items-center text-center px-1 animate-image-from-left">
				<div
					className="p-4 rounded-xl backdrop-blur-md border border-white/15 shadow-2xl"
					style={{ backgroundColor: `${theme.menuBg}dd` }}
				>
					<p className="text-xs leading-relaxed text-stone-200 mb-3">
						Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.
					</p>
					<p className="text-[10px] text-stone-400 font-medium">
						Hormat Kami Yang Mengundang:
					</p>
					<p className="text-xs font-bold text-amber-300 mt-0.5">
						Keluarga Besar {data.couple.groomName} &amp; Keluarga Besar {data.couple.brideName}
					</p>
					<h3 className="text-lg font-bold tracking-tight text-white mt-2">
						{data.couple.groomName} &amp; {data.couple.brideName}
					</h3>
				</div>
			</div>

			<div className="w-full pb-14 text-center z-10">
				<p className="text-[9px] text-stone-400 tracking-wider">
					Aksara Cinta — Digital Wedding Invitation
				</p>
			</div>
		</div>
	);
}
