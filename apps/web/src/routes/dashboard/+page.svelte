<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, Input } from '$lib/components/ui';
	let { data } = $props();
</script>

<section class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold">Dashboard</h1>
		<p class="text-sm text-muted-foreground">Role: {data.role}</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Profile settings</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/updateProfile" class="grid gap-4 md:grid-cols-2">
				<input type="hidden" name="role" value={data.role} />
				<div>
					<label class="text-sm font-medium" for="location-text">Location</label>
					<Input id="location-text" name="locationText" value={data.profile?.locationText ?? ''} required />
				</div>
				<div>
					<label class="text-sm font-medium" for="radius-miles">Radius (miles)</label>
					<Input
						id="radius-miles"
						name="radiusMiles"
						type="number"
						min="5"
						max="100"
						value={data.profile?.radiusMiles ?? 50}
						required
					/>
				</div>
				<div>
					<label class="text-sm font-medium" for="lat">Latitude</label>
					<Input id="lat" name="lat" value={data.profile?.location?.lat ?? ''} required />
				</div>
				<div>
					<label class="text-sm font-medium" for="lng">Longitude</label>
					<Input id="lng" name="lng" value={data.profile?.location?.lng ?? ''} required />
				</div>
				<div class="md:col-span-2">
					<Button size="sm">Update profile</Button>
				</div>
			</form>
		</CardContent>
	</Card>

	{#if data.role === 'farmer'}
		<Card>
			<CardHeader>
				<CardTitle>Your listings</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.listings.length}
					<div class="grid gap-4 md:grid-cols-2">
						{#each data.listings as listing}
							<div class="rounded-lg border border-border p-4">
								<div class="flex items-center justify-between">
									<div class="font-semibold">{listing.cropName}</div>
									<Badge variant="accent">{listing.status}</Badge>
								</div>
								<p class="text-sm text-muted-foreground">
									{listing.quantityAvailable} {listing.unit} left
								</p>
								<a class="text-sm text-primary" href={`/listings/${listing._id}`}>View details</a>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">No listings yet.</p>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Orders in motion</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.orders.length}
					<div class="grid gap-4 md:grid-cols-2">
						{#each data.orders as order}
							<div class="rounded-lg border border-border p-4">
								<div class="flex items-center justify-between">
									<div class="font-semibold">Order {order._id}</div>
									<Badge variant="muted">{order.status}</Badge>
								</div>
								<p class="text-sm text-muted-foreground">Delivery: {order.deliveryStatus}</p>
								<form method="POST" action="?/updateDelivery" class="mt-3 flex gap-2">
									<input type="hidden" name="orderId" value={order._id} />
									<Select name="status">
										<option value="scheduled">Scheduled</option>
										<option value="picked_up">Picked up</option>
										<option value="in_transit">In transit</option>
										<option value="delivered">Delivered</option>
									</Select>
									<Button size="sm">Update</Button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">No paid orders yet.</p>
				{/if}
			</CardContent>
		</Card>
	{/if}

	{#if data.role === 'consumer' || data.role === 'food_bank'}
		<Card>
			<CardHeader>
				<CardTitle>Your reservations</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.reservations.length}
					<ul class="space-y-3 text-sm">
						{#each data.reservations as reservation}
							<li class="rounded-lg border border-border p-3">
								<div class="flex items-center justify-between">
									<span>Reservation {reservation._id}</span>
									<Badge variant="accent">{reservation.status}</Badge>
								</div>
								<p class="text-muted-foreground">
									Qty {reservation.quantity} - Expires {new Date(reservation.expiresAt).toLocaleString()}
								</p>
								{#if reservation.status === 'active'}
									<form method="POST" action="?/checkoutReservation" class="mt-3">
										<input type="hidden" name="reservationId" value={reservation._id} />
										<Button size="sm">Pay now</Button>
									</form>
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-sm text-muted-foreground">No reservations yet.</p>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Your orders</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.orders.length}
					<ul class="space-y-3 text-sm">
						{#each data.orders as order}
							<li class="rounded-lg border border-border p-3">
								<div class="flex items-center justify-between">
									<span>Order {order._id}</span>
									<Badge variant="muted">{order.status}</Badge>
								</div>
								<p class="text-muted-foreground">
									Delivery: {order.deliveryStatus} - Total ${(order.totalAmountCents / 100).toFixed(2)}
								</p>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-sm text-muted-foreground">No orders yet.</p>
				{/if}
			</CardContent>
		</Card>
	{/if}

	{#if data.role === 'courier'}
		<Card>
			<CardHeader>
				<CardTitle>Available deliveries</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.courierOrders.length}
					<div class="grid gap-4 md:grid-cols-2">
						{#each data.courierOrders as order}
							<div class="rounded-lg border border-border p-4 space-y-3">
								<div class="flex items-center justify-between">
									<div class="font-semibold">Order {order._id}</div>
									<Badge variant="accent">{order.deliveryStatus}</Badge>
								</div>
								<form method="POST" action="?/claimDelivery">
									<input type="hidden" name="orderId" value={order._id} />
									<Button size="sm">Claim delivery</Button>
								</form>
								<form method="POST" action="?/updateDelivery" class="flex gap-2">
									<input type="hidden" name="orderId" value={order._id} />
									<Select name="status">
										<option value="scheduled">Scheduled</option>
										<option value="picked_up">Picked up</option>
										<option value="in_transit">In transit</option>
										<option value="delivered">Delivered</option>
									</Select>
									<Button size="sm" variant="outline">Update</Button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">No deliveries available.</p>
				{/if}
			</CardContent>
		</Card>
	{/if}
</section>
