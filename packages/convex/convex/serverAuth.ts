import { ConvexError } from 'convex/values';

export function assertServerKey(serverKey: string | undefined) {
	const expected = process.env.CONVEX_SERVER_KEY;
	if (!expected || !serverKey || serverKey !== expected) {
		throw new ConvexError('Server authorization failed.');
	}
}
