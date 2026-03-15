import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: 'hsl(var(--card))',
				cardForeground: 'hsl(var(--card-foreground))',
				muted: 'hsl(var(--muted))',
				mutedForeground: 'hsl(var(--muted-foreground))',
				primary: 'hsl(var(--primary))',
				primaryForeground: 'hsl(var(--primary-foreground))',
				accent: 'hsl(var(--accent))',
				accentForeground: 'hsl(var(--accent-foreground))',
				border: 'hsl(var(--border))',
				ring: 'hsl(var(--ring))'
			}
		}
	},
	plugins: []
};

export default config;
