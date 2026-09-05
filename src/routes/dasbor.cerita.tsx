import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/dasbor/cerita")({
	beforeLoad: () => {
		throw redirect({ to: "/dasbor/undangan" });
	},
	component: () => null,
});
