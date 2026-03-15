import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		workosUserId: v.string(),
		email: v.string(),
		displayName: v.string(),
		role: v.union(v.literal('farmer'), v.literal('consumer'), v.literal('food_bank'), v.literal('courier')),
		locationText: v.string(),
		location: v.object({
			lat: v.number(),
			lng: v.number()
		}),
		radiusMiles: v.number(),
		createdAt: v.number()
	}).index('byWorkosUserId', ['workosUserId']),
	listings: defineTable({
		farmerId: v.id('users'),
		cropName: v.string(),
		category: v.string(),
		quantityTotal: v.number(),
		quantityAvailable: v.number(),
		unit: v.string(),
		pricePerUnitCents: v.number(),
		pickupWindowStart: v.number(),
		pickupWindowEnd: v.number(),
		expiryDate: v.number(),
		locationText: v.string(),
		location: v.object({
			lat: v.number(),
			lng: v.number()
		}),
		photoUrl: v.string(),
		notes: v.optional(v.string()),
		status: v.union(v.literal('active'), v.literal('sold_out'), v.literal('expired')),
		createdAt: v.number()
	})
		.index('byFarmer', ['farmerId'])
		.index('byStatus', ['status']),
	offers: defineTable({
		listingId: v.id('listings'),
		buyerId: v.id('users'),
		pricePerUnitCents: v.number(),
		quantity: v.number(),
		status: v.union(
			v.literal('pending'),
			v.literal('accepted'),
			v.literal('declined'),
			v.literal('expired')
		),
		createdAt: v.number()
	})
		.index('byListing', ['listingId'])
		.index('byBuyer', ['buyerId']),
	reservations: defineTable({
		listingId: v.id('listings'),
		buyerId: v.id('users'),
		quantity: v.number(),
		pricePerUnitCents: v.number(),
		offerId: v.optional(v.id('offers')),
		status: v.union(v.literal('active'), v.literal('expired'), v.literal('converted')),
		expiresAt: v.number(),
		createdAt: v.number()
	})
		.index('byListing', ['listingId'])
		.index('byBuyer', ['buyerId']),
	orders: defineTable({
		listingId: v.id('listings'),
		buyerId: v.id('users'),
		reservationId: v.optional(v.id('reservations')),
		quantity: v.number(),
		pricePerUnitCents: v.number(),
		totalAmountCents: v.number(),
		polarCheckoutId: v.optional(v.string()),
		polarOrderId: v.optional(v.string()),
		status: v.union(v.literal('pending'), v.literal('paid'), v.literal('failed'), v.literal('cancelled')),
		deliveryStatus: v.union(
			v.literal('scheduled'),
			v.literal('picked_up'),
			v.literal('in_transit'),
			v.literal('delivered')
		),
		deliveryTimeline: v.array(
			v.object({
				status: v.string(),
				at: v.number(),
				updatedBy: v.id('users')
			})
		),
		courierId: v.optional(v.id('users')),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('byBuyer', ['buyerId'])
		.index('byListing', ['listingId'])
		.index('byCourier', ['courierId'])
});
