import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { assertServerKey } from './serverAuth';
import { createReservationInternal } from './reservations';

export const submitOffer = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		listingId: v.id('listings'),
		pricePerUnitCents: v.number(),
		quantity: v.number()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const buyer = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!buyer) {
			throw new Error('Buyer not found.');
		}

		if (args.quantity <= 0 || args.pricePerUnitCents <= 0) {
			throw new Error('Offer values must be positive.');
		}

		return await ctx.db.insert('offers', {
			listingId: args.listingId,
			buyerId: buyer._id,
			pricePerUnitCents: args.pricePerUnitCents,
			quantity: args.quantity,
			status: 'pending',
			createdAt: Date.now()
		});
	}
});

export const respondToOffer = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		offerId: v.id('offers'),
		action: v.union(v.literal('accept'), v.literal('decline'))
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const farmer = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!farmer || farmer.role !== 'farmer') {
			throw new Error('Only farmers can respond to offers.');
		}

		const offer = await ctx.db.get(args.offerId);
		if (!offer || offer.status !== 'pending') {
			throw new Error('Offer not found.');
		}

		const listing = await ctx.db.get(offer.listingId);
		if (!listing || listing.farmerId !== farmer._id) {
			throw new Error('Offer does not belong to your listing.');
		}

		if (args.action === 'decline') {
			await ctx.db.patch(offer._id, { status: 'declined' });
			return { status: 'declined' };
		}

		const buyer = await ctx.db.get(offer.buyerId);
		if (!buyer) {
			throw new Error('Buyer not found.');
		}

		await ctx.db.patch(offer._id, { status: 'accepted' });
		const reservationId = await createReservationInternal(ctx, {
			serverKey: args.serverKey,
			workosUserId: buyer.workosUserId,
			listingId: offer.listingId,
			quantity: offer.quantity,
			pricePerUnitCents: offer.pricePerUnitCents,
			offerId: offer._id
		});

		return { status: 'accepted', reservationId };
	}
});

export const listByListing = query({
	args: {
		serverKey: v.string(),
		listingId: v.id('listings')
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		return await ctx.db
			.query('offers')
			.withIndex('byListing', (q) => q.eq('listingId', args.listingId))
			.collect();
	}
});
