import { db } from "@/lib/db/client";
import { templateAssetFolders, templateAssetItems, type TemplateAssetFolder, type NewTemplateAssetFolder } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { cached, invalidate } from "@/lib/redis/client";
import { z } from "zod";

const createFolderSchema = z.object({
	templateSlug: z.string().min(1),
	folderName: z.string().min(1).max(50).regex(/^[^\\/:*?"<>|]+$/),
	parentFolderId: z.string().optional(),
	color: z.string().optional().default("#6366f1")
});

const renameFolderSchema = z.object({
	folderId: z.string().min(1),
	newFolderName: z.string().min(1).max(50).regex(/^[^\\/:*?"<>|]+$/)
});

export async function createAssetFolder(input: z.infer<typeof createFolderSchema>) {
	const parsed = createFolderSchema.parse(input);
	const folderId = `fld-${parsed.templateSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

	const result = await db.insert(templateAssetFolders).values({
		id: folderId,
		templateSlug: parsed.templateSlug,
		folderName: parsed.folderName.trim(),
		parentFolderId: parsed.parentFolderId || null,
		color: parsed.color || "#6366f1",
		createdAt: new Date()
	}).returning();

	await invalidate(`api:assets:tree:${parsed.templateSlug}`, `api:template:${parsed.templateSlug}`);
	return result[0];
}

export async function renameAssetFolder(input: z.infer<typeof renameFolderSchema>) {
	const parsed = renameFolderSchema.parse(input);

	const result = await db
		.update(templateAssetFolders)
		.set({ folderName: parsed.newFolderName.trim() })
		.where(eq(templateAssetFolders.id, parsed.folderId))
		.returning();

	if (result[0]) {
		await invalidate(`api:assets:tree:${result[0].templateSlug}`, `api:template:${result[0].templateSlug}`);
	}

	return result[0];
}

export async function deleteAssetFolder(folderId: string) {
	const existing = await db
		.select()
		.from(templateAssetFolders)
		.where(eq(templateAssetFolders.id, folderId))
		.limit(1);

	if (existing.length === 0) return { success: false };

	const folder = existing[0];

	await db
		.update(templateAssetItems)
		.set({ folderId: null })
		.where(eq(templateAssetItems.folderId, folderId));

	await db
		.delete(templateAssetFolders)
		.where(eq(templateAssetFolders.id, folderId));

	await invalidate(`api:assets:tree:${folder.templateSlug}`, `api:template:${folder.templateSlug}`);
	return { success: true };
}

export async function moveAssetToFolder(assetId: string, targetFolderId: string | null) {
	const result = await db
		.update(templateAssetItems)
		.set({ folderId: targetFolderId })
		.where(eq(templateAssetItems.id, assetId))
		.returning();

	if (result[0]) {
		await invalidate(`api:assets:tree:${result[0].templateSlug}`, `api:template:${result[0].templateSlug}`);
	}

	return result[0];
}

export async function getTemplateCustomFolders(templateSlug: string) {
	const cacheKey = `api:assets:tree:${templateSlug}`;
	return cached(cacheKey, 300, async () => {
		const [folders, items] = await Promise.all([
			db.select().from(templateAssetFolders).where(eq(templateAssetFolders.templateSlug, templateSlug)),
			db.select().from(templateAssetItems).where(eq(templateAssetItems.templateSlug, templateSlug))
		]);

		return folders.map(f => {
			const count = items.filter(i => i.folderId === f.id).length;
			return {
				...f,
				itemCount: count
			};
		});
	});
}
