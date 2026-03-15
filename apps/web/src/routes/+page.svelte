<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { anyApi } from 'convex/browser';
	import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Slider } from '$lib/components/ui';
	import { foodCategoryOptions } from '$lib/spoilage';

	let { data } = $props();

	let radiusMiles = $state(50);
	let center = $state(null);
	let selectedCategory = $state('all');

	$effect(() => {
		radiusMiles = data.profile?.radiusMiles ?? 50;
		center = data.profile?.location?.lat ? data.profile.location : null;
	});

	const api = anyApi;
	const listings = useQuery(api.listings.listPublic, () => ({
		center: center ?? undefined,
		radiusMiles
	}));

	const useBrowserLocation = async () => {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition((position) => {
			center = { lat: position.coords.latitude, lng: position.coords.longitude };
		});
	};
</script>

<section class="space-y-8">
	<div class="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
		<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-2xl font-semibold">Find surplus crops near you</h1>
				<p class="text-sm text-muted-foreground">
					Live inventory updates and flexible offers from farmers and food banks.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				{#if data.user}
					<Button variant="outline" on:click={useBrowserLocation}>Use my location</Button>
					<a href="/listings/new">
						<Button>Post surplus</Button>
					</a>
				{:else}
					<a href="/auth/login">
						<Button>Sign in to match locally</Button>
					</a>
				{/if}
			</div>
		</div>

		<div class="mt-6 grid gap-6 md:grid-cols-[2fr_1fr]">
			<div>
				<label class="text-sm font-medium" for="radius-miles">Search radius: {radiusMiles} miles</label>
				<Slider id="radius-miles" min={5} max={100} step={5} bind:value={radiusMiles} class="mt-3" />
			</div>
			<div>
				<label class="text-sm font-medium" for="category">Category</label>
				<select
					id="category"
					class="mt-3 h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
					bind:value={selectedCategory}
				>
					<option value="all">All categories</option>
					{#each foodCategoryOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		{#if listings}
			{#if listings.length === 0}
				<p class="text-sm text-muted-foreground">No listings found in this radius.</p>
			{:else}
				{#each listings as entry}
					{#if selectedCategory === 'all' || entry.listing.category === selectedCategory}
						<Card class="flex h-full flex-col">
							<CardHeader>
								<div class="flex items-center justify-between">
									<CardTitle>{entry.listing.cropName}</CardTitle>
									<Badge variant="accent">
										{entry.distanceMiles ? `${entry.distanceMiles.toFixed(1)} mi` : 'Local'}
									</Badge>
								</div>
								<p class="text-sm text-muted-foreground">
									{entry.listing.locationText} - {entry.listing.quantityAvailable} {entry.listing.unit} available
								</p>
							</CardHeader>
							<CardContent class="space-y-4">
								<img
									src={entry.listing.photoUrl}
									alt={`${entry.listing.cropName} photo`}
									class="h-40 w-full rounded-lg object-cover"
								/>
								<div class="flex flex-wrap items-center gap-3">
									<Badge>{entry.listing.category.replaceAll('_', ' ')}</Badge>
									<Badge variant="muted">${(entry.listing.pricePerUnitCents / 100).toFixed(2)} / {entry.listing.unit}</Badge>
									<Badge variant="muted">Pickup: {new Date(entry.listing.pickupWindowStart).toLocaleDateString()}</Badge>
								</div>
								<p class="text-sm text-muted-foreground line-clamp-3">
									{entry.listing.notes ?? 'Fresh surplus available now.'}
								</p>
								<a href={`/listings/${entry.listing._id}`}>
									<Button class="w-full">View listing</Button>
								</a>
							</CardContent>
						</Card>
					{/if}
				{/each}
			{/if}
		{:else}
			<p class="text-sm text-muted-foreground">Loading live inventory...</p>
		{/if}
	</div>
</section>
