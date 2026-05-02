---
date: 2026-05-02
title: 'Building a SQLite context sidecar for my-pi'
tags: ['pi', 'my-pi', 'sqlite', 'mcp', 'developer-experience']
published: true
---

<!-- cspell:ignore pirecall ccrecall BM25 FTS sourceid toolcall toolresult inspectable shite -->

Right, so, this started with me looking at
[`context-mode`](https://github.com/mksglu/context-mode), seeing a 98%
context reduction claim, and immediately thinking: bull shite.

Not because the idea is bad. The idea is good. The bit that made me
twitch was the shape of the claim. If you compare a huge raw tool
output against a tiny summary, you can make the percentage look
spectacular. That does not mean the model kept 98% of the useful
context. It means most of the bytes are somewhere else now, or gone,
and the only honest question is: can the agent still get back to the
bit it needs?

That was the thread I wanted to pull on.

The bit I cared about was not the marketing number. The bit I cared
about was the mechanism: local SQLite, FTS5, searchable output, exact
retrieval, and the raw blob not being dumped straight into the model
context.

So I made my own context. Not as a rebuttal in the abstract, but as a
thing I could instrument, query, break, and measure inside `my-pi`.

That is very much my sort of problem.

## The problem was already in my codebase

I did not have to invent a theoretical use case. `my-pi` already had
one.

In `packages/pi-mcp/src/result.ts`, MCP results over 50 KiB or 2,000
lines were already being truncated. The old behaviour was:

1. stringify the MCP result
2. if it is small, return it as normal
3. if it is huge, return the first chunk
4. write the full output to `/tmp/my-pi-mcp-output-*.txt`
5. tell the model to use `rg` or `read` against that file

That is not terrible. It is a pragmatic safety valve. But it is also a
bit clumsy.

A temp file is not a retrieval system. It has no ranking, no metadata,
no source id, no stats, and no obvious way to answer "what did we keep
out of context?" afterwards. It also asks the model to go back to file
operations when what it really wants is search.

So the seam was obvious: replace "write a temp file and grep it" with
my favourite "index this output into SQLite and give the model a
source id".

## Why SQLite was the obvious answer

I keep ending up with SQLite for this sort of local agent tooling.
`ccrecall` uses it for Claude Code session history. `pirecall` uses it
for Pi session history. My site analytics use it. My Pi telemetry uses
it.

The reason is not complicated:

- it is local
- it is inspectable
- it is fast enough
- it has FTS5 built in
- it does not require another service
- it gives me receipts after the session ends

For this feature I did not want embeddings in v1. I did not want a
cloud index. I did not want a magic summariser. I wanted deterministic
chunking, FTS5 search, exact retrieval, and honest byte accounting.

So I added a new package: `@spences10/pi-context`.

## What I built

The new package is a Pi extension that listens to tool results. When a
text result crosses the threshold, it stores the redacted full text in
a local SQLite database and replaces the output with a compact
receipt.

That receipt is not pretending to be the answer. It is a map back to
the answer.

The package adds four tools:

- `context_search` to search indexed tool output
- `context_get` to retrieve exact chunks
- `context_stats` to show byte accounting
- `context_purge` to delete old indexed output

It also adds `/context-stats` for the TUI.

The default database path is the Pi agent directory:

```text
${PI_CODING_AGENT_DIR:-~/.pi/agent}/context.db
```

There is also `MY_PI_CONTEXT_DB` if I want to point it somewhere else
for testing.

The rough shape of the schema is simple: `context_sources` for the
original tool output, `context_chunks` for the chunked text, and a
FTS5 table over chunk title/content. Nothing exotic.

## The receipt matters

The model should not get a mysterious "output removed" message. It
needs to know what happened and how to recover the details.

So oversized output turns into something like:

```text
[context-sidecar] Large mcp__demo__large output indexed locally

Source: ctx_example_27d4a2b8
Size: 84.2 KiB, 1,428 lines, 12 chunks
Use context_search query:"..." source_id:"ctx_example_27d4a2b8" to inspect it.
Use context_get source_id:"ctx_example_27d4a2b8" for exact chunks.

[first and last preview lines]
```

That is the trade I actually want: keep enough immediate context to
orient the model, but move the bulk of the text into a retrieval path.

No pretending. No "98% reduction" victory lap with the hard bit hidden
under the rug. Just: here is what was stored, here is how big it was,
here is the handle, here is how to get it back.

## Redaction had to happen before persistence

One thing I was not willing to hand-wave was secrets.

`my-pi` already has `@spences10/pi-redact`, which filters tool output
before the model sees it. If the context sidecar stores raw text
before redaction, I have just moved the secret leak from the prompt to
a SQLite file. That is not a win.

So `pi-context` imports the same redaction function and applies it
before writing anything to SQLite.

That is one of the reasons I like building this in my own harness: the
pieces are small enough to compose properly. Redaction is not a note
in the README. It is in the storage path.

## MCP became the first consumer

Once `pi-context` existed, `pi-mcp` became the first integration.

The old `format_mcp_tool_result()` path still handles small output in
the same way. The oversized path now tries the context sidecar first.
If the sidecar is enabled, it stores the full MCP output and returns a
searchable source id. If the sidecar is disabled or fails, it falls
back to the old temp-file behaviour.

That fallback matters. I do not want the MCP extension to depend on
SQLite being perfect just to return a tool result. Context hygiene
should improve the session, not become another way to break it.

## What the tests actually proved

This is where I want to be careful, because this is the bit people
skip when they get excited about context-window tricks.

The unit tests prove the implementation mechanics, not that agents are
suddenly smarter.

What passed in `my-pi` after the change:

- `pnpm run check`
- `pnpm run test`
- LSP diagnostics on the changed TypeScript files

The new tests cover:

- small output passing through unchanged
- oversized output being stored
- FTS5 search returning matching chunks
- exact chunk retrieval
- special-character FTS queries not crashing
- purge by source id
- redaction before persistence
- MCP using the sidecar when enabled
- MCP falling back to temp-file truncation when disabled

The full test run ended with 10 root test files passing and all
package test suites passing, including the new `pi-context` and
updated `pi-mcp` tests.

That is a good engineering result. It is not a product claim yet.

## A/B testing evals

This is the bit I actually wanted from the whole exercise: my own
context telling the story.

One smoke test is better than vibes, but it is still only one run. So
I ran a slightly larger paired eval: 10 runs against the published
package and 10 runs against the local build.

The task stayed deliberately boring. Each run asked the agent to run a
Node command that printed 1,400 lines of deterministic noise with a
fresh random `TARGET_VALUE` hidden in the noisy tail. The agent had to
return the line number and UUID as JSON.

The control was still the published package:

```bash
npm exec --yes --package my-pi@0.1.24 -- my-pi \
  --telemetry \
  --telemetry-db ./tmp/context-sidecar-evals/control.db \
  --json \
  --tools bash \
  "$PROMPT"
```

The variant was the local build with the context sidecar enabled:

```bash
MY_PI_CONTEXT_DB=./tmp/context-sidecar-evals/context.db \
node dist/index.js \
  --telemetry \
  --telemetry-db ./tmp/context-sidecar-evals/local.db \
  --json \
  --tools bash,context_search \
  "$PROMPT"
```

I used the same default model, the same prompt shape, and the same
random target-line range for both variants.

The result across 20 total agent runs:

| Variant            | Runs | Success | Tools used               | Avg duration | Avg input tokens | Avg total tokens | Total run cost |
| ------------------ | ---: | ------: | ------------------------ | -----------: | ---------------: | ---------------: | -------------: |
| `my-pi@0.1.24`     |   10 |   10/10 | `bash`                   |        8.56s |           26,412 |           26,961 |         $1.334 |
| local with sidecar |   10 |   10/10 | `bash`, `context_search` |       10.86s |            5,944 |            7,517 |         $0.316 |

For this eval shape, the local sidecar build kept success the same and
cut average input tokens by about 20,468 per run. It also cut measured
run cost by about $0.102 per run. The trade-off was one extra
retrieval tool call and about 2.3s more average wall time.

The sidecar database recorded one stored source per local run. Average
byte accounting for those stored sources:

```text
stored:   51,238 bytes
returned:  7,622 bytes
lines:       549
chunks:       14
```

That is an 85.1% reduction for the immediate receipt path:

```text
1 - (7,622 / 51,238) = 85.1%
```

The important detail is that all 10 sidecar runs used `context_search`
and still returned the right UUID. That is the bit the single smoke
test could not really show.

## What the eval also caught

The first version chunked mostly on blank-line paragraph boundaries.
That worked in unit tests, but noisy command output often has no blank
lines. In that case a search hit could return a huge chunk and give
back much of the token savings.

The eval setup exposed that, so I changed the chunking code to split
long line-oriented output into bounded chunks as well. Then I added a
test for exactly that shape: 1,400 newline-separated lines, no blank
lines, with a hidden `TARGET_VALUE` in the middle of the stored
output.

That is a useful lesson: the eval did not just produce a nicer table
for a blog post. It found a real implementation weakness.

## A more representative pass

The first paired eval was useful, but it was still one shape: noisy
`bash` output with one hidden value. So I ran the next set I said I
needed to run.

This pass used four cases:

- an MCP tool returning a large JSON blob
- a noisy build/test failure where the relevant line was in the middle
- a browser-ish snapshot and network dump
- a repeated debug loop where context pressure built up over several
  turns

I ran one paired attempt for each case with real agent/model calls and
telemetry enabled. Small sample, yes. Still better than vibes.

| Variant | Runs | Success | Avg wall time | Avg input tokens | Avg total tokens | Total run cost |
| ------- | ---: | ------: | ------------: | ---------------: | ---------------: | -------------: |
| control |    4 |     4/4 |         81.6s |           11,850 |          122,067 |         $0.135 |
| sidecar |    4 |     4/4 |         34.6s |           12,194 |           48,059 |         $0.082 |

The headline number looks good, but this is exactly where I do not
trust headline numbers. The detail is more interesting than the
average.

The MCP large JSON case is where the sidecar absolutely earned its
keep:

| Variant | Wall time | Input tokens | Total tokens |   Cost | Retrieval                   |
| ------- | --------: | -----------: | -----------: | -----: | --------------------------- |
| control |    250.1s |       30,400 |      446,464 | $0.107 | MCP plus 20 `bash` calls    |
| sidecar |     10.0s |        3,141 |        5,987 | $0.005 | MCP plus 1 `context_search` |

The sidecar database for that case recorded two stored MCP sources
because I ran a smoke test while fixing the harness:

```text
mcp__eval__large_json stored:   1,006,026 bytes
mcp__eval__large_json returned:     7,048 bytes
reduction:                         99.3%
```

That is the exact use case I wanted from `pi-mcp`: store the raw large
response before the old truncation path crushes it, then let the model
search for the record it needs.

The generic `bash` hook was more mixed:

```text
bash stored:   512,381 bytes
bash returned:  85,000 bytes
reduction:       83.4%
```

It still preserved correctness, but the model sometimes
over-retrieved. For the noisy build case the sidecar used 10
`context_search` calls and cost more than the control. The browser
dump did the same, just less extremely. The debug loop was slightly
faster with the sidecar, but it also used more tokens.

That is an important result, and honestly the most useful one in the
post. The sidecar is not magic context dust. It is a retrieval system.
If the receipt and chunking make the model hunt around too much, the
saved bytes can turn into extra tool calls and extra reasoning.

## What the representative eval also caught

The MCP case caught a real bug in the eval harness and then in my
non-interactive MCP path.

My first local MCP server spoke proper header-framed MCP messages, but
`pi-mcp` currently expects newline-delimited JSON-RPC over stdio. That
made the server time out. After fixing the fixture, I hit the next
problem: in headless runs with an explicit `--tools` allowlist, MCP
tools discovered after session setup were registered but not available
to the model.

So I changed `pi-mcp` to connect enabled MCP servers during
non-interactive extension loading. That made the MCP tool available
before the selected tool list was frozen. I also had to avoid mutating
active tools during extension loading, because the runtime is not
fully initialised at that point.

That is another reason these evals are worth running. They do not just
produce a nicer table. They find the boring integration bugs that unit
tests miss.

## The caveat after the representative pass

This is still not a universal product claim.

What I have proved is narrower and more useful:

- sidecar retrieval preserved correctness in this small representative
  set
- source-specific MCP storage can massively reduce provider tokens,
  wall time, and cost for large JSON blobs
- the generic `bash` hook reduces immediate returned bytes, but can
  cost more if the model over-retrieves
- telemetry plus the context DB gives enough evidence to see both wins
  and regressions

What I still have not proved:

- that this improves task success on genuinely hard real tasks
- that it reduces total provider tokens across lots of normal
  workflows
- that the current receipt copy guides retrieval well enough
- that the chunk size is tuned correctly for build logs, browser
  dumps, and JSON

The measurements I care about are still not just "bytes saved". They
are:

- did the task still succeed?
- did the model retrieve the right chunk?
- how many extra tool calls did retrieval cost?
- how much wall time did it add?
- how many bytes were stored versus returned?
- did it ever miss something that was present in the sidecar?

## Why I still think it belongs

Even with those caveats, I think this package belongs in `my-pi`
because the old behaviour was already admitting the need.

A truncation notice plus a temp file is already a context sidecar with
no search index. This just makes the sidecar explicit, queryable, and
measurable.

It also fits the rest of the harness:

- `pirecall` handles long-term session memory
- `pi-telemetry` handles run-level eval evidence
- `pi-redact` handles secret filtering
- `pi-mcp` exposes big external tools
- `pi-context` now handles bulky active-session output

That feels like the right separation of concerns.

The practical takeaway is boring, which is usually a good sign: do not
try to cram every byte into the model, and do not trust a reduction
percentage on its own. Put bulky reality in a local store, give the
model a small receipt, make retrieval cheap, then measure whether the
agent still succeeds.

SQLite is very good at being that local store.

## References

- [`context-mode`](https://github.com/mksglu/context-mode)
- [`my-pi`](https://github.com/spences10/my-pi)
- [Add telemetry to my-pi](/posts/add-telemetry-to-my-pi)
- [Building my-pi: my own Claude Code alternative with Pi](/posts/building-my-pi-claude-code-alternative-with-pi)
- [Optimising MCP Server Context Usage in Claude Code](/posts/optimising-mcp-server-context-usage-in-claude-code)
