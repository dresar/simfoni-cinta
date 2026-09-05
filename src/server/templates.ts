import { db } from "@/lib/db/client";
import { templates, templateAssetFolders, templateAssetItems, type Template, type NewTemplate } from "@/lib/db/schema";
import { eq, like, ilike, and, or, desc, asc, sql } from "drizzle-orm";
import { cached, invalidate } from "@/lib/redis/client";

export interface TemplateQueryOptions {
	category?: string;
	tier?: string;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: "popular" | "newest" | "name";
}

export interface TemplateStats {
	totalTemplates: number;
	totalCategories: number;
	totalAdat: number;
	totalModern: number;
	totalFloral: number;
	totalAssetsTracked: number;
}

export async function getTemplates(opts: TemplateQueryOptions = {}) {
	const page = Math.max(1, opts.page || 1);
	const limit = Math.min(500, Math.max(1, opts.limit || 50));
	const offset = (page - 1) * limit;

	const cacheKey = `api:templates:${opts.category || "all"}:${opts.tier || "all"}:${opts.search || "all"}:${opts.sortBy || "popular"}:${page}:${limit}`;

	return cached(cacheKey, 600, async () => {
		const conditions = [];

		if (opts.category && opts.category !== "all" && opts.category !== "Semua") {
			conditions.push(eq(templates.category, opts.category));
		}

		if (opts.tier && opts.tier !== "all") {
			conditions.push(eq(templates.tier, opts.tier));
		}

		if (opts.search && opts.search.trim()) {
			const q = `%${opts.search.trim()}%`;
			conditions.push(or(ilike(templates.name, q), ilike(templates.slug, q), ilike(templates.category, q)));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let order = [asc(templates.sortOrder), asc(templates.id), asc(templates.createdAt)];
		if (opts.sortBy === "name") {
			order = [asc(templates.name)];
		} else if (opts.sortBy === "popular") {
			order = [asc(templates.sortOrder), asc(templates.id), desc(templates.assetsCount)];
		}

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(templates)
				.where(whereClause)
				.orderBy(...order)
				.limit(limit)
				.offset(offset),
			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(templates)
				.where(whereClause)
		]);

		const total = totalResult[0]?.count || 0;
		const totalPages = Math.ceil(total / limit);

		return {
			items,
			total,
			page,
			limit,
			totalPages,
		};
	});
}

export async function getTemplateBySlug(slug: string) {
	const cacheKey = `api:template:${slug}`;
	return cached(cacheKey, 600, async () => {
		const result = await db
			.select()
			.from(templates)
			.where(or(eq(templates.slug, slug), eq(templates.id, slug)))
			.limit(1);

		if (result.length === 0) return null;

		const template = result[0];
		const realSlug = template.slug;
		const [folders, items] = await Promise.all([
			db.select().from(templateAssetFolders).where(eq(templateAssetFolders.templateSlug, realSlug)),
			db.select().from(templateAssetItems).where(eq(templateAssetItems.templateSlug, realSlug))
		]);

		const syncedCount = items.filter(i => i.isSyncedCdn).length;

		return {
			...template,
			customFolders: folders,
			syncedAssetsCount: syncedCount,
			totalTrackedAssets: items.length,
			items,
		};
	});
}

export async function getTemplateAssets(slug: string) {
	const cacheKey = `api:template:assets:${slug}`;
	return cached(cacheKey, 600, async () => {
		return db
			.select()
			.from(templateAssetItems)
			.where(eq(templateAssetItems.templateSlug, slug))
			.orderBy(
				sql`CASE 
					WHEN ${templateAssetItems.fileType} = 'image' THEN 1 
					WHEN ${templateAssetItems.fileType} = 'audio' THEN 2 
					WHEN ${templateAssetItems.fileType} = 'font' THEN 3 
					WHEN ${templateAssetItems.fileType} = 'css' THEN 4 
					WHEN ${templateAssetItems.fileType} = 'js' THEN 5 
					ELSE 6 
				END ASC`,
				asc(templateAssetItems.name)
			);
	});
}

export async function getTemplateStats(): Promise<TemplateStats> {
	return cached("api:templates:stats", 600, async () => {
		const [all, trackedAssets] = await Promise.all([
			db.select().from(templates),
			db.select({ count: sql<number>`cast(count(*) as integer)` }).from(templateAssetItems)
		]);

		const categories = new Set(all.map(t => t.category));
		const totalAdat = all.filter(t => (t.category || "").includes("Adat")).length;
		const totalModern = all.filter(t => (t.category || "").includes("Modern")).length;
		const totalFloral = all.filter(t => (t.category || "").includes("Floral")).length;

		return {
			totalTemplates: all.length,
			totalCategories: categories.size,
			totalAdat,
			totalModern,
			totalFloral,
			totalAssetsTracked: trackedAssets[0]?.count || 0
		};
	});
}

export async function getCategoriesSummary() {
	return cached("api:templates:categories", 600, async () => {
		const items = await db.select({
			category: templates.category,
			count: sql<number>`cast(count(*) as integer)`
		})
		.from(templates)
		.groupBy(templates.category);

		return items;
	});
}

export async function createTemplate(data: NewTemplate) {
	const result = await db.insert(templates).values(data).returning();
	await invalidateTemplateCaches();
	return result[0];
}

export async function updateTemplate(slug: string, data: Partial<NewTemplate>) {
	const result = await db
		.update(templates)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(templates.slug, slug))
		.returning();

	await invalidateTemplateCaches(slug);
	return result[0];
}

export async function deleteTemplate(slug: string) {
	await Promise.all([
		db.delete(templateAssetItems).where(eq(templateAssetItems.templateSlug, slug)),
		db.delete(templateAssetFolders).where(eq(templateAssetFolders.templateSlug, slug)),
		db.delete(templates).where(eq(templates.slug, slug))
	]);

	await invalidateTemplateCaches(slug);
	return { success: true };
}

export async function invalidateTemplateCaches(slug?: string) {
	const keys = ["api:templates", "api:templates:stats", "api:templates:categories", "api:templates:all"];
	if (slug) {
		keys.push(`api:template:${slug}`);
	}
	await invalidate(...keys);
}

export interface PromoVisualAsset {
	id: string;
	name: string;
	localPath: string;
	cdnUrl: string | null;
	isSyncedCdn: boolean;
	fileType: string;
	fileSize: number;
	isThumbnail: boolean;
}

export interface TemplatePromoAssetsResponse {
	template: Template | null;
	assets: PromoVisualAsset[];
	stats: {
		total: number;
		syncedCount: number;
		unSyncedCount: number;
		percentage: number;
	};
}

export async function getTemplatePromoAssets(slug: string): Promise<TemplatePromoAssetsResponse> {
	const template = await getTemplateBySlug(slug);
	if (!template) {
		return {
			template: null,
			assets: [],
			stats: { total: 0, syncedCount: 0, unSyncedCount: 0, percentage: 0 },
		};
	}

	const realSlug = template.slug;
	const dbAssets = await db
		.select()
		.from(templateAssetItems)
		.where(or(eq(templateAssetItems.templateSlug, realSlug), eq(templateAssetItems.templateSlug, slug)));

	const imageExts = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);
	const visualItems: PromoVisualAsset[] = [];
	const seenPaths = new Set<string>();

	if (template.thumb) {
		const thumbPath = template.thumb.replace(/\\/g, "/").trim();
		const isCdn = thumbPath.includes("cdn.jsdelivr.net") || thumbPath.includes("github.io") || thumbPath.includes("raw.githubusercontent.com") || thumbPath.startsWith("http");
		visualItems.push({
			id: `thumb-${realSlug}`,
			name: `Thumbnail Utama (${thumbPath.split("/").pop() || realSlug})`,
			localPath: thumbPath,
			cdnUrl: isCdn ? thumbPath : null,
			isSyncedCdn: isCdn,
			fileType: "image",
			fileSize: 0,
			isThumbnail: true,
		});
		seenPaths.add(thumbPath);
	}

	function isExcludedPromoAsset(val: string): boolean {
		const lower = val.toLowerCase();
		return (
			lower.includes("app_store") ||
			lower.includes("appstore") ||
			lower.includes("app-store") ||
			lower.includes("btn_app") ||
			lower.includes("play_store") ||
			lower.includes("playstore") ||
			lower.includes("play-store") ||
			lower.includes("btn_play") ||
			lower.includes("google_play") ||
			lower.includes("google-play") ||
			lower.includes("logo-bri") ||
			lower.includes("logo_bri") ||
			lower.includes("logo-bca") ||
			lower.includes("logo_bca") ||
			lower.includes("logo-mandiri") ||
			lower.includes("logo_mandiri") ||
			lower.includes("logo-bni") ||
			lower.includes("logo_bni") ||
			lower.includes("bank-bri") ||
			lower.includes("bank_bri") ||
			lower.includes("no-image") ||
			lower.includes("noimage") ||
			lower.includes("no_image") ||
			lower.includes("placeholder")
		);
	}

	for (const item of dbAssets) {
		if (isExcludedPromoAsset(item.name) || isExcludedPromoAsset(item.localPath)) {
			continue;
		}
		const ext = (item.fileType || item.name.split(".").pop() || "").toLowerCase();
		if (item.fileType === "image" || imageExts.has(ext)) {
			const normPath = item.localPath.replace(/\\/g, "/").trim();
			if (!seenPaths.has(normPath)) {
				const isRealCdn = Boolean(item.cdnUrl && (item.cdnUrl.startsWith("http://") || item.cdnUrl.startsWith("https://")));
				visualItems.push({
					id: item.id || `db-${realSlug}-${normPath.replace(/[^a-zA-Z0-9]/g, "-")}`,
					name: item.name,
					localPath: normPath,
					cdnUrl: item.cdnUrl || null,
					isSyncedCdn: Boolean(item.isSyncedCdn || isRealCdn),
					fileType: item.fileType || "image",
					fileSize: item.fileSize || 0,
					isThumbnail: false,
				});
				seenPaths.add(normPath);
			}
		}
	}

	try {
		const { existsSync, readdirSync, statSync } = await import("fs");
		const { join } = await import("path");
		const demoImgDir = join(process.cwd(), "public", "demo", realSlug, "assets", "images");
		if (existsSync(demoImgDir)) {
			const files = readdirSync(demoImgDir);
			for (const file of files) {
				if (isExcludedPromoAsset(file)) {
					continue;
				}
				const ext = file.split(".").pop()?.toLowerCase() || "";
				if (imageExts.has(ext)) {
					const localPath = `/demo/${realSlug}/assets/images/${file}`;
					if (!seenPaths.has(localPath)) {
						let size = 0;
						try {
							size = statSync(join(demoImgDir, file)).size;
						} catch {}
						visualItems.push({
							id: `file-${realSlug}-${file.replace(/[^a-zA-Z0-9]/g, "-")}`,
							name: file,
							localPath,
							cdnUrl: null,
							isSyncedCdn: false,
							fileType: "image",
							fileSize: size,
							isThumbnail: false,
						});
						seenPaths.add(localPath);
					}
				}
			}
		}
	} catch {}

	const syncedCount = visualItems.filter((i) => i.isSyncedCdn && i.cdnUrl).length;
	const total = visualItems.length;
	const unSyncedCount = Math.max(0, total - syncedCount);
	const percentage = total > 0 ? Math.round((syncedCount / total) * 100) : 0;

	return {
		template,
		assets: visualItems,
		stats: {
			total,
			syncedCount,
			unSyncedCount,
			percentage,
		},
	};
}

export async function checkCdnHealth(urls: string[]): Promise<Record<string, { ok: boolean; status: number; message: string }>> {
	const result: Record<string, { ok: boolean; status: number; message: string }> = {};
	if (!urls || urls.length === 0) return result;

	const uniqueUrls = Array.from(new Set(urls.filter((u) => u && typeof u === "string" && u.startsWith("http")))).slice(0, 50);

	await Promise.all(
		uniqueUrls.map(async (url) => {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 4000);
				const res = await fetch(url, {
					method: "HEAD",
					signal: controller.signal,
					headers: { "User-Agent": "Aksara-Cinta-CdnCheck" },
				});
				clearTimeout(timeoutId);
				result[url] = {
					ok: res.ok,
					status: res.status,
					message: res.ok ? "200 OK (Aktif & Valid)" : `HTTP ${res.status}`,
				};
			} catch {
				result[url] = {
					ok: false,
					status: 0,
					message: "Gagal terhubung / Timeout",
				};
			}
		}),
	);

	return result;
}
