import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { assertServerKey } from './serverAuth';

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineMiles = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
	const earthRadiusMiles = 3958.8;
	const dLat = toRadians(b.lat - a.lat);
	const dLng = toRadians(b.lng - a.lng);
	const lat1 = toRadians(a.lat);
	const lat2 = toRadians(b.lat);

	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

	return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
};

export const listPublic = query({
	args: {
		center: v.optional(v.object({ lat: v.number(), lng: v.number() })),
		radiusMiles: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const listings = await ctx.db.query('listings').withIndex('byStatus', (q) => q.eq('status', 'active')).collect();
		const radius = args.radiusMiles ?? 50;
		const center = args.center;

		const filtered = listings
			.filter((listing) => listing.expiryDate > now && listing.quantityAvailable > 0)
			.map((listing) => {
				const distanceMiles = center ? haversineMiles(center, listing.location) : null;
				return { listing, distanceMiles };
			})
			.filter((entry) => (center ? (entry.distanceMiles ?? 0) <= radius : true))
			.sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));

		return filtered;
	}
});

export const getById = query({
	args: {
		id: v.id('listings')
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

export const listByFarmer = query({
	args: {
		serverKey: v.string(),
		workosUserId: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const farmer = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();
		if (!farmer) {
			return [];
		}
		return await ctx.db.query('listings').withIndex('byFarmer', (q) => q.eq('farmerId', farmer._id)).collect();
	}
});

export const createListing = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		cropName: v.string(),
		category: v.string(),
		quantityTotal: v.number(),
		unit: v.string(),
		pricePerUnitCents: v.number(),
		pickupWindowStart: v.number(),
		pickupWindowEnd: v.number(),
		expiryDate: v.number(),
		locationText: v.string(),
		location: v.object({ lat: v.number(), lng: v.number() }),
		photoUrl: v.string(),
		notes: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const farmer = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!farmer || farmer.role !== 'farmer') {
			throw new Error('Only farmers can create listings.');
		}

		if (args.quantityTotal <= 0 || args.pricePerUnitCents <= 0) {
			throw new Error('Quantity and price must be positive.');
		}

		return await ctx.db.insert('listings', {
			farmerId: farmer._id,
			cropName: args.cropName,
			category: args.category,
			quantityTotal: args.quantityTotal,
			quantityAvailable: args.quantityTotal,
			unit: args.unit,
			pricePerUnitCents: args.pricePerUnitCents,
			pickupWindowStart: args.pickupWindowStart,
			pickupWindowEnd: args.pickupWindowEnd,
			expiryDate: args.expiryDate,
			locationText: args.locationText,
			location: args.location,
			photoUrl: args.photoUrl,
			notes: args.notes,
			status: 'active',
			createdAt: Date.now()
		});
	}
});

export const updateListing = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		listingId: v.id('listings'),
		quantityAvailable: v.optional(v.number()),
		pricePerUnitCents: v.optional(v.number()),
		pickupWindowStart: v.optional(v.number()),
		pickupWindowEnd: v.optional(v.number()),
		expiryDate: v.optional(v.number()),
		notes: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const farmer = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!farmer || farmer.role !== 'farmer') {
			throw new Error('Only farmers can update listings.');
		}

		const listing = await ctx.db.get(args.listingId);
		if (!listing || listing.farmerId !== farmer._id) {
			throw new Error('Listing not found.');
		}

		const nextQuantity = args.quantityAvailable ?? listing.quantityAvailable;
		const status = nextQuantity <= 0 ? 'sold_out' : listing.status;

		if ((args.pricePerUnitCents ?? listing.pricePerUnitCents) <= 0) {
			throw new Error('Price must be positive.');
		}

		await ctx.db.patch(listing._id, {
			quantityAvailable: nextQuantity,
			pricePerUnitCents: args.pricePerUnitCents ?? listing.pricePerUnitCents,
			pickupWindowStart: args.pickupWindowStart ?? listing.pickupWindowStart,
			pickupWindowEnd: args.pickupWindowEnd ?? listing.pickupWindowEnd,
			expiryDate: args.expiryDate ?? listing.expiryDate,
			notes: args.notes ?? listing.notes,
			status
		});

		return listing._id;
	}
});
