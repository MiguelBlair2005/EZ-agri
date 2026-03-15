<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select } from '$lib/components/ui';
	import { foodCategoryOptions } from '$lib/spoilage';

	let lat = $state('');
	let lng = $state('');

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
					<label class="text-sm font-medium" for="crop-name">Crop name</label>
					<Input id="crop-name" name="cropName" required />
				</div>
				<div>
					<label class="text-sm font-medium" for="category">Category</label>
					<Select id="category" name="category" required>
						{#each foodCategoryOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</Select>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<label class="text-sm font-medium" for="quantity-total">Quantity</label>
					<Input id="quantity-total" type="number" min="1" name="quantityTotal" required />
				</div>
				<div>
					<label class="text-sm font-medium" for="unit">Unit</label>
					<Input id="unit" name="unit" placeholder="lbs, crates, boxes" required />
				</div>
				<div>
					<label class="text-sm font-medium" for="price-per-unit">Price per unit ($)</label>
					<Input
						id="price-per-unit"
						type="number"
						step="0.01"
						min="0.01"
						name="pricePerUnit"
						required
					/>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<label class="text-sm font-medium" for="pickup-start">Pickup window start</label>
					<Input id="pickup-start" type="datetime-local" name="pickupWindowStart" required />
				</div>
				<div>
					<label class="text-sm font-medium" for="pickup-end">Pickup window end</label>
					<Input id="pickup-end" type="datetime-local" name="pickupWindowEnd" required />
				</div>
				<div>
					<label class="text-sm font-medium" for="expiry-date">Expiry date</label>
					<Input id="expiry-date" type="date" name="expiryDate" required />
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium" for="location-text">Location description</label>
					<Input id="location-text" name="locationText" placeholder="Farm pickup - Elm Street" required />
				</div>
				<div class="grid gap-2">
					<p class="text-sm font-medium">Coordinates</p>
					<div class="flex gap-2">
						<Input
							id="lat"
							name="lat"
							bind:value={lat}
							placeholder="Latitude"
							aria-label="Latitude"
							required
						/>
						<Input
							id="lng"
							name="lng"
							bind:value={lng}
							placeholder="Longitude"
							aria-label="Longitude"
							required
						/>
					</div>
					<Button variant="outline" type="button" on:click={useBrowserLocation}>
						Use my location
					</Button>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium" for="photo-url">Photo URL</label>
					<Input id="photo-url" name="photoUrl" placeholder="https://..." required />
				</div>
				<div>
					<label class="text-sm font-medium" for="notes">Notes (optional)</label>
					<Textarea id="notes" name="notes" />
				</div>
			</div>

			<Button type="submit">Publish listing</Button>
		</form>
	</CardContent>
</Card>
