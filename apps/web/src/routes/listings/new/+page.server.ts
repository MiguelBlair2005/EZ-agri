import type { Actions, PageServerLoad } from './$types';
import { convexClient, serverKey } from '$lib/server/convex';
import { trackServerEvent } from '$lib/server/analytics';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.workosUser) {
		throw redirect(302, '/auth/login');
	}

	return {
		profile: locals.profile
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.workosUser) {
			throw redirect(302, '/auth/login');
		}

		const form = await request.formData();
		const payload = {
			serverKey,
			workosUserId: locals.workosUser.id,
			cropName: String(form.get('cropName')),
			category: String(form.get('category')),
			quantityTotal: Number(form.get('quantityTotal')),
			unit: String(form.get('unit')),
			pricePerUnitCents: Math.round(Number(form.get('pricePerUnit')) * 100),
			pickupWindowStart: new Date(String(form.get('pickupWindowStart'))).getTime(),
			pickupWindowEnd: new Date(String(form.get('pickupWindowEnd'))).getTime(),
			expiryDate: new Date(String(form.get('expiryDate'))).getTime(),
			locationText: String(form.get('locationText')),
			location: {
				lat: Number(form.get('lat')),
				lng: Number(form.get('lng'))
			},
			photoUrl: String(form.get('photoUrl')),
			notes: form.get('notes') ? String(form.get('notes')) : undefined
		};

		const listingId = await convexClient.mutation('listings:createListing', payload);
		await trackServerEvent('listing_created', locals.workosUser.id, {
			listingId,
			category: payload.category
		});
		throw redirect(303, `/listings/${listingId}`);
	}
};
