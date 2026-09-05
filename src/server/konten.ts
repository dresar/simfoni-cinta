import { db } from "@/lib/db/client";
import { prayers, quotes, sacredTexts } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function getPrayers() {
	return cached("api:prayers", 300, () => db.select().from(prayers));
}

export async function getPrayerById(id: string) {
	const rows = await db.select().from(prayers).where(eq(prayers.id, id));
	return rows[0] ?? null;
}

export async function createPrayer(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			title: z.string(),
			category: z.string(),
			original: z.string(),
			latin: z.string(),
			translation: z.string(),
		})
		.parse(body);
	await db.insert(prayers).values(data);
	await invalidate("api:prayers");
	return data;
}

export async function updatePrayer(id: string, body: unknown) {
	const data = z
		.object({
			title: z.string().optional(),
			category: z.string().optional(),
			original: z.string().optional(),
			latin: z.string().optional(),
			translation: z.string().optional(),
		})
		.parse(body);
	await db.update(prayers).set(data).where(eq(prayers.id, id));
	await invalidate("api:prayers");
	return data;
}

export async function deletePrayer(id: string) {
	await db.delete(prayers).where(eq(prayers.id, id));
	await invalidate("api:prayers");
}

export async function getQuotes() {
	return cached("api:quotes", 300, () => db.select().from(quotes));
}

export async function createQuote(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			text: z.string(),
			author: z.string(),
			mood: z.string(),
		})
		.parse(body);
	await db.insert(quotes).values(data);
	await invalidate("api:quotes");
	return data;
}

export async function updateQuote(id: string, body: unknown) {
	const data = z
		.object({
			text: z.string().optional(),
			author: z.string().optional(),
			mood: z.string().optional(),
		})
		.parse(body);
	await db.update(quotes).set(data).where(eq(quotes.id, id));
	await invalidate("api:quotes");
	return data;
}

export async function deleteQuote(id: string) {
	await db.delete(quotes).where(eq(quotes.id, id));
	await invalidate("api:quotes");
}

export async function getSacredTexts() {
	return cached("api:sacred", 300, () => db.select().from(sacredTexts));
}

export async function createSacredText(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			title: z.string(),
			category: z.string(),
			body: z.string(),
		})
		.parse(body);
	await db.insert(sacredTexts).values(data);
	await invalidate("api:sacred");
	return data;
}

export async function deleteSacredText(id: string) {
	await db.delete(sacredTexts).where(eq(sacredTexts.id, id));
	await invalidate("api:sacred");
}
