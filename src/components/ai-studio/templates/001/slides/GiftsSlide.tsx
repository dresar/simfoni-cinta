import React from "react";
import { Copy, Check } from "lucide-react";
import type { InvitationData, PresetThemeTokens } from "../../../types";

interface GiftsSlideProps {
	data: InvitationData;
	theme: PresetThemeTokens;
	copiedBankId: string | null;
	onCopyAccount: (bankId: string, accountNumber: string) => void;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function GiftsSlide({
	data,
	theme,
	copiedBankId,
	onCopyAccount,
	slideAnimClass,
	ornaments,
}: GiftsSlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar pb-16 ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Tanda Kasih
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Amplop Digital
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto z-10 flex flex-col gap-2.5 my-auto">
				<p className="text-[10px] text-stone-300 text-center leading-tight mb-1">
					Doa restu Anda adalah hadiah terindah. Bagi yang ingin berbagi tanda kasih, dapat disalurkan melalui rekening berikut:
				</p>

				{data.banks.map((bank) => {
					const isCopied = copiedBankId === bank.bankId;
					return (
						<div
							key={bank.bankId}
							className="p-3 rounded-xl backdrop-blur-md border border-white/15 shadow-xl flex items-center justify-between gap-2 animate-image-from-left"
							style={{ backgroundColor: `${theme.menuBg}ee` }}
						>
							<div>
								<div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
									{bank.bankName}
								</div>
								<div className="text-xs font-mono font-bold text-white mt-0.5">
									{bank.accountNumber}
								</div>
								<div className="text-[9px] text-stone-300">
									a.n. {bank.accountHolder}
								</div>
							</div>

							<button
								type="button"
								onClick={() => onCopyAccount(bank.bankId, bank.accountNumber)}
								className="h-7 px-2.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
								style={{
									backgroundColor: isCopied ? "#059669" : theme.invAccent,
									color: "#ffffff",
								}}
							>
								{isCopied ? (
									<>
										<Check className="w-3 h-3" />
										<span>Tersalin</span>
									</>
								) : (
									<>
										<Copy className="w-3 h-3" />
										<span>Salin</span>
									</>
								)}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
