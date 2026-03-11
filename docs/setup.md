# Setup Guide

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier works)
- A [NASA API key](https://api.nasa.gov) (optional, `DEMO_KEY` works for low-volume testing)

## 1. Clone and install

```bash
git clone https://github.com/TomGem/Polso.git
cd Polso
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL**, **anon key**, and **service_role key** from Project Settings > API

## 3. Run the database schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste the contents of `supabase-schema.sql` from the project root
4. Click **Run**

This creates the `projects` and `events` tables, indexes, RLS policies, and enables Realtime on the events table.

## 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

| Variable | Description | Where to find it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Project Settings > API > Project API keys > anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key (keep secret) | Project Settings > API > Project API keys > service_role |
| `NASA_API_KEY` | NASA API key | [api.nasa.gov](https://api.nasa.gov) — or use `DEMO_KEY` |
| `CRON_SECRET` | Secret for cron endpoint auth | Generate any random string |

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/projects` to create your first project.

## 6. First steps

1. Go to `/projects` and click **New Project**
2. Copy the generated API key
3. Trigger the NASA data import manually:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/nasa
   ```
4. Go to the dashboard to see real NASA space weather and asteroid data

## Deploying to Vercel

### 1. Connect your repository

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Vercel will auto-detect Next.js

### 2. Set environment variables

In your Vercel project settings, add the same environment variables from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NASA_API_KEY`
- `CRON_SECRET`

### 3. Cron jobs

The `vercel.json` file configures a cron job that runs every 15 minutes:

```json
{
  "crons": [
    { "path": "/api/cron/nasa", "schedule": "*/15 * * * *" }
  ]
}
```

Vercel Cron automatically calls `GET /api/cron/nasa` with the `Authorization: Bearer <CRON_SECRET>` header. This only works on Vercel's Pro plan or higher. On the Hobby plan, you can trigger it manually or use an external cron service.

### 3. Deploy

Push to `main` and Vercel deploys automatically.
