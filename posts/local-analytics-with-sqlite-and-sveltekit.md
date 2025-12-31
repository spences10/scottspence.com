---
date: 2025-12-29
title: Local Analytics with SQLite and SvelteKit
tags: ['sveltekit', 'sql', 'sqlite', 'analytics', 'performance']
is_private: false
---

<!-- cspell:ignore Checkpointing -->

I've been using Fathom Analytics for years and it's great, but I
wanted something more integrated. Something that could power live
visitor counts and popular posts without external API calls. This is
what I learned building self-hosted analytics with SQLite - including
a production issue that taught me a lot about database write patterns.

Before starting on the main site, I built a test implementation to
work out if this was even viable:
[sveltekit-and-sqlite-analytics](https://github.com/spences10/sveltekit-and-sqlite-analytics).
That gave me confidence the approach would work. The problems came
when I deployed to the real site with real traffic.

## The setup

The site (this site) runs on a VPS with Node.js in Docker, SQLite with
`better-sqlite3`. The initial implementation was straightforward: hook
into SvelteKit's `hooks.server.ts`, capture page views, write to
SQLite.

```typescript
// Initial approach - simple INSERT per request
const insert_event = db.prepare(`
  INSERT INTO analytics_events (
    visitor_hash, pathname, created_at
  ) VALUES (?, ?, ?)
`)

// In hooks.server.ts
insert_event.run(visitor_hash, pathname, Date.now())
```

Looks fine. Write Ahead Log (WAL) mode enabled, works great in dev.
Deployed it and within a few hours had 21,676 events from 1,137
visitors. The data was flowing.

Two days later, I added deduplication to prevent duplicate entries
when users refresh pages. The idea was to use an UPSERT - if a visitor
hits the same page within a time window, increment a counter instead
of creating a new row.

The next day, everything broke.

## What happened

Dev started locking up occasionally. Then production. Network requests
started stacking up from 2 seconds to 20+ seconds. The `/posts` route
was particularly bad - `get_posts` taking 1-2 seconds to respond when
it should be sub 500ms. 503s started happening sometimes causing the
site to go down!

So, I SSH'd into the box to look at the database there:

```bash
ls -lh /app/data/*.db*
# site-data.db:     440M
# site-data.db-wal: 432M

ps aux | grep node
# node ./build/index.js  96% CPU
```

WAL file at 432mb, nearly as big as the main database. Checkpointing
wasn't happening. And `busy_timeout` was set to 0, meaning instant
failure on any lock contention.

The live visitors feature was the killer. I had the same remote
function being called from multiple components - footer, hero, viewing
now widget - each creating their own polling instance. That's 12
queries every 5 seconds hitting the database. Each UPSERT had to check
the unique index, decide INSERT or UPDATE, all whilst holding a write
lock. Requests queued up waiting for locks.

I tried a few things:

```typescript
db.pragma('busy_timeout = 5000')
```

```bash
sqlite3 /app/data/site-data.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

Changed polling from 5s to 30s. Consolidated 12 queries down to 2.
Added a composite index. Response times improved slightly but were
still hovering around 1700ms. None of it was enough - the fundamental
problem was writing to SQLite on every request.

I had to revert everything back to before local analytics was added.

## The rebuild

The fix was to stop writing on every request. One transaction with 100
INSERTs is far cheaper than 100 individual writes - each individual
write needs its own fsync to disk, but a transaction batches them into
one.

**Batched writes**

Queue events in memory, flush every 5 seconds:

```typescript
const event_queue: AnalyticsEvent[] = []

export function queue_event(event: AnalyticsEvent) {
	event_queue.push(event)
}

setInterval(() => {
	if (event_queue.length === 0) return

	const events = event_queue.splice(0)
	const insert = db.prepare(`
    INSERT INTO analytics_events (visitor_hash, pathname, created_at)
    VALUES (?, ?, ?)
  `)

	const insert_many = db.transaction((events) => {
		for (const e of events) {
			insert.run(e.visitor_hash, e.pathname, e.created_at)
		}
	})

	insert_many(events)
}, 5000)
```

Simple INSERTs inside a transaction. One fsync instead of hundreds.
Page requests don't touch the database at all.

**Heartbeat-based live visitors**

For the "live visitors" count, database queries were too slow. Moved
to an in-memory Map with 15-second TTL:

```typescript
const active_sessions = new Map<
	string,
	{ path: string; timestamp: number }
>()

export function heartbeat(session_id: string, path: string) {
	active_sessions.set(session_id, { path, timestamp: Date.now() })
}

export function get_live_count(): number {
	const now = Date.now()
	const ttl = 15000

	for (const [id, session] of active_sessions) {
		if (now - session.timestamp > ttl) {
			active_sessions.delete(id)
		}
	}

	return active_sessions.size
}
```

Client sends heartbeat every 5 seconds. Server maintains the Map. No
database involved.

I also fixed the multiple polling issue by using Svelte's shared state
in a `.svelte.ts` file - all components now share a single data source
instead of each creating their own remote function instance.

**Read path**

Stats queries go through rollup tables populated by background jobs,
with an in-memory cache on top:

```
Page view → Memory queue → Batch insert (5s) → analytics_events
                                                      ↓
                                            Daily rollup job
                                                      ↓
Stats page → In-memory cache (5min TTL) → Rollup tables only
```

The rule: never query `analytics_events` in the request path. That
table is write-only during normal operation.

## Load testing

Before deploying this time, I actually tested it. I used Claude Code
with sub-agents to run artillery tests - spawning multiple agents in
parallel to hit different routes simultaneously:

```bash
# Each agent ran something like this against different routes
for i in {1..50}; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" \
    http://localhost:3000/posts &
done; wait
```

Five agents hitting `/`, `/posts`, `/posts/[slug]`, `/tags`, and
`/about` with 50 concurrent requests each. All 200 OK, consistent
response times, no database locks.

Then I did the same against production:

```bash
# Against scottspence.com with 100 concurrent requests
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" \
    https://scottspence.com/posts &
done; wait
```

The `/posts` route went from ~7 seconds under load to sub-300ms. The
`/tags` route showed similar improvements. No 503s. That gave me the
confidence to leave it running in production.

## What I learned

**SQLite is synchronous**. It blocks the event loop. Under load,
synchronous database writes queue up and kill your server.

**WAL mode helps reads, writes still serialise**. WAL lets readers
access the database during writes. But writes themselves still happen
one at a time. You can't parallelise your way out of write contention.

**UPSERT is often redundant**. If you're deduplicating at write time,
ask whether `COUNT(DISTINCT)` at read time would work instead. The
read-time approach is usually cheaper because reads can be cached.

**Batch your writes**. One transaction with 100 INSERTs is way faster
than 100 individual INSERTs. The fsync overhead dominates at low batch
sizes.

**Test under load before deploying**. I've been doing this for years
and still deployed without proper load testing.

## Current status

The system's been stable since the rebuild:

- Batched writes working (5s flush interval)
- Live visitors via heartbeat (no DB hit)
- Bot detection using behaviour thresholds
- Popular posts via remote functions (non-blocking)
- Cron jobs running for rollup and cleanup

Still to do: export the 2025 data from Fathom, then the `/stats` route
will show current data from the rollup tables.

## Links

The implementation is in the
[scottspence.com repo](https://github.com/spences10/scottspence.com).
Key files:

- `src/lib/analytics/queue.ts` - in-memory write queue
- `src/lib/analytics/active-sessions.ts` - heartbeat session map
- `docs/local-analytics.md` - full architecture documentation

The test repo I used to prototype this:
[sveltekit-and-sqlite-analytics](https://github.com/spences10/sveltekit-and-sqlite-analytics)

If you're thinking about self-hosted analytics with SQLite, batch your
writes, keep live features in memory, and load test before you deploy.

Have you built your own analytics or had similar database performance
issues? Hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10).
