# NASA Module

Polso includes a built-in polling module that fetches data from two NASA APIs and pushes it as events into the dashboard. Since these APIs are pull-based, the module acts as a bridge that converts them into push-based events.

## Data sources

### DONKI — Space Weather Database

**API:** `https://api.nasa.gov/DONKI/notifications`

Polls notifications from the last 24 hours. Each notification is mapped to an event with:

| DONKI Type | Event Title | Icon | Importance |
|------------|------------|------|------------|
| FLR | Solar Flare | `sun` | high |
| CME | Coronal Mass Ejection | `orbit` | high |
| GST | Geomagnetic Storm | `zap` | critical |
| SEP | Solar Energetic Particle | `atom` | high |
| MPC | Magnetopause Crossing | `shield` | normal |
| RBE | Radiation Belt Enhancement | `radio` | normal |
| HSS | High Speed Stream | `wind` | normal |
| IPS | Interplanetary Shock | `alert-triangle` | high |

All events are assigned to the `nasa-donki` channel. The first paragraph of the notification body is extracted as the event description.

**Deduplication:** Events are deduplicated by `messageID` in the metadata. If an event with the same `messageID` already exists for the project, it is skipped.

### NEO — Near Earth Objects

**API:** `https://api.nasa.gov/neo/rest/v1/feed`

Fetches the asteroid close-approach feed for today. Each asteroid is mapped to an event with:

- **Channel:** `nasa-neo`
- **Title:** Asteroid name (cleaned of parentheses)
- **Description:** Human-readable summary with distance, velocity, diameter, and hazard status
- **Icon:** `alert-triangle` for hazardous asteroids, `globe` for safe ones
- **Importance:** `critical` for potentially hazardous, `normal` otherwise

**Metadata stored:**
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
  "nasaUrl": "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=54606182"
}
```

This metadata powers the NEO scatter chart on the dashboard (distance vs. velocity, sized by diameter, colored by hazard status).

**Deduplication:** Events are deduplicated by `asteroidId` + `closeApproachDate`. The same asteroid won't be inserted twice for the same close-approach date.

## Cron configuration

The module runs as a Vercel Cron job configured in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/nasa", "schedule": "*/15 * * * *" }
  ]
}
```

This calls `GET /api/cron/nasa` every 15 minutes. The endpoint is secured with a `CRON_SECRET` environment variable — the request must include an `Authorization: Bearer <secret>` header.

### Triggering manually

During development, trigger it manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/nasa
```

## NASA API key

The module uses the `NASA_API_KEY` environment variable. You can use `DEMO_KEY` for testing (rate-limited to 30 requests/hour). For production, get a free key at [api.nasa.gov](https://api.nasa.gov).

## Source files

- `src/lib/nasa/donki.ts` — DONKI fetching and event mapping
- `src/lib/nasa/neo.ts` — NEO fetching and event mapping
- `src/app/api/cron/nasa/route.ts` — cron endpoint with deduplication logic
