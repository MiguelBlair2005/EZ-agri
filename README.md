# EZ-agri — Surplus Crop Marketplace

Real-time marketplace connecting farmers, local consumers, and food banks to reduce surplus crop waste.

## Stack
- Bun, SvelteKit, Tailwind, shadcn-svelte
- WorkOS (AuthKit)
- Convex (realtime data)
- Polar.sh (payments)
- Netlify (deploy)
- Sentry, PostHog, Axiom (observability)
- Turborepo

## Workspace layout
- `apps/web` — SvelteKit frontend + server routes
- `packages/convex` — Convex schema + functions

## Setup
1. Install dependencies
   - `bun install`
2. Copy `.env.example` files
   - `apps/web/.env.example` → `apps/web/.env`
   - `packages/convex/.env.example` → `packages/convex/.env`
3. Start Convex (from root)
   - `bun run dev:convex`
   - If prompted, complete Convex login in this terminal before running `bun run dev`.
4. Start web app
   - `bun run dev:web`

## Netlify
`netlify.toml` is configured for monorepo builds. Use the Netlify UI or CLI to set environment variables.

## Food spoilage assumptions
Shelf-life values are based on extension guidance with “best storage” conditions:
- Kansas State University storage charts (MF2465, MF3130)
- Utah State University extension storage guidance (winter squash)
- Iowa State University extension storage guidance (onions)

Adjust shelf-life values in:
- `packages/convex/convex/spoilage.ts`
- `apps/web/src/lib/spoilage.ts`

## Notes on Polar
- `POLAR_PRODUCT_ID` enables ad-hoc pricing for negotiated offers and quantity-based totals.
- If only `POLAR_PRICE_ID` is provided, checkout uses that fixed price.

## Security
- Convex mutations require `CONVEX_SERVER_KEY` (server-only).
- WorkOS sessions are sealed with `WORKOS_COOKIE_PASSWORD`.
