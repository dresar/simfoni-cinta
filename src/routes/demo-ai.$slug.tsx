import { createFileRoute, useParams } from "@tanstack/react-router";
import { TEMPLATE_REGISTRY } from "@/components/ai-studio/templates/registry";
import { Preset001 } from "@/components/ai-studio/presets/001/Preset001";
import { Preset002 } from "@/components/ai-studio/presets/002/Preset002";
import { PresetDefault } from "@/components/ai-studio/presets/default/PresetDefault";

export const Route = createFileRoute("/demo-ai/$slug")({
	head: ({ params }) => {
		const template = TEMPLATE_REGISTRY[params.slug];
		const title = template ? template.name : "AI Template Studio";
		return {
			meta: [
				{ title: `${title} — Live Preview` },
				{ name: "description", content: "Live preview template undangan otomatis" },
				{ name: "robots", content: "noindex, nofollow" },
			],
		};
	},
	component: DemoAiSlugPage,
});

const PRESET002_SLUGS = ["jawa-elegant"];
const PRESET_DEFAULT_SLUGS = ["default", "blank", "starter", "wireframe"];

function DemoAiSlugPage() {
	const params = useParams({ from: "/demo-ai/$slug" });
	const currentSlug = params.slug;

	const templateMeta =
		TEMPLATE_REGISTRY[currentSlug] || TEMPLATE_REGISTRY["adat-batak"];
	const activeTemplate = templateMeta;
	const isPreset002 = PRESET002_SLUGS.includes(currentSlug);
	const isDefault = PRESET_DEFAULT_SLUGS.includes(currentSlug);

	return (
		<div className="relative min-h-[100dvh] w-full bg-[#0f172a] dark:bg-stone-950 overflow-hidden flex items-stretch justify-center font-sans select-none p-0">
			<div
				className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-110 pointer-events-none transition-all duration-1000 hidden md:block"
				style={{
					backgroundImage: activeTemplate.defaultAssets.bgCover
						? `url(${activeTemplate.defaultAssets.bgCover})`
						: "none",
				}}
			/>

			<main className="relative z-20 w-full h-[100dvh] max-w-[360px] rounded-none shadow-[0_0_60px_rgba(0,0,0,0.5)] bg-white overflow-hidden flex flex-col justify-between border-x border-slate-200">
				{isDefault ? (
					<PresetDefault
						assets={activeTemplate.defaultAssets}
						theme={activeTemplate.defaultTheme}
						data={activeTemplate.defaultData}
					/>
				) : isPreset002 ? (
					<Preset002
						assets={activeTemplate.defaultAssets}
						theme={activeTemplate.defaultTheme}
						data={activeTemplate.defaultData}
					/>
				) : (
					<Preset001
						assets={activeTemplate.defaultAssets}
						theme={activeTemplate.defaultTheme}
						data={activeTemplate.defaultData}
					/>
				)}
			</main>
		</div>
	);
}

