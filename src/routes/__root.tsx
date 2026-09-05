import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	Outlet,
	Link,
	createRootRouteWithContext,
	useRouter,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { StoreProvider } from "@/store/appStore";
import { MobileBottomNav } from "@/components/landing/mobile-bottom-nav";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

function NotFoundComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0c0a09] px-4 text-stone-200">
			<div className="relative max-w-lg w-full rounded-3xl border border-white/10 bg-[#161412]/90 p-8 md:p-10 text-center shadow-2xl backdrop-blur-xl space-y-6">
				<div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
					<span className="font-serif text-2xl font-bold">404</span>
				</div>
				<div className="space-y-2">
					<h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
						Halaman Tidak Ditemukan
					</h1>
					<p className="text-xs md:text-sm text-stone-400 leading-relaxed">
						Tautan halaman, builder, atau undangan yang Anda tuju tidak tersedia atau telah dipindahkan.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
					<Link
						to="/"
						className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
					>
						Ke Beranda
					</Link>
					<Link
						to="/dasbor"
						className="inline-flex items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
					>
						Buka Dasbor Saya
					</Link>
				</div>
			</div>
		</div>
	);
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
	const router = useRouter();

	useEffect(() => {
		const raw = [
			error?.message,
			(error as any)?.cause?.message,
			(error as any)?.stack,
		]
			.filter(Boolean)
			.join(" ");

		if (
			raw.includes("dynamically imported module") ||
			raw.includes("Minified React error #520") ||
			raw.includes("Failed to fetch")
		) {
			const storageKey = "last_chunk_reload";
			const lastReload = sessionStorage.getItem(storageKey);
			const now = Date.now();
			if (!lastReload || now - Number(lastReload) > 8000) {
				sessionStorage.setItem(storageKey, String(now));
				window.location.reload();
			}
		}
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="max-w-md text-center">
				<h1 className="text-xl font-semibold tracking-tight text-foreground">
					Gagal memuat
				</h1>
				<div className="mt-6 flex flex-wrap justify-center gap-2">
					<button
						type="button"
						onClick={() => {
							window.location.reload();
						}}
						className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
					>
						Ulangi
					</button>
				</div>
			</div>
		</div>
	);
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		head: () => ({
			meta: [
				{ charSet: "utf-8" },
				{ name: "referrer", content: "no-referrer" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ title: "Simfoni Cinta — Undangan Digital Elegan Mulai Rp15.000" },
				{
					name: "description",
					content:
						"Simfoni Cinta menyediakan undangan digital elegan, fitur lengkap, RSVP online, buku tamu & sebar WA mudah mulai Rp15.000.",
				},
				{
					name: "keywords",
					content:
						"undangan digital, undangan online, undangan pernikahan digital, undangan nikah online, website undangan pernikahan, undangan digital murah, undangan digital Indonesia, template undangan digital, undangan digital mulai 15000, Simfoni Cinta",
				},
				{ name: "author", content: "Simfoni Cinta" },
				{
					name: "google-site-verification",
					content: "google0e7f4f807a599919",
				},
				{ property: "og:type", content: "website" },
				{ property: "og:site_name", content: "Simfoni Cinta" },
				{
					property: "og:title",
					content: "Simfoni Cinta — Undangan Digital Elegan Mulai Rp15.000",
				},
				{
					property: "og:description",
					content:
						"Platform undangan pernikahan digital romantis, elegan, dan terlengkap di Indonesia. Alunan musik indah, RSVP online, dan sebar via WhatsApp mulai Rp15.000.",
				},
				{ property: "og:url", content: "https://simfonicinta.my.id/" },
				{
					property: "og:image",
					content:
						"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
				},
				{
					property: "og:image:secure_url",
					content:
						"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
				},
				{ property: "og:image:type", content: "image/webp" },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{
					property: "og:image:alt",
					content:
						"Simfoni Cinta — Undangan Digital Elegan Indonesia Mulai Rp15.000",
				},
				{ property: "og:locale", content: "id_ID" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:site", content: "@simfonicinta" },
				{
					name: "twitter:title",
					content: "Simfoni Cinta — Undangan Digital Elegan Mulai Rp15.000",
				},
				{
					name: "twitter:description",
					content:
						"Platform undangan pernikahan digital romantis, elegan, dan terlengkap di Indonesia. Alunan musik indah, RSVP online, dan sebar via WhatsApp mulai Rp15.000.",
				},
				{
					name: "twitter:image",
					content:
						"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
				},
				{ name: "robots", content: "index, follow" },
				{ name: "theme-color", content: "#0f0e0d" },
			],
			links: [
				{ rel: "stylesheet", href: appCss },
				{ rel: "canonical", href: "https://simfonicinta.my.id/" },
				{ rel: "preconnect", href: "https://fonts.googleapis.com" },
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
					crossOrigin: "anonymous",
				},
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
				},
				{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
				{ rel: "icon", href: "/favicon.png", type: "image/png", sizes: "64x64" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
				{ rel: "manifest", href: "/manifest.webmanifest" },
			],
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": [
							{
								"@type": "WebSite",
								"@id": "https://simfonicinta.my.id/#website",
								url: "https://simfonicinta.my.id/",
								name: "Simfoni Cinta",
								description:
									"Platform undangan digital pernikahan elegan, modern, dan lengkap di Indonesia dengan harga mulai Rp15.000.",
								inLanguage: "id-ID",
								publisher: {
									"@type": "Organization",
									name: "Simfoni Cinta",
									url: "https://simfonicinta.my.id/",
									logo: "https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-logo.webp",
								},
							},
							{
								"@type": "Product",
								"@id": "https://simfonicinta.my.id/#product",
								name: "Undangan Digital Simfoni Cinta",
								image: "https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/simfoni-cinta-hero.webp",
								description:
									"Layanan pembuatan undangan pernikahan digital elegan dengan alunan musik indah, fitur galeri foto, RSVP online, buku ucapan, navigasi maps, dan sebar via WhatsApp.",
								brand: {
									"@type": "Brand",
									name: "Simfoni Cinta",
								},
								aggregateRating: {
									"@type": "AggregateRating",
									ratingValue: "4.9",
									reviewCount: "128",
									bestRating: "5",
									worstRating: "1",
								},
								review: [
									{
										"@type": "Review",
										reviewRating: {
											"@type": "Rating",
											ratingValue: "5",
											bestRating: "5",
										},
										author: {
											"@type": "Person",
											name: "Rian & Anisa",
										},
										reviewBody:
											"Keren banget! Tamu-tamu pada kagum waktu buka undangannya, ada musiknya dan amplop QRISnya langsung masuk rekening. Sebar ke 800 tamu gampang poll!",
									},
									{
										"@type": "Review",
										reviewRating: {
											"@type": "Rating",
											ratingValue: "5",
											bestRating: "5",
										},
										author: {
											"@type": "Person",
											name: "Budi & Sarah",
										},
										reviewBody:
											"Desain Batak Merah-nya mewah abis, ornamennya otentik banget. Loadingnya juga kenceng, gak berat sama sekali waktu dibuka di HP.",
									},
									{
										"@type": "Review",
										reviewRating: {
											"@type": "Rating",
											ratingValue: "5",
											bestRating: "5",
										},
										author: {
											"@type": "Person",
											name: "Farhan & Dinda",
										},
										reviewBody:
											"RSVP sama ucapannya langsung keliatan realtime, ngebantu banget buat hitung porsi katering. Gak ada drama salah hitung deh!",
									},
								],
								offers: {
									"@type": "AggregateOffer",
									priceCurrency: "IDR",
									lowPrice: "15000",
									highPrice: "99000",
									offerCount: "3",
									offers: [
										{
											"@type": "Offer",
											name: "Paket Silver",
											price: "15000",
											priceCurrency: "IDR",
											availability: "https://schema.org/InStock",
										},
										{
											"@type": "Offer",
											name: "Paket Gold",
											price: "49000",
											priceCurrency: "IDR",
											availability: "https://schema.org/InStock",
										},
										{
											"@type": "Offer",
											name: "Paket Platinum",
											price: "99000",
											priceCurrency: "IDR",
											availability: "https://schema.org/InStock",
										},
									],
								},
							},
							{
								"@type": "FAQPage",
								"@id": "https://simfonicinta.my.id/#faq",
								mainEntity: [
									{
										"@type": "Question",
										name: "Berapa biaya pembuatan undangan digital di Simfoni Cinta?",
										acceptedAnswer: {
											"@type": "Answer",
											text: "Biaya pembuatan undangan digital di Simfoni Cinta mulai dari Rp15.000 sekali bayar dengan masa aktif selamanya. Tersedia berbagai pilihan template elegan, musik latar, RSVP online, dan amplop digital.",
										},
									},
									{
										"@type": "Question",
										name: "Apakah ada batasan jumlah tamu yang bisa diundang?",
										acceptedAnswer: {
											"@type": "Answer",
											text: "Tidak ada batasan. Pengguna dapat membuat tautan undangan dengan nama tamu tak terbatas (unlimited) dan membagikannya secara instan melalui WhatsApp.",
										},
									},
									{
										"@type": "Question",
										name: "Bagaimana cara kerja amplop digital dan QRIS?",
										acceptedAnswer: {
											"@type": "Answer",
											text: "Tamu undangan dapat menyalin nomor rekening bank pengantin atau memindai barcode QRIS langsung dari website undangan. Uang hadiah kado langsung masuk ke rekening pengantin tanpa potongan.",
										},
									},
									{
										"@type": "Question",
										name: "Apakah data dan foto undangan bisa diedit setelah disebar?",
										acceptedAnswer: {
											"@type": "Answer",
											text: "Ya, seluruh data mempelai, jadwal acara, lokasi maps, galeri foto, dan musik dapat diedit kapan saja secara realtime tanpa perlu mengganti link undangan.",
										},
									},
								],
							},
						],
					}),
				},
				{
					src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
					async: true,
					defer: true,
				},
			],
		}),
		shellComponent: RootShell,
		component: RootComponent,
		notFoundComponent: NotFoundComponent,
		errorComponent: ErrorComponent,
	},
);

function RootShell({ children }: { children: ReactNode }) {
	return (
		<html lang="id" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){function r(){try{var k='cf_chunk_r';var n=Date.now();var l=sessionStorage.getItem(k);if(!l||n-Number(l)>8000){sessionStorage.setItem(k,String(n));window.location.reload();}}catch(e){window.location.reload();}}window.addEventListener('vite:preloadError',function(e){if(e&&e.preventDefault)e.preventDefault();r();});window.addEventListener('error',function(e){var m=(e&&e.message)?String(e.message):'';if(m.indexOf('dynamically imported module')!==-1||m.indexOf('Minified React error #520')!==-1||m.indexOf('Failed to fetch')!==-1){r();}});window.addEventListener('unhandledrejection',function(e){var m=(e&&e.reason&&e.reason.message)?String(e.reason.message):'';if(m.indexOf('dynamically imported module')!==-1||m.indexOf('Failed to fetch')!==-1){r();}});})();`,
					}}
				/>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootComponent() {
	const { queryClient } = Route.useRouteContext();

	useEffect(() => {
		const handleChunkError = (e: ErrorEvent | PromiseRejectionEvent) => {
			const msg = (e as any)?.message || (e as any)?.reason?.message || "";
			if (
				typeof msg === "string" &&
				(msg.includes("Failed to fetch dynamically imported module") ||
					msg.includes("error loading dynamically imported module") ||
					msg.includes("Minified React error #520"))
			) {
				const storageKey = "last_chunk_reload";
				const lastReload = sessionStorage.getItem(storageKey);
				const now = Date.now();
				if (!lastReload || now - Number(lastReload) > 10000) {
					sessionStorage.setItem(storageKey, String(now));
					window.location.reload();
				}
			}
		};
		window.addEventListener("error", handleChunkError);
		window.addEventListener("unhandledrejection", handleChunkError);

		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((reg) => {
						reg.update().catch(() => {});
					})
					.catch(() => {});
			});
		}

		return () => {
			window.removeEventListener("error", handleChunkError);
			window.removeEventListener("unhandledrejection", handleChunkError);
		};
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<StoreProvider>
				<Toaster position="top-right" richColors duration={2500} />
				<Outlet />
				<MobileBottomNav />
				<PwaInstallPrompt />
			</StoreProvider>
		</QueryClientProvider>
	);
}
