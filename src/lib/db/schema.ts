import {
	pgTable,
	text,
	varchar,
	integer,
	boolean,
	timestamp,
	serial,
	pgEnum,
	jsonb,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "user"]);
export const tierEnum = pgEnum("tier", [
	"Free",
	"Bronze",
	"Silver",
	"Gold",
	"Platinum",
	"Owner",
]);
export const userStatusEnum = pgEnum("user_status", [
	"Aktif",
	"Ditangguhkan",
	"Diblokir",
]);
export const invStatusEnum = pgEnum("inv_status", ["Aktif", "Draf"]);
export const attendance = pgEnum("attendance", [
	"Hadir",
	"Ragu",
	"Tidak Hadir",
]);
export const orderStatus = pgEnum("order_status", [
	"Lunas",
	"Menunggu",
	"Kadaluarsa",
]);
export const planEnum = pgEnum("plan", ["Gold", "Platinum"]);
export const templateCat = pgEnum("template_cat", [
	"Tradisional",
	"Modern",
	"Signature",
	"Religius",
	"Artistik",
]);
export const purchaseStatus = pgEnum("purchase_status", [
	"pending",
	"paid",
	"failed",
	"expired",
	"cancelled",
]);
export const entitlementStatus = pgEnum("entitlement_status", [
	"available",
	"used",
	"expired",
	"revoked",
]);

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	role: roleEnum("role").notNull().default("user"),
	tier: tierEnum("tier").notNull().default("Free"),
	invitations: integer("invitations").notNull().default(0),
	quota: integer("quota").notNull().default(0),
	status: userStatusEnum("status").notNull().default("Aktif"),
	joined: text("joined").notNull(),
});

export const invitations = pgTable("invitations", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	groom: text("groom").notNull().default(""),
	groomNick: text("groom_nick").notNull().default(""),
	groomParents: text("groom_parents").notNull().default(""),
	groomPhoto: text("groom_photo").notNull().default(""),
	bride: text("bride").notNull().default(""),
	brideNick: text("bride_nick").notNull().default(""),
	brideParents: text("bride_parents").notNull().default(""),
	bridePhoto: text("bride_photo").notNull().default(""),
	template: text("template").notNull(),
	status: invStatusEnum("status").notNull().default("Draf"),
	views: integer("views").notNull().default(0),
	date: text("date").notNull(),
	akadTime: text("akad_time").notNull().default("08:00 - 10:00 WIB"),
	resepsiTime: text("resepsi_time").notNull().default("11:00 - 14:00 WIB"),
	venueName: text("venue_name").notNull().default(""),
	venueAddress: text("venue_address").notNull().default(""),
	mapsUrl: text("maps_url").notNull().default(""),
	bankName: text("bank_name").notNull().default("BCA"),
	bankAccount: text("bank_account").notNull().default(""),
	accountHolder: text("account_holder").notNull().default(""),
	musicTitle: text("music_title").notNull().default("A Thousand Years — Christina Perri"),
	story: text("story").notNull().default(""),
	gallery: text("gallery").notNull().default("[]"),
	ownerId: text("owner_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	liveUrl: text("live_url").notNull().default(""),
	buyerNotes: text("buyer_notes").notNull().default(""),
	adminNotes: text("admin_notes").notNull().default(""),
	packageTier: text("package_tier").notNull().default("Silver"),
	entitlementId: text("entitlement_id"),
	externalBuilderId: text("external_builder_id"),
	externalBuilderUrl: text("external_builder_url"),
	sacredTextId: text("sacred_text_id").notNull().default(""),
	sacredTextTitle: text("sacred_text_title").notNull().default(""),
	sacredTextContent: text("sacred_text_content").notNull().default(""),
	quoteId: text("quote_id").notNull().default(""),
	quoteText: text("quote_text").notNull().default(""),
	quoteAuthor: text("quote_author").notNull().default(""),
	prayerId: text("prayer_id").notNull().default(""),
	prayerTitle: text("prayer_title").notNull().default(""),
	prayerContent: text("prayer_content").notNull().default(""),
});

export const templateCategories = pgTable("template_categories", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull().default(""),
	order: integer("order").notNull().default(0),
	createdAt: text("created_at").notNull(),
});

export const templates = pgTable("templates", {
	id: varchar("id", { length: 128 }).primaryKey(),
	slug: varchar("slug", { length: 128 }).notNull().unique(),
	name: varchar("name", { length: 255 }).notNull(),
	category: varchar("category", { length: 100 }).notNull(),
	theme: varchar("theme", { length: 100 }).notNull().default("default"),
	tag: varchar("tag", { length: 100 }).default("Popular"),
	thumb: text("thumb").notNull(),
	assetsCount: integer("assets_count").default(0),
	audioTitle: varchar("audio_title", { length: 255 }),
	audioUrl: text("audio_url"),
	isActive: boolean("is_active").default(true),
	tier: varchar("tier", { length: 50 }).default("pro"),
	sortOrder: integer("sort_order").default(999),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const prayers = pgTable("prayers", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	category: text("category").notNull(),
	original: text("original").notNull(),
	latin: text("latin").notNull(),
	translation: text("translation").notNull(),
});

export const quotes = pgTable("quotes", {
	id: text("id").primaryKey(),
	text: text("text").notNull(),
	author: text("author").notNull(),
	mood: text("mood").notNull(),
});

export const sacredTexts = pgTable("sacred_texts", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	category: text("category").notNull(),
	body: text("body").notNull(),
});

export const music = pgTable("music", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	artist: text("artist").notNull(),
	genre: text("genre").notNull(),
	duration: text("duration").notNull(),
	url: text("url").notNull(),
});

export const assets = pgTable("assets", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	category: text("category").notNull(),
	size: text("size").notNull(),
	url: text("url").notNull(),
});

export const rsvps = pgTable("rsvps", {
	id: text("id").primaryKey(),
	guest: text("guest").notNull(),
	slug: text("slug").notNull(),
	attendance: attendance("attendance").notNull(),
	pax: integer("pax").notNull().default(1),
	message: text("message").notNull().default(""),
	time: text("time").notNull(),
});

export const orders = pgTable("orders", {
	id: text("id").primaryKey(),
	customer: text("customer").notNull(),
	email: text("email").notNull(),
	plan: planEnum("plan").notNull(),
	amount: integer("amount").notNull(),
	method: text("method").notNull(),
	status: orderStatus("status").notNull().default("Menunggu"),
	date: text("date").notNull(),
});

export const guests = pgTable("guests", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	category: text("category").notNull(),
	phone: text("phone").notNull().default(""),
	pax: integer("pax").notNull().default(1),
	sent: boolean("sent").notNull().default(false),
	invitationId: text("invitation_id").notNull().default(""),
	ownerId: text("owner_id").notNull().default(""),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
	id: text("id").primaryKey(),
	data: jsonb("data").notNull(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const coupleProfiles = pgTable("couple_profiles", {
	invitationId: text("invitation_id")
		.primaryKey()
		.references(() => invitations.id, { onDelete: "cascade" }),
	groomName: text("groom_name").notNull().default(""),
	groomNick: text("groom_nick").notNull().default(""),
	groomParents: text("groom_parents").notNull().default(""),
	groomBio: text("groom_bio").notNull().default(""),
	groomPhoto: text("groom_photo").notNull().default(""),
	groomInstagram: text("groom_instagram").notNull().default(""),
	groomTiktok: text("groom_tiktok").notNull().default(""),
	brideName: text("bride_name").notNull().default(""),
	brideNick: text("bride_nick").notNull().default(""),
	brideParents: text("bride_parents").notNull().default(""),
	brideBio: text("bride_bio").notNull().default(""),
	bridePhoto: text("bride_photo").notNull().default(""),
	brideInstagram: text("bride_instagram").notNull().default(""),
	brideTiktok: text("bride_tiktok").notNull().default(""),
});

export const templatePurchases = pgTable("template_purchases", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	templateId: text("template_id").notNull(),
	templateName: text("template_name").notNull(),
	templateSlug: text("template_slug").notNull(),
	packageId: text("package_id").notNull().default("silver"),
	tier: text("tier").notNull().default("Silver"),
	amount: integer("amount").notNull(),
	currency: text("currency").notNull().default("IDR"),
	status: purchaseStatus("status").notNull().default("pending"),
	externalOrderId: text("external_order_id"),
	paymentUrl: text("payment_url"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
	id: text("id").primaryKey(),
	orderId: text("order_id").notNull(),
	provider: text("provider").notNull().default("mayar"),
	externalPaymentId: text("external_payment_id"),
	method: text("method").notNull().default("QRIS"),
	amount: integer("amount").notNull(),
	status: text("status").notNull().default("pending"),
	paidAt: timestamp("paid_at"),
	expiredAt: timestamp("expired_at"),
	rawResponse: jsonb("raw_response"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const entitlements = pgTable("entitlements", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	templateId: text("template_id").notNull(),
	templateName: text("template_name").notNull(),
	packageId: text("package_id").notNull().default("silver"),
	tier: text("tier").notNull().default("Silver"),
	orderId: text("order_id").references(() => templatePurchases.id),
	usageLimit: integer("usage_limit").notNull().default(1),
	usedCount: integer("used_count").notNull().default(0),
	status: entitlementStatus("status").notNull().default("available"),
	usedAt: timestamp("used_at"),
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const guestbookEventStatus = pgEnum("guestbook_event_status", [
	"draft",
	"active",
	"completed",
	"archived",
]);

export const guestRsvpStatus = pgEnum("guest_rsvp_status", [
	"pending",
	"attending",
	"maybe",
	"not_attending",
]);

export const attendanceActionType = pgEnum("attendance_action_type", [
	"check_in",
	"update_pax",
	"cancel_check_in",
]);

export const messageModerationStatus = pgEnum("message_moderation_status", [
	"pending",
	"approved",
	"rejected",
]);

export const guestbookEvents = pgTable("guestbook_events", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	invitationId: text("invitation_id"),
	syncPrayers: boolean("sync_prayers").notNull().default(true),
	title: text("title").notNull(),
	description: text("description").notNull().default(""),
	eventDate: text("event_date").notNull(),
	eventTime: text("event_time").notNull().default(""),
	location: text("location").notNull().default(""),
	notes: text("notes").notNull().default(""),
	status: guestbookEventStatus("status").notNull().default("active"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const guestCategories = pgTable("guest_categories", {
	id: text("id").primaryKey(),
	eventId: text("event_id")
		.notNull()
		.references(() => guestbookEvents.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	color: text("color").notNull().default("emerald"),
	isDefault: boolean("is_default").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventGuests = pgTable("event_guests", {
	id: text("id").primaryKey(),
	eventId: text("event_id")
		.notNull()
		.references(() => guestbookEvents.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	phone: text("phone").notNull().default(""),
	email: text("email").notNull().default(""),
	categoryId: text("category_id").references(() => guestCategories.id, {
		onDelete: "set null",
	}),
	categoryName: text("category_name").notNull().default("Keluarga"),
	tableNumber: text("table_number").notNull().default(""),
	paxPlanned: integer("pax_planned").notNull().default(1),
	paxActual: integer("pax_actual").notNull().default(0),
	rsvpStatus: guestRsvpStatus("rsvp_status").notNull().default("pending"),
	isAttended: boolean("is_attended").notNull().default(false),
	attendedAt: timestamp("attended_at"),
	attendedBy: text("attended_by").notNull().default(""),
	isSouvenirTaken: boolean("is_souvenir_taken").notNull().default(false),
	souvenirCount: integer("souvenir_count").notNull().default(0),
	notes: text("notes").notNull().default(""),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const attendanceLogs = pgTable("attendance_logs", {
	id: text("id").primaryKey(),
	eventId: text("event_id")
		.notNull()
		.references(() => guestbookEvents.id, { onDelete: "cascade" }),
	guestId: text("guest_id")
		.notNull()
		.references(() => eventGuests.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	paxActual: integer("pax_actual").notNull().default(1),
	actionType: attendanceActionType("action_type").notNull().default("check_in"),
	recordedBy: text("recorded_by").notNull().default(""),
	notes: text("notes").notNull().default(""),
	recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export const guestbookMessages = pgTable("guestbook_messages", {
	id: text("id").primaryKey(),
	eventId: text("event_id")
		.notNull()
		.references(() => guestbookEvents.id, { onDelete: "cascade" }),
	guestId: text("guest_id").references(() => eventGuests.id, {
		onDelete: "set null",
	}),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	senderName: text("sender_name").notNull(),
	message: text("message").notNull(),
	status: messageModerationStatus("status").notNull().default("approved"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const guestbookActivityLogs = pgTable("guestbook_activity_logs", {
	id: text("id").primaryKey(),
	eventId: text("event_id")
		.notNull()
		.references(() => guestbookEvents.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	actorName: text("actor_name").notNull().default(""),
	action: text("action").notNull(),
	targetType: text("target_type").notNull(),
	targetId: text("target_id").notNull(),
	details: text("details").notNull().default(""),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const templateAssetFolders = pgTable("template_asset_folders", {
	id: varchar("id", { length: 128 }).primaryKey(),
	templateSlug: varchar("template_slug", { length: 128 })
		.notNull()
		.references(() => templates.slug, { onDelete: "cascade" }),
	folderName: varchar("folder_name", { length: 255 }).notNull(),
	parentFolderId: varchar("parent_folder_id", { length: 128 }).references(
		(): any => templateAssetFolders.id,
	),
	color: varchar("color", { length: 50 }).default("blue"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const templateAssetItems = pgTable("template_asset_items", {
	id: varchar("id", { length: 128 }).primaryKey(),
	templateSlug: varchar("template_slug", { length: 128 }).notNull(),
	folderId: varchar("folder_id", { length: 128 }).references(
		() => templateAssetFolders.id,
	),
	name: varchar("name", { length: 255 }).notNull(),
	fileType: varchar("file_type", { length: 50 }).notNull(),
	fileSize: integer("file_size").default(0),
	localPath: text("local_path").notNull(),
	cdnUrl: text("cdn_url"),
	isSyncedCdn: boolean("is_synced_cdn").default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Template = InferSelectModel<typeof templates>;
export type NewTemplate = InferInsertModel<typeof templates>;
export type TemplateAssetFolder = InferSelectModel<typeof templateAssetFolders>;
export type NewTemplateAssetFolder = InferInsertModel<typeof templateAssetFolders>;
export type TemplateAssetItem = InferSelectModel<typeof templateAssetItems>;
export type NewTemplateAssetItem = InferInsertModel<typeof templateAssetItems>;
