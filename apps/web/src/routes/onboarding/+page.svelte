<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Slider } from '$lib/components/ui';

	let radiusMiles = $state(50);
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
		<CardTitle>Set up your marketplace profile</CardTitle>
		<p class="text-sm text-muted-foreground">We use this to match you within your preferred radius.</p>
	</CardHeader>
	<CardContent>
		<form method="POST" action="?/save" class="grid gap-6">
			<div>
				<label class="text-sm font-medium" for="role">Role</label>
				<Select id="role" name="role" required>
					<option value="farmer">Farmer</option>
					<option value="consumer">Consumer</option>
					<option value="food_bank">Food bank</option>
					<option value="courier">Courier</option>
				</Select>
			</div>

			<div>
				<label class="text-sm font-medium" for="location-text">Location description</label>
				<Input id="location-text" name="locationText" placeholder="City, state or pickup area" required />
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

			<div>
				<label class="text-sm font-medium" for="radius-miles">
					Matching radius: {radiusMiles} miles
				</label>
				<Slider id="radius-miles" min={5} max={100} step={5} bind:value={radiusMiles} />
				<input type="hidden" name="radiusMiles" value={radiusMiles} />
			</div>

			<Button type="submit">Save profile</Button>
		</form>
	</CardContent>
</Card>
