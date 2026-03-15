<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', rows = 4, ...rest } = $props();
</script>

<textarea
	rows={rows}
	class={cn(
		'min-h-[96px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring',
		className
	)}
	{...rest}
></textarea>
