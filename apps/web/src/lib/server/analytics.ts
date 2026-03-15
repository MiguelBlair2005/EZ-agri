import { PostHog } from 'posthog-node';
import { Logger } from '@axiomhq/logging';
import { env } from '$env/dynamic/private';

const posthog = env.POSTHOG_KEY
	? new PostHog(env.POSTHOG_KEY, { host: env.POSTHOG_HOST ?? 'https://app.posthog.com' })
	: null;
const axiom =
	env.AXIOM_TOKEN && env.AXIOM_DATASET
		? new Logger({ token: env.AXIOM_TOKEN, dataset: env.AXIOM_DATASET })
		: null;

export const trackServerEvent = async (
	event: string,
	distinctId: string,
	properties: Record<string, unknown> = {}
) => {
	posthog?.capture({
		distinctId,
		event,
		properties
	});

	axiom?.info(event, { distinctId, ...properties });
};
