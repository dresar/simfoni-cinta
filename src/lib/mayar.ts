const MAYAR_BASE_URL =
	process.env["MAYAR_BASE_URL"] || "https://api.mayar.id/hl/v1";
const MAYAR_API_KEY = process.env["MAYAR_API_KEY"] || "";

export type MayarPaymentRequest = {
	reference: string;
	amount: number;
	customerName?: string;
	customerEmail?: string;
	customerPhone?: string;
	description?: string;
	redirectUrl?: string;
};

export type MayarPaymentResponse = {
	success: boolean;
	reference: string;
	checkoutUrl: string;
	id?: string;
	status?: string;
	amount?: number;
};

export async function createMayarPayment(
	params: MayarPaymentRequest,
): Promise<MayarPaymentResponse> {
	const apiKey = (process.env["MAYAR_API_KEY"] || MAYAR_API_KEY).trim();
	const baseUrl = (process.env["MAYAR_BASE_URL"] || MAYAR_BASE_URL).trim();

	const appUrl = (
		process.env.NEXT_PUBLIC_APP_URL || "https://simfonicinta.my.id"
	).replace(/\/$/, "");

	if (!apiKey) {
		return {
			success: true,
			reference: params.reference,
			checkoutUrl:
				params.redirectUrl ||
				`${appUrl}/dasbor/pembelian?status=success&orderId=${params.reference}`,
			status: "unpaid",
			amount: params.amount,
		};
	}

	const payload = {
		name: params.customerName || "Pelanggan Simfoni Cinta",
		email: params.customerEmail || "eka.ckp16799@gmail.com",
		mobile: params.customerPhone || "082392115909",
		amount: Math.round(params.amount),
		description: `${params.description || "Pembelian Paket"} [REF:${params.reference}]`,
		redirectUrl:
			params.redirectUrl ||
			`${appUrl}/dasbor/pembelian?status=success&orderId=${params.reference}`,
		extraData: {
			reference: params.reference,
			orderId: params.reference,
		},
	};

	const res = await fetch(`${baseUrl}/payment/create`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (res.ok) {
		const json = await res.json();
		const data = json?.data || json;
		const checkoutUrl = data?.link || data?.url || data?.paymentUrl || "";
		return {
			success: true,
			reference: params.reference,
			checkoutUrl,
			id: data?.id,
			status: data?.status || "unpaid",
			amount: params.amount,
		};
	}

	const errText = await res.text().catch(() => "");
	throw new Error(`Mayar Checkout Error (${res.status}): ${errText}`);
}

export async function generatePaymentLink(
	orderId: string,
	amount: number,
	pkgName: string,
) {
	const payment = await createMayarPayment({
		reference: orderId,
		amount,
		description: `Upgrade Paket ${pkgName}`,
	});
	return payment.checkoutUrl;
}

export async function checkMayarPaymentStatus(
	paymentOrInvoiceId: string,
): Promise<string | null> {
	const apiKey = (process.env["MAYAR_API_KEY"] || MAYAR_API_KEY).trim();
	const baseUrl = (process.env["MAYAR_BASE_URL"] || MAYAR_BASE_URL).trim();

	if (!apiKey || !paymentOrInvoiceId) {
		return null;
	}

	try {
		let res = await fetch(`${baseUrl}/payment/${paymentOrInvoiceId}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!res.ok) {
			res = await fetch(`${baseUrl}/invoice/${paymentOrInvoiceId}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			});
		}

		if (res.ok) {
			const json = await res.json();
			const data = json?.data || json;
			const status = data?.status || data?.paymentStatus || "";
			return String(status).toLowerCase();
		}
	} catch {
		return null;
	}

	return null;
}
