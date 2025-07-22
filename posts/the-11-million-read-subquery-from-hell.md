---
date: 2025-07-21
title: The 11 Million Read Subquery From Hell
tags: ['turso', 'database', 'sveltekit', 'sql']
is_private: true
---

Vibe coding! Embrace the vibes man! Let the LLM do all the work and
blindly accept it and go with the vibes! Thing is, LLMs are like
golden retrievers very happy to please, very happy to try do clever
stuff when actually the boring and mundane is fine!

I was a bit stressed about my Turso analytics showing a bananas read
numbers! Last check was 9.58 billion reads! I thought I found the
issue with a CTE query that was doing full table scans every 5
minutes, but that was just the warm-up act.

So the
[Hunting Down 1.3 Billion Row Database Reads](https://scottspence.com/posts/hunting-down-billion-row-database-reads)
is now nearly 10 billion reads!! CTEs fixed, indexes added, query
optimized - job done, right?

Wrong. Dead wrong. 😅

Turns out that was just the warm-up act. The REAL villain was hiding
in plain sight, quietly generating **11.5 MILLION database reads**
every single time it ran. And here's the kicker - I'd actually
"optimized" it in June, making it exponentially worse in the process.

Classic mistake, really.

## The Plot Twist

After fixing the CTE query, I thought I was sorted. But then I noticed
something weird in my Turso analytics - reads were still going mental,
but now with a different pattern. Instead of constant high reads from
the popular posts query, I was seeing these massive spikes that would
hit millions of reads in minutes.

The timing was suspicious too. Remember how I mentioned the massive
reads started around July 1st? Well, let me tell you about a little
commit that happened on June 24th...

## The "Optimization" That Broke Everything

Back on June 24th, 2025, I made what I thought was a brilliant
optimization to the related posts functionality. You know, the bit
that suggests similar posts using vector embeddings? I'd moved from
JavaScript cosine similarity calculations to Turso's native
`vector_distance_cos` function for "optimal performance."

Here's what I changed in `src/routes/api/ingest/embeddings.ts`:

**Before (the "slow" version):**

```typescript
// Get current post embedding
const current_post_result = await client.execute({
	sql: 'SELECT embedding FROM post_embeddings WHERE post_id = ?',
	args: [post_id],
})

const current_embedding = new Float32Array(
	current_post_result.rows[0].embedding,
)

// Get all other posts
const all_posts_result = await client.execute({
	sql: 'SELECT post_id, embedding FROM post_embeddings WHERE post_id != ?',
	args: [post_id],
})

// Calculate similarities in JavaScript
const similarities = all_posts_result.rows.map((row) => ({
	post_id: row.post_id,
	similarity: cosine_similarity(
		current_embedding,
		new Float32Array(row.embedding),
	),
}))
```

**After (the "optimized" version):**

```sql
SELECT post_id,
  vector_distance_cos(
    embedding,
    (SELECT embedding FROM post_embeddings WHERE post_id = ?)
  ) as distance
FROM post_embeddings
WHERE post_id != ?
ORDER BY distance ASC
LIMIT ?
```

See that innocent-looking subquery?
`(SELECT embedding FROM post_embeddings WHERE post_id = ?)`

Yeah, that's the devil right there.

## The Mathematics of Horror

Here's what I didn't realize at the time - that subquery runs **once
for every row** in the main query. It's a correlated subquery, which
means SQLite executes it for each of the 226 posts in my embeddings
table.

So for ONE call to `get_related_posts`:

- Main query scans 226 rows
- Subquery executes 226 times (once per row)
- **Total reads: 226 × 226 = 51,076 database reads**

But wait, it gets worse. The related posts update process runs for ALL
posts:

- 226 posts need their related posts calculated
- Each post triggers 51,076 reads
- **Total: 226 × 51,076 = 11,542,576 reads per batch**

That's right - **11.5 MILLION database reads** for what should be a
simple similarity comparison! 🤯

## The Timeline Makes Perfect Sense Now

- **June 24th**: "Optimized" the related posts query with the
  correlated subquery
- **July 1st**: Massive database reads start appearing (probably first
  time the batch update ran with the new query)
- **July 17th**: All 226 posts updated (you can see this in the
  `related_posts.last_updated` timestamps)

The math is brutal but simple:

- **Before the "optimization"**: ~700 reads per batch (reasonable)
- **After the "optimization"**: 11.5 million reads per batch (insane)

No wonder Turso was getting absolutely hammered!

## The Detective Work

Today, Claude Code (absolute legend) helped me track this down
properly. We dug through the git history around the time the reads
started spiking:

```bash
git log --oneline --since="2025-06-20" --until="2025-07-05"
```

And there it was - commit `9cb068ab` from June 24th:
`refactor: optimize related posts retrieval and update process with batch processing`.

The irony is painful. The commit message literally says "optimize" but
it made things 16,000x worse! 😭

## The Real Fix

The solution was embarrassingly simple. Instead of a correlated
subquery, just do two separate queries:

```typescript
// First: get the target post's embedding
const target_post_result = await client.execute({
	sql: 'SELECT embedding FROM post_embeddings WHERE post_id = ?',
	args: [post_id],
})

const target_embedding = target_post_result.rows[0].embedding

// Second: compare all other posts to that embedding
const result = await client.execute({
	sql: `SELECT post_id, 
    vector_distance_cos(embedding, ?) as distance 
  FROM post_embeddings 
  WHERE post_id != ? 
  ORDER BY distance ASC 
  LIMIT ?`,
	args: [target_embedding, post_id, limit],
})
```

**Impact:**

- **Before**: 51,076 reads per call
- **After**: 2 reads per call (99.996% reduction!)

For the full batch update:

- **Before**: 11.5 million reads
- **After**: ~450 reads

That's a **99.996% reduction** in database reads. Bloody brilliant! 🎉

## Testing the Fix

After implementing the fix, I ran the `update_related_posts` ingest
task:

```bash
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "update_related_posts", "token": "your-secret-token"}'
```

Checking the database afterwards:

```sql
SELECT DATE(last_updated) as date, COUNT(*) as posts_updated
FROM related_posts
WHERE last_updated IS NOT NULL
GROUP BY DATE(last_updated)
ORDER BY date DESC
```

**Result**: All 226 posts updated on `2025-07-21` instead of the
previous `2025-07-17` - and this time without destroying the database!

## The Lessons (Again)

This whole saga taught me some painful but valuable lessons:

**Correlated subqueries are performance killers**. What looks like
elegant SQL can hide exponential complexity. Always check if your
subquery depends on the outer query's current row.

**"Optimization" without measurement is just guessing**. I thought
native SQL functions would be faster than JavaScript, but I never
measured the actual database load.

**Query plans matter more than query elegance**. A simple two-query
approach vastly outperformed the "clever" single query with a
subquery.

**Git history is your friend for performance debugging**. When weird
spikes appear, `git log` around that timeframe often reveals the
smoking gun.

**Trust your instincts about timing**. The July 1st spike happening a
week after a June 24th code change? That's not a coincidence.

## The Complete Picture

So here's what was actually happening to my database:

1. **CTE Monster**: The popular posts query was doing full table scans
   every 5 minutes (fixed in previous post)
2. **Subquery From Hell**: The related posts update was doing 11.5
   million reads whenever it ran (fixed today)
3. **Missing Indexes**: Basic lookups were unnecessarily slow (also
   fixed)

The CTE was the constant background noise - annoying but predictable.
The related posts subquery was the nuclear bomb going off
occasionally, absolutely obliterating my read quotas.

## What's Next?

With both these issues fixed, my Turso analytics should look
completely different:

- **Popular posts queries**: Down from 2,100+ reads per execution to
  ~60 reads
- **Related posts updates**: Down from 11.5 million reads to ~450
  reads
- **Overall database load**: Expecting 99%+ reduction in total reads

But wait - there's more! 😅

## The Plot Twist: It Was Me All Along

So there I was, feeling proper chuffed about fixing the subquery from
hell, when I noticed something mental in the server logs. Even with
all the optimizations, I was still seeing database calls every few
seconds:

```
Database unavailable, returning empty popular posts: BLOCKED
Database unavailable for reaction counts: BLOCKED
Database unavailable, returning empty related posts: BLOCKED
```

The pattern was dead suspicious - regular as clockwork, every 5-6
seconds. Classic bot behavior, right? So I added some logging to catch
the culprits...

Turns out it was **my own bloody health checks**! 🤦‍♂️

The hosting platform (Coolify) was hitting my homepage with
`curl/7.81.0` every 5 seconds to make sure the app was alive. Each
health check would load the layout, which would try to fetch popular
posts, which would hit the database.

**Self-pwn achievement unlocked!**

I'd been hunting external bots when the calls were coming from inside
the house. The hosting platform was basically DDoS'ing my own database
with wellness checks.

Quick fix in the hooks file:

```typescript
const is_health_check =
	user_agent.includes('curl') ||
	user_agent.includes('wget') ||
	client_ip === '127.0.0.1'

// Skip health checks entirely - return minimal response
if (is_health_check && pathname === '/') {
	return new Response('OK', { status: 200 })
}
```

Now health checks get a simple "OK" without touching any database
queries. Problem solved!

I really should implement proper performance monitoring so this never
happens again. A simple endpoint to track query metrics would have
caught this much sooner.

## The Real Moral of the Story

Sometimes the "optimizations" are the problem. I spent weeks thinking
the issue was the CTE query (which was indeed terrible), but the real
killer was hiding in a function I'd "optimized" and forgotten about.

Performance debugging is like being a detective - you need to follow
the timeline, check the evidence (git history), and question your
assumptions. The obvious suspect isn't always the real culprit.

And honestly? Having Claude Code as a debugging partner made all the
difference. Fresh eyes on the code, systematic investigation, and
spotting patterns I'd missed. Proper teamwork! 🤖

## Want to Check the Sauce?

The fix is in the
[scottspence.com repo](https://github.com/spences10/scottspence.com).
Key change is in `src/routes/api/ingest/embeddings.ts` - replacing the
correlated subquery with two simple queries.

If you're doing vector similarity searches with SQL, watch out for
correlated subqueries. They'll bite you when you least expect it.

Cool! Have you ever "optimized" something into oblivion? Or found
performance issues hiding in functions you'd forgotten about? Hit me
up on [Bluesky](https://bsky.app/profile/scottspence.dev) - I'd love
to hear your horror stories of accidental database destruction! 😅
