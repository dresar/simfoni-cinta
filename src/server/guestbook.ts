import { db } from "@/lib/db/client";
import {
	guestbookEvents,
	guestCategories,
	eventGuests,
	attendanceLogs,
	guestbookMessages,
	guestbookActivityLogs,
	users,
	templatePurchases,
	entitlements,
	prayers,
} from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { ensureUserId } from "@/server/invitations";
import { eq, and, desc, sql, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";

const GUESTBOOK_CACHE_PREFIX = "api:guestbook";

export async function checkGuestbookEligibility(userEmail: string) {
	if (!userEmail) return { eligible: false, reason: "Unauthorized" };
	const validUserId = await ensureUserId(userEmail);

	const userRows = await db
		.select()
		.from(users)
		.where(eq(users.id, validUserId));
	if (userRows.length > 0) {
		const u = userRows[0];
		if (
			u.role === "admin" ||
			u.tier === "Gold" ||
			u.tier === "Platinum" ||
			u.tier === "Owner"
		) {
			return { eligible: true, tier: u.tier };
		}
	}

	const paidPurchases = await db
		.select()
		.from(templatePurchases)
		.where(
			and(
				eq(templatePurchases.userId, validUserId),
				eq(templatePurchases.status, "paid"),
			),
		);
	if (paidPurchases.length > 0) {
		return { eligible: true, tier: paidPurchases[0].tier || "Silver" };
	}

	const entRows = await db
		.select()
		.from(entitlements)
		.where(eq(entitlements.userId, validUserId));
	if (entRows.length > 0) {
		return { eligible: true, tier: entRows[0].tier || "Silver" };
	}

	return {
		eligible: false,
		reason:
			"Fitur Buku Tamu Digital memerlukan paket undangan yang aktif atau telah menyelesaikan pesanan.",
	};
}

async function logActivity({
	eventId,
	userId,
	actorName = "User",
	action,
	targetType,
	targetId,
	details = "",
}: {
	eventId: string;
	userId: string;
	actorName?: string;
	action: string;
	targetType: string;
	targetId: string;
	details?: string;
}) {
	try {
		const id = `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
		await db.insert(guestbookActivityLogs).values({
			id,
			eventId,
			userId,
			actorName,
			action,
			targetType,
			targetId,
			details,
		});
	} catch {}
}

const CreateEventSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional().default(""),
	eventDate: z.string().min(1),
	eventTime: z.string().optional().default(""),
	location: z.string().optional().default(""),
	notes: z.string().optional().default(""),
	invitationId: z.string().optional().nullable(),
	syncPrayers: z.boolean().optional().default(true),
	status: z.enum(["draft", "active", "completed", "archived"]).default("active"),
});

const DEFAULT_CATEGORIES = [
	{ name: "Keluarga Inti", color: "emerald" },
	{ name: "Keluarga Besar", color: "teal" },
	{ name: "Sahabat", color: "amber" },
	{ name: "Teman Kerja", color: "sky" },
	{ name: "VIP / Tokoh", color: "purple" },
	{ name: "Tetangga", color: "rose" },
	{ name: "Umum", color: "stone" },
];

export async function getGuestbookEvents(userEmail: string) {
	if (!userEmail) return [];
	const validUserId = await ensureUserId(userEmail);
	return await db
		.select()
		.from(guestbookEvents)
		.where(eq(guestbookEvents.userId, validUserId))
		.orderBy(desc(guestbookEvents.createdAt));
}

export async function getGuestbookEventById(eventId: string, userEmail: string) {
	if (!eventId || !userEmail) return null;
	const validUserId = await ensureUserId(userEmail);
	const rows = await db
		.select()
		.from(guestbookEvents)
		.where(
			and(
				eq(guestbookEvents.id, eventId),
				eq(guestbookEvents.userId, validUserId),
			),
		);
	return rows[0] ?? null;
}

export async function createGuestbookEvent(body: unknown, userEmail: string) {
	const validUserId = await ensureUserId(userEmail);
	const data = CreateEventSchema.parse(body);
	const eventId = `gbe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

	const newEvent = {
		id: eventId,
		userId: validUserId,
		invitationId: data.invitationId || null,
		syncPrayers: data.syncPrayers ?? true,
		title: data.title,
		description: data.description,
		eventDate: data.eventDate,
		eventTime: data.eventTime,
		location: data.location,
		notes: data.notes,
		status: data.status,
	};

	await db.insert(guestbookEvents).values(newEvent);

	for (const cat of DEFAULT_CATEGORIES) {
		const catId = `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
		await db.insert(guestCategories).values({
			id: catId,
			eventId,
			userId: validUserId,
			name: cat.name,
			color: cat.color,
			isDefault: true,
		});
	}

	await logActivity({
		eventId,
		userId: validUserId,
		action: "create_event",
		targetType: "event",
		targetId: eventId,
		details: `Membuat Buku Tamu Acara: ${data.title}`,
	});

	await invalidate(GUESTBOOK_CACHE_PREFIX);
	return newEvent;
}

export async function updateGuestbookEvent(
	eventId: string,
	body: unknown,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const data = CreateEventSchema.partial().parse(body);

	const updated = await db
		.update(guestbookEvents)
		.set({ ...data, updatedAt: new Date() })
		.where(
			and(
				eq(guestbookEvents.id, eventId),
				eq(guestbookEvents.userId, validUserId),
			),
		)
		.returning();

	if (updated.length > 0) {
		await logActivity({
			eventId,
			userId: validUserId,
			action: "update_event",
			targetType: "event",
			targetId: eventId,
			details: `Memperbarui data acara Buku Tamu`,
		});
	}

	await invalidate(GUESTBOOK_CACHE_PREFIX);
	return updated[0] ?? null;
}

export async function deleteGuestbookEvent(eventId: string, userEmail: string) {
	const validUserId = await ensureUserId(userEmail);
	await db
		.delete(guestbookEvents)
		.where(
			and(
				eq(guestbookEvents.id, eventId),
				eq(guestbookEvents.userId, validUserId),
			),
		);
	await invalidate(GUESTBOOK_CACHE_PREFIX);
	return { success: true };
}

export async function getGuestCategories(eventId: string, userEmail: string) {
	const validUserId = await ensureUserId(userEmail);
	return await db
		.select()
		.from(guestCategories)
		.where(
			and(
				eq(guestCategories.eventId, eventId),
				eq(guestCategories.userId, validUserId),
			),
		)
		.orderBy(guestCategories.createdAt);
}

export async function createGuestCategory(
	eventId: string,
	body: { name: string; color?: string },
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const id = `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const newCategory = {
		id,
		eventId,
		userId: validUserId,
		name: body.name.trim(),
		color: body.color || "emerald",
		isDefault: false,
	};
	await db.insert(guestCategories).values(newCategory);
	return newCategory;
}

export async function deleteGuestCategory(
	categoryId: string,
	eventId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	await db
		.delete(guestCategories)
		.where(
			and(
				eq(guestCategories.id, categoryId),
				eq(guestCategories.eventId, eventId),
				eq(guestCategories.userId, validUserId),
			),
		);
	return { success: true };
}

const GuestSchema = z.object({
	name: z.string().min(1),
	phone: z.string().optional().default(""),
	email: z.string().optional().default(""),
	categoryId: z.string().optional().nullable(),
	categoryName: z.string().optional().default("Keluarga"),
	tableNumber: z.string().optional().default(""),
	paxPlanned: z.number().int().min(1).default(1),
	paxActual: z.number().int().min(0).default(0),
	rsvpStatus: z
		.enum(["pending", "attending", "maybe", "not_attending"])
		.default("pending"),
	isSouvenirTaken: z.boolean().optional().default(false),
	souvenirCount: z.number().int().min(0).default(0),
	notes: z.string().optional().default(""),
});

export async function getEventGuests(
	eventId: string,
	userEmail: string,
	filters?: {
		search?: string;
		categoryId?: string;
		rsvpStatus?: string;
		isAttended?: boolean;
	},
) {
	const validUserId = await ensureUserId(userEmail);
	const conditions = [
		eq(eventGuests.eventId, eventId),
		eq(eventGuests.userId, validUserId),
	];

	if (filters?.categoryId && filters.categoryId !== "all") {
		conditions.push(eq(eventGuests.categoryId, filters.categoryId));
	}
	if (filters?.rsvpStatus && filters.rsvpStatus !== "all") {
		conditions.push(
			eq(
				eventGuests.rsvpStatus,
				filters.rsvpStatus as "pending" | "attending" | "maybe" | "not_attending",
			),
		);
	}
	if (filters?.isAttended !== undefined) {
		conditions.push(eq(eventGuests.isAttended, filters.isAttended));
	}
	if (filters?.search && filters.search.trim() !== "") {
		const q = `%${filters.search.trim()}%`;
		conditions.push(
			or(
				ilike(eventGuests.name, q),
				ilike(eventGuests.phone, q),
				ilike(eventGuests.tableNumber, q),
			)!,
		);
	}

	return await db
		.select()
		.from(eventGuests)
		.where(and(...conditions))
		.orderBy(desc(eventGuests.createdAt));
}

export async function getGuestDetail(
	guestId: string,
	eventId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const guestRows = await db
		.select()
		.from(eventGuests)
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		);

	if (guestRows.length === 0) return null;
	const guest = guestRows[0];

	const logs = await db
		.select()
		.from(attendanceLogs)
		.where(
			and(
				eq(attendanceLogs.guestId, guestId),
				eq(attendanceLogs.eventId, eventId),
			),
		)
		.orderBy(desc(attendanceLogs.recordedAt));

	const messages = await db
		.select()
		.from(guestbookMessages)
		.where(
			and(
				eq(guestbookMessages.guestId, guestId),
				eq(guestbookMessages.eventId, eventId),
			),
		)
		.orderBy(desc(guestbookMessages.createdAt));

	const activity = await db
		.select()
		.from(guestbookActivityLogs)
		.where(
			and(
				eq(guestbookActivityLogs.targetId, guestId),
				eq(guestbookActivityLogs.eventId, eventId),
			),
		)
		.orderBy(desc(guestbookActivityLogs.createdAt));

	return {
		guest,
		attendanceLogs: logs,
		messages,
		activity,
	};
}

export async function createGuest(
	eventId: string,
	body: unknown,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const data = GuestSchema.parse(body);
	const id = `gst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

	const newGuest = {
		id,
		eventId,
		userId: validUserId,
		name: data.name.trim(),
		phone: data.phone?.trim() || "",
		email: data.email?.trim() || "",
		categoryId: data.categoryId || null,
		categoryName: data.categoryName || "Keluarga",
		tableNumber: data.tableNumber?.trim() || "",
		paxPlanned: data.paxPlanned || 1,
		paxActual: 0,
		rsvpStatus: data.rsvpStatus,
		isAttended: false,
		isSouvenirTaken: false,
		souvenirCount: 0,
		notes: data.notes || "",
	};

	await db.insert(eventGuests).values(newGuest);

	await logActivity({
		eventId,
		userId: validUserId,
		action: "create_guest",
		targetType: "guest",
		targetId: id,
		details: `Menambahkan tamu: ${data.name} (${data.categoryName}, Meja: ${data.tableNumber || "-"})`,
	});

	return newGuest;
}

export async function updateGuest(
	guestId: string,
	eventId: string,
	body: unknown,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const data = GuestSchema.partial().parse(body);

	const updated = await db
		.update(eventGuests)
		.set({ ...data, updatedAt: new Date() })
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	if (updated.length > 0) {
		await logActivity({
			eventId,
			userId: validUserId,
			action: "update_guest",
			targetType: "guest",
			targetId: guestId,
			details: `Memperbarui data tamu: ${updated[0].name}`,
		});
	}

	return updated[0] ?? null;
}

export async function deleteGuest(
	guestId: string,
	eventId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const existing = await db
		.select()
		.from(eventGuests)
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		);

	await db
		.delete(eventGuests)
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		);

	if (existing.length > 0) {
		await logActivity({
			eventId,
			userId: validUserId,
			action: "delete_guest",
			targetType: "guest",
			targetId: guestId,
			details: `Menghapus tamu: ${existing[0].name}`,
		});
	}

	return { success: true };
}

export async function toggleGuestSouvenir(
	eventId: string,
	guestId: string,
	isTaken: boolean,
	count: number,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const resolvedCount = isTaken ? Math.max(1, count || 1) : 0;

	const updated = await db
		.update(eventGuests)
		.set({
			isSouvenirTaken: isTaken,
			souvenirCount: resolvedCount,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	if (updated.length > 0) {
		await logActivity({
			eventId,
			userId: validUserId,
			action: "update_souvenir",
			targetType: "guest",
			targetId: guestId,
			details: `${updated[0].name}: Souvenir ${isTaken ? `Diambil (${resolvedCount} Pcs)` : "Dibatalkan"}`,
		});
	}

	return updated[0] ?? null;
}

export async function bulkUpdateGuests(
	eventId: string,
	guestIds: string[],
	updates: {
		categoryId?: string;
		categoryName?: string;
		tableNumber?: string;
		rsvpStatus?: "pending" | "attending" | "maybe" | "not_attending";
		isSouvenirTaken?: boolean;
	},
	userEmail: string,
) {
	if (!guestIds || guestIds.length === 0) return { updatedCount: 0 };
	const validUserId = await ensureUserId(userEmail);

	const patch: Record<string, any> = { updatedAt: new Date() };
	if (updates.categoryId !== undefined) patch.categoryId = updates.categoryId;
	if (updates.categoryName !== undefined)
		patch.categoryName = updates.categoryName;
	if (updates.tableNumber !== undefined)
		patch.tableNumber = updates.tableNumber;
	if (updates.rsvpStatus !== undefined) patch.rsvpStatus = updates.rsvpStatus;
	if (updates.isSouvenirTaken !== undefined) {
		patch.isSouvenirTaken = updates.isSouvenirTaken;
		patch.souvenirCount = updates.isSouvenirTaken ? 1 : 0;
	}

	const updated = await db
		.update(eventGuests)
		.set(patch)
		.where(
			and(
				inArray(eventGuests.id, guestIds),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	await logActivity({
		eventId,
		userId: validUserId,
		action: "bulk_update_guests",
		targetType: "guest",
		targetId: eventId,
		details: `Memperbarui ${updated.length} tamu sekaligus (Bulk Action)`,
	});

	return { updatedCount: updated.length };
}

export async function bulkDeleteGuests(
	eventId: string,
	guestIds: string[],
	userEmail: string,
) {
	if (!guestIds || guestIds.length === 0) return { deletedCount: 0 };
	const validUserId = await ensureUserId(userEmail);

	const deleted = await db
		.delete(eventGuests)
		.where(
			and(
				inArray(eventGuests.id, guestIds),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	await logActivity({
		eventId,
		userId: validUserId,
		action: "bulk_delete_guests",
		targetType: "guest",
		targetId: eventId,
		details: `Menghapus ${deleted.length} tamu sekaligus (Bulk Action)`,
	});

	return { deletedCount: deleted.length };
}

export async function recordAttendance(
	eventId: string,
	guestId: string,
	body: { paxActual: number; recordedBy?: string; notes?: string },
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const now = new Date();
	const pax = Math.max(1, body.paxActual || 1);
	const recorder = body.recordedBy || "Petugas";

	const updated = await db
		.update(eventGuests)
		.set({
			isAttended: true,
			attendedAt: now,
			paxActual: pax,
			attendedBy: recorder,
			updatedAt: now,
		})
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	if (updated.length === 0) throw new Error("Tamu tidak ditemukan.");

	const logId = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	await db.insert(attendanceLogs).values({
		id: logId,
		eventId,
		guestId,
		userId: validUserId,
		paxActual: pax,
		actionType: "check_in",
		recordedBy: recorder,
		notes: body.notes || "Check-in kehadiran manual",
		recordedAt: now,
	});

	await logActivity({
		eventId,
		userId: validUserId,
		actorName: recorder,
		action: "check_in",
		targetType: "guest",
		targetId: guestId,
		details: `Pencatatan Kehadiran: ${updated[0].name} (${pax} Pax)`,
	});

	return updated[0];
}

export async function updateAttendancePax(
	eventId: string,
	guestId: string,
	paxActual: number,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const now = new Date();
	const pax = Math.max(1, paxActual);

	const updated = await db
		.update(eventGuests)
		.set({
			paxActual: pax,
			updatedAt: now,
		})
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	if (updated.length === 0) throw new Error("Tamu tidak ditemukan.");

	const logId = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	await db.insert(attendanceLogs).values({
		id: logId,
		eventId,
		guestId,
		userId: validUserId,
		paxActual: pax,
		actionType: "update_pax",
		recordedBy: "Petugas",
		notes: `Koreksi jumlah pax menjadi ${pax}`,
		recordedAt: now,
	});

	await logActivity({
		eventId,
		userId: validUserId,
		action: "update_pax",
		targetType: "guest",
		targetId: guestId,
		details: `Memperbarui pax aktual: ${updated[0].name} -> ${pax} Pax`,
	});

	return updated[0];
}

export async function cancelAttendance(
	eventId: string,
	guestId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const now = new Date();

	const updated = await db
		.update(eventGuests)
		.set({
			isAttended: false,
			attendedAt: null,
			paxActual: 0,
			attendedBy: "",
			updatedAt: now,
		})
		.where(
			and(
				eq(eventGuests.id, guestId),
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		)
		.returning();

	if (updated.length === 0) throw new Error("Tamu tidak ditemukan.");

	const logId = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	await db.insert(attendanceLogs).values({
		id: logId,
		eventId,
		guestId,
		userId: validUserId,
		paxActual: 0,
		actionType: "cancel_check_in",
		recordedBy: "Petugas",
		notes: "Pembatalan kehadiran oleh petugas",
		recordedAt: now,
	});

	await logActivity({
		eventId,
		userId: validUserId,
		action: "cancel_check_in",
		targetType: "guest",
		targetId: guestId,
		details: `Membatalkan check-in kehadiran: ${updated[0].name}`,
	});

	return updated[0];
}

export async function getGuestbookMessages(
	eventId: string,
	userEmail: string,
	status?: "pending" | "approved" | "rejected" | "all",
) {
	const validUserId = await ensureUserId(userEmail);
	const conditions = [
		eq(guestbookMessages.eventId, eventId),
		eq(guestbookMessages.userId, validUserId),
	];

	if (status && status !== "all") {
		conditions.push(eq(guestbookMessages.status, status));
	}

	return await db
		.select()
		.from(guestbookMessages)
		.where(and(...conditions))
		.orderBy(desc(guestbookMessages.createdAt));
}

export async function createGuestbookMessage(
	eventId: string,
	body: { senderName: string; message: string; guestId?: string },
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const id = `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

	const newMsg = {
		id,
		eventId,
		guestId: body.guestId || null,
		userId: validUserId,
		senderName: body.senderName.trim(),
		message: body.message.trim(),
		status: "approved" as const,
	};

	await db.insert(guestbookMessages).values(newMsg);

	await logActivity({
		eventId,
		userId: validUserId,
		action: "create_message",
		targetType: "message",
		targetId: id,
		details: `Ucapan baru dari: ${body.senderName}`,
	});

	return newMsg;
}

export async function moderateGuestbookMessage(
	messageId: string,
	eventId: string,
	status: "pending" | "approved" | "rejected",
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const updated = await db
		.update(guestbookMessages)
		.set({ status, updatedAt: new Date() })
		.where(
			and(
				eq(guestbookMessages.id, messageId),
				eq(guestbookMessages.eventId, eventId),
				eq(guestbookMessages.userId, validUserId),
			),
		)
		.returning();

	if (updated.length > 0) {
		await logActivity({
			eventId,
			userId: validUserId,
			action: "moderate_message",
			targetType: "message",
			targetId: messageId,
			details: `Moderasi ucapan ${updated[0].senderName} -> status: ${status}`,
		});
	}

	return updated[0] ?? null;
}

export async function deleteGuestbookMessage(
	messageId: string,
	eventId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	await db
		.delete(guestbookMessages)
		.where(
			and(
				eq(guestbookMessages.id, messageId),
				eq(guestbookMessages.eventId, eventId),
				eq(guestbookMessages.userId, validUserId),
			),
		);
	return { success: true };
}

export async function syncPublicPrayersToGuestbook(
	eventId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);

	const event = await db
		.select()
		.from(guestbookEvents)
		.where(
			and(
				eq(guestbookEvents.id, eventId),
				eq(guestbookEvents.userId, validUserId),
			),
		);
	if (event.length === 0) throw new Error("Event tidak ditemukan.");

	const userPrayers = await db
		.select()
		.from(prayers)
		.where(eq(prayers.userId, validUserId));

	const existingMessages = await db
		.select()
		.from(guestbookMessages)
		.where(
			and(
				eq(guestbookMessages.eventId, eventId),
				eq(guestbookMessages.userId, validUserId),
			),
		);

	const existingSet = new Set(
		existingMessages.map(
			(m) =>
				`${m.senderName.trim().toLowerCase()}::${m.message.trim().toLowerCase()}`,
		),
	);

	let syncedCount = 0;
	for (const p of userPrayers) {
		const key = `${p.sender.trim().toLowerCase()}::${p.message.trim().toLowerCase()}`;
		if (!existingSet.has(key)) {
			const id = `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
			const statusResolved: "approved" | "rejected" | "pending" =
				p.status === "Approved"
					? "approved"
					: p.status === "Rejected"
						? "rejected"
						: "pending";

			await db.insert(guestbookMessages).values({
				id,
				eventId,
				userId: validUserId,
				senderName: p.sender.trim(),
				message: p.message.trim(),
				status: statusResolved,
			});
			existingSet.add(key);
			syncedCount++;
		}
	}

	await logActivity({
		eventId,
		userId: validUserId,
		action: "sync_prayers",
		targetType: "message",
		targetId: eventId,
		details: `Sinkronisasi ucapan online: ${syncedCount} pesan berhasil dimasukkan ke Buku Tamu`,
	});

	return { syncedCount, totalProcessed: userPrayers.length };
}

export async function importGuestsCsv(
	eventId: string,
	rows: Array<{
		name?: string;
		phone?: string;
		email?: string;
		category?: string;
		tableNumber?: string;
		pax?: string | number;
		rsvp?: string;
		notes?: string;
	}>,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	const existingGuests = await db
		.select()
		.from(eventGuests)
		.where(
			and(
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		);

	const existingPhones = new Set(
		existingGuests
			.map((g) => g.phone?.replace(/\D/g, ""))
			.filter((p) => Boolean(p)),
	);
	const existingNames = new Set(
		existingGuests.map((g) => g.name.toLowerCase().trim()),
	);

	const categories = await db
		.select()
		.from(guestCategories)
		.where(
			and(
				eq(guestCategories.eventId, eventId),
				eq(guestCategories.userId, validUserId),
			),
		);

	const categoryMap = new Map<string, string>();
	for (const c of categories) {
		categoryMap.set(c.name.toLowerCase().trim(), c.id);
	}

	let importedCount = 0;
	let duplicateCount = 0;
	let invalidCount = 0;

	for (const row of rows) {
		const rawName = (row.name || "").trim();
		if (!rawName) {
			invalidCount++;
			continue;
		}

		const rawPhone = (row.phone || "").replace(/[^0-9+]/g, "").trim();
		const cleanPhone = rawPhone.replace(/\D/g, "");

		if (
			(cleanPhone && existingPhones.has(cleanPhone)) ||
			existingNames.has(rawName.toLowerCase())
		) {
			duplicateCount++;
			continue;
		}

		const rawCat = (row.category || "Keluarga").trim();
		let categoryId = categoryMap.get(rawCat.toLowerCase()) || null;

		if (!categoryId && rawCat) {
			const newCatId = `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
			await db.insert(guestCategories).values({
				id: newCatId,
				eventId,
				userId: validUserId,
				name: rawCat,
				color: "stone",
				isDefault: false,
			});
			categoryMap.set(rawCat.toLowerCase(), newCatId);
			categoryId = newCatId;
		}

		const pax = parseInt(String(row.pax || "1"), 10) || 1;
		let rsvp: "pending" | "attending" | "maybe" | "not_attending" = "pending";
		const rawRsvp = (row.rsvp || "").toLowerCase().trim();
		if (
			rawRsvp.includes("hadir") ||
			rawRsvp.includes("attending") ||
			rawRsvp.includes("yes")
		) {
			rsvp = "attending";
		} else if (rawRsvp.includes("ragu") || rawRsvp.includes("maybe")) {
			rsvp = "maybe";
		} else if (
			rawRsvp.includes("tidak") ||
			rawRsvp.includes("no") ||
			rawRsvp.includes("not")
		) {
			rsvp = "not_attending";
		}

		const id = `gst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
		await db.insert(eventGuests).values({
			id,
			eventId,
			userId: validUserId,
			name: rawName,
			phone: rawPhone,
			email: (row.email || "").trim(),
			categoryId,
			categoryName: rawCat || "Keluarga",
			tableNumber: (row.tableNumber || "").trim(),
			paxPlanned: pax,
			paxActual: 0,
			rsvpStatus: rsvp,
			isAttended: false,
			isSouvenirTaken: false,
			souvenirCount: 0,
			notes: (row.notes || "").trim(),
		});

		if (cleanPhone) existingPhones.add(cleanPhone);
		existingNames.add(rawName.toLowerCase());
		importedCount++;
	}

	await logActivity({
		eventId,
		userId: validUserId,
		action: "import_csv",
		targetType: "guest",
		targetId: eventId,
		details: `Import CSV: ${importedCount} sukses, ${duplicateCount} duplikat, ${invalidCount} tidak valid`,
	});

	return {
		importedCount,
		duplicateCount,
		invalidCount,
		totalProcessed: rows.length,
	};
}

export async function exportGuestsData(
	eventId: string,
	exportType: "all" | "rsvp" | "attended" | "messages",
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);

	if (exportType === "messages") {
		const msgs = await db
			.select()
			.from(guestbookMessages)
			.where(
				and(
					eq(guestbookMessages.eventId, eventId),
					eq(guestbookMessages.userId, validUserId),
				),
			)
			.orderBy(desc(guestbookMessages.createdAt));

		return {
			type: "messages",
			headers: ["Nama Pengirim", "Pesan Ucapan", "Status Moderasi", "Waktu"],
			rows: msgs.map((m) => [
				m.senderName,
				`"${m.message.replace(/"/g, '""')}"`,
				m.status,
				m.createdAt ? new Date(m.createdAt).toLocaleString("id-ID") : "",
			]),
		};
	}

	const conditions = [
		eq(eventGuests.eventId, eventId),
		eq(eventGuests.userId, validUserId),
	];

	if (exportType === "rsvp") {
		conditions.push(
			inArray(eventGuests.rsvpStatus, ["attending", "maybe", "not_attending"]),
		);
	} else if (exportType === "attended") {
		conditions.push(eq(eventGuests.isAttended, true));
	}

	const guests = await db
		.select()
		.from(eventGuests)
		.where(and(...conditions))
		.orderBy(desc(eventGuests.createdAt));

	return {
		type: exportType,
		headers: [
			"Nama Tamu",
			"Nomor Telepon",
			"Email",
			"Kategori",
			"No Meja",
			"Pax Direncanakan",
			"Status RSVP",
			"Status Kehadiran",
			"Pax Aktual Hadir",
			"Souvenir Diambil",
			"Jumlah Souvenir",
			"Waktu Hadir",
			"Pencatat Kehadiran",
			"Catatan",
		],
		rows: guests.map((g) => [
			`"${g.name.replace(/"/g, '""')}"`,
			g.phone || "",
			g.email || "",
			`"${g.categoryName.replace(/"/g, '""')}"`,
			g.tableNumber || "-",
			g.paxPlanned,
			g.rsvpStatus,
			g.isAttended ? "Hadir" : "Belum Hadir",
			g.paxActual || 0,
			g.isSouvenirTaken ? "Sudah Ambil" : "Belum",
			g.souvenirCount || 0,
			g.attendedAt ? new Date(g.attendedAt).toLocaleString("id-ID") : "",
			g.attendedBy || "",
			`"${(g.notes || "").replace(/"/g, '""')}"`,
		]),
	};
}

export async function getEventAnalytics(eventId: string, userEmail: string) {
	const validUserId = await ensureUserId(userEmail);

	const guests = await db
		.select()
		.from(eventGuests)
		.where(
			and(
				eq(eventGuests.eventId, eventId),
				eq(eventGuests.userId, validUserId),
			),
		);

	const messages = await db
		.select()
		.from(guestbookMessages)
		.where(
			and(
				eq(guestbookMessages.eventId, eventId),
				eq(guestbookMessages.userId, validUserId),
			),
		);

	const logs = await db
		.select()
		.from(attendanceLogs)
		.where(
			and(
				eq(attendanceLogs.eventId, eventId),
				eq(attendanceLogs.userId, validUserId),
			),
		)
		.orderBy(attendanceLogs.recordedAt);

	const totalGuests = guests.length;
	let rsvpAttending = 0;
	let rsvpPending = 0;
	let rsvpMaybe = 0;
	let rsvpNotAttending = 0;

	let totalPlannedPax = 0;
	let totalAttendedGuests = 0;
	let totalActualPax = 0;
	let totalSouvenirTakenGuests = 0;
	let totalSouvenirCount = 0;

	const categoryCounts: Record<
		string,
		{
			total: number;
			attended: number;
			plannedPax: number;
			actualPax: number;
			souvenirs: number;
		}
	> = {};

	for (const g of guests) {
		totalPlannedPax += g.paxPlanned || 1;

		if (g.rsvpStatus === "attending") rsvpAttending++;
		else if (g.rsvpStatus === "maybe") rsvpMaybe++;
		else if (g.rsvpStatus === "not_attending") rsvpNotAttending++;
		else rsvpPending++;

		if (g.isAttended) {
			totalAttendedGuests++;
			totalActualPax += g.paxActual || 1;
		}

		if (g.isSouvenirTaken) {
			totalSouvenirTakenGuests++;
			totalSouvenirCount += g.souvenirCount || 1;
		}

		const cat = g.categoryName || "Lainnya";
		if (!categoryCounts[cat]) {
			categoryCounts[cat] = {
				total: 0,
				attended: 0,
				plannedPax: 0,
				actualPax: 0,
				souvenirs: 0,
			};
		}
		categoryCounts[cat].total++;
		categoryCounts[cat].plannedPax += g.paxPlanned || 1;
		if (g.isAttended) {
			categoryCounts[cat].attended++;
			categoryCounts[cat].actualPax += g.paxActual || 1;
		}
		if (g.isSouvenirTaken) {
			categoryCounts[cat].souvenirs += g.souvenirCount || 1;
		}
	}

	const hourlyDistribution: Record<string, number> = {};
	for (const l of logs) {
		if (l.actionType === "check_in" && l.recordedAt) {
			const d = new Date(l.recordedAt);
			const hourStr = `${String(d.getHours()).padStart(2, "0")}:00`;
			hourlyDistribution[hourStr] =
				(hourlyDistribution[hourStr] || 0) + (l.paxActual || 1);
		}
	}

	const timelineChart = Object.entries(hourlyDistribution)
		.map(([hour, count]) => ({ hour, count }))
		.sort((a, b) => a.hour.localeCompare(b.hour));

	const categoryBreakdown = Object.entries(categoryCounts).map(
		([name, data]) => ({
			name,
			...data,
		}),
	);

	return {
		summary: {
			totalGuests,
			totalPlannedPax,
			totalAttendedGuests,
			totalActualPax,
			totalSouvenirTakenGuests,
			totalSouvenirCount,
			attendanceRate:
				totalGuests > 0
					? Math.round((totalAttendedGuests / totalGuests) * 100)
					: 0,
			totalMessages: messages.length,
			approvedMessages: messages.filter((m) => m.status === "approved").length,
		},
		rsvp: {
			attending: rsvpAttending,
			pending: rsvpPending,
			maybe: rsvpMaybe,
			notAttending: rsvpNotAttending,
		},
		timelineChart,
		categoryBreakdown,
	};
}

export async function getGuestbookActivityLogs(
	eventId: string,
	userEmail: string,
) {
	const validUserId = await ensureUserId(userEmail);
	return await db
		.select()
		.from(guestbookActivityLogs)
		.where(
			and(
				eq(guestbookActivityLogs.eventId, eventId),
				eq(guestbookActivityLogs.userId, validUserId),
			),
		)
		.orderBy(desc(guestbookActivityLogs.createdAt))
		.limit(100);
}
