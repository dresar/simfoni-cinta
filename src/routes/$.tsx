import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections-b";
import { FloatingWa } from "@/components/landing/floating-wa";
import { ArrowLeft, House, Compass } from "lucide-react";

export const Route = createFileRoute("/$")({
	head: () => ({
		meta: [
			{ title: "404: Halaman Tidak Ditemukan — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Halaman yang Anda cari tidak dapat ditemukan di Simfoni Cinta.",
			},
		],
	}),
	component: NotFoundPage,
});

function NotFoundPage() {
	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			<Navbar />
			<main className="flex-1 flex items-center justify-center px-4 py-24">
				<div className="max-w-md w-full text-center space-y-6">
					<div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
						<span className="font-serif text-3xl font-extrabold tracking-wider">
							404
						</span>
					</div>
					<div className="space-y-2">
						<h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
							Halaman Tidak Ditemukan
						</h1>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Tautan yang Anda tuju mungkin salah ketik, telah dihapus, atau
							dipindahkan ke alamat lain.
						</p>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
						<Link
							to="/"
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all"
						>
							<House className="size-4" />
							<span>Ke Beranda</span>
						</Link>
						<Link
							to="/demo"
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted/60 px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground transition-all"
						>
							<Compass className="size-4" />
							<span>Lihat Katalog Template</span>
						</Link>
					</div>
				</div>
			</main>
			<Footer />
			<FloatingWa />
		</div>
	);
}
