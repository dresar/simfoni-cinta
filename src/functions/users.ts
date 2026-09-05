import { createServerFn } from "@tanstack/react-start";
import * as usersService from "@/server/users";

export const fetchUsers = createServerFn({ method: "GET" }).handler(() =>
	usersService.getUsers(),
);

export const fetchUser = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(({ data }) => usersService.getUserById(data));

export const addUser = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => usersService.createUser(data));

export const editUser = createServerFn({ method: "POST" })
	.validator((payload: { id: string; body: unknown }) => payload)
	.handler(({ data }) => usersService.updateUser(data.id, data.body));

export const removeUser = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => usersService.deleteUser(data));

export const resolveNeonOAuthSession = createServerFn({ method: "POST" })
	.validator((token?: string) => token)
	.handler(({ data }) => usersService.resolveLatestSession(data));

export const initiateSocialLogin = createServerFn({ method: "POST" })
	.validator(
		(payload: { provider: "google" | "github" | "vercel"; origin: string }) =>
			payload,
	)
	.handler(({ data }) =>
		usersService.initiateSocialLogin(data.provider, data.origin),
	);

export const verifyTurnstileToken = createServerFn({ method: "POST" })
	.validator((token: string) => token)
	.handler(async ({ data: token }) => {
		if (
			typeof token !== "string" ||
			token.length === 0 ||
			token.length > 2048
		) {
			return { success: false, message: "Token Turnstile tidak valid" };
		}

		const secret =
			process.env.TURNSTILE_SECRET ||
			process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
			"";

		if (!secret) {
			return { success: false, message: "Kunci secret Turnstile belum dikonfigurasi" };
		}

		const expectedAction = "login";
		const rawHostnames =
			process.env.TURNSTILE_HOSTNAMES ||
			"simfonicinta.my.id,simfoni-cinta.pages.dev,localhost,127.0.0.1";
		const expectedHostnames = new Set(
			rawHostnames
				.split(",")
				.map((h) => h.trim().toLowerCase())
				.filter(Boolean),
		);

		try {
			const res = await fetch(
				"https://challenges.cloudflare.com/turnstile/v0/siteverify",
				{
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					signal: AbortSignal.timeout(10_000),
					body: new URLSearchParams({
						secret,
						response: token,
					}),
				},
			);

			if (!res.ok) {
				return { success: false, message: `Verifikasi gagal HTTP ${res.status}` };
			}

			const outcome = (await res.json()) as {
				success: boolean;
				action?: string;
				hostname?: string;
				"error-codes"?: string[];
			};

			if (!outcome.success) {
				return {
					success: false,
					message: "Tantangan keamanan gagal",
					errorCodes: outcome["error-codes"],
				};
			}

			if (outcome.action && outcome.action !== expectedAction) {
				return { success: false, message: "Aksi Turnstile tidak sesuai" };
			}

			if (outcome.hostname && expectedHostnames.size > 0) {
				const hostLower = outcome.hostname.toLowerCase();
				const isHostAllowed =
					expectedHostnames.has(hostLower) ||
					hostLower.endsWith(".simfoni-cinta.pages.dev") ||
					hostLower.endsWith(".pages.dev");
				if (!isHostAllowed) {
					return { success: false, message: "Hostname Turnstile tidak diizinkan" };
				}
			}

			return { success: true, hostname: outcome.hostname };
		} catch {
			return { success: false, message: "Koneksi ke verifikasi Cloudflare gagal" };
		}
	});

