import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/demo/$slug")({
	head: ({ params }) => ({
		meta: [
			{ title: `Demo ${params.slug} — Simfoni Cinta` },
			{ name: "robots", content: "noindex, nofollow" }
		]
	}),
	component: TemplateDemoViewer
});

function TemplateDemoViewer() {
	const { slug } = useParams({ from: "/demo/$slug" });

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.location.replace(`/demo/${slug}/`);
		}
	}, [slug]);

	return (
		<iframe
			src={`/demo/${slug}/`}
			className="fixed inset-0 w-full h-full border-0 m-0 p-0 block bg-background"
			title={`Demo ${slug}`}
			allow="autoplay; encrypted-media; fullscreen"
		/>
	);
}
