import type { PageServerLoad, Actions } from './$types';
import { convexClient, serverKey } from '$lib/server/convex';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createCheckoutSession } from '$lib/server/polar';
import { trackServerEvent } from '$lib/server/analytics';

export const load: PageServerLoad = async ({ params, locals }) => {
	const listing = await convexClient.query('listings:getById', { id: params.id });
	if (!listing) {
		throw error(404, 'Listing not found');
	}

	let offers = [];
	if (locals.profile?.role === 'farmer' && locals.profile._id === listing.farmerId) {
		offers = await convexClient.query('offers:listByListing', {
			serverKey,
			listingId: params.id
		});
	}

	return {
		listing,
		offers
	};
};

export const actions: Actions = {
	reserve: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const listingId = String(form.get('listingId'));
		const quantity = Number(form.get('quantity'));
		const pricePerUnitCents = Math.round(Number(form.get('pricePerUnit')) * 100);

		const reservationId = await convexClient.mutation('reservations:createReservation', {
			serverKey,
			workosUserId: locals.workosUser.id,
			listingId,
			quantity,
			pricePerUnitCents
		});

		const { orderId, totalAmountCents } = await convexClient.mutation('orders:createPendingOrder', {
			serverKey,
			workosUserId: locals.workosUser.id,
			reservationId
		});

		await trackServerEvent('reservation_created', locals.workosUser.id, {
			listingId,
			reservationId,
			quantity
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

		throw redirect(303, checkout.url);
	},
	submitOffer: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const listingId = String(form.get('listingId'));
		const quantity = Number(form.get('quantity'));
		const pricePerUnitCents = Number(form.get('pricePerUnitCents'));

		await convexClient.mutation('offers:submitOffer', {
			serverKey,
			workosUserId: locals.workosUser.id,
			listingId,
			quantity,
			pricePerUnitCents
		});

		await trackServerEvent('offer_submitted', locals.workosUser.id, {
			listingId,
			quantity
		});

		return { success: true };
	},
	respondOffer: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const offerId = String(form.get('offerId'));
		const action = String(form.get('action')) as 'accept' | 'decline';

		await convexClient.mutation('offers:respondToOffer', {
			serverKey,
			workosUserId: locals.workosUser.id,
			offerId,
			action
		});

		await trackServerEvent('offer_responded', locals.workosUser.id, {
			offerId,
			action
		});

		return { success: true };
	},
	updateListing: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const listingId = String(form.get('listingId'));
		const quantityAvailable = Number(form.get('quantityAvailable'));
		const pricePerUnitCents = Math.round(Number(form.get('pricePerUnit')) * 100);

		await convexClient.mutation('listings:updateListing', {
			serverKey,
			workosUserId: locals.workosUser.id,
			listingId,
			quantityAvailable,
			pricePerUnitCents
		});

		await trackServerEvent('listing_updated', locals.workosUser.id, {
			listingId
		});

		return { success: true };
	}
};
