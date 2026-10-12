---
date: 2026-10-10
title: Revisiting LSP in Claude Code
tags: ['claude-code', 'lsp', 'developer-experience']
is_private: false
---

<!-- cspell:ignore ccrecall omnirecall svelteserver -->

Back in March I wrote about
[enabling LSP in Claude Code](/posts/enable-lsp-in-claude-code). It
turned into one of my most-read posts this year, which is a bit
awkward, because a fair chunk of it is now out of date. I told people
to set an undocumented flag, I framed LSP as go-to-definition, and I
said I'd check back in a week. I didn't.

So this is the check back, seven months late. I read the current docs,
went through my own session history, and ran some tests locally to see
what Claude Code actually does with a language server.

**TlDr**: the flag is gone, the first answer LSP gives in every
session is wrong, that's a known bug, and for TypeScript there's
[a workaround](#the-workaround) that's three lines of config. After
all that, [grep was better](#just-use-grep) for finding where
something is used.

## What's changed since March

The setup in the old post was a feature flag plus a plugin in the
`~/.claude/settings.json` file:

```json {2-4}
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

## Does Claude Code actually use it?

I keep my session history in local archives, with
[ccrecall](https://github.com/spences10/ccrecall) and now
[omnirecall](https://github.com/spences10/omnirecall), so I went back
through it to see how much Claude Code had actually used LSP.

From when I switched it on at the end of February to April there's
about 650 sessions, and it made 32 LSP calls in 15 of them. 12 of
those came back with nothing, mostly
`No LSP server available for file type: .svelte`, and then it went to
grep. It never called `findReferences`, not once.

After that I wasn't really using Claude Code until a couple of weeks
ago. Since then there's 118 sessions, half of them subagents, and no
LSP calls until I started writing this.

You'll know when it has used LSP because you'll see something like
this in Claude's output:

```text
● LSP(operation: "findReferences", symbol: "get_from_cache", in: "src/lib/cache/server-cache.ts")
	└	Found 51 references across 20 files
```

So, I got Claude Code to test itself. I asked it to run headless
sessions against this site's repo with `claude -p` and save the output
from each one, so the tool calls could be counted:

```bash
claude -p "$prompt" --output-format stream-json --verbose
```

These are the four prompts it used, three runs of each. None of them
mention LSP or grep:

```markdown
<!-- Prompt 1 -->

In `src/lib/posts.test.ts`, `get_posts` is imported. Where is that
function actually defined? Give me the file and line.

<!-- Prompt 2 -->

I want to change the signature of `get_from_cache`. List every call
site (`file:line`) I would need to update. Do not change anything.

<!-- Prompt 3 -->

What exactly does `get_post_tags` return? Give me the fully resolved
return type and where it is defined.

<!-- Prompt 4 -->

Change get_period_boundaries in
`src/lib/analytics/period-stats.helpers.ts` to take a single options
`object ({ period, now })` instead of positional arguments, and update
every caller. Make sure it still type-checks.
```

Then the same again with the LSP rule taken out of my `CLAUDE.md`.

| Test       | Used LSP, with the rule | Used LSP, without the rule |
| ---------- | ----------------------- | -------------------------- |
| Definition | 3 of 3                  | 2 of 3                     |
| Call sites | 3 of 3                  | 1 of 3                     |
| Type       | 3 of 3                  | 3 of 3                     |
| Refactor   | 3 of 3                  | 0 of 3                     |

With the rule, Claude Code reached for LSP every time. Without it,
half the time, and never for the refactor. I ran the with-the-rule set
both headless with `claude -p` and in real interactive sessions and
got twelve out of twelve both ways.

So the rule from the March post does work when the prompt is about a
symbol. Going by my history, in real sessions it mostly went to grep
anyway.

Whether it should be using LSP for that is another thing, that's
further down in [Just use grep?](#just-use-grep)

## The first answer is wrong

This is the bit I didn't expect. The second prompt is the one asking
for every call site of `get_from_cache`. Each time it ran, Claude Code
made one `findReferences` call and got this back:

```text
Found 1 reference:
  src/lib/cache/server-cache.ts:42:17
```

One reference, which is the definition itself. That function is used
in 20 files. Each run then built its answer from `git grep` instead.
The answers were right, but LSP contributed nothing to them.

So, I wanted to know how wrong, and for how long. I got Claude Code to
run some fresh headless sessions, each one making the same set of
calls one after another across three functions in three different
files, and to time each call.

This is the prompt for one of them:

```markdown
This is a mechanical probe of the LSP tool. If the LSP tool is not
loaded, load it first with ToolSearch query `"select:LSP"`. Then do
these steps in order, ONE tool call per message, never in parallel,
never repeating a call unless the step says so, and using no other
tools:

1. Call the LSP tool: `findReferences` on
   `src/lib/server/bluesky-posts.ts` line 140 character 14. If the
   result is "Found 1 reference", make the identical call again, up to
   6 calls in total, stopping as soon as it reports more than 1
   reference.
2. Exactly once: `findReferences` on `src/lib/cache/server-cache.ts`
   line 42 character 17.
3. Exactly once: `findReferences` on
   `src/lib/utils/group-posts-by-tag.ts` line 14 character 14.
4. Exactly once: goToDefinition on
   `src/lib/components/newsletter-signup/newsletter.remote.ts` line 60
   character 30.
5. Exactly once: hover on `src/lib/seo/default.ts` line 20
   character 20.

When finished reply with the single word DONE.
```

And this is what came back, the time is how long since the session
started:

| Time  | Call                              | Result                              |
| ----- | --------------------------------- | ----------------------------------- |
| 4.7s  | `findReferences`, function B      | Found 1 reference                   |
| 6.6s  | `findReferences`, function B      | Found 1 reference                   |
| 7.8s  | `findReferences`, function B      | Found 5 references across 3 files   |
| 9.1s  | `findReferences`, function A      | Found 51 references across 20 files |
| 10.6s | `findReferences`, function C      | Found 10 references across 3 files  |
| 11.9s | `goToDefinition`, a fourth symbol | The right file and line             |
| 13.2s | `hover`, a fifth symbol           | The full signature                  |

Same call three times, wrong, wrong, right. Then everything after that
was right, different functions, different files, `goToDefinition` and
`hover` as well.

I got it to run a load of these, changing the order each time. The
first call of a fresh session was wrong in 18 of the first 19
sessions, and in all 13 of the ones I timed after that. Every wrong
answer came back inside about two seconds of the first LSP call in the
session.

A few other things that came out of it:

- It's the session, not the function. One wrong call on one function,
  wait a couple of seconds, and the first call on a completely
  different function in a different file is fine.
- Waiting before asking doesn't help. One session sat there for 30
  seconds before making its first call and it was still wrong. The
  language server doesn't get started until something asks it a
  question.
- Asking about something else straight away doesn't help either. In
  that same session the second call was on a different function, 1.7
  seconds later, and that was wrong too.
- `goToDefinition` does it as well. As the first call it sent me to
  the import line at the top of the file I was already in.
- One retry isn't always enough. With the retries about 1.3 seconds
  apart it took a third go in five sessions out of seven.

I updated `typescript-language-server` from 5.3.0 to 6.0.2 to see if
that helped, it didn't.

Funnily enough, "first LSP call can miss" was one of the gotchas in my
March post. I called it a minor quirk. I don't think it's minor now,
Claude Code made one call, got the wrong answer and went to grep.

## Why's it doing that?

Turns out it's a known bug, there's an
[open issue](https://github.com/anthropics/claude-code/issues/76870)
for it on the Claude Code repo. Other people are getting the same "one
reference, then all of them" with other language servers, Python ones
as well, so it's not only TypeScript.

Claude Code asks the language server the question before the server
has finished loading the project.

With TypeScript there's a bit more to it. `typescript-language-server`
starts up two `tsserver` processes, the full one and a lightweight one
it calls the syntax server. The
[docs](https://github.com/typescript-language-server/typescript-language-server/blob/master/docs/configuration.md)
say the syntax server is there to "provide IntelliSense while projects
are loading".

So, while the project is loading, anything asking for references or
definitions gets its answer from the lightweight one, and that one
only knows about the file it was asked about. That's why I get one
reference back, it's the only one in that file.

In VS Code that makes sense, I get something straight away and the
rest fills in. Claude Code asks once and takes the answer.

## The workaround

`typescript-language-server` has an option to turn the syntax server
off, it's called `useSyntaxServer`. I got Claude Code to go looking
and it found a
[discussion](https://github.com/typescript-language-server/typescript-language-server/discussions/1067)
on the language server repo from April. Someone had this exact problem
with Claude Code and the maintainer suggested trying it.

Claude Code starts a language server from a bit of config in a plugin,
which server to run and which file extensions it's for. That config
can also pass options to the server when it starts up, that's what
`initializationOptions` is for.

So here's the config from the official `typescript-lsp` plugin, with
the option added to it on the highlighted lines:

```json {15-17}
{
	"typescript": {
		"command": "typescript-language-server",
		"args": ["--stdio"],
		"extensionToLanguage": {
			".ts": "typescript",
			".tsx": "typescriptreact",
			".js": "javascript",
			".jsx": "javascriptreact",
			".mts": "typescript",
			".cts": "typescript",
			".mjs": "javascript",
			".cjs": "javascript"
		},
		"initializationOptions": {
			"tsserver": { "useSyntaxServer": "never" }
		}
	}
}
```

With that in place the first call of a session came back right in all
twelve of the sessions Claude Code ran with it.

There's two ways I know of to get that config in.

## Option 1, edit the official plugin config

The official plugin doesn't have a config file of its own, the config
is in the marketplace file, here:

```bash
~/.claude/plugins/marketplaces/claude-plugins-official/.claude-plugin/marketplace.json
```

Find `typescript` under `lspServers` in there and add the
`initializationOptions` block to it. That's what the person in the
discussion did and it worked for them.

I've not done it this way, because you could change the file, the
plugin could be updated and probably overwrite that file again.

## Option 2, use my plugin

I didn't want to be editing a file that might get overwritten, so I
made a plugin with the config above in it. It's the official one with
the option added.

I've added it to my
[svelte-skills-kit](https://github.com/spences10/svelte-skills-kit)
marketplace as `typescript-lsp`. It's not Svelte specific, that's just
where I keep my plugins, it works with any TypeScript or JavaScript
project.

The plugin is only config, so the language server needs to be
installed. If the official plugin is already working then it's there
already, if not:

```bash
pnpm i -g typescript-language-server typescript
# or npm or whatever your package manager of choice is
```

Then in Claude Code, add the marketplace:

```text
/plugin marketplace add spences10/svelte-skills-kit
```

I already had it added, so I updated it to get the new plugin showing
up:

```text
/plugin marketplace update svelte-skills-kit
```

Install the plugin:

```text
/plugin install typescript-lsp@svelte-skills-kit
```

Disable the official one. Both of them are set up for the same file
extensions so I only want one of them on:

```text
/plugin disable typescript-lsp@claude-plugins-official
```

If you're using Svelte there's a plugin for that in the same
marketplace, see the [Svelte](#svelte) section.

Then reload the plugins:

```text
/reload-plugins
```

I restarted Claude Code after that as well.

To check it's working I start a new session and, as the very first
thing, ask for the references to something I know is used in a few
files. If more than one reference comes back it's working.

## Does it work?

Here's the default config against the one with the syntax server
turned off:

|                                | Default                   | Syntax server off         |
| ------------------------------ | ------------------------- | ------------------------- |
| First call of a session        | Wrong, back in 0.5s       | Right, back in about 2s   |
| Same call three times          | 1, 1, 51 references       | 51, 51, 51 references     |
| `goToDefinition` as first call | The import line           | The definition            |
| Memory once loaded             | About 935 MB, 4 processes | About 725 MB, 3 processes |

The first call is slower because it's now waiting for the project to
load before it answers. This is a small project, on a big one I'd
expect that wait to be a lot longer than two seconds.

Type errors after an edit still show up with the option on, I got
Claude Code to check that as well.

The maintainer did say it "might not solve this issue by itself". For
this project it did.

⚠ Note: this is a workaround until it's fixed in Claude Code, the
[issue](https://github.com/anthropics/claude-code/issues/76870) is the
place to keep an eye on.

Once that's sorted, switching back to the official plugin is:

```text
/plugin uninstall typescript-lsp@svelte-skills-kit
/plugin enable typescript-lsp@claude-plugins-official
```

## Changes from the shell get missed

That same issue has a second problem in it, so I got Claude Code to
test that as well.

In a session that was already warmed up it changed files three
different ways and asked for the references after each one:

| How the file changed                                 | What `findReferences` did              |
| ---------------------------------------------------- | -------------------------------------- |
| The Edit tool                                        | Included the new line on the next call |
| A new file written from the shell                    | Missed it, then found it seconds later |
| A shell append to a file LSP had already asked about | Never saw it, across three calls       |

So edits Claude Code makes with its own tools get to the language
server. A change made from the shell to a file the server already had
open didn't.

It only tested appending a line. The issue has the same thing
happening with `git checkout`, formatters and anything else that gets
run through Bash.

The workaround doesn't do anything for this one.

## Just use grep?

So with the first answer fixed, is LSP actually any better than grep
for this? When the first answer was wrong Claude Code went to grep
anyway, and the answers were right.

I got Claude Code to run the same questions three different ways,
three runs of each, 54 sessions in all:

1. Grep only, with the LSP tool turned off.
2. LSP and grep, which is my normal setup with the rule in
   `CLAUDE.md`.
3. LSP only, with Bash, Grep and Glob turned off.

There's three functions called `get_post_tags` in this project, so I
used that for most of them, I thought a text search would struggle
with it. These are the prompts:

```markdown
<!-- References 1, the only function with that name -->

I want to change the signature of `get_from_cache`. List every call
site (`file:line`) I would need to update. Do not change anything.

<!-- References 2, one of three functions with the same name -->

I want to change the signature of `get_post_tags` in
`src/lib/data/post-tags.remote.ts`. List every call site (`file:line`)
I would need to update. Do not change anything.

<!-- References 3, a function nothing uses -->

Is `get_post_tags` in `src/lib/state/post-tags.svelte.ts` used
anywhere, or can I delete it? Do not change anything.

<!-- Types 1, all three functions -->

What exactly does `get_post_tags` return? Give me the fully resolved
return type and where it is defined.

<!-- Types 2, no return type written down -->

What exactly does `get_post_tags` in `src/lib/post-tags.ts` return? It
has no return type annotation. Give me the fully resolved return type.

<!-- Types 3, a type that comes from SvelteKit -->

What is the exact TypeScript type of `get_post_tags` exported from
`src/lib/data/post-tags.remote.ts`, and what type do I get when I
await a call to it?
```

Here's the three references questions:

|                                         | Grep only      | LSP and grep   | LSP only       |
| --------------------------------------- | -------------- | -------------- | -------------- |
| Right call sites                        | 9 of 9         | 9 of 9         | 9 of 9         |
| Found the test mock that needs updating | 3 of 3         | 3 of 3         | 0 of 3         |
| Straight answer on "can I delete it"    | 3 of 3         | 3 of 3         | 0 of 3         |
| Turns per question                      | 2 to 3         | 4 to 6         | 7 to 12        |
| Seconds per question                    | 9 to 15        | 14 to 19       | 16 to 29       |
| Cost per question                       | $0.04 to $0.08 | $0.06 to $0.09 | $0.07 to $0.12 |

And the three types questions:

|                      | Grep only      | LSP and grep   | LSP only       |
| -------------------- | -------------- | -------------- | -------------- |
| Right answer         | 9 of 9         | 9 of 9         | 9 of 9         |
| Turns per question   | 3 to 6         | 6 to 15        | 6 to 16        |
| Seconds per question | 12 to 22       | 11 to 29       | 11 to 29       |
| Cost per question    | $0.05 to $0.10 | $0.06 to $0.14 | $0.06 to $0.16 |

Grep on its own didn't get a single answer wrong, and for references
it was the quickest and the cheapest of the three.

Some things that came out of it:

- With both available Claude Code ran grep every time anyway. My rule
  tells it to check the LSP count against grep, so the LSP call was
  extra work on top.
- The three functions with the same name weren't a problem for grep.
  It searched for the name and the file it's imported from, and split
  them up correctly every time.
- `findReferences` gives back a file, a line and a column, not the
  code. With only LSP to go on Claude Code had to read three to six
  files to see what each reference was. Grep gives back the line.
- There's a `vi.mock` for that function in a test that would break if
  the signature changed. Grep found it, LSP can't, it's not a
  reference as far as TypeScript is concerned.
- With only LSP, all three "can I delete it" answers came back with a
  "but I can't check the `.svelte` files".
- Types is where LSP did alright. `hover` gives the exact type in one
  call, and on two of the three questions it was as quick as grep.
- Grep still got the types right though. For the SvelteKit one it read
  the type declarations in `node_modules`, and in one run it wrote a
  script to ask the TypeScript compiler.

⚠ Note: this is a small project with function names that don't clash
with much, one model (Opus 5.5) and three runs of each. On a big
codebase with thousands of matches for a name it could be a different
story. I didn't test a refactor either.

## Diagnostics

This is the half of LSP I skipped in March, and the one that needs
nothing from me to work. I had Claude Code append a line with an
obvious type error to a TypeScript file and report back whatever
feedback it was shown:

```ts
export const lsp_probe: number = 'text';
```

In a longer session the errors arrived like this, with no tool call
asking for them:

```text
<new-diagnostics>The following new diagnostic issues were detected:

period-stats.helpers.ts:
  ✘ [Line 293:14] Type 'string' is not assignable to type 'number'. [2322] (typescript)
  ✘ [Line 294:14] Type 'number' is not assignable to type 'string'. [2322] (typescript)</new-diagnostics>
```

They aren't instant though. In two short sessions where the edit was
the last thing that happened, the type error went unreported. In the
longer one both errors showed up about 30 seconds later. A fresh
session's language server needs time to load the project, and Claude
Code doesn't wait for it.

## Svelte

The
[official plugin list](https://code.claude.com/docs/en/plugins/code-intelligence#install-a-code-intelligence-plugin)
has no Svelte entry, which is the gap I complained about in March.
Without one, any LSP call on a component comes back with:

```text
No LSP server available for file type: .svelte
```

Same deal as the TypeScript plugin, it's only config. This is all of
it, in a file called `.lsp.json` in the plugin:

```json
{
	"svelte": {
		"command": "svelteserver",
		"args": ["--stdio"],
		"extensionToLanguage": {
			".svelte": "svelte"
		}
	}
}
```

I've added it to my
[svelte-skills-kit](https://github.com/spences10/svelte-skills-kit)
marketplace as `svelte-lsp`. The plugin doesn't include the language
server, so that goes on first:

```bash
pnpm i -g svelte-language-server
# or npm or whatever your package manager of choice is
```

Then in Claude Code, with the marketplace added:

```text
/plugin install svelte-lsp@svelte-skills-kit
/reload-plugins
```

With that loaded, hover, go-to-definition, references and document
symbols all work on `.svelte` files, and a type error I added inside a
component's `<script>` block came back as a diagnostic. Without the
plugin the same edit got no feedback at all.

It also showed up another gap in the TypeScript server on a SvelteKit
project. `number_crunch` is a utility on this site that's mostly
called from components. I asked for its references from both sides:

| Asked from                        | References found                          |
| --------------------------------- | ----------------------------------------- |
| The `.ts` file where it's defined | 23 across 3 files, none of them `.svelte` |
| A `.svelte` file that uses it     | 89 across 18 files, 15 of them `.svelte`  |
| `grep`                            | 90 lines across 18 files                  |

The TypeScript server can't see into components, so from a `.ts` file
it misses every `.svelte` caller, however many times the call is
repeated. The Svelte server gets the full list, and got it on the
first call.

## What I've changed

The rule from the March post told Claude Code to use LSP over grep for
definitions and references. After the tests above I've turned that
round. This is what's in my `CLAUDE.md` now:

```markdown
## Code Navigation

- To find where a symbol is defined or used, use grep. When more than
  one symbol has the same name, search for the name and the module it
  is imported from, and read the import lines to tell them apart.
- Use LSP hover when the exact type of a symbol matters, such as an
  inferred return type or a type that comes from a library.
- Do not treat an LSP findReferences result as the full list. It
  misses .svelte callers when run from a .ts file, mocks and other
  string references, and files changed from the shell. Confirm with
  grep before deleting or changing a signature.
- LSP diagnostics arrive on a later turn after an edit, not
  immediately. No diagnostics straight after an edit does not mean the
  edit is clean; run the type check before reporting done.
```

Then I got Claude Code to run the same six questions again with the
new rule in, three runs of each:

|                                      | Old rule | New rule |
| ------------------------------------ | -------- | -------- |
| Right answers                        | 18 of 18 | 18 of 18 |
| Used LSP on the references questions | 9 of 9   | 0 of 9   |
| Used `hover` on the types questions  | 9 of 9   | 9 of 9   |
| Turns per references question        | 4 to 6   | 2 to 3   |
| Seconds per references question      | 14 to 19 | 10 to 20 |

So it does what it says. Grep for where something is used, `hover` for
types, and the references questions take about half the turns.

I've also swapped the official `typescript-lsp` plugin for mine, and
added `svelte-lsp` alongside it.

## Is it worth it?

Yes, but not for the reason I gave in March.

1. **Diagnostics are the reason to have it.** Type errors come back
   after an edit without anything having to ask for them, and that's
   the one thing here grep can't do.
2. **For finding where something is used, grep was better.** It was
   right every time, quicker and cheaper, and it found things LSP
   can't see.
3. **For types it was a draw.** `hover` gives the exact type in one
   call, grep got to the same answer.
4. **The first answer of a session is wrong.** It's a known bug. For
   TypeScript, turning the syntax server off fixed it in every session
   Claude Code ran.
5. **It doesn't see everything.** Files changed from the shell can be
   stale, and on a SvelteKit project the TypeScript server never sees
   the components.
6. **The flag is gone.** `ENABLE_LSP_TOOL` can come out of
   `settings.json`.
7. **Svelte takes one small config file.**

So the advice in the March post, tell Claude Code to use LSP in place
of grep, I'd take back. On this project it made things slower without
making them more right.

Going by my history Claude Code had worked that out before I did, it
was using grep the whole time.
