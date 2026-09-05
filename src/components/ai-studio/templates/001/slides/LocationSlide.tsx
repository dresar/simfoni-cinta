import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface LocationSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function LocationSlide({
	data,
	theme,
	slideAnimClass,
	ornaments,
}: LocationSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-5 overflow-hidden ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Denah &amp; Petunjuk
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Lokasi Acara
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto my-auto z-10 flex flex-col items-center gap-3 text-center">
				<div
					className="w-full p-4 rounded-xl backdrop-blur-md border border-white/15 shadow-xl animate-image-from-left"
					style={{ backgroundColor: `${theme.menuBg}dd` }}
				>
					<MapPin className="w-6 h-6 mx-auto mb-1 text-amber-400" />
					<h3 className="text-sm font-bold text-white">
						{data.resepsi.venueName}
					</h3>
					<p className="text-[10px] text-stone-300 mt-1 leading-relaxed">
						{data.resepsi.address}
					</p>
				</div>

				<a
					href={data.resepsi.mapsUrl || "https://maps.google.com"}
					target="_blank"
					rel="noreferrer"
					className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 cursor-pointer animate-image-from-right"
					style={{ backgroundColor: theme.invAccent }}
				>
					<ExternalLink className="w-3.5 h-3.5" />
					<span>Buka Google Maps</span>
				</a>
			</div>

			<div className="w-full pb-14 text-center z-10">
				<p className="text-[9px] text-stone-400">
					Aksara Cinta — Panduan Rute Lokasi
				</p>
			</div>
		</div>
	);
}
