import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

function cleanStr(str: string | undefined, defaultVal = ""): string {
	if (!str) return defaultVal;
	return str.replace(/[\uFEFF\u200B\u200C\u200D\r\n\t]/g, "").trim() || defaultVal;
}

const TOKEN = cleanStr(process.env["GITHUB_STORAGE_TOKEN"]);
const OWNER = cleanStr(
	process.env["GITHUB_STORAGE_OWNER"],
	"ponpesraudhatussalammahato-hue",
);
const REPO = cleanStr(process.env["GITHUB_STORAGE_REPO"], "wedding-cdn");
const BRANCH = cleanStr(process.env["GITHUB_STORAGE_BRANCH"], "main");

export async function saveUploadedFile(
	base64OrDataUrl: string,
	folder = "avatars",
	originalName?: string,
): Promise<{ url: string; uploadedToGitHub: boolean; filename: string }> {
	let ext = "png";
	let base64Data = base64OrDataUrl;

	const dataMatch = base64OrDataUrl.match(
		/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/,
	);
	if (dataMatch) {
		const mime = dataMatch[1].toLowerCase();
		if (mime.includes("audio/mpeg") || mime.includes("audio/mp3")) ext = "mp3";
		else if (mime.includes("audio/wav")) ext = "wav";
		else if (mime.includes("audio/ogg")) ext = "ogg";
		else if (mime.includes("audio/m4a") || mime.includes("audio/mp4"))
			ext = "m4a";
		else if (mime.includes("image/jpeg") || mime.includes("image/jpg"))
			ext = "jpg";
		else if (mime.includes("image/png")) ext = "png";
		else if (mime.includes("image/webp")) ext = "webp";
		else if (mime.includes("image/svg")) ext = "svg";
		else if (mime.includes("image/gif")) ext = "gif";
		base64Data = dataMatch[2] ?? "";
	} else if (base64OrDataUrl.startsWith("data:")) {
		base64Data = base64OrDataUrl.split(",")[1] ?? "";
	}

	const safeMediaExts = new Set([
		"jpg",
		"jpeg",
		"png",
		"webp",
		"gif",
		"svg",
		"mp3",
		"wav",
		"ogg",
		"m4a",
	]);
	if (originalName) {
		const extFromOriginal = originalName.split(".").pop()?.toLowerCase();
		if (extFromOriginal && safeMediaExts.has(extFromOriginal)) {
			ext = extFromOriginal;
		}
	}
	if (!safeMediaExts.has(ext)) {
		ext = "png";
	}

	const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30) || "avatars";
	const buffer = Buffer.from(base64Data, "base64");
	const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 8);
	const timestamp = Date.now();
	const safeBaseName = originalName
		? originalName
				.replace(/\.[^/.]+$/, "")
				.replace(/[^a-zA-Z0-9_-]/g, "-")
				.toLowerCase()
				.slice(0, 25)
		: "asset";
	const filename = `${timestamp}-${safeBaseName}-${hash}.${ext}`;
	const repoPath = `uploads/${safeFolder}/${filename}`;

	try {
		const uploadDir = join(process.cwd(), "public", "uploads", safeFolder);
		await mkdir(uploadDir, { recursive: true });
		await writeFile(join(uploadDir, filename), buffer);
	} catch {
	}


	let uploadedToGitHub = false;
	if (TOKEN && OWNER && REPO) {
		try {
			const ghRes = await fetch(
				`https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${TOKEN}`,
						Accept: "application/vnd.github+json",
						"Content-Type": "application/json",
						"User-Agent": "Aksara-Cinta-Suite",
					},
					body: JSON.stringify({
						message: `upload ${folder} asset ${filename}`,
						content: base64Data,
						branch: BRANCH,
					}),
				},
			);

			if (ghRes.ok || ghRes.status === 201 || ghRes.status === 200) {
				uploadedToGitHub = true;
			}
		} catch {
			uploadedToGitHub = false;
		}
	}

	const jsdelivrUrl = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${repoPath}`;
	return { url: jsdelivrUrl, uploadedToGitHub, filename };
}

export async function deleteUploadedFileFromGitHub(urlOrPath: string): Promise<boolean> {
	if (!urlOrPath || !TOKEN || !OWNER || !REPO) return false;

	let repoPath = "";
	if (urlOrPath.includes("cdn.jsdelivr.net")) {
		const parts = urlOrPath.split(`/${REPO}@${BRANCH}/`);
		if (parts.length > 1 && parts[1]) {
			repoPath = parts[1];
		}
	} else if (urlOrPath.startsWith("/uploads/")) {
		repoPath = urlOrPath.replace(/^\//, "");
	} else if (urlOrPath.startsWith("uploads/")) {
		repoPath = urlOrPath;
	}

	if (!repoPath) return false;

	try {
		const getRes = await fetch(
			`https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${BRANCH}`,
			{
				headers: {
					Authorization: `Bearer ${TOKEN}`,
					Accept: "application/vnd.github+json",
					"User-Agent": "Aksara-Cinta-Suite",
				},
			},
		);

		if (!getRes.ok) return false;
		const data = await getRes.json();
		const sha = data.sha;
		if (!sha) return false;

		const delRes = await fetch(
			`https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${TOKEN}`,
					Accept: "application/vnd.github+json",
					"Content-Type": "application/json",
					"User-Agent": "Aksara-Cinta-Suite",
				},
				body: JSON.stringify({
					message: `delete asset ${repoPath}`,
					sha,
					branch: BRANCH,
				}),
			},
		);

		return delRes.ok;
	} catch {
		return false;
	}
}

export async function deployTemplateFileToGitHub(
	slug: string,
	relativePath: string,
	base64Content: string,
): Promise<{ url: string; success: boolean }> {
	const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 50);
	if (!cleanSlug) {
		throw new Error("Invalid template slug");
	}

	const normalized = relativePath
		.replace(/\\/g, "/")
		.split("/")
		.filter((part) => part && part !== "." && part !== "..")
		.join("/");

	if (!normalized || normalized.includes("..") || normalized.startsWith(".")) {
		throw new Error("Invalid relative path");
	}

	const extMatch = normalized.match(/\.([a-z0-9]+)$/i);
	const ext = extMatch ? extMatch[1].toLowerCase() : "";
	const allowedExtensions = new Set([
		"html",
		"htm",
		"css",
		"js",
		"json",
		"svg",
		"png",
		"jpg",
		"jpeg",
		"webp",
		"gif",
		"mp3",
		"mp4",
		"ogg",
		"wav",
		"woff",
		"woff2",
		"ttf",
		"otf",
		"eot",
		"txt",
		"md",
	]);

	if (!ext || !allowedExtensions.has(ext)) {
		throw new Error("File extension not permitted");
	}

	const repoPath = `demo/${cleanSlug}/${normalized}`;

	let sha: string | undefined;
	try {
		const getRes = await fetch(
			`https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${BRANCH}`,
			{
				headers: {
					Authorization: `Bearer ${TOKEN}`,
					Accept: "application/vnd.github+json",
					"User-Agent": "Aksara-Cinta-Suite",
				},
			},
		);
		if (getRes.ok) {
			const data = await getRes.json();
			sha = data.sha;
		}
	} catch {}

	try {
		const res = await fetch(
			`https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${TOKEN}`,
					Accept: "application/vnd.github+json",
					"Content-Type": "application/json",
					"User-Agent": "Aksara-Cinta-Suite",
				},
				body: JSON.stringify({
					message: `deploy template ${cleanSlug} file ${normalized}`,
					content: base64Content,
					branch: BRANCH,
					...(sha ? { sha } : {}),
				}),
			},
		);

		const ghPagesUrl = `https://${OWNER}.github.io/${REPO}/demo/${cleanSlug}/index.html`;
		return { url: ghPagesUrl, success: res.ok || res.status === 201 };
	} catch {
		const ghPagesUrl = `https://${OWNER}.github.io/${REPO}/demo/${cleanSlug}/index.html`;
		return { url: ghPagesUrl, success: false };
	}
}


export async function syncSelectiveAssetsToGithubCdn(
	templateSlug: string,
	assetPaths: string[],
	customCategory?: string,
): Promise<{ success: boolean; syncedCount: number; uploadedCount: number; results: Array<{ path: string; cdnUrl: string; status: "created" | "updated" | "failed" }> }> {
	const activeToken = cleanStr(process.env["GITHUB_STORAGE_TOKEN"]) || cleanStr(process.env["GITHUB_TOKEN"]) || TOKEN;
	const activeOwner = cleanStr(process.env["GITHUB_STORAGE_OWNER"]) || cleanStr(process.env["GITHUB_OWNER"]) || OWNER || "ponpesraudhatussalammahato-hue";
	const activeRepo = cleanStr(process.env["GITHUB_STORAGE_REPO"]) || cleanStr(process.env["GITHUB_REPO"]) || REPO || "wedding-cdn";
	const activeBranch = cleanStr(process.env["GITHUB_STORAGE_BRANCH"]) || cleanStr(process.env["GITHUB_BRANCH"]) || BRANCH || "main";

	if (!activeToken || !activeOwner || !activeRepo) {
		return { success: false, syncedCount: 0, uploadedCount: 0, results: [] };
	}

	const cleanSlug = cleanStr(templateSlug).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
	const { readFile } = await import("fs/promises");
	const { existsSync } = await import("fs");

	let zip: any = null;
	const zipPath = join(process.cwd(), "TEMPLATES", `${cleanSlug}.zip`);
	if (existsSync(zipPath)) {
		try {
			const zipBuf = await readFile(zipPath);
			const JSZip = (await import("jszip")).default;
			zip = await JSZip.loadAsync(zipBuf);
		} catch {}
	}

	const results: Array<{ path: string; cdnUrl: string; status: "created" | "updated" | "failed" }> = [];
	let syncedCount = 0;

	for (const rawPath of assetPaths) {
		const normalized = rawPath.replace(/\\/g, "/").trim();
		const withoutLeadingSlash = normalized.replace(/^\//, "");
		
		let fileBuf: Buffer | null = null;

		const diskPath1 = join(process.cwd(), "public", withoutLeadingSlash);
		if (existsSync(diskPath1)) {
			try {
				fileBuf = await readFile(diskPath1);
			} catch {}
		}

		if (!fileBuf) {
			const relWithoutDemo = withoutLeadingSlash.replace(new RegExp(`^(public/)?(demo/)?${cleanSlug}/`, "i"), "");
			const diskPath2 = join(process.cwd(), "public", "demo", cleanSlug, relWithoutDemo);
			if (existsSync(diskPath2)) {
				try {
					fileBuf = await readFile(diskPath2);
				} catch {}
			}
		}

		if (!fileBuf && zip) {
			const relWithoutDemo = withoutLeadingSlash.replace(new RegExp(`^(public/)?(demo/)?${cleanSlug}/`, "i"), "");
			const entry = zip.file(relWithoutDemo) || zip.file(withoutLeadingSlash);
			if (entry) {
				try {
					fileBuf = await entry.async("nodebuffer");
				} catch {}
			}
		}

		if (!fileBuf) {
			try {
				const origin = cleanStr(process.env["NEXT_PUBLIC_APP_URL"], "https://simfonicinta.my.id").replace(/\/$/, "");
				const targetUrl = normalized.startsWith("http") ? normalized : `${origin}/${withoutLeadingSlash}`;
				const remoteRes = await fetch(targetUrl);
				if (remoteRes.ok) {
					const ab = await remoteRes.arrayBuffer();
					fileBuf = Buffer.from(ab);
				}
			} catch {}
		}

		if (!fileBuf) {
			results.push({ path: normalized, cdnUrl: "", status: "failed" });
			continue;
		}

		try {
			const base64Content = fileBuf.toString("base64");
			const relPath = withoutLeadingSlash.replace(new RegExp(`^(public/)?(demo/)?${cleanSlug}/`, "i"), "");
			const repoPath = `demo/${cleanSlug}/${relPath}`;

			let sha: string | undefined;
			try {
				const getRes = await fetch(
					`https://api.github.com/repos/${activeOwner}/${activeRepo}/contents/${repoPath}?ref=${activeBranch}`,
					{
						headers: {
							Authorization: `Bearer ${activeToken}`,
							Accept: "application/vnd.github+json",
							"User-Agent": "Aksara-Cinta-Suite",
						},
					},
				);
				if (getRes.ok) {
					const data = await getRes.json();
					sha = data.sha;
				}
			} catch {}

			const putRes = await fetch(
				`https://api.github.com/repos/${activeOwner}/${activeRepo}/contents/${repoPath}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${activeToken}`,
						Accept: "application/vnd.github+json",
						"Content-Type": "application/json",
						"User-Agent": "Aksara-Cinta-Suite",
					},
					body: JSON.stringify({
						message: `sync asset ${cleanSlug}/${relPath}`,
						content: base64Content,
						branch: activeBranch,
						...(sha ? { sha } : {}),
					}),
				},
			);

			const cdnUrl = `https://cdn.jsdelivr.net/gh/${activeOwner}/${activeRepo}@${activeBranch}/${repoPath}`;

			if (putRes.ok || putRes.status === 201 || putRes.status === 200) {
				syncedCount++;
				results.push({
					path: normalized,
					cdnUrl,
					status: sha ? "updated" : "created",
				});

				try {
					const { db } = await import("@/lib/db/client");
					const { templateAssetItems } = await import("@/lib/db/schema");
					const { eq, and } = await import("drizzle-orm");

					const existing = await db
						.select()
						.from(templateAssetItems)
						.where(
							and(
								eq(templateAssetItems.templateSlug, cleanSlug),
								eq(templateAssetItems.localPath, normalized),
							),
						)
						.limit(1);

					if (existing.length > 0 && existing[0]) {
						await db
							.update(templateAssetItems)
							.set({
								isSyncedCdn: true,
								cdnUrl,
							})
							.where(eq(templateAssetItems.id, existing[0].id));
					} else {
						const ext = normalized.split(".").pop()?.toLowerCase() || "";
						await db.insert(templateAssetItems).values({
							id: `ast-${cleanSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
							templateSlug: cleanSlug,
							name: normalized.split("/").pop() || normalized,
							fileType: ext,
							fileSize: fileBuf.length,
							localPath: normalized,
							cdnUrl,
							isSyncedCdn: true,
							createdAt: new Date(),
						});
					}
					const { templates } = await import("@/lib/db/schema");
					const currentT = await db.select({ thumb: templates.thumb }).from(templates).where(eq(templates.slug, cleanSlug)).limit(1);
					if (currentT.length > 0 && currentT[0]?.thumb) {
						const currentThumb = currentT[0].thumb.replace(/\\/g, "/").trim();
						const filename = normalized.split("/").pop() || "";
						if (currentThumb === normalized || (filename && currentThumb.endsWith(filename))) {
							await db.update(templates).set({ thumb: cdnUrl }).where(eq(templates.slug, cleanSlug));
						}
					}

					const fileName = normalized.split("/").pop() || normalized;
					const ext = fileName.split(".").pop()?.toLowerCase() || "";
					const imageExts = new Set(["jpg", "jpeg", "png", "webp", "svg", "gif"]);
					const audioExts = new Set(["mp3", "wav", "ogg", "m4a"]);

					if (imageExts.has(ext)) {
						const { assets } = await import("@/lib/db/schema");
						const existingAsset = await db
							.select({ id: assets.id })
							.from(assets)
							.where(eq(assets.url, cdnUrl))
							.limit(1);

						if (existingAsset.length === 0) {
							let cat = customCategory || "Ornamen";
							if (!customCategory) {
								const lower = (normalized + " " + fileName).toLowerCase();
								if (lower.includes("gallery") || lower.includes("foto") || lower.includes("couple") || lower.includes("pasangan")) {
									cat = "Foto Pasangan";
								} else if (lower.includes("frame") || lower.includes("bingkai") || lower.includes("border")) {
									cat = "Bingkai / Frame";
								} else if (lower.includes("bg") || lower.includes("background")) {
									cat = "Background";
								} else if (lower.includes("cover") || lower.includes("thumb") || lower.includes("thumbnail")) {
									cat = "Thumbnail / Cover";
								} else if (lower.includes("icon") || lower.includes("logo")) {
									cat = "Icon";
								} else if (lower.includes("dekorasi") || lower.includes("decoration")) {
									cat = "Dekorasi";
								}
							}
							const sizeStr = fileBuf.length < 1024 ? `${fileBuf.length} B` : `${(fileBuf.length / 1024).toFixed(1)} KB`;
							await db.insert(assets).values({
								id: `ast-${cleanSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
								name: fileName,
								category: cat,
								size: sizeStr,
								url: cdnUrl,
							});
						}
					} else if (audioExts.has(ext)) {
						const { music } = await import("@/lib/db/schema");
						const existingMusic = await db
							.select({ id: music.id })
							.from(music)
							.where(eq(music.url, cdnUrl))
							.limit(1);

						if (existingMusic.length === 0) {
							await db.insert(music).values({
								id: `mus-${cleanSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
								title: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
								artist: cleanSlug,
								genre: "Tradisional",
								duration: "03:30",
								url: cdnUrl,
							});
						}
					}
				} catch {}
			} else {
				results.push({ path: normalized, cdnUrl: "", status: "failed" });
			}
		} catch {
			results.push({ path: normalized, cdnUrl: "", status: "failed" });
		}
	}

	if (syncedCount > 0) {
		try {
			const { invalidate } = await import("@/lib/redis/client");
			await invalidate(
				`api:template:assets:${cleanSlug}`,
				"api:templates:stats",
				"api:templates",
				"api:assets",
				"api:music",
			);
		} catch {}
	}

	return {
		success: syncedCount > 0,
		syncedCount,
		uploadedCount: syncedCount,
		results,
	};
}

