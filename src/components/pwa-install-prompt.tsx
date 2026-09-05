import { useState, useEffect } from "react";
import { Sparkles, Download, X } from "lucide-react";

export function PwaInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [show, setShow] = useState(false);

	useEffect(() => {
		const dismissed = localStorage.getItem("aksara_pwa_dismissed");
		if (dismissed === "true") return;

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
			if (window.innerWidth < 768) {
				setShow(true);
			}
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		return () =>
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		setDeferredPrompt(null);
		setShow(false);
		localStorage.setItem("aksara_pwa_dismissed", "true");
	};

	const handleDismiss = () => {
		setShow(false);
		localStorage.setItem("aksara_pwa_dismissed", "true");
	};

	if (!show) return null;

	return (
		<div className="fixed bottom-20 inset-x-3 z-50 sm:hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
			<div className="rounded-2xl border border-emerald-900/20 bg-stone-900/95 text-white p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3">
				<div className="size-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
					<Download className="size-5" />
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="text-xs font-bold text-white flex items-center gap-1.5">
						<span>Pasang Aplikasi Simfoni Cinta</span>
						<Sparkles className="size-3 text-amber-400" />
					</h4>
					<p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
						Install di layar utama HP Anda untuk akses instan & praktis.
					</p>
					<div className="flex items-center gap-2 mt-3">
						<button
							type="button"
							onClick={handleInstall}
							className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 px-3.5 py-1.5 text-xs font-bold transition-all"
						>
							Install Sekarang
						</button>
						<button
							type="button"
							onClick={handleDismiss}
							className="rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 text-xs font-semibold transition-all"
						>
							Nanti Saja
						</button>
					</div>
				</div>
				<button
					type="button"
					onClick={handleDismiss}
					className="text-stone-400 hover:text-white p-1"
				>
					<X className="size-4" />
				</button>
			</div>
		</div>
	);
}
