import { createServerFn } from "@tanstack/react-start";
import {
	saveUploadedFile,
	deployTemplateFileToGitHub,
} from "@/server/upload";
import { z } from "zod";

const UploadSchema = z.object({
	fileData: z.string(),
	folder: z.string().optional().default("avatars"),
	originalName: z.string().optional(),
});

export const uploadImageFn = createServerFn({ method: "POST" })
	.validator((body: unknown) => UploadSchema.parse(body))
	.handler(async ({ data }) => {
		return await saveUploadedFile(
			data.fileData,
			data.folder,
			data.originalName,
		);
	});

const DeployTemplateSchema = z.object({
	slug: z.string(),
	relativePath: z.string(),
	base64Content: z.string(),
});

export const deployTemplateFileFn = createServerFn({ method: "POST" })
	.validator((body: unknown) => DeployTemplateSchema.parse(body))
	.handler(async ({ data }) => {
		return await deployTemplateFileToGitHub(
			data.slug,
			data.relativePath,
			data.base64Content,
		);
	});

const SyncSelectiveSchema = z.object({
	templateSlug: z.string(),
	assetPaths: z.array(z.string()),
	customCategory: z.string().optional(),
});

export const syncSelectiveAssetsFn = createServerFn({ method: "POST" })
	.validator((body: unknown) => SyncSelectiveSchema.parse(body))
	.handler(async ({ data }) => {
		const { syncSelectiveAssetsToGithubCdn } = await import("@/server/upload");
		return await syncSelectiveAssetsToGithubCdn(
			data.templateSlug,
			data.assetPaths,
			data.customCategory,
		);
	});


