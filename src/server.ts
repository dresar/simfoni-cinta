import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { createMayarPayment } from "./lib/mayar";

type ServerEntry = {
	fetch: (
		request: Request,
		env: unknown,
		ctx: unknown,
	) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
	if (!serverEntryPromise) {
		serverEntryPromise = import("@tanstack/react-start/server-entry").then(
			(m) => (m.default ?? m) as ServerEntry,
		);
	}
	return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(
	response: Response,
): Promise<Response> {
	if (response.status < 500) return response;
	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) return response;

	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;

	console.error(
		consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
	);
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" },
	});
}

function isH3SwallowedErrorBody(body: string): boolean {
	try {
		const payload = JSON.parse(body) as {
			unhandled?: unknown;
			message?: unknown;
		};
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}

export default {
	async fetch(request: Request, env: unknown, ctx: unknown) {
		try {
			if (env && typeof env === "object") {
				if (typeof globalThis !== "undefined") {
					(globalThis as any).process = (globalThis as any).process || {};
					(globalThis as any).process.env = (globalThis as any).process.env || {};
				}
				for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
					if (typeof value === "string") {
						process.env[key] = value;
						if (typeof globalThis !== "undefined" && (globalThis as any).process?.env) {
							(globalThis as any).process.env[key] = value;
						}
					}
				}
			}

			const url = new URL(request.url);

			if (url.hostname === "www.simfonicinta.my.id") {
				url.hostname = "simfonicinta.my.id";
				return Response.redirect(url.toString(), 301);
			}

			if (
				url.pathname === "/google0e7f4f807a599919.html" ||
				url.pathname === "/google0e7f4f807a599919"
			) {
				return new Response("google-site-verification: google0e7f4f807a599919.html", {
					status: 200,
					headers: { "content-type": "text/html; charset=utf-8" },
				});
			}

			if (
				url.pathname.startsWith("/demo/") &&
				url.pathname !== "/demo" &&
				url.pathname !== "/demo/"
			) {
				const pathWithoutPrefix = url.pathname.slice("/demo/".length);
				if (!pathWithoutPrefix.includes("/") && !pathWithoutPrefix.includes(".")) {
					url.pathname = `/demo/${pathWithoutPrefix}/`;
					return Response.redirect(url.toString(), 301);
				}

				if (env && typeof env === "object" && "ASSETS" in env && (env as any).ASSETS) {
					try {
						let assetRes = await (env as any).ASSETS.fetch(request);
						if (assetRes && assetRes.status === 200) {
							return assetRes;
						}
						if (assetRes && assetRes.status >= 300 && assetRes.status < 400) {
							return assetRes;
						}
						if ((!assetRes || assetRes.status >= 400) && url.pathname.endsWith("/")) {
							const indexUrl = new URL(url.toString());
							indexUrl.pathname = `${indexUrl.pathname}index.html`;
							const fallbackRes = await (env as any).ASSETS.fetch(new Request(indexUrl.toString(), request));
							if (fallbackRes && fallbackRes.status < 400) {
								return fallbackRes;
							}
						}
					} catch {}
				}
			}

			if (env && typeof env === "object" && "ASSETS" in env && (env as any).ASSETS) {
				const isStaticFile =
					url.pathname.startsWith("/assets/") ||
					/\.(ico|png|jpg|jpeg|webp|svg|gif|css|js|woff|woff2|ttf|eot|json|xml|txt|md|html|webmanifest|mp3|mp4|ogg|wav|m4a|webm)$/i.test(
						url.pathname,
					);
				if (isStaticFile) {
					try {
						const assetRes = await (env as any).ASSETS.fetch(request);
						if (assetRes && assetRes.status < 400) {
							return assetRes;
						}
					} catch {}
				}
			}

			if (url.pathname === "/api/payments/checkout") {
				if (request.method === "POST") {
					try {
						const body = await request.json();
						const pkgMap: Record<string, number> = {
							silver: 15000,
							gold: 35000,
							platinum: 75000,
						};
						const requestedPkg = String(body.packageId || "").toLowerCase();
						const canonicalAmount = pkgMap[requestedPkg] || 15000;
						const appUrl = (
							process.env.NEXT_PUBLIC_APP_URL || "https://simfonicinta.my.id"
						).replace(/\/$/, "");
						const reference = `INV-${Date.now().toString().slice(-6)}-${(body.packageId || "PKG").toUpperCase()}`;
						const redirectUrl = `${appUrl}/dasbor/pembelian?status=success&orderId=${reference}`;

						const res = await createMayarPayment({
							reference,
							amount: canonicalAmount,
							customerName: body.customerName || "Eka Syarif Maulana",
							customerEmail: body.customerEmail || "eka.ckp16799@gmail.com",
							customerPhone: body.customerPhone || "082392115909",
							description: `Pembelian ${body.packageName || "Paket"} Simfoni Cinta (${reference})`,
							redirectUrl,
						});

						return new Response(
							JSON.stringify({
								success: true,
								reference,
								checkoutUrl: res.checkoutUrl,
							}),
							{
								status: 200,
								headers: { "content-type": "application/json" },
							},
						);
					} catch (err: any) {
						return new Response(
							JSON.stringify({
								success: false,
								error: err?.message || "Checkout error",
							}),
							{ status: 500, headers: { "content-type": "application/json" } },
						);
					}
				}
			}

			if (url.pathname === "/api/payments/webhook") {
				if (request.method === "GET") {
					return new Response(
						JSON.stringify({
							status: "online",
							gateway: "Mayar Payment Gateway",
							endpoint: "/api/payments/webhook",
						}),
						{
							status: 200,
							headers: { "content-type": "application/json" },
						},
					);
				}

				if (request.method === "POST") {
					try {
						const webhookToken = (process.env.MAYAR_WEBHOOK_TOKEN || "").trim();
						const authHeader =
							request.headers.get("x-mayar-token") ||
							request.headers.get("authorization") ||
							"";
						if (webhookToken) {
							const isTokenMatch =
								authHeader === webhookToken ||
								authHeader === `Bearer ${webhookToken}` ||
								authHeader.endsWith(webhookToken);
							if (!authHeader || !isTokenMatch) {
								return new Response(
									JSON.stringify({ success: false, error: "Invalid webhook token" }),
									{ status: 401, headers: { "content-type": "application/json" } },
								);
							}
						}

						const payload = await request.json();
						const data = payload?.data || payload;
						const reference =
							data?.extraData?.reference ||
							data?.extraData?.orderId ||
							data?.description?.match(/\[REF:([^\]]+)\]/)?.[1] ||
							data?.reference ||
							data?.description?.match(/INV-\d+-[A-Z]+/)?.[0] ||
							data?.order_id ||
							data?.orderId ||
							data?.id;
						const status = (
							data?.status ||
							payload?.event ||
							"paid"
						).toLowerCase();

						if (
							reference &&
							(status === "paid" ||
								status === "success" ||
								status === "settlement" ||
								status === "completed" ||
								status === "payment.received")
						) {
							const { verifyAndGrantEntitlement } = await import(
								"./server/purchases"
							);
							await verifyAndGrantEntitlement(reference, payload, true);
						}

						return new Response(
							JSON.stringify({
								success: true,
								message: "Mayar webhook processed successfully",
								reference,
								status,
							}),
							{
								status: 200,
								headers: { "content-type": "application/json" },
							},
						);
					} catch (e: any) {
						return new Response(
							JSON.stringify({
								success: false,
								error: e?.message || "Invalid payload",
							}),
							{ status: 400, headers: { "content-type": "application/json" } },
						);
					}
				}
			}

			if (url.pathname === "/api/auth/webhook") {
				if (request.method === "GET") {
					return new Response(
						JSON.stringify({
							status: "online",
							service: "Neon Auth Webhook",
							endpoint: "/api/auth/webhook",
						}),
						{ status: 200, headers: { "content-type": "application/json" } },
					);
				}

				if (request.method === "POST") {
					try {
						const payload = await request.json();
						const event = payload?.event || payload?.type || "unknown";
						const user = payload?.data?.user || payload?.data || payload?.user;

						if (user && user.email) {
							const { sql } = await import("./lib/db/client");
							const cleanEmail = String(user.email).trim().toLowerCase();
							const isMasterAdmin = cleanEmail === "eka.ckp16799@gmail.com";
							const role = isMasterAdmin ? "admin" : "user";
							const tier = isMasterAdmin ? "Owner Super Admin" : "Free";
							const userName = user.name || cleanEmail.split("@")[0];

							await sql`
								INSERT INTO "users" ("id", "name", "email", "role", "tier", "avatar", "created_at", "updated_at")
								VALUES (
									${user.id || 'usr_' + Date.now()},
									${userName},
									${cleanEmail},
									${role},
									${tier},
									${user.image || null},
									now(),
									now()
								)
								ON CONFLICT ("email") DO UPDATE 
								SET "name" = EXCLUDED."name",
									"avatar" = COALESCE(EXCLUDED."avatar", "users"."avatar"),
									"updated_at" = now();
							`;
						}

						return new Response(
							JSON.stringify({
								success: true,
								message: "Auth webhook processed successfully",
								event,
							}),
							{ status: 200, headers: { "content-type": "application/json" } },
						);
					} catch (err: any) {
						return new Response(
							JSON.stringify({
								success: false,
								error: err?.message || "Webhook error",
							}),
							{ status: 400, headers: { "content-type": "application/json" } },
						);
					}
				}
			}

			const handler = await getServerEntry();
			const response = await handler.fetch(request, env, ctx);
			return await normalizeCatastrophicSsrResponse(response);
		} catch (error) {
			console.error(error);
			return new Response(renderErrorPage(error), {
				status: 500,
				headers: { "content-type": "text/html; charset=utf-8" },
			});
		}
	},
};
