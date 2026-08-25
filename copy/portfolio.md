<script>
  import { YouTube } from 'sveltekit-embed'
  import {
    DateUpdated, 
    DateDistance,
    Small, 
    NewsletterSignup
  } from '#lib/components/index.js'
</script>

<!-- cspell:ignore Sveltest my-pi nopeek -->

# Portfolio

<Small>
  Last updated: <DateUpdated date="2026-08-25" small="true" />
</Small>

<!-- prettier-ignore -->
I'm Scott, a UK-based product engineer and Svelte consultant with <DateDistance date='2018-03-18' /> of commercial web development experience.
I build production AI systems, coding-agent infrastructure, MCP tools,
SvelteKit products, and open-source developer tooling through
[OES Technology](https://oestechnology.co.uk).

This is selected work rather than every repository I've ever pushed.
Each project shows the problem, the useful parts, and where you can
inspect the source or product.

## my-pi

[![my-pi package preview](https://raw.githubusercontent.com/spences10/my-pi/main/assets/pi-package-preview.png)](https://github.com/spences10/my-pi)

[my-pi](https://github.com/spences10/my-pi) is my curated Pi
distribution: a ready-to-run coding agent CLI with MCP, LSP, skills,
recall, redaction, telemetry, team mode, prompt presets, and the bits
I want wired in when I work in a terminal.

**Key Features:**

- Pi-native CLI with interactive TUI, print mode, JSON mode, RPC mode,
  and a programmable runtime
- Project-aware MCP tools and skills, scoped per repo so noisy or
  sensitive tools only load where they belong
- LSP-backed diagnostics, hover, definitions, references, and document
  symbols
- Local SQLite context sidecar, telemetry, evals, recall, and live
  observability
- Secret safety through output redaction and `nopeek` reminders
- Team mode for local RPC teammate orchestration with tasks and
  mailboxes

**Tech Stack:** TypeScript, Pi, SQLite, MCP, LSP, pnpm

[View Source](https://github.com/spences10/my-pi) |
[Read the write-up](/posts/building-my-pi-claude-code-alternative-with-pi)

---

## Svortie

[![Svortie dashboard screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1773531238/scottspence.com/svortie-dash.png)](https://svortie.com)

An agent orchestration dashboard for defining Claude agents, deploying
them into sandboxed environments, and monitoring execution in
real-time. Svortie lets you manage the full lifecycle of AI agents
from configuration through to live log streaming, all from a single
interface.

**Key Features:**

- "Create with AI": describe what you need in natural language (via
  Deepgram) and Svortie figures out whether to build an agent,
  workflow, schedule, or a combination of all three
- Agent management with system prompts, tasks, model selection, and
  MCP server configuration
- Visual workflow builder for multi-step sequential agent execution
- Real-time execution monitoring with live log streaming
- Sandboxed environments via Daytona SDK for isolated agent runs
- Usage-based billing with credit packs via Polar
- Authentication with email/password and GitHub OAuth

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, SQLite, Tailwind CSS,
shadcn-svelte, Better Auth, Claude Agent SDK, Daytona, Deepgram, Bun

[Visit Svortie](https://svortie.com)

---

## Devhub CRM

[![devhub.party screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1761763547/545b587f-6f2d-44f3-832a-620286903029.png)](https://devhub.party)

A developer-first relationship management platform that solves the
core problem developers face with traditional CRMs: they hate manual
data entry and generic tools don't fit their unique workflow. Built
from the ground up for how developers actually manage relationships -
through GitHub, conferences, and open source communities.

**Key Features:**

- GitHub Quick Connect for seamless contact import from your
  development network
- Core CRM functionality including contacts, interactions, follow-ups,
  and notes
- Relationship health scoring to track connection strength
- Public developer profiles with QR codes for easy networking at
  conferences

**Impact:**

Designed specifically for conference networking, open source
maintainers, developer advocates, and freelancers who need to manage
developer relationships without the overhead of traditional CRMs.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, SQLite, sqlite-vec,
Tailwind CSS, daisyUI, Better Auth

[Visit Devhub](https://devhub.party) |
[View Source](https://github.com/spences10/devhub-crm)

---

## Sveltest

[![sveltest.dev screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1749636807/scottspence.com/8502f304-39bc-43d4-9819-6d0d12542b66.png)](https://sveltest.dev)

A weekend project that evolved into a comprehensive testing resource
for the Svelte ecosystem, now influencing how modern Svelte
applications approach testing in real browser environments. Originally
created as a companion to my blog post about
[Migrating from @testing-library/svelte to vitest-browser-svelte](https://scottspence.com/posts/migrating-from-testing-library-svelte-to-vitest-browser-svelte),
Sveltest has become a community-driven resource built by developers,
for developers.

**Key Features:**

- Comprehensive testing documentation and real-world examples using
  vitest-browser-svelte
- Pre-configured AI assistant rules for Cursor and Windsurf that
  enforce testing best practices automatically
- Multi-layer testing approach with minimal mocking - shared
  validation logic, real FormData/Request objects, and TypeScript
  contracts
- Lots, and I mean lots of testing scenarios
- Battle-tested patterns from production environments using
  bleeding-edge Svelte 5 and vitest-browser-svelte

**Why it exists:**

Svelte testing guidance was spread across documentation, examples, and
rapidly changing package APIs. Sveltest puts working browser-mode
examples and reusable assistant rules in one public project so teams
can inspect and adapt the patterns rather than copy an unverified
snippet.

**Tech Stack:** SvelteKit, TypeScript, Vitest, vitest-browser-svelte,
Playwright, TailwindCSS, daisyUI

[Visit Sveltest](https://sveltest.dev) |
[View Source](https://github.com/spences10/sveltest)

---

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

---

## AudioMind

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

---

## Model Context Protocol tools

I've published 20 MCP repositories. Together they had more than 1,300
GitHub stars on 25 August 2026. The number changes, so the [repository
list] is the source of truth.

- **Sequential Thinking Tools** recommends useful tools while an agent
  works through a problem.
  [View the repository](https://github.com/spences10/mcp-sequentialthinking-tools).
- **Omnisearch** provides one interface for web search, AI answers,
  and content extraction across several providers.
  [View the repository](https://github.com/spences10/mcp-omnisearch).
- **SQLite Tools** separates read-only, write, schema, and transaction
  operations for safer SQLite access.
  [View the repository](https://github.com/spences10/mcp-sqlite-tools).
- **Svelte Docs** gives coding agents focused access to current Svelte
  documentation.
  [View the repository](https://github.com/spences10/mcp-svelte-docs).
- **Memory for libSQL** provides persistent knowledge and vector
  search with SQLite and libSQL.
  [View the repository](https://github.com/spences10/mcp-memory-libsql).
- **McPick** manages MCP servers and skills across coding-agent
  clients. [View the repository](https://github.com/spences10/mcpick).

[Explore all MCP repositories](https://github.com/spences10?tab=repositories&q=mcp)

[repository list]: https://github.com/spences10?tab=repositories&q=mcp

---

## SvelteKit Embed

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

---

## Svead

[![Svead screenshot](https://github.com/spences10/svead/raw/main/.github/svead.svg)](https://svead.pages.dev/)

Svelte + Head == Svead! A component that allows you to set head meta
information, canonical links, title tags, Twitter and Facebook Open
Graph tags, and schema.org data for SvelteKit projects.

[View on GitHub](https://github.com/spences10/svead)
[NPM Package](https://www.npmjs.com/package/svead)

---

## Community involvement

- **Svelte Ambassador**: recognised by the Svelte team;
- **Svelte Society London**: co-founder and co-organiser;
- **Technical writing**: more than 240 public engineering articles;
- **Speaking**: conference talks, workshops, podcasts, and community
  events about AI engineering, coding agents, Svelte, and SvelteKit.

---

## Technical writing

I publish first-hand engineering guides rather than product summaries.
Current highlights include:

- [Coding agent harnesses with my-pi](/posts/coding-agent-harnesses-my-pi)
- [How I stop LLMs drifting in production codebases](/posts/how-i-stop-llms-drifting-in-production-codebases)
- [Building and testing MCP tools locally](/posts/building-and-testing-mcp-tools-locally)
- [Hardening redaction in my-pi with evals and telemetry](/posts/hardening-redaction-in-my-pi)

---

## Get in Touch

For product engineering, coding-agent infrastructure, Svelte
consulting, workshops, or speaking, use the [contact](/contact) form.
My main public profiles are:

- **GitHub**: [@spences10](https://github.com/spences10)
- **Bluesky**:
  [@scottspence.dev](https://bsky.app/profile/scottspence.dev)
- **YouTube**:
  [Scott Spence Please](https://youtube.com/scottspenceplease)

---

## Stay Updated

If you're interested in knowing when I publish new projects or blog
posts, you can sign up for my newsletter below.

<NewsletterSignup />
