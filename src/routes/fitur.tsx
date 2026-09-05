import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections-b";
import { FloatingWa } from "@/components/landing/floating-wa";
import {
	QrCode,
	EnvelopeSimple,
	Users,
	Sparkle,
	ArrowLeft,
	ShieldCheck,
	ClockCountdown,
	ChatTeardropDots,
	CheckCircle,
	Lightning,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/fitur")({
	head: () => ({
		meta: [
			{ title: "Fitur Unggulan — RSVP & Amplop QRIS | Simfoni Cinta" },
			{
				name: "description",
				content:
					"Fitur RSVP, Buku Tamu, dan Amplop Digital QRIS otomatis Simfoni Cinta dalam tahap penyempurnaan dan pengembangan sistem.",
			},
		],
	}),
	component: FiturPublicPage,
});

function FiturPublicPage() {
	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			<Navbar />

			<main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20 relative overflow-hidden">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 -z-10 opacity-35"
					style={{
						backgroundImage:
							"radial-gradient(circle at 50% 20%, rgba(212,175,55,0.12), transparent 60%)",
					}}
				/>

				<div className="container-page max-w-4xl mx-auto px-4">
					<div className="mb-8">
						<Link
							to="/"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
						>
							<ArrowLeft className="size-3.5" />
							<span>Kembali ke Beranda</span>
						</Link>
					</div>

					<div className="text-center max-w-2xl mx-auto mb-12">
						<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
							<ClockCountdown className="size-3.5 animate-spin" weight="bold" />
							<span>Tahap Pengembangan & Penyempurnaan</span>
						</div>
						<h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
							RSVP Online & Amplop Digital QRIS
						</h1>
						<p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
							Sistem konfirmasi kehadiran real-time serta penerimaan hadiah digital QRIS otomatis langsung tanpa potongan biaya perantara sedang dalam tahap integrasi final.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 mb-12">
						<div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 backdrop-blur-sm shadow-xs relative overflow-hidden flex flex-col justify-between">
							<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
							<div>
								<div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-xs">
									<QrCode className="size-6" weight="duotone" />
								</div>
								<div className="flex items-center gap-2 mb-2">
									<h2 className="font-serif text-xl font-bold text-foreground">
										Amplop Digital & QRIS Otomatis
									</h2>
								</div>
								<span className="inline-block rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-3">
									Dalam Pengembangan
								</span>
								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
									Fitur ini memungkinkan tamu undangan memberikan hadiah pernikahan secara cashless melalui scan kode QRIS instan dari seluruh perbankan dan e-wallet di Indonesia (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay). Dana langsung terkirim ke rekening mempelai tanpa potongan pihak ketiga.
								</p>
								<ul className="space-y-2.5 text-xs text-foreground/85">
									<li className="flex items-center gap-2">
										<CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
										<span>Integrasi QRIS Dinamis & Statis Nasional</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
										<span>Konfirmasi nominal & ucapan selamat instan</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
										<span>Rekap data amplop masuk aman dan transparan</span>
									</li>
								</ul>
							</div>
							<div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<ShieldCheck className="size-4 text-primary" weight="bold" />
									Keamanan 100% Terenkripsi
								</span>
								<span className="font-semibold text-primary">Segera Rilis</span>
							</div>
						</div>

						<div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 backdrop-blur-sm shadow-xs relative overflow-hidden flex flex-col justify-between">
							<div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-bl-full pointer-events-none" />
							<div>
								<div className="size-12 rounded-xl bg-sage/15 border border-sage/25 flex items-center justify-center text-sage mb-5 shadow-xs">
									<EnvelopeSimple className="size-6" weight="duotone" />
								</div>
								<div className="flex items-center gap-2 mb-2">
									<h2 className="font-serif text-xl font-bold text-foreground">
										RSVP & Buku Tamu Real-Time
									</h2>
								</div>
								<span className="inline-block rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-3">
									Dalam Pengembangan
								</span>
								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
									Pengelolaan kehadiran tamu undangan dengan status Hadir / Tidak Hadir / Ragu-ragu, jumlah tamu yang diajak (Pax), pesan doa restu, serta sinkronisasi otomatis ke buku tamu dan QR Meja Resepsi untuk kemudahan resepsi Anda.
								</p>
								<ul className="space-y-2.5 text-xs text-foreground/85">
									<li className="flex items-center gap-2">
										<CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
										<span>Konfirmasi kehadiran 1-klik tanpa login tamu</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
										<span>Estimasi katering otomatis berdasarkan Pax</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
										<span>Integrasi QR Check-in Meja Resepsi di lokasi</span>
									</li>
								</ul>
							</div>
							<div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<Lightning className="size-4 text-amber-500" weight="bold" />
									Sinkronisasi Dasbor Cepat
								</span>
								<span className="font-semibold text-primary">Segera Rilis</span>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-6 sm:p-8 text-center relative overflow-hidden">
						<div className="max-w-xl mx-auto">
							<Sparkle className="size-7 text-primary mx-auto mb-3" weight="fill" />
							<h3 className="font-serif text-lg sm:text-xl font-bold text-foreground mb-2">
								Ingin Menggunakan Fitur Ini Lebih Awal?
							</h3>
							<p className="text-xs sm:text-sm text-muted-foreground mb-6">
								Anda tetap dapat mengaktifkan rekening bank manual atau konsultasi langsung dengan Admin Simfoni Cinta untuk uji coba RSVP dan QRIS khusus pada paket undangan Anda.
							</p>
							<div className="flex flex-wrap items-center justify-center gap-3">
								<a
									href="https://wa.me/6281234567890?text=Halo%20Admin%20Aksara%20Cinta,%20saya%20ingin%20tahu%20informasi%20fitur%20RSVP%20dan%20QRIS"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
								>
									<ChatTeardropDots className="size-4" weight="bold" />
									<span>Hubungi Admin WhatsApp</span>
								</a>
								<Link
									to="/demo"
									className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
								>
									<span>Lihat Demo Template</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
			<FloatingWa />
		</div>
	);
}
