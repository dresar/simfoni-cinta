import heroDevices from "@/assets/hero-devices.jpg";
import { Reveal } from "./reveal";
import { IconArrowRight } from "./icons";

const trust = [
	{ value: "Rp15K+", label: "Harga Mulai" },
	{ value: "∞", label: "Nama Tamu" },
	{ value: "∞", label: "Penerima" },
	{ value: "∞", label: "Revisi" },
];

const petals = [
	{ top: "8%", left: "7%", size: 28, delay: "0s", duration: "6s", rotate: 15 },
	{
		top: "18%",
		left: "88%",
		size: 22,
		delay: "1.2s",
		duration: "7.5s",
		rotate: -30,
	},
	{
		top: "55%",
		left: "3%",
		size: 18,
		delay: "2.4s",
		duration: "5.8s",
		rotate: 45,
	},
	{
		top: "70%",
		left: "92%",
		size: 24,
		delay: "0.8s",
		duration: "8s",
		rotate: -15,
	},
	{
		top: "38%",
		left: "50%",
		size: 16,
		delay: "3s",
		duration: "6.5s",
		rotate: 60,
	},
];

export function Hero({ minPrice = 15000 }: { minPrice?: number }) {
	return (
		<section
			id="beranda"
			className="relative overflow-hidden pt-20 pb-4 sm:pt-24 sm:pb-6 md:pt-28 md:pb-8 lg:pt-32 lg:pb-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10"
			>
				<div className="absolute inset-0 bg-gradient-to-b from-sage/10 via-transparent to-background" />
				<div className="absolute -top-24 -left-24 h-[26rem] w-[26rem] rounded-full bg-sage/20 blur-3xl" />
				<div className="absolute top-20 -right-20 h-[24rem] w-[24rem] rounded-full bg-amber-500/10 blur-3xl" />
				<div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-sage/15 blur-3xl" />
				{petals.map((p, i) => (
					<svg
						key={i}
						aria-hidden="true"
						viewBox="0 0 40 40"
						className="animate-botanical-float absolute text-sage/35 pointer-events-none z-10"
						style={{
							top: p.top,
							left: p.left,
							width: p.size,
							height: p.size,
							animationDelay: p.delay,
							animationDuration: p.duration,
							transform: `rotate(${p.rotate}deg)`,
						}}
					>
						<ellipse cx="20" cy="12" rx="8" ry="12" fill="currentColor" />
						<ellipse
							cx="28"
							cy="22"
							rx="8"
							ry="12"
							fill="currentColor"
							transform="rotate(72 20 20)"
						/>
						<ellipse
							cx="24"
							cy="34"
							rx="8"
							ry="12"
							fill="currentColor"
							transform="rotate(144 20 20)"
						/>
						<ellipse
							cx="12"
							cy="34"
							rx="8"
							ry="12"
							fill="currentColor"
							transform="rotate(216 20 20)"
						/>
						<ellipse
							cx="8"
							cy="22"
							rx="8"
							ry="12"
							fill="currentColor"
							transform="rotate(288 20 20)"
						/>
					</svg>
				))}
			</div>

			<div className="container-page grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 xl:gap-14">
				<div className="max-w-xl">
					<Reveal>
						<span className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-card/90 px-3.5 py-1.5 backdrop-blur-sm shadow-xs">
							<span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
							<span className="eyebrow text-[0.7rem]">
								Undangan Digital Terjangkau
							</span>
						</span>
					</Reveal>

					<Reveal delay={60}>
						<h1 className="mt-4 sm:mt-5 text-[2.3rem] leading-[1.06] sm:text-[3.1rem] lg:text-[3.6rem] xl:text-[4.2rem] tracking-tight">
							Undangan Digital
							<br className="hidden sm:block" /> Mulai{" "}
							<span className="relative inline-block text-primary font-serif">
								Rp{minPrice.toLocaleString("id-ID")}
								<svg
									viewBox="0 0 300 14"
									aria-hidden="true"
									className="absolute -bottom-1 left-0 w-full text-sage/50"
									preserveAspectRatio="none"
								>
									<path
										d="M2 9C60 3 240 2 298 6"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
									/>
								</svg>
							</span>
						</h1>
					</Reveal>

					<Reveal delay={110}>
						<p className="mt-2.5 sm:mt-3 font-serif text-xl text-primary/85 italic sm:text-2xl lg:text-[1.45rem] leading-snug">
							Cantik, lengkap, dan siap dibagikan.
						</p>
					</Reveal>

					<Reveal delay={150}>
						<p className="mt-2.5 max-w-lg text-[0.88rem] sm:text-[0.94rem] leading-relaxed text-muted-foreground">
							Ratusan pilihan tema untuk semua selera. Bebas sebar ke siapa
							saja, bebas ubah nama tamu, tanpa masa aktif — dengan fitur yang
							benar-benar lengkap.
						</p>
					</Reveal>

					<Reveal delay={190}>
						<div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
							<a
								href="#template"
								className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-xs sm:text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
							>
								Lihat Template
								<IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
							</a>
							<a
								href="#fitur"
								className="inline-flex items-center justify-center rounded-full border border-primary/25 bg-card/90 px-7 py-3 text-xs sm:text-sm font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50"
							>
								Lihat Fitur
							</a>
						</div>
					</Reveal>

					<div role="region" aria-label="Statistik Layanan" className="mt-6 sm:mt-7 grid grid-cols-4 gap-2 sm:gap-3 border-t border-border/80 pt-4 sm:pt-5">
						{trust.map((t, i) => (
							<Reveal key={t.label} delay={230 + i * 50} className="min-w-0">
								<div className="card-matcha flex flex-col items-center justify-center rounded-xl sm:rounded-2xl px-2.5 py-2.5 sm:py-3 text-center shadow-xs">
									<span className="font-serif text-xl sm:text-2xl lg:text-[1.65rem] font-medium text-primary leading-tight">
										{t.value}
									</span>
									<span className="mt-0.5 text-[0.6rem] sm:text-[0.68rem] tracking-[0.11em] text-muted-foreground uppercase leading-tight font-medium">
										{t.label}
									</span>
								</div>
							</Reveal>
						))}
					</div>
				</div>

				<Reveal
					variant="scale"
					delay={100}
					className="relative flex justify-center lg:justify-end"
				>
					<div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] xl:max-w-[500px] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-lift">
						<img
							src="https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp"
							width={1080}
							height={1080}
							alt="Undangan pernikahan digital premium Simfoni Cinta: desain elegan, alunan musik romantis, dan fitur interaktif"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).src = heroDevices;
							}}
							className="h-auto w-full object-cover"
							fetchPriority="high"
						/>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
