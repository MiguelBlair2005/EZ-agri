import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import { workos, workosCookiePassword } from '$lib/server/workos';
import { convexClient, serverKey } from '$lib/server/convex';
import { env } from '$env/dynamic/private';

const cookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: env.NODE_ENV === 'production'
};

const authHandle: Handle = async ({ event, resolve }) => {
	const sealedSession = event.cookies.get('wos-session');

	if (sealedSession) {
		try {
			const session = await workos.userManagement.loadSealedSession({
				sessionData: sealedSession,
				cookiePassword: workosCookiePassword
			});

			const authResponse = await session.authenticate();

			if (authResponse.authenticated) {
				event.locals.workosUser = authResponse.user;
				event.locals.workosSession = session;

				if (serverKey) {
					const profile = await convexClient.query('users:getByWorkosId', {
						serverKey,
						workosUserId: authResponse.user.id
					});
					event.locals.profile = profile ?? null;
				}
			} else if (authResponse.reason !== 'no_session_cookie_provided') {
				const refreshed = await workos.userManagement.refreshAndSealSessionData({
					sessionData: sealedSession,
					cookiePassword: workosCookiePassword
				});

				if (refreshed.authenticated) {
					event.cookies.set('wos-session', refreshed.sealedSession, cookieOptions);
				} else {
					event.cookies.delete('wos-session', { path: '/' });
				}
			}
		} catch {
			event.cookies.delete('wos-session', { path: '/' });
		}
	}

	return resolve(event);
};

export const handle = sequence(sentryHandle(), authHandle);
export const handleError = handleErrorWithSentry();
