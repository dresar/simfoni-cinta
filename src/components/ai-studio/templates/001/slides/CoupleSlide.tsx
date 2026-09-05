import React from "react";
import { Instagram } from "lucide-react";
import type { AssetSlots, InvitationData, PresetThemeTokens } from "../../../types";

interface CoupleSlideProps {
	data: InvitationData;
	assets: AssetSlots;
	theme: PresetThemeTokens;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function CoupleSlide({
	data,
	assets,
	theme,
	slideAnimClass,
	ornaments,
}: CoupleSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar pb-16 ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Mempelai Bahagia
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Kedua Pengantin
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto z-10 flex flex-col gap-3 my-auto">
				<div
					className="p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xl flex items-center gap-3 animate-image-from-left"
					style={{ backgroundColor: `${theme.menuBg}dd` }}
				>
					<div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/60 flex-shrink-0 shadow-md">
						<img
							src={assets.groomPhoto || assets.couplePhoto}
							alt={data.couple.groomName}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-bold text-white truncate">
							{data.couple.groomFullName}
						</h3>
						<p className="text-[10px] text-stone-300 leading-tight mt-0.5">
							Putra dari {data.couple.groomFather} &amp; {data.couple.groomMother}
						</p>
						{data.couple.groomInstagram && (
							<a
								href={`https://instagram.com/${data.couple.groomInstagram}`}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-[9px] text-amber-300 mt-1 hover:underline"
							>
								<Instagram className="w-2.5 h-2.5" />
								<span>@{data.couple.groomInstagram}</span>
							</a>
						)}
					</div>
				</div>

				<div className="flex justify-center -my-1 z-20">
					<div
						className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
						style={{ backgroundColor: theme.invAccent, color: "#ffffff" }}
					>
						&amp;
					</div>
				</div>

				<div
					className="p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xl flex items-center gap-3 animate-image-from-right"
					style={{ backgroundColor: `${theme.menuBg}dd` }}
				>
					<div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/60 flex-shrink-0 shadow-md">
						<img
							src={assets.bridePhoto || assets.couplePhoto}
							alt={data.couple.brideName}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-bold text-white truncate">
							{data.couple.brideFullName}
						</h3>
						<p className="text-[10px] text-stone-300 leading-tight mt-0.5">
							Putri dari {data.couple.brideFather} &amp; {data.couple.brideMother}
						</p>
						{data.couple.brideInstagram && (
							<a
								href={`https://instagram.com/${data.couple.brideInstagram}`}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-[9px] text-amber-300 mt-1 hover:underline"
							>
								<Instagram className="w-2.5 h-2.5" />
								<span>@{data.couple.brideInstagram}</span>
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
