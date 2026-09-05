import React from "react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface CoverSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	onOpen: () => void;
	slideAnimClass: string;
}

export function CoverSlide({ data, theme, onOpen, slideAnimClass }: CoverSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between items-center py-8 px-4 overflow-hidden select-none ${slideAnimClass}`}>
			<div className="w-full text-center z-30 flex flex-col items-center pt-8 sm:pt-10">
				<p className="text-[12px] sm:text-[13px] font-medium text-white tracking-[0.22em] uppercase drop-shadow-sm mb-1">
					{data.title || "The Wedding of"}
				</p>

				<h1 className="text-3xl sm:text-4xl font-script text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] my-1 px-2">
					{data.couple.groomName} &amp; {data.couple.brideName}
				</h1>
			</div>

			<div className="w-[110%] -mx-[5%] my-auto z-30 pointer-events-none flex justify-center items-center">
				<img
					src="/demo/adat-batak/assets/images/ulos.webp"
					alt="Ulos Batak"
					className="w-full max-w-[320px] h-auto object-contain animate-pulse duration-1000 drop-shadow-md"
				/>
			</div>

			<div className="w-full max-w-[270px] mx-auto z-40 flex flex-col items-center text-center pb-6">
				<div className="w-full p-3.5 rounded-xl bg-[#560A17]/85 backdrop-blur-sm border border-[#DEB55B]/40 shadow-2xl mb-3">
					<p className="text-[12px] text-stone-100 font-serif leading-tight">
						{data.guestGreetingPrefix || "Kepada Yth;"}
						<br />
						{data.guestGreetingSub || "Bapak/Ibu/Saudara/i"}
					</p>
					<div className="text-base sm:text-lg font-bold text-[#DEB55B] mt-1.5 tracking-wide drop-shadow-sm">
						{data.guestName || "Nama Tamu"}
					</div>
				</div>

				<button
					type="button"
					onClick={onOpen}
					className="h-10 px-8 rounded-full font-bold text-xs tracking-wider shadow-2xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95 cursor-pointer text-[#560A17] border border-[#DEB55B]/40"
					style={{
						backgroundColor: theme.invAccent || "#DEB55B",
					}}
				>
					{data.openButtonText || "Open Invitation"}
				</button>
			</div>
		</div>
	);
}
