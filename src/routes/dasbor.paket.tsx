import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/dasbor/paket")({
	validateSearch: (search: Record<string, unknown>) => ({
		status: typeof search.status === "string" ? search.status : "",
		orderId:
			typeof search.orderId === "string"
				? search.orderId
				: typeof search.ref === "string"
					? search.ref
					: "",
		ref: typeof search.ref === "string" ? search.ref : "",
	}),
	head: () => ({
		meta: [
			{ title: "Pembelian & Paket — Simfoni Cinta" },
			{
				name: "description",
				content: "Pengalihan ke halaman pembelian template Simfoni Cinta.",
			},
		],
	}),
	component: DasborPaketRedirect,
});

function DasborPaketRedirect() {
	const navigate = useNavigate();
	const search = Route.useSearch();

	useEffect(() => {
		const orderId = search.orderId || search.ref;
		if (search.status && orderId) {
			navigate({
				to: "/dasbor/pembelian",
				search: { status: search.status, orderId },
				replace: true,
			});
		} else {
			navigate({ to: "/dasbor/pembelian", replace: true });
		}
	}, [navigate, search]);

	return (
		<div className="flex flex-col items-center justify-center py-20 text-stone-500 space-y-3">
			<RefreshCw className="size-6 animate-spin text-emerald-800" />
			<p className="text-xs font-semibold">Mengalihkan ke Pembelian Saya...</p>
		</div>
	);
}
