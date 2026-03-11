# API Reference

All endpoints are under `/api/`. The base URL depends on your deployment (e.g. `http://localhost:3000` or `https://your-app.vercel.app`).

## Authentication

Write endpoints require an API key passed via the `x-api-key` header. Each project has its own API key, generated automatically when the project is created. You can find it on the `/projects` page.

```
x-api-key: your-project-api-key
```

Read endpoints (GET) do not require authentication.

---

## Events

### POST /api/events

Push one or more events to a project.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `x-api-key` | Yes | Project API key |

**Body (single event):**
```json
{
  "channel": "my-app",
  "title": "User signed up",
  "description": "New user registered via OAuth",
  "tags": ["user", "signup"],
  "metadata": { "userId": "abc123", "plan": "pro" },
  "icon": "zap",
  "importance": "normal"
}
```

**Body (batch):**
```json
[
  { "channel": "my-app", "title": "Event 1" },
  { "channel": "my-app", "title": "Event 2" }
]
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `channel` | string | No | `"default"` | Channel name (created dynamically) |
| `title` | string | Yes | — | Event title |
| `description` | string | No | `null` | Event description |
| `tags` | string[] | No | `[]` | Searchable tags |
| `metadata` | object | No | `{}` | Arbitrary JSON data |
| `icon` | string | No | `null` | Lucide icon name (e.g. `"sun"`, `"zap"`, `"globe"`) |
| `importance` | string | No | `"normal"` | One of: `"low"`, `"normal"`, `"high"`, `"critical"` |

**Response (201):**
```json
{
  "inserted": 1,
  "events": [{ "id": "uuid", "title": "...", ... }]
}
```

---

### GET /api/events

Fetch events with filtering, search, and pagination.

**Query parameters:**
| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `project_id` | Yes | — | Project UUID |
| `channel` | No | — | Filter by channel |
| `search` | No | — | Search titles and descriptions |
| `favorites` | No | — | Set to `"true"` to show only favorited events |
| `page` | No | `1` | Page number |
| `limit` | No | `20` | Events per page (10, 20, 50, 100) |

**Response (200):**
```json
{
  "events": [{ "id": "uuid", "title": "...", ... }],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### PATCH /api/events/:id/favorite

Toggle the favorited status of an event.

**Response (200):** The updated event object.

---

### GET /api/events/channels

Get all distinct channel names for a project.

**Query parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `project_id` | Yes | Project UUID |

**Response (200):**
```json
["nasa-donki", "nasa-neo", "my-app"]
```

---

### GET /api/events/stats

Get KPI metrics and chart data for a project.

**Query parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `project_id` | Yes | Project UUID |

**Response (200):**
```json
{
  "totalEvents": 42,
  "eventsToday": 5,
  "channelCount": 3,
  "criticalEvents": 2,
  "channelCounts": { "nasa-donki": 10, "nasa-neo": 30, "my-app": 2 },
  "timelineData": [
    { "date": "2026-03-10", "nasa-donki": 5, "nasa-neo": 12 },
    { "date": "2026-03-11", "nasa-donki": 5, "nasa-neo": 18, "my-app": 2 }
  ]
}
```

---

## Projects

### GET /api/projects

List all projects.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Space Watch",
    "description": "NASA tracking",
    "api_key": "hex-string",
    "created_at": "2026-03-11T23:07:18Z"
  }
]
```

### POST /api/projects

Create a new project.

**Body:**
```json
{
  "name": "My Project",
  "description": "Optional description"
}
```

**Response (201):** The created project object including the generated `api_key`.

### DELETE /api/projects?id=uuid

Delete a project and all its events.

---

## Export / Import

### GET /api/export?project_id=uuid

Download all events for a project as a JSON file.

### POST /api/import?project_id=uuid

Import events from a previously exported JSON file.

**Body:** The JSON object from an export (must contain an `events` array).

**Response (201):**
```json
{ "imported": 42 }
```

---

## Cron

### GET /api/cron/nasa

Polls NASA DONKI and NEO APIs and inserts new events into the first project. Deduplicates by checking existing metadata.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer YOUR_CRON_SECRET` |

**Response (200):**
```json
{
  "success": true,
  "inserted": 18,
  "timestamp": "2026-03-11T23:08:37.281Z"
}
```
