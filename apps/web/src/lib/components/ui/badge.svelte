<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', variant = 'default', ...rest } = $props();

	const variants = {
		default: 'bg-primary text-primary-foreground',
		muted: 'bg-muted text-muted-foreground',
		accent: 'bg-accent text-accent-foreground'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
		variants[variant] ?? variants.default,
		className
	)}
	{...rest}
>
	<slot />
</span>
