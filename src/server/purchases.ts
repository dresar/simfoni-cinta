import { db } from "@/lib/db/client";
import {
	templatePurchases,
	entitlements,
	payments,
	users,
} from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { createMayarPayment, checkMayarPaymentStatus } from "@/lib/mayar";
import { ensureUserId } from "@/server/invitations";
import { getAdminSettings, DEFAULT_PACKAGES } from "@/server/settings";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const PURCHASES_KEY = "api:template_purchases";
const ENTITLEMENTS_KEY = "api:entitlements";
const USERS_KEY = "api:users";

const CreatePurchaseSchema = z.object({
	userId: z.string().min(1),
	templateId: z.string().min(1),
	templateName: z.string().min(1),
	templateSlug: z.string().min(1),
	packageId: z.string().optional().default("silver"),
	tier: z.string().optional().default("Silver"),
	amount: z.number().positive(),
	customerName: z.string().min(1),
	customerEmail: z.string().email(),
});

function resolveTierTitle(pkgId: string, tierName?: string): string {
	const normalized = (pkgId || tierName || "").toLowerCase();
	if (normalized.includes("owner")) return "Owner";
	if (normalized.includes("platinum")) return "Platinum";
	if (normalized.includes("gold")) return "Gold";
	if (normalized.includes("silver")) return "Silver";
	if (normalized.includes("bronze")) return "Bronze";
	return "Silver";
}

function tierRank(tier: string): number {
	const t = tier.toLowerCase();
	if (t.includes("owner")) return 5;
	if (t.includes("platinum")) return 4;
	if (t.includes("gold")) return 3;
	if (t.includes("silver")) return 2;
	if (t.includes("bronze")) return 1;
	return 0;
}

export async function createTemplatePurchase(body: unknown, baseUrl: string) {
	const data = CreatePurchaseSchema.parse(body);
	const id = `tp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const paymentId = `pay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const validUserId = await ensureUserId(data.userId, data.customerName);
	const resolvedTier = resolveTierTitle(data.packageId, data.tier);

	const settings = await getAdminSettings();
	const matchedPkg =
		settings.packages.find((p) => p.id === data.packageId) ||
		DEFAULT_PACKAGES.find((p) => p.id === data.packageId);
	const verifiedAmount = matchedPkg ? matchedPkg.price : (data.amount > 0 ? data.amount : 15000);

	const paymentResult = await createMayarPayment({
		reference: id,
		amount: verifiedAmount,
		customerName: data.customerName,
		customerEmail: data.customerEmail,
		description: `Pembelian Template: ${data.templateName}`,
		redirectUrl: `${baseUrl}/dasbor/pembelian?status=success&orderId=${id}`,
	});

	const purchaseRecord = {
		id,
		userId: validUserId,
		templateId: data.templateId,
		templateName: data.templateName,
		templateSlug: data.templateSlug,
		packageId: data.packageId || "silver",
		tier: resolvedTier,
		amount: verifiedAmount,
		currency: "IDR" as const,
		status: "pending" as const,
		externalOrderId: paymentResult.id || null,
		paymentUrl: paymentResult.checkoutUrl || null,
	};

	const paymentRecord = {
		id: paymentId,
		orderId: id,
		provider: "mayar",
		externalPaymentId: paymentResult.id || null,
		method: "QRIS",
		amount: verifiedAmount,
		status: "pending",
		rawResponse: paymentResult,
	};

	await db.insert(templatePurchases).values(purchaseRecord);
	await db.insert(payments).values(paymentRecord);
	await invalidate(PURCHASES_KEY);

	return {
		orderId: id,
		paymentUrl: paymentResult.checkoutUrl || null,
	};
}

export async function getTemplatePurchasesByUser(userId: string) {
	if (!userId) return [];
	const validUserId = await ensureUserId(userId);
	return db
		.select()
		.from(templatePurchases)
		.where(eq(templatePurchases.userId, validUserId))
		.orderBy(templatePurchases.createdAt);
}

export async function getTemplatePurchaseById(orderId: string, userId: string) {
	const rows = await db
		.select()
		.from(templatePurchases)
		.where(
			and(
				eq(templatePurchases.id, orderId),
				eq(templatePurchases.userId, userId),
			),
		);
	return rows[0] ?? null;
}

export async function verifyAndGrantEntitlement(
	orderId: string,
	rawPayload?: unknown,
	isWebhookTrusted = false,
) {
	const purchaseRows = await db
		.select()
		.from(templatePurchases)
		.where(
			or(
				eq(templatePurchases.id, orderId),
				eq(templatePurchases.externalOrderId, orderId),
			),
		);

	if (purchaseRows.length === 0) {
		return null;
	}

	const purchaseRecord = purchaseRows[0];
	const canonicalOrderId = purchaseRecord.id;

	const existing = await db
		.select()
		.from(entitlements)
		.where(
			or(
				eq(entitlements.orderId, canonicalOrderId),
				eq(entitlements.orderId, orderId),
			),
		);

	if (existing.length > 0) {
		await invalidate(PURCHASES_KEY);
		await invalidate(ENTITLEMENTS_KEY);
		return existing[0];
	}

	if (!isWebhookTrusted && purchaseRecord.status !== "paid") {
		const checkTarget = purchaseRecord.externalOrderId || canonicalOrderId;
		const mayarStatus = await checkMayarPaymentStatus(checkTarget);
		const isConfirmedPaid =
			mayarStatus === "paid" ||
			mayarStatus === "settled" ||
			mayarStatus === "completed" ||
			mayarStatus === "success";

		if (!isConfirmedPaid) {
			return null;
		}
	}

	const updated = await db
		.update(templatePurchases)
		.set({ status: "paid", updatedAt: new Date() })
		.where(
			and(
				eq(templatePurchases.id, canonicalOrderId),
				eq(templatePurchases.status, "pending"),
			),
		)
		.returning();

	await db
		.update(payments)
		.set({
			status: "paid",
			paidAt: new Date(),
			updatedAt: new Date(),
			rawResponse: (rawPayload as any) || { verified: true },
		})
		.where(
			or(
				eq(payments.orderId, canonicalOrderId),
				eq(payments.externalPaymentId, orderId),
			),
		);

	if (updated.length === 0) {
		const existingAfter = await db
			.select()
			.from(entitlements)
			.where(
				or(
					eq(entitlements.orderId, canonicalOrderId),
					eq(entitlements.orderId, orderId),
				),
			);
		return existingAfter[0] ?? null;
	}


	const purchase = updated[0];
	const entitlementId = `ent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const newEntitlement = {
		id: entitlementId,
		userId: purchase.userId,
		templateId: purchase.templateId,
		templateName: purchase.templateName,
		packageId: purchase.packageId || "silver",
		tier: purchase.tier || "Silver",
		orderId: purchase.id,
		usageLimit: 1,
		usedCount: 0,
		status: "available" as const,
	};

	await db.insert(entitlements).values(newEntitlement);

	try {
		const userRows = await db
			.select()
			.from(users)
			.where(eq(users.id, purchase.userId));
		if (userRows.length > 0) {
			const currentUser = userRows[0];
			const currentRank = tierRank(currentUser.tier || "Free");
			const newRank = tierRank(purchase.tier || "Silver");

			if (newRank > currentRank) {
				const tierToSet =
					purchase.tier === "Owner"
						? "Owner"
						: purchase.tier === "Platinum"
							? "Platinum"
							: "Gold";
				await db
					.update(users)
					.set({ tier: tierToSet })
					.where(eq(users.id, purchase.userId));
				await invalidate(USERS_KEY);
			}
		}
	} catch {}

	await invalidate(PURCHASES_KEY);
	await invalidate(ENTITLEMENTS_KEY);

	return newEntitlement;
}
