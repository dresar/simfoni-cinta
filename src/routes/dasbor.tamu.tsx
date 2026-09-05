import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dasbor/tamu")({
	beforeLoad: () => {
		throw redirect({ to: "/dasbor/sebar" });
	},
});
