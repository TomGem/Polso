# Polso

A real-time events dashboard that receives data from external applications through a REST API, displays it in a live feed, and visualizes it with charts. Built with Next.js, Supabase, and shadcn/ui.

Polso is a tech demo and has no real function.

## Features

- **REST API** — POST endpoint for ingesting events with API key authentication
- **Live feed** — real-time event updates via Supabase Realtime (PostgreSQL subscriptions)
- **Charts** — events timeline, channel distribution, NEO scatter plot, space weather bar chart
- **KPI cards** — total events, events today, channel count, critical events (7d)
- **Multi-project** — each project has its own API key and isolated data
- **Channel filtering** — channels are created dynamically when events are pushed
- **Search** — full-text search across event titles and descriptions
- **Favorites** — mark important events with visual highlighting
- **NASA integration** — automated polling of DONKI (space weather) and NEO (asteroids) APIs
- **Export/Import** — backup and restore event data as JSON
- **Dark/Light mode** — system-aware theme toggle

## Quick start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the Supabase schema (see docs/setup.md)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your first project at `/projects`.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL + Realtime) |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts (via shadcn/ui Charts) |
| Theming | next-themes |
| Icons | Lucide React |
| Font | SF Pro (macOS system font) |

## Documentation

- [Setup guide](docs/setup.md) — Supabase configuration, environment variables, Vercel deployment
- [API reference](docs/api.md) — endpoints, authentication, request/response formats
- [NASA module](docs/nasa-module.md) — DONKI and NEO polling, event mapping, cron configuration
- [Database schema](docs/database.md) — tables, indexes, RLS policies, Realtime setup

## Pushing events

Once you have a project and its API key, push events from any application:

```bash
curl -X POST https://your-app.vercel.app/api/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "channel": "my-app",
    "title": "User signed up",
    "description": "New user registered via OAuth",
    "tags": ["user", "signup"],
    "importance": "normal"
  }'
```

## License

MIT
