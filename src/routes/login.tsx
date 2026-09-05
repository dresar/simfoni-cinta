import {
	createFileRoute,
	useNavigate,
	Link,
	useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
	ArrowLeft,
	Sparkles,
	ShieldCheck,
	Mail,
	Lock,
	Eye,
	EyeOff,
	User,
	ArrowRight,
	Loader2,
	CheckCircle2,
} from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react";
import { useStore } from "@/store/appStore";
import {
	resolveNeonOAuthSession,
	initiateSocialLogin,
	verifyTurnstileToken,
} from "@/functions/users";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z
	.object({
		auth: z.string().optional(),
		provider: z.string().optional(),
		token: z.string().optional(),
		neon_auth_session_verifier: z.string().optional(),
	})
	.passthrough();

export const Route = createFileRoute("/login")({
	validateSearch: (search) => searchSchema.parse(search),
	head: () => ({
		meta: [
			{ title: "Masuk Akun — Simfoni Cinta Digital Wedding Suite" },
			{
				name: "description",
				content:
					"Portal masuk resmi Google, GitHub, Vercel, dan Email untuk Panel Admin dan Dasbor Pengantin.",
			},
			{ property: "og:title", content: "Masuk Akun — Simfoni Cinta" },
		],
	}),
	component: LoginPage,
});

const MASTER_OWNER_EMAIL = "eka.ckp16799@gmail.com";

function GoogleIcon() {
	return (
		<svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
			/>
		</svg>
	);
}

function VercelIcon() {
	return (
		<svg className="size-4 fill-current shrink-0" viewBox="0 0 24 24">
			<path d="M24 22.525H0l12-21.05 12 21.05z" />
		</svg>
	);
}

function LoginPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/login" });
	const { signIn } = useStore();
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string>("");
	const [turnstileReady, setTurnstileReady] = useState(false);
	const turnstileRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);

	const turnstileSiteKey =
		(typeof window !== "undefined" &&
			((window as any).ENV_TURNSTILE_SITE_KEY ||
				(import.meta as any).env?.VITE_TURNSTILE_SITE_KEY)) ||
		"0x4AAAAAAEk8E0wrrh4LV7N-";

	const resetTurnstile = () => {
		if (
			widgetIdRef.current &&
			typeof window !== "undefined" &&
			(window as any).turnstile
		) {
			try {
				(window as any).turnstile.reset(widgetIdRef.current);
			} catch {}
		}
		setTurnstileToken("");
		setTurnstileReady(false);
	};

	useEffect(() => {
		const checkTurnstile = () => {
			if (
				typeof window !== "undefined" &&
				(window as any).turnstile &&
				turnstileRef.current &&
				!widgetIdRef.current
			) {
				try {
					const id = (window as any).turnstile.render(turnstileRef.current, {
						sitekey: turnstileSiteKey,
						action: "login",
						callback: (token: string) => {
							setTurnstileToken(token);
							setTurnstileReady(true);
						},
						"error-callback": () => {
							setTurnstileReady(false);
							setTurnstileToken("");
						},
						"expired-callback": () => {
							setTurnstileToken("");
						},
						theme: "dark",
						size: "normal",
						retry: "auto",
						"retry-interval": 1000,
					});
					widgetIdRef.current = id;
				} catch {}
			}
		};

		const interval = setInterval(checkTurnstile, 300);
		const timeout = setTimeout(() => clearInterval(interval), 6000);

		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
			if (
				widgetIdRef.current &&
				typeof window !== "undefined" &&
				(window as any).turnstile
			) {
				try {
					(window as any).turnstile.remove(widgetIdRef.current);
				} catch {}
				widgetIdRef.current = null;
			}
		};
	}, [turnstileSiteKey]);

	useEffect(() => {
		if (search.auth === "success") {
			const tokenParam =
				search.token || (search as any).neon_auth_session_verifier || "";

			const verifyNeonSession = async () => {
				try {
					const user = await resolveNeonOAuthSession({ data: tokenParam });
					if (user && user.email) {
						const isMasterAdmin =
							user.email.toLowerCase() === MASTER_OWNER_EMAIL ||
							user.role === "admin";
						signIn({
							name: user.name,
							email: user.email,
							role: isMasterAdmin ? "admin" : "user",
							tier: user.tier || (isMasterAdmin ? "Owner Super Admin" : "Free"),
							avatar: user.avatar,
						});

						try {
							if (
								typeof window !== "undefined" &&
								window.opener &&
								!window.opener.closed
							) {
								window.opener.postMessage(
									{ type: "OAUTH_LOGIN_SUCCESS", token: tokenParam },
									window.location.origin,
								);
								window.close();
								return;
							}
						} catch {}

						if (isMasterAdmin) {
							toast.success(
								`Selamat datang kembali, Master Admin ${user.name}!`,
							);
							window.location.href = "/admin";
						} else {
							toast.success(`Selamat datang di Simfoni Cinta, ${user.name}!`);
							window.location.href = "/dasbor";
						}
					} else {
						toast.error(
							"Tidak dapat menemukan data akun dari Google/Neon Auth.",
						);
						window.location.href = "/login";
					}
				} catch (err: any) {
					toast.error(err?.message || "Gagal memverifikasi sesi login.");
					navigate({ to: "/login" });
				}
			};

			verifyNeonSession();
		}
	}, [search.auth, search.token, (search as any).neon_auth_session_verifier]);

	useEffect(() => {
		const handleMessage = async (event: MessageEvent) => {
			if (event.origin !== window.location.origin) return;
			if (event.data?.type === "OAUTH_LOGIN_SUCCESS" && event.data?.token) {
				setSocialLoading(null);
				try {
					const user = await resolveNeonOAuthSession({
						data: event.data.token,
					});
					if (user && user.email) {
						const isMasterAdmin =
							user.email.toLowerCase() === MASTER_OWNER_EMAIL ||
							user.role === "admin";
						signIn({
							name: user.name,
							email: user.email,
							role: isMasterAdmin ? "admin" : "user",
							tier: user.tier || (isMasterAdmin ? "Owner Super Admin" : "Free"),
							avatar: user.avatar,
						});
						if (isMasterAdmin) {
							toast.success(
								`Selamat datang kembali, Master Admin ${user.name}!`,
							);
							window.location.href = "/admin";
						} else {
							toast.success(`Selamat datang di Simfoni Cinta, ${user.name}!`);
							window.location.href = "/dasbor";
						}
					}
				} catch (err: any) {
					toast.error(err?.message || "Gagal memverifikasi sesi login.");
				}
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [navigate, signIn]);

	const handleOAuthLogin = async (provider: "google" | "github" | "vercel") => {
		setSocialLoading(provider);
		try {
			const origin =
				typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:8080";

			const res = await initiateSocialLogin({
				data: { provider, origin },
			});

			if (res.url) {
				toast.info(`Mengarahkan ke ${provider.toUpperCase()}...`);
				window.location.href = res.url;
			} else {
				toast.error(`Gagal menghubungkan ke ${provider}.`);
				setSocialLoading(null);
			}
		} catch (err: any) {
			const msg = err?.message || "";
			if (msg.includes("INVALID_CALLBACKURL")) {
				toast.error(
					"Domain 'https://aksara-cinta.pages.dev' belum didaftarkan di Neon Auth Console. Tambahkan domain tersebut di menu Allowed Redirect URLs pada Neon Dashboard.",
					{ duration: 8000 },
				);
			} else {
				toast.error(err?.message || `Gagal login ${provider}`);
			}
			setSocialLoading(null);
		}
	};

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !password.trim()) {
			toast.error("Harap isi email dan kata sandi.");
			return;
		}

		setLoading(true);

		if (turnstileToken) {
			try {
				const check = await verifyTurnstileToken({ data: turnstileToken });
				if (!check.success) {
					toast.error(check.message || "Verifikasi keamanan gagal. Silakan coba lagi.");
					resetTurnstile();
					setLoading(false);
					return;
				}
				resetTurnstile();
			} catch {
				resetTurnstile();
			}
		}

		const cleanEmail = email.trim().toLowerCase();
		const isMasterAdmin = cleanEmail === MASTER_OWNER_EMAIL;

		setTimeout(() => {
			signIn({
				name:
					name.trim() ||
					(isMasterAdmin ? "Eka Syarif Maulana" : cleanEmail.split("@")[0]),
				email: cleanEmail,
				role: isMasterAdmin ? "admin" : "user",
				tier: isMasterAdmin ? "Owner Super Admin" : "Free",
				avatar: isMasterAdmin
					? "https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/avatars/1788085226131-asset-4e610a02.png"
					: undefined,
			});

			if (isMasterAdmin) {
				toast.success("Login Master Admin Berhasil!");
				navigate({ to: "/admin" });
			} else {
				toast.success(
					mode === "signin"
						? "Berhasil masuk ke Dasbor Pengantin!"
						: "Pendaftaran akun berhasil!",
				);
				navigate({ to: "/dasbor" });
			}
			setLoading(false);
		}, 400);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-[#080a09] text-white flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200 pb-16 md:pb-0">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[36rem] w-[50rem] rounded-full bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl" />
				<div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />
				<div className="absolute top-1/3 -left-20 h-[24rem] w-[24rem] rounded-full bg-emerald-500/5 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
			</div>

			<header className="container mx-auto flex items-center justify-between px-6 py-6 sm:px-10">
				<Link
					to="/"
					className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-white/[0.08] hover:text-white"
				>
					<ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
					<span>Kembali ke Beranda</span>
				</Link>
				<div className="flex items-center gap-1.5 text-xs text-emerald-400/90 font-medium">
					<ShieldCheck className="size-4" />
					<span className="hidden sm:inline">
						Neon Auth Enkripsi Terproteksi
					</span>
				</div>
			</header>

			<main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
				<div className="relative w-full max-w-md">
					<div className="relative rounded-3xl border border-white/10 bg-[#0d1013]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
						<div className="text-center space-y-2">
							<img
								src="/logo.png"
								alt="Simfoni Cinta"
								className="size-14 mx-auto object-contain drop-shadow-md"
							/>
							<h1 className="font-serif text-2xl font-bold tracking-tight text-white">
								Simfoni Cinta
							</h1>
							<p className="text-xs text-white/50">
								{mode === "signin"
									? "Masuk ke Panel Master Admin & Dasbor Pengantin"
									: "Buat akun baru untuk mulai mendesain undangan pernikahan"}
							</p>
						</div>

						{search.auth === "success" ? (
							<div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
								<Loader2 className="size-8 animate-spin text-amber-400" />
								<p className="text-sm font-semibold text-white">
									Memverifikasi Sesi Akun Google...
								</p>
								<p className="text-xs text-white/50">
									Mengarahkan Anda ke dasbor dalam hitungan detik...
								</p>
							</div>
						) : (
							<>
								<div className="space-y-2.5">
							<button
								type="button"
								disabled={!!socialLoading || loading}
								onClick={() => handleOAuthLogin("google")}
								className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-xs font-semibold text-white transition-all hover:border-white/20 active:scale-[0.99] cursor-pointer"
							>
								{socialLoading === "google" ? (
									<Loader2 className="size-4 animate-spin text-amber-400" />
								) : (
									<GoogleIcon />
								)}
								<span>Lanjutkan dengan Google</span>
							</button>

							<div className="grid grid-cols-2 gap-2.5">
								<button
									type="button"
									disabled={!!socialLoading || loading}
									onClick={() => handleOAuthLogin("github")}
									className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-white transition-all hover:border-white/20 active:scale-[0.99] cursor-pointer"
								>
									{socialLoading === "github" ? (
										<Loader2 className="size-4 animate-spin text-amber-400" />
									) : (
										<GithubLogo weight="fill" className="size-4" />
									)}
									<span>GitHub</span>
								</button>

								<button
									type="button"
									disabled={!!socialLoading || loading}
									onClick={() => handleOAuthLogin("vercel")}
									className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-white transition-all hover:border-white/20 active:scale-[0.99] cursor-pointer"
								>
									{socialLoading === "vercel" ? (
										<Loader2 className="size-4 animate-spin text-amber-400" />
									) : (
										<VercelIcon />
									)}
									<span>Vercel</span>
								</button>
							</div>
						</div>

						<div className="relative flex items-center justify-center">
							<div className="w-full border-t border-white/10" />
							<span className="absolute bg-[#0d1013] px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
								atau via email
							</span>
						</div>

						<form onSubmit={handleEmailSubmit} className="space-y-3.5">
							{mode === "signup" && (
								<div className="space-y-1">
									<label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
										Nama Lengkap
									</label>
									<div className="relative">
										<User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
										<input
											type="text"
											required
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Eka Syarif Maulana"
											className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500 transition-colors"
										/>
									</div>
								</div>
							)}

							<div className="space-y-1">
								<label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
									Alamat Email
								</label>
								<div className="relative">
									<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
									<input
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="eka.ckp16799@gmail.com"
										className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500 transition-colors"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
										Kata Sandi
									</label>
									{mode === "signin" && (
										<button
											type="button"
											onClick={() =>
												toast.info(
													"Tautan reset kata sandi dikirimkan ke email terdaftar.",
												)
											}
											className="text-[10px] text-amber-400/80 hover:text-amber-300 transition-colors"
										>
											Lupa sandi?
										</button>
									)}
								</div>
								<div className="relative">
									<Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
									<input
										type={showPassword ? "text" : "password"}
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500 transition-colors"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</button>
								</div>
							</div>

							<div className="my-2 flex flex-col items-center justify-center min-h-[66px]">
								<div ref={turnstileRef} className="flex justify-center" />
								{!turnstileReady && (
									<div className="flex items-center gap-1.5 text-[11px] text-white/40">
										<ShieldCheck className="size-3.5 text-emerald-400/80" />
										<span>Proteksi Keamanan Cloudflare Turnstile</span>
									</div>
								)}
							</div>

							<button
								type="submit"
								disabled={loading || !!socialLoading}
								className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer mt-1"
							>
								{loading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<>
										<span>
											{mode === "signin" ? "Masuk ke Akun" : "Daftar Sekarang"}
										</span>
										<ArrowRight className="size-3.5" />
									</>
								)}
							</button>
						</form>

						<div className="pt-2 text-center text-xs text-white/50">
							{mode === "signin" ? (
								<p>
									Belum memiliki akun?{" "}
									<button
										type="button"
										onClick={() => setMode("signup")}
										className="font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
									>
										Daftar Sekarang
									</button>
								</p>
							) : (
								<p>
									Sudah memiliki akun?{" "}
									<button
										type="button"
										onClick={() => setMode("signin")}
										className="font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
									>
										Masuk Akun
									</button>
								</p>
							)}
						</div>
							</>
						)}
					</div>
				</div>
			</main>

			<footer className="container mx-auto px-6 py-6 text-center text-xs text-white/30 hidden md:block">
				© 2026 Simfoni Cinta — Platform Undangan Pernikahan Digital Premium
				Indonesia
			</footer>
		</div>
	);
}
