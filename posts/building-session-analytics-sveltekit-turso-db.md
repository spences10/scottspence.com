---
date: 2023-12-10
title: Building Session Analytics with SvelteKit and Turso DB
tags: ['analytics', 'turso', 'sveltekit']
isPrivate: false
---

Okedokey, so, I've been playing around with Turso DB and SvelteKit and
I decided to see if I could record analytics for a project and use
Turso to store the data. This was a bit of exploratory work, which I
found really interesting as it's something that I've always left to a
third party service like Fathom Analytics. By the way I still love
Fathom and won't be moving away from it for my main site.

This post details my journey of understanding and implementing a
session analytics system in a SvelteKit application, utilizing Turso
DB for data storage and management.

## Turso, pretty nifty init?

If you haven't heard of Turso is an edge database that helps reduce
query latency for applications where queries come from various global
locations. This means that data is stored geographically close to the
code that accesses it, reducing latency meaning faster browsing. It
uses libSQL, an open-source and open-contribution fork of SQLite.

Their CLI is awesome and all you need to get set up!

I'm a Linux user so I installed it with the following command:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

There's other platforms supported on the docs page:
https://docs.turso.tech/tutorials/get-started-turso-cli/step-01-installation

Once I'm logged into the CLI `turso auth login` I can create a
database:

```bash
turso db create my-analytics-experiment
```

From here I can shell into the database and start creating tables,
more on that in a bit!

Things to note if you're setting up to start using it locally, you'll
need to set up a couple of environment variables for the
`TURSO_DB_URL` and the `TURSO_DB_AUTH_TOKEN`.

You can get the `TURSO_DB_URL` from the CLI with the following
command:

```bash
turso db show my-analytics-experiment
```

Then to get the auth token you can run:

```bash
turso db tokens create my-analytics-experiment
```

This isn't going to be a tutorial, more of a high level overview of
what I did to get things working.

Want to check the sauce? Here's the repo:
https://github.com/spences10/sveltekit-and-turso-analytics

Feel free to help improve it as well! This was thrown together over
the weekend and I'm sure there's a lot of room for improvement!

## Analytics, stuff

So, this is something I had little knowledge of before starting this I
mean, I know about analytics, but what needed to be recorded was a bit
of an eye opener.

My thinking was that I could use the SvelteKit hooks file
(`hooks.server.ts`) to record the data I needed. I didn't know I could
get the referrer and user agent from the hooks `event` banging! 😅

The thing is I couldn't just bang all that data into one table and
call it a day, well, with the amount of time I'v spent putting
together the proof of concept I should have! 😂

## Privacy yo!

If you've met me in person you'll know I'm a bit of a privacy
advocate. So, the last thing I want to be doing is collecting data
that could be used to create a profile of a user. I'm not interested
in that, I just want to know how many people are visiting my site and
what pages they are looking at.

The first thing I needed to do was was record visitors data in a way
that wouldn't allow me to identify them.

So, let's get started with what I did...

## Tables

I created a `user_session` table to record the following schema:

```sql
CREATE TABLE
  user_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    session_duration INTEGER,
    page_count INTEGER DEFAULT 0
  );
```

This data is intended to be ephemeral, so I'm not storing it for
longer than 24 hours. This is where the other tables come in.

There's a `calculate_metrics` function that runs a clean up query to
remove any sessions that have ended or are older than 24 hours.

```sql
DELETE FROM user_session
WHERE
  (session_end IS NOT NULL AND session_end < datetime('now', '-1 hour')) OR
  (session_end IS NULL AND session_start < datetime('now', '-24 hours'));
```

Aight, there's three more tables, `page_analytics`, `page_visits` and
`session_geolocation`, this is where the session data get farmed off
to.

The `page_analytics` is to record the date of the visit, the slug of
the page, how many page views, visits and unique visits. Then some
fields to have the average session duration and bounce rate
calculated.

Here's the schema:

```sql
CREATE TABLE
  page_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slug TEXT NOT NULL,
    pageviews INTEGER DEFAULT 0,
    visits INTEGER DEFAULT 0,
    uniques INTEGER DEFAULT 0,
    avg_duration REAL,
    bounce_rate REAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
```

The calculation of the average session duration and bounce rate is
done in a `calculate_metrics` function, which isn't perfect, far from
it!

`page_visits` is essentially the firehose for the visitors coming into
the site, it records the session id, the slug of the page visited and
the timestamp of the visit. This data is used to calculate the
`page_analytics` data.

```sql
CREATE TABLE
  page_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
```

The `session_geolocation` is probably the most creepy one as it
records the visitor city, region, country, location.

This information is linked to a session id, so it's not possible to
identify a user, but it's still a bit creepy.

```sql
CREATE TABLE
  session_geolocation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    city TEXT,
    region TEXT,
    country TEXT,
    location TEXT,
    timezone TEXT
  );
```

The data for this table is from using the IPinfo.io API, you can get a
free API key with limited requests from https://ipinfo.io/signup

## Session handling

So, I hinted at this at the beginning of the post, the way I want to
keep track of what pages are being visited are via the
`hooks.server.ts` file. In `hooks.server.ts`, I implemented logic to
handle user sessions which would:

- Check for existing sessions.
- Update session data or create a new session.
- Log page visits.
- Create a session cookie.

**what's the session cookie for?** Well, this is so I can effectively
detect when a user session has ended. This means that I can update the
`session_end` field in the `user_session` table and delete the session
data sooner than the 24 hour period.

This is done via a neat little function called `sendBeacon` which
allows you to send data to a server without waiting for a response.

I picked this up from Paulie's post on Neon and Astro:
https://neon.tech/blog/roll-your-own-analytics-with-astro-vercel-edge-functions-and-neon

## Tracking Page Visits

This is where all the heavy lifting happened with the
`update_page_visit` function. This could be optimised a lot, but it
works.

Essentially, selecting from the `page_analytics` table to see if the
page has been visited before, it then updates the `page_analytics`
table if not it'll insert a new row.

## Periodic metrics calculation

Currently the `calculate_metrics` function is called every time a page
is visited, this is not ideal but I didn't want to set up a cron job
to run this every hour or so. This is also where the session clean up
is happening.

This is where there's loads of queries to calculate the metrics for
bounce rate and average session duration.

This of course could be better implemented, but it's a proof of
concept dammit! 😂

## Conclusion

This project demonstrates the intricacies of implementing a
session-based analytics system in a SvelteKit application,
highlighting the importance of efficient data management and the
utility of Turso DB.

## Next steps

Currently this project is hosted on Vercel, I'd like to move it to
Fly.io and use the node adapter for SvelteKit so that I can have a
local Turso DB instance running. If you're not aware Vercel are
immutable deployments, so you can't run a local database instance.

I think with a local it will speed things up considerably, if you
check out the demo now you'll notice some (like six seconds 😅)
latency. There's a post from Jamie on the Turso blog detailing this,
here:
https://blog.turso.tech/stop-caching-and-use-your-database-to-save-time-and-latency-16aebd3f

## References

- SvelteKit discussion:
  https://github.com/sveltejs/kit/discussions/3973
- sveltekit-user-ip-location-example:
  https://github.com/CAPTAIN320/sveltekit-user-ip-location-example My
- Tweet: https://twitter.com/spences10/status/1731036535842074808
- Paulie:
  https://neon.tech/blog/roll-your-own-analytics-with-astro-vercel-edge-functions-and-neon
- sendBeacon:
  https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon

<!-- Links -->
