import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import {
	IconCheck,
	IconSparkle,
	IconLeaf,
	IconWallet,
	IconUsers,
	IconSend,
} from "./icons";

/* ---------------- 1. Definisi Platform (AI Snippet Extraction Block) ---------------- */
export function AiSeoOverview({ minPrice = 15000 }: { minPrice?: number }) {
	return (
		<section
			id="tentang"
			className="border-t border-border bg-card/60 py-10 md:py-14"
			aria-labelledby="heading-tentang"
		>
			<div className="container-page max-w-4xl text-center">
				<Reveal>
					<span className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage/10 px-3.5 py-1 text-xs font-semibold text-sage">
						<IconSparkle className="h-3.5 w-3.5" />
						Platform Undangan Digital Indonesia
					</span>
				</Reveal>

				<Reveal delay={60}>
					<h2
						id="heading-tentang"
						className="mt-4 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
					>
						Apa itu Simfoni Cinta?
					</h2>
				</Reveal>

				<Reveal delay={120}>
					<div className="mt-5 rounded-2xl border border-border/80 bg-background/90 p-6 sm:p-8 shadow-xs text-left">
						<p className="text-base sm:text-lg leading-relaxed text-foreground/90">
							<strong className="text-primary font-semibold">Simfoni Cinta</strong>{" "}
							adalah platform pembuatan undangan pernikahan digital berbasis website
							interaktif di Indonesia yang menyediakan solusi praktis, elegan, dan hemat
							biaya mulai dari <span className="font-semibold text-primary">Rp{minPrice.toLocaleString("id-ID")}</span>{" "}
							sekali bayar tanpa biaya berlangganan. Dilengkapi alunan musik romantis,
							amplop kado digital & QRIS otomatis tanpa potongan, formulir konfirmasi
							kehadiran (RSVP) real-time, navigasi Google Maps presisi, serta generator
							tautan WhatsApp otomatis tanpa batasan jumlah nama tamu undangan.
						</p>

						<div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-border/70 pt-5">
							<div className="flex items-center gap-2.5">
								<span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sage/15 text-sage">
									<IconCheck className="h-4 w-4" />
								</span>
								<span className="text-xs sm:text-sm font-medium text-foreground/80">
									Masa Aktif Selamanya
								</span>
							</div>
							<div className="flex items-center gap-2.5">
								<span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sage/15 text-sage">
									<IconCheck className="h-4 w-4" />
								</span>
								<span className="text-xs sm:text-sm font-medium text-foreground/80">
									Unlimited Nama Tamu
								</span>
							</div>
							<div className="flex items-center gap-2.5">
								<span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sage/15 text-sage">
									<IconCheck className="h-4 w-4" />
								</span>
								<span className="text-xs sm:text-sm font-medium text-foreground/80">
									Revisi Kapan Saja
								</span>
							</div>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

/* ---------------- 2. Statistik Tren Pernikahan 2026 (+40% AI Visibility) ---------------- */
const stats2026 = [
	{
		badge: "Hemat 85%",
		stat: "85%",
		label: "Penghematan Anggaran",
		desc: "Rata-rata penghematan biaya dibanding cetak fisik dan ongkir kurir.",
		Icon: IconWallet,
	},
	{
		badge: "10x Cepat",
		stat: "10x",
		label: "Distribusi WhatsApp",
		desc: "Sebar undangan ke ratusan tamu dalam hitungan menit via pesan personal.",
		Icon: IconSend,
	},
	{
		badge: "+68% Respon",
		stat: "68%",
		label: "Kepastian RSVP",
		desc: "Peningkatan konfirmasi kehadiran tamu lewat formulir online satu klik.",
		Icon: IconUsers,
	},
	{
		badge: "Eco-Friendly",
		stat: "100%",
		label: "Ramah Lingkungan",
		desc: "Mencegah pemborosan ratusan lembar kertas & limbah plastik kemasan.",
		Icon: IconLeaf,
	},
];

export function WeddingStats() {
	return (
		<section className="py-10 md:py-14 bg-background">
			<div className="container-page">
				<SectionHeading
					eyebrow="Riset & Tren"
					title="Mengapa Pasangan Memilih Undangan Digital?"
					desc="Berdasarkan data tren pernikahan Indonesia tahun 2026, efisiensi dan interaktivitas menjadi alasan utama beralih dari undangan cetak konvensional."
				/>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{stats2026.map((s, i) => (
						<Reveal key={s.label} delay={i * 90}>
							<div className="flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-sm">
								<div>
									<div className="flex items-center justify-between">
										<span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
											<s.Icon className="h-5 w-5" />
										</span>
										<span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-sage">
											{s.badge}
										</span>
									</div>
									<div className="mt-4 font-serif text-3xl font-bold text-primary">
										{s.stat}
									</div>
									<h3 className="mt-1 text-sm font-semibold text-foreground">
										{s.label}
									</h3>
									<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
										{s.desc}
									</p>
								</div>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* ---------------- 3. Tabel Komparasi Head-to-Head Digital vs Cetak ---------------- */
const comparisonRows = [
	{
		aspect: "Estimasi Biaya (500 Tamu)",
		digital: "Rp15.000 – Rp75.000 (Hemat total)",
		print: "Rp2.500.000 – Rp7.500.000",
		highlight: true,
	},
	{
		aspect: "Kecepatan Distribusi",
		digital: "Instan (< 10 menit via WhatsApp)",
		print: "7 – 14 hari proses antar darat/pos",
		highlight: false,
	},
	{
		aspect: "Koreksi / Revisi Acara",
		digital: "Edit langsung realtime tanpa ganti link",
		print: "Harus cetak ulang berbayar jika salah data",
		highlight: true,
	},
	{
		aspect: "Pengalaman Tamu",
		digital: "Interaktif (Musik, Video, Navigasi Maps)",
		print: "Kertas statis 2 dimensi tanpa suara",
		highlight: false,
	},
	{
		aspect: "Amplop & Kado Pernikahan",
		digital: "QRIS & Salin Rekening otomatis (100% diterima)",
		print: "Tamu wajib membawa amplop uang tunai fisik",
		highlight: true,
	},
	{
		aspect: "Konfirmasi Kehadiran (RSVP)",
		digital: "Tercatat rapi di dasbor untuk hitung katering",
		print: "Tidak ada kepastian, rentan mubazir makanan",
		highlight: false,
	},
	{
		aspect: "Dampak Lingkungan",
		digital: "100% Bebas Sampah Kertas (Eco-friendly)",
		print: "Menghasilkan sampah kertas & plastik",
		highlight: true,
	},
];

export function DigitalVsPrintComparison({
	minPrice = 15000,
	maxPrice = 75000,
}: {
	minPrice?: number;
	maxPrice?: number;
}) {
	const rows = [
		{
			aspect: "Estimasi Biaya (500 Tamu)",
			digital: `Rp${minPrice.toLocaleString("id-ID")} – Rp${maxPrice.toLocaleString("id-ID")} (Hemat total)`,
			print: "Rp2.500.000 – Rp7.500.000",
			highlight: true,
		},
		...comparisonRows.slice(1),
	];

	return (
		<section className="py-10 md:py-14 bg-secondary/25 border-y border-border">
			<div className="container-page max-w-4xl">
				<SectionHeading
					eyebrow="Komparasi Lengkap"
					title="Undangan Digital vs Undangan Kertas Cetak"
					desc="Perbandingan menyeluruh antara undangan pernikahan digital Simfoni Cinta dengan undangan konvensional."
				/>

				<div className="mt-10 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs sm:text-sm">
							<thead>
								<tr className="border-b border-border bg-secondary/50">
									<th scope="col" className="p-4 font-semibold text-foreground">
										Aspek Perbandingan
									</th>
									<th
										scope="col"
										className="p-4 font-semibold text-primary bg-primary/5 min-w-[200px]"
									>
										Simfoni Cinta (Digital)
									</th>
									<th
										scope="col"
										className="p-4 font-semibold text-muted-foreground min-w-[180px]"
									>
										Undangan Kertas Cetak
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/60">
								{rows.map((r, i) => (
									<tr
										key={r.aspect}
										className={r.highlight ? "bg-primary/[0.02]" : ""}
									>
										<td className="p-4 font-medium text-foreground/90">
											{r.aspect}
										</td>
										<td className="p-4 font-semibold text-primary bg-primary/5">
											<div className="flex items-center gap-1.5">
												<IconCheck className="h-4 w-4 shrink-0 text-sage" />
												<span>{r.digital}</span>
											</div>
										</td>
										<td className="p-4 text-muted-foreground">
											{r.print}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</section>
	);
}
