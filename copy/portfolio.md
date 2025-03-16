<script>
  import { YouTube } from 'sveltekit-embed'
  import {
    DateUpdated, 
    DateDistance,
    Small, 
    NewsletterSignup
  } from '$lib/components'
</script>

# Portfolio

<Small>
  Last updated: <DateUpdated date="2025-03-16" small="true" />
</Small>

I'm Scott, a passionate Svelte ambassador and application team lead
with <DateDistance date='2018-03-18' /> years of commercial experience
in web development. Currently, I'm an engineering lead developing an
AI-focused product built with Svelte and SvelteKit. My work spans
practical utilities, developer tools, and useless projects I've built,
just, because!

Here's some of my recent work.

## SkyKit.blue

[![SkyKit.blue screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1742143893/08e2c5fb-4213-461c-a0ea-d1c725e2908c.png)](https://skykit.blue)

A weekend project that gained significant traction - SkyKit provides
free analytics and statistics for Bluesky users. The application
offers post analytics and an inactive account finder with no
authentication required, making it super low friction for users.

**Key Features:**

- Post analytics and engagement metrics
- Following account activity tracking
- Inactive account detection

**Tech Stack:** SvelteKit, TypeScript, daisyUI

[Visit SkyKit](https://skykit.blue) |
[View Source](https://github.com/spences10/skykit)

### AudioMind

[![AudioMind](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1742151192/1a04f573-f419-4b85-93be-5878e7772a21.png)](https://github.com/spences10/audiomind)

An MP3 to AI Chat Assistant that transforms audio content into
interactive, searchable conversations. This project allows users to
upload audio files (like podcasts or lectures) and then have natural
conversations with the AI about the content.

**Key Features:**

- Audio file processing and transcription
- Vector-based semantic search
- Multiple AI response styles
- Interactive chat interface
- Real-time progress updates

**Tech Stack:** SvelteKit 2.x with Svelte 5, TailwindCSS, daisyUI,
Anthropic Claude 3, Deepgram, Voyage AI, Turso

[View Source](https://github.com/spences10/audiomind)

## Model Context Protocol (MCP) Tools Suite

I've created
[many MCP tools](https://github.com/spences10?tab=repositories&q=mcp-&type=&language=&sort=)
to enhance AI capabilities and improve developer workflows:

- **mcp-memory-libsql**: A portable database solution using SQLite in
  libSQL, designed for team collaboration and hosted on Turso
- **mcp-tavily-search**: Works alongside Brave Search to provide more
  comprehensive AI search results
- **mcp-jinaai-reader**: Optimized for extracting LLM-friendly web
  page data and documentation parsing
- **mcp-svelte-docs**: Makes Svelte documentation more accessible to
  AI systems
- **mcp-perplexity-search**: Enhanced AI search capabilities
- **mcp-omnisearch**: Essentially all the search providers you could
  want your LLM to access! Perplexity, Tavily, Kagi, Jina AI and Brave
  search!

[Explore MCP Tools](https://github.com/spences10?tab=repositories&q=mcp)

## SvelteKit Embed Package

[![SvelteKit Embed screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1742143926/35ab90e5-5d17-4c5c-bc43-d772a31cf22e.png)](https://sveltekit-embed.pages.dev/)

A popular package of SvelteKit embed components that makes it easy to
add third-party embeds like YouTube, Twitter, and more to your
SvelteKit projects.

**Key Features:**

- Responsive embeds
- Easy component-based implementation
- Support for multiple platforms

[View on GitHub](https://github.com/spences10/sveltekit-embed) |
[NPM Package](https://www.npmjs.com/package/sveltekit-embed)

## Svead

[![Svead screenshot](https://github.com/spences10/svead/raw/main/.github/svead.svg)](https://svead.pages.dev/)

Svelte + Head == Svead! A component that allows you to set head meta
information, canonical links, title tags, Twitter and Facebook Open
Graph tags, and schema.org data for SvelteKit projects.

[View on GitHub](https://github.com/spences10/svead)
[NPM Package](https://www.npmjs.com/package/svead)

## Community Involvement

- **Svelte Ambassador**: Officially recognized by the Svelte team
- **Svelte Society London**: Co-founder and organizer
- **Content Creator**: Regularly publishing posts [here](/posts) about
  Svelte, SvelteKit, and web development
- **Speaker**: Presenting at conferences and meetups about Svelte

## Technical Writing

I regularly share my knowledge through detailed blog posts here.
Recent highlights include:

- [Using MCP Tools with Claude and Cline](https://scottspence.com/posts/using-mcp-tools-with-claude-and-cline)
- [My Updated ZSH Config 2025](https://scottspence.com/posts/my-updated-zsh-config-2025)

## Get in Touch

I'm always open to collaboration opportunities, speaking engagements,
and consulting work, reach out via [contact](/contact) form. Socials
listed here:

- **GitHub**: [@spences10](https://github.com/spences10)
- **Bluesky**:
  [@scottspence.dev](https://bsky.app/profile/scottspence.dev)
- **YouTube**:
  [Scott Spence Please](https://youtube.com/scottspenceplease)

## Stay Updated

If you're interested in knowing when I publish new projects or blog
posts, you can sign up for my newsletter below.

<NewsletterSignup />
