---
date: 2026-10-10
title: Revisiting LSP in Claude Code
tags: ['claude-code', 'lsp', 'developer-experience']
is_private: true
---

<!-- cspell:ignore omnirecall svelteserver -->

Back in March I wrote about
[enabling LSP in Claude Code](/posts/enable-lsp-in-claude-code). It
turned into one of my most-read posts this year, which is a bit
awkward, because a fair chunk of it is now out of date. I told people
to set an undocumented flag, I framed LSP as go-to-definition, and I
said I'd check back in a week. I didn't.

So this is the check back, seven months late. I went through my own
session history, read the current docs, and then ran some tests
locally to see what Claude Code actually does with a language server.

## What's changed since March

The setup in the old post was a feature flag plus a plugin:

```json
{
	"env": {
		"ENABLE_LSP_TOOL": "1"
	},
	"enabledPlugins": {
		"typescript-lsp@claude-plugins-official": true
	}
}
```

The flag isn't needed any more. I removed `ENABLE_LSP_TOOL` from my
`~/.claude/settings.json`, restarted, and the `LSP` tool still loads
and answers on Claude Code 2.1.296. LSP is now a documented feature:
install the language server binary, install the
[code intelligence plugin](https://code.claude.com/docs/en/plugins/code-intelligence)
for the language, done.

The other thing I got wrong was what LSP is for. The docs describe two
separate things a language server gives Claude Code:

1. **Diagnostics after edits.** Every time Claude edits or writes a
   file the server handles, type errors and warnings get pushed into
   context automatically. No tool call involved.
2. **Code navigation.** An `LSP` tool Claude can call for definitions,
   references, hover types, symbols and call hierarchy.

My March post was entirely about the second one. The first one didn't
get a mention.

## What my own sessions show

I keep my session history in a local archive with
[omnirecall](https://github.com/spences10/omnirecall), so I could
count what Claude Code actually did rather than guess.

Across 125 Claude Code sessions since August:

- **Navigation:** zero `LSP` tool calls, apart from the ones made
  while writing this post. That's with a `CLAUDE.md` rule telling it
  to use LSP for definitions and references.
- **Diagnostics:** 19 diagnostics attachments across 9 sessions. These
  only show up when an edit introduces a new issue, so a low count is
  expected.
- **Search:** the dedicated Grep and Glob tools weren't used either.
  Search happens in Bash now, with `grep` and `rg`.

So the part I wrote about wasn't being used at all, and the part I
didn't write about was quietly working.

## Testing it locally

Session counts tell me what happened, not why. To dig into that I ran
Claude Code headless with `claude -p` against this site's repo, with
my normal config, edits disabled, and the stream saved so I could
count the tool calls in each run:

```bash
claude -p "$prompt" \
  --output-format stream-json --verbose \
  --no-session-persistence \
  --disallowedTools Edit Write NotebookEdit Agent
```

## Nine navigation questions

Three questions, three runs each. None of the prompts mention LSP or
grep:

1. "In `src/lib/posts.test.ts`, `get_posts` is imported. Where is that
   function actually defined?"
2. "I want to change the signature of `get_from_cache`. List every
   call site I would need to update."
3. "What exactly does `get_post_tags` return? Give me the fully
   resolved return type and where it is defined."

| Question   | Runs | Used LSP | LSP calls per run | Also used grep in Bash |
| ---------- | ---- | -------- | ----------------- | ---------------------- |
| Definition | 3    | 3        | 1–2               | 3                      |
| Call sites | 3    | 3        | 1                 | 3                      |
| Type       | 3    | 3        | 3–5               | 3                      |

That surprised me. Asked a pure navigation question, Claude Code
reached for LSP in nine runs out of nine. The tool is deferred, so
each run had to load it first with a `ToolSearch` call, and it did
that every time too.

So it isn't that the model won't use LSP. Which makes the zero in my
real sessions more interesting, because my real prompts are tasks, not
navigation questions.

## The first answer is wrong

The call sites question is where it got interesting. In all three runs
Claude Code made one `findReferences` call on `get_from_cache` and got
this back:

```text
Found 1 reference:
  src/lib/cache/server-cache.ts:42:17
```

One reference, which is the definition itself. That function is used
in 20 files. Each run then built its answer from `git grep` instead,
and the answers were right, but LSP contributed nothing to them.

I ran a probe to check: a fresh session making the same
`findReferences` call six times in a row.

| Call               | Result                              |
| ------------------ | ----------------------------------- |
| 1st                | Found 1 reference                   |
| 2nd                | Found 51 references across 20 files |
| 3rd, 4th, 5th, 6th | Found 51 references across 20 files |

Same result in both probe sessions. Counting the three call sites
runs, that's five fresh sessions out of five where the first
`findReferences` call came back with one reference instead of 51.

There's no warning with it. The wrong answer looks exactly like a
right one. I saw the same thing with `goToDefinition` straight after
restarting Claude Code: the first call returned the import line I was
already on, and the identical call a few seconds later returned the
real definition.

Funnily enough, "first LSP call can miss" was one of the gotchas in my
March post. I called it a minor quirk. I don't think it's minor: if
the first answer in every session is wrong and unlabelled, grep is the
sensible thing to trust.

## A real refactor

Navigation questions are a bit of a soft test, so next I gave it a
task instead. Each run got its own scratch copy of the repo with edits
allowed:

> Change `get_period_boundaries` in
> `src/lib/analytics/period-stats.helpers.ts` to take a single options
> object (`{ period, now }`) instead of positional arguments, and
> update every caller. Make sure it still type-checks.

That function has eight call sites across four files, plus the
definition.

| Run | LSP calls | What LSP returned | Bash calls | Edits |
| --- | --------- | ----------------- | ---------- | ----- |
| 1   | 1         | Found 1 reference | 10         | 9     |
| 2   | 1         | Found 1 reference | 8          | 9     |
| 3   | 1         | Found 1 reference | 9          | 9     |

Same pattern in all three. Load the tool, one `findReferences` call,
get the wrong first answer, then find the callers with `grep` and make
the edits. All three runs reported updating all eight callers. None of
them went back to LSP after that first call.

## Do the diagnostics turn up?

This is the part of LSP I skipped in March, so I tested it directly. I
had Claude Code append a line with an obvious type error to a
TypeScript file and report back whatever feedback it was shown:

```ts
export const lsp_probe: number = 'text';
```

| Session                                       | Diagnostics shown |
| --------------------------------------------- | ----------------- |
| Edit, then finish straight away (2 runs)      | None              |
| Two bad edits with ~30 seconds of other steps | Both errors       |

In the longer session the errors arrived like this, with no tool call
asking for them:

```text
<new-diagnostics>The following new diagnostic issues were detected:

period-stats.helpers.ts:
  ✘ [Line 293:14] Type 'string' is not assignable to type 'number'. [2322] (typescript)
  ✘ [Line 294:14] Type 'number' is not assignable to type 'string'. [2322] (typescript)</new-diagnostics>
```

So diagnostics do work, and they are the useful half. They aren't
instant though. In the two short sessions the edit was the last thing
that happened and the type error went unreported. In the longer one
both errors showed up together after the final step, so I can't say
exactly how long they took, only that it was somewhere inside 30
seconds.

That matters for the same reason the first-call problem does. A fresh
session's language server needs time to load the project, and Claude
Code doesn't wait for it.

## Does the CLAUDE.md rule do anything?

All of those runs had my global `CLAUDE.md` loaded, and that still has
the rule from the March post in it:

```text
When tracing where a symbol is defined or finding all references to
it, use LSP (goToDefinition, findReferences, hover) instead of Grep.
LSP gives exact results; Grep gives text matches.
```

So I took that section out, ran the same twelve tests again, and put
it back.

| Test       | Used LSP, with the rule | Used LSP, without the rule |
| ---------- | ----------------------- | -------------------------- |
| Definition | 3 of 3                  | 2 of 3                     |
| Call sites | 3 of 3                  | 1 of 3                     |
| Type       | 3 of 3                  | 3 of 3                     |
| Refactor   | 3 of 3                  | 0 of 3                     |

Twelve out of twelve with the rule, six out of twelve without it. The
rule does something after all, which is not what I expected given my
own session history.

The refactor row is the one I care about, because that's what a normal
working session looks like. Without the rule, Claude Code never
touched LSP for it: no `ToolSearch` to load the tool, no LSP calls,
just `grep` and edits. The only question where it reached for LSP
every time on its own was the type one, which is the question `grep`
is worst at.

Three runs per cell is a small sample, so I wouldn't read much into
two of three against three of three. Zero of three against three of
three on the refactor is harder to wave away.

<!-- TODO: does forcing LSP (hook) change anything, and is it worth it -->

<!-- TODO: Svelte — no server for .svelte files in Claude Code; svelteserver via a local plugin -->

<!-- TODO: conclusion — is it worth it, what I'd tell March me -->
