<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', ...rest } = $props();
</script>

<div class={cn('border-t border-border px-6 py-4', className)} {...rest}>
	<slot />
</div>
