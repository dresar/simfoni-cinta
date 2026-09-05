import { db } from "@/lib/db/client";
import { rsvps, orders, guests, users, templatePurchases } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { generatePaymentLink } from "@/lib/mayar";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";

export async function getRsvps(slug?: string) {
	if (slug) {
		return cached(`api:rsvps:${slug}`, 15, () =>
			db.select().from(rsvps).where(eq(rsvps.slug, slug)),
		);
	}
	return cached("api:rsvps:all", 15, () => db.select().from(rsvps));
}

export async function createRsvp(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			guest: z.string(),
			slug: z.string(),
			attendance: z.enum(["Hadir", "Ragu", "Tidak Hadir"]),
			pax: z.number().default(1),
			message: z.string().default(""),
			time: z.string(),
		})
		.parse(body);
	await db.insert(rsvps).values(data);
	await invalidate("api:rsvps");
	if (data.slug) {
		await invalidate(`api:rsvps:${data.slug}`);
	}
	return data;
}

export async function deleteRsvp(id: string) {
	await db.delete(rsvps).where(eq(rsvps.id, id));
	await invalidate("api:rsvps");
}

export async function getOrders() {
	return cached("api:orders", 15, async () => {
		const [rawOrders, rawPurchases] = await Promise.all([
			db.select().from(orders),
			db.select().from(templatePurchases),
		]);

		const convertedPurchases = rawPurchases.map((p) => ({
			id: p.id,
			customer: p.userId,
			email: p.userId.includes("@") ? p.userId : `${p.userId}@customer.id`,
			plan: (p.tier === "Platinum" ? "Platinum" : "Gold") as "Gold" | "Platinum",
			amount: p.amount,
			method: "Mayar QRIS",
			status: (p.status === "paid"
				? "Lunas"
				: p.status === "pending"
					? "Menunggu"
					: "Kadaluarsa") as "Lunas" | "Menunggu" | "Kadaluarsa",
			date: p.createdAt
				? new Date(p.createdAt).toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
		}));

		const existingIds = new Set(rawOrders.map((o) => o.id));
		const uniquePurchases = convertedPurchases.filter(
			(p) => !existingIds.has(p.id),
		);

		return [...uniquePurchases, ...rawOrders];
	});
}

export async function createOrder(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			customer: z.string(),
			email: z.string(),
			plan: z.enum(["Gold", "Platinum"]),
			amount: z.number(),
			method: z.string(),
			status: z.enum(["Lunas", "Menunggu", "Kadaluarsa"]).default("Menunggu"),
			date: z.string(),
		})
		.parse(body);

	const paymentLink = await generatePaymentLink(
		data.id,
		data.amount,
		data.plan,
	);

	await db.insert(orders).values(data);
	await invalidate("api:orders");
	return { ...data, paymentLink };
}


export async function updateOrder(id: string, body: unknown) {
	const data = z
		.object({
			status: z.enum(["Lunas", "Menunggu", "Kadaluarsa"]).optional(),
		})
		.parse(body);
	await db.update(orders).set(data).where(eq(orders.id, id));
	await invalidate("api:orders");
	return data;
}

export async function getGuests(params?: {
	ownerId?: string;
	invitationId?: string;
}) {
	const cacheKey = `api:guests:${params?.ownerId || "all"}:${params?.invitationId || "all"}`;
	return cached(cacheKey, 15, async () => {
		if (params?.invitationId && params?.ownerId) {
			return await db
				.select()
				.from(guests)
				.where(
					and(
						eq(guests.invitationId, params.invitationId),
						eq(guests.ownerId, params.ownerId),
					),
				);
		}
		if (params?.invitationId) {
			return await db
				.select()
				.from(guests)
				.where(eq(guests.invitationId, params.invitationId));
		}
		if (params?.ownerId) {
			return await db
				.select()
				.from(guests)
				.where(eq(guests.ownerId, params.ownerId));
		}
		return await db.select().from(guests);
	});
}

export async function createGuest(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			name: z.string().min(1),
			category: z.string().default("Keluarga"),
			phone: z.string().default(""),
			pax: z.number().default(1),
			sent: z.boolean().default(false),
			invitationId: z.string().default(""),
			ownerId: z.string().default(""),
		})
		.parse(body);

	if (data.ownerId) {
		let userList = await db
			.select()
			.from(users)
			.where(eq(users.id, data.ownerId));
		if (userList.length === 0) {
			userList = await db
				.select()
				.from(users)
				.where(eq(users.email, data.ownerId));
		}
		const userId = userList[0]?.id || data.ownerId;
		const userPurchases = await db
			.select()
			.from(templatePurchases)
			.where(
				and(
					or(
						eq(templatePurchases.userId, userId),
						eq(templatePurchases.userId, data.ownerId),
					),
					eq(templatePurchases.status, "paid"),
				),
			);

		let userTier = userList[0]?.tier || "";
		if (
			userPurchases.some(
				(p) =>
					p.tier === "Platinum" ||
					p.packageId === "platinum" ||
					(p.templateName || "").toLowerCase().includes("platinum"),
			)
		) {
			userTier = "Platinum";
		} else if (
			userPurchases.some(
				(p) =>
					p.tier === "Gold" ||
					p.packageId === "gold" ||
					(p.templateName || "").toLowerCase().includes("gold"),
			)
		) {
			userTier = "Gold";
		} else if (
			userPurchases.some(
				(p) =>
					p.tier === "Silver" ||
					p.packageId === "silver" ||
					(p.templateName || "").toLowerCase().includes("silver"),
			)
		) {
			userTier = "Silver";
		}

		const isMasterAdmin =
			userList[0]?.role === "admin" ||
			data.ownerId.toLowerCase() === "eka.ckp16799@gmail.com";

		const maxAllowed =
			isMasterAdmin || userTier === "Platinum" || userTier === "Owner"
				? 999999
				: userTier === "Gold"
					? 100
					: userTier === "Silver"
						? 50
						: 0;

		if (maxAllowed === 0) {
			throw new Error("Silakan beli paket undangan (Silver, Gold, atau Platinum) terlebih dahulu untuk menambah tamu.");
		}

		const currentGuests = await db
			.select()
			.from(guests)
			.where(
				or(
					eq(guests.ownerId, data.ownerId),
					userList[0]?.id ? eq(guests.ownerId, userList[0].id) : undefined,
				),
			);

		if (currentGuests.length >= maxAllowed) {
			throw new Error(
				`Batas kuota tamu untuk paket ${userTier} adalah maksimal ${maxAllowed} tamu.`,
			);
		}
	}

	await db.insert(guests).values(data);
	await invalidate("api:guests");
	return data;
}

export async function updateGuest(id: string, body: unknown) {
	const data = z
		.object({
			name: z.string().optional(),
			category: z.string().optional(),
			phone: z.string().optional(),
			sent: z.boolean().optional(),
			pax: z.number().optional(),
		})
		.parse(body);
	await db.update(guests).set(data).where(eq(guests.id, id));
	await invalidate("api:guests");
	return data;
}

export async function deleteGuest(id: string) {
	await db.delete(guests).where(eq(guests.id, id));
	await invalidate("api:guests");
}
