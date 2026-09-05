import { createServerFn } from "@tanstack/react-start";
import * as geminiService from "@/server/gemini";
import * as settingsService from "@/server/settings";

export const getGeminiRotationStatsFn = createServerFn({ method: "GET" })
	.handler(async () => {
		return geminiService.getGeminiRotationStats();
	});

export const testGeminiConnectionFn = createServerFn({ method: "POST" })
	.validator(
		(data: { customKey?: string; customModel?: string } | undefined) => data,
	)
	.handler(async ({ data }) => {
		return geminiService.testGeminiConnection(
			data?.customKey,
			data?.customModel,
		);
	});

export const generateTemplatePromoFn = createServerFn({ method: "POST" })
	.validator(
		(data: {
			templateSlug: string;
			platform?: "instagram" | "tiktok" | "all";
			tone?: string;
			customBrief?: string;
			selectedCdnAssets?: string[];
		}) => data,
	)
	.handler(async ({ data }) => {
		return geminiService.generateTemplatePromotion(data);
	});

export const generateImagePromptFn = createServerFn({ method: "POST" })
	.validator(
		(data: {
			concept: string;
			templateSlug?: string;
			aspectRatio?: string;
			style?: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		return geminiService.generateImagePrompts(data);
	});

export const generateVideoPromptFn = createServerFn({ method: "POST" })
	.validator(
		(data: {
			concept: string;
			templateSlug?: string;
			cameraMotion?: string;
			durationSeconds?: number;
		}) => data,
	)
	.handler(async ({ data }) => {
		return geminiService.generateVideoPrompts(data);
	});

export const saveGeminiConfigFn = createServerFn({ method: "POST" })
	.validator(
		(data: {
			geminiApiKey?: string;
			geminiApiKeys?: string[];
			geminiModel: string;
			geminiTone: string;
			geminiCustomPrompt?: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		const current = await settingsService.getAdminSettings();
		const keys = data.geminiApiKeys !== undefined ? data.geminiApiKeys : current.geminiApiKeys;
		const updated = {
			...current,
			geminiApiKey: data.geminiApiKey !== undefined ? data.geminiApiKey : current.geminiApiKey,
			geminiApiKeys: keys,
			geminiModel: data.geminiModel,
			geminiTone: data.geminiTone,
			geminiCustomPrompt: data.geminiCustomPrompt || "",
		};
		return settingsService.saveAdminSettings(updated);
	});

export const generateUnifiedPromoStudioFn = createServerFn({ method: "POST" })
	.validator(
		(data: {
			templateSlug?: string;
			aspectRatio?: string;
			platform?: string;
			tone?: string;
			angle?: string;
			targetAudience?: string;
			cta?: string;
			customBrief?: string;
			contentType?: "all" | "visual" | "video";
			cameraMotion?: string;
			selectedCdnAssets?: string[];
		}) => data,
	)
	.handler(async ({ data }) => {
		return geminiService.generateUnifiedPromoStudio(data);
	});
