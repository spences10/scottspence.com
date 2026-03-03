# Blog Post Examples

## Complete Example Structure

CRITICAL: Examples must reflect Scott's REAL experiences. Never
fabricate scenarios that didn't happen. Use actual posts as templates.

```markdown
---
title: 'Investigating My Database Read Spike'
date: 2025-10-17
published: false
---

## The Problem

I had a bit of a surprise land in my inbox at the start of the month
from my analytics provider Fathom. Not the good type of surprise
though! 😅

The numbers just didn't add up - 742k reads when I'm only expecting
maybe 150k?

## The Investigation

First things first - I needed to understand what was actually
happening. Here's the SQL query that gets the site popular posts:

\`\`\`sql SELECT slug, COUNT(\*) as views FROM analytics WHERE date >
date('now', '-30 days') GROUP BY slug ORDER BY views DESC LIMIT 10
\`\`\`

Looks innocent enough, right? So, this is doing a full table scan
every time it runs. The killer here is the lack of indexes.

## The Fix

Right, time to actually create these indexes!

\`\`\`sql CREATE INDEX idx_analytics_date_slug ON analytics(date,
slug); \`\`\`

## Results

That fixed it. Query went from ~5s to ~0.5s. Cool!

One query fixed, but clearly there's more going on here. Maybe it's
bot activity? 🤔
```

## Frontmatter Template

Every post must start with:

```markdown
---
title: 'Your Post Title Here'
date: YYYY-MM-DD
published: false
---
```

**Important:** Always set `published: false` initially. Only change to
`true` when ready for publication.
