import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/konten";

export const fetchPrayers = createServerFn({ method: "GET" }).handler(() =>
	svc.getPrayers(),
);

export const fetchPrayer = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.getPrayerById(data));

export const addPrayer = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createPrayer(data));

export const editPrayer = createServerFn({ method: "POST" })
	.validator((payload: { id: string; body: unknown }) => payload)
	.handler(({ data }) => svc.updatePrayer(data.id, data.body));

export const removePrayer = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deletePrayer(data));

export const fetchQuotes = createServerFn({ method: "GET" }).handler(() =>
	svc.getQuotes(),
);

export const addQuote = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createQuote(data));

export const editQuote = createServerFn({ method: "POST" })
	.validator((payload: { id: string; body: unknown }) => payload)
	.handler(({ data }) => svc.updateQuote(data.id, data.body));

export const removeQuote = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteQuote(data));

export const fetchSacredTexts = createServerFn({ method: "GET" }).handler(() =>
	svc.getSacredTexts(),
);

export const addSacredText = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createSacredText(data));

export const removeSacredText = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteSacredText(data));
