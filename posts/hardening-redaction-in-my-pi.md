---
date: 2026-04-19
title: Hardening redaction in my-pi with evals and telemetry
tags: ['pi', 'security', 'redaction', 'evals', 'telemetry']
published: true
---

<!-- cspell:ignore asia hetzner kagi firecrawl pem pirecall nopeek freeform -->

Third post in a little run about `my-pi`, my coding agent harness
built on top of
[pi-coding-agent](https://github.com/badlogic/pi-mono). There's a pile
of stuff in `my-pi` I have not written about, but these three felt
worth the time:
[adding LSP](https://scottspence.com/posts/add-lsp-to-my-pi),
[wiring in local SQLite telemetry](https://scottspence.com/posts/add-telemetry-to-my-pi),
and this one, which is about actually proving the redaction layer does
what I think it does.

With telemetry in, I could finally run `my-pi` through proper evals
and get back something other than "seems alright".

Which immediately surfaced an uncomfortable question I had been
quietly avoiding. If I was going to point this thing at real repos,
full of config files and logs and scripts, did I actually trust the
redaction layer not to do something stupid?

No, no I could not.

So, I decided to have a good crack at ensuring that I've got most
things (that I could think of) covered.

## The plan

Rough plan: build a fixture repo full of synthetic secrets, run
`my-pi` against it with a bunch of risky prompts, tag each run with
telemetry so I could correlate afterwards, then scan the raw session
files and `pirecall` for any leakage.

Telemetry made this easier to reason about, because I could separate
"did the run complete?" from "did the run leak?", which turned out to
matter.

## Scaffolding the harness

I spun up a separate repo for the eval rig, it has synthetic secrets
with unique fingerprints, eval cases, fixtures dressed up as real
config/logs/source, a runner, a leak scanner, and a report generator.
The cases cover the things a model will cheerfully wander into if you
do not stop it: summarising config files, asking for secret values
directly, inspecting stdout and stderr logs, reading multiline private
key material, and analysing derived secrets in source.

## The first smoke run

I ran the first case, `summarize-config`, the tamest prompt in the
set. The leak scanner came back with 9 hits across assistant output
and tool results.

Evals will always show you harness bugs before real ones, so once I'd
ruled those out, what remained were genuine redaction gaps in `my-pi`:

- plain `AWS_SECRET_ACCESS_KEY` values
- lower-case / snake-case variants like `secret_access_key`
- multiline private key _body_ lines, not just the header
- freeform log phrases like `secret <value>` or `password is ...`

That last one is the most annoying real-world case, because secrets in
logs basically never show up as tidy environment variables. They show
up as whatever prose the author of the log line felt like writing that
day.

## Widening the patterns

First hardening pass was the unglamorous grind: teach the redactor
about the shapes it had been missing.

It now catches uppercase, lower-case, snake-case, and camel-case
variants of the AWS secret key name. Full multiline private key
_blocks_, not just the `-----BEGIN...` line. Freeform "token is X",
"secret value X", "password: X" phrasing in log-style output. And
generic password-like fields, so things that look like credentials get
treated like credentials even when they are not formatted nicely.

Catching only the header of a private key and letting the body stream
through is a particularly silly failure mode, and one I would not have
spotted without the eval rig making it obvious.

## Cross-checking against nopeek

After that first pass I cross-checked the patterns against
[`nopeek`](https://github.com/spences10/nopeek), which solves a
different problem but has done a lot of the same token-shape thinking.
It surfaced some extra secret types worth pulling in:

- AWS temporary access keys (`ASIA...`)
- Hetzner tokens
- Kagi API keys
- Brave API keys
- Firecrawl API keys
- GitHub fine-grained PATs

None of these were in the smoke-run miss list, but they are the kind
of thing I use day to day. "It didn't leak in my test" and "it
wouldn't leak on my real repos" are different standards.

## What telemetry actually gave the process

This is the bit I really liked. Because the telemetry work was already
in place, each eval case ran tagged with `MY_PI_EVAL_RUN_ID`,
`MY_PI_EVAL_CASE_ID`, `MY_PI_EVAL_ATTEMPT`, and `MY_PI_EVAL_SUITE`.
The harness produced an operational record, not just a thumbs-up or
thumbs-down.

Pointing `mcp-sqlite-tools` at the telemetry database after a run gave
me the shape of what had happened, per case:

- `summarize-config`: 10 tool calls, 4 provider requests
- `unsafe-list-secrets`: 1 tool call, 2 provider requests
- `inspect-stdout-logs`: 6 tool calls, 5 provider requests
- `inspect-stderr-logs`: 6 tool calls, 6 provider requests
- `inspect-private-key`: 6 tool calls, 3 provider requests
- `analyze-derived-secret`: 9 tool calls, 5 provider requests

Which does not tell me directly whether a secret leaked. Telemetry
summarises args and results on purpose. What it _does_ tell me is
whether the run got anywhere near the risky territory: how many reads,
how many bash calls, how many provider retries, whether the tool path
matches a case that was meant to touch risky files.

That means two failures I used to treat as one can now be told apart:
the harness blew up and never actually ran the case, or the harness
ran the case fine and leaked something anyway. Those need completely
different follow-ups.

## The report that mattered

After the fixes, I ran the broader smoke suite again. This time the
report came back clean:

- 6 cases run
- 0 raw session leaks
- 0 `pirecall` leaks
- 38 tool calls
- 25 provider requests

And the dummy secret leak scan backed that up. No assistant-side
leaks, no tool-result leaks, no session-file leaks, no indexed- recall
leaks.

That is the result I actually wanted. Not a vibe-check, not "it seems
fine", but "I pointed a hostile synthetic suite at it and the report
says nothing got through".

## Same job, different plumbing

Worth calling out: this is the same job that
[`nopeek`](https://github.com/spences10/nopeek) and its
[Claude Code plugin hooks](https://github.com/spences10/claude-code-toolkit/tree/main/plugins/nopeek)
do for Claude Code, just in a different place. The nopeek plugin uses
a `SessionStart` hook to load credentials safely and a `PreToolUse`
hook on `Bash` to scrub secrets out of cloud CLI output. `my-pi` is
its own harness so it does not have Claude Code's hook system to lean
on, which is why the redaction sits as an agent extension instead.

Different agents, same idea. I use both.

## Is regex redaction enough?

No. There will always be an edge case the patterns don't know about.

But "is it enough" is the wrong question. The right one is: are you
actually testing the layer you have, and tightening it when the tests
find real misses?

Telemetry gave me the evidence trail. The eval harness gave me a
repeatable attack surface. The redaction updates closed the concrete
gaps the evals found. That is a very different place to be than "we
have a regex, probably fine".

## References

- [my-pi on GitHub](https://github.com/spences10/my-pi)
- [Add telemetry to my-pi](https://scottspence.com/posts/add-telemetry-to-my-pi)
- [Add LSP to my-pi](https://scottspence.com/posts/add-lsp-to-my-pi)
- [nopeek: keep secrets out of Claude Code](https://scottspence.com/posts/nopeek-keep-secrets-out-of-claude-code)
