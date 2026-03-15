import type { RequestHandler } from './$types';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { env } from '$env/dynamic/private';
import { convexClient, serverKey } from '$lib/server/convex';
import { trackServerEvent } from '$lib/server/analytics';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.text();
	const headers = Object.fromEntries(request.headers);

	let event;
	try {
		event = await validateEvent({
			payload,
			headers,
			secret: env.POLAR_WEBHOOK_SECRET
		});
	} catch {
		return new Response('invalid signature', { status: 400 });
	}

	if (event.type === 'order.paid') {
		const metadata = (event.data as { metadata?: Record<string, string> }).metadata;
		const orderId = metadata?.orderId;
		if (orderId) {
			await convexClient.mutation('orders:markPaid', {
				serverKey,
				orderId,
				polarOrderId: event.data.id
			});
			await trackServerEvent('order_paid', orderId, {
				polarOrderId: event.data.id
			});
		}
	}

	return new Response('ok', { status: 200 });
};
