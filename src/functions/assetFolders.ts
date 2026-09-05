import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/assetFolders";

export const addAssetFolder = createServerFn({ method: "POST" })
	.validator((input: { templateSlug: string; folderName: string; parentFolderId?: string; color?: string }) => input)
	.handler(({ data }) => svc.createAssetFolder(data));

export const updateAssetFolder = createServerFn({ method: "POST" })
	.validator((input: { folderId: string; newFolderName: string }) => input)
	.handler(({ data }) => svc.renameAssetFolder(data));

export const removeAssetFolder = createServerFn({ method: "POST" })
	.validator((folderId: string) => folderId)
	.handler(({ data }) => svc.deleteAssetFolder(data));

export const moveAsset = createServerFn({ method: "POST" })
	.validator((input: { assetId: string; targetFolderId: string | null }) => input)
	.handler(({ data }) => svc.moveAssetToFolder(data.assetId, data.targetFolderId));

export const fetchCustomFolders = createServerFn({ method: "GET" })
	.validator((templateSlug: string) => templateSlug)
	.handler(({ data }) => svc.getTemplateCustomFolders(data));
