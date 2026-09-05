export type BankOption = {
	id: string;
	name: string;
	category: "Bank" | "E-Wallet" | "Lainnya";
	color: string;
	bg: string;
};

export const BANK_LIST: BankOption[] = [
	{
		id: "BCA",
		name: "BCA (Bank Central Asia)",
		category: "Bank",
		color: "#005baa",
		bg: "#e6f0fa",
	},
	{
		id: "Mandiri",
		name: "Bank Mandiri",
		category: "Bank",
		color: "#003d79",
		bg: "#e6eef5",
	},
	{
		id: "BRI",
		name: "Bank BRI",
		category: "Bank",
		color: "#00529c",
		bg: "#e6edf5",
	},
	{
		id: "BNI",
		name: "Bank BNI",
		category: "Bank",
		color: "#f15a24",
		bg: "#fef0e9",
	},
	{
		id: "BSI",
		name: "Bank Syariah Indonesia (BSI)",
		category: "Bank",
		color: "#00a39d",
		bg: "#e6f6f5",
	},
	{
		id: "Bank Jago",
		name: "Bank Jago",
		category: "Bank",
		color: "#8b5cf6",
		bg: "#f3f0ff",
	},
	{
		id: "SeaBank",
		name: "SeaBank",
		category: "Bank",
		color: "#ff5722",
		bg: "#fff0eb",
	},
	{
		id: "CIMB Niaga",
		name: "CIMB Niaga",
		category: "Bank",
		color: "#d91e18",
		bg: "#fde9e8",
	},
	{
		id: "Permata",
		name: "Permata Bank",
		category: "Bank",
		color: "#7cb342",
		bg: "#f2f8ec",
	},
	{
		id: "Danamon",
		name: "Bank Danamon",
		category: "Bank",
		color: "#f39c12",
		bg: "#fef5e7",
	},
	{
		id: "BTN",
		name: "Bank BTN",
		category: "Bank",
		color: "#2980b9",
		bg: "#eaf2f8",
	},
	{
		id: "GoPay",
		name: "GoPay (Gojek)",
		category: "E-Wallet",
		color: "#00aed6",
		bg: "#e6f7fb",
	},
	{
		id: "OVO",
		name: "OVO Cash",
		category: "E-Wallet",
		color: "#4c2a86",
		bg: "#ede9f3",
	},
	{
		id: "DANA",
		name: "DANA Dompet Digital",
		category: "E-Wallet",
		color: "#118eea",
		bg: "#e7f4fd",
	},
	{
		id: "ShopeePay",
		name: "ShopeePay",
		category: "E-Wallet",
		color: "#ee4d2d",
		bg: "#fdedea",
	},
	{
		id: "LinkAja",
		name: "LinkAja",
		category: "E-Wallet",
		color: "#e11931",
		bg: "#fce8eb",
	},
	{
		id: "Lainnya",
		name: "Bank / E-Wallet Lainnya (Custom)",
		category: "Lainnya",
		color: "#475569",
		bg: "#f1f5f9",
	},
];

export function BankBadgeIcon({ id }: { id: string }) {
	const bank = BANK_LIST.find(
		(b) => b.id.toLowerCase() === id.toLowerCase(),
	) || {
		id: "Lainnya",
		name: id,
		category: "Lainnya" as const,
		color: "#475569",
		bg: "#f1f5f9",
	};

	return (
		<div
			className="inline-flex items-center justify-center font-bold text-[10px] uppercase rounded-lg px-2 py-0.5 border shrink-0 tracking-wider shadow-xs"
			style={{
				backgroundColor: bank.bg,
				color: bank.color,
				borderColor: `${bank.color}40`,
			}}
		>
			{id === "Lainnya" ? "OTHER" : id.slice(0, 8)}
		</div>
	);
}
