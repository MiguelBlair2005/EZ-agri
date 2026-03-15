import type { PageServerLoad, Actions } from './$types';
import { convexClient, serverKey } from '$lib/server/convex';
import { redirect } from '@sveltejs/kit';
import { trackServerEvent } from '$lib/server/analytics';
import { createCheckoutSession } from '$lib/server/polar';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.workosUser) {
		throw redirect(302, '/auth/login');
	}

	const role = locals.profile?.role;
	let listings = [];
	let orders = [];
	let reservations = [];
	let courierOrders = [];

	if (role === 'farmer') {
		listings = await convexClient.query('listings:listByFarmer', {
			serverKey,
			workosUserId: locals.workosUser.id
		});
		orders = await convexClient.query('orders:listByFarmer', {
			serverKey,
			workosUserId: locals.workosUser.id
		});
	}

	if (role === 'consumer' || role === 'food_bank') {
		reservations = await convexClient.query('reservations:getByBuyer', {
			serverKey,
			workosUserId: locals.workosUser.id
		});
		orders = await convexClient.query('orders:listByBuyer', {
			serverKey,
			workosUserId: locals.workosUser.id
		});
	}

	if (role === 'courier') {
		courierOrders = await convexClient.query('orders:listForCourier', {
			serverKey,
			workosUserId: locals.workosUser.id
		});
	}

	return {
		role,
		listings,
		orders,
		reservations,
		courierOrders
	};
};

export const actions: Actions = {
	claimDelivery: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}
		const form = await request.formData();
		const orderId = String(form.get('orderId'));

		await convexClient.mutation('orders:claimDelivery', {
			serverKey,
			workosUserId: locals.workosUser.id,
			orderId
		});

		await trackServerEvent('delivery_claimed', locals.workosUser.id, { orderId });
		return { success: true };
	},
	updateDelivery: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const orderId = String(form.get('orderId'));
		const status = String(form.get('status')) as 'scheduled' | 'picked_up' | 'in_transit' | 'delivered';

		await convexClient.mutation('orders:updateDeliveryStatus', {
			serverKey,
			workosUserId: locals.workosUser.id,
			orderId,
			status
		});

		await trackServerEvent('delivery_updated', locals.workosUser.id, { orderId, status });
		return { success: true };
	},
	checkoutReservation: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const reservationId = String(form.get('reservationId'));

		const { orderId, totalAmountCents } = await convexClient.mutation('orders:createPendingOrder', {
			serverKey,
			workosUserId: locals.workosUser.id,
			reservationId
		});

		const baseUrl = env.PUBLIC_APP_URL ?? 'http://localhost:5173';
		const checkout = await createCheckoutSession({
			orderId,
			totalAmountCents,
			customerEmail: locals.workosUser.email,
			successUrl: `${baseUrl}/dashboard?status=paid`,
			returnUrl: `${baseUrl}/dashboard`
		});

		await convexClient.mutation('orders:attachCheckout', {
			serverKey,
			orderId,
			polarCheckoutId: checkout.id
		});

		await trackServerEvent('checkout_created', locals.workosUser.id, {
			orderId
		});

		throw redirect(303, checkout.url);
	},
	updateProfile: async ({ request, locals }) => {
		if (!locals.workosUser || !locals.profile) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		await convexClient.mutation('users:updateProfile', {
			serverKey,
			workosUserId: locals.workosUser.id,
			role: String(form.get('role')) as 'farmer' | 'consumer' | 'food_bank' | 'courier',
			locationText: String(form.get('locationText')),
			location: {
				lat: Number(form.get('lat')),
				lng: Number(form.get('lng'))
			},
			radiusMiles: Number(form.get('radiusMiles'))
		});

		return { success: true };
	}
};
