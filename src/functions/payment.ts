import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createMayarPayment } from "@/lib/mayar";
import { getAdminSettings, DEFAULT_PACKAGES } from "@/server/settings";

const CheckoutSchema = z.object({
	packageId: z.enum(["silver", "gold", "platinum"]),
	packageName: z.string(),
	amount: z.number().optional(),
	customerName: z.string(),
	customerEmail: z.string(),
	customerPhone: z.string().optional(),
});

export const createMayarCheckoutFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => CheckoutSchema.parse(data))
	.handler(async ({ data }) => {
		const settings = await getAdminSettings();
		const matchedPkg =
			settings.packages.find((p) => p.id === data.packageId) ||
			DEFAULT_PACKAGES.find((p) => p.id === data.packageId);
		const canonicalAmount = matchedPkg
			? matchedPkg.price
			: data.amount && data.amount > 0
				? data.amount
				: 15000;

		const appUrl = (
			process.env.NEXT_PUBLIC_APP_URL || "https://simfonicinta.my.id"
		).replace(/\/$/, "");
		const reference = `INV-${Date.now().toString().slice(-6)}-${data.packageId.toUpperCase()}`;
		const redirectUrl = `${appUrl}/dasbor/pembelian?status=success&orderId=${reference}`;

		const res = await createMayarPayment({
			reference,
			amount: canonicalAmount,
			customerName: data.customerName,
			customerEmail: data.customerEmail,
			customerPhone: data.customerPhone || "082392115909",
			description: `Pembelian ${data.packageName} Simfoni Cinta (${reference})`,
			redirectUrl,
		});

		return {
			reference,
			amount: canonicalAmount,
			packageName: data.packageName,
			checkoutUrl: res.checkoutUrl,
			success: true,
		};
	});

export const createDompetXCheckoutFn = createMayarCheckoutFn;

