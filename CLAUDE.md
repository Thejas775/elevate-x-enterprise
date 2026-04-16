# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Environment

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

**Stack:** Next.js (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS v4

### Data Flow

All data lives in Supabase. Two client factories exist:
- `src/lib/supabase/client.ts` — browser client (use in Client Components)
- `src/lib/supabase/server.ts` — server client using Next.js cookies (use in Server Components and Route Handlers)

Never import the browser client in server context or vice versa.

### Auth & Route Protection

`middleware.ts` guards routes before rendering:
- `/account/*`, `/checkout/*` → redirect to `/auth/login` if unauthenticated
- `/admin/*` → requires `profiles.is_admin = true` in Supabase

Admin role is determined by querying the `profiles` table, not JWT claims.

### Cart State

`src/context/CartContext.tsx` is a Client Component context that syncs cart state with the Supabase `cart_items` table. It re-fetches on auth state changes. Wrap usage with `useCart()`.

### Route Structure

| Path | Purpose |
|------|---------|
| `/` | Homepage — hero, categories, featured products |
| `/products` | Listing with filter/sort/pagination |
| `/products/[slug]` | Product detail |
| `/cart` | Cart (auth required) |
| `/checkout` | Order placement (auth required) |
| `/account` | Profile settings (auth required) |
| `/account/orders` | Order history (auth required) |
| `/admin/*` | Admin dashboard, products, orders, categories (admin required) |
| `/auth/callback` | OAuth redirect handler |

### Types

All shared TypeScript interfaces are in `src/lib/types.ts`: `Product`, `Category`, `Profile`, `Order`, `OrderItem`, `CartItem`, `CartContextType`.

### Image Domains

`next.config.ts` allows remote images from `images.unsplash.com`, placeholder services, and `*.supabase.co` / `*.supabase.in`. Add new domains there if needed.
