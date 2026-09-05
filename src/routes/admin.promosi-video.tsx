import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/promosi-video")({
	beforeLoad: () => {
		throw redirect({ to: "/admin/promosi-gambar" });
	},
	component: () => null,
});
