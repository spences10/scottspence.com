---
date: 2026-03-03
title: Enable LSP in Claude Code
tags: ['claude-code', 'lsp', 'developer-experience', 'guide']
published: true
---

Right, so, I stumbled across
[this post by Karan Bansal](https://karanbansal.in/blog/claude-code-lsp/)
about enabling LSP in Claude Code and thought "no way this actually
works." Turns out it does.

Here's the thing - every time you ask Claude Code "where is this
function defined?", it does what you'd do with a terminal. It greps.
Searches text patterns across your entire codebase, reads through
files, and tries to figure out which match is the actual definition.
It works, but it's fuzzy. You get back multiple matches and Claude has
to read each file to figure out which one you actually meant.

LSP (Language Server Protocol) gives Claude Code the same semantic
code intelligence your IDE already has. Go-to-definition, find
references, type info, real-time diagnostics. The difference between
text search and actually understanding your code's structure.

## Before LSP - the baseline

Before setting anything up, I ran a quick test on my SvelteKit site.
Asked Claude Code to find where `get_posts` is defined using its
standard Grep tool:

```text
src/lib/state/posts.svelte.ts:78:export function get_posts_state()
src/lib/state/posts.svelte.ts:83:export const get_posts = async ()
src/lib/data/posts.remote.ts:18:export const get_posts = query(async ()
```

Three matches. Which one's the "real" definition? The state wrapper?
The remote function? The re-export? Claude would need to read each
file to disambiguate. That's the grep life.

## Setting it up

The whole thing takes about two minutes. There's an undocumented
feature flag discovered via
[GitHub issue #15619](https://github.com/anthropics/claude-code/issues/15619)
\- not in the official docs yet.

**Step 1: Install the language server**

I use [Volta](https://volta.sh) for managing global Node packages:

```bash
volta install typescript-language-server typescript
```

If you're not using Volta, `npm i -g` works fine too.

**Step 2: Update your Claude Code settings**

Add `ENABLE_LSP_TOOL` to your `~/.claude/settings.json` env and enable
the TypeScript LSP plugin:

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

Merge these into your existing settings - don't overwrite what's
already there. I made that mistake initially, editing the wrong file
entirely. Classic. 😅

**Step 3: Restart Claude Code**

LSP servers initialise at startup. You need a full restart for it to
pick up the new config.

## After LSP - the result

New session, same question: "Where is `get_posts` defined?"

```text
LSP(operation: "goToDefinition", symbol: "get_posts",
    in: "src/routes/posts/+page.ts")
→ Found 1 definition
```

One result. `src/lib/data/posts.remote.ts:18`. The exact file and line
number. No ambiguity. No reading through multiple files. Just the
answer.

## The gotchas

A few things I hit during setup:

- **Plugin installed but disabled** - this is the #1 issue. If
  `claude plugin list` shows `Status: disabled`, run
  `claude plugin enable typescript-lsp` and restart
- **Schema validation warnings** - your IDE might show squiggles on
  `ENABLE_LSP_TOOL` in settings.json because it's not in the official
  schema yet. Harmless - the setting still works
- **First LSP call can miss** - in my test, the first attempt tried
  the wrong symbol name and returned 0 results. It self-corrected on
  the second try. Minor quirk

## Actual usage data

Right, here's where it gets interesting. I went back to my session
history database (`ccrecall.db` — shout out to
[ccrecall](https://github.com/spences10/ccrecall) for making this
easy) and pulled the numbers on how much LSP actually gets used versus
Grep and Glob over the first four days.

| Day              | LSP    | Grep    | Glob    |
| ---------------- | ------ | ------- | ------- |
| Feb 28 (enabled) | 2      | 33      | 51      |
| Mar 1            | 7      | 173     | 145     |
| Mar 2            | 0      | 245     | 287     |
| Mar 3            | 3      | 88      | 48      |
| **Total**        | **12** | **539** | **531** |

Twelve. Twelve LSP calls out of 1,082 total code navigation calls.
That's 1.1%. 😅

I was honestly expecting a bigger shift. So I dug into why.

### Why the low numbers?

**The system prompt wins.** Claude Code's built-in system prompt
actively tells the model to use Grep for content search and Glob for
file search. My `CLAUDE.md` instruction saying "prefer LSP" competes
with that, and the system prompt is stronger context. The model
defaults to what it's told to do.

**No `.svelte` file support.** The last LSP call I looked at returned
`"No LSP server available for file type: .svelte"`. The TypeScript LSP
only handles `.ts` and `.js` files. For a SvelteKit project where half
the code lives in `.svelte` files, that's a big gap. No Svelte LSP
plugin exists for Claude Code yet.

**LSP and Grep aren't replacements — they're complementary.** LSP
needs a specific file path, line number, and character position to
work. You need to already know _where_ to look. Grep and Glob are
discovery tools — they _find_ things. LSP is a precision tool — it
_understands_ things you've already found.

The breakdown of those 12 calls: 6 `goToDefinition` (tracing where
something's defined), 3 `documentSymbol` (listing what's in a file),
and 3 `hover` (type info). Never once used `findReferences` or any of
the call hierarchy operations. It's a narrow use case.

### Making it stick - updating CLAUDE.md

The original instruction I had was too vague:

```text
Prefer LSP tools (goToDefinition, findReferences, hover) over Grep
for code navigation when available
```

I've since updated it to be more prescriptive about _when_ to use each
tool:

```text
When tracing where a symbol is defined or finding all references to
it, use LSP (goToDefinition, findReferences, hover) instead of Grep.
LSP gives exact results; Grep gives text matches.

Use Grep/Glob for discovery (finding files, searching patterns). Use
LSP for understanding (definitions, references, type info).

After locating a file with Grep/Glob, use LSP to navigate within it
rather than reading the whole file.
```

The key difference: instead of a generic "prefer LSP", it now
describes the workflow — Grep/Glob to find, LSP to understand. Whether
this actually moves the needle remains to be seen. I'll check back in
a week.

## Is it worth it?

For a SvelteKit project like mine — yes, but with caveats. When LSP
fires, it's brilliant. One result instead of three. Exact file and
line instead of fuzzy text matches. But it only covers `.ts`/`.js`
files, the model defaults to Grep anyway, and you'll need to coach it
with specific `CLAUDE.md` instructions to get consistent use.

The feature flag is undocumented and the issue is still open, so this
could change or break in future versions. But the setup is trivial and
the 1.1% of the time it _does_ fire, you get noticeably better
results.

Two minutes of config. Manage your expectations accordingly.

## References

- [Karan's original post](https://karanbansal.in/blog/claude-code-lsp/)
  \- thorough walkthrough with debug logs and multi-language setup
- [GitHub issue #15619](https://github.com/anthropics/claude-code/issues/15619)
  \- the feature request where this was discovered
