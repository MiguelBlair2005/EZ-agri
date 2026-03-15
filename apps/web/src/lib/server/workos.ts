import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';

let workosSingleton: WorkOS | null = null;

export const getWorkos = () => {
	if (workosSingleton) return workosSingleton;
	const apiKey = env.WORKOS_API_KEY;
	const clientId = env.WORKOS_CLIENT_ID;

	if (apiKey) {
		workosSingleton = new WorkOS(apiKey);
		return workosSingleton;
	}

	if (clientId) {
		workosSingleton = new WorkOS({ clientId });
		return workosSingleton;
	}

	throw new Error('Missing WorkOS credentials. Set WORKOS_API_KEY or WORKOS_CLIENT_ID.');
};

export const workosClientId = env.WORKOS_CLIENT_ID;

export const workosCookiePassword = env.WORKOS_COOKIE_PASSWORD;

export const getAuthRedirectUri = () =>
	env.WORKOS_REDIRECT_URI ?? `${env.PUBLIC_APP_URL ?? 'http://localhost:5173'}/auth/callback`;
