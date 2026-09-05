import { createServerFn } from "@tanstack/react-start";
import * as svc from "@/server/guestbook";

export const fetchGuestbookEvents = createServerFn({ method: "GET" })
	.validator((userEmail: string) => userEmail)
	.handler(({ data }) => svc.getGuestbookEvents(data));

export const fetchGuestbookEvent = createServerFn({ method: "GET" })
	.validator((payload: { eventId: string; userEmail: string }) => payload)
	.handler(({ data }) => svc.getGuestbookEventById(data.eventId, data.userEmail));

export const addGuestbookEvent = createServerFn({ method: "POST" })
	.validator((payload: { body: unknown; userEmail: string }) => payload)
	.handler(({ data }) => svc.createGuestbookEvent(data.body, data.userEmail));

export const editGuestbookEvent = createServerFn({ method: "POST" })
	.validator(
		(payload: { eventId: string; body: unknown; userEmail: string }) => payload,
	)
	.handler(({ data }) =>
		svc.updateGuestbookEvent(data.eventId, data.body, data.userEmail),
	);

export const removeGuestbookEvent = createServerFn({ method: "POST" })
	.validator((payload: { eventId: string; userEmail: string }) => payload)
	.handler(({ data }) =>
		svc.deleteGuestbookEvent(data.eventId, data.userEmail),
	);

export const fetchGuestCategories = createServerFn({ method: "GET" })
	.validator((payload: { eventId: string; userEmail: string }) => payload)
	.handler(({ data }) => svc.getGuestCategories(data.eventId, data.userEmail));

export const addGuestCategory = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			body: { name: string; color?: string };
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.createGuestCategory(data.eventId, data.body, data.userEmail),
	);

export const removeGuestCategory = createServerFn({ method: "POST" })
	.validator(
		(payload: { categoryId: string; eventId: string; userEmail: string }) =>
			payload,
	)
	.handler(({ data }) =>
		svc.deleteGuestCategory(data.categoryId, data.eventId, data.userEmail),
	);

export const fetchEventGuests = createServerFn({ method: "GET" })
	.validator(
		(payload: {
			eventId: string;
			userEmail: string;
			filters?: {
				search?: string;
				categoryId?: string;
				rsvpStatus?: string;
				isAttended?: boolean;
			};
		}) => payload,
	)
	.handler(({ data }) =>
		svc.getEventGuests(data.eventId, data.userEmail, data.filters),
	);

export const fetchGuestDetail = createServerFn({ method: "GET" })
	.validator(
		(payload: { guestId: string; eventId: string; userEmail: string }) => payload,
	)
	.handler(({ data }) =>
		svc.getGuestDetail(data.guestId, data.eventId, data.userEmail),
	);

export const addEventGuest = createServerFn({ method: "POST" })
	.validator(
		(payload: { eventId: string; body: unknown; userEmail: string }) => payload,
	)
	.handler(({ data }) => svc.createGuest(data.eventId, data.body, data.userEmail));

export const editEventGuest = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			guestId: string;
			eventId: string;
			body: unknown;
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.updateGuest(data.guestId, data.eventId, data.body, data.userEmail),
	);

export const removeEventGuest = createServerFn({ method: "POST" })
	.validator(
		(payload: { guestId: string; eventId: string; userEmail: string }) => payload,
	)
	.handler(({ data }) =>
		svc.deleteGuest(data.guestId, data.eventId, data.userEmail),
	);

export const bulkEditGuests = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			guestIds: string[];
			updates: {
				categoryId?: string;
				categoryName?: string;
				rsvpStatus?: "pending" | "attending" | "maybe" | "not_attending";
			};
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.bulkUpdateGuests(
			data.eventId,
			data.guestIds,
			data.updates,
			data.userEmail,
		),
	);

export const bulkRemoveGuests = createServerFn({ method: "POST" })
	.validator(
		(payload: { eventId: string; guestIds: string[]; userEmail: string }) =>
			payload,
	)
	.handler(({ data }) =>
		svc.bulkDeleteGuests(data.eventId, data.guestIds, data.userEmail),
	);

export const checkInAttendance = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			guestId: string;
			body: { paxActual: number; recordedBy?: string; notes?: string };
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.recordAttendance(
			data.eventId,
			data.guestId,
			data.body,
			data.userEmail,
		),
	);

export const editAttendancePax = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			guestId: string;
			paxActual: number;
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.updateAttendancePax(
			data.eventId,
			data.guestId,
			data.paxActual,
			data.userEmail,
		),
	);

export const cancelGuestAttendance = createServerFn({ method: "POST" })
	.validator(
		(payload: { eventId: string; guestId: string; userEmail: string }) => payload,
	)
	.handler(({ data }) =>
		svc.cancelAttendance(data.eventId, data.guestId, data.userEmail),
	);

export const fetchGuestbookMessages = createServerFn({ method: "GET" })
	.validator(
		(payload: {
			eventId: string;
			userEmail: string;
			status?: "pending" | "approved" | "rejected" | "all";
		}) => payload,
	)
	.handler(({ data }) =>
		svc.getGuestbookMessages(data.eventId, data.userEmail, data.status),
	);

export const addGuestbookMessage = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			body: { senderName: string; message: string; guestId?: string };
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.createGuestbookMessage(data.eventId, data.body, data.userEmail),
	);

export const moderateMessage = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			messageId: string;
			eventId: string;
			status: "pending" | "approved" | "rejected";
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.moderateGuestbookMessage(
			data.messageId,
			data.eventId,
			data.status,
			data.userEmail,
		),
	);

export const removeGuestbookMessage = createServerFn({ method: "POST" })
	.validator(
		(payload: { messageId: string; eventId: string; userEmail: string }) =>
			payload,
	)
	.handler(({ data }) =>
		svc.deleteGuestbookMessage(data.messageId, data.eventId, data.userEmail),
	);

export const importGuests = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			rows: Array<{
				name?: string;
				phone?: string;
				email?: string;
				category?: string;
				pax?: string | number;
				rsvp?: string;
				notes?: string;
			}>;
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.importGuestsCsv(data.eventId, data.rows, data.userEmail),
	);

export const exportGuests = createServerFn({ method: "GET" })
	.validator(
		(payload: {
			eventId: string;
			exportType: "all" | "rsvp" | "attended" | "messages";
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.exportGuestsData(data.eventId, data.exportType, data.userEmail),
	);

export const fetchEventAnalytics = createServerFn({ method: "GET" })
	.validator((payload: { eventId: string; userEmail: string }) => payload)
	.handler(({ data }) => svc.getEventAnalytics(data.eventId, data.userEmail));

export const fetchActivityLogs = createServerFn({ method: "GET" })
	.validator((payload: { eventId: string; userEmail: string }) => payload)
	.handler(({ data }) =>
		svc.getGuestbookActivityLogs(data.eventId, data.userEmail),
	);

export const checkGuestbookAccess = createServerFn({ method: "GET" })
	.validator((userEmail: string) => userEmail)
	.handler(({ data }) => svc.checkGuestbookEligibility(data));

export const toggleSouvenirStatus = createServerFn({ method: "POST" })
	.validator(
		(payload: {
			eventId: string;
			guestId: string;
			isTaken: boolean;
			count: number;
			userEmail: string;
		}) => payload,
	)
	.handler(({ data }) =>
		svc.toggleGuestSouvenir(
			data.eventId,
			data.guestId,
			data.isTaken,
			data.count,
			data.userEmail,
		),
	);

export const syncInvitationPrayers = createServerFn({ method: "POST" })
	.validator((payload: { eventId: string; userEmail: string }) => payload)
	.handler(({ data }) =>
		svc.syncPublicPrayersToGuestbook(data.eventId, data.userEmail),
	);


