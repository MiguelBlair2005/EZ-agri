<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from '$lib/components/ui';
	let { data } = $props();

	let reserveQty = 1;
	let offerQty = 1;
	let offerPrice = (data.listing.pricePerUnitCents / 100).toFixed(2);

	const listing = data.listing;
	const isFarmer = data?.profile?.role === 'farmer' && data.profile?._id === listing.farmerId;
</script>

<div class="grid gap-8 lg:grid-cols-[2fr_1fr]">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle>{listing.cropName}</CardTitle>
				<Badge variant="accent">{listing.category.replaceAll('_', ' ')}</Badge>
			</div>
			<p class="text-sm text-muted-foreground">{listing.locationText}</p>
		</CardHeader>
		<CardContent class="space-y-6">
			<img
				src={listing.photoUrl}
				alt={`${listing.cropName} photo`}
				class="h-56 w-full rounded-lg object-cover"
			/>
			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<div class="text-xs text-muted-foreground">Available</div>
					<div class="text-lg font-semibold">{listing.quantityAvailable} {listing.unit}</div>
				</div>
				<div>
					<div class="text-xs text-muted-foreground">Price</div>
					<div class="text-lg font-semibold">${(listing.pricePerUnitCents / 100).toFixed(2)} / {listing.unit}</div>
				</div>
				<div>
					<div class="text-xs text-muted-foreground">Pickup window</div>
					<div class="text-lg font-semibold">{new Date(listing.pickupWindowStart).toLocaleDateString()}</div>
				</div>
			</div>
			<p class="text-sm text-muted-foreground">{listing.notes ?? 'Fresh surplus ready for pickup.'}</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Reserve or negotiate</CardTitle>
			<p class="text-sm text-muted-foreground">Offers are private and only visible to the farmer.</p>
		</CardHeader>
		<CardContent class="space-y-6">
			<form method="POST" action="?/reserve" class="space-y-3">
				<input type="hidden" name="listingId" value={listing._id} />
				<input type="hidden" name="pricePerUnitCents" value={listing.pricePerUnitCents} />
				<div>
					<label class="text-sm font-medium">Quantity</label>
					<Input type="number" min="1" max={listing.quantityAvailable} bind:value={reserveQty} name="quantity" />
				</div>
				<Button class="w-full">Reserve & Pay</Button>
			</form>

			<div class="border-t border-border pt-4 space-y-3">
				<form method="POST" action="?/submitOffer" class="space-y-3">
					<input type="hidden" name="listingId" value={listing._id} />
					<div>
						<label class="text-sm font-medium">Offer quantity</label>
						<Input type="number" min="1" max={listing.quantityAvailable} bind:value={offerQty} name="quantity" />
					</div>
					<div>
						<label class="text-sm font-medium">Offer price per {listing.unit}</label>
						<Input type="number" min="0.01" step="0.01" bind:value={offerPrice} name="pricePerUnit" />
					</div>
					<Button variant="outline" class="w-full">Submit offer</Button>
				</form>
			</div>
		</CardContent>
	</Card>
</div>

{#if isFarmer}
	<section class="mt-10 space-y-4">
		<h2 class="text-xl font-semibold">Offers</h2>
		{#if data.offers?.length}
			<div class="grid gap-4 md:grid-cols-2">
				{#each data.offers as offer}
					<Card>
						<CardHeader>
							<CardTitle>${(offer.pricePerUnitCents / 100).toFixed(2)} / {listing.unit}</CardTitle>
							<p class="text-sm text-muted-foreground">{offer.quantity} {listing.unit}</p>
						</CardHeader>
						<CardContent class="space-y-3">
							<Badge variant={offer.status === 'pending' ? 'accent' : 'muted'}>{offer.status}</Badge>
							{#if offer.status === 'pending'}
								<form method="POST" action="?/respondOffer" class="flex gap-2">
									<input type="hidden" name="offerId" value={offer._id} />
									<input type="hidden" name="action" value="accept" />
									<Button size="sm">Accept</Button>
								</form>
								<form method="POST" action="?/respondOffer" class="flex gap-2">
									<input type="hidden" name="offerId" value={offer._id} />
									<input type="hidden" name="action" value="decline" />
									<Button size="sm" variant="outline">Decline</Button>
								</form>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">No offers yet.</p>
		{/if}
	</section>

	<section class="mt-10 space-y-4">
		<h2 class="text-xl font-semibold">Update listing</h2>
		<Card>
			<CardContent class="space-y-4">
				<form method="POST" action="?/updateListing" class="grid gap-4 md:grid-cols-2">
					<input type="hidden" name="listingId" value={listing._id} />
					<div>
						<label class="text-sm font-medium">Quantity available</label>
						<Input
							name="quantityAvailable"
							type="number"
							min="0"
							value={listing.quantityAvailable}
							required
						/>
					</div>
					<div>
						<label class="text-sm font-medium">Price per {listing.unit} ($)</label>
						<Input
							name="pricePerUnit"
							type="number"
							step="0.01"
							value={(listing.pricePerUnitCents / 100).toFixed(2)}
							required
						/>
					</div>
					<div class="md:col-span-2">
						<Button size="sm">Save changes</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</section>
{/if}
