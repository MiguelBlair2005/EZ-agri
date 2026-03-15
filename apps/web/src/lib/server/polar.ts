import { env } from '$env/dynamic/private';

type CheckoutArgs = {
	orderId: string;
	totalAmountCents: number;
	customerEmail: string;
	successUrl: string;
	returnUrl: string;
};

export async function createCheckoutSession(args: CheckoutArgs) {
	const body: Record<string, unknown> = {
		success_url: args.successUrl,
		return_url: args.returnUrl,
		customer_email: args.customerEmail,
		external_customer_id: args.customerEmail,
		metadata: {
			orderId: args.orderId
		}
	};

	if (env.POLAR_PRODUCT_ID) {
		body.prices = {
			[env.POLAR_PRODUCT_ID]: [
				{
					price_amount: args.totalAmountCents,
					price_currency: 'usd'
				}
			]
		};
	} else {
		body.product_price_id = env.POLAR_PRICE_ID;
	}

	const response = await fetch('https://api.polar.sh/v1/checkouts/', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`Polar checkout failed: ${message}`);
	}

	const data = (await response.json()) as { id: string; url: string };
	return data;
}
