import { createFileRoute } from "@tanstack/react-router";
import { FloatingWa } from "@/components/landing/floating-wa";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import {
	TemplateShowcase,
	AllFeatures,
	ResponsiveDevices,
} from "@/components/landing/sections-a";
import {
	HowItWorks,
	AdminService,
	WhyUs,
	Pricing,
	Comparison,
	Testimonials,
	Faq,
	BlogPreview,
	FinalCta,
	PromoBanner,
	Footer,
} from "@/components/landing/sections-b";
import {
	AiSeoOverview,
	WeddingStats,
	DigitalVsPrintComparison,
} from "@/components/landing/ai-seo-sections";

import { fetchTemplates } from "@/functions/media";
import { fetchAdminSettings } from "@/functions/settings";
import { LivePurchaseNotification } from "@/components/landing/LivePurchaseNotification";

export const Route = createFileRoute("/")({
	loader: async () => {
		const [templates, settings] = await Promise.all([
			fetchTemplates().catch(() => []),
			fetchAdminSettings().catch(() => null),
		]);
		return { templates, settings };
	},
	head: ({ loaderData }) => {
		const packages = loaderData?.settings?.packages;
		const minPrice =
			packages && packages.length > 0
				? Math.min(...packages.map((p: any) => p.price))
				: 15000;
		const minPriceStr = `Rp${minPrice.toLocaleString("id-ID")}`;
		return {
			meta: [
				{ title: `Simfoni Cinta — Undangan Digital Elegan Mulai ${minPriceStr}` },
				{
					name: "description",
					content: `Simfoni Cinta menyediakan undangan digital elegan, fitur lengkap, RSVP online, buku tamu & sebar WA mudah mulai ${minPriceStr}.`,
				},
				{
					name: "keywords",
					content: `undangan digital, undangan online, undangan pernikahan digital, undangan nikah online, website undangan pernikahan, undangan digital murah, undangan digital Indonesia, template undangan digital, undangan digital mulai ${minPrice}, Simfoni Cinta`,
				},
				{ property: "og:type", content: "website" },
				{ property: "og:site_name", content: "Simfoni Cinta" },
				{
					property: "og:title",
					content: `Simfoni Cinta — Undangan Digital Elegan Mulai ${minPriceStr}`,
				},
				{
					property: "og:description",
					content: `Platform undangan digital pernikahan elegan, modern, dan lengkap di Indonesia. Mudah dibagikan via WhatsApp, harga hemat mulai ${minPriceStr}.`,
				},
				{ property: "og:url", content: "https://simfonicinta.my.id/" },
				{
					property: "og:image",
					content: "https://simfonicinta.my.id/simfoni-cinta-og.jpg",
				},
				{
					property: "og:image:secure_url",
					content: "https://simfonicinta.my.id/simfoni-cinta-og.jpg",
				},
				{ property: "og:image:type", content: "image/jpeg" },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{
					property: "og:image:alt",
					content: `Simfoni Cinta — Undangan Digital Elegan Indonesia Mulai ${minPriceStr}`,
				},
				{ property: "og:locale", content: "id_ID" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:site", content: "@simfonicinta" },
				{
					name: "twitter:title",
					content: `Simfoni Cinta — Undangan Digital Elegan Mulai ${minPriceStr}`,
				},
				{
					name: "twitter:description",
					content: `Platform undangan digital pernikahan elegan, modern, dan lengkap di Indonesia. Mudah dibagikan via WhatsApp, harga hemat mulai ${minPriceStr}.`,
				},
				{
					name: "twitter:image",
					content: "https://simfonicinta.my.id/simfoni-cinta-og.jpg",
				},
			],
			links: [{ rel: "canonical", href: "https://simfonicinta.my.id/" }],
		};
	},
	component: Index,
});

function Index() {
	const { templates: dbTemplates, settings } = Route.useLoaderData();
	const dynamicPackages =
		settings?.packages && settings.packages.length > 0
			? settings.packages
			: undefined;
	const minPrice = dynamicPackages?.length
		? Math.min(...dynamicPackages.map((p) => p.price))
		: 15000;
	const maxPrice = dynamicPackages?.length
		? Math.max(...dynamicPackages.map((p) => p.price))
		: 75000;

	return (
		<div className="min-h-screen">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
			>
				Lewati ke konten utama
			</a>
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 z-0"
				style={{
					backgroundImage:
						"url('https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/templates/sage-watercolor/bg.webp')",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					opacity: 0.045,
				}}
			/>
			<Navbar />
			<main id="main-content" className="relative z-10">
				<Hero minPrice={minPrice} />
				<TemplateShowcase items={dbTemplates} />
				<AiSeoOverview minPrice={minPrice} />
				<AllFeatures />
				<ResponsiveDevices />
				<WeddingStats />
				<HowItWorks minPrice={minPrice} />
				<AdminService />
				<WhyUs />
				<Pricing dynamicPackages={dynamicPackages} />
				<Comparison dynamicPackages={dynamicPackages} />
				<DigitalVsPrintComparison minPrice={minPrice} maxPrice={maxPrice} />
				<Testimonials dynamicTestimonials={settings?.testimonials} />
				<Faq dynamicPackages={dynamicPackages} dynamicFaqs={settings?.faqs} />
				<BlogPreview />
				<FinalCta minPrice={minPrice} />
				<PromoBanner minPrice={minPrice} />
				<Footer />
			</main>
			<FloatingWa />
			<LivePurchaseNotification />
		</div>
	);
}
