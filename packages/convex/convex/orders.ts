import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { assertServerKey } from './serverAuth';

export const createPendingOrder = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		reservationId: v.id('reservations')
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

		const reservation = await ctx.db.get(args.reservationId);
		if (!reservation || reservation.status !== 'active') {
			throw new Error('Reservation not active.');
		}

		if (reservation.expiresAt <= Date.now()) {
			throw new Error('Reservation expired.');
		}

		if (reservation.buyerId !== buyer._id) {
			throw new Error('Reservation does not belong to buyer.');
		}

		const totalAmountCents = reservation.quantity * reservation.pricePerUnitCents;
		const now = Date.now();

		const orderId = await ctx.db.insert('orders', {
			listingId: reservation.listingId,
			buyerId: buyer._id,
			reservationId: reservation._id,
			quantity: reservation.quantity,
			pricePerUnitCents: reservation.pricePerUnitCents,
			totalAmountCents,
			status: 'pending',
			deliveryStatus: 'scheduled',
			deliveryTimeline: [
				{
					status: 'scheduled',
					at: now,
					updatedBy: buyer._id
				}
			],
			createdAt: now,
			updatedAt: now
		});

		return { orderId, totalAmountCents };
	}
});

export const attachCheckout = mutation({
	args: {
		serverKey: v.string(),
		orderId: v.id('orders'),
		polarCheckoutId: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		await ctx.db.patch(args.orderId, {
			polarCheckoutId: args.polarCheckoutId,
			updatedAt: Date.now()
		});
	}
});

export const markPaid = mutation({
	args: {
		serverKey: v.string(),
		orderId: v.id('orders'),
		polarOrderId: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const order = await ctx.db.get(args.orderId);
		if (!order) {
			throw new Error('Order not found.');
		}

		if (order.status === 'paid') {
			return;
		}

		await ctx.db.patch(order._id, {
			status: 'paid',
			polarOrderId: args.polarOrderId,
			updatedAt: Date.now()
		});

		if (order.reservationId) {
			await ctx.db.patch(order.reservationId, { status: 'converted' });
		}
	}
});

export const listByBuyer = query({
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
		return await ctx.db.query('orders').withIndex('byBuyer', (q) => q.eq('buyerId', buyer._id)).collect();
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

		const listings = await ctx.db.query('listings').withIndex('byFarmer', (q) => q.eq('farmerId', farmer._id)).collect();
		const listingIds = new Set(listings.map((listing) => listing._id));
		const orders = await ctx.db.query('orders').collect();
		return orders.filter((order) => listingIds.has(order.listingId));
	}
});

export const listForCourier = query({
	args: {
		serverKey: v.string(),
		workosUserId: v.string()
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const courier = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();
		if (!courier || courier.role !== 'courier') {
			return [];
		}

		const orders = await ctx.db.query('orders').collect();
		return orders.filter(
			(order) => order.status === 'paid' && order.deliveryStatus !== 'delivered'
		);
	}
});

export const claimDelivery = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		orderId: v.id('orders')
	},
	handler: async (ctx, args) => {
		assertServerKey(args.serverKey);
		const courier = await ctx.db
			.query('users')
			.withIndex('byWorkosUserId', (q) => q.eq('workosUserId', args.workosUserId))
			.unique();

		if (!courier || courier.role !== 'courier') {
			throw new Error('Only couriers can claim deliveries.');
		}

		const order = await ctx.db.get(args.orderId);
		if (!order) {
			throw new Error('Order not found.');
		}

		await ctx.db.patch(order._id, {
			courierId: courier._id,
			updatedAt: Date.now()
		});
	}
});

export const updateDeliveryStatus = mutation({
	args: {
		serverKey: v.string(),
		workosUserId: v.string(),
		orderId: v.id('orders'),
		status: v.union(
			v.literal('scheduled'),
			v.literal('picked_up'),
			v.literal('in_transit'),
			v.literal('delivered')
		)
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

		const order = await ctx.db.get(args.orderId);
		if (!order) {
			throw new Error('Order not found.');
		}

		const allowed =
			user.role === 'farmer' ||
			(user.role === 'courier' && order.courierId && order.courierId === user._id);

		if (!allowed) {
			throw new Error('Not authorized to update delivery.');
		}

		const timeline = [
			...order.deliveryTimeline,
			{ status: args.status, at: Date.now(), updatedBy: user._id }
		];

		await ctx.db.patch(order._id, {
			deliveryStatus: args.status,
			deliveryTimeline: timeline,
			updatedAt: Date.now()
		});
	}
});
