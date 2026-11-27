# FinToe Dashboard

A personal-banking SaaS dashboard built from the FinToe Figma design system. It covers balances, spending, transactions, reports, loans, billing, cards, messages, notifications, settings and help, and it is tuned for desktop screens from **1366px to 2560px**.

**Live demo:** https://fintoe-dashboard.vercel.app. Click **Try the demo** on the sign-in page.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript, Server Actions)
- **Tailwind CSS v4**, with tokens taken from the Figma variables
- **Supabase** for Postgres and Auth
- **motion** for small UI animations; `prefers-reduced-motion` is respected

## Security

- **Server-only data access.** The browser never talks to Supabase directly. Every read happens in Server Components, and every write goes through a Server Action.
- **Input validation.** Every Server Action validates its input with **zod** before touching the database.
- **Row Level Security on every table.** A user can only read or write their own rows, and the `anon` role has no table privileges.
- **Verified sessions.** Sessions are checked with `getClaims()` in `src/proxy.ts`. Unauthenticated requests are redirected to `/login`.
- **Security headers:**
  - a per-request nonce-based **Content-Security-Policy**
  - HSTS
  - `X-Frame-Options: DENY`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `no-store` caching for private pages
- **Safe CSV export.** Values are escaped to prevent spreadsheet formula injection.
- **Shared demo account protection.** The demo account's password can't be changed. Its data can be reset from the user menu.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

Apply the SQL in `supabase/migrations/` to your Supabase project. New users are seeded with their own private demo data by a database trigger.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Server-only credentials for the "Try the demo" button |

## License

Released under the MIT License. Copyright (c) 2026 Seeam Ahmod. You may reuse this code, but keep the copyright notice and credit the author.
