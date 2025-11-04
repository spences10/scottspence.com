# ScottInk Voice Examples

Real examples from Scott's blog posts demonstrating authentic voice
patterns.

## Opening Examples

### Story/Narrative Start

```markdown
So, there I was at 3am when production went down. I spent some time
this weekend rolling the auth credentials for this site (again) after
Claude Code doxed my `.env` variables! 😅
```

### Conversational Opener

```markdown
Cool! So, coding tools! We all use them right? But the thing is, these
tools will promise a lot but deliver very little. Where's the line?
```

### Direct Problem

```markdown
Ok, on 2023-06-13 there was an AWS outage that took down my site for
around 8 hours. In this post, I'll go through what happened and how I
got back online.
```

### Meta-Commentary

```markdown
Ok, I don't usually do a post like this, but I wanted to document my
thought process on this one.
```

## "So" as Connector Examples

```markdown
So, there I was debugging this query... So, this is the SQL query that
get's the site popular posts... So, let's think about this now... So,
I had a shopping list of components... So, after binging on Node 202
episodes... So, what's actually slowing things down?
```

## Parenthetical Asides

```markdown
I spent some time this weekend rolling credentials (again) after
Claude Code doxed my `.env` variables!

This was the most uncomfortable part for me (at the time).

like I did at the start of 2023 (when AWS had that outage)

if you read that post then yeah, this is what you get! (excuse the
pun) 😅
```

## British Slang in Context

### "banging"

```markdown
I didn't know I could get the referrer and user agent from the hooks
event - banging! 😅

Window functions are bloody brilliant and banging!
```

### "ballache"

```markdown
Node on Windows is a ballache, so I'm using WSL.
```

### "proper"

```markdown
That's a proper solution now. The query is proper fast.
```

### "init"

```markdown
Turso, pretty nifty init?
```

### "Aight"

```markdown
Aight, there's three more tables to create...
```

## Emoji Usage

### Self-Deprecating (😅)

```markdown
Claude Code doxed my `.env` variables! 😅

if you read that post then yeah, this is what you get! 😅

I didn't know I could get the referrer - banging! 😅
```

### Laughing at Self (😂)

```markdown
well, with the amount of time I've spent on this, I should have! 😂

This is where things got really weird then 😂
```

### Surprise (😮)

```markdown
Google Sheets, last edited May 4th 2013 😮
```

### Wondering (🤔)

```markdown
Maybe Turso's monitoring just got better? 🤔
```

### Resigned Humor (🥲)

```markdown
So, for my 233 thousand row CSV file I had to split it into 12 files!
🥲
```

## Self-Deprecating & Vulnerability

```markdown
I spent some time this weekend rolling the auth credentials for this
site (again) after Claude Code doxed my `.env` variables! 😅

if you read Use Common Table Expressions then yeah, this is what you
get! 😅

This is where I made my first mistake!

This was by far the most uncomfortable part for me.

I clearly have to do a bit of cable management at this point.

I decided that I didn't want to be in this position again.
```

## Transition Phrases

### Starting Action

```markdown
Right, time to actually create these indexes!

First things first - I needed to understand what was happening.

From here I can shell into the database and run some queries.
```

### Moving Between Topics

```markdown
Preamble over, let's get into the caching.

Anyways, back to the main point...
```

### Affirmations

```markdown
Cool! You can create a database from a CSV file...

Sweet! That's working now.

That's it! I've imported the data.
```

## Code Presentation

### Before Code

```markdown
Here's the fix I implemented:

This is the SQL query that get's the site popular posts:

Something like this:

Check this out:
```

### After Code

```markdown
Looks innocent enough, right? So, this is doing three separate full
table scans...

That's it!

Fiddly but it works!

Banging!
```

## Honest About Unknowns

```markdown
I have no idea why this is happening.

I'm not sure, I'll see how it goes.

What's still unclear: Why 742k queries when I'm expecting 150k?

Something else is definitely going on - whether it's bot activity or
something I'm missing.

The math doesn't add up.

The mystery continues.
```

## Thanks & Attribution

```markdown
Massive shout out to Jacek's Blog for this tip!

Cheers for sharing this one!

Massive thanks to my Twitter friend James McAllister for helping me
debug this.

Thanks Ash! (when Fathom helped)
```

## Closing Examples

### Community Engagement

```markdown
Cool! Have you had any similar database performance mysteries? Or
theories about what could cause 5x more queries than expected? Hit me
up on [Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10) - I'd love to hear your
thoughts or war stories.
```

### Hope Statement

```markdown
That's it! Hope this helps if you were having similar issues!

If you're a WSL user looking to integrate tools with the Claude
desktop app, I hope this guide helps you get started!
```

### Pragmatic Reality

```markdown
Your mileage may vary, but this is what works when you need to get
stuff done, not just tinker with cool demos.
```

## Complete Post Excerpt

This example shows multiple patterns working together:

````markdown
## The Problem

So, there I was at 3am debugging billion-row database reads. Not the
good type of surprise though! 😅

I spent some time this weekend rolling the auth credentials for this
site (again) after Claude Code doxed my `.env` variables! The numbers
just didn't add up - 742k reads when I'm only expecting maybe 150k?

## The Investigation

First things first - I needed to understand what was actually
happening. Here's the SQL query that get's the site popular posts:

```sql
SELECT * FROM analytics WHERE...
```
````

Looks innocent enough, right? So, this is doing three separate full
table scans. The killer here is the lack of indexes.

## The Fix

Right, time to actually create these indexes! Here's what I
implemented:

```sql
CREATE INDEX idx_analytics_slug ON analytics(slug);
```

## The Results

Banging! That fixed it. The query went from ~5s to ~0.5s. Window
functions are bloody brilliant!

One query fixed, but clearly there's more going on here. Maybe it's
bot activity? 🤔

## Want to Check the Sauce?

The database schema is all in the
[site repo](https://github.com/spences10/scottspence.com). The key
files:

- `src/lib/db/schema.sql` - Database schema
- `src/routes/api/analytics/+server.ts` - Analytics endpoint

Cool! Have you had any similar database performance mysteries? Hit me
up on [Bluesky](https://bsky.app/profile/scottspence.dev) - I'd love
to hear your thoughts!

````

## Meta-Commentary Examples

```markdown
Super quick one I want to document here!

Ok, I don't usually do a post like this...

I'm not going to go into the details as this isn't really important for this post.

Preamble over, let's get into...

Tl;DR: Skip to The Solution if you just want the fix.
````

## Section Heading Examples

```markdown
## The Problem

## The sitch

## What's shaving the yak?

## The investigation

## The Database Schema Forensics

## EXPLAIN QUERY PLAN

## The fix: query optimisation

## The fix: strategic indexing

## Lessons learned

## The results? FAST! ⚡

## Next steps

## Want to Check the Sauce?
```

## Temporal Markers

```markdown
So, there I was at 3am when...

I spent some time this weekend...

At the start of the month I got a surprise...

Over the weekend I decided to...

This initially came up in an issue I raised...

Since December 2023 when I first implemented it...
```

## Self-Referential

```markdown
if you read Use Common Table Expressions then yeah, this is what you
get! 😅

as I documented in my previous post about caching

like I did at the start of 2023 when AWS had that outage

I've been through a few of them! (referring to similar problems)

I got myself on a side quest, again!
```
