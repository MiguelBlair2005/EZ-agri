<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', min = 1, max = 100, step = 1, value = 50, ...rest } = $props();
</script>

<input
	type="range"
	{min}
	{max}
	{step}
	{value}
	class={cn('h-2 w-full cursor-pointer appearance-none rounded-full bg-muted', className)}
	{...rest}
/>
