---
date: 2026-04-19
title: Add telemetry to my-pi
tags: ['pi', 'telemetry', 'sqlite', 'evals', 'developer-experience']
published: true
---

<!-- cspell:ignore otel pirecall ccrecall ndjson inspectable correlatable -->

Right, so, with LSP in `my-pi`, the next thing I wanted to focus on
was evals. The idea was simple enough: throw `pnpx my-pi@latest` at a
few prompts, maybe flip a flag or two, set some env vars, and see how
it did. Eval-harness stuff, right. Except I quickly realised I had no
way of actually answering the questions I cared about afterwards.

A run either "worked" or it "didn't". If it didn't, I had a session
transcript, a final output, and whatever I remembered from scrolling
past. That is a rubbish substrate for anything more serious than
"looks alright to me".

The questions I actually wanted to answer were:

- how many turns did it take?
- which tools got called?
- where did it fail?
- which provider request blew up?
- and crucially, can I tie all of that back to a specific eval case
  without parsing all the transcript?

I could not answer any of that from the outside. Which meant
telemetry.

## The OpenTelemetry detour

First instinct was OpenTelemetry, because that's the sensible answer
you are meant to reach for.

But, Pi deliberately hands you the primitives instead of the polished
features, which is one of the things I like about it, but it does mean
"add OTel" is a project of its own.

I could have gone the full exporter-and-spans route. I did not want
to. The problem I had was not "I need a distributed tracing backend".
The problem was "I need a local evidence trail I can query after an
eval run". Those are not the same thing, and treating them as the same
thing would have left me with a stack of infra I did not want,
maintaining moving parts I did not need.

Which pushed me straight at SQLite.

## Why SQLite, again

I keep ending up here with local tooling. SQLite is the workhorse of
basically everything I build at the moment: `pirecall`, `ccrecall`, my
site search, now this. A single file, standard SQL, no network, no
services, no config.

For `my-pi` telemetry the trade is perfect: local file, inspectable
with any SQLite tool, trivial to ship into an eval harness,
correlatable with the other local stores I already have. If I ever
want to shape it into OTel events later, nothing stops me. But right
now the unit of work is "one eval run on my machine", and SQLite is
exactly the right shape for that.

Node 24 has `node:sqlite` built in, which is what `pirecall` already
uses, so there was no new dependency to pull in.

## What I actually wanted the design to feel like

I wanted the default behaviour to be boring and the opt-in to be
cheap. Specifically:

- telemetry off by default
- `--telemetry` to flip it on for a single run
- `--no-telemetry` to flip it off for a single run
- `/telemetry on` / `/telemetry off` in the TUI to change the saved
  default
- everything stored in a local SQLite file

By default it lives at `~/.pi/agent/telemetry.db`, alongside the other
Pi state.

For correlating back to an eval harness I picked four env vars,
because I did not want to invent a new metadata channel:

- `MY_PI_EVAL_RUN_ID`
- `MY_PI_EVAL_CASE_ID`
- `MY_PI_EVAL_ATTEMPT`
- `MY_PI_EVAL_SUITE`

Set those when you launch `my-pi`, and the run in the database comes
out already tagged with whatever case you were exercising.

## The schema, deliberately small

There are four tables: `runs`, `turns`, `tool_calls`, and
`provider_requests`. That's it. I did not want telemetry to become a
second copy of the raw transcript.

At the run level I record things like cwd, session file path,
provider, model, start and end time, success or failure, and the eval
metadata. Turns get an index, timestamps, tool-result count and stop
reason. Tool calls get name, timestamps, whether they errored, plus
_summarised_ args and results. Provider requests get timing, status
code and summarised payload metadata.

The important word there is summarised. I absolutely did not want the
telemetry layer hoovering up full tool output or full prompt bodies.
This is operational telemetry, not a prompt archive. The session files
and `pirecall` already do the "what did the model actually see" job.
This layer is purely about shape: what happened, in what order, for
how long, and with what outcome.

## Trying it for real

The bit where this stopped being an idea and started being a thing I
could use was running it against the actual CLI, not just unit tests.

```bash
node dist/index.js --telemetry --json "Reply with exactly hi"
```

Then I pointed `mcp-sqlite-tools` at the resulting database and
confirmed the four tables were there with a real run in them: model
id, cwd, a turn, a tool call, a provider request, the lot. That was
the moment it tipped from "nice idea" to "something I can actually
rely on".

## The annoying HOME bit

One thing bit me almost immediately when I started running this in
sandboxes. Changing `HOME`, which a lot of sandboxed runs quietly do,
also changes where Pi looks for auth, config, sessions, and telemetry.

Which means your sandboxed run:

- has no saved `auth.json`
- has no saved telemetry config
- and writes to a brand-new telemetry DB each time

For eval isolation that is actually what you want. For "why is my
agent yelling about missing auth" it is not. So I added
`--agent-dir <path>` and `PI_CODING_AGENT_DIR`, which pin the whole Pi
directory (auth, settings, sessions, telemetry) to a specific location
regardless of what `HOME` has been rewritten to.

Which means the "real" command for an eval harness ends up looking
like:

```bash
PI_CODING_AGENT_DIR=/work/pi-agent \
pnpx my-pi@latest --telemetry --json "run eval case"
```

That turned out to matter a lot when I started running per-case
sandboxes in anger.

## The `/telemetry` command

On the TUI side I wanted the minimum necessary to live with this day
to day, not a full CLI of its own.

```text
/telemetry status
/telemetry stats
/telemetry query run=<eval-run-id> success=true limit=10
/telemetry export ./tmp/eval-runs.json suite=smoke
/telemetry on
/telemetry off
/telemetry path
```

`status` tells me what's on. `stats` gives a quick count across the
four tables. `query` filters on run/case/suite/success with a sensible
default limit. `export` dumps a subset as JSON so I can hand it to
whatever harness I'm using. `on`/`off` persist the default. `path`
tells me where the file is, because past-me is bad at remembering that
sort of thing.

## Where this got interesting fast

Telemetry stopped being theoretical the moment I started thinking
about evals for the redaction layer.

Once every run can be tagged with `MY_PI_EVAL_RUN_ID` and
`MY_PI_EVAL_CASE_ID`, a bunch of questions get easier:

- which cases caused a ton of tool churn?
- which cases retried their provider request a bunch of times?
- which failure mode maps to which prompt shape?
- did the run succeed _operationally_ even if the output was wrong?

That last one is the important distinction, and the one that convinced
me the whole effort was worth it. "The harness died" and "the harness
completed, but did the wrong thing" are not the same bug, and you
cannot tell them apart from a transcript. You can tell them apart from
telemetry.

Which is what nudged me into the next bit of work: hardening the
redaction layer with a synthetic eval harness.

## Why it belonged in `my-pi` in the first place

Not because telemetry is thrilling, but because once I started using
`my-pi` from an outside harness it needed an evidence layer.

Local SQLite telemetry gives me that without adding infra, without
adding dependencies, and without bolting a second transcript onto the
side of the tool. It fits the rest of `my-pi`: composable,
inspectable, easy to bend into weird workflows.

Which is exactly the point of building my own harness in the first
place.

## References

- [my-pi on GitHub](https://github.com/spences10/my-pi)
- [Add LSP to my-pi](https://scottspence.com/posts/add-lsp-to-my-pi)
- [pi-coding-agent](https://github.com/badlogic/pi-mono)
- [OpenTelemetry for Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
