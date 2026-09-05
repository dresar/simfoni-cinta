import { readdir, stat, readFile } from "fs/promises";
import { join, basename, extname, relative } from "path";
import { db } from "@/lib/db/client";
import { templates, templateAssetFolders, templateAssetItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import JSZip from "jszip";

interface AssetFile {
	name: string;
	path: string;
	size: number;
	type: string;
	isSynced: boolean;
	cdnUrl?: string;
}

interface AssetFolder {
	id: string;
	name: string;
	path: string;
	fileCount: number;
	totalSize: number;
	files: AssetFile[];
}

interface TemplateAssetInspection {
	slug: string;
	totalFiles: number;
	totalSize: number;
	folders: AssetFolder[];
	hasZip: boolean;
	hasExtracted: boolean;
	scannedAt: string;
}

const FOLDER_CATEGORIES = {
	"Cover & Background": ["bg.webp", "bm.webp", "cover.webp", "backdrop.webp"],
	"Ornaments & Graphics": ["tl.webp", "tr.webp", "bl.webp", "br.webp", "tm.webp", "left.webp", "right.webp"],
	"Background Audio": [".mp3", ".wav", ".ogg", ".m4a"],
	"Typography & Fonts": [".woff2", ".woff", ".ttf", ".otf"],
	"Stylesheets": [".css"],
	"Runtime Scripts": [".js"],
	"Master HTML": ["index.html"],
	"Gallery Images": ["-gallery-", "gallery"],
	"Venue & Maps": ["venue", "map"],
	"Payment & QR": ["qr", "payment", "logo-"],
	"Other Assets": []
};

function categorizeFile(filename: string, filepath: string): string {
	const lowerName = filename.toLowerCase();
	const lowerPath = filepath.toLowerCase();
	const ext = extname(filename).toLowerCase();

	for (const [category, patterns] of Object.entries(FOLDER_CATEGORIES)) {
		if (category === "Other Assets") continue;

		for (const pattern of patterns) {
			if (pattern.startsWith(".")) {
				if (ext === pattern) return category;
			} else {
				if (lowerName.includes(pattern) || lowerPath.includes(pattern)) {
					return category;
				}
			}
		}
	}

	return "Other Assets";
}

function getFileType(filename: string): string {
	const ext = extname(filename).toLowerCase();
	const typeMap: Record<string, string> = {
		".webp": "image",
		".jpg": "image",
		".jpeg": "image",
		".png": "image",
		".gif": "image",
		".svg": "image",
		".mp3": "audio",
		".wav": "audio",
		".ogg": "audio",
		".m4a": "audio",
		".woff2": "font",
		".woff": "font",
		".ttf": "font",
		".otf": "font",
		".css": "stylesheet",
		".js": "script",
		".html": "html"
	};
	return typeMap[ext] || "other";
}

async function checkCdnSync(slug: string, filepath: string): Promise<{ synced: boolean; url?: string }> {
	try {
		const items = await db
			.select()
			.from(templateAssetItems)
			.where(
				and(
					eq(templateAssetItems.templateSlug, slug),
					eq(templateAssetItems.localPath, filepath)
				)
			)
			.limit(1);

		if (items.length > 0 && items[0].isSyncedCdn) {
			return { synced: true, url: items[0].cdnUrl || undefined };
		}
	} catch {}
	return { synced: false };
}

async function scanZipArchive(zipPath: string, slug: string): Promise<TemplateAssetInspection> {
	const buffer = await readFile(zipPath);
	const zip = await JSZip.loadAsync(buffer);

	const folderMap = new Map<string, AssetFile[]>();
	let totalSize = 0;
	let totalFiles = 0;

	for (const [filepath, zipEntry] of Object.entries(zip.files)) {
		if (zipEntry.dir) continue;

		const filename = basename(filepath);
		if (filename.startsWith(".") || filename === "") continue;

		const fileData = await zipEntry.async("uint8array");
		const fileSize = fileData.length;
		totalSize += fileSize;
		totalFiles++;

		const category = categorizeFile(filename, filepath);
		const fileType = getFileType(filename);
		const cdnCheck = await checkCdnSync(slug, filepath);

		const assetFile: AssetFile = {
			name: filename,
			path: filepath,
			size: fileSize,
			type: fileType,
			isSynced: cdnCheck.synced,
			cdnUrl: cdnCheck.url
		};

		if (!folderMap.has(category)) {
			folderMap.set(category, []);
		}
		folderMap.get(category)!.push(assetFile);
	}

	const folders: AssetFolder[] = [];
	for (const [categoryName, files] of folderMap.entries()) {
		const folderTotalSize = files.reduce((sum, f) => sum + f.size, 0);
		folders.push({
			id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
			name: categoryName,
			path: categoryName,
			fileCount: files.length,
			totalSize: folderTotalSize,
			files: files.sort((a, b) => a.name.localeCompare(b.name))
		});
	}

	return {
		slug,
		totalFiles,
		totalSize,
		folders: folders.sort((a, b) => b.totalSize - a.totalSize),
		hasZip: true,
		hasExtracted: false,
		scannedAt: new Date().toISOString()
	};
}

async function scanExtractedDirectory(dirPath: string, slug: string): Promise<TemplateAssetInspection> {
	const folderMap = new Map<string, AssetFile[]>();
	let totalSize = 0;
	let totalFiles = 0;

	async function walkDirectory(currentPath: string) {
		const entries = await readdir(currentPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(currentPath, entry.name);

			if (entry.isDirectory()) {
				await walkDirectory(fullPath);
			} else {
				if (entry.name.startsWith(".")) continue;

				const stats = await stat(fullPath);
				const fileSize = stats.size;
				totalSize += fileSize;
				totalFiles++;

				const relativePath = relative(dirPath, fullPath).replace(/\\/g, "/");
				const category = categorizeFile(entry.name, relativePath);
				const fileType = getFileType(entry.name);
				const cdnCheck = await checkCdnSync(slug, relativePath);

				const assetFile: AssetFile = {
					name: entry.name,
					path: relativePath,
					size: fileSize,
					type: fileType,
					isSynced: cdnCheck.synced,
					cdnUrl: cdnCheck.url
				};

				if (!folderMap.has(category)) {
					folderMap.set(category, []);
				}
				folderMap.get(category)!.push(assetFile);
			}
		}
	}

	await walkDirectory(dirPath);

	const folders: AssetFolder[] = [];
	for (const [categoryName, files] of folderMap.entries()) {
		const folderTotalSize = files.reduce((sum, f) => sum + f.size, 0);
		folders.push({
			id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
			name: categoryName,
			path: categoryName,
			fileCount: files.length,
			totalSize: folderTotalSize,
			files: files.sort((a, b) => a.name.localeCompare(b.name))
		});
	}

	return {
		slug,
		totalFiles,
		totalSize,
		folders: folders.sort((a, b) => b.totalSize - a.totalSize),
		hasZip: false,
		hasExtracted: true,
		scannedAt: new Date().toISOString()
	};
}

export async function inspectTemplateAssets(params: { slug: string }): Promise<TemplateAssetInspection> {
	const { slug } = z.object({ slug: z.string() }).parse(params);

	const zipPath = join(process.cwd(), "TEMPLATES", `${slug}.zip`);
	const extractedPath = join(process.cwd(), "public", "demo", slug);

	try {
		await stat(zipPath);
		return await scanZipArchive(zipPath, slug);
	} catch {
		try {
			await stat(extractedPath);
			return await scanExtractedDirectory(extractedPath, slug);
		} catch {
			throw new Error(`Template ${slug} not found in TEMPLATES/ or public/demo/`);
		}
	}
}

export async function getTemplateAssetTree(params: { slug: string }) {
	const inspection = await inspectTemplateAssets(params);
	return {
		slug: inspection.slug,
		tree: inspection.folders.map(folder => ({
			id: folder.id,
			name: folder.name,
			type: "folder",
			fileCount: folder.fileCount,
			totalSize: folder.totalSize,
			children: folder.files.map(file => ({
				id: `${folder.id}-${file.name}`,
				name: file.name,
				type: "file",
				size: file.size,
				fileType: file.type,
				isSynced: file.isSynced,
				cdnUrl: file.cdnUrl
			}))
		}))
	};
}

export async function detectAssetTypes(params: { slug: string }) {
	const inspection = await inspectTemplateAssets(params);

	const typeStats = new Map<string, { count: number; totalSize: number }>();

	for (const folder of inspection.folders) {
		for (const file of folder.files) {
			const current = typeStats.get(file.type) || { count: 0, totalSize: 0 };
			current.count++;
			current.totalSize += file.size;
			typeStats.set(file.type, current);
		}
	}

	return {
		slug: inspection.slug,
		types: Array.from(typeStats.entries()).map(([type, stats]) => ({
			type,
			count: stats.count,
			totalSize: stats.totalSize,
			percentage: ((stats.totalSize / inspection.totalSize) * 100).toFixed(2)
		})).sort((a, b) => b.totalSize - a.totalSize)
	};
}

export async function getAssetDetails(params: { slug: string; assetPath: string }) {
	const { slug, assetPath } = z.object({
		slug: z.string(),
		assetPath: z.string()
	}).parse(params);

	const inspection = await inspectTemplateAssets({ slug });

	for (const folder of inspection.folders) {
		const file = folder.files.find(f => f.path === assetPath);
		if (file) {
			return {
				slug,
				folder: folder.name,
				file: {
					name: file.name,
					path: file.path,
					size: file.size,
					type: file.type,
					isSynced: file.isSynced,
					cdnUrl: file.cdnUrl,
					extension: extname(file.name).toLowerCase(),
					sizeFormatted: formatBytes(file.size)
				}
			};
		}
	}

	throw new Error(`Asset ${assetPath} not found in template ${slug}`);
}

export async function scanAllTemplates() {
	const templatesDir = join(process.cwd(), "TEMPLATES");

	try {
		const files = await readdir(templatesDir);
		const zipFiles = files.filter(f => f.endsWith(".zip"));

		const results = [];
		for (const zipFile of zipFiles) {
			const slug = basename(zipFile, ".zip");
			try {
				const inspection = await inspectTemplateAssets({ slug });
				results.push({
					slug,
					success: true,
					totalFiles: inspection.totalFiles,
					totalSize: inspection.totalSize,
					folderCount: inspection.folders.length
				});
			} catch (error) {
				results.push({
					slug,
					success: false,
					error: error instanceof Error ? error.message : "Unknown error"
				});
			}
		}

		return {
			total: zipFiles.length,
			scanned: results.filter(r => r.success).length,
			failed: results.filter(r => !r.success).length,
			results
		};
	} catch (error) {
		throw new Error(`Failed to scan TEMPLATES directory: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}

export async function syncAssetToDatabase(params: {
	slug: string;
	assetPath: string;
	cdnUrl: string;
}) {
	const { slug, assetPath, cdnUrl } = z.object({
		slug: z.string(),
		assetPath: z.string(),
		cdnUrl: z.string().url()
	}).parse(params);

	const details = await getAssetDetails({ slug, assetPath });

	const assetId = `asset-${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

	await db.insert(templateAssetItems).values({
		id: assetId,
		templateSlug: slug,
		name: details.file.name,
		fileType: details.file.type,
		fileSize: details.file.size,
		localPath: assetPath,
		cdnUrl,
		isSyncedCdn: true,
		folderId: null
	}).onConflictDoUpdate({
		target: [templateAssetItems.templateSlug, templateAssetItems.localPath],
		set: {
			cdnUrl,
			isSyncedCdn: true
		}
	});

	return { success: true, assetId, cdnUrl };
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
