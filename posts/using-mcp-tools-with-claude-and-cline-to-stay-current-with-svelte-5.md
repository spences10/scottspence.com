---
date: 2025-01-19
title:
  Using MCP Tools with Claude and Cline to Stay Current with Svelte 5
tags: ['mcp', 'claude', 'tools', 'svelte', 'learning', 'notes']
is_private: true
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

Aight! I've been playing around with using and creating my own Model
Context Protocol (MCP) tools lately. I also talked myself into giving
a talk at the next Svelte London event to share what I've learned.
It's a bit of a stretch talking about AI tools at a Svelte meetup but,
using these sorts of tools is helping me stay current with the Svelte
5 changes. The thing is that a lot of LLM training data cut off is
after the launch of Svelte 5.

## Training data cut-off

A lot od the LLM data you find will be centred around Svelte 4. You
ask your AI assistant about the latest Svelte 5 features, and it's
like "Sorry, I was trained on data from [insert date here]." or it'll
straight up just lie to you 😅

[Stanislav Khromov](https://github.com/khromov) has done a great video
on this, explaining the gap there is and how biases in the training
data can lead to incorrect results.

<YouTube youTubeId='tprMklFzy44'/>

The approach is essentially giving all of the Svelte 5 documentation
to the LLM in a Claude project as the project data.

I was doing something similar when I was working on Svelte 5
implementations. But, now, with the MCP tooling approach I'm
essentially giving the LLM the tools it needs to get the job done.

## Cline "make me a tool"

Where I work we are all encouraged to use Cursor, it's a great tool
that really does help you get stuff done and has vastly improved the
velocity on the team. I also evaluate other tools for use, Cline being
one of them. With Cline you can say something like "hey make me a tool
to do 'x'" and it'll go off and create it! It's not perfect and it can
get pretty expensive in credits when iterating on something.

Initially I couldn't get Claude Desktop (so I gould use MCP tools with
it) to work with my WSL set up, I did work that out though, you can
check out the post on
[Getting MCP Server Working with Claude Desktop in WSL](https://scottspence.com/posts/getting-mcp-server-working-with-claude-desktop-in-wsl).

The reason I wanted to have MCP tools working with Claude Desktop is
because Cline (as I mentioned earlier) can get really expensive! So I
really wanted to be able to use the MCP tools in Claude so I wasn't
having my credits rinsed each time I used Cline in my editor.

Here's a really good video on using MCP tools with Claude:

<YouTube youTubeId='R-5ucM-5P5o'/>

There's a pinned comment detailing custom instructions for using MCP
with Claude, that instruction set got me thinking reading through it.

## MCP tools I use

You can find a the list of official and community MCP servers over on
the
[Model Context Protocol GitHub](https://github.com/modelcontextprotocol/servers).
There's also [Glama](https://glama.ai/mcp/servers) and
[Smithery](https://smithery.ai/) where you can search for MCP servers.

The tools I have configured with my Claude Desktop:

- [Brave Search](https://github.com/modelcontextprotocol/servers/blob/main/src/brave-search)
- [Sequential thinking](https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking)
- [Jina AI Reader](https://github.com/spences10/mcp-jinaai-reader)
- [Tavily Search](https://github.com/spences10/mcp-tavily-search)
- [Memory LibSQL](https://github.com/spences10/mcp-memory-libsql)

I use them with a custom prompt that I adapted from the pinned comment
on the video I mentioned earlier. You can find the prompt I use as
[a Gist over on GitHub](https://gist.github.com/spences10/2996f6f2a022d297a5f6b518facb16de)
that I copy paste into my Claude instructions and adapt for Claude
projects.

