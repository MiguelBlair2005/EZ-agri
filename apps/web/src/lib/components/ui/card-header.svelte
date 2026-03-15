<script lang="ts">
	import { cn } from '$lib/utils';

	let { children, class: className = '', ...rest } = $props();
</script>

<div class={cn('border-b border-border px-6 py-4', className)} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>
