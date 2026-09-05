import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/media";

export const fetchMusic = createServerFn({ method: "GET" }).handler(() =>
	svc.getMusic(),
);

export const addMusic = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createMusic(data));

export const removeMusic = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteMusic(data));

export const fetchAssets = createServerFn({ method: "GET" }).handler(() =>
	svc.getAssets(),
);

export const addAsset = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createAsset(data));

export const editAsset = createServerFn({ method: "POST" })
	.validator((payload: any) => payload)
	.handler(({ data }) => {
		if (data && typeof data === "object") {
			if ("body" in data && data.body) {
				return svc.updateAsset(data.id, data.body);
			}
			const { id, ...rest } = data;
			return svc.updateAsset(id, rest);
		}
		return null;
	});

export const bulkEditAssetCategory = createServerFn({ method: "POST" })
	.validator((payload: { ids: string[]; category: string }) => payload)
	.handler(({ data }) => svc.bulkUpdateAssetCategory(data.ids, data.category));

export const removeAsset = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteAsset(data));

export const fetchTemplates = createServerFn({ method: "GET" }).handler(() =>
	svc.getTemplates(),
);

export const fetchTemplate = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.getTemplateById(data));

export const addTemplate = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createTemplate(data));

export const editTemplate = createServerFn({ method: "POST" })
	.validator((payload: any) => payload)
	.handler(({ data }) => {
		if (data && typeof data === "object") {
			if ("body" in data && data.body) {
				return svc.updateTemplate(data.id, data.body);
			}
			const { id, ...rest } = data;
			return svc.updateTemplate(id, rest);
		}
		return null;
	});

export const fetchTemplateCategories = createServerFn({
	method: "GET",
}).handler(() => svc.getTemplateCategories());

export const addTemplateCategory = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createTemplateCategory(data));

export const editTemplateCategory = createServerFn({ method: "POST" })
	.validator((payload: any) => payload)
	.handler(({ data }) => {
		if (data && typeof data === "object") {
			if ("body" in data && data.body) {
				return svc.updateTemplateCategory(data.id, data.body);
			}
			const { id, ...rest } = data;
			return svc.updateTemplateCategory(id, rest);
		}
		return null;
	});

export const removeTemplateCategory = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteTemplateCategory(data));

export const removeTemplate = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteTemplate(data));

export const fetchTemplateBySlug = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.getTemplateBySlug(data));

export const resolveTemplateDemoUrl = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.resolveTemplateDemoUrl(data));
