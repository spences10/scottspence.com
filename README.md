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
retry. Confirm that the old scheduler also used UTC before cutover.

The worker has its own SQLite connection. The web cache detects
commits from that connection within one second on the next cache read.
SQLite write contention and outbound API/TLS failures are still
possible.

Task start, completion, duration and failure messages go to process
output. A separate log database and retention/purge schedule are
deferred.

<!-- Links -->

[matt jennings]: https://github.com/mattjennings
[initial template]:
	https://github.com/mattjennings/sveltekit-blog-template
[markdown showdown]:
	https://scottspence.com/posts/writing-with-markdown
