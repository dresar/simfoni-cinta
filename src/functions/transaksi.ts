import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/transaksi";

export const fetchRsvps = createServerFn({ method: "GET" })
	.validator((slug?: string) => slug)
	.handler(({ data }) => svc.getRsvps(data));


export const addRsvp = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createRsvp(data));

export const removeRsvp = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteRsvp(data));

export const fetchOrders = createServerFn({ method: "GET" }).handler(() =>
	svc.getOrders(),
);

export const addOrder = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createOrder(data));

export const editOrderStatus = createServerFn({ method: "POST" })
	.validator((payload: { id: string; body: unknown }) => payload)
	.handler(({ data }) => svc.updateOrder(data.id, data.body));

export const fetchGuests = createServerFn({ method: "GET" })
	.validator(
		(payload?: { ownerId?: string; invitationId?: string }) => payload,
	)
	.handler(({ data }) => svc.getGuests(data));

export const addGuest = createServerFn({ method: "POST" })
	.validator((body: unknown) => body)
	.handler(({ data }) => svc.createGuest(data));

export const editGuest = createServerFn({ method: "POST" })
	.validator((payload: { id: string; body: unknown }) => payload)
	.handler(({ data }) => svc.updateGuest(data.id, data.body));

export const removeGuest = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(({ data }) => svc.deleteGuest(data));
