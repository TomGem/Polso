# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Polso** — a real-time events dashboard that ingests events via a REST API, displays them in a live feed, and visualizes data with charts. Built as a Bootcamp Week 2 project. Primary data sources are NASA DONKI (space weather) and NASA NEO (near-earth objects).

## Commands

All commands run from the `events-dashboard/` directory:

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint (flat config)
npm run start    # Start production server
```

No test runner is currently configured. Playwright is installed as a dev dependency but has no test scripts yet.

## Architecture

### Tech Stack
- **Next.js 16** with App Router, React 19, TypeScript
- **Supabase** (PostgreSQL) for database + real-time subscriptions
- **Tailwind CSS v4** + **shadcn/ui** (base-nova style, lucide icons)
- **Recharts** for charts (via shadcn/ui chart components)
- **next-themes** for dark/light mode

### Supabase Clients
- **Server** (`src/lib/supabase/server.ts`): Uses `SUPABASE_SERVICE_ROLE_KEY`, call `createServerClient()` — used in API routes
- **Browser** (`src/lib/supabase/client.ts`): Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, exports a lazy-initialized `supabase` singleton via Proxy — used in client components and hooks

### Key Data Flow
1. External sources POST events to `/api/events` with `x-api-key` header (maps to a project)
2. Events are stored in Supabase `events` table with `project_id`
3. Supabase Realtime pushes INSERT/UPDATE changes to the browser via `useRealtimeEvents` hook
4. Dashboard components re-render with new data

### API Routes (`src/app/api/`)
- `events/route.ts` — POST (ingest, API key auth) + GET (read with filtering/pagination)
- `events/[id]/favorite/route.ts` — PATCH toggle favorite
- `events/channels/route.ts` — GET distinct channels
- `events/stats/route.ts` — GET KPI metrics
- `projects/route.ts` — GET/POST project CRUD
- `cron/nasa/route.ts` — NASA polling (triggered by Vercel Cron)
- `export/route.ts` + `import/route.ts` — JSON export/import

### Component Organization
- `src/components/ui/` — shadcn/ui primitives (don't edit manually, use `npx shadcn add`)
- `src/components/dashboard/` — event feed, KPI cards, search, filters, pagination
- `src/components/charts/` — timeline, channel distribution, NEO scatter, space weather bar
- `src/components/layout/` — header, theme toggle, project selector

### NASA Polling (`src/lib/nasa/`)
- `donki.ts` — polls DONKI notifications API, maps space weather events
- `neo.ts` — polls NEO feed API, maps asteroid data
- Both deduplicate before inserting

### Path Alias
`@/*` maps to `./src/*` (configured in tsconfig.json)

## Environment Variables

Required in `events-dashboard/.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NASA_API_KEY`
- `CRON_SECRET`

## Database

Two tables: `projects` and `events`. Schema is defined in `PLAN.md`. Events reference projects via `project_id` (cascade delete). The `events` table has GIN indexes for tags and full-text search.

Types are manually defined in `src/lib/supabase/types.ts` (not auto-generated).
