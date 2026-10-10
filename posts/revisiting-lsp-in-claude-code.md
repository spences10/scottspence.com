---
date: 2026-10-10
title: Revisiting LSP in Claude Code
tags: ['claude-code', 'lsp', 'developer-experience']
is_private: false
---

<!-- cspell:ignore omnirecall svelteserver -->

Back in March I wrote about
[enabling LSP in Claude Code](/posts/enable-lsp-in-claude-code). It
turned into one of my most-read posts this year, which is a bit
awkward, because a fair chunk of it is now out of date. I told people
to set an undocumented flag, I framed LSP as go-to-definition, and I
said I'd check back in a week. I didn't.

So this is the check back, seven months late. I read the current docs,
went through my own session history, and ran some tests locally to see
what Claude Code actually does with a language server.

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

## Does Claude Code actually use it?

I keep my session history in a local archive with
[omnirecall](https://github.com/spences10/omnirecall), so I could
count. Across 125 Claude Code sessions since August there are zero
`LSP` tool calls, apart from the ones made while writing this post.
The tool was available in 120 of those sessions and my `CLAUDE.md`
rule telling it to use LSP was loaded in 110.

So I tested it. Four prompts against this site's repo, three runs
each, none of them mentioning LSP or grep:

1. Where is this imported function actually defined?
2. List every call site of this function.
3. What is the fully resolved return type of this function?
4. Change this function's signature and update every caller.

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

That doesn't square with the zero in my own history, and I don't have
an explanation for the gap. What I can say is that the rule from the
March post does work when the prompt is about a symbol.

## The first answer is wrong

This is the bit I didn't expect. In the call sites runs Claude Code
made one `findReferences` call and got this back:

```text
Found 1 reference:
  src/lib/cache/server-cache.ts:42:17
```

One reference, which is the definition itself. That function is used
in 20 files. Each run then built its answer from `git grep` instead.
The answers were right, but LSP contributed nothing to them.

So I ran a probe: a fresh session making the same `findReferences`
call over and over.

| Call       | Result                              |
| ---------- | ----------------------------------- |
| 1st        | Found 1 reference                   |
| 2nd        | Found 51 references across 20 files |
| 3rd to 6th | Found 51 references across 20 files |

Across everything I ran, the first `findReferences` call of a fresh
session was wrong in 18 sessions out of 19. Calling again usually
fixes it, but not always: in five sessions the second answer was
right, and in two, on a different function, it took a third call.

There's no warning with it. The wrong answer looks exactly like a
right one. Updating `typescript-language-server` from 5.3.0 to 6.0.2
made no difference.

Funnily enough, "first LSP call can miss" was one of the gotchas in my
March post. I called it a minor quirk. I don't think it's minor: if
the first answer in every session is wrong and unlabelled, grep is the
sensible thing to trust.

## Diagnostics are the useful half

This is the part of LSP I skipped in March. I had Claude Code append a
line with an obvious type error to a TypeScript file and report back
whatever feedback it was shown:

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

It turns out a plugin is only a config file. This is the whole thing:

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
npm i -g svelte-language-server
```

Then in Claude Code:

```text
/plugin marketplace add spences10/svelte-skills-kit
/plugin install svelte-lsp@svelte-skills-kit
```

With that loaded, hover, go-to-definition, references and document
symbols all work on `.svelte` files, and a type error I added inside a
component's `<script>` block came back as a diagnostic. Without the
plugin the same edit got no feedback at all.

It also showed up a second problem with the TypeScript server on a
SvelteKit project. `number_crunch` is a utility on this site that's
mostly called from components. I asked for its references from both
sides:

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

The March rule stays, because it's what gets LSP used at all. I've
added lines for the problems above:

```markdown
## Code Navigation

- When tracing where a symbol is defined or finding all references to
  it, use LSP (goToDefinition, findReferences, hover) instead of Grep.
  LSP gives exact results; Grep gives text matches.
- The first LSP calls in a session can be wrong. A findReferences
  result with only the definition, or a goToDefinition result that is
  the line you are already on, means the server has not loaded the
  project yet: call again, and check the count against grep before
  relying on it.
- In Svelte projects, findReferences from a .ts file misses usages in
  .svelte files. Run it from a .svelte file that uses the symbol, or
  confirm with grep.
- LSP diagnostics arrive on a later turn after an edit, not
  immediately. No diagnostics straight after an edit does not mean the
  edit is clean; run the type check before reporting done.
- Use Grep/Glob for discovery (finding files, searching patterns,
  strings, config, Markdown). Use LSP for understanding (definitions,
  references, type info).
```

I haven't measured yet whether the new lines change the outcome. The
first line is the one with numbers behind it.

## Is it worth it?

Yes, but not for the reason I gave in March.

1. **Diagnostics are the reason to install it.** Type errors come back
   after an edit without anything having to ask for them. That works
   today with no configuration beyond the plugin.
2. **Navigation needs the `CLAUDE.md` rule.** With it, Claude Code
   used LSP in every test. Without it, half of them, and never for a
   refactor.
3. **Reference counts need checking against grep.** The first answer
   in a session is usually wrong, and on a SvelteKit project the
   TypeScript server never sees the components.
4. **The flag is gone.** `ENABLE_LSP_TOOL` can come out of
   `settings.json`.
5. **Svelte takes one small config file.**

What I still can't explain is my own history: 125 sessions with the
tool and the rule both there, and not one navigation call. If I work
that out it'll be another post.
