<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { Button } from '$lib/components/ui';
	import { onMount } from 'svelte';
	import { setupConvex } from 'convex-svelte';
	import { env } from '$env/dynamic/public';
	import posthog from 'posthog-js';

	let { children, data } = $props();

	onMount(() => {
		if (env.PUBLIC_CONVEX_URL) {
			setupConvex(env.PUBLIC_CONVEX_URL);
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined' && data.user) {
			posthog.identify(data.user.id, { email: data.user.email });
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(13,95,55,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,145,56,0.12),_transparent_55%)]">
	<header class="border-b border-border bg-card/80 backdrop-blur">
		<div class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-3">
				<div class="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold">
					SC
				</div>
				<div>
					<div class="text-lg font-semibold">Surplus Crop Marketplace</div>
					<div class="text-xs text-muted-foreground">Fast, local, and waste-free.</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<a href="/" class="text-sm font-medium text-foreground hover:text-primary">Marketplace</a>
				{#if data.user}
					<a href="/dashboard" class="text-sm font-medium text-foreground hover:text-primary">Dashboard</a>
					<form method="POST" action="/auth/logout">
						<Button variant="outline" size="sm">Logout</Button>
					</form>
				{:else}
					<a href="/auth/login">
						<Button size="sm">Login</Button>
					</a>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-6xl px-6 py-8">
		{@render children()}
	</main>
</div>
