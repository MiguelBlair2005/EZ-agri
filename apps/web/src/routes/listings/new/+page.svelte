<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select } from '$lib/components/ui';
	import { foodCategoryOptions } from '$lib/spoilage';

	let lat = '';
	let lng = '';

	const useBrowserLocation = () => {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition((position) => {
			lat = position.coords.latitude.toFixed(6);
			lng = position.coords.longitude.toFixed(6);
		});
	};
</script>

<Card>
	<CardHeader>
		<CardTitle>Create a surplus listing</CardTitle>
		<p class="text-sm text-muted-foreground">
			Fields are required unless marked optional. Shelf-life assumptions use best storage conditions.
		</p>
	</CardHeader>
	<CardContent>
		<form method="POST" action="?/create" class="grid gap-6">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium">Crop name</label>
					<Input name="cropName" required />
				</div>
				<div>
					<label class="text-sm font-medium">Category</label>
					<Select name="category" required>
						{#each foodCategoryOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</Select>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<label class="text-sm font-medium">Quantity</label>
					<Input type="number" min="1" name="quantityTotal" required />
				</div>
				<div>
					<label class="text-sm font-medium">Unit</label>
					<Input name="unit" placeholder="lbs, crates, boxes" required />
				</div>
				<div>
					<label class="text-sm font-medium">Price per unit ($)</label>
					<Input type="number" step="0.01" min="0.01" name="pricePerUnit" required />
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<label class="text-sm font-medium">Pickup window start</label>
					<Input type="datetime-local" name="pickupWindowStart" required />
				</div>
				<div>
					<label class="text-sm font-medium">Pickup window end</label>
					<Input type="datetime-local" name="pickupWindowEnd" required />
				</div>
				<div>
					<label class="text-sm font-medium">Expiry date</label>
					<Input type="date" name="expiryDate" required />
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium">Location description</label>
					<Input name="locationText" placeholder="Farm pickup - Elm Street" required />
				</div>
				<div class="grid gap-2">
					<label class="text-sm font-medium">Coordinates</label>
					<div class="flex gap-2">
						<Input name="lat" bind:value={lat} placeholder="Latitude" required />
						<Input name="lng" bind:value={lng} placeholder="Longitude" required />
					</div>
					<Button variant="outline" type="button" on:click={useBrowserLocation}>
						Use my location
					</Button>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium">Photo URL</label>
					<Input name="photoUrl" placeholder="https://..." required />
				</div>
				<div>
					<label class="text-sm font-medium">Notes (optional)</label>
					<Textarea name="notes" />
				</div>
			</div>

			<Button type="submit">Publish listing</Button>
		</form>
	</CardContent>
</Card>
