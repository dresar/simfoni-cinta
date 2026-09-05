import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/templates";

export const fetchTemplates = createServerFn({ method: "GET" })
	.validator((opts?: svc.TemplateQueryOptions) => opts || {})
	.handler(({ data }) => svc.getTemplates(data));

export const fetchTemplateBySlug = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.getTemplateBySlug(data));

export const fetchTemplateStats = createServerFn({ method: "GET" })
	.handler(() => svc.getTemplateStats());

export const fetchCategoriesSummary = createServerFn({ method: "GET" })
	.handler(() => svc.getCategoriesSummary());

export const updateTemplateMeta = createServerFn({ method: "POST" })
	.validator((payload: { slug: string; data: Partial<svc.NewTemplate> }) => payload)
	.handler(({ data }) => svc.updateTemplate(data.slug, data.data));

export const fetchTemplateAssets = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.getTemplateAssets(data));

export const fetchTemplatePromoAssetsFn = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.getTemplatePromoAssets(data));

export const checkCdnHealthFn = createServerFn({ method: "POST" })
	.validator((urls: string[]) => urls)
	.handler(({ data }) => svc.checkCdnHealth(data));

export const syncTemplateCdnAssetsFn = createServerFn({ method: "POST" })
	.validator((payload: { slug: string; assetPaths: string[] }) => payload)
	.handler(async ({ data }) => {
		const { syncSelectiveAssetsToGithubCdn } = await import("@/server/upload");
		const res = await syncSelectiveAssetsToGithubCdn(data.slug, data.assetPaths);
		await svc.invalidateTemplateCaches(data.slug);
		return res;
	});

export const removeTemplate = createServerFn({ method: "POST" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.deleteTemplate(data));
