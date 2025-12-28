# Local Analytics Implementation

Self-hosted analytics using SQLite to replace Fathom API dependency.

## Infrastructure

- **Host**: Hetzner VPS via Coolify (16GB RAM, 8 vCPUs, 160GB storage)
- **Runtime**: Node.js in Docker container
- **Database**: SQLite with better-sqlite3 (synchronous)
- **Persistent container** - no serverless cold starts

## Status: v3 Heartbeat (Dec 28, 2025)

Heartbeat-based live visitors. Batched writes for analytics events.
Load tested with 3200 concurrent requests, 0 failures.

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

### What's left

- [ ] Set up cron jobs in Coolify for rollup/cleanup
- [ ] Test rollup job with real data
- [ ] Stats page UI using rollup tables
- [ ] Remove old Fathom-based stats (Phase 3)
- [ ] Remove old `visitors_store` system
- [ ] Delete unused queue read functions

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

| Job                  | Schedule    | Purpose                                         |
| -------------------- | ----------- | ----------------------------------------------- |
| `rollup_analytics`   | Daily 00:05 | Aggregate yesterday's events into rollup tables |
| `flag_bot_behaviour` | Daily 00:10 | Mark suspicious patterns as bots                |
| `cleanup_analytics`  | Daily 00:15 | Delete events >7 days, VACUUM                   |

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

- `src/lib/analytics/active-sessions.ts` - server-side session map
- `src/lib/analytics/live-analytics.svelte.ts` - shared client state
- `src/lib/analytics/live-analytics.remote.ts` - heartbeat commands
- `src/lib/components/viewing-now.svelte` - per-page viewer count
- `src/lib/components/live-visitors.svelte` - total live visitors
- `src/routes/+layout.svelte` - init heartbeat on mount

### Rollup/cleanup

- `src/routes/api/ingest/rollup-analytics.ts` - daily rollup job
- `src/routes/api/ingest/cleanup-analytics.ts` - 2-day retention
