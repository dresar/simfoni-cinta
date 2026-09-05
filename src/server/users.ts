import { json } from "@tanstack/react-start";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { eq } from "drizzle-orm";
import { z } from "zod";

const KEY = "api:users";

const CreateSchema = z.object({
	id: z.string(),
	name: z.string().min(2),
	email: z.string().email(),
	role: z.enum(["admin", "user"]).default("user"),
	tier: z.enum(["Free", "Gold", "Platinum", "Owner"]).default("Free"),
	invitations: z.number().default(0),
	quota: z.number().default(5),
	status: z.enum(["Aktif", "Ditangguhkan", "Diblokir"]).default("Aktif"),
	joined: z.string(),
});

export async function getUsers() {
	return cached(KEY, 60, () => db.select().from(users));
}

export async function getUserById(id: string) {
	const rows = await db.select().from(users).where(eq(users.id, id));
	return rows[0] ?? null;
}

export async function createUser(body: unknown) {
	const data = CreateSchema.parse(body);
	await db.insert(users).values(data);
	await invalidate(KEY);
	return data;
}

export async function updateUser(id: string, body: unknown) {
	const data = CreateSchema.partial().parse(body);
	await db.update(users).set(data).where(eq(users.id, id));
	await invalidate(KEY);
	return data;
}

export async function deleteUser(id: string) {
	await db.delete(users).where(eq(users.id, id));
	await invalidate(KEY);
}

const NEON_AUTH_URL =
	"https://ep-twilight-scene-az1mion0.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";

export async function initiateSocialLogin(
	provider: "google" | "github" | "vercel",
	origin?: string,
) {
	let validOrigin = (origin || process.env.NEXT_PUBLIC_APP_URL || "https://simfoni-cinta.pages.dev").trim();
	if (validOrigin.includes("127.0.0.1")) {
		validOrigin = validOrigin.replace("127.0.0.1", "localhost");
	}
	if (validOrigin.startsWith("http://simfonicinta.my.id")) {
		validOrigin = "https://simfonicinta.my.id";
	}
	if (!validOrigin.startsWith("http://localhost") && !validOrigin.startsWith("https://") && !validOrigin.startsWith("http://simfoni")) {
		validOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://simfoni-cinta.pages.dev";
	}

	const callbackURL = `${validOrigin}/login?auth=success&provider=${provider}`;

	const res = await fetch(`${NEON_AUTH_URL}/sign-in/social`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			provider,
			callbackURL,
			newUserCallbackURL: callbackURL,
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "Neon Auth error");
		throw new Error(`Neon Auth ${res.status}: ${text}`);
	}

	const data = await res.json();
	return { url: data.url as string | undefined };
}

import { sql } from "../lib/db/client";

export async function resolveLatestSession(token?: string) {
	if (!token || typeof token !== "string" || token.trim().length === 0) {
		return null;
	}

	const rows = await sql`
      SELECT s.token, u.id, u.name, u.email, u.image, s."createdAt"
      FROM "neon_auth"."session" s
      JOIN "neon_auth"."user" u ON s."userId" = u.id
      WHERE s.token = ${token.trim()} AND s."expiresAt" > NOW()
      LIMIT 1
    `;

	if (!rows || rows.length === 0) {
		return null;
	}

	const authUser = rows[0];
	const cleanEmail = (authUser.email || "").trim().toLowerCase();
	const isMasterAdmin = cleanEmail === "eka.ckp16799@gmail.com";

	let userTier = isMasterAdmin ? "Owner Super Admin" : "Free";
	try {
		const existing = await db
			.select()
			.from(users)
			.where(eq(users.email, cleanEmail));
		if (existing.length > 0) {
			const existingUser = existing[0];
			userTier = isMasterAdmin
				? "Owner Super Admin"
				: existingUser.tier || "Free";
			const updateData: Partial<typeof existingUser> = {
				name: authUser.name || existingUser.name,
			};
			if (isMasterAdmin) {
				updateData.role = "admin";
				updateData.tier = "Owner";
			}
			await db
				.update(users)
				.set(updateData)
				.where(eq(users.id, existingUser.id));
			await invalidate(KEY);
		} else {
			const newUser = {
				id: `u-${Date.now().toString(36)}`,
				name: authUser.name || cleanEmail.split("@")[0],
				email: cleanEmail,
				role: (isMasterAdmin ? "admin" : "user") as "admin" | "user",
				tier: (isMasterAdmin ? "Owner" : "Free") as
					| "Free"
					| "Gold"
					| "Platinum"
					| "Owner",
				invitations: isMasterAdmin ? 12 : 0,
				quota: isMasterAdmin ? 999 : 5,
				status: "Aktif" as "Aktif" | "Ditangguhkan" | "Diblokir",
				joined: new Date().toISOString().split("T")[0],
			};
			await db.insert(users).values(newUser);
			await invalidate(KEY);
		}
	} catch {}

	let finalAvatar = authUser.image;
	if (isMasterAdmin) {
		try {
			const settingsRows =
				await sql`SELECT data FROM "admin_settings" WHERE id = 'master'`;
			if (settingsRows[0]?.data?.adminAvatar) {
				finalAvatar = settingsRows[0].data.adminAvatar;
			}
		} catch {}
		if (!finalAvatar) {
			finalAvatar =
				"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/avatars/1788085226131-asset-4e610a02.png";
		}
	}

	return {
		name:
			authUser.name ||
			(isMasterAdmin ? "Eka Syarif Maulana" : cleanEmail.split("@")[0]),
		email: cleanEmail,
		role: isMasterAdmin ? "admin" : "user",
		tier: userTier,
		avatar: finalAvatar,
	};
}
