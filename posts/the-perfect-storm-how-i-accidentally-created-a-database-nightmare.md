---
date: 2025-07-25
title: How I Managed to go from 500k daily reads to 1 billion
tags: ['turso', 'database', 'sql', 'sveltekit', 'notes']
is_private: true
---

Right, so I've been telling you about my database optimization journey
over the last few posts, but I've been treating the symptoms, not the
actual disease. Today, with some proper detective work from Claude
Code, we finally cracked the case of how I accidentally turned my
humble blog into a database-destroying monster.

This is the real story of how multiple "optimizations" combined into
the perfect storm that nearly broke my Turso database. Spoiler alert:
it wasn't the CTEs, it wasn't the indexes, and it definitely wasn't
bot traffic.

It was me. All me. 😅

## The Crime Scene

Let me set the scene with the actual numbers from my Turso analytics:

**June 25-30, 2025**: Normal life - 140k to 675k reads per day **July
1, 2025**: BOOM! - 18 million reads **July 2-12, 2025**: Steady
nightmare - 110 million reads per day **July 12+ onwards**: Absolute
chaos - 516 million to 1 billion reads per day

I spent weeks chasing CTEs and missing indexes, but the real timeline
tells a completely different story.

## The First Smoking Gun: June 24th

Here's where it all started going wrong. On June 24th, I made what I
thought was a brilliant optimization to my related posts
functionality. The commit message?

`refactor: optimize related posts retrieval and update process with batch processing`

Classic mistake - the word "optimize" in a commit message should be a
red flag! 😂

**What I changed:**

```typescript
// BEFORE (the "slow" JavaScript version)
const current_embedding = await get_post_embedding(post_id)
const all_posts = await get_all_other_embeddings(post_id)

// Calculate similarities in JavaScript
const similarities = all_posts.map((row) => ({
	post_id: row.post_id,
	similarity: cosine_similarity(current_embedding, row.embedding),
}))
```

**AFTER (the "optimized" SQL version):**

```sql
SELECT post_id,
  vector_distance_cos(
    embedding,
    (SELECT embedding FROM post_embeddings WHERE post_id = ?)  -- DEVIL QUERY
  ) as distance
FROM post_embeddings
WHERE post_id != ?
ORDER BY distance ASC
LIMIT ?
```

See that innocent-looking subquery? That's a **correlated subquery
from hell**.

## The Mathematics of Destruction

Here's what I didn't realize: that subquery executes **once for every
row** in the main query. With 226 posts in my embeddings table:

- Main query: 226 rows
- Subquery executions: 226 (once per row)
- **Total reads per related post calculation: 226 × 226 = 51,076
  reads**

But it gets worse. When I run the full related posts update batch:

- 226 posts need their related posts calculated
- Each post = 51,076 reads
- **Total per batch: 226 × 51,076 = 11,542,576 reads**

That's right - **11.5 million database reads** for what should be a
few hundred reads! The "optimization" made things roughly **16,000
times worse**.

## The Timeline Makes Perfect Sense Now

**June 24th**: Deployed the correlated subquery (dormant bomb planted)
**July 1st**: First major spike (18M reads) - I published a post and
ran the ingest tasks for the first time with the new query **July
2-12**: Steady 110M reads - regular site usage amplified by the
inefficient query lurking in the background **July 12+**: Absolute
chaos - multiple batch runs of the related posts update

## The Second Perfect Storm: State Management Without Caching

But wait, there's more! Around July 12th, I also started refactoring
from API endpoints to direct state management calls. The problem? I
removed the persistent caching without realizing it.

**Before (working):**

```typescript
// API endpoint with proper persistent caching
export const load = async ({ fetch }) => {
	const res = await fetch(`../api/fetch-popular-posts`)
	// Returns cached data, only hits DB when cache expires
}
```

**After (broken):**

```typescript
// Direct state management without persistent cache
export const load = async () => {
	const popular_posts = await get_popular_posts()
	// Hits database on every page load if cache is empty
}
```

The server-side cache I added was just an in-memory `Map()` that gets
wiped on every deployment, restart, or cold start. With Coolify's
preview branches and frequent deployments, this meant the cache was
constantly empty.

## The Perfect Storm Recipe

So here's how I accidentally created the perfect database-destroying
storm:

1. **Correlated subquery (June 24th)**: Made related posts 16,000x
   more expensive
2. **Publishing workflow**: I'd publish posts, then run ingest tasks
   (triggering the 11.5M read batch)
3. **State management "optimization"**: Removed persistent caching, so
   every page load = database hit
4. **Snowball effect**: Traffic + cache misses + expensive queries =
   exponential growth

Every time I published a post and ran the ingest tasks, I was
essentially DDoS'ing my own database. Then every visitor to the site
would potentially trigger more expensive operations if caches were
empty.

## The Detective Work

The breakthrough came when Claude Code and I properly analysed the git
timeline around the spike dates instead of just looking at recent
changes. We found:

- The correlated subquery was introduced weeks before the spikes
- The timing of manual batch operations matched the major read
  explosions
- The state management changes aligned with the sustained high read
  periods

It's a classic performance debugging lesson: **follow the timeline,
not your assumptions**.

## How It All Connected

**The Trigger Pattern:**

1. I'd write a blog post
2. Publish it and run the ingest tasks
3. Related posts batch update executes the correlated subquery (11.5M
   reads)
4. Visitors come to read the new post
5. Popular posts load from uncached state management (more reads per
   page)
6. Related posts might load again if cache is empty (potential for
   more 51k read spikes)

It was a feedback loop of database destruction, all triggered by my
normal publishing workflow.

## The Real Lessons

**"Optimization" without measurement is just guessing**. I thought
native SQL would be faster than JavaScript, but I never measured the
actual database impact. The vector distance calculation was faster,
but the query structure was catastrophically inefficient.

**Correlated subqueries are performance killers**. If your subquery
depends on the outer query's current row, it runs once per row. Always
check if you can rewrite as separate queries or joins.

**Cache invalidation is one of the two hard problems in computer
science**. My in-memory cache looked good in testing but failed
spectacularly in production with frequent deployments.

**Follow the timeline when debugging performance issues**. The obvious
recent changes aren't always the culprit. The real problem might have
been lurking for weeks.

**Your normal workflow can be the trigger**. The publishing and ingest
process I'd been doing for months suddenly became a
database-destroying weapon when the underlying queries changed.

## The Aftermath

Once we identified the root causes, the fixes were actually
straightforward:

**Related Posts Fix:**

```typescript
// Two separate queries instead of correlated subquery
const target_embedding = await get_post_embedding(post_id) // 1 read
const similarities = await calculate_similarities(
	target_embedding,
	post_id,
) // 1 read
// Total: 2 reads instead of 51,076 reads per post
```

**Caching Fix:** Embedded replicas solve the persistent cache problem
by making all reads local anyway.

**Result**: 99.996% reduction in database reads for related posts
operations.

## The Bigger Picture

This whole experience taught me that performance issues are often
perfect storms of multiple seemingly innocent changes. The correlated
subquery sat dormant for a week before my normal workflow triggered it
at scale. The state management changes looked like good architectural
improvements but removed crucial caching.

It's also a reminder that automated testing can only catch so much.
None of my tests would have caught this because they don't replicate
the scale of production batch operations or the cache invalidation
patterns of real deployments.

## Want to Check the Sauce?

The timeline is all there in the git history if you want to see the
exact commits:

- `9cb068ab` (June 24th) - The correlated subquery introduction
- Multiple commits around July 12th+ - State management changes

The fixes are in the latest code in the
[scottspence.com repo](https://github.com/spences10/scottspence.com).

Cool! Have you ever accidentally created a perfect storm of
performance issues? Or spent weeks optimizing the wrong thing? Hit me
up on [Bluesky](https://bsky.app/profile/scottspence.dev) - I'd love
to hear your database horror stories and detective work!
