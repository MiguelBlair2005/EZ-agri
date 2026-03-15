<script lang="ts">
	import { cn } from '$lib/utils';
	let { children, class: className = '', ...rest } = $props();
</script>

<h3 class={cn('text-lg font-semibold leading-tight', className)} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</h3>
