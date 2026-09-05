import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	Bot,
	Key,
	Eye,
	EyeOff,
	Save,
	Activity,
	CheckCircle,
	AlertCircle,
	ExternalLink,
	ShieldCheck,
	Cpu,
	Sparkles,
	RotateCw,
} from "lucide-react";
import {
	PageHead,
	GlassCard,
	Action,
	Pill,
	TextInput,
	SelectInput,
	TextArea,
} from "@/components/kit";
import { fetchAdminSettings } from "@/functions/settings";
import { testGeminiConnectionFn, saveGeminiConfigFn } from "@/functions/gemini";
import type { ConnectionTestResult } from "@/server/gemini";

export const Route = createFileRoute("/admin/promosi-pengaturan")({
	loader: () => fetchAdminSettings(),
	head: () => ({
		meta: [
			{ title: "Pengaturan AI — Simfoni Cinta" },
			{
				name: "description",
				content: "Kelola konfigurasi API Key Google Gemini dan model AI di database Neon.",
			},
		],
	}),
	component: PromosiPengaturanPage,
});

function PromosiPengaturanPage() {
	const settings = Route.useLoaderData();
	const [apiKeysText, setApiKeysText] = useState(() => {
		if (settings?.geminiApiKeys?.length) {
			return settings.geminiApiKeys.join("\n");
		}
		return settings?.geminiApiKey || "";
	});
	const [model, setModel] = useState(settings?.geminiModel || "gemini-3.6-flash");
	const [tone, setTone] = useState(settings?.geminiTone || "romantis_elegan");
	const [customPrompt, setCustomPrompt] = useState(settings?.geminiCustomPrompt || "");
	const [showKeys, setShowKeys] = useState(false);
	const [testing, setTesting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

	const parsedKeys = apiKeysText
		.split("\n")
		.map((k) => k.trim())
		.filter((k) => k.length > 10);

	async function handleTest() {
		setTesting(true);
		setTestResult(null);
		try {
			const res = await testGeminiConnectionFn({
				data: {
					customKey: parsedKeys[0] || undefined,
					customModel: model,
				},
			});
			if (res) {
				setTestResult(res);
				if (res.success) {
					toast.success(`Terhubung (${res.latencyMs}ms)`);
				} else {
					toast.error(res.message || "Gagal koneksi.");
				}
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal koneksi.";
			toast.error(msg);
			setTestResult({
				success: false,
				latencyMs: 0,
				model,
				message: msg,
			});
		} finally {
			setTesting(false);
		}
	}

	async function handleSave() {
		setSaving(true);
		try {
			await saveGeminiConfigFn({
				data: {
					geminiApiKey: parsedKeys[0] || "",
					geminiApiKeys: parsedKeys,
					geminiModel: model,
					geminiTone: tone,
					geminiCustomPrompt: customPrompt.trim(),
				},
			});
			toast.success("Konfigurasi AI dan Pool Key tersimpan!");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal menyimpan.";
			toast.error(msg);
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="space-y-6 pb-12 max-w-4xl">
			<PageHead
				title="Pengaturan AI & Auto-Rotasi Key"
				subtitle="Kelola konfigurasi multi-key Google Gemini dan model AI 3.6 Flash dengan sistem auto-failover tersimpan aman di database Neon."
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				<div className="md:col-span-2 space-y-4">
					<GlassCard className="p-4 sm:p-5 space-y-4">
						<div className="flex items-center justify-between border-b border-white/8 pb-3">
							<div className="flex items-center gap-2">
								<Bot className="size-4 text-[#c9a96e]" />
								<h3 className="text-xs font-bold uppercase tracking-wider text-white/90">
									Pool Kredensial Gemini API (Auto-Rotasi)
								</h3>
							</div>
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
								<RotateCw className="size-2.5 animate-spin" />
								<span>{parsedKeys.length} Key Aktif</span>
							</span>
						</div>

						<div className="space-y-3.5">
							<div>
								<div className="flex items-center justify-between mb-1">
									<label className="text-xs font-semibold text-white/80">
										Daftar API Key Gemini (1 Key Per Baris)
									</label>
									<button
										type="button"
										onClick={() => setShowKeys(!showKeys)}
										className="inline-flex items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer"
									>
										{showKeys ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
										<span>{showKeys ? "Sembunyikan" : "Tampilkan"}</span>
									</button>
								</div>
								<div className="relative">
									<textarea
										rows={6}
										value={showKeys ? apiKeysText : apiKeysText.replace(/[^\n]/g, "•")}
										onChange={(e) => setApiKeysText(e.target.value)}
										placeholder="Tempel 1 atau banyak Gemini API Key per baris (AIzaSy... / AQ.Ab8RN6...)"
										className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white font-mono outline-none focus:border-[#c9a96e]/50 focus:ring-1 focus:ring-[#c9a96e]/20 resize-y"
									/>
								</div>
								<div className="flex items-center justify-between mt-1 text-[11px] text-white/40">
									<p>Jika 1 key limit/error 429, otomatis berganti ke key berikutnya.</p>
									<span className="font-mono text-emerald-400 text-[10px]">{parsedKeys.length} terdeteksi</span>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="text-xs font-semibold text-white/80 block mb-1">
										Pilihan Model AI (Wajib 3.6 Flash)
									</label>
									<SelectInput
										value={model}
										onChange={(e) => setModel(e.target.value)}
										className="text-xs"
									>
										<option value="gemini-3.6-flash" className="bg-[#12161f]">
											Gemini 3.6 Flash (Default Wajib & Tercepat)
										</option>
										<option value="gemini-2.5-flash" className="bg-[#12161f]">
											Gemini 2.5 Flash
										</option>
										<option value="gemini-2.5-pro" className="bg-[#12161f]">
											Gemini 2.5 Pro
										</option>
									</SelectInput>
								</div>

								<div>
									<label className="text-xs font-semibold text-white/80 block mb-1">
										Gaya Bahasa Promosi
									</label>
									<SelectInput
										value={tone}
										onChange={(e) => setTone(e.target.value)}
										className="text-xs"
									>
										<option value="romantis_elegan" className="bg-[#12161f]">
											Romantis & Elegan
										</option>
										<option value="viral_punchy" className="bg-[#12161f]">
											Viral & Hook Tajam
										</option>
										<option value="formal_sakral" className="bg-[#12161f]">
											Formal & Sakral Nusantara
										</option>
									</SelectInput>
								</div>
							</div>

							<div>
								<label className="text-xs font-semibold text-white/80 block mb-1">
									Instruksi Khusus Tambahan
								</label>
								<TextArea
									value={customPrompt}
									onChange={(e) => setCustomPrompt(e.target.value)}
									placeholder="Tambahkan arahan khusus gaya penulisan caption atau visual..."
									rows={3}
									className="text-xs resize-none"
								/>
							</div>

							<div className="flex items-center gap-2 pt-2 border-t border-white/8">
								<Action
									type="button"
									onClick={handleTest}
									disabled={testing}
									tone="preview"
									size="sm"
									className="flex-1"
								>
									<Activity className="size-3.5" />
									<span>{testing ? "Menguji Rotasi..." : "Tes Koneksi & Rotasi"}</span>
								</Action>

								<Action
									type="button"
									onClick={handleSave}
									disabled={saving}
									tone="primary"
									size="sm"
									className="flex-1"
								>
									<Save className="size-3.5" />
									<span>{saving ? "Menyimpan..." : "Simpan Pool Key"}</span>
								</Action>
							</div>
						</div>
					</GlassCard>

					{testResult && (
						<GlassCard
							className={`p-4 border-l-4 ${
								testResult.success
									? "border-l-emerald-500 bg-emerald-500/5"
									: "border-l-rose-500 bg-rose-500/5"
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-center gap-2.5">
									{testResult.success ? (
										<CheckCircle className="size-5 text-emerald-400 shrink-0" />
									) : (
										<AlertCircle className="size-5 text-rose-400 shrink-0" />
									)}
									<div>
										<h4 className="text-xs font-bold text-white">
											{testResult.success ? "Koneksi Berhasil" : "Koneksi Gagal"}
										</h4>
										<p className="text-[11px] text-white/60 mt-0.5">
											{testResult.message}
										</p>
									</div>
								</div>
								{testResult.success && (
									<span className="rounded-[4px] bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
										{testResult.latencyMs}ms
									</span>
								)}
							</div>
						</GlassCard>
					)}
				</div>

				<div className="space-y-4">
					<GlassCard className="p-4 space-y-3">
						<div className="flex items-center gap-2 text-[#c9a96e]">
							<Key className="size-4" />
							<h4 className="text-xs font-bold text-white">Sistem Auto-Rotasi</h4>
						</div>
						<p className="text-[11px] text-white/70 leading-relaxed">
							Sistem secara otomatis memutar API Key pada setiap request untuk mendistribusikan beban kuota. Jika satu key menerima respon 429 atau kuota habis, permintaan dialihkan seketika ke key cadangan berikutnya tanpa gangguan.
						</p>
						<a
							href="https://aistudio.google.com/app/apikey"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center justify-center gap-1.5 w-full rounded-[6px] border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1.5 text-xs font-semibold text-[#e8c98a] hover:bg-[#c9a96e]/20 transition-colors"
						>
							<span>Google AI Studio</span>
							<ExternalLink className="size-3" />
						</a>
					</GlassCard>

					<GlassCard className="p-4 space-y-2">
						<div className="flex items-center gap-2 text-emerald-400">
							<ShieldCheck className="size-4" />
							<h4 className="text-xs font-bold text-white">Keamanan Kredensial</h4>
						</div>
						<p className="text-[11px] text-white/60 leading-relaxed">
							Seluruh API Key tersimpan terenkripsi di database PostgreSQL Neon sisi server dan tidak pernah diekspos ke klien browser.
						</p>
					</GlassCard>

					<GlassCard className="p-4 space-y-2">
						<div className="flex items-center gap-2 text-cyan-400">
							<Cpu className="size-4" />
							<h4 className="text-xs font-bold text-white">Fitur Bertenaga AI</h4>
						</div>
						<ul className="text-[11px] text-white/70 space-y-1.5">
							<li className="flex items-center gap-1.5">
								<span className="size-1 rounded-full bg-[#c9a96e]" />
								Promosi Template & Feed Instagram
							</li>
							<li className="flex items-center gap-1.5">
								<span className="size-1 rounded-full bg-[#c9a96e]" />
								Prompt Thumbnail & Video Overlay
							</li>
							<li className="flex items-center gap-1.5">
								<span className="size-1 rounded-full bg-[#c9a96e]" />
								Prompt Google Veo 3 & Sora
							</li>
						</ul>
					</GlassCard>
				</div>
			</div>
		</div>
	);
}
