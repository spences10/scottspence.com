---
date: 2026-01-24
title: Organising Claude Code Skills Into Plugin Marketplaces
tags: ['claude', 'claude-code', 'notes']
is_private: false
---

<!-- cspell:ignore cclog -->

Aight, so, continuing with the Claude Code 'bits' and my toolchain I'm
putting together for working with Claude Code. Claude Code is very
much integrated into my workflow with skills for this and that! Thing
is the skills were dotted around in differing repos and I'd be copy
pasting from one to the other and sometimes they were outdated and I'm
scurrying around trying to find the last place I updated the specific
skill I needed etc!

The `svelte-claude-skills` repo I made when trying to work out
[How to Make Claude Code Skills Activate Reliably](/posts/how-to-make-claude-code-skills-activate-reliably)
now has ~140 GitHub stars, but, the skills in there I've not touched
since mid December. 😅

Essentially I needed these skills and 'bits' tracked in git and to be
able to sync them across projects and pull them when I needed them,
rather than setting up sync between them all there's
[plugins](https://claude.com/blog/claude-code-plugins) you can make
for Claude Code to consume.

So, I spent some time reorganising the skills I use into some plugins
available via two marketplaces!

- [claude-code-toolkit](https://github.com/spences10/claude-code-toolkit)
- [svelte-skills-kit](https://github.com/spences10/svelte-skills-kit)

## Why two marketplaces?

"Why not just one?" and honestly, I considered it. But as I started
grouping them a natural split emerged:

**General Claude Code workflow 'stuff'** vs **svelte-specific
skills**.

Some tools are useful for me regardless of Svelte, the others were
around performance optimisations, analytics, the forced-eval hook that
makes skills actually activate. Others are specific to Svelte and
SvelteKit development.

Bundling everything together would mean Svelte devs downloading a
bunch of stuff they don't need, and non-Svelte devs getting confused
by runes documentation. Separation of concerns, innit?

## claude-code-toolkit

This is the general productivity toolkit when I'm using Claude Code
for any project.

- **toolkit-skills** - The forced-eval hook (84% skill activation vs
  20% without it), plus skills for ecosystem guidance, research
  patterns, skill creation, session reflection, and plugin development
- **performance** - SQLite FTS5 indexing that dropped file search from
  28ms to 3ms with BM25 ranking
- **mcp-essentials** - Setup guide for my recommended MCP servers
- **analytics** - Query your Claude Code usage from cclog's database

```bash
# In Claude Code
/plugin marketplace add spences10/claude-code-toolkit
/plugin install toolkit-skills
/plugin install performance
```

## svelte-skills-kit

This is where all my Svelte and SvelteKit knowledge lives. If you're
building with Svelte 5, this is the stuff I wish I'd had when I
started.

- **svelte-runes** - `$state`, `$derived`, `$effect`, `$props`,
  `$bindable` and migration from Svelte 4
- **sveltekit-data-flow** - Load functions, form actions, `fail()`,
  `redirect()`, serialisation rules
- **sveltekit-structure** - Routing, layouts, error boundaries, SSR
- **sveltekit-remote-functions** - `command()`, `query()`, `form()`
  patterns
- **svelte-template-directives** - `{@attach}`, `{@html}`,
  `{@render}`, `{@const}` patterns
- **svelte-deployment** - Adapters, Vite config, pnpm, PWA setup
- **layerchart-svelte5** - Chart patterns with Svelte 5 snippets
- **svelte-components** - Bits UI, Ark UI, Melt UI patterns

These skills get loaded when Claude detects you're working on
something relevant. Ask about form actions? `sveltekit-data-flow`
activates. Working with `$state`? `svelte-runes` kicks in.

```bash
# In Claude Code
/plugin marketplace add spences10/svelte-skills-kit
/plugin install svelte-skills
```

## SQLite

I've been reflecting on my tooling lately, and SQLite has become my
go-to for nearly everything AI workflow related.

The performance plugin uses SQLite FTS5. The analytics plugin queries
SQLite. My conversation logging (cclog) stores everything in SQLite -
I've got a 186MB database tracking 2,555 AI sessions, 70k messages,
and 19M tokens. 😅

Why SQLite for AI work?

1. **Zero config** - No server, just a file
2. **Portable** - Copy it anywhere, query it with any tool
3. **Fast** - FTS5 queries in 3ms, bulk inserts in 96ms for 5k records
4. **Queryable** - SQL is the universal language for data exploration
5. **Everywhere** - Python, Node, Bash, even MCP servers can use it

The pattern I keep seeing: AI tools generate tons of structured data
(tokens, costs, tool calls, file operations). SQLite makes it a doddle
to store, query, and analyse.

## The ecosystem

These marketplaces are part of a broader set of tools I've built:

| Tool             | What it does                           |
| ---------------- | -------------------------------------- |
| mcp-omnisearch   | Unified search (Tavily, Kagi, GitHub)  |
| mcp-sqlite-tools | Safe SQLite operations via MCP         |
| cclog            | Sync Claude Code transcripts to SQLite |
| mcpick           | Toggle MCP servers on/off dynamically  |

They all work together. Use `cclog` to sync your transcripts, query
them with `mcp-sqlite-tools`, search the web with `mcp-omnisearch`,
and manage which MCPs are active with `mcpick`.

## Getting started

If you want to try these:

**For general productivity:**

```bash
/plugin marketplace add spences10/claude-code-toolkit
/plugin install toolkit-skills
```

**For Svelte development:**

```bash
/plugin marketplace add spences10/svelte-skills-kit
/plugin install svelte-skills
```

**Pro tip:** Install `toolkit-skills` alongside `svelte-skills`. The
forced-eval hook in toolkit-skills makes the Svelte skills actually
activate when they should (84% vs 20% without it - I tested this
extensively, see my
[post on skill activation](/posts/how-to-make-claude-code-skills-activate-reliably)).

## Conclusion

I now have all my skills I use git tracked in a central place (two
marketplaces) so I can have them in use at a top level (for every
project I work on) and be activated reliably with the forced eval
hook!

Using cclog and the reflect skill I'l able to improve and refine these
skills as I use them in projects along with creating new skills and
using things like the claude-skills-cli to enforce best practices
creating them!
