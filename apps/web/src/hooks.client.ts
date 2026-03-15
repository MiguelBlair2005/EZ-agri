import posthog from 'posthog-js';
import { env } from '$env/dynamic/public';

if (env.PUBLIC_POSTHOG_KEY) {
	posthog.init(env.PUBLIC_POSTHOG_KEY, {
		api_host: env.PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
		capture_pageview: true,
		autocapture: true
	});
}
