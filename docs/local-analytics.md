# Local Analytics Implementation

<!-- cspell:ignore rollups beforeunload TTFB dedup -->

Self-hosted analytics using SQLite to replace Fathom API dependency.

## Infrastructure

- **Host**: Hetzner VPS via Coolify (16GB RAM, 8 vCPUs, 160GB storage)
- **Runtime**: Node.js in Docker container
- **Database**: SQLite with better-sqlite3 (synchronous)
- **Persistent container** - no serverless cold starts

## Status: v3.1 Non-blocking (Dec 28, 2025)

Heartbeat-based live visitors. Batched writes for analytics events.
Non-blocking page loads - popular posts fetch via remote function.
Load tested with 100 concurrent requests, 0 failures.

### What's done

- [x] `analytics_events` table with batched writes (5s flush)
- [x] `analytics_daily` rollup table
- [x] In-memory queue in `src/lib/analytics/queue.ts`
- [x] WAL checkpoint on startup
- [x] `track_analytics` hook (non-blocking)
- [x] `rollup_analytics` + `cleanup_analytics` ingest tasks
- [x] Heartbeat-based live visitors (replaces queue-based approach)
- [x] Active sessions map with 15s TTL
- [x] Shared client state (single heartbeat interval)
- [x] `ViewingNow` + `LiveVisitors` components using shared state
- [x] Popular posts via remote function (non-blocking)
- [x] Removed blocking `+layout.server.ts` DB queries

### What's left

- [ ] Set up cron jobs in Coolify for rollup/cleanup
- [ ] Test rollup job with real data
- [ ] Stats page UI using rollup tables
- [ ] Remove old Fathom-based stats (Phase 3)

---

## v1 Learnings (Dec 2025)

Initial implementation caused performance issues under load. See below
for what went wrong and how v2 fixed it.

## Learnings from v1 (Dec 2025)

### Timeline of regression

| Date         | Change                                  | Impact                                         |
| ------------ | --------------------------------------- | ---------------------------------------------- |
| Dec 24 09:27 | Initial analytics with cached statement | ✅ Good                                        |
| Dec 24 11:05 | Removed caching "for HMR"               | ⚠️ Statement prep every request                |
| Dec 24 16:42 | Added country field                     | More columns                                   |
| Dec 24 17:04 | Added UA parsing                        | More processing per request                    |
| Dec 26 10:15 | Added UPSERT dedup + unique index       | 🔴 Complex conflict resolution on every INSERT |
| Dec 26       | Live visitors queries                   | More DB reads                                  |

### WAL bloat

WAL file grew to 444MB under load. Fix: add checkpoint on startup:

```ts
// In hooks.server.ts initialization
sqlite_client.exec('PRAGMA wal_checkpoint(TRUNCATE);')
```

### UPSERT was redundant

The UPSERT deduplication was expensive and unnecessary:

| What UPSERT does          | What queries already do                     |
| ------------------------- | ------------------------------------------- |
| Dedupe at write time      | `COUNT(DISTINCT visitor_hash)` at read time |
| Expensive on every INSERT | Cheap (visitor_hash indexed)                |
| Blocks page render        | Doesn't affect user                         |

Simple INSERT + COUNT(DISTINCT) at read time achieves same result.

### What went wrong

1. **DB write per request** - `track_analytics` hook wrote to
   `analytics_events` on every page view. Under traffic spikes, this
   overwhelmed the DB.

2. **N+1 queries for reactions** - `get_reaction_counts` did separate
   query per reaction type:

   ```ts
   // BAD: N queries
   for (const reaction of reactions) {
   	await db.execute(
   		'SELECT count FROM reactions WHERE post_url = ? AND reaction_type = ?',
   	)
   }
   ```

3. **In-memory cache works but not shared** - Each container restart
   clears cache, causing initial burst of DB queries.

4. **Blocking queries in request path** - Even "fire-and-forget"
   writes can block under load when SQLite's write lock is contended.

5. **Large table size** - `analytics_events` grew to 500MB+ quickly
   with high traffic.

### What should have been done

1. **Batch writes** - Queue page views in memory, flush every 5-10
   seconds:

   ```ts
   const queue: PageView[] = []

   setInterval(() => {
   	if (queue.length) {
   		db.exec(
   			`INSERT INTO analytics_events VALUES ${formatBatch(queue)}`,
   		)
   		queue.length = 0
   	}
   }, 5000)
   ```

2. **Single query for reactions**:

   ```sql
   -- GOOD: 1 query
   SELECT reaction_type, count FROM reactions WHERE post_url = ?
   ```

3. **Persistent cache** - Consider Redis or file-based cache that
   survives container restarts.

4. **WAL mode** - Already enabled, but ensure `PRAGMA busy_timeout` is
   set for concurrent access.

5. **Separate write endpoint** - Don't write in the main request hook.
   Use a dedicated endpoint or queue.

6. **Aggressive data retention** - Delete raw events after 7 days,
   keep only rollups.

## Architecture for v3

### Write path (non-blocking)

```
Page view → Memory queue → Batch insert every 5s
                         ↓
                   analytics_events
                         ↓
              Daily rollup job → analytics_daily/monthly/yearly
                         ↓
              Cleanup job → DELETE events > 2 days + VACUUM
```

### Live visitors (heartbeat)

```
Client                          Server
  │                               │
  ├─► init_live_analytics()       │
  │   (onMount in +layout)        │
  │                               │
  ├─► send_heartbeat ────────────►├─► active_sessions.set(id, path)
  │   every 5s                    │   (in-memory Map)
  │                               │
  │◄─ { unique_visitors,    ◄─────┤
  │     path_viewers }            │
  │                               │
  ├─► end_session ───────────────►├─► active_sessions.delete(id)
  │   (beforeunload)              │
  │                               │
  │   Session expires after 15s   │
  │   of no heartbeat             │
```

### Read path (cached)

```
Stats page → In-memory cache (5min TTL) → Rollup tables
                                        ↓
                                 NOT analytics_events
```

### Key principles

1. Never query `analytics_events` in request path - only rollup tables
2. Never write synchronously in request hook
3. Use rollup tables for all reads
4. Live visitors from heartbeat (not write queue)
5. Single shared heartbeat interval per client

## Tables

### Raw events (write-heavy, short retention)

```sql
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY,
  visitor_hash TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  browser TEXT,
  device_type TEXT,
  is_bot INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Composite index for rollups
CREATE INDEX idx_events_rollup ON analytics_events(created_at, path, is_bot);
```

### Rollup tables (read-heavy, permanent)

- `analytics_daily` - per-path daily stats
- `analytics_monthly` - per-path monthly stats
- `analytics_yearly` - per-path yearly stats
- `analytics_all_time` - per-path totals

## Cron jobs

| Job                 | Schedule    | Purpose                                              |
| ------------------- | ----------- | ---------------------------------------------------- |
| `rollup_analytics`  | Daily 03:05 | Flag bots + aggregate yesterday's events into rollup |
| `cleanup_analytics` | Daily 03:15 | Delete events >7 days, VACUUM                        |

### Bot detection thresholds

Behaviour-based bot detection runs as part of `rollup_analytics`
(before aggregation).

Configurable in `src/routes/api/ingest/flag-bot-behaviour.ts`:

| Threshold                    | Default | Purpose                               |
| ---------------------------- | ------- | ------------------------------------- |
| `MAX_HITS_PER_PATH_PER_DAY`  | 50      | Scraper hitting same page repeatedly  |
| `MAX_HITS_TOTAL_PER_DAY`     | 200     | Crawler visiting many pages           |
| `MAX_HITS_PER_PATH_PER_HOUR` | 20      | Burst detection (not yet implemented) |

Adjust based on observed traffic patterns.

## Migration plan

### Phase 1: Fix infrastructure

- [ ] Implement batched writes
- [ ] Fix N+1 queries (reactions, etc.)
- [ ] Add persistent cache (Redis or file-based)
- [ ] Create rollup tables and jobs

### Phase 2: Re-enable tracking

- [ ] Deploy with `track_analytics` disabled
- [ ] Enable tracking (hooks run on all requests - no partial rollout)
- [ ] Monitor DB size and response times

### Phase 3: Replace Fathom

- [ ] Export 2025 Fathom data
- [ ] Build stats UI using rollup tables
- [ ] Remove Fathom API code

## Debugging learnings

### 503 errors on first request

Pattern observed: first `__data.json` request returns 503, SvelteKit
retries, second succeeds. This was DB lock contention under load.

### Symptoms vs causes

| Symptom                            | Likely cause                         |
| ---------------------------------- | ------------------------------------ |
| 503 on first request               | DB lock contention / request timeout |
| TTFB 10+ seconds                   | Event loop blocked by sync SQLite    |
| Cache hit 0ms but slow response    | Something after cache is blocking    |
| Variable response times (100ms-3s) | GC or write lock contention          |

### SQLite specifics

- `better-sqlite3` is **synchronous** - blocks event loop
- Under load, write lock contention causes queuing
- WAL mode helps reads but writes still serialize
- Large tables (500MB+) slow down VACUUM

### Monitoring commands

```bash
# Check DB size
ls -lh data/site-data.db

# Count events
sqlite3 data/site-data.db "SELECT COUNT(*) FROM analytics_events"

# Check for bot ratio
sqlite3 data/site-data.db "SELECT is_bot, COUNT(*) FROM analytics_events GROUP BY is_bot"
```

### Request timing hook

Add to `hooks.server.ts` for debugging:

```ts
const time_request: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const response = await resolve(event)
	const duration = performance.now() - start
	if (duration > 500) {
		console.log(
			`[slow] ${event.url.pathname} ${duration.toFixed(0)}ms`,
		)
	}
	return response
}
```

## Bun consideration

Bun's native `bun:sqlite` is faster than `better-sqlite3` and has no
native compilation. Could be worth switching if we revisit this, but
won't fix architecture issues alone.

## Related files

### Analytics core

- `src/hooks.server.ts` - tracking enabled, WAL checkpoint
- `src/lib/analytics/queue.ts` - in-memory write queue + 5s flush
- `src/lib/analytics/utils.ts` - visitor hash, UA parsing
- `src/lib/sqlite/schema.sql` - table definitions
- `migrations/003_add_analytics_events.sql` - schema migration

### Live visitors (heartbeat)

- `src/lib/analytics/active-sessions.ts` - server-side session map +
  aggregation
- `src/lib/analytics/live-analytics.svelte.ts` - shared client state
- `src/lib/analytics/live-analytics.remote.ts` - heartbeat commands
- `src/lib/analytics/live-analytics.helpers.ts` - testable pure
  functions
- `src/lib/components/viewing-now.svelte` - per-page viewer count
- `src/lib/components/live-visitors.svelte` - total live visitors
- `src/routes/+layout.svelte` - init heartbeat on mount

### Popular posts (non-blocking)

- `src/lib/data/popular-posts.remote.ts` - remote function for DB
  queries
- `src/lib/data/popular-posts.helpers.ts` - testable query logic
- `src/lib/components/popular-posts.svelte` - fetches on mount
- `src/lib/components/footer.svelte` - fetches on mount

### Rollup/cleanup

- `src/routes/api/ingest/flag-bot-behaviour.ts` - behaviour-based bot
  detection
- `src/routes/api/ingest/rollup-analytics.ts` - daily rollup job
- `src/routes/api/ingest/cleanup-analytics.ts` - 2-day retention

### Stats page

- `src/routes/stats/+page.svelte` - live dashboard + historical data
- `src/lib/analytics/live-analytics.remote.ts` -
  `get_live_stats_breakdown()` (in-memory only)
- `src/lib/analytics/live-analytics.helpers.ts` - formatting logic

## Stats Page Implementation (Dec 29, 2025)

### What it shows

Live dashboard with:

- Active visitors (from in-memory sessions)
- Recent visitors (last 5 mins from DB)
- Countries with flag emojis
- Top active pages
- Browser/device breakdown

Historical data below (unchanged - uses rollup tables).

### Consistent live stats via extended active-sessions

Live stats now use in-memory sessions ONLY - no DB queries. This
ensures all numbers are consistent (same source, same moment in time).

**How it works:**

1. Heartbeat extracts country/browser/device from request headers
2. Metadata stored in `ActiveSession` alongside path/visitor_hash
3. `get_live_stats_breakdown()` aggregates from in-memory Map
4. No mixing of DB queries (5 min window) with heartbeat data (15s
   TTL)

**ActiveSession type:**

```ts
type ActiveSession = {
	visitor_hash: string
	path: string
	last_seen: number
	country?: string // from cf-ipcountry header
	browser?: string // from UA parsing
	device_type?: string // from UA parsing
}
```

**Benefits:**

- All live numbers from single source = consistent
- Zero DB queries for live dashboard
- No cache staleness issues
- Simpler code (removed 4 SQL queries)

### Future improvements

If /stats page causes issues under load:

1. ~~Move country/browser to in-memory tracking~~ ✅ Done (Dec
   29, 2025)
2. Add TTL cache (30s) if aggregation becomes slow with many sessions
3. Create real-time rollup table updated by flush timer (if needed)
