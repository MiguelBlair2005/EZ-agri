import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { assertServerKey } from './serverAuth';
import { getShelfLifeDays } from './spoilage';

const ONE_HOUR = 60 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;

export const createReservation = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		listingId: v.id('listings'),
		quantity: v.number(),
		pricePerUnitCents: v.number(),
		offerId: v.optional(v.id('offers'))
	},
	handler: async (ctx, args) => {
		return await createReservationInternal(ctx, args);
	}
});

export const expireReservation = mutation({
	args: {
		serverKey: v.string(),
		reservationId: v.id('reservations')
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const reservation = await ctx.db.get(args.reservationId);
		if (!reservation || reservation.status !== 'active') {
			return;
		}

		if (reservation.expiresAt > Date.now()) {
			return;
		}

		const listing = await ctx.db.get(reservation.listingId);
		if (listing) {
			await ctx.db.patch(listing._id, {
				quantityAvailable: listing.quantityAvailable + reservation.quantity,
				status: 'active'
			});
		}

		await ctx.db.patch(reservation._id, { status: 'expired' });
	}
});

export const getByBuyer = query({
	args: {
		serverKey: v.string(),
		workosUserId: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const buyer = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!buyer) {
			return [];
		}

		return await ctx.db.query('reservations').withIndex('byBuyer', (q) => q.eq('buyerId', buyer._id)).collect();
	}
});

export async function createReservationInternal(
	ctx: any,
	args: {
		serverKey: string;
		workosUserId: string;
		listingId: string;
		quantity: number;
		pricePerUnitCents: number;
		offerId?: string;
	}
) {
	assertServerKey(args.serverKey);
	const buyer = await ctx.db
		.query('users')
		.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
		.unique();

	if (!buyer) {
		throw new Error('Buyer not found.');
	}

	if (args.quantity <= 0) {
		throw new Error('Quantity must be greater than zero.');
	}

	const listing = await ctx.db.get(args.listingId);
	if (!listing || listing.status !== 'active') {
		throw new Error('Listing not available.');
	}

	if (listing.expiryDate <= Date.now()) {
		throw new Error('Listing has expired.');
	}

	if (listing.quantityAvailable < args.quantity) {
		throw new Error('Not enough inventory.');
	}

	const shelfLifeDays = getShelfLifeDays(listing.category as any);
	const holdDuration = Math.min(
		TWENTY_FOUR_HOURS,
		Math.max(THIRTY_MINUTES, (shelfLifeDays * 24 * ONE_HOUR) / 4)
	);
	const expiresAt = Math.min(Date.now() + holdDuration, listing.expiryDate);

	const reservationId = await ctx.db.insert('reservations', {
		listingId: listing._id,
		buyerId: buyer._id,
		quantity: args.quantity,
		pricePerUnitCents: args.pricePerUnitCents,
		offerId: args.offerId,
		status: 'active',
		expiresAt,
		createdAt: Date.now()
	});

	const remaining = listing.quantityAvailable - args.quantity;
	await ctx.db.patch(listing._id, {
		quantityAvailable: remaining,
		status: remaining <= 0 ? 'sold_out' : listing.status
	});

	await ctx.scheduler.runAfter(Math.max(0, expiresAt - Date.now()), 'reservations:expireReservation', {
		serverKey: args.serverKey,
		reservationId
	});

	return reservationId;
}
