---
date: 2025-04-14
title: MCP Tools Usage Guide
tags: ['mcp', 'tools', 'reference']
is_private: false
---

<script>
  import { DateDistance } from '$lib/components'
</script>

So, since the Model Context Protocol (MCP) was announced at the end of
November 2024 I immediately saw the potential that this could offer
me. Me being a person that likes to gather information to add to an
LLMs context before doing anything. When Cline
[released v2.2.0](https://github.com/cline/cline/releases/tag/v2.2.0)
was when I
[started making my own tools!](https://github.com/spences10?tab=repositories&q=mcp-&type=source&language=&sort=)
if you take a look at the tools on my GitHub profile you'll notice a
lot of them are for search in some form or another.

The reason for this? As stated before, is to load up an LLM with
context on a task before taking action. For this post I'm not going to
get stuck into the details on why it's a good practice to do this,
but, a great example of why you would want to do this is if you're
"vibe coding" something and you want to use Tailwind. Tailwind v4 was
released at the end of January 2025, there's no LLM that has any of
that information in it's knowledge right now. Also LLM training biases
mean that LLMs will always favour what is already available to it.

This means a "make my SaaS using Tailwind" would result in Tailwind v4
being installed and then nothing would work because the LLM goes and
implements Tailwind v3 config and therein lies the issue.

So, with a total of <DateDistance date='2024-12-12' /> of working with
and creating MCP tools, I'm now, according to the internet hype engine
an expert! 😂

Ok, so, with that rather large pre-amble done, what I want to detail
is what MCP tools you should use and why.

## I can spin up a browser with Claude? What?

Yes, there's MCP tools like Puppeteer and Playwright that you can
install and navigate to a site to parse information from. The thing is
when you _just_ need to get that information into context there can be
a bit of a wait, watching the browser spin up and then seeing it
navigate around a site is novel at first but tedious each consecutive
time you need to gather information.

From my point of view (and experience) the best way to get information
from the web into your LLM of choice is using a search API provider.

While browser automation tools like Puppeteer or Playwright are
powerful, they're often not the best choice for simple information
gathering. Here's why:

- Resource intensive - spins up a sandboxed browser instance
- Slower iteration cycles - waiting for page loads and rendering
- Higher latency - needs to parse and process DOM elements
- Potential for hallucinations - especially with vague queries

## Better alternatives for information gathering

Instead of browser-based tools, prefer these more efficient options:

1. **Official MCP Fetch Tool**

   - Optimized for text-based content
   - Returns LLM-friendly formats (text/markdown/json)
   - Faster response times
   - More reliable results

2. **Search API Providers**
   - No browser overhead
   - Direct access to indexed content
   - Structured response formats
   - Better query understanding

## Consolidating search providers with `mcp-omnisearch`

Rather than running multiple MCP servers for different search
providers, I created
[mcp-omnisearch](https://github.com/spences10/mcp-omnisearch) to
consolidate them all:

- Brave Search
- Perplexity
- Tavily
- Kagi (invite only)
- Jina AI
- Firecrawl

Benefits of this means:

1. **Single Configuration**

   - One config file
   - Simpler setup

2. **Flexible API Usage**

   - Use any provider you have keys for
   - Mix and match capabilities
   - Easy to add new providers via API keys

3. **Resource Efficiency**
   - Single process
   - Shared resources
   - Lower memory footprint

You don't need to use it! The whole reason I made it was so that I
wasn't sharing my API keys with random code from the internet! Make
your own or use a trusted source. I made this to scratch an itch.

## Conclusion

LLMs will often try palm you off with their base knowledge or guess
the information you're looking for. Don't stand for it! 😂 Make sure
they gather the context needed.
