// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			workosUser?: {
				id: string;
				email: string;
				firstName?: string | null;
				lastName?: string | null;
			};
			workosSession?: unknown;
			profile?: {
				_id: string;
				workosUserId: string;
				email: string;
				displayName: string;
				role: 'farmer' | 'consumer' | 'food_bank' | 'courier';
				locationText: string;
				location: { lat: number; lng: number };
				radiusMiles: number;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
