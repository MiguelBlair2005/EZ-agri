<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', ...rest } = $props();
</script>

<div class={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)} {...rest}>
	<slot />
</div>
