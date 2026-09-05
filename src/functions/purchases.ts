import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/purchases";

export const fetchUserPurchases = createServerFn({ method: "GET" })
	.validator((userId: string) => userId)
	.handler(({ data }) => svc.getTemplatePurchasesByUser(data));

export const createPurchaseOrder = createServerFn({ method: "POST" })
	.validator((payload: { body: unknown; baseUrl: string }) => payload)
	.handler(({ data }) => svc.createTemplatePurchase(data.body, data.baseUrl));

export const verifyPurchaseAndGrant = createServerFn({ method: "POST" })
	.validator((orderId: string) => orderId)
	.handler(({ data }) => svc.verifyAndGrantEntitlement(data));

export { fetchUserEntitlements } from "./entitlements";
