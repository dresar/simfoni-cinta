import { db } from "@/lib/db/client";
import { entitlements, users } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { eq, and, or } from "drizzle-orm";

const ENTITLEMENTS_KEY = "api:entitlements";

export async function getUserEntitlements(ownerIdentifier: string) {
	if (!ownerIdentifier) return [];
	try {
		const clean = ownerIdentifier.trim().toLowerCase();

		const userRows = await db
			.select()
			.from(users)
			.where(or(eq(users.id, ownerIdentifier), eq(users.email, clean)));

		const possibleIds = new Set<string>([ownerIdentifier, clean]);
		for (const u of userRows) {
			possibleIds.add(u.id);
			possibleIds.add(u.email);
		}

		const idsArray = Array.from(possibleIds);
		if (idsArray.length === 1) {
			return await db
				.select()
				.from(entitlements)
				.where(eq(entitlements.userId, idsArray[0]))
				.orderBy(entitlements.createdAt);
		}

		return await db
			.select()
			.from(entitlements)
			.where(or(...idsArray.map((id) => eq(entitlements.userId, id))))
			.orderBy(entitlements.createdAt);
	} catch {
		return [];
	}
}

export async function getAvailableEntitlementCount(ownerIdentifier: string) {
	const list = await getUserEntitlements(ownerIdentifier);
	return list.filter((e) => e.status === "available").length;
}

export async function getAvailableEntitlementForTemplate(
	ownerIdentifier: string,
	templateId?: string,
) {
	const list = await getUserEntitlements(ownerIdentifier);
	const available = list.filter((e) => e.status === "available");
	if (!templateId) return available[0] ?? null;
	return (
		available.find((e) => e.templateId === templateId) ?? available[0] ?? null
	);
}

export async function getEntitlementsByUserId(userId: string) {
	if (!userId) return [];
	return cached(ENTITLEMENTS_KEY, 60, () =>
		db
			.select()
			.from(entitlements)
			.where(eq(entitlements.userId, userId))
			.orderBy(entitlements.createdAt),
	);
}

export async function consumeEntitlement(entitlementId: string) {
	await db
		.update(entitlements)
		.set({
			status: "used",
			usedCount: 1,
			usedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(entitlements.id, entitlementId),
				eq(entitlements.status, "available"),
			),
		);
	await invalidate(ENTITLEMENTS_KEY);
}
