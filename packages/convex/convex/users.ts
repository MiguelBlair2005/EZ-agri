import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { assertServerKey } from './serverAuth';

export const upsertFromWorkos = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		email: v.string(),
		displayName: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const existing = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				email: args.email,
				displayName: args.displayName
			});
			return existing._id;
		}

		return await ctx.db.insert('users', {
			workosUserId: args.workosUserId,
			email: args.email,
			displayName: args.displayName,
			role: 'consumer',
			locationText: 'Unspecified',
			location: { lat: 0, lng: 0 },
			radiusMiles: 50,
			createdAt: Date.now()
		});
	}
});

export const getByWorkosId = query({
	args: {
		serverKey: v.string(),
		workosUserId: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		return await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();
	}
});

export const updateProfile = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		role: v.union(v.literal('farmer'), v.literal('consumer'), v.literal('food_bank'), v.literal('courier')),
		locationText: v.string(),
		location: v.object({ lat: v.number(), lng: v.number() }),
		radiusMiles: v.number()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const user = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!user) {
			throw new Error('User not found.');
		}

		await ctx.db.patch(user._id, {
			role: args.role,
			locationText: args.locationText,
			location: args.location,
			radiusMiles: args.radiusMiles
		});

		return user._id;
	}
});
