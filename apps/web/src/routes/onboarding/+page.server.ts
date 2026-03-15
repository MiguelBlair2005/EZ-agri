import type { Actions, PageServerLoad } from './$types';
import { convexClient, serverKey } from '$lib/server/convex';
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
	save: async ({ request, locals }) => {
		if (!locals.workosUser) {
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

		throw redirect(303, '/');
	}
};
