<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '', ...rest } = $props();
</script>

<h3 class={cn('text-lg font-semibold leading-tight', className)} {...rest}>
	<slot />
</h3>
