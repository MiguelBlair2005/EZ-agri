import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';

export const workos = new WorkOS(env.WORKOS_API_KEY);
export const workosClientId = env.WORKOS_CLIENT_ID;

export const workosCookiePassword = env.WORKOS_COOKIE_PASSWORD;

export const getAuthRedirectUri = () =>
	env.WORKOS_REDIRECT_URI ?? `${env.PUBLIC_APP_URL ?? 'http://localhost:5173'}/auth/callback`;
