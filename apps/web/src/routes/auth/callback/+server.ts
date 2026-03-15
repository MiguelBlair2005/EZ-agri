import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { workos, workosClientId, workosCookiePassword } from '$lib/server/workos';
import { convexClient, serverKey } from '$lib/server/convex';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('wos-state');

	if (!code || !state || !storedState || storedState !== state) {
		throw error(400, 'Invalid authentication request.');
	}

	cookies.delete('wos-state', { path: '/' });

	const { user, sealedSession } = await workos.userManagement.authenticateWithCode({
		clientId: workosClientId,
		code,
		redirectUri: env.WORKOS_REDIRECT_URI ?? `${env.PUBLIC_APP_URL ?? 'http://localhost:5173'}/auth/callback`,
		session: {
			sealSession: true,
			cookiePassword: workosCookiePassword
		}
	});

	cookies.set('wos-session', sealedSession, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 30
	});

	await convexClient.mutation('users:upsertFromWorkos', {
		serverKey,
		workosUserId: user.id,
		email: user.email,
		displayName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
	});

	const profile = await convexClient.query('users:getByWorkosId', {
		serverKey,
		workosUserId: user.id
	});

	const needsOnboarding =
		!profile ||
		profile.locationText === 'Unspecified' ||
		(profile.location?.lat ?? 0) === 0;

	throw redirect(302, needsOnboarding ? '/onboarding' : '/');
};
