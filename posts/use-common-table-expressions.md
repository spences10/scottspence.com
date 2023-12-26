---
date: 2023-12-26
title: Use Common Table Expressions
tags: ['sql', 'turso', 'sveltekit']
isPrivate: true
---

I have the popular posts on this site which are stored in a Turso
table, the table is generated from the Fathom Analytics API on this
site and you can see them when you get to the bottom of a post or in
the footer of the site. Here's the sitch, using the Turso client I
needed to run several queries, for the day, month and year. Because
SQLite is single threaded, I needed to run each query in sequence,
which was causing latency in the `+layout.server.ts` file.

Tl;dr, skip to [Common Table Expressions](#common-table-expressions)
for the solution.

I was doing something like this:

```ts
// Fetch Popular Posts
const popular_posts_promises = ['day', 'month', 'year'].map(period =>
  fetch_popular_posts(fetch, period),
)

const [
  popular_posts_daily,
  popular_posts_monthly,
  popular_posts_yearly,
] = await Promise.all(popular_posts_promises)
```

`fetch_popular_posts` was running the queries though the Turso client
individually.

Ok, no problem, so, I'll do a union query and send off the one request
to the Turso database, right?

```sql
SELECT 'day' AS period, * FROM popular_posts WHERE date_grouping = 'day'
UNION
SELECT 'month' AS period, * FROM popular_posts WHERE date_grouping = 'month'
UNION
SELECT 'year' AS period, * FROM popular_posts WHERE date_grouping = 'year';
```

Yes, but, the Fathom API doesn't return the title of the post, just
the pathname. Which means that the data, although fine in itself, is
not useful as is.

So, this was what I was getting with that query:

```json
{
  "daily": [
    {
      "period": "day",
      "id": 1,
      "pathname": "/posts/use-chrome-in-ubuntu-wsl",
      "pageviews": 90,
      "visits": 22,
      "date_grouping": "day",
      "last_updated": "2023-12-26 11:44:33"
    }
    // rest of the posts...
  ]
}
```

I need to do a join to another table to get the title of the post so I
can get something back like this:

```json
{
  "daily": [
    {
      "period": "day",
      "id": 1,
      "pathname": "/posts/use-chrome-in-ubuntu-wsl",
      "title": "Use Google Chrome in Ubuntu on Windows Subsystem Linux",
      "pageviews": 90,
      "visits": 22,
      "date_grouping": "day",
      "last_updated": "2023-12-26 11:44:33"
    }
    // rest of the posts...
  ]
}
```

This is where the query gets a bit more chunky and where things begin
to fall apart. 😅

So, a typical join to get the title of the post from another table:

```sql
SELECT
  'day' AS period,
  pp.id,
  pp.pathname,
  p.title,
  pp.pageviews,
  pp.visits,
  pp.date_grouping,
  pp.last_updated
FROM
  popular_posts pp
JOIN
  posts p ON pp.pathname = '/posts/' || p.slug
WHERE
  pp.date_grouping = 'day'
ORDER BY
  pp.pageviews DESC
LIMIT 20
```

So, I need to do this for the other periods adding in the union query,
I'll skip the repeated fields for brevity here, it's essentially this:

```sql
SELECT
  'day' AS period,
  pp.id,
  pp.pathname,
  p.title,
  pp.pageviews,
  pp.visits,
  pp.date_grouping,
  pp.last_updated
FROM
  popular_posts pp
JOIN
  posts p ON pp.pathname = '/posts/' || p.slug
WHERE
  pp.date_grouping = 'day'
ORDER BY
  pp.pageviews DESC
LIMIT 20

UNION ALL

SELECT
  'month' AS period,
  -- Same columns as above
WHERE
  pp.date_grouping = 'month'
-- Same ORDER BY and LIMIT

UNION ALL

SELECT
  'year' AS period,
  -- Same columns as above
WHERE
  pp.date_grouping = 'year'
-- Same ORDER BY and LIMIT;
```

So, whacking that into the Turso shell I get this:

```
SQL string could not be parsed: near UNION, "None": syntax error at (17, 6)
```

Loads of variations on that and still the same error.

## Common Table Expressions

Common Table Expressions (CTEs) in SQLite are a way to compose
temporary result sets that can be referenced within a SELECT, INSERT,
UPDATE, or DELETE statement.

This is particularly handy for breaking down complex queries into
simpler parts, which is sort of what I was doing.

This means creating temporary results for each of the periods and then
querying them with a union query.

```sql
WITH DayResults AS (
  SELECT
    'day' AS period,
    pp.id,
    pp.pathname,
    p.title, -- Include title from the posts table
    pp.pageviews,
    pp.visits,
    pp.date_grouping,
    pp.last_updated
  FROM
    popular_posts pp
  JOIN
    posts p ON pp.pathname = '/posts/' || p.slug -- Join with posts table
  WHERE
    pp.date_grouping = 'day'
  ORDER BY
    pp.pageviews DESC
  LIMIT 20
),
MonthResults AS (
  SELECT
    'month' AS period,
    -- Same as DayResults query
),
YearResults AS (
  SELECT
    'year' AS period,
    -- Same as DayResults query
)

SELECT * FROM DayResults
UNION ALL
SELECT * FROM MonthResults
UNION ALL
SELECT * FROM YearResults;
```

Runs fine in the Turso shell and returns the data I need like in the
`json` above.

Bit of a round about way of doing it, but, it works and the latency
has gone. 🎉
