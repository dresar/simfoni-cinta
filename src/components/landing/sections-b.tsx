import { useState, useMemo, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore, type PricingPackage } from "@/store/appStore";
import adminTeam from "@/assets/admin-team.jpg";
import ctaBanner from "@/assets/cta-banner.jpg";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { Logo } from "./navbar";
import {
	blogPosts,
	comparison,
	faqs,
	testimonials,
	type FaqCategory,
} from "./data";
import blogData from "@/data/blog-manifest.json";
import {
	IconArrowRight,
	IconCheck,
	IconDevice,
	IconHeadset,
	IconInfinity,
	IconPalette,
	IconPen,
	IconSend,
	IconShield,
	IconSparkle,
	IconStar,
	IconTemplate,
	IconWallet,
} from "./icons";

function IconWhatsapp({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor">
			<path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-3.9A8 8 0 1 1 20 12Z" />
			<path
				d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.4-.8-1 .8A5 5 0 0 1 10.9 11l.8-1L11 8.5c-.5 0-1 .4-1 1H9Z"
				fill="white"
			/>
		</svg>
	);
}

/* ---------------- How it works ---------------- */

const steps = [
	{
		no: "01",
		title: "Pilih Desain & Paket",
		desc: "Telusuri pilihan tema eksklusif dan tentukan paket undangan yang sesuai.",
		Icon: IconTemplate,
	},
	{
		no: "02",
		title: "Lengkapi Data Undangan",
		desc: "Isi data mempelai, jadwal acara, maps lokasi, galeri foto & musik latar.",
		Icon: IconPen,
	},
	{
		no: "03",
		title: "Pembayaran Pesanan",
		desc: "Selesaikan pembayaran pesanan paket mulai dari Rp15.000 via QRIS / Bank.",
		Icon: IconWallet,
	},
	{
		no: "04",
		title: "Proses & Verifikasi Admin",
		desc: "Tim Admin menyusun, memverifikasi data, dan menyiapkan website Anda (1–3 hari kerja).",
		Icon: IconHeadset,
	},
	{
		no: "05",
		title: "Undangan Siap Disebar",
		desc: "Tautan resmi aktif dan siap dibagikan ke seluruh tamu undangan lewat WhatsApp.",
		Icon: IconSend,
	},
];

export function HowItWorks({ minPrice = 15000 }: { minPrice?: number }) {
	const localizedSteps = steps.map((s) => {
		if (s.no === "03") {
			return {
				...s,
				desc: `Selesaikan pembayaran pesanan paket mulai dari Rp${minPrice.toLocaleString("id-ID")} via QRIS / Bank.`,
			};
		}
		return s;
	});

	return (
		<section
			id="cara-kerja"
			className="border-y border-border bg-card py-10 md:py-14"
		>
			<div className="container-page">
				<SectionHeading
					eyebrow="Cara Kerja"
					title="Cara Membuat Undangan"
					desc="5 tahap mudah dan transparan dari pemilihan desain hingga verifikasi admin sebelum disebarkan."
				/>

				<div className="relative mt-14">
					<span
						aria-hidden="true"
						className="absolute top-6 left-[1.4rem] hidden h-[calc(100%-3rem)] w-px bg-border lg:block lg:top-[1.4rem] lg:left-0 lg:h-px lg:w-full"
					/>
					<span
						aria-hidden="true"
						className="absolute top-6 left-[1.4rem] block h-[calc(100%-3rem)] w-px bg-border lg:hidden"
					/>
					<ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 list-none p-0 m-0">
						{localizedSteps.map((s, i) => (
							<li key={s.no} className="relative min-w-0 pl-14 lg:pl-0">
								<Reveal delay={i * 100}>
									<span className="absolute -left-14 top-0 grid h-11 w-11 place-items-center rounded-full border border-sage/35 bg-background text-primary lg:static lg:mb-6">
										<s.Icon className="h-5 w-5" />
									</span>
									<p className="font-serif text-3xl text-sage/70">{s.no}</p>
									<h3 className="mt-2 font-serif text-lg font-semibold">
										{s.title}
									</h3>
									<p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
										{s.desc}
									</p>
								</Reveal>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}

/* ---------------- Admin service ---------------- */

export function AdminService() {
	return (
		<section className="py-10 md:py-14">
			<div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
				<Reveal variant="scale">
					<div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
						<img
							src="https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-tidak-mau-ribet.webp"
							width={900}
							height={900}
							loading="lazy"
							alt="Layanan concierge admin Simfoni Cinta: terima beres siap sebar"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).src = adminTeam;
							}}
							className="w-full object-cover"
						/>
					</div>
				</Reveal>

				<Reveal variant="right" delay={100}>
					<span className="eyebrow">Tidak Mau Ribet?</span>
					<h2 className="mt-3 text-[2rem] leading-[1.12] sm:text-[2.6rem]">
						Biar Kami yang Kerjakan.
					</h2>
					<p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
						Cukup kirim data acara, foto, dan daftar tamu. Admin kami yang
						menyusun undangannya sampai rapi dan siap dibagikan — termasuk
						revisi tanpa batas.
					</p>
					<div className="mt-7 flex flex-wrap gap-2.5">
						{[
							"Dibuatkan admin",
							"Revisi sepuasnya",
							"Bantuan via WhatsApp",
						].map((t) => (
							<span
								key={t}
								className="rounded-lg border border-border/70 bg-card px-3.5 py-1.5 text-[0.76rem] text-muted-foreground font-medium"
							>
								{t}
							</span>
						))}
					</div>
					<a
						href="#harga"
						className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-xs"
					>
						Konsultasi Sekarang
						<IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
					</a>
				</Reveal>
			</div>
		</section>
	);
}

/* ---------------- Why us ---------------- */

const reasons = [
	{
		title: "Banyak Pilihan Desain",
		desc: "Puluhan tema untuk setiap selera.",
		Icon: IconPalette,
	},
	{
		title: "Mudah Digunakan",
		desc: "Tanpa perlu paham desain.",
		Icon: IconSparkle,
	},
	{
		title: "Fitur Lengkap",
		desc: "RSVP, maps, galeri, hadiah.",
		Icon: IconCheck,
	},
	{
		title: "Responsive",
		desc: "Rapi di semua ukuran layar.",
		Icon: IconDevice,
	},
	{
		title: "Bagikan Tanpa Batas",
		desc: "Penerima sebanyak apa pun.",
		Icon: IconInfinity,
	},
	{ title: "Akses Selamanya", desc: "Tidak ada masa aktif.", Icon: IconShield },
];

export function WhyUs() {
	return (
		<section className="border-y border-border bg-secondary/40 py-10 md:py-14">
			<div className="container-page">
				<SectionHeading
					eyebrow="Alasan Memilih Kami"
					title="Kenapa Simfoni Cinta?"
				/>
				<div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
					{reasons.map((r, i) => (
						<Reveal key={r.title} delay={(i % 3) * 110} className="min-w-0">
							<div className="flex h-full items-start gap-3.5 rounded-xl border border-border/70 bg-card p-4.5 shadow-xs transition-all duration-300 hover:shadow-sm">
								<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sage/30 bg-background text-primary">
									<r.Icon className="h-4.5 w-4.5" />
								</span>
								<div className="min-w-0">
									<h3 className="font-serif text-base sm:text-lg font-bold leading-tight">
										{r.title}
									</h3>
									<p className="mt-1 text-[0.8rem] text-muted-foreground">
										{r.desc}
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

/* ---------------- Pricing ---------------- */

export function Pricing({
	dynamicPackages,
}: {
	dynamicPackages?: PricingPackage[];
}) {
	const { packages: storePackages } = useStore();
	const packages =
		dynamicPackages && dynamicPackages.length > 0
			? dynamicPackages
			: storePackages;

	return (
		<section id="harga" className="py-10 md:py-14">
			<div className="container-page">
				<SectionHeading
					eyebrow="Harga"
					title="Satu Harga, Fitur Penuh"
					desc="Paket termurah sudah membawa hampir semua fitur. Pilih yang paling sesuai kebutuhan kalian."
				/>

				<div className="mt-10 grid items-start gap-4 lg:grid-cols-3">
					{packages.map((pkg, i) => {
						const featured = pkg.popular || pkg.id === "gold";
						const priceFormatted = pkg.price.toLocaleString("id-ID");
						const waText = encodeURIComponent(
							`Halo Admin Simfoni Cinta,\n\nSaya ingin memesan paket:\n\n📦 *${pkg.name}*\n💰 Harga: Rp ${priceFormatted}\n\nMohon info langkah selanjutnya. Terima kasih!`,
						);
						return (
							<Reveal key={pkg.id} delay={i * 120} className="min-w-0">
								<div
									className={cn(
										"relative flex h-full flex-col rounded-xl border p-5 shadow-xs transition-all duration-300 hover:shadow-sm",
										featured
											? "border-primary/50 bg-card ring-1 ring-primary/20"
											: "border-border/70 bg-card",
									)}
								>
									{featured && (
										<span className="absolute -top-2.5 left-5 rounded-md bg-primary px-2.5 py-0.5 text-[0.62rem] font-bold tracking-wider text-primary-foreground uppercase">
											Paling Populer
										</span>
									)}
									{pkg.badge && !featured && (
										<span className="absolute -top-2.5 left-5 rounded-md bg-secondary border border-border px-2.5 py-0.5 text-[0.62rem] font-bold tracking-wider text-foreground uppercase">
											{pkg.badge}
										</span>
									)}
									<p className="text-[0.68rem] tracking-[0.16em] font-bold text-muted-foreground uppercase">
										{pkg.name}
									</p>
									<div className="mt-3">
										<div className="flex items-baseline gap-2 flex-wrap">
											<p className="font-serif text-[2rem] sm:text-[2.3rem] font-bold leading-none text-primary">
												<span className="align-top text-sm font-medium">Rp</span>
												{priceFormatted}
											</p>
											{pkg.originalPrice && pkg.originalPrice > pkg.price && (
												<div className="flex items-center gap-1.5">
													<span className="text-xs font-semibold text-muted-foreground/70 line-through decoration-rose-500/70">
														Rp{pkg.originalPrice.toLocaleString("id-ID")}
													</span>
													<span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[0.62rem] font-bold text-rose-600">
														Hemat {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
													</span>
												</div>
											)}
										</div>
									</div>
									<p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
										Masa Aktif: {pkg.activeDuration}
									</p>
									<ul className="mt-5 flex-1 space-y-2 border-t border-border/60 pt-4">
										{pkg.features.map((f) => (
											<li
												key={f}
												className="flex items-start gap-2 text-[0.82rem]"
											>
												<IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
												<span>{f}</span>
											</li>
										))}
									</ul>
									<div className="mt-6 flex flex-col gap-2">
										<a
											href="/dasbor/paket"
											className={cn(
												"inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200",
												featured
													? "bg-primary text-primary-foreground hover:bg-primary/90"
													: "border border-primary text-primary hover:bg-primary/10",
											)}
										>
											Pesan Otomatis
											<IconArrowRight className="h-3.5 w-3.5" />
										</a>
										<a
											href={`https://wa.me/6282392115909?text=${waText}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#128C7E] transition-all duration-200 hover:bg-[#25D366]/20"
										>
											<IconWhatsapp className="h-3.5 w-3.5 text-[#25D366]" />
											Pesan via WhatsApp
										</a>
									</div>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}

/* ---------------- Comparison ---------------- */

type ComparisonPlan = "silver" | "gold" | "platinum";

function ComparisonCell({
	value,
	className,
}: {
	value: any;
	className?: string;
}) {
	if (value === true)
		return <IconCheck className={cn("h-4 w-4 text-sage", className)} />;
	if (value === false)
		return <span className={cn("text-muted-foreground", className)}>—</span>;
	if (typeof value === "object" && value !== null) {
		return <span className={className}>{value.price || String(value)}</span>;
	}
	return <span className={className}>{value}</span>;
}

export function Comparison({
	dynamicPackages,
}: {
	dynamicPackages?: PricingPackage[];
}) {
	const { packages: storePackages } = useStore();
	const packages =
		dynamicPackages && dynamicPackages.length > 0
			? dynamicPackages
			: storePackages;

	const [activePlan, setActivePlan] = useState<ComparisonPlan>("silver");

	const silverPkg = packages.find((p) => p.id === "silver");
	const goldPkg = packages.find((p) => p.id === "gold");
	const platinumPkg = packages.find((p) => p.id === "platinum");

	const planPrice: Record<
		ComparisonPlan,
		{ price: string; original?: string; discount?: number }
	> = {
		silver: {
			price: silverPkg
				? `Rp ${silverPkg.price.toLocaleString("id-ID")}`
				: "Rp 15.000",
			original: silverPkg?.originalPrice
				? `Rp ${silverPkg.originalPrice.toLocaleString("id-ID")}`
				: "Rp 75.000",
			discount:
				silverPkg?.originalPrice && silverPkg.originalPrice > silverPkg.price
					? Math.round(
							((silverPkg.originalPrice - silverPkg.price) /
								silverPkg.originalPrice) *
								100,
						)
					: 80,
		},
		gold: {
			price: goldPkg
				? `Rp ${goldPkg.price.toLocaleString("id-ID")}`
				: "Rp 35.000",
			original: goldPkg?.originalPrice
				? `Rp ${goldPkg.originalPrice.toLocaleString("id-ID")}`
				: "Rp 120.000",
			discount:
				goldPkg?.originalPrice && goldPkg.originalPrice > goldPkg.price
					? Math.round(
							((goldPkg.originalPrice - goldPkg.price) /
								goldPkg.originalPrice) *
								100,
						)
					: 71,
		},
		platinum: {
			price: platinumPkg
				? `Rp ${platinumPkg.price.toLocaleString("id-ID")}`
				: "Rp 75.000",
			original: platinumPkg?.originalPrice
				? `Rp ${platinumPkg.originalPrice.toLocaleString("id-ID")}`
				: "Rp 250.000",
			discount:
				platinumPkg?.originalPrice && platinumPkg.originalPrice > platinumPkg.price
					? Math.round(
							((platinumPkg.originalPrice - platinumPkg.price) /
								platinumPkg.originalPrice) *
								100,
						)
					: 70,
		},
	};

	const planLabel: Record<ComparisonPlan, string> = {
		silver: silverPkg?.name
			? silverPkg.name.replace(/^Paket\s+/i, "")
			: "Silver",
		gold: goldPkg?.name ? goldPkg.name.replace(/^Paket\s+/i, "") : "Gold",
		platinum: platinumPkg?.name
			? platinumPkg.name.replace(/^Paket\s+/i, "")
			: "Platinum",
	};

	const dynamicComparison = useMemo(() => {
		return comparison.map((c) => {
			if (c.feature === "Masa Aktif") {
				return {
					...c,
					silver: silverPkg?.activeDuration || c.silver,
					gold: goldPkg?.activeDuration || c.gold,
					platinum: platinumPkg?.activeDuration || c.platinum,
				};
			}
			if (c.feature === "Galeri Foto") {
				return {
					...c,
					silver: silverPkg
						? typeof silverPkg.maxPhotos === "number"
							? `${silverPkg.maxPhotos} Foto`
							: "Unlimited"
						: c.silver,
					gold: goldPkg
						? typeof goldPkg.maxPhotos === "number"
							? `${goldPkg.maxPhotos} Foto`
							: "Unlimited"
						: c.gold,
					platinum: platinumPkg
						? typeof platinumPkg.maxPhotos === "number"
							? `${platinumPkg.maxPhotos} Foto`
							: "Unlimited"
						: c.platinum,
				};
			}
			if (c.feature === "Broadcast WhatsApp") {
				return {
					...c,
					silver: silverPkg
						? silverPkg.maxWaQuota
							? typeof silverPkg.maxWaQuota === "number"
								? `${silverPkg.maxWaQuota} Kuota`
								: true
							: false
						: c.silver,
					gold: goldPkg
						? goldPkg.maxWaQuota
							? typeof goldPkg.maxWaQuota === "number"
								? `${goldPkg.maxWaQuota} Kuota`
								: true
							: true
						: c.gold,
					platinum: platinumPkg
						? platinumPkg.maxWaQuota
							? typeof platinumPkg.maxWaQuota === "number"
								? `${platinumPkg.maxWaQuota} Kuota`
								: true
							: true
						: c.platinum,
				};
			}
			if (c.feature === "Musik Latar Kustom") {
				return {
					...c,
					silver: silverPkg ? silverPkg.hasCustomMusic : c.silver,
					gold: goldPkg ? goldPkg.hasCustomMusic : c.gold,
					platinum: platinumPkg ? platinumPkg.hasCustomMusic : c.platinum,
				};
			}
			if (c.feature === "Love Story & Timeline") {
				return {
					...c,
					silver: silverPkg ? silverPkg.hasStoryTimeline : c.silver,
					gold: goldPkg ? goldPkg.hasStoryTimeline : c.gold,
					platinum: platinumPkg ? platinumPkg.hasStoryTimeline : c.platinum,
				};
			}
			if (c.feature === "Domain Kustom") {
				return {
					...c,
					silver: silverPkg ? silverPkg.hasCustomDomain : c.silver,
					gold: goldPkg ? goldPkg.hasCustomDomain : c.gold,
					platinum: platinumPkg ? platinumPkg.hasCustomDomain : c.platinum,
				};
			}
			return c;
		});
	}, [silverPkg, goldPkg, platinumPkg]);

	return (
		<section className="border-y border-border bg-card py-10 md:py-14">
			<div className="container-page">
				<SectionHeading
					eyebrow="Perbandingan"
					title="Bandingkan dengan Jelas"
					desc="Gambaran umum dibanding layanan sejenis. Detail dapat berbeda tiap penyedia."
				/>

				<Reveal delay={100} className="mt-10 hidden md:block">
					<div className="overflow-hidden rounded-xl border border-border/70 shadow-xs">
						<table className="w-full text-left text-[0.85rem]">
							<caption className="sr-only">
								Perbandingan fitur Simfoni Cinta dan layanan lain
							</caption>
							<thead>
								<tr className="bg-secondary/50">
									<th scope="col" className="px-5 py-3.5 font-semibold">
										Fitur
									</th>
									<th
										scope="col"
										className="px-5 py-3.5 font-semibold text-primary"
									>
										<div>{planLabel.silver}</div>
										<div className="flex flex-col items-center gap-0.5 mt-0.5">
											{planPrice.silver.original && (
												<span className="text-[0.7rem] line-through text-muted-foreground/70">
													{planPrice.silver.original}
												</span>
											)}
											<span className="text-[0.82rem] font-bold text-primary">
												{planPrice.silver.price}
											</span>
										</div>
									</th>
									<th
										scope="col"
										className="px-5 py-3.5 font-semibold text-primary"
									>
										<div>{planLabel.gold}</div>
										<div className="flex flex-col items-center gap-0.5 mt-0.5">
											{planPrice.gold.original && (
												<span className="text-[0.7rem] line-through text-muted-foreground/70">
													{planPrice.gold.original}
												</span>
											)}
											<span className="text-[0.82rem] font-bold text-primary">
												{planPrice.gold.price}
											</span>
										</div>
									</th>
									<th
										scope="col"
										className="px-5 py-3.5 font-semibold text-primary"
									>
										<div>{planLabel.platinum}</div>
										<div className="flex flex-col items-center gap-0.5 mt-0.5">
											{planPrice.platinum.original && (
												<span className="text-[0.7rem] line-through text-muted-foreground/70">
													{planPrice.platinum.original}
												</span>
											)}
											<span className="text-[0.82rem] font-bold text-primary">
												{planPrice.platinum.price}
											</span>
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{dynamicComparison.map((c, i) => (
									<tr
										key={c.feature}
										className={cn(i % 2 === 1 && "bg-background/60")}
									>
										<th scope="row" className="px-5 py-3 font-normal">
											{c.feature}
										</th>
										<td className="px-5 py-3 font-medium text-primary">
											<ComparisonCell value={c.silver} />
										</td>
										<td className="px-5 py-3 font-medium text-primary">
											<ComparisonCell value={c.gold} />
										</td>
										<td className="px-5 py-3 font-medium text-primary">
											<ComparisonCell value={c.platinum} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Reveal>

				<div className="mt-8 md:hidden">
					<div className="flex rounded-lg border border-border/70 bg-background p-1">
						{(["silver", "gold", "platinum"] as ComparisonPlan[]).map(
							(plan) => (
								<button
									key={plan}
									type="button"
									onClick={() => setActivePlan(plan)}
									className={cn(
										"flex-1 rounded-md py-2 text-[0.8rem] font-medium transition-all duration-200",
										activePlan === plan
											? "bg-primary text-primary-foreground shadow-xs"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{planLabel[plan]}
								</button>
							),
						)}
					</div>

					<div className="mt-4 rounded-xl border border-border/70 bg-background overflow-hidden shadow-xs">
						<div className="card-matcha px-4 py-3.5 flex items-center justify-between">
							<div>
								<p className="text-[0.62rem] tracking-[0.16em] text-sage uppercase font-semibold">
									Paket {planLabel[activePlan]}
								</p>
								<div className="flex items-baseline gap-1.5 flex-wrap">
									<p className="mt-0.5 font-serif text-xl font-bold text-primary">
										{planPrice[activePlan].price}
									</p>
									{planPrice[activePlan].original && (
										<span className="text-xs line-through text-muted-foreground/70">
											{planPrice[activePlan].original}
										</span>
									)}
								</div>
							</div>
							<a
								href="#harga"
								className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
							>
								Pilih
								<IconArrowRight className="h-3.5 w-3.5" />
							</a>
						</div>
						<ul className="divide-y divide-border/60">
							{dynamicComparison.map((c) => {
								const val = c[activePlan];
								return (
									<li
										key={c.feature}
										className="flex items-center justify-between px-4 py-3"
									>
										<span className="text-[0.82rem] text-foreground/80">
											{c.feature}
										</span>
										<span className="ml-4 shrink-0 font-medium text-primary">
											{val === true ? (
												<IconCheck className="h-3.5 w-3.5 text-sage" />
											) : val === false ? (
												<span className="text-[0.75rem] text-muted-foreground">
													—
												</span>
											) : typeof val === "object" && val !== null ? (
												<span className="text-[0.8rem]">
													{(val as any).price || String(val)}
												</span>
											) : (
												<span className="text-[0.8rem]">
													{val as ReactNode}
												</span>
											)}
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}

/* ---------------- Testimonials ---------------- */

export function Testimonials({
	dynamicTestimonials,
}: {
	dynamicTestimonials?: Array<{
		id: string;
		name: string;
		role: string;
		rating: number;
		text: string;
		avatar: string;
		weddingDate: string;
	}>;
} = {}) {
	const source =
		dynamicTestimonials && dynamicTestimonials.length > 0
			? dynamicTestimonials.map((t) => ({
					...t,
					comment: t.text,
					email: t.role,
					event: t.weddingDate,
				}))
			: testimonials;
	const doubled = [...source, ...source];

	return (
		<section className="py-10 md:py-14 overflow-hidden" id="testimoni">
			<div className="container-page">
				<SectionHeading
					eyebrow="Testimoni"
					title="Kebahagiaan Mereka, Inspirasi untuk Kami"
					desc="Pengalaman nyata dan cerita bahagia dari pasangan yang mempercayakan momen spesialnya."
				/>
			</div>

			<div className="mt-10 overflow-hidden" aria-label="Testimoni pelanggan">
				<div className="animate-marquee gap-4 [touch-action:pan-y]">
					{doubled.map((t, i) => {
						const com = (t as any).comment ?? "";
						const sub = (t as any).email ?? "";
						const badge = (t as any).event ?? "";
						const avatarSrc = t.avatar ?? "";
						const initials = t.name
							.split(" ")
							.slice(0, 2)
							.map((w: string) => w[0] ?? "")
							.join("")
							.toUpperCase();
						return (
							<article
								key={`testi-${i}`}
								className="w-[290px] sm:w-[320px] shrink-0 flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md"
							>
								<div>
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-center gap-3">
											{avatarSrc ? (
												<img
													src={avatarSrc}
													alt={t.name}
													width={40}
													height={40}
													loading="lazy"
													className="h-10 w-10 shrink-0 rounded-full border border-primary/20 bg-secondary/50 object-cover"
												/>
											) : (
												<div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-sage/40 border border-primary/20 flex items-center justify-center text-[0.7rem] font-bold text-primary">
													{initials}
												</div>
											)}
											<div className="min-w-0">
												<p className="truncate text-[0.875rem] font-semibold text-foreground leading-tight">
													{t.name}
												</p>
												{sub && (
													<p className="truncate text-[0.7rem] text-muted-foreground mt-0.5">
														{sub}
													</p>
												)}
											</div>
										</div>
										<div
											role="img"
											className="flex gap-0.5 text-gold shrink-0 pt-0.5"
											aria-label={`Rating ${t.rating} dari 5`}
										>
											{Array.from({ length: Math.min(t.rating ?? 5, 5) }).map(
												(_, r) => (
													<IconStar
														key={r}
														className="h-3 w-3"
														aria-hidden="true"
													/>
												),
											)}
										</div>
									</div>
									<p className="mt-4 text-[0.82rem] leading-relaxed text-foreground/80 italic line-clamp-4">
										&ldquo;{com}&rdquo;
									</p>
								</div>
								{badge && (
									<div className="mt-4 pt-3 border-t border-border/40">
										<span className="inline-flex items-center rounded-full border border-sage/30 bg-sage/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-sage">
											{badge}
										</span>
									</div>
								)}
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}

const categoryBadgeClass: Record<FaqCategory, string> = {
	Umum: "bg-secondary/80 text-foreground/70 border-border",
	Fitur: "bg-sage/15 text-sage border-sage/30",
	Paket: "bg-primary/10 text-primary border-primary/25",
	Pembayaran: "bg-gold/10 text-gold border-gold/30",
};

const faqCategories: Array<"Semua" | FaqCategory> = [
	"Semua",
	"Umum",
	"Fitur",
	"Paket",
	"Pembayaran",
];

export function Faq({
	dynamicPackages,
	dynamicFaqs,
}: {
	dynamicPackages?: PricingPackage[];
	dynamicFaqs?: Array<{ id: string; question: string; answer: string; category: string }>;
}) {
	const [activeTab, setActiveTab] = useState<"Semua" | FaqCategory>("Semua");
	const [open, setOpen] = useState<string | null>(null);

	const silverPkg = dynamicPackages?.find((p) => p.id === "silver");
	const goldPkg = dynamicPackages?.find((p) => p.id === "gold");
	const platinumPkg = dynamicPackages?.find((p) => p.id === "platinum");

	const localizedFaqs = useMemo(() => {
		const baseFaqs =
			dynamicFaqs && dynamicFaqs.length > 0
				? dynamicFaqs.map((df) => ({
						q: df.question,
						a: df.answer,
						category: df.category as FaqCategory,
					}))
				: faqs;
		return baseFaqs.map((f) => {
			if (silverPkg || goldPkg || platinumPkg) {
				let a = f.a;
				if (silverPkg) {
					a = a.replace(
						/Paket Hemat \(Rp15\.000\)/g,
						`${silverPkg.name} (Rp ${silverPkg.price.toLocaleString("id-ID")})`,
					);
					a = a.replace(
						/Rp15\.000/g,
						`Rp ${silverPkg.price.toLocaleString("id-ID")}`,
					);
				}
				if (goldPkg) {
					a = a.replace(
						/Paket Gold \(Rp35\.000\)/g,
						`${goldPkg.name} (Rp ${goldPkg.price.toLocaleString("id-ID")})`,
					);
					a = a.replace(
						/Rp35\.000/g,
						`Rp ${goldPkg.price.toLocaleString("id-ID")}`,
					);
				}
				if (platinumPkg) {
					a = a.replace(
						/Paket Platinum \(Rp75\.000\)/g,
						`${platinumPkg.name} (Rp ${platinumPkg.price.toLocaleString("id-ID")})`,
					);
					a = a.replace(
						/Rp75\.000/g,
						`Rp ${platinumPkg.price.toLocaleString("id-ID")}`,
					);
				}
				return { ...f, a };
			}
			return f;
		});
	}, [dynamicFaqs, silverPkg, goldPkg, platinumPkg]);

	const filtered =
		activeTab === "Semua"
			? localizedFaqs
			: localizedFaqs.filter((f) => f.category === activeTab);

	return (
		<section
			id="faq"
			className="border-y border-border bg-secondary/35 py-10 md:py-14"
		>
			<div className="container-page">
				<SectionHeading eyebrow="FAQ" title="Pertanyaan yang Sering Ditanya" />

				<div className="mx-auto mt-7 flex flex-wrap justify-center gap-1.5">
					{faqCategories.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => {
								setActiveTab(cat);
								setOpen(null);
							}}
							className={cn(
								"rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
								activeTab === cat
									? "border-primary bg-primary text-primary-foreground shadow-xs"
									: "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
							)}
						>
							{cat}
						</button>
					))}
				</div>

				<div className="mt-8 columns-1 md:columns-2 md:gap-x-5">
					{filtered.map((f, i) => {
						const isOpen = open === f.q;
						return (
							<Reveal key={f.q} delay={(i % 4) * 45}>
								<div className="mb-2.5 break-inside-avoid rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
									<h3>
										<button
											type="button"
											onClick={() => setOpen(isOpen ? null : f.q)}
											aria-expanded={isOpen}
											aria-controls={`faq-panel-${i}`}
											className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
										>
											<div className="flex min-w-0 flex-col gap-1">
												<span
													className={cn(
														"self-start rounded-md border px-2 py-0.5 text-[0.58rem] font-semibold tracking-wider uppercase",
														categoryBadgeClass[f.category],
													)}
												>
													{f.category}
												</span>
												<span className="font-serif text-[0.92rem] font-bold leading-snug">
													{f.q}
												</span>
											</div>
											<span
												aria-hidden="true"
												className={cn(
													"grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-border bg-secondary/50 transition-all duration-200",
													isOpen
														? "rotate-45 border-primary/40 bg-primary/5"
														: "hover:border-primary/30",
												)}
											>
												<svg viewBox="0 0 24 24" className="h-3 w-3">
													<path
														d="M12 5v14M5 12h14"
														stroke="currentColor"
														strokeWidth="1.8"
														strokeLinecap="round"
													/>
												</svg>
											</span>
										</button>
									</h3>
									<div
										id={`faq-panel-${i}`}
										role="region"
										className={cn(
											"grid transition-all duration-300 ease-out",
											isOpen
												? "grid-rows-[1fr] opacity-100"
												: "grid-rows-[0fr] opacity-0",
										)}
									>
										<div className="overflow-hidden">
											<p className="px-4 pb-3.5 text-[0.82rem] leading-relaxed text-muted-foreground">
												{f.a}
											</p>
										</div>
									</div>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}

/* ---------------- Blog ---------------- */

export function BlogPreview() {
	const displayArticles = (blogData as any[]).slice(0, 3).map((a) => ({
		title: a.title,
		date: a.date,
		tag: (a.category || "Panduan").replace(/^Pernikahan Adat /, "").replace(/^Tradisi /, "").slice(0, 20),
		excerpt: a.summary,
		image: a.thumbnail || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
		slug: a.slug,
	}));

	return (
		<section id="blog" className="py-10 md:py-14">
			<div className="container-page">
				<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
					<SectionHeading
						align="left"
						eyebrow="Berita"
						title="Berita & Tips Pernikahan"
						desc="Informasi dan tips praktis untuk persiapan hari pernikahanmu."
						className="max-w-xl"
					/>
					<Reveal delay={120}>
						<a
							href="/berita"
							className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-card px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
						>
							Lihat Semua Berita
							<IconArrowRight className="h-4 w-4" />
						</a>
					</Reveal>
				</div>

				<div className="mt-10 grid gap-4 md:grid-cols-3">
					{displayArticles.map((p, i) => (
						<Reveal key={p.slug} delay={i * 120} className="min-w-0">
							<a
								href={`/berita/${p.slug}`}
								className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:shadow-sm"
							>
								<div className="overflow-hidden">
									<img
										src={p.image}
										width={960}
										height={640}
										loading="lazy"
										alt={p.title}
										className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								</div>
								<div className="flex flex-1 flex-col p-4.5">
									<div className="flex items-center gap-2 text-[0.68rem] tracking-wider font-semibold text-muted-foreground uppercase">
										<span className="text-sage">{p.tag}</span>
										<span aria-hidden="true">·</span>
										<span>{p.date}</span>
									</div>
									<h3 className="mt-2 font-serif text-base sm:text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
										{p.title}
									</h3>
									<p className="mt-1.5 flex-1 text-[0.82rem] leading-relaxed text-muted-foreground line-clamp-3">
										{p.excerpt}
									</p>
									<span className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-primary">
										Baca Selengkapnya
										<IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
									</span>
								</div>
							</a>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

export function FinalCta({ minPrice = 15000 }: { minPrice?: number }) {
	return (
		<section className="container-page py-10 md:py-14">
			<Reveal variant="scale">
				<div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 px-6 py-14 text-center sm:px-12 sm:py-20 md:py-24">
					<img
						src={ctaBanner}
						width={1920}
						height={1088}
						loading="lazy"
						alt=""
						aria-hidden="true"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div aria-hidden="true" className="absolute inset-0 bg-primary/70" />
					<div className="relative mx-auto max-w-2xl">
						<span className="eyebrow text-primary-foreground/70">
							{minPrice >= 1000
								? `Mulai ${Math.round(minPrice / 1000)} Ribuan`
								: `Mulai Rp${minPrice.toLocaleString("id-ID")}`}
						</span>
						<h2 className="mt-4 text-[2.1rem] leading-[1.1] text-primary-foreground sm:text-[3rem] lg:text-[3.6rem]">
							Undangan Cantik Tidak Harus Mahal.
						</h2>
						<p className="mx-auto mt-5 max-w-lg text-[0.95rem] leading-relaxed text-primary-foreground/75">
							Mulai Rp{minPrice.toLocaleString("id-ID")} dan buat undangan digital yang berkesan untuk hari
							spesialmu.
						</p>
						<div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
							<a
								href="#template"
								className="inline-flex items-center justify-center rounded-full bg-warmwhite px-7 py-4 text-sm font-medium text-primary transition-transform duration-300 hover:-translate-y-0.5"
							>
								Lihat Semua Template
							</a>
							<a
								href="#pengalaman"
								className="inline-flex items-center justify-center rounded-full border border-primary-foreground/35 px-7 py-4 text-sm font-medium text-primary-foreground transition-colors duration-300 hover:border-primary-foreground/70"
							>
								Coba Demo
							</a>
						</div>
					</div>
				</div>
			</Reveal>
		</section>
	);
}

export function PromoBanner({ minPrice = 15000 }: { minPrice?: number }) {
	const [dayInfo, setDayInfo] = useState<{ dayName: string; formattedDate: string }>({
		dayName: "Hari Ini",
		formattedDate: "",
	});
	const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
		hours: "00",
		minutes: "00",
		seconds: "00",
	});

	useEffect(() => {
		const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
		const months = [
			"Januari", "Februari", "Maret", "April", "Mei", "Juni",
			"Juli", "Agustus", "September", "Oktober", "November", "Desember"
		];
		const now = new Date();
		setDayInfo({
			dayName: days[now.getDay()] || "Hari Ini",
			formattedDate: `${now.getDate()} ${months[now.getMonth()] || ""} ${now.getFullYear()}`,
		});

		const updateCountdown = () => {
			const current = new Date();
			const midnight = new Date();
			midnight.setHours(23, 59, 59, 999);
			const diff = Math.max(0, midnight.getTime() - current.getTime());
			const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
			const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
			const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
			setTimeLeft({ hours: h, minutes: m, seconds: s });
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="container-page pb-8 md:pb-10">
			<Reveal variant="scale">
				<div className="relative overflow-hidden rounded-[1.75rem] border border-gold/30 bg-gradient-to-br from-[oklch(0.32_0.078_141)] via-[oklch(0.28_0.07_138)] to-[oklch(0.22_0.06_140)] px-6 py-10 md:px-14 md:py-14">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0"
					>
						<div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-gold-soft/10 blur-3xl" />
						<div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-matcha/20 blur-3xl" />
					</div>

					<div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1">
									<span className="h-1.5 w-1.5 rounded-full bg-gold-soft animate-pulse" />
									<span suppressHydrationWarning className="text-[0.65rem] tracking-[0.2em] font-bold text-gold-soft uppercase">
										Promo Spesial Hari {dayInfo.dayName}
									</span>
								</span>
								<span className="rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-[0.65rem] font-bold text-rose-200">
									Diskon Hingga 80%
								</span>
							</div>

							<h2 suppressHydrationWarning className="mt-4 font-serif text-[1.85rem] leading-[1.1] text-primary-foreground sm:text-[2.4rem]">
								Hanya Hari Ini,{" "}
								<span className="text-gradient-gold">Promo Hari {dayInfo.dayName}</span>{" "}
								Siap Diklaim!
							</h2>

							<p className="mt-3.5 max-w-xl text-[0.88rem] leading-relaxed text-primary-foreground/80">
								Dapatkan undangan digital pernikahan impian Anda dengan potongan harga terbesar: Paket Silver hanya <strong className="text-gold-soft">Rp15.000</strong> (normal <span className="line-through">Rp75.000</span>), Paket Gold <strong className="text-gold-soft">Rp35.000</strong> (normal <span className="line-through">Rp120.000</span>), dan Paket Platinum <strong className="text-gold-soft">Rp75.000</strong> (normal <span className="line-through">Rp250.000</span>).
							</p>

							<div className="mt-5 flex flex-wrap items-center gap-4">
								<div className="flex items-center gap-1.5 rounded-xl border border-gold/30 bg-black/25 px-3 py-1.5 backdrop-blur-xs">
									<span className="text-[10px] uppercase font-bold text-gold-soft/80 mr-1">
										Berakhir Dalam:
									</span>
									<span suppressHydrationWarning className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs font-bold text-gold-soft">
										{timeLeft.hours}
									</span>
									<span className="text-xs font-bold text-gold-soft">:</span>
									<span suppressHydrationWarning className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs font-bold text-gold-soft">
										{timeLeft.minutes}
									</span>
									<span className="text-xs font-bold text-gold-soft">:</span>
									<span suppressHydrationWarning className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs font-bold text-gold-soft">
										{timeLeft.seconds}
									</span>
									<span className="text-[10px] text-primary-foreground/60 ml-1">
										WIB
									</span>
								</div>

								<div className="flex flex-wrap gap-2">
									{["Masa Aktif Fleksibel", "Revisi Sepuasnya", "Aktivasi Otomatis"].map(
										(t) => (
											<span
												key={t}
												className="flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[0.72rem] text-primary-foreground/85"
											>
												<IconCheck className="h-3 w-3 text-gold-soft" />
												{t}
											</span>
										),
									)}
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-[210px]">
							<a
								href="#harga"
								className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-all duration-300 hover:-translate-y-0.5"
							>
								Ambil Promo Hari Ini
								<IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
							</a>
							<a
								href="#template"
								className="group inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-6 py-3.5 text-sm font-medium text-gold-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold/25"
							>
								Pilih Template Dulu
							</a>
						</div>
					</div>
				</div>
			</Reveal>
		</section>
	);
}

/* ---------------- Footer ---------------- */

const footerLinksMap: Record<string, { href: string; ariaLabel: string }> = {
	Beranda: { href: "/#beranda", ariaLabel: "Kembali ke beranda paling atas" },
	Template: { href: "/demo", ariaLabel: "Katalog seluruh template undangan" },
	Fitur: { href: "/#fitur", ariaLabel: "Daftar fitur unggulan undangan digital" },
	"Cara Kerja": { href: "/#cara-kerja", ariaLabel: "Cara kerja pemesanan undangan" },
	Harga: { href: "/#harga", ariaLabel: "Daftar paket dan harga undangan" },
	FAQ: { href: "/#faq", ariaLabel: "Pertanyaan yang sering diajukan" },
	Panduan: { href: "/berita/panduan-undangan-digital", ariaLabel: "Panduan membuat undangan digital" },
	"Syarat & Ketentuan": { href: "/#faq", ariaLabel: "Syarat dan ketentuan layanan" },
	"Kebijakan Privasi": { href: "/#faq", ariaLabel: "Kebijakan privasi" },
	"Hubungi Kami": { href: "https://wa.me/6282392115909", ariaLabel: "Hubungi admin via WhatsApp" },
	"Tentang Kami": { href: "/#beranda", ariaLabel: "Tentang layanan Simfoni Cinta" },
	Blog: { href: "/berita", ariaLabel: "Kumpulan artikel dan tips pernikahan" },
	Testimoni: { href: "/#testimoni", ariaLabel: "Testimoni ulasan pengantin" },
	Kerjasama: { href: "https://wa.me/6282392115909", ariaLabel: "Kerjasama bisnis dan vendor" },
	Affiliate: { href: "/login", ariaLabel: "Program kemitraan affiliate" },
};

const footerCols = [
	{
		title: "Menu",
		links: ["Beranda", "Template", "Fitur", "Cara Kerja", "Harga"],
	},
	{
		title: "Bantuan",
		links: [
			"FAQ",
			"Panduan",
			"Syarat & Ketentuan",
			"Kebijakan Privasi",
			"Hubungi Kami",
		],
	},
	{
		title: "Informasi",
		links: ["Tentang Kami", "Blog", "Testimoni", "Kerjasama", "Affiliate"],
	},
];

function Social({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<a
			href="#beranda"
			aria-label={label}
			className="grid h-8 w-8 place-items-center rounded-full border border-primary-foreground/25 text-primary-foreground/80 transition-colors hover:border-primary-foreground/60 hover:text-primary-foreground"
		>
			{children}
		</a>
	);
}

export function Footer() {
	return (
		<footer className="bg-primary text-primary-foreground">
			<div className="container-page py-8 md:py-12">
				<div className="grid gap-8 lg:grid-cols-[1.4fr_2fr]">
					<div>
						<img
							src="https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp"
							alt="Simfoni Cinta"
							width={32}
							height={32}
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).src = "/logo.png";
							}}
							className="h-8 w-auto object-contain"
						/>
						<p className="mt-3 max-w-sm text-[0.78rem] leading-relaxed text-primary-foreground/75">
							Undangan digital modern dan romantis untuk momen spesial yang tak terlupakan.
						</p>
						<div className="mt-4 flex gap-2">
							<Social label="Instagram">
								<svg
									viewBox="0 0 24 24"
									className="h-3.5 w-3.5"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.4"
								>
									<rect x="3" y="3" width="18" height="18" rx="5" />
									<circle cx="12" cy="12" r="4" />
									<circle
										cx="17.2"
										cy="6.8"
										r="0.8"
										fill="currentColor"
										stroke="none"
									/>
								</svg>
							</Social>
							<Social label="TikTok">
								<svg
									viewBox="0 0 24 24"
									className="h-3.5 w-3.5"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.4"
								>
									<path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.46" />
									<path d="M14 4c.6 2.5 2.2 3.9 5 4.1" />
								</svg>
							</Social>
							<Social label="WhatsApp">
								<svg
									viewBox="0 0 24 24"
									className="h-3.5 w-3.5"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.4"
								>
									<path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-3.9A8 8 0 1 1 20 12Z" />
									<path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.4-.8-1 .8A5 5 0 0 1 10.9 11l.8-1L11 8.5c-.5 0-1 .4-1 1H9Z" />
								</svg>
							</Social>
							<Social label="Email">
								<svg
									viewBox="0 0 24 24"
									className="h-3.5 w-3.5"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.4"
								>
									<rect x="3" y="5" width="18" height="14" rx="2.5" />
									<path d="m3.5 7 8.5 6 8.5-6" />
								</svg>
							</Social>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
						{footerCols.map((col) => (
							<div key={col.title}>
								<p className="text-[0.65rem] tracking-[0.16em] uppercase text-primary-foreground/60 font-semibold mb-2.5">
									{col.title}
								</p>
								<ul className="space-y-1.5">
									{col.links.map((l) => {
										const linkMeta = footerLinksMap[l] ?? {
											href: "/#beranda",
											ariaLabel: l,
										};
										return (
											<li key={l}>
												<a
													href={linkMeta.href}
													aria-label={linkMeta.ariaLabel}
													className="text-[0.78rem] text-primary-foreground/75 transition-colors hover:text-primary-foreground"
												>
													{l}
												</a>
											</li>
										);
									})}
								</ul>
							</div>
						))}

						<div>
							<p className="text-[0.65rem] tracking-[0.16em] uppercase text-primary-foreground/60 font-semibold mb-2.5">
								Kontak
							</p>
							<ul className="space-y-1.5 text-[0.78rem] text-primary-foreground/75">
								<li>halo@simfonicinta.my.id</li>
								<li>WhatsApp: 0823-9211-5909</li>
								<li>Setiap hari, 08.00–21.00 WIB</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-8 grid gap-4 border-t border-primary-foreground/15 pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
					<div className="min-w-0">
						<p className="font-serif text-base">
							Dapatkan inspirasi tema terbaru
						</p>
						<p className="mt-0.5 text-[0.74rem] text-primary-foreground/65">
							Tanpa spam. Hanya kabar template dan promo pilihan.
						</p>
					</div>
					<form
						onSubmit={(e) => e.preventDefault()}
						className="flex w-full max-w-md gap-2"
						aria-label="Berlangganan newsletter"
					>
						<label htmlFor="newsletter" className="sr-only">
							Alamat email
						</label>
						<input
							id="newsletter"
							type="email"
							required
							placeholder="Masukkan email kamu"
							className="min-w-0 flex-1 rounded-full border border-primary-foreground/25 bg-transparent px-4 py-2 text-[0.78rem] text-primary-foreground placeholder:text-primary-foreground/45"
						/>
						<button
							type="submit"
							className="shrink-0 rounded-full bg-warmwhite px-4 py-2 text-[0.78rem] font-medium text-primary transition-transform duration-300 hover:-translate-y-0.5"
						>
							Kirim
						</button>
					</form>
				</div>

				<div className="mt-5 border-t border-primary-foreground/15 pt-4 text-[0.7rem] text-primary-foreground/60">
					<div className="flex flex-wrap items-center gap-2 mb-3">
						<IconHeadset className="h-3.5 w-3.5" aria-hidden="true" />
						<span>
							Pembayaran melalui transfer bank, e-wallet, dan QRIS —
							dikonfirmasi oleh admin.
						</span>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p>© 2026 Simfoni Cinta. All rights reserved.</p>
						<p className="flex gap-4">
							<a
								href="#faq"
								className="transition-colors hover:text-primary-foreground"
							>
								Syarat & Ketentuan
							</a>
							<a
								href="#faq"
								className="transition-colors hover:text-primary-foreground"
							>
								Kebijakan Privasi
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
