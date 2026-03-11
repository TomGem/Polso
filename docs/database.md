# Database Schema

Polso uses Supabase (PostgreSQL) with two tables. The full schema is in `supabase-schema.sql` at the project root.

## Tables

### projects

Stores project definitions and their API keys.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid | `gen_random_uuid()` | Primary key |
| `name` | text | — | Project name (required) |
| `description` | text | `null` | Optional description |
| `api_key` | text | Random 32-byte hex | Unique API key for event ingestion |
| `created_at` | timestamptz | `now()` | Creation timestamp |

The `api_key` is generated automatically using `encode(gen_random_bytes(32), 'hex')` and is unique across all projects.

### events

Stores all events across all projects.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid | `gen_random_uuid()` | Primary key |
| `project_id` | uuid | — | Foreign key to `projects.id` (cascade delete) |
| `channel` | text | — | Channel name (e.g. `"nasa-donki"`, `"my-app"`) |
| `title` | text | — | Event title (required) |
| `description` | text | `null` | Event description |
| `tags` | text[] | `{}` | Array of string tags |
| `metadata` | jsonb | `{}` | Arbitrary JSON data for source-specific fields |
| `icon` | text | `null` | Lucide icon name for display |
| `importance` | text | `"normal"` | One of: `low`, `normal`, `high`, `critical` |
| `favorited` | boolean | `false` | Whether the event is starred |
| `created_at` | timestamptz | `now()` | Creation timestamp |

## Indexes

| Index | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| `idx_events_project_id` | `project_id` | btree | Filter events by project |
| `idx_events_channel` | `channel` | btree | Channel filtering |
| `idx_events_created_at` | `created_at DESC` | btree | Pagination / ordering |
| `idx_events_importance` | `importance` | btree | Critical events queries |
| `idx_events_favorited` | `favorited` | btree | Favorites filtering |
| `idx_events_tags` | `tags` | GIN | Tag-based lookups |

## Row Level Security

Both tables have RLS enabled with the following policies:

- **Public read** — the `anon` key can read all projects and events (needed by the dashboard frontend)
- **Service role full access** — the `service_role` key can perform all operations (used by API routes)

In a production environment, you may want to tighten these policies (e.g. restrict reads to authenticated users or specific project owners).

## Realtime

The events table is added to the `supabase_realtime` publication:

```sql
alter publication supabase_realtime add table events;
```

This enables the dashboard to subscribe to `INSERT` and `UPDATE` events on the `events` table, filtered by `project_id`. The frontend uses the Supabase JS client's `.channel()` API to receive live updates.

## Metadata examples

The `metadata` JSONB column stores source-specific data. Here are examples for each channel:

**nasa-donki:**
```json
{
  "messageID": "20260311-7-1",
  "messageType": "FLR",
  "messageURL": "https://kauai.ccmc.gsfc.nasa.gov/...",
  "issueTime": "2026-03-11T12:30Z"
}
```

**nasa-neo:**
```json
{
  "asteroidId": "54606182",
  "name": "(2026 EJ1)",
  "missDistanceKm": 790312.35,
  "velocityKmh": 36225.26,
  "diameterMinM": 7.53,
  "diameterMaxM": 16.84,
  "isHazardous": false,
  "closeApproachDate": "2026-03-11",
  "nasaUrl": "https://ssd.jpl.nasa.gov/..."
}
```

**Custom events** can store any JSON structure relevant to their source application.
