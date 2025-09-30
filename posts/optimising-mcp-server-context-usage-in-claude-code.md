---
date: 2025-09-30
title: Optimising MCP Server Context Usage in Claude Code
tags: ['mcp', 'claude-code', 'claude', 'tools', 'guide']
is_private: false
---

So there I was, starting a Claude Code session, and I noticed
something disturbing and completely of my own making: my MCP tools
were consuming 66,000+ tokens of context before I even started a
conversation. That's a massive chunk of Claude's context window
just... gone. For reference, Claude Sonnet 4.5 has a 200k token
window, which means I was burning through a third of it just loading
tools!

## The discovery

I loaded up a Claude Code session and got a warning for a failed MCP
tool and was prompted to run the `/doctor` command to diagnose the
issue.

I got something like this:

```
 Context Usage Warnings
 └ ⚠️ Large MCP tools context (~81,986 tokens > 25,000)
   └ MCP servers:
     └ mcp-omnisearch: 20 tools (~14,114 tokens)
     └ playwright: 21 tools (~13,647 tokens)
     └ mcp-sqlite-tools-testing: 19 tools (~13,387 tokens)
     └ mcp-sqlite-tools: 19 tools (~13,349 tokens)
     └ n8n-workflow-builder: 10 tools (~7,018 tokens)
     └ (7 more servers)
```

Bonkers! I hadn't even asked Claude to do anything yet, and I'd
already used most of the available context.

The culprit? My `mcp-omnisearch` server alone was consuming 14,214
tokens with its 20 different tools. Each tool had verbose
descriptions, multiple parameters, and examples. Multiply that by all
my active MCP servers, and you get proper context bloat.

## Treating the symptoms

My initial reaction was to build
[McPick](https://github.com/spences10/mcpick), a CLI tool for toggling
MCP servers on and off. The idea was simple, before starting a coding
session, only enable the MCP servers I actually need.

```bash
# Run McPick to manage servers
npx mcpick

? What would you like to do?
  ❯ Toggle MCP servers
    View current configuration
    Exit

? Select MCP servers to enable/disable:
  ◉ mcp-omnisearch (enabled)
  ◯ turso-cloud (disabled)
  ◉ sequential-thinking (enabled)
```

It works! The tool creates backups, safely modifies your
`.claude.json` config, and lets you selectively enable only what you
need. Before a web scraping task? Enable `mcp-omnisearch`. Working on
database stuff? Enable turso-cloud. Simple!

But here's the thing - McPick was treating the symptom, not the source
issue. I was managing bloated MCP servers when I should've been fixing
the bloat itself.

## Optimise the servers

Instead of juggling which servers to enable, I needed to make the
servers more efficient. So I dug into `mcp-omnisearch` and started
consolidating. I'll probably mention this a lot, but, I'd much rather
build my own MCP tool than hand off any of my API keys to a MCP server
I don't control.

When I say optimise the servers I mean, MCP tools I've made that I can
improve.

### The numbers before optimisation

So, here's the breakdown of the `mcp-omnisearch` available tools
before I started optimising. There's a lot of them:

```
mcp-omnisearch:
- 20 tools
- 14,214 tokens
- Average 710 tokens per tool

Tools included:
- tavily_search
- brave_search
- kagi_search
- exa_search
- perplexity_search
- kagi_fastgpt_search
- exa_answer_search
- github_search
- github_repository_search
- github_user_search
- firecrawl_scrape_process
- firecrawl_crawl_process
- firecrawl_map_process
- firecrawl_extract_process
- firecrawl_actions_process
- exa_contents_process
- exa_similar_process
- kagi_summarizer_process
- tavily_extract_process
- kagi_enrichment_enhance
```

Every single one of these had its own tool definition, parameters,
descriptions, and examples. The descriptions alone were eating up
tokens with sentences like "This tool searches the web using the
Tavily API and returns results formatted as JSON with citations and
source URLs..."

## Optimisation work

So, I consolidated related tools using parameters instead of separate
tool definitions. Here's what I did:

**1. Web search consolidation**

Consolidated four web search tools into one:

**Before:** Four separate tools

- `tavily_search`
- `brave_search`
- `kagi_search`
- `exa_search`

**After:** One tool with a provider parameter

```typescript
{
  name: "web_search",
  parameters: {
    query: "Search query",
    provider: "tavily | brave | kagi | exa",
    limit: "Number of results"
  }
}
```

**2. GitHub search consolidation**

Consolidated three GitHub search tools into one:

**Before:** Three separate tools

- `github_search` (for code)
- `github_repository_search`
- `github_user_search`

**After:** One tool with a search_type parameter

```typescript
{
  name: "github_search",
  parameters: {
    query: "Search query",
    search_type: "code | repositories | users",
    limit: "Number of results"
  }
}
```

**3. AI search consolidation**

Consolidated three AI-powered search tools into one:

**Before:** Three separate AI-powered search tools

- `perplexity_search`
- `kagi_fastgpt_search`
- `exa_answer_search`

**After:** One tool with a provider parameter

```typescript
{
  name: "ai_search",
  parameters: {
    query: "Query",
    provider: "perplexity | kagi_fastgpt | exa_answer",
    limit: "Result limit"
  }
}
```

**4. Firecrawl processing consolidation**

Consolidated five Firecrawl processing modes into one:

**Before:** Five different processing modes

- `firecrawl_scrape_process`
- `firecrawl_crawl_process`
- `firecrawl_map_process`
- `firecrawl_extract_process`
- `firecrawl_actions_process`

**After:** One tool with a mode parameter

```typescript
{
  name: "firecrawl_process",
  parameters: {
    url: "URL(s)",
    mode: "scrape | crawl | map | extract | actions",
    extract_depth: "basic | advanced"
  }
}
```

**5. Exa processing consolidation**

Consolidated two Exa processing modes into one:

**Before:** Two separate tools

- `exa_contents_process`
- `exa_similar_process`

**After:** One tool with a mode parameter

```typescript
{
  name: "exa_process",
  parameters: {
    url: "URL(s)",
    mode: "contents | similar",
    extract_depth: "basic | advanced"
  }
}
```

## Description optimisation

Beyond consolidation, I slashed the verbose descriptions. Here's an
example:

**Before (87 tokens):**

> "Search the web using Tavily Search API. Best for factual queries
> requiring reliable sources and citations. Supports domain filtering
> through API parameters (include_domains/exclude_domains). Provides
> high-quality results for technical, scientific, and academic topics.
> Use when you need verified information with strong citation
> support."

**After (12 tokens):**

> "Search using Tavily. Best for factual/academic topics with
> citations."

Multiply that across 20 tools and the savings add up!

## The results

```
Before:
- 20 tools
- 14,214 tokens
- Average 710 tokens per tool

After:
- 8 tools
- 5,663 tokens
- Average 707 tokens per tool

Reduction: 60% fewer tokens!
```

That's 8,551 tokens saved - enough for several thousand words of
actual conversation!

But, I didn't just save tokens, I made the tools easier for Claude to
use. Instead of choosing between 20 different tools, Claude now picks
from 8 logical categories and specifies what it needs via parameters.

## Why this matters? Cognitive overload

Whilst researching this, I found studies showing that LLMs struggle
with 10-20+ tools. It's not just about context - it's about cognitive
overload. When faced with too many similar options, models:

- Confuse similar tools
- Ignore tool descriptions
- Make poor choices about which tool to use
- Sometimes hallucinate tool names that don't exist

By consolidating related tools, I'm not just saving tokens - I'm
making Claude's decision-making process clearer and more reliable.

## Best practices for MCP server authors

If you're building MCP servers, here's what I learned:

**1. Consolidate related tools**

Don't create separate tools for similar operations. Use parameters
instead:

```typescript
// Bad: Multiple tools
tavily_search()
brave_search()
kagi_search()

// Good: One tool with parameters
web_search({ provider: 'tavily' })
web_search({ provider: 'brave' })
web_search({ provider: 'kagi' })
```

**2. Trim your descriptions**

One concise sentence beats a paragraph:

```typescript
// Bad
'This comprehensive tool searches across multiple web...'

// Good
'Search using provider X. Best for Y.'
```

**3. Simplify parameter descriptions**

```typescript
// Bad
'The maximum number of search results to return from the API call'

// Good
'Result limit'
```

**4. Use standard parameter names**

Consistent naming across tools helps:

- `query` not `search_term` or `q`
- `limit` not `max_results` or `count`
- `provider` not `engine` or `source`

**5. Don't hide tools - consolidate them**

Some might think the solution is to hide tools Claude doesn't need.
But that creates a different problem - how does Claude know what's
available? Better to consolidate logically related tools into one.

## Check your MCP context usage

With Claude Code 4.5 there's now a `/context` slash command that will
show context usage breakdowns.

Here's what it looks like with me enabling all the mcp tools I have
active:

```
> /context
  ⎿  Context Usage
     ⛁ ⛀ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛝ ⛝   claude-sonnet-4-5-20250929 • 143k/200k tokens (72%)
     ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝
     ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝   ⛁ System prompt: 3.1k tokens (1.5%)
     ⛝ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ System tools: 12.4k tokens (6.2%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛝ Reserved: 45.0k tokens (22.5%) [autocompact + output tokens]
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ MCP tools: 82.0k tokens (41.0%)
     ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁   ⛁ Custom agents: 584 tokens (0.3%)
     ⛁ ⛁ ⛀ ⛀ ⛀ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Memory files: 312 tokens (0.2%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Messages: 8 tokens (0.0%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛶ Free space: 12k (5.8%)
```

That's on an empty conversation. I used McPick to enable all the MCP
tools I use, so, if you look toward the end of that text block you can
see how much context is free, 5%! Lol!

Now with them all disabled except for `mcp-omnisearch` (which is
pretty much my default for every Claude Code session) I get this:

```
> /context
  ⎿  Context Usage
     ⛁ ⛀ ⛁ ⛁ ⛁ ⛁ ⛁ ⛁ ⛝ ⛝   claude-sonnet-4-5-20250929 • 67k/200k tokens (34%)
     ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝
     ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝ ⛝   ⛁ System prompt: 3.1k tokens (1.5%)
     ⛝ ⛁ ⛁ ⛁ ⛀ ⛀ ⛀ ⛶ ⛶ ⛶   ⛁ System tools: 12.4k tokens (6.2%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛝ Reserved: 45.0k tokens (22.5%) [autocompact + output tokens]
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ MCP tools: 5.7k tokens (2.8%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Custom agents: 584 tokens (0.3%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Memory files: 312 tokens (0.2%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛁ Messages: 8 tokens (0.0%)
     ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶ ⛶   ⛶ Free space: 88k (44.0%)
```

That's quite a delta there now, the majority of the tokens being taken
up here now are in the reserved section with the MCP tools taking up
3%.

So, it makes sense to be a bit more selective on what MCP tools you
use before starting a session in Claude Code.

## The McPick solution, managing what you can't optimise

Whilst I optimised `mcp-omnisearch`, not all MCP servers are ones I've
built (although I prefer to use my own tools). For third-party servers
consuming excessive context, McPick is still the answer if you want to
manage them effectively.

The workflow is simple:

1. Before starting a coding session, run `npx mcpick`
2. Enable only the MCP servers relevant to your current task
3. Work with a leaner context window
4. When done, re-enable other servers as needed

It's not perfect, but it works. And it's better than manually editing
`.claude.json` every time you want to toggle servers.

So, McPick helps with Claude Code but for other tools that use MCP
servers it makes sense to understand what MCP tool your adding to your
config. Maybe this could be a future enhancement to McPick, but it was
literally a weekend (well couple of hours on the weekend) project to
scratch my own itch.

## Side-by-side comparison

So, the reveal? Lol! Well, here's where I am now with `mcp-omnisearch`!
Let me show you the actual difference:

**Before (mcp-omnisearch)**

```json
{
  "tools": [
    {
      "name": "tavily_search",
      "description": "Search the web using Tavily Search API...",
      "parameters": { ... }
    },
    {
      "name": "brave_search",
      "description": "Privacy-focused search engine with...",
      "parameters": { ... }
    },
    // ... 18 more tools
  ]
}
```

**Token count: 14,214**

**After (mcp-omnisearch)**

```json
{
	"tools": [
		{
			"name": "web_search",
			"description": "Search using provider",
			"parameters": {
				"query": "Query",
				"provider": "tavily | brave | kagi | exa"
			}
		},
		{
			"name": "ai_search",
			"description": "AI-powered search",
			"parameters": {
				"query": "Query",
				"provider": "perplexity | kagi_fastgpt | exa_answer"
			}
		}
		// ... 6 more tools
	]
}
```

**Token count: 5,663**

The functionality is identical, but the context footprint is 60%
smaller!

## Real-world impact

Since implementing these optimisations, I've noticed:

1. **Faster initial load** - Claude Code starts conversations quicker
   with less upfront context to process
2. **Better tool selection** - Claude makes fewer mistakes about which
   tool to use
3. **More context for actual work** - Those 8,551 saved tokens now go
   towards code and conversation
4. **Easier debugging** - When Claude calls
   `web_search({ provider: "tavily" })`, it's crystal clear what's
   happening

## The future, efficient MCP servers

This experience has changed how I think about MCP server design.
Moving forward, I'll be:

- Designing with context efficiency in mind
- Consolidating related operations into single tools with parameters
- Writing minimal but clear descriptions
- Testing context consumption before releasing

## Conclusion

Optimising MCP server context usage isn't just about saving tokens -
it's about making Claude Code better for everyone. Smaller context
footprints mean:

- **Users** get more context for actual work
- **Claude** makes better decisions with fewer similar tools
- **MCP authors** create more maintainable, focused servers
- **The ecosystem** scales better as more tools are added

If you're building MCP servers, take the time to optimise them. Your
users (and Claude) will thank you!

## Want to check the sauce?

The optimised `mcp-omnisearch` code is all in the
[mcp-omnisearch repo](https://github.com/spences10/mcp-omnisearch).

The McPick tool for managing servers is at
[McPick repo](https://github.com/spences10/mcpick).

Cool! So, that's one MCP server out of
[the 13 I have made](https://github.com/spences10?tab=repositories&q=mcp-&type=source&language=&sort=)
that's now optimised. The others will be on my hitlist with this post
as a reference.

Have you optimised your own MCP servers? Found other ways to reduce
context usage? Hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev) or
[GitHub](https://github.com/spences10) - I'd love to hear what you've
learned!
