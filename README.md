# https://scottspence.com

[![Tests: E2E](https://github.com/spences10/scottspence.com/actions/workflows/e2e-ci.yml/badge.svg)](https://github.com/spences10/scottspence.com/actions/workflows/e2e-ci.yml)

[![Tests: Unit](https://github.com/spences10/scottspence.com/actions/workflows/unit-test.yml/badge.svg)](https://github.com/spences10/scottspence.com/actions/workflows/unit-test.yml)

[![Check: Spelling](https://github.com/spences10/scottspence.com/actions/workflows/spelling-check.yml/badge.svg)](https://github.com/spences10/scottspence.com/actions/workflows/spelling-check.yml)

A blog made with SvelteKit, MDSveX, daisyUI and Tailwind.

Massive thanks to [Matt Jennings] for the [initial template] which has
some really useful features, like images in markdown, html preview and
more.

## Scheduled tasks

The production build includes a separate Node scheduler process. It
calls the same task functions as `/api/ingest`, without HTTP requests.
Existing authenticated manual ingest commands stay unchanged and still
run in the web process.

The scheduler is **disabled by default**. After review, disable only
this site's schedules in `ping-the-thing`, then set these runtime
variables in Coolify and deploy:

```sh
NODE_ENV=production
SCHEDULER_ENABLED=true
```

`pnpm start` and the Nixpacks start command run the web server and,
when enabled, the scheduler as separate child processes. Both share
the same build, environment and database volume. If either process
fails, the parent stops the other and exits with failure so the
deployment can restart. SIGTERM stops new schedules and waits for
queued work, with a 30-second shutdown limit before forced
termination.

Run **one scheduler instance only**, including during rolling deploys.
Do not also run `pnpm start:scheduler` alongside the enabled
deployment. For a separately managed worker,
`NODE_ENV=production pnpm start:scheduler` starts just the worker; it
needs the same files, environment and initialised database as the web
server.

Schedules are in `src/lib/server/task-schedules.ts`. They preserve
this site's nine production cron expressions from `ping-the-thing`,
explicitly using UTC. Jobs run one at a time; repeats of queued or
running jobs are skipped. There is no restart catch-up or automatic
retry. A daily `cleanup_task_logs` job runs at 03:30 UTC in addition
to the original schedules. Confirm that the old scheduler also used
UTC before cutover.

The worker has its own SQLite connection. The web cache detects
commits from that connection within one second on the next cache read.
SQLite write contention and outbound API/TLS failures are still
possible.

## Task history

Both manual and scheduled tasks write to `task-logs.db`, beside the
configured `DATABASE_PATH` (default `data/task-logs.db`). Mount the
**whole directory** as persistent storage, not just `site-data.db`, so
both databases and their WAL files survive redeployment. This history
is separate from analytics and does not use the vector extension.

The schema is in `src/lib/sqlite/task-logs.sql`:

- `task_runs`: task name, `manual`/`scheduled` trigger, status,
  planned, queued, started and finished times, duration,
  build/deployment ID, owner identity and a sanitised error message.
- `task_events`: per-run time, level, message and optional numeric or
  boolean details from an approved metric-name list. Events are
  deleted with their run.

Times are UTC Unix milliseconds. Status is `queued`, `running`,
`succeeded`, `failed`, `interrupted` or `skipped`. A successful run
means its function resolved; warnings can still describe partial
failures. Queue delay is `started_at - queued_at`; `duration_ms`
excludes that wait. `deployment_id` is the SvelteKit build version
shared by both processes.

The supervisor marks unfinished runs as interrupted after observing
the owning process exit, including forced shutdown. Startup also
recovers same-host owners whose PIDs no longer exist. If the
supervisor itself is killed and a replacement container has a
different hostname, the old run can remain unfinished: stale
timestamps alone do not prove that a process is dead. There is no
automatic retry.

Logging failures warn to process output but do not change task
results. The logger does not record request bodies, SQL parameters or
full API results. Error/event text is bounded; known credential
values, common credential patterns and URLs are redacted. Keep event
messages free of sensitive input. Explicit task events provide
progress; existing console output is not copied into this database.

`cleanup_task_logs` removes runs older than 30 days and their events.
It can also be triggered manually through the usual ingest endpoint.
The existing `backup_database` task backs up only `site-data.db`, not
this log database; persistent storage is not a server-loss backup.

### Querying history

POST to `/api/ingest` with the existing Bearer authentication:

```json
{
	"task": "query_task_logs",
	"data": {
		"query": "SELECT task_name, status, started_at, duration_ms, error_message FROM task_runs WHERE status = ? ORDER BY queued_at DESC LIMIT 20",
		"params": ["failed"]
	}
}
```

Discover columns with
`SELECT name, sql FROM sqlite_schema WHERE type =  'table'`, and join
`task_events.run_id` to `task_runs.id` for detail. Reads support
SELECT/CTEs, common aggregates and date functions. They use a
read-only connection plus a SQLite authoriser; writes, ATTACH,
PRAGMAs, extensions, unapproved functions and multiple statements are
rejected. The existing site `run_query` task is unchanged.

Each query runs in an isolated Node process with a two-second deadline
and memory limits, so expensive SQL does not block page requests.
Results are capped at 200 rows and approximately 256 KiB; the response
includes `count`, `max_rows` and `truncated`. At most two log queries
can run at once. If `truncated` is true, narrow the time range or add
LIMIT. This is task history, not a replacement for a general
application log drain.

<!-- Links -->

[matt jennings]: https://github.com/mattjennings
[initial template]:
	https://github.com/mattjennings/sveltekit-blog-template
[markdown showdown]:
	https://scottspence.com/posts/writing-with-markdown
