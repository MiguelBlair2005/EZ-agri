import { redirect } from '@sveltejs/kit';
import { getWorkos, workosClientId, getAuthRedirectUri } from '$lib/server/workos';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = crypto.randomUUID();
	cookies.set('wos-state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: 60 * 10
	});

	const workos = getWorkos();
	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		clientId: workosClientId,
		redirectUri: getAuthRedirectUri(),
		provider: 'authkit',
		state
	});

	throw redirect(302, authorizationUrl);
};
