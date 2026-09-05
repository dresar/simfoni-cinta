import { db } from "@/lib/db/client";
import { music, assets, templates, templateCategories } from "@/lib/db/schema";
import { cached, invalidate } from "@/lib/redis/client";
import { deleteUploadedFileFromGitHub } from "@/server/upload";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const DEFAULT_CATEGORIES = [
	{
		id: "cat-tradisional",
		name: "Tradisional",
		slug: "tradisional",
		description: "Adat Nusantara, Batak, Jawa, Sunda, Minang",
		order: 1,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-modern",
		name: "Modern",
		slug: "modern",
		description: "Konsep kontemporer dan clean editorial",
		order: 2,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-floral-sage",
		name: "Floral & Sage",
		slug: "floral-sage",
		description: "Bunga botani watercolor dan sentuhan sage green",
		order: 3,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-luxury",
		name: "Elegant & Luxury",
		slug: "elegant-luxury",
		description: "Nuansa emas glamor, navy, emerald dan black gold",
		order: 4,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-minimalis",
		name: "Minimalis",
		slug: "minimalis",
		description: "Tipografi murni dengan whitespace rapi",
		order: 5,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-islamic",
		name: "Islamic & Syukuran",
		slug: "islamic-syukuran",
		description: "Ornamen arabesque, kaligrafi, dan doa barakah",
		order: 6,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-signature",
		name: "Signature",
		slug: "signature",
		description: "Desain khusus eksklusif premium",
		order: 7,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "cat-artistik",
		name: "Artistik",
		slug: "artistik",
		description: "Sentuhan seni bebas dan kreatif",
		order: 8,
		createdAt: "2026-01-01T00:00:00.000Z",
	},
];

export async function getTemplateCategories() {
	return cached("api:template-categories", 300, async () => {
		try {
			const rows = await db
				.select()
				.from(templateCategories)
				.orderBy(templateCategories.order);
			if (rows && rows.length > 0) return rows;
		} catch {}
		return DEFAULT_CATEGORIES;
	});
}

export async function createTemplateCategory(body: unknown) {
	const data = z
		.object({
			id: z.string().default(() => `cat-${Date.now()}`),
			name: z.string().min(1),
			slug: z.string().min(1),
			description: z.string().default(""),
			order: z.number().default(0),
			createdAt: z.string().default(() => new Date().toISOString()),
		})
		.parse(body);

	try {
		await db.insert(templateCategories).values(data);
	} catch {}
	await invalidate("api:template-categories");
	return data;
}

export async function updateTemplateCategory(id: string, body: unknown) {
	const data = z
		.object({
			name: z.string().optional(),
			slug: z.string().optional(),
			description: z.string().optional(),
			order: z.number().optional(),
		})
		.parse(body);

	try {
		await db
			.update(templateCategories)
			.set(data)
			.where(eq(templateCategories.id, id));
	} catch {}
	await invalidate("api:template-categories");
	return data;
}

export async function deleteTemplateCategory(id: string) {
	try {
		await db.delete(templateCategories).where(eq(templateCategories.id, id));
	} catch {}
	await invalidate("api:template-categories");
}

export async function getMusic() {
	return cached("api:music", 300, () => db.select().from(music));
}

export async function createMusic(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			title: z.string(),
			artist: z.string(),
			genre: z.string(),
			duration: z.string(),
			url: z.string().url(),
		})
		.parse(body);
	const existing = await db
		.select()
		.from(music)
		.where(eq(music.url, data.url))
		.limit(1);
	if (existing.length > 0 && existing[0]) {
		return existing[0];
	}
	await db.insert(music).values(data);
	await invalidate("api:music");
	return data;
}

export async function deleteMusic(id: string) {
	await db.delete(music).where(eq(music.id, id));
	await invalidate("api:music");
}

export async function getAssets() {
	return cached("api:assets", 300, () => db.select().from(assets));
}

export async function createAsset(body: unknown) {
	const data = z
		.object({
			id: z.string(),
			name: z.string(),
			category: z.string(),
			size: z.string(),
			url: z.string(),
		})
		.parse(body);
	const existing = await db
		.select()
		.from(assets)
		.where(eq(assets.url, data.url))
		.limit(1);
	if (existing.length > 0 && existing[0]) {
		return existing[0];
	}
	await db.insert(assets).values(data);
	await invalidate("api:assets");
	return data;
}

export async function updateAsset(id: string, body: unknown) {
	const data = z
		.object({
			name: z.string().optional(),
			category: z.string().optional(),
			size: z.string().optional(),
			url: z.string().optional(),
		})
		.parse(body);
	await db.update(assets).set(data).where(eq(assets.id, id));
	await invalidate("api:assets");
	return data;
}

export async function bulkUpdateAssetCategory(
	ids: string[],
	category: string,
) {
	if (!ids.length || !category) return;
	for (const id of ids) {
		await db.update(assets).set({ category }).where(eq(assets.id, id));
	}
	await invalidate("api:assets");
}

export async function deleteAsset(id: string) {
	const rows = await db.select().from(assets).where(eq(assets.id, id));
	if (rows[0]?.url) {
		deleteUploadedFileFromGitHub(rows[0].url).catch(() => {});
	}
	await db.delete(assets).where(eq(assets.id, id));
	await invalidate("api:assets");
}

export async function getTemplates() {
	return cached("api:templates:v3", 300, () =>
		db
			.select()
			.from(templates)
			.orderBy(
				asc(templates.sortOrder),
				asc(templates.id),
				asc(templates.createdAt),
			),
	);
}

export async function getTemplateById(id: string) {
	const rows = await db.select().from(templates).where(eq(templates.id, id));
	return rows[0] ?? null;
}

export async function createTemplate(body: unknown) {
	const data = z
		.object({
			id: z.string().default(() => `tpl-${Date.now()}`),
			name: z.string().min(1),
			slug: z.string().min(1),
			tag: z.string().default("Adat Nusantara"),
			category: z.string().default("Tradisional"),
			theme: z.string().default("Emas & Maroon"),
			thumb: z
				.string()
				.default(
					"https://cdn.jsdelivr.net/gh/ponpesraudhatussalammahato-hue/wedding-cdn@main/uploads/branding/tpl-traditional.jpg",
				),
		})
		.parse(body);

	try {
		const existing = await db
			.select()
			.from(templates)
			.where(eq(templates.slug, data.slug));

		if (existing.length > 0) {
			await db
				.update(templates)
				.set({
					name: data.name,
					tag: data.tag,
					category: data.category,
					theme: data.theme,
					thumb: data.thumb,
				})
				.where(eq(templates.slug, data.slug));
		} else {
			await db.insert(templates).values(data);
		}
	} catch (error) {
		console.error("Error creating/updating template in DB:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Gagal menyimpan template ke database.",
		);
	}

	await invalidate("api:templates");
	return data;
}

export async function updateTemplate(id: string, body: unknown) {
	const data = z
		.object({
			name: z.string().optional(),
			slug: z.string().optional(),
			tag: z.string().optional(),
			category: z.string().optional(),
			theme: z.string().optional(),
			thumb: z.string().optional(),
			sortOrder: z.number().optional(),
		})
		.parse(body);
	await db.update(templates).set(data).where(eq(templates.id, id));
	await invalidate("api:templates");
	return data;
}

export async function deleteTemplate(id: string) {
	await db.delete(templates).where(eq(templates.id, id));
	await invalidate("api:templates");
}

export async function getTemplateBySlug(slug: string) {
	const rows = await db
		.select()
		.from(templates)
		.where(eq(templates.slug, slug));
	return rows[0] ?? null;
}

export async function resolveTemplateDemoUrl(slug: string) {
	return { url: `/demo/${slug}/index.html`, source: "local" as const };
}
