<script lang="ts">
	import { cn } from '$lib/utils';

	const variants = {
		default: 'bg-primary text-primary-foreground hover:brightness-110',
		secondary: 'bg-muted text-foreground hover:bg-muted/80',
		outline: 'border border-border bg-transparent hover:bg-muted',
		ghost: 'bg-transparent hover:bg-muted'
	};

	const sizes = {
		default: 'h-10 px-4 text-sm',
		sm: 'h-9 px-3 text-sm',
		lg: 'h-11 px-6 text-base'
	};

	let {
		children,
		class: className = '',
		variant = 'default',
		size = 'default',
		type = 'button',
		...rest
	} = $props();
</script>

<button
	{type}
	class={cn(
		'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>
