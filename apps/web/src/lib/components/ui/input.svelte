<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', type = 'text', ...rest } = $props();
</script>

<input
	{type}
	class={cn(
		'h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring',
		className
	)}
	{...rest}
/>
