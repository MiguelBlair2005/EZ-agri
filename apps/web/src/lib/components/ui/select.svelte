<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', ...rest } = $props();
</script>

<select
	class={cn(
		'h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
		className
	)}
	{...rest}
>
	<slot />
</select>
