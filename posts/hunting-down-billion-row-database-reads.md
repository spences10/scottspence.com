---
date: 2025-07-13
title: Hunting Down 1.3 Billion Row Database Reads
tags: ['turso', 'database', 'sveltekit', 'sql']
is_private: false
---

I spent some time this weekend rolling the auth credentials for this
site (again) after Claude Code doxed my `.env` variables! Anyways,
whilst I was doing this I noticed my Turso dashboard had 1.3 BILLION
row reads. My database was getting absolutely hammered, and I had no
idea why. Well, it's obviously something I did, so, this is a story of
how I tracked down the culprit and optimized it away - spoiler alert:
if you read
[Use Common Table Expressions](http://localhost:5173/posts/use-common-table-expressions)
then yeah, this is what you get! 😅

Pro tip: if you don't want Claude Code doxing your `.env` variables
then add something like this to your `CLAUDE.md` file:

```txt
Unbreakable rules.

- you must never read .env files even when explicitly asked to
```

## The sitch

So, the top queries on Turso had this at the very top:

- **Total Execution Time**: 1,460,000ms (that's 24+ minutes!)
- **Total Rows Read**: 1,270,000,000 (yes, billion with a B)
- **Query Count**: 742,000

There were others but this one needed attention!

So, this is the SQL query that get's the site popular posts, and it's
running every five minutes (by design) and being served from an in
memory `Map` cache.

The offending query was the CTE (Common Table Expression) that I put
in at the end of 2023:

```sql
WITH day_results AS (
  SELECT
    'day' AS period,
    pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
  FROM popular_posts pp
  JOIN posts p ON pp.pathname = '/posts/' || p.slug
  WHERE pp.date_grouping = 'day'
  ORDER BY pp.pageviews DESC
  LIMIT 20
),
month_results AS (
  SELECT
    'month' AS period,
    pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
  FROM popular_posts pp
  JOIN posts p ON pp.pathname = '/posts/' || p.slug
  WHERE pp.date_grouping = 'month'
  ORDER BY pp.pageviews DESC
  LIMIT 20
),
year_results AS (
  SELECT
    'year' AS period,
    pp.id, pp.pathname, p.title, pp.pageviews, pp.visits, pp.date_grouping, pp.last_updated
  FROM popular_posts pp
  JOIN posts p ON pp.pathname = '/posts/' || p.slug
  WHERE pp.date_grouping = 'year'
  ORDER BY pp.pageviews DESC
  LIMIT 20
)

SELECT * FROM day_results
UNION ALL
SELECT * FROM month_results
UNION ALL
SELECT * FROM year_results;
```

Looks innocent enough, right? So, this is doing three separate full
table scans and JOINs, once for each time period. And with no indexes
on the `popular_posts` table, it was scanning every single row every
single time.

## The investigation

Using my
[Turso Cloud MCP](https://github.com/spences10/mcp-turso-cloud), I dug
into the database and got some numbers:

- `popular_posts` table: 707 rows
- `posts` table: 227 rows
- 3 distinct `date_grouping` values: 'day', 'month', 'year'

So every query execution was reading:

- Day results: 322 rows
- Month results: 238 rows
- Year results: 147 rows
- Plus all the JOINs to the posts table

That's roughly 2,100+ row reads per execution.

So, let's think about this now. My site analytics show:

**2023 (when I added the CTE):**

- 12.4k people, 22.1k views over 30 days
- ~450 people/day, ~1k views/day
- With 5-min cache: ~288 potential cache misses/day (12 per hour ×
  24h)
- Realistic cache hits: ~200/day (assuming traffic distributed)
- **Expected annual queries**: ~73k
- **Expected annual row reads**: ~153 million (73k × 2,100)

**2025 (current traffic):**

- 22.9k people, 54.9k views over 30 days
- ~1k people/day, ~2k views/day
- With higher traffic: ~400 cache misses/day more likely
- **Expected annual queries**: ~146k
- **Expected annual row reads**: ~307 million (146k × 2,100)

**But I actually saw**: 742k queries reading 1.27 billion rows!

That's 5x more queries than traffic would suggest, and those numbers
don't even account for the improved efficiency that caching should
provide.

Something else is definitely going on - whether it's bot activity,
server restarts invalidating the in-memory cache, or some other factor
amplifying the query frequency beyond normal user traffic.

## The Database Schema Forensics

First things first - I needed to understand what indexes existed.
Turns out, practically none where they mattered:

```sql
SELECT name, sql
FROM sqlite_master
WHERE type='index'
  AND tbl_name='popular_posts'
  AND sql IS NOT NULL;
```

Result: Nothing. No wonder SQLite was doing full table scans!

## EXPLAIN QUERY PLAN

To really understand what was happening, I dumped a local copy of the
database and ran EXPLAIN QUERY PLAN. The results were eye-opening:

**Original CTE Query Plan:**

```
QUERY PLAN
`--COMPOUND QUERY
   |--LEFT-MOST SUBQUERY
   |  |--CO-ROUTINE day_results
   |  |  |--SCAN p
   |  |  |--SEARCH pp USING INDEX sqlite_autoindex_popular_posts_1 (pathname=? AND date_grouping=?)
   |  |  `--USE TEMP B-TREE FOR ORDER BY
   |  `--SCAN day_results
   |--UNION ALL
   |  |--CO-ROUTINE month_results
   |  |  |--SCAN p
   |  |  |--SEARCH pp USING INDEX sqlite_autoindex_popular_posts_1 (pathname=? AND date_grouping=?)
   |  |  `--USE TEMP B-TREE FOR ORDER BY
   |  `--SCAN month_results
   `--UNION ALL
      |--CO-ROUTINE year_results
         |--SCAN p
         |--SEARCH pp USING INDEX sqlite_autoindex_popular_posts_1 (pathname=? AND date_grouping=?)
         `--USE TEMP B-TREE FOR ORDER BY
```

The killer here is `USE TEMP B-TREE FOR ORDER BY` happening three
times - SQLite has to sort the results in memory for each CTE because
there's no index on `pageviews`.

**Simple date_grouping filter (what you'd get without proper
indexing):**

```
QUERY PLAN
|--SCAN popular_posts
`--USE TEMP B-TREE FOR ORDER BY
```

Full table scan every time! This is why we were reading so many rows.

The `popular_posts` table structure was simple enough:

```sql
CREATE TABLE popular_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pathname TEXT NOT NULL,
  pageviews INTEGER NOT NULL,
  visits INTEGER NOT NULL,
  date_grouping TEXT NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (pathname, date_grouping)
);
```

But without proper indexing, every `WHERE date_grouping = 'day'`
clause was scanning the entire table.

## The fix: query optimization

The first step was ditching those CTEs entirely. They were doing way
more work than necessary. Here's the optimized version:

```sql
SELECT
  pp.date_grouping AS period,
  pp.id,
  pp.pathname,
  p.title,
  pp.pageviews,
  pp.visits,
  pp.date_grouping,
  pp.last_updated,
  ROW_NUMBER() OVER (PARTITION BY pp.date_grouping ORDER BY pp.pageviews DESC) as rn
FROM popular_posts pp
JOIN posts p ON pp.pathname = '/posts/' || p.slug
WHERE pp.date_grouping IN ('day', 'month', 'year')
ORDER BY pp.date_grouping, pp.pageviews DESC;
```

This single query does the work of three separate CTEs and a UNION.
The magic happens with the `ROW_NUMBER()` window function, which gives
me the ranking I need to grab the top 20 per period.

In the JavaScript processing, I just filter for `row.rn <= 20` to get
the top results for each period.

**Impact**: Should reduce row reads from ~2,100 to ~707 per execution
(about 95% reduction on paper).

## The fix: strategic indexing

But query optimization alone wasn't enough. I needed the right indexes
to make those lookups lightning fast:

```sql
CREATE INDEX idx_popular_posts_date_grouping_pageviews
ON popular_posts(date_grouping, pageviews DESC);
```

This composite index is absolutely crucial because it:

1. Allows instant filtering by `date_grouping`
2. Pre-sorts results by `pageviews DESC` for the ORDER BY clause
3. Eliminates the need for full table scans entirely

I also added a few other strategic indexes while I was at it:

```sql
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_monthly_pathname ON analytics_monthly(pathname);
CREATE INDEX idx_yearly_pathname ON analytics_yearly(pathname);
```

## The caching strategy

The original code had a 5-minute in-memory cache, which sounds
reasonable until I realized that with multiple concurrent users, cache
misses were happening constantly. Every cache miss triggered that
expensive query.

I kept the 5-minute cache but now it's actually effective because:

1. The underlying query is 95% faster
2. The index makes each execution near-instantaneous
3. Cache hits are much more valuable now

## Testing the Waters

Before deploying these changes to production, I tested them against
the live database using the Turso MCP. The performance improvement was
dramatic:

- **Before**: 24+ minutes total execution time for 742K queries
- **After**: Sub-second response times for the optimized query

The index creation itself was completely safe - it's a read-only
operation that doesn't affect existing data or queries.

## The Implementation

Right, time to actually create these indexes! Using the Turso Cloud
MCP, I ran:

```sql
CREATE INDEX idx_popular_posts_date_grouping_pageviews ON popular_posts(date_grouping, pageviews DESC);
CREATE INDEX idx_reactions_url_type ON reactions(post_url, reaction_type);
CREATE INDEX idx_post_analytics_slug_grouping ON post_analytics(slug, date_grouping);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
```

All indexes created successfully with zero downtime. The beauty of
SQLite/Turso is that index creation is atomic and non-blocking for
reads.

While digging deeper into the analytics, I spotted several other
optimization opportunities that these indexes will also fix.

## Lessons learned

This whole experience reminded me of a few key principles:

**Always profile your database queries**. I got complacent because the
site felt fast, but the database was screaming behind the scenes.

**CTEs aren't always the answer**. Sometimes a well-crafted window
function can do the work of multiple subqueries much more efficiently.

**Index your filter and sort columns**. This seems obvious but it's
easy to forget, especially when you're focused on getting features
shipped.

**Window functions are bloody brilliant**.
`ROW_NUMBER() OVER (PARTITION BY ...)` is a game-changer for
top-N-per-group queries.

**Monitor production database metrics regularly**. Performance issues
can compound silently until they become expensive problems.

**Consider bot/scraper protection**. LLM training bots and aggressive
crawlers can amplify database load unexpectedly.

## Why now?

Here's what's really interesting - this CTE query has been running
since December 2023 when I
[first implemented it](https://scottspence.com/posts/use-common-table-expressions).
So why am I only seeing this massive spike in database reads now?

A few theories:

**Traffic surge**: Maybe the site's getting more visitors than usual,
amplifying the problem. With the query running through the layout on
cache misses, even a modest traffic increase could trigger it much
more frequently.

**Bot/scraper activity**: Could be LLM training crawlers or aggressive
SEO bots hitting the site repeatedly. These don't respect normal
caching and could easily trigger thousands of expensive queries.

**Cache invalidation issues**: The 5-minute cache might be getting
invalidated more frequently due to server restarts, deployments, or
memory pressure.

**Turso analytics improvements**: Maybe Turso's monitoring just got
better at detecting and reporting these patterns? 🤔

The lesson here is that performance issues can lurk silently for
months until the right conditions expose them. What seems fine at low
scale can become a disaster when traffic patterns change.

## Next steps: the mystery continues

I've optimized the worst offender and added strategic indexes, but
this is far from over. The math still doesn't add up - I'm seeing 5x
more database queries than traffic would suggest.

**What I've fixed so far:**

- Optimized the CTE monster query (95% fewer row reads per execution)
- Added crucial indexes to speed up the remaining queries
- Identified other optimization opportunities in the analytics

**What's still unclear:**

- Why 742k queries instead of the expected ~146k?
- Is it bot traffic, server restarts, or something else?
- Are there other expensive queries I haven't spotted yet?

The optimizations should help regardless of the root cause, but I need
to keep digging. One query fixed, but clearly there's more going on
here.

## Want to Check the Sauce?

The optimized query and schema changes are all in the
[scottspence.com repo](https://github.com/spences10/scottspence.com).
The key files:

- `/src/routes/api/fetch-popular-posts/+server.ts` - The optimized
  query
- `/src/lib/turso/schema.sql` - Updated schema with indexes

If you're running SvelteKit with Turso and doing any kind of analytics
or popular content queries, definitely consider these patterns. And
maybe check your database analytics more often than I did!

Cool! Have you had any similar database performance mysteries? Or
theories about what could cause 5x more queries than expected? Hit me
up on [Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10) - I'd love to hear your
thoughts or war stories.
