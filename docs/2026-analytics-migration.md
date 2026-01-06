# 2026 Analytics Migration Plan

<!-- cspell:ignore rollups Adblockers -->

Migrate from Fathom API to self-hosted analytics using
`analytics_events` table.

> **Note**: See `local-analytics.md` for detailed implementation docs
> and the Fathom Migration Status section.

## Status: Jan 6, 2026

**Completed:**

- [x] Click events migration (`Fathom.trackEvent` → `click_events`
      table)
- [x] Popular posts migration (local rollups + cached queries)
- [x] Bot detection for "today" queries (inline CTE filtering)

**Remaining:**

- [ ] Per-post analytics modal → local rollups
- [ ] Delete dead code (`update_stats`, `update_popular_posts`)
- [ ] Remove Fathom API client

**Fathom stays for**: pageview tracking in `+layout.svelte` only.

---

## Bot Detection Fix ✅ (Jan 6, 2026)

### Problem

"Today" popular posts showed 10k+ views vs Fathom's ~200 views.

### Root cause

Behaviour-based bot detection (`flag_bot_behaviour.ts`) only runs
during daily rollup at 03:05. For "today" queries on
`analytics_events`, only UA-based detection applies - missing
sophisticated bots with realistic UAs.

### Analysis

**Traffic distribution (2.5 days, 109k events):**

| Hit range | Visitors | Total views | % of traffic |
| --------- | -------- | ----------- | ------------ |
| 1 hit     | 6,679    | 6,679       | 14.5%        |
| 2-5       | 3,005    | 7,780       | 16.9%        |
| 6-10      | 340      | 2,541       | 5.5%         |
| 11-50     | 272      | 6,477       | 14.1%        |
| 51-100    | 44       | 3,105       | 6.8%         |
| **100+**  | **47**   | **19,410**  | **42.2%**    |

**Human behaviour patterns (hits per page):**

| Hits/page | Visitors | % of total | Interpretation        |
| --------- | -------- | ---------- | --------------------- |
| 1-2       | 9,721    | 93.6%      | Normal humans         |
| 3-5       | 407      | 3.9%       | Engaged readers       |
| 6-10      | 76       | 0.7%       | Suspicious            |
| 11-20     | 53       | 0.5%       | Very suspicious       |
| **20+**   | **130**  | **1.3%**   | Almost certainly bots |

**Top offenders (Firefox UA, single page, thousands of hits):**

- `2b541b33...`: 5,066 hits to 1 page (Firefox Mac)
- `556ae857...`: 2,544 hits to 1 page (Firefox Mac)
- `e9ad616a...`: 1,533 hits to 1 page (Firefox Mac)

**Targeted pages:**

- `/posts/configuring-mcp-tools-in-claude-code` → 9,155 bot hits
- `/posts/my-zsh-config` → 6,066 bot hits

### Fathom comparison

**Real-time comparison (Jan 6):**

- **Fathom**: 5 visitors
- **Local**: 52 visitors
- **Ratio**: 10x difference

**Daily totals comparison (Jan 6):**

| Source         | Views  | Visitors | Ratio vs Fathom |
| -------------- | ------ | -------- | --------------- |
| Fathom         | ~1,400 | 547      | 1x              |
| Local raw      | 25,758 | 2,105    | **18x views**   |
| Local filtered | 3,884  | 2,015    | **2.8x views**  |

**Before/after filtering:**

- Raw: **18x** more views than Fathom (bot-inflated)
- Filtered: **2.8x** more views than Fathom (reasonable)

**Why local > Fathom (even after filtering):**

1. **Adblockers** - ~30-40% of tech users block Fathom JS, but
   server-side tracking catches everyone
2. **Fathom's extra filtering** - datacenter IPs, headless browsers,
   fingerprinting we don't do
3. **Some bots still slipping through** - could tighten thresholds
   further if needed

**Why this validates local analytics:**

- Server-side = actual visitors (no blockers)
- Fathom undersells true traffic due to adblockers
- Local oversells due to bots, but filtering brings it close
- 2.8x gap is expected/acceptable for a tech audience

### Solution implemented

**Inline CTE filtering** in `fetch_popular_today`:

```sql
WITH bad_visitors AS (
    -- Visitors exceeding per-path threshold
    SELECT DISTINCT visitor_hash
    FROM analytics_events
    WHERE created_at >= ?
    GROUP BY visitor_hash, path
    HAVING COUNT(*) > 20
    UNION
    -- Visitors exceeding total threshold
    SELECT visitor_hash
    FROM analytics_events
    WHERE created_at >= ?
    GROUP BY visitor_hash
    HAVING COUNT(*) > 100
)
SELECT ...
WHERE visitor_hash NOT IN (SELECT visitor_hash FROM bad_visitors)
```

### Aligned thresholds

Both `flag-bot-behaviour.ts` and `popular-posts.helpers.ts` now use:

| Threshold     | Old value | New value | Rationale                        |
| ------------- | --------- | --------- | -------------------------------- |
| Per path/day  | 50        | **20**    | 93.6% humans have 1-2 hits/page  |
| Total/day     | 200       | **100**   | Engaged humans avg 31 total hits |
| Per path/hour | 20        | **10**    | Burst detection (not yet used)   |

### Files modified

- `src/lib/data/popular-posts.helpers.ts` - CTE filter + thresholds
- `src/routes/api/ingest/flag-bot-behaviour.ts` - aligned thresholds

---

## What's done

- [x] `analytics_events` tracking with batched writes
- [x] `rollup_analytics` cron (daily 03:05) - aggregates to
      daily/monthly/yearly/all_time
- [x] `cleanup_analytics` cron (daily 03:15) - 2-day retention +
      VACUUM
- [x] Bot detection via `flag_bot_behaviour` (runs inside rollup)
- [x] Stats page using local rollup tables
- [x] Live visitors via heartbeat (in-memory)
- [x] Cron jobs running in ping-the-thing
- [x] 2025 Fathom data imported
- [x] Click events table + tracking function
- [x] 7 components migrated from `Fathom.trackEvent`
- [x] Popular posts using local rollups (cached queries)

## What's left

- [x] Fix bot detection for "today" popular posts
- [ ] Switch per-post analytics modal to local rollups
- [ ] Delete `update_stats` ingest task (dead code)
- [ ] Delete `update_popular_posts` ingest task
- [ ] Remove Fathom API client (`src/lib/fathom/`)
- [ ] Remove `FATHOM_API_KEY` env var (keep `PUBLIC_FATHOM_ID` for
      tracker)

---

## Click Events Migration ✅

### Components migrated

| Component                              | Event                         |
| -------------------------------------- | ----------------------------- |
| `newsletter-signup/signup-form.svelte` | `newsletter signup click`     |
| `popular-posts.svelte`                 | `popular post click: {title}` |
| `banner.svelte`                        | `{event_name}`                |
| `landing-hero.svelte`                  | `contact button click`        |
| `footer.svelte`                        | `{link.slug}`                 |
| `related-posts.svelte`                 | `related post click: {title}` |
| `posts/[slug]/+page.svelte`            | `analytics click: {path}`     |

### Files created/modified

- `migrations/005_add_click_events.sql` - table + indexes
- `src/lib/analytics/track-click.remote.ts` - remote function
- `src/lib/analytics/queue.ts` - added `click_queue` + `ClickEvent`
  type

---

## Popular Posts Migration ✅

### New approach (implemented)

- **Today**: `analytics_events` with 15-min cache
- **Month**: `analytics_monthly` rollup with 1-hour cache
- **Year**: `analytics_yearly` rollup with 1-hour cache

### Files modified

- `src/lib/data/popular-posts.helpers.ts` - new query functions
- `src/lib/data/popular-posts.remote.ts` - per-period caching
- `src/lib/cache/server-cache.ts` - added cache durations

### Benefits

- No cron job for popular posts
- Lazy evaluation (only queries when needed)
- No Fathom API dependency

---

## Per-Post Analytics Modal

Currently uses `post-analytics.remote.ts` → Fathom API.

### New approach

Query local rollup tables filtered by pathname:

```ts
export const get_post_analytics = query(async (pathname: string) => {
	const [daily, monthly, yearly] = await Promise.all([
		sqlite_client.execute(
			'SELECT date, views, uniques FROM analytics_daily WHERE path = ? ORDER BY date DESC LIMIT 30',
			[pathname],
		),
		sqlite_client.execute(
			'SELECT month, views, uniques FROM analytics_monthly WHERE path = ? ORDER BY month DESC LIMIT 12',
			[pathname],
		),
		sqlite_client.execute(
			'SELECT year, views, uniques FROM analytics_yearly WHERE path = ? ORDER BY year DESC',
			[pathname],
		),
	])
	return { daily, monthly, yearly }
})
```

---

## Dead code to delete

| File                                            | Action  |
| ----------------------------------------------- | ------- |
| `src/routes/api/ingest/update-stats.ts`         | Delete  |
| `src/routes/api/ingest/update-stats.test.ts`    | Delete  |
| `src/routes/api/ingest/update-popular-posts.ts` | Delete  |
| `src/lib/fathom/`                               | Delete  |
| `src/lib/data/post-analytics.remote.ts`         | Rewrite |
| `src/lib/state/post-analytics.svelte.ts`        | Rewrite |

---

## Cron schedule (after migration)

| Task                | Schedule    | Purpose                          |
| ------------------- | ----------- | -------------------------------- |
| `rollup_analytics`  | Daily 03:05 | Flag bots + aggregate to rollups |
| `cleanup_analytics` | Daily 03:15 | Delete events >2 days + VACUUM   |

`update_popular_posts` removed - replaced by cached queries.

---

## Historical Fathom tables

These tables contain pre-2026 data from Fathom API:

- `analytics_pages` - pageviews by path
- `analytics_countries` / `analytics_countries_summary`
- `analytics_browsers` / `analytics_browsers_summary`
- `analytics_device_types` / `analytics_device_types_summary`
- `analytics_referrers` / `analytics_referrers_summary`
- `analytics_site`
- `post_analytics` - per-post day/month/year stats
- `popular_posts` - top pages by period
- `fathom_api_calls` - API call tracking

**Decision**: Keep for historical reference. No need to delete
immediately.

---

## Data we lose from Fathom

- `avg_duration` (time on page)
- `bounce_rate`

These require session tracking which adds complexity. Decision: accept
this limitation - views + uniques sufficient for our needs.
