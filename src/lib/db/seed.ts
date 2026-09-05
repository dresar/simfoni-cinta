import {
	users as seedUsers,
	invitations as seedInvitations,
	templates as seedTemplates,
	prayers as seedPrayers,
	quotes as seedQuotes,
	sacredTexts as seedSacred,
	music as seedMusic,
	assets as seedAssets,
	rsvps as seedRsvps,
	orders as seedOrders,
	guests as seedGuests,
} from "@/data/mockData";
import { db } from "./client";
import * as schema from "./schema";

export async function seedDatabase() {
	await db.insert(schema.users).values(seedUsers).onConflictDoNothing();
	await db.insert(schema.templates).values(seedTemplates).onConflictDoNothing();
	await db
		.insert(schema.invitations)
		.values(seedInvitations.map((i) => ({ ...i, ownerId: i.ownerId })))
		.onConflictDoNothing();
	await db.insert(schema.prayers).values(seedPrayers).onConflictDoNothing();
	await db.insert(schema.quotes).values(seedQuotes).onConflictDoNothing();
	await db.insert(schema.sacredTexts).values(seedSacred).onConflictDoNothing();
	await db.insert(schema.music).values(seedMusic).onConflictDoNothing();
	await db.insert(schema.assets).values(seedAssets).onConflictDoNothing();
	await db.insert(schema.rsvps).values(seedRsvps).onConflictDoNothing();
	await db.insert(schema.orders).values(seedOrders).onConflictDoNothing();
	await db.insert(schema.guests).values(seedGuests).onConflictDoNothing();
}
