import { ConvexHttpClient } from 'convex/browser';
import { env } from '$env/dynamic/private';

const convexUrl = env.CONVEX_URL ?? env.PUBLIC_CONVEX_URL ?? 'http://localhost:3210';
export const convexClient = new ConvexHttpClient(convexUrl);

export const serverKey = env.CONVEX_SERVER_KEY ?? '';
