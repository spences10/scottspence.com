---
date: 2026-09-15
title: I Built 21 MCP Tools. These Are the 2 I Still Use
tags: ['mcp', 'claude-code', 'tools']
is_private: false
---

<!-- cSpell:ignore omnisearch Tavily Kagi Jina Perplexity DuckDuckGo Exa Linkup Firecrawl libsql Turso mcpick pnpx n8n -->

Since January 2025 I've built 21 MCP servers and tools. Most of them
were experiments, a way of getting familiar with the technology while
it was new. There are two I still get use out of every day. This is
how that happened.

## January 2025

In January 2025 I gave a
[talk about staying current with Svelte using AI tools](/speaking#svelte-society-london---january-2025),
and MCP was new enough that other developers were asking me what it
was.

Web search inside AI products wasn't very good back then, and models
were poor at current Svelte. MCP was a way to give them both. Between
14 and 24 January I built servers for:

- memory, backed by libSQL
- Tavily, Kagi, Perplexity and DuckDuckGo search
- three Jina services: a reader, grounding and search
- the Svelte documentation
- running commands in WSL
- sequential tool use

That's 11 servers in 11 days.

## One search server instead of seven

Having a separate server for every search provider got old quick. Each
had its own configuration, its own API key and its own maintenance.

In March 2025 I combined them into
[mcp-omnisearch](https://github.com/spences10/mcp-omnisearch), and the
seven single-provider search and extraction servers have since been
archived.

## The rest of 2025

The tools after that were more varied:

| When     | What                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| Feb 2025 | an SSE transport experiment                                                                                |
| Mar 2025 | embedding search over transcripts, and a Turso database server                                             |
| Apr 2025 | an n8n workflow builder, and a sequential thinking QA server                                               |
| Jul 2025 | mcp-sqlite-tools                                                                                           |
| Sep 2025 | design tokens for UI generation, and [McPick](/posts/mcpick-manage-mcp-servers-and-plugins-in-claude-code) |
| Oct 2025 | memory backed by SQLite                                                                                    |

McPick isn't an MCP server. It's a CLI for managing them, which is why
I say 21 MCP servers and tools rather than 21 servers.

## Why I stopped

If I look at the other tools I've made this year, most of them are
CLIs: [nopeek](/posts/nopeek-keep-secrets-out-of-claude-code),
[omnirecall](/posts/omnirecall-search-claude-code-codex-and-pi-sessions),
McPick, ccrecall and pirecall. That wasn't a plan. I found that an LLM
will happily use a CLI and be quite good with it.

A CLI has `--help`, the agent can read it, and it runs the command.
There's no server to configure, and nothing sitting in the context
window until it's needed. That last part used to matter a lot. Last
September I found my MCP tools were
[using 66,000+ tokens of context](/posts/optimising-mcp-server-context-usage-in-claude-code)
before I'd even started a conversation.

That doesn't mean MCP is dead. When a tool needs secrets or auth, an
MCP server is still the right place to keep them, and one of the two I
still use is exactly that. But for the kind of tools I was building,
the models have come on so well that on a lot of occasions there isn't
really a need for one.

The clearest example is my most popular MCP server, the sequential
thinking one from January 2025. It's also the most useless. The model
writes each step of its thinking and its own tool recommendations, and
the server stores them and checks the recommended tools exist. It
doesn't do any thinking itself. That made some sense before models
could reason step by step on their own. Now it's a notepad the model
could keep in its head.

## The two I still use

**[mcp-omnisearch](https://github.com/spences10/mcp-omnisearch)**
gives an agent web search, AI answers and page extraction across
Tavily, Brave, Kagi, Exa, Linkup and Firecrawl, plus GitHub search,
through one server. When I ask an agent to research something, this is
what it uses to go and read the actual source rather than guessing.

**[mcp-sqlite-tools](https://github.com/spences10/mcp-sqlite-tools)**
lets an agent work with local SQLite databases, with read-only queries
kept separate from anything destructive. I use it to query my recall
databases of past coding agent sessions, and the analytics database
for this site.

They're my daily bread and butter when I'm using coding agents.

## A side note on SQLite

Near enough every tool I've made for AI workflows is built around
SQLite. The recall CLIs, the
[context sidecar for my-pi](/posts/sqlite-context-sidecar-my-pi),
wiki0, memory servers, and mcp-sqlite-tools itself.

SQLite is the AI engineer's workhorse. There's nothing to set up.
Chuck a file in and off you go, and start doing stuff with it straight
away. FTS5 adds full-text search with BM25 ranking, so searching
sessions or docs is a query, not another service.

It doesn't do the thinking, though. It still needs a good schema and
some experience of working with databases.

## Wrapping up

Seven of the 21 turned into the one I use most, and the models caught
up with most of the rest. Building a tool and keeping it are separate
decisions.

If you're setting up MCP in Claude Code for the first time, my
[configuring MCP tools in Claude Code](/posts/configuring-mcp-tools-in-claude-code)
post covers where the config lives.
