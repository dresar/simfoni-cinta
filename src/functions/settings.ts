import { createServerFn } from "@tanstack/react-start";
import * as settingsService from "@/server/settings";

export const fetchAdminSettings = createServerFn({ method: "GET" }).handler(
	() => settingsService.getAdminSettings(),
);

export const updateAdminSettings = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => settingsService.saveAdminSettings(data));
