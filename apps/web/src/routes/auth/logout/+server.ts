import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWorkos, workosCookiePassword } from '$lib/server/workos';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const origin = request.headers.get('origin');
	const allowedOrigins = [env.PUBLIC_APP_URL, 'http://localhost:5173'].filter(Boolean);
	if (origin && allowedOrigins.length && !allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
		throw redirect(302, '/');
	}

	const sealedSession = cookies.get('wos-session');
	cookies.delete('wos-session', { path: '/' });

	if (!sealedSession) {
		throw redirect(302, '/');
	}

	const workos = getWorkos();
	const session = await workos.userManagement.loadSealedSession({
		sessionData: sealedSession,
		cookiePassword: workosCookiePassword
	});

	const logoutUrl = session.getLogoutUrl();
	throw redirect(302, logoutUrl);
};
