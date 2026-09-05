import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/invitations";

export const fetchInvitations = createServerFn({ method: "GET" }).handler(() =>
	svc.getInvitations(),
);

export const fetchUserInvitations = createServerFn({ method: "GET" })
	.validator((ownerId: string) => ownerId)
	.handler(({ data }) => svc.getUserInvitations(data));

export const fetchInvitation = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.getInvitationById(data));

export const addInvitation = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createInvitation(data));

export const addInvitationWithEntitlement = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createInvitationWithEntitlement(data));

export const editInvitation = createServerFn({ method: "POST" })
	.validator(
		(payload: { id: string; body: unknown; ownerId?: string }) => payload,
	)
	.handler(({ data }) =>
		svc.updateInvitation(data.id, data.body, data.ownerId),
	);

export const removeInvitation = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteInvitation(data));

export const removeInvitationForOwner = createServerFn({ method: "POST" })
	.validator((payload: { id: string; ownerId: string }) => payload)
	.handler(({ data }) => svc.deleteInvitationForOwner(data.id, data.ownerId));

export const checkSlug = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => svc.slugAvailable(data));

export const generateSlug = createServerFn({ method: "GET" })
	.validator((base: string) => base)
	.handler(({ data }) => svc.generateUniqueSlug(data));
