import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/entitlements";

export const fetchUserEntitlements = createServerFn({ method: "GET" })
	.validator((ownerIdentifier: string) => ownerIdentifier)
	.handler(({ data }) => svc.getUserEntitlements(data));

export const fetchAvailableEntitlementCount = createServerFn({ method: "GET" })
	.validator((ownerIdentifier: string) => ownerIdentifier)
	.handler(({ data }) => svc.getAvailableEntitlementCount(data));

export const fetchAvailableEntitlementForTemplate = createServerFn({
	method: "GET",
})
	.validator(
		(payload: { ownerIdentifier: string; templateId?: string }) => payload,
	)
	.handler(({ data }) =>
		svc.getAvailableEntitlementForTemplate(
			data.ownerIdentifier,
			data.templateId,
		),
	);
