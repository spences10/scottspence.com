# Local Analytics Implementation

<!-- cspell:ignore rollups beforeunload TTFB dedup ipcountry visibilitychange teardown -->

Self-hosted analytics using SQLite to replace Fathom API dependency.

## Infrastructure

- **Host**: Hetzner VPS via Coolify (16GB RAM, 8 vCPUs, 160GB storage)
- **Runtime**: Node.js in Docker container
- **Database**: SQLite with better-sqlite3 (synchronous)
- **Persistent container** - no serverless cold starts

## Status: v3.2 Fathom Removal Ready (Jan 2, 2026)

Heartbeat-based live visitors. Batched writes for analytics events.
Non-blocking page loads - popular posts fetch via remote function.
Load tested with 100 concurrent requests, 0 failures.

Cron jobs running in ping-the-thing. Ready to remove Fathom
dependency.

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
- [x] Cron jobs in ping-the-thing (rollup 03:05, cleanup 03:15)
- [x] Stats page with period stats + live dashboard

### What's left

- [ ] Remove Fathom API dependency (see Fathom Migration Status below)
- [ ] Delete legacy `update_stats` ingest task
- [ ] Switch popular posts from Fathom to local rollups
- [ ] Switch per-post analytics from Fathom to local rollups

---

## Fathom Migration Status (Jan 2, 2026)

### Current state

Two analytics systems running in parallel:

| Feature                    | Source              | Notes                 |
| -------------------------- | ------------------- | --------------------- |
| Site-wide stats (`/stats`) | Local rollups       | ✅ Done               |
| Live visitors              | In-memory heartbeat | ✅ Done               |
| Popular posts              | Fathom API          | ❌ Still using Fathom |
| Per-post analytics (modal) | Fathom API          | ❌ Still using Fathom |

### Fathom API still used by

| File                                            | Purpose                |
| ----------------------------------------------- | ---------------------- |
| `src/lib/fathom/fetch-fathom-data.ts`           | API client             |
| `src/lib/data/post-analytics.remote.ts`         | Per-post stats (modal) |
| `src/lib/state/post-analytics.svelte.ts`        | Per-post stats (state) |
| `src/routes/api/ingest/update-popular-posts.ts` | Popular posts cron     |

### Dead code to remove

| File                                         | Reason                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/routes/api/ingest/update-stats.ts`      | Reads from `analytics_pages` (Fathom table), superseded by `rollup_analytics` |
| `src/routes/api/ingest/update-stats.test.ts` | Test for dead code                                                            |

### What local analytics DOESN'T capture

Fathom provides `avg_duration` and `bounce_rate` per post. Local
analytics doesn't track these - would require session end/navigation
tracking.

**Decision**: Accept this limitation. Views + uniques are sufficient.

### Migration steps

1. **Delete `update_stats`** - dead code, not in cron
2. **Switch popular posts** - query `analytics_all_time` instead of
   Fathom
3. **Switch per-post analytics** - query
   `analytics_daily/monthly/yearly` filtered by pathname
4. **Remove Fathom client** - delete `src/lib/fathom/`
5. **Remove Fathom env vars** - `FATHOM_API_KEY`, `PUBLIC_FATHOM_ID`
6. **Remove fathom-client package** - `pnpm remove fathom-client`

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
(before aggregation). Also applied inline via CTE in
`popular-posts.helpers.ts` and `period-stats.remote.ts` for real-time
queries.

**Single source of truth:** `src/lib/analytics/bot-thresholds.ts`

| Threshold                    | Value | Purpose                              |
| ---------------------------- | ----- | ------------------------------------ |
| `MAX_HITS_PER_PATH_PER_DAY`  | 20    | Scraper hitting same page repeatedly |
| `MAX_HITS_TOTAL_PER_DAY`     | 100   | Crawler visiting many pages          |
| `MAX_HITS_PER_PATH_PER_HOUR` | 10    | Burst detection (not yet used)       |

**Files importing thresholds:**

- `flag-bot-behaviour.ts` - nightly rollup flagging
- `popular-posts.helpers.ts` - "today" popular posts CTE
- `period-stats.remote.ts` - stats page filtering
- `rollup-analytics.ts` - rollup job

Based on Jan 2026 analysis: 93.6% of humans have 1-2 hits/page. See
`2026-analytics-migration.md` for full analysis.

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

- `src/routes/stats/+page.svelte` - live dashboard + period +
  historical
- `src/lib/analytics/live-analytics.remote.ts` -
  `get_live_stats_breakdown()` (in-memory only)
- `src/lib/analytics/live-analytics.helpers.ts` - formatting logic
- `src/lib/analytics/period-stats.remote.ts` - `get_period_stats()`
  (DB queries by time period)
- `src/lib/analytics/period-stats.helpers.ts` - time boundaries,
  formatting

## Stats Page Implementation (Dec 30, 2025)

### What it shows

**Live dashboard** (in-memory heartbeat):

- Active visitors (from in-memory sessions)
- Countries with flag emojis
- Top active pages
- Browser/device breakdown

**Period stats** (queries `analytics_events`):

- Today, Yesterday, 7 days, 30 days, 12 months
- Views + unique visitors
- Top pages, countries, browsers, devices
- Queries filtered by `created_at` timestamp

**Historical data** (uses rollup tables) - unchanged.

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

## Known Issue: Heartbeat Request Pile-up (Jan 2026)

### Problem

When server is slow or under load, `send_heartbeat` requests pile up
(100+ pending). Observed in DevTools: many requests stuck in "pending"
state for 3+ minutes.

### Root cause

In `src/lib/analytics/live-analytics.svelte.ts`:

1. **No in-flight guard** - `setInterval(do_heartbeat, 5000)` fires
   regardless of pending requests
2. **Visibility trigger stacks** - `visibilitychange` fires additional
   heartbeat on tab focus, adding to pile
3. **No request cancellation** - Remote functions don't support
   AbortSignal

### Planned fix (not yet implemented)

Refactor to Svelte 5 `$effect` pattern with proper cleanup:

```ts
// In-flight guard prevents pile-up
let heartbeat_in_flight = false

export const create_heartbeat_effect = () => {
	if (!browser) return () => {}

	const session_id = get_session_id()
	let interval: ReturnType<typeof setInterval> | null = null
	let is_visible = !document.hidden

	const do_heartbeat = async () => {
		// Skip if request already in flight or tab hidden
		if (heartbeat_in_flight || !is_visible) return

		heartbeat_in_flight = true
		try {
			const result = await send_heartbeat({ session_id, path })
			// update state...
		} finally {
			heartbeat_in_flight = false
		}
	}

	const on_visibility_change = () => {
		is_visible = !document.hidden
		if (is_visible && !interval) {
			do_heartbeat()
			interval = setInterval(do_heartbeat, 5000)
		} else if (!is_visible && interval) {
			clearInterval(interval)
			interval = null
		}
	}

	// Start
	interval = setInterval(do_heartbeat, 5000)
	document.addEventListener('visibilitychange', on_visibility_change)

	// Cleanup for $effect
	return () => {
		if (interval) clearInterval(interval)
		document.removeEventListener(
			'visibilitychange',
			on_visibility_change,
		)
	}
}
```

**Usage in +layout.svelte:**

```svelte
$effect(() => {
  return create_heartbeat_effect()
})
```

### Key changes

1. **In-flight guard** - skip heartbeat if previous still pending
2. **Visibility pause** - stop interval when tab hidden
3. **`$effect` cleanup** - proper teardown on component destroy

### Audit concerns (to address before implementing)

| Issue                       | Risk   | Notes                                         |
| --------------------------- | ------ | --------------------------------------------- |
| Double `end_session()`      | Medium | Called in beforeunload AND cleanup            |
| No re-entry guard           | Medium | Multiple intervals if effect re-runs          |
| HMR flag leak               | Low    | `heartbeat_in_flight` not reset during dev    |
| Remote function AbortSignal | N/A    | Not supported - in-flight guard is workaround |

### Research notes

- `getAbortSignal()` (Svelte 5.35+) only works with raw fetch, not
  remote functions
- Remote functions are RPC-style, don't expose signal parameter
- SvelteKit issue #14146: abort signals don't propagate to server
- Sources:
  [svelte $effect docs](https://svelte.dev/docs/svelte/$effect),
  [getAbortSignal](https://svelte.dev/docs/svelte/svelte)
