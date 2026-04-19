---
date: 2026-04-18
title: Add LSP to my-pi
tags: ['pi', 'lsp', 'developer-experience', 'guide']
published: true
---

<!-- cspell:ignore agentic spelunking svelteserver spawnable -->

This whole thing started with a chat with Kev, (Svelte Society
co-founder), after a few beers at the CityJS after-party. I mentioned
[my-pi](https://github.com/spences10/my-pi) to him and his first
question to me was "oh! does it have LSP built in?" I was immediately
nerd-sniped!

I
[recently got LSP working in Claude Code](https://scottspence.com/posts/enable-lsp-in-claude-code),
so, that felt like something I should see if it was possible to add to
`my-pi`.

First though! Part of why `my-pi` exists in the first place is that I
wanted a composable CLI that LLMs could use, but also one I actually
wanted to use myself. The recurring dumbing-down I felt from the Opus
models, especially the jump from 4.6 to 4.7, got annoying enough that
I stopped waiting for somebody else to fix it and started building my
own harness on top of the stellar work already done in the
[pi-coding-agent](https://github.com/badlogic/pi-mono). The goal was
basically: keep the creature comforts from the Claude harness, add
skills and MCP servers, then layer in the extra bits I wanted for real
work, like redaction and eval-friendly telemetry. LSP fits that same
pattern.

## Can pi even do this?

Yeah! But! Not out of the box.

Pi gives you the primitives, not the polished features, which is one
of the reasons I like it. So if I wanted LSP in `my-pi`, I had to add
it myself.

That meant building a small LSP layer for the languages I care about,
then exposing the useful bits as Pi tools: diagnostics, hover,
definition lookups, references, symbol lookup, and batch diagnostics.

The first pass worked well on TypeScript. That alone made it worth the
effort. It was immediately useful for tracing definitions, doing quick
diagnostics sweeps, and generally reducing the amount of blind grep
spelunking.

## The useful failure

Then I pointed it at
[`sveltest`](https://github.com/spences10/sveltest), because there was
no point calling this useful if it only worked on `.ts` files.

TypeScript-side files were fine. `.svelte` files were not.

The whole process crashed trying to spawn `svelteserver`.

That turned out to be the most useful part of the whole exercise,
because it exposed two real problems straight away:

1. LSP startup failure needed to be handled cleanly instead of killing
   `my-pi`
2. Svelte support depended on an actual language server binary being
   available on `PATH`

The first point forced the extension to get better. Startup errors now
return cleanly, missing servers fail gracefully, and workspace
handling got smarter too.

## One bit I overlooked

I assumed Svelte would just work once the LSP plumbing existed in
`my-pi`, no, `my-pi` still needs a spawnable binary on `PATH`, so
`svelte-language-server` had to be installed separately.

```bash
volta install svelte-language-server
```

I already had `typescript` and `typescript-language-server` globally
installed for using LSP in Claude Code and that's why they worked.

Once that was installed, `.svelte` support started behaving properly.

## After the fix

Re-running the same checks on Svelte files gave me:

- clean diagnostics on `+page.svelte`
- document symbols from `docs-search.svelte`
- hover info on `perform_search`
- references for `search_query`

At that point, `my-pi` had the kind of LSP support that was useful in
real work:

- diagnostics for single files and batches
- hover info at a given position
- definition lookups
- reference lookups
- document symbols
- symbol lookup by name
- workspace-aware per-file resolution across TS, JS, and Svelte files

There is still one caveat: when I tested this against `svortie`, most
Svelte template lookups worked fine. Things like `{data.total}`,
`{agent.name}`, component usage, and event handlers all resolved
properly. But I also hit a few template-position lookups that came
back as `No definition found`, especially around snippet props and
some interpolated attribute expressions.

So I do not want to overstate it either way: Svelte LSP support in
`my-pi` is clearly useful, but there are still some template-level
edges where definition lookup is a bit patchy.

## What this changes in practice

For me, LSP in `my-pi` is worth it.

Claude Code still tends to fall back to grep-heavy behaviour because
of how its prompt is shaped. With `my-pi`, I can bias things more
intentionally. That means LSP gets used where it is actually strong:

- diagnostics across lots of files
- tracing definitions precisely
- finding symbols without already knowing coordinates
- understanding structure without reading an entire file top to bottom

That is the bit I care about. Not whether `my-pi` can claim LSP on a
feature list, but whether it helps the agent understand code with less
fumbling around.

## The real takeaway

The biggest lesson here was not really "add LSP".

It was that useful failures show you where the harness is still
flimsy. The Svelte crash forced `my-pi` to get better at startup
handling, workspace detection, and practical language-server
discovery. That is exactly the sort of improvement I wanted from
building my own harness in the first place.

## References

- [Enable LSP in Claude Code](https://scottspence.com/posts/enable-lsp-in-claude-code)
- [my-pi on GitHub](https://github.com/spences10/my-pi)
- [pi-coding-agent](https://github.com/badlogic/pi-mono)
- [oh-my-pi](https://github.com/can1357/oh-my-pi)
- [svelte-language-server on npm](https://www.npmjs.com/package/svelte-language-server)
