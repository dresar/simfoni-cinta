import { db } from "@/lib/db/client";
import { invitations, users, entitlements } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import {
	getAvailableEntitlementForTemplate,
	consumeEntitlement,
} from "@/server/entitlements";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";

const KEY = "api:invitations";
const ENTITLEMENTS_KEY = "api:entitlements";

const CreateSchema = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string().min(1),
	groom: z.string().optional().default(""),
	groomNick: z.string().optional().default(""),
	groomParents: z.string().optional().default(""),
	groomPhoto: z.string().optional().default(""),
	bride: z.string().optional().default(""),
	brideNick: z.string().optional().default(""),
	brideParents: z.string().optional().default(""),
	bridePhoto: z.string().optional().default(""),
	template: z.string(),
	status: z.enum(["Aktif", "Draf"]).default("Draf"),
	views: z.number().default(0),
	date: z.string(),
	akadTime: z.string().optional().default("08:00 - 10:00 WIB"),
	resepsiTime: z.string().optional().default("11:00 - 14:00 WIB"),
	venueName: z.string().optional().default(""),
	venueAddress: z.string().optional().default(""),
	mapsUrl: z.string().optional().default(""),
	bankName: z.string().optional().default("BCA"),
	bankAccount: z.string().optional().default(""),
	accountHolder: z.string().optional().default(""),
	musicTitle: z.string().optional().default("A Thousand Years — Christina Perri"),
	story: z.string().optional().default(""),
	gallery: z.string().optional().default("[]"),
	ownerId: z.string(),
	liveUrl: z.string().optional().default(""),
	buyerNotes: z.string().optional().default(""),
	adminNotes: z.string().optional().default(""),
	packageTier: z.string().optional().default("Silver"),
	entitlementId: z.string().optional(),
	externalBuilderId: z.string().optional(),
	externalBuilderUrl: z.string().optional(),
	sacredTextId: z.string().optional().default(""),
	sacredTextTitle: z.string().optional().default(""),
	sacredTextContent: z.string().optional().default(""),
	quoteId: z.string().optional().default(""),
	quoteText: z.string().optional().default(""),
	quoteAuthor: z.string().optional().default(""),
	prayerId: z.string().optional().default(""),
	prayerTitle: z.string().optional().default(""),
	prayerContent: z.string().optional().default(""),
});

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 60);
}

export async function generateUniqueSlug(base: string): Promise<string> {
	const root = slugify(base) || "undangan";
	let candidate = root;
	let counter = 1;
	while (true) {
		const rows = await db
			.select({ id: invitations.id })
			.from(invitations)
			.where(eq(invitations.slug, candidate));
		if (rows.length === 0) return candidate;
		candidate = `${root}-${counter}`;
		counter++;
	}
}

export async function ensureUserId(ownerIdentifier: string, name?: string): Promise<string> {
	const clean = (ownerIdentifier || "").trim().toLowerCase();
	if (!clean) {
		throw new Error("Owner ID atau Email tidak valid.");
	}

	const existingById = await db
		.select()
		.from(users)
		.where(eq(users.id, ownerIdentifier));
	if (existingById.length > 0) {
		return existingById[0].id;
	}

	const existingByEmail = await db
		.select()
		.from(users)
		.where(eq(users.email, clean));
	if (existingByEmail.length > 0) {
		return existingByEmail[0].id;
	}

	const newUserId = `u-${Date.now().toString(36)}`;
	const isMasterAdmin = clean === "eka.ckp16799@gmail.com";
	await db.insert(users).values({
		id: newUserId,
		name: name || clean.split("@")[0] || "Pengguna",
		email: clean,
		role: isMasterAdmin ? "admin" : "user",
		tier: isMasterAdmin ? "Owner" : "Free",
		invitations: 0,
		quota: 0,
		status: "Aktif",
		joined: new Date().toISOString().split("T")[0],
	});
	return newUserId;
}

export async function getInvitations() {
	return cached(KEY, 60, async () => {
		const rows = await db
			.select({
				invitation: invitations,
				owner: {
					name: users.name,
					email: users.email,
				},
			})
			.from(invitations)
			.leftJoin(users, eq(invitations.ownerId, users.id));

		return rows.map((r) => ({
			...r.invitation,
			ownerName: r.owner?.name || r.owner?.email || r.invitation.groom || "Pengguna",
		}));
	});
}

export async function getUserInvitations(ownerIdentifier: string) {
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
				.from(invitations)
				.where(eq(invitations.ownerId, idsArray[0]));
		}

		return await db
			.select()
			.from(invitations)
			.where(or(...idsArray.map((id) => eq(invitations.ownerId, id))));
	} catch {
		return [];
	}
}

export async function getInvitationById(id: string) {
	const rows = await db
		.select()
		.from(invitations)
		.where(eq(invitations.id, id));
	return rows[0] ?? null;
}

export async function getInvitationByIdForOwner(
	id: string,
	ownerIdentifier: string,
) {
	const clean = (ownerIdentifier || "").trim().toLowerCase();
	if (clean === "eka.ckp16799@gmail.com") {
		return getInvitationById(id);
	}
	const list = await getUserInvitations(ownerIdentifier);
	return list.find((item) => item.id === id) ?? null;
}


export async function createInvitation(body: unknown) {
	const data = CreateSchema.parse(body);
	const resolvedOwnerId = await ensureUserId(data.ownerId);

	await db.insert(invitations).values({
		id: data.id,
		slug: data.slug,
		title: data.title,
		groom: data.groom,
		groomNick: data.groomNick,
		groomParents: data.groomParents,
		bride: data.bride,
		brideNick: data.brideNick,
		brideParents: data.brideParents,
		template: data.template,
		status: data.status,
		views: data.views,
		date: data.date,
		akadTime: data.akadTime,
		resepsiTime: data.resepsiTime,
		venueName: data.venueName,
		venueAddress: data.venueAddress,
		mapsUrl: data.mapsUrl,
		bankName: data.bankName,
		bankAccount: data.bankAccount,
		accountHolder: data.accountHolder,
		musicTitle: data.musicTitle,
		story: data.story,
		ownerId: resolvedOwnerId,
		liveUrl: data.liveUrl ?? "",
		buyerNotes: data.buyerNotes ?? "",
		adminNotes: data.adminNotes ?? "",
		packageTier: data.packageTier ?? "Silver",
		entitlementId: data.entitlementId ?? null,
		externalBuilderId: data.externalBuilderId ?? null,
		externalBuilderUrl: data.externalBuilderUrl ?? null,
		sacredTextId: data.sacredTextId ?? "",
		sacredTextTitle: data.sacredTextTitle ?? "",
		sacredTextContent: data.sacredTextContent ?? "",
		quoteId: data.quoteId ?? "",
		quoteText: data.quoteText ?? "",
		quoteAuthor: data.quoteAuthor ?? "",
		prayerId: data.prayerId ?? "",
		prayerTitle: data.prayerTitle ?? "",
		prayerContent: data.prayerContent ?? "",
	});
	await invalidate(KEY);
	return { ...data, ownerId: resolvedOwnerId };
}

export async function createInvitationWithEntitlement(body: unknown) {
	const data = CreateSchema.parse(body);
	const resolvedOwnerId = await ensureUserId(data.ownerId);

	let targetEntitlementId = data.entitlementId;

	if (!targetEntitlementId) {
		const available = await getAvailableEntitlementForTemplate(
			resolvedOwnerId,
			data.template,
		);

		if (!available) {
			throw new Error(
				"Anda tidak memiliki hak akses template yang tersedia. Silakan beli template terlebih dahulu.",
			);
		}
		targetEntitlementId = available.id;
	} else {
		const checked = await db
			.select()
			.from(entitlements)
			.where(
				and(
					eq(entitlements.id, targetEntitlementId),
					eq(entitlements.userId, resolvedOwnerId),
					eq(entitlements.status, "available"),
				),
			)
			.limit(1);

		if (checked.length === 0) {
			throw new Error(
				"Hak akses template ini sudah digunakan atau tidak valid.",
			);
		}
	}

	await consumeEntitlement(targetEntitlementId);

	const builderUrl = data.externalBuilderUrl || "";

	await db.insert(invitations).values({
		id: data.id,
		slug: data.slug,
		title: data.title,
		groom: data.groom,
		groomNick: data.groomNick,
		groomParents: data.groomParents,
		groomPhoto: data.groomPhoto,
		bride: data.bride,
		brideNick: data.brideNick,
		brideParents: data.brideParents,
		bridePhoto: data.bridePhoto,
		template: data.template,
		status: data.status,
		views: data.views,
		date: data.date,
		akadTime: data.akadTime,
		resepsiTime: data.resepsiTime,
		venueName: data.venueName,
		venueAddress: data.venueAddress,
		mapsUrl: data.mapsUrl,
		bankName: data.bankName,
		bankAccount: data.bankAccount,
		accountHolder: data.accountHolder,
		musicTitle: data.musicTitle,
		story: data.story,
		gallery: data.gallery,
		ownerId: resolvedOwnerId,
		liveUrl: data.liveUrl || builderUrl,
		buyerNotes: data.buyerNotes ?? "",
		adminNotes: data.adminNotes ?? "",
		packageTier: data.packageTier ?? "Silver",
		entitlementId: targetEntitlementId,
		externalBuilderId: data.externalBuilderId || null,
		externalBuilderUrl: builderUrl || null,
		sacredTextId: data.sacredTextId ?? "",
		sacredTextTitle: data.sacredTextTitle ?? "",
		sacredTextContent: data.sacredTextContent ?? "",
		quoteId: data.quoteId ?? "",
		quoteText: data.quoteText ?? "",
		quoteAuthor: data.quoteAuthor ?? "",
		prayerId: data.prayerId ?? "",
		prayerTitle: data.prayerTitle ?? "",
		prayerContent: data.prayerContent ?? "",
	});

	await invalidate(KEY);
	await invalidate(ENTITLEMENTS_KEY);

	return {
		...data,
		ownerId: resolvedOwnerId,
		entitlementId: targetEntitlementId,
		liveUrl: builderUrl,
	};
}

export async function updateInvitation(
	id: string,
	body: unknown,
	ownerIdentifier?: string,
) {
	if (ownerIdentifier) {
		const inv = await getInvitationByIdForOwner(id, ownerIdentifier);
		if (!inv) {
			throw new Error(
				"Akses ditolak: Undangan tidak ditemukan atau bukan milik Anda.",
			);
		}
	}
	const data = CreateSchema.partial().parse(body);
	const patch: any = {};
	if (data.title !== undefined) patch.title = data.title;
	if (data.groom !== undefined) patch.groom = data.groom;
	if (data.groomNick !== undefined) patch.groomNick = data.groomNick;
	if (data.groomParents !== undefined) patch.groomParents = data.groomParents;
	if (data.groomPhoto !== undefined) patch.groomPhoto = data.groomPhoto;
	if (data.bride !== undefined) patch.bride = data.bride;
	if (data.brideNick !== undefined) patch.brideNick = data.brideNick;
	if (data.brideParents !== undefined) patch.brideParents = data.brideParents;
	if (data.bridePhoto !== undefined) patch.bridePhoto = data.bridePhoto;
	if (data.date !== undefined) patch.date = data.date;
	if (data.status !== undefined) patch.status = data.status;
	if (data.liveUrl !== undefined) patch.liveUrl = data.liveUrl;
	if (data.template !== undefined) patch.template = data.template;
	if (data.akadTime !== undefined) patch.akadTime = data.akadTime;
	if (data.resepsiTime !== undefined) patch.resepsiTime = data.resepsiTime;
	if (data.venueName !== undefined) patch.venueName = data.venueName;
	if (data.venueAddress !== undefined) patch.venueAddress = data.venueAddress;
	if (data.mapsUrl !== undefined) patch.mapsUrl = data.mapsUrl;
	if (data.bankName !== undefined) patch.bankName = data.bankName;
	if (data.bankAccount !== undefined) patch.bankAccount = data.bankAccount;
	if (data.accountHolder !== undefined) patch.accountHolder = data.accountHolder;
	if (data.musicTitle !== undefined) patch.musicTitle = data.musicTitle;
	if (data.story !== undefined) patch.story = data.story;
	if (data.gallery !== undefined) patch.gallery = data.gallery;
	if (data.buyerNotes !== undefined) patch.buyerNotes = data.buyerNotes;
	if (data.adminNotes !== undefined) patch.adminNotes = data.adminNotes;
	if (data.packageTier !== undefined) patch.packageTier = data.packageTier;
	if (data.externalBuilderId !== undefined)
		patch.externalBuilderId = data.externalBuilderId;
	if (data.externalBuilderUrl !== undefined)
		patch.externalBuilderUrl = data.externalBuilderUrl;
	if (data.sacredTextId !== undefined) patch.sacredTextId = data.sacredTextId;
	if (data.sacredTextTitle !== undefined) patch.sacredTextTitle = data.sacredTextTitle;
	if (data.sacredTextContent !== undefined) patch.sacredTextContent = data.sacredTextContent;
	if (data.quoteId !== undefined) patch.quoteId = data.quoteId;
	if (data.quoteText !== undefined) patch.quoteText = data.quoteText;
	if (data.quoteAuthor !== undefined) patch.quoteAuthor = data.quoteAuthor;
	if (data.prayerId !== undefined) patch.prayerId = data.prayerId;
	if (data.prayerTitle !== undefined) patch.prayerTitle = data.prayerTitle;
	if (data.prayerContent !== undefined) patch.prayerContent = data.prayerContent;
	await db.update(invitations).set(patch).where(eq(invitations.id, id));
	await invalidate(KEY);
	return data;
}

export async function deleteInvitation(id: string) {
	await db.delete(invitations).where(eq(invitations.id, id));
	await invalidate(KEY);
}

export async function deleteInvitationForOwner(
	id: string,
	ownerIdentifier: string,
) {
	const inv = await getInvitationByIdForOwner(id, ownerIdentifier);
	if (!inv) throw new Error("Undangan tidak ditemukan atau bukan milik Anda.");
	await db.delete(invitations).where(eq(invitations.id, id));
	await invalidate(KEY);
}

export async function slugAvailable(slug: string): Promise<boolean> {
	const rows = await db
		.select({ id: invitations.id })
		.from(invitations)
		.where(eq(invitations.slug, slug));
	return rows.length === 0;
}
