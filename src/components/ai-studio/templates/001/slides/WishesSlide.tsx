import React from "react";
import { Send } from "lucide-react";
import type { GuestGreeting, PresetThemeTokens } from "../../../types";

interface WishesSlideProps {
	theme: PresetThemeTokens;
	wishes: GuestGreeting[];
	wishName: string;
	setWishName: (val: string) => void;
	wishPresence: "Hadir" | "Ragu-ragu" | "Tidak Hadir";
	setWishPresence: (val: "Hadir" | "Ragu-ragu" | "Tidak Hadir") => void;
	wishMessage: string;
	setWishMessage: (val: string) => void;
	onSubmitWish: (e: React.FormEvent) => void;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function WishesSlide({
	theme,
	wishes,
	wishName,
	setWishName,
	wishPresence,
	setWishPresence,
	wishMessage,
	setWishMessage,
	onSubmitWish,
	slideAnimClass,
	ornaments,
}: WishesSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar pb-16 ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Buku Tamu
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Kirim Doa Restu
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto z-10 flex flex-col gap-3 my-auto">
				<form
					onSubmit={onSubmitWish}
					className="p-3 rounded-xl backdrop-blur-md border border-white/15 shadow-xl flex flex-col gap-2 animate-image-from-left"
					style={{ backgroundColor: `${theme.menuBg}ee` }}
				>
					<input
						type="text"
						value={wishName}
						onChange={(e) => setWishName(e.target.value)}
						placeholder="Nama Anda"
						required
						className="w-full h-8 px-2.5 rounded-lg text-[11px] bg-black/40 border border-white/10 text-white placeholder-stone-400 focus:outline-hidden focus:border-amber-400"
					/>

					<select
						value={wishPresence}
						onChange={(e) =>
							setWishPresence(e.target.value as "Hadir" | "Ragu-ragu" | "Tidak Hadir")
						}
						className="w-full h-8 px-2.5 rounded-lg text-[11px] bg-black/40 border border-white/10 text-white focus:outline-hidden focus:border-amber-400 cursor-pointer"
					>
						<option value="Hadir">Hadir</option>
						<option value="Ragu-ragu">Ragu-ragu</option>
						<option value="Tidak Hadir">Tidak Hadir</option>
					</select>

					<textarea
						value={wishMessage}
						onChange={(e) => setWishMessage(e.target.value)}
						placeholder="Ucapan & Doa..."
						rows={2}
						required
						className="w-full p-2 rounded-lg text-[11px] bg-black/40 border border-white/10 text-white placeholder-stone-400 focus:outline-hidden focus:border-amber-400 resize-none"
					/>

					<button
						type="submit"
						className="h-8 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-md"
						style={{ backgroundColor: theme.invAccent }}
					>
						<Send className="w-3 h-3" />
						<span>Kirim Ucapan</span>
					</button>
				</form>

				<div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar animate-image-from-right">
					{wishes.map((item) => (
						<div
							key={item.id}
							className="p-2 rounded-lg bg-black/30 border border-white/10 text-[10px]"
						>
							<div className="flex items-center justify-between font-bold text-amber-300">
								<span>{item.name}</span>
								<span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-stone-300">
									{item.presence}
								</span>
							</div>
							<p className="text-stone-200 mt-0.5">{item.message}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
