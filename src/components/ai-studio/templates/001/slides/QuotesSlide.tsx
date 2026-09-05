import React from "react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface QuotesSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function QuotesSlide({
	data,
	theme,
	slideAnimClass,
	ornaments,
}: QuotesSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between items-center p-5 overflow-hidden select-none ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[11px] uppercase tracking-[0.25em] text-[#DEB55B] font-bold">
					Kutipan Suci
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Firman Kasih
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto my-auto z-10 text-center px-1 flex flex-col items-center">
				<div className="w-36 h-28 mb-3 overflow-hidden rounded-lg drop-shadow-md">
					<img
						src="/demo/adat-batak/assets/images/rumah-adat.webp"
						alt="Rumah Bolon Batak"
						className="w-full h-full object-contain"
					/>
				</div>

				<div
					className="p-4 rounded-xl backdrop-blur-md border border-[#DEB55B]/30 shadow-2xl animate-image-from-right text-center"
					style={{ backgroundColor: `${theme.menuBg || "#6F1416"}e6` }}
				>
					<p className="text-[13px] leading-relaxed italic text-stone-100 font-serif">
						"{data.sacredQuoteText}"
					</p>
					<p className="text-[11px] font-bold text-[#DEB55B] mt-2.5 tracking-wider uppercase">
						— {data.sacredQuoteSource}
					</p>
				</div>
			</div>

			<div className="w-full pb-20 text-center z-10">
				<p className="text-[11px] text-white/70 italic">
					Pernikahan Kudus &amp; Pesta Adat
				</p>
			</div>
		</div>
	);
}
