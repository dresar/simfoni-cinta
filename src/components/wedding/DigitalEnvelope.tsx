import { useState } from "react";
import {
	Gift,
	CreditCard,
	QrCode,
	Copy,
	Check,
	Sparkle,
	Heart,
} from "@phosphor-icons/react";

type AccountItem = {
	bank: string;
	accountNumber: string;
	accountHolder: string;
	logo?: string;
	qrisUrl?: string;
};

export function DigitalEnvelope({
	accounts = [
		{
			bank: "BCA",
			accountNumber: "8415291039",
			accountHolder: "BAGAS PRATAMA",
		},
		{
			bank: "Mandiri",
			accountNumber: "1370019284910",
			accountHolder: "NINDYA AYU LARASATI",
		},
		{
			bank: "QRIS Mayar (Semua Bank / E-Wallet)",
			accountNumber: "QRIS-AKSARACINTA-LIVE",
			accountHolder: "AKSARACINTA WEDDING",
			qrisUrl:
				"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.LINKAJA.WWW0118936009140000000000021500000000000000051440014ID.DANA.WWW011893600914000000000002150000000000000005204581253033605802ID5912Aksara+Cinta6007JAKARTA61051219062070703A016304",
		},
	],
	giftAddress = "Jl. Cendrawasih No. 42, RT 03 / RW 07, Kebayoran Baru, Jakarta Selatan, 12150",
	recipientName = "Bagas & Nindya (0812-3456-7890)",
}: {
	accounts?: AccountItem[];
	giftAddress?: string;
	recipientName?: string;
}) {
	const [activeTab, setActiveTab] = useState<"transfer" | "qris" | "kado">(
		"transfer",
	);
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
	const [copiedAddress, setCopiedAddress] = useState(false);

	const copyToClipboard = (text: string, index: number) => {
		if (typeof window !== "undefined") {
			navigator.clipboard.writeText(text);
			setCopiedIndex(index);
			setTimeout(() => setCopiedIndex(null), 2500);
		}
	};

	const copyAddress = () => {
		if (typeof window !== "undefined") {
			navigator.clipboard.writeText(
				`${giftAddress}\nPenerima: ${recipientName}`,
			);
			setCopiedAddress(true);
			setTimeout(() => setCopiedAddress(false), 2500);
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto px-4 py-8">
			{/* Section Header */}
			<div className="text-center mb-8">
				<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider mb-2">
					<Gift weight="duotone" className="size-3.5" />
					Tanda Kasih & Amplop Digital
				</div>
				<h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
					Amplop Digital & Kado
				</h2>
				<p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
					Doa restu Anda adalah hadiah terindah. Namun jika ingin memberikan
					tanda kasih secara digital, Anda dapat menggunakan opsi berikut:
				</p>
			</div>

			{/* Tabs Switcher */}
			<div className="flex rounded-2xl bg-surface border border-border p-1 mb-6 max-w-md mx-auto">
				<button
					onClick={() => setActiveTab("transfer")}
					className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
						activeTab === "transfer"
							? "bg-card text-primary shadow-sm border border-border"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<CreditCard weight="duotone" className="size-4" />
					Transfer Bank
				</button>
				<button
					onClick={() => setActiveTab("qris")}
					className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
						activeTab === "qris"
							? "bg-card text-primary shadow-sm border border-border"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<QrCode weight="duotone" className="size-4" />
					QRIS Instan
				</button>
				<button
					onClick={() => setActiveTab("kado")}
					className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
						activeTab === "kado"
							? "bg-card text-primary shadow-sm border border-border"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<Gift weight="duotone" className="size-4" />
					Kirim Kado Fisik
				</button>
			</div>

			{/* Tab 1: Transfer Bank Cards */}
			{activeTab === "transfer" && (
				<div className="space-y-4">
					{accounts
						.filter((acc) => !acc.qrisUrl)
						.map((item, idx) => (
							<div
								key={idx}
								className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-lift transition-all relative overflow-hidden group"
							>
								<div className="flex items-center justify-between gap-4 mb-4">
									<div className="flex items-center gap-2.5">
										<div className="px-3 py-1 rounded-xl bg-primary/10 text-primary font-black text-sm tracking-wider">
											{item.bank}
										</div>
										<span className="text-xs text-muted-foreground font-medium">
											Bank Transfer
										</span>
									</div>
									<Sparkle weight="duotone" className="size-5 text-gold" />
								</div>

								<div className="space-y-1 mb-4">
									<p className="text-xs text-muted-foreground">
										Nomor Rekening
									</p>
									<p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground">
										{item.accountNumber}
									</p>
									<p className="text-xs font-semibold text-foreground/80 mt-1">
										a.n. {item.accountHolder}
									</p>
								</div>

								<button
									onClick={() => copyToClipboard(item.accountNumber, idx)}
									className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
										copiedIndex === idx
											? "bg-success text-success-foreground"
											: "bg-surface hover:bg-muted border border-border text-foreground"
									}`}
								>
									{copiedIndex === idx ? (
										<>
											<Check weight="bold" className="size-4" />
											Nomor Rekening Berhasil Disalin!
										</>
									) : (
										<>
											<Copy weight="duotone" className="size-4 text-primary" />
											Salin Nomor Rekening
										</>
									)}
								</button>
							</div>
						))}
				</div>
			)}

			{activeTab === "qris" && (
				<div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft text-center max-w-md mx-auto">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[11px] font-bold uppercase tracking-wider mb-4">
						<QrCode weight="duotone" className="size-3.5" />
						QRIS Dinamis (Semua Bank & E-Wallet)
					</div>

					<div className="p-4 bg-white rounded-2xl border border-border shadow-inner w-fit mx-auto mb-4">
						<img
							src={
								accounts.find((a) => a.qrisUrl)?.qrisUrl ||
								"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://simfonicinta.my.id/qris-demo"
							}
							alt="QRIS Code"
							className="size-56 object-contain mx-auto"
						/>
					</div>

					<h4 className="font-bold text-base text-foreground">
						Scan QRIS untuk Berbagi Kasih
					</h4>
					<p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
						Dukung pembayaran lewat BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA,
						ShopeePay, LinkAja, dll.
					</p>
				</div>
			)}

			{/* Tab 3: Gift Address */}
			{activeTab === "kado" && (
				<div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-3 rounded-2xl bg-gold/10 text-gold">
							<Gift weight="duotone" className="size-6" />
						</div>
						<div>
							<h4 className="font-bold text-base text-foreground">
								Alamat Pengiriman Kado Fisik
							</h4>
							<p className="text-xs text-muted-foreground">
								Kirimkan kado ke alamat kediaman mempelai
							</p>
						</div>
					</div>

					<div className="p-4 rounded-2xl bg-surface border border-border mb-4">
						<p className="text-sm font-medium text-foreground leading-relaxed">
							{giftAddress}
						</p>
						<p className="text-xs font-semibold text-primary mt-2">
							Penerima: {recipientName}
						</p>
					</div>

					<button
						onClick={copyAddress}
						className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
							copiedAddress
								? "bg-success text-success-foreground"
								: "bg-surface hover:bg-muted border border-border text-foreground"
						}`}
					>
						{copiedAddress ? (
							<>
								<Check weight="bold" className="size-4" />
								Alamat Berhasil Disalin!
							</>
						) : (
							<>
								<Copy weight="duotone" className="size-4 text-primary" />
								Salin Alamat Lengkap
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
}
