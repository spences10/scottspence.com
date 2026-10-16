<script>
  import { YouTube } from 'sveltekit-embed'
  import {
    DateUpdated, 
    DateDistance,
    Small, 
    NewsletterSignup
  } from '#lib/components/index.js'
</script>

<!-- cspell:ignore Sveltest my-pi nopeek omnirecall OmniRecall -->

# Portfolio

<Small>
  Last updated: <DateUpdated date="2026-10-16" small="true" />
</Small>

<!-- prettier-ignore -->
I'm Scott, a UK-based product engineer and Svelte consultant with <DateDistance date='2018-03-18' /> of commercial web development experience.
Through [OES Technology](https://oestechnology.co.uk), I take products
from prototype to production and leave codebases that coding agents
and teams can keep building on after I've gone. Client work is
private, so it's described without names.

## Reinsurance underwriting platform

April-September 2026

As lead engineer, working solo for the first two months, I took a
clickable prototype to **production in the client's private Azure
network in six weeks**, built to support roughly $20m in business:
submission intake, document extraction, rules, quoting, and audit
history.

- Built the monorepo, web app, worker, rules, database, and domain
  packages
- After handover, the team raised underwriting capacity by **more than
  130% in one week**, through underwriting rules and configuration
  alone. My architecture checks kept the change inside the layers
  built for it, and the team **kept and extended them**. A **second
  product** has since adopted them.
- The docs search I built for the agents became its own tool,
  [wiki0](#wiki0)
- Handover is a verified export: the end client gets exactly the
  application they paid for, and the agency's docs, agent skills, and
  delivery tooling stay with the agency

---

## Claims platform for deposit-replacement insurance

August-September 2026

A letting agent files a damage claim, the tenant responds item by
item, and an adjuster decides what's paid. I took it **from spec to
production in about five weeks**, on a live platform I'd maintained
since March.

- Mobile-only video evidence that won't record without a **location
  fix accurate to 250 metres**; the adjuster sees whether each video
  was **filmed at the property**
- Every video is transcribed, so the adjuster can read along while
  reviewing
- Tenants accept or dispute each item with their own evidence; the
  adjuster can request information, approve, part-approve, or decline

---

## Quoting and binding platform for an insurer

March-June 2026

A commercial trucking insurance platform where agents build quotes
through a wizard and underwriters manage the policies. I rebuilt its
foundations and set up its infrastructure.

- Moved off Prisma to plain PostgreSQL with versioned SQL migrations
  and Valibot-validated remote functions
- Replaced Auth.js, which has been sunset, with Better Auth
- Set up their AWS with Terraform: **staging and production** on ECS
  with a deploy pipeline to both, DNS and certificates for their
  domain, and SES for email

---

## Mobile sign-up platform for a telecoms reseller

June-September 2026

Speed was the brief. I turned a click-through prototype into a **live
production app in under two weeks**, and it has **taken real customer
orders since July**.

- Hardened it after launch with **more than 120 tests** and **no known
  dependency vulnerabilities**

---

## AI customer-service agents

September 2023-February 2026

I led 12 developers across two product teams at XtendOps.

- Built the agent runtime that **reduced average handle time by 40%**
  through skill-based routing across chat, email, and SMS
- Led the Svelte 5 migration off a shared Svelte 4 component package,
  so **four applications could ship independently**
- The consistent Svelte 5 patterns gave Claude Code the right examples
  to follow, so old habits stopped creeping back into new code
- Built [Sveltest](#sveltest) to give the team, and their coding
  agents, testing patterns they could trust

---

## my-pi

[![my-pi package preview](https://raw.githubusercontent.com/spences10/my-pi/main/assets/pi-package-preview.png)](https://my-pi.dev)

[my-pi](https://my-pi.dev) is my curated Pi distribution: a
ready-to-run coding agent CLI with MCP, LSP, skills, recall,
redaction, telemetry, team mode, and prompt presets.

I used it to build every client project on this page. When a client
task needed something my agent couldn't do yet, I built that feature
into my-pi first.

**Key Features:**

- Pi-native CLI with interactive TUI, print mode, JSON mode, RPC mode,
  and a programmable runtime
- Project-aware MCP tools and skills, scoped per repo so noisy or
  sensitive tools only load where they belong
- LSP-backed diagnostics, hover, definitions, references, and document
  symbols
- Local SQLite context sidecar, telemetry, evals, recall, and live
  observability
- Secret safety through output redaction and
  [nopeek](https://github.com/spences10/nopeek) reminders
- Team mode for local RPC teammate orchestration with tasks and
  mailboxes

**Tech Stack:** TypeScript, Pi, SQLite, MCP, LSP, pnpm

[Visit my-pi](https://my-pi.dev) |
[View Source](https://github.com/spences10/my-pi) |
[Read the write-up](/posts/building-my-pi-claude-code-alternative-with-pi)

---

## wiki0

[![wiki0 share card](https://wiki0.app/og/home.png)](https://wiki0.app)

[wiki0](https://wiki0.app) is docs search for your coding agent. It
indexes the Markdown already in a repo (plus PDF, DOCX, and TXT if you
include them) into SQLite full-text search and returns the right
section with a `path:start-end` citation, so agents read the part they
need instead of whole documents. It never calls an LLM and never
rewrites your files.

It grew out of the docs search I built for the
[reinsurance platform](#reinsurance-underwriting-platform).

**Key Features:**

- Ranks current, authoritative docs first; superseded docs rank low
  and point to their replacement
- One cited section per document, readable with `wiki0 show`
- Link and anchor linting for broken docs
- A local docs browser with rendered docs, search, and index health
- An MCP server (`@wiki0/mcp`) that gives agents the same operations
  as tools

**Tech Stack:** TypeScript, node:sqlite, SQLite FTS5, MCP, SvelteKit

[Visit wiki0](https://wiki0.app) |
[View Source](https://github.com/spences10/wiki0) |
[Read the write-up](/posts/give-coding-agents-your-project-docs-with-node-sqlite-and-fts5)

---

## omnirecall

[![omnirecall package preview](https://raw.githubusercontent.com/spences10/omnirecall/main/assets/omnirecall-package-preview.png)](https://github.com/spences10/omnirecall)

[omnirecall](https://github.com/spences10/omnirecall) finds answers in
your past coding conversations, even when they happened in a different
agent. It searches Pi, Codex, Claude Code, and OpenCode session
histories from one local archive, so you can recover a decision, find
a command that worked, or give your current agent the context to pick
up earlier work.

**Key Features:**

- One search across agents, without remembering which one you used
- Read the conversation around a match and the original tool output
- Imported history stays searchable after its source files are gone
- Runs on your machine, with no account or hosted service
- Ask your agent to run it with `pnpx omnirecall`, or install the
  desktop plugin

[View Source](https://github.com/spences10/omnirecall) |
[Read the write-up](/posts/omnirecall-search-claude-code-codex-and-pi-sessions)

---

## Svortie

[![Svortie dashboard screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1773531238/scottspence.com/svortie-dash.png)](https://svortie.com)

At XtendOps, building an agent meant assembling it by hand in a clunky
builder. Svortie is my answer to that: you ask for what you want, by
typing or speaking, and the platform decides which agents, workflow,
and schedule to build for you.

I built the whole product myself: auth, billing, sandboxing, and
multi-provider AI.

**Key Features:**

- Describe what you need and Svortie builds the agents, workflow, and
  schedule
- Runs on Anthropic and OpenAI-compatible models, and provider
  credentials never enter the sandbox
- Each run is isolated in a Daytona sandbox, with live log streaming
- Credits charged from each run's actual cost, through Polar

**Tech Stack:** SvelteKit 3, Svelte 5, TypeScript, node:sqlite,
Tailwind CSS, shadcn-svelte, Better Auth, Daytona, Polar, valibot

[Visit Svortie](https://svortie.com)

---

## Sveltest

[![sveltest.dev screenshot](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1749636807/scottspence.com/8502f304-39bc-43d4-9819-6d0d12542b66.png)](https://sveltest.dev)

I built Sveltest for the team at XtendOps while we worked out our
testing story. Tests written by LLMs at the time weren't very good, so
the team and their coding agents needed working examples to follow
rather than plausible-looking tests that didn't prove much. It started
alongside my post on
[migrating from @testing-library/svelte to vitest-browser-svelte](/posts/migrating-from-testing-library-svelte-to-vitest-browser-svelte),
and it's now a public testing resource for the wider Svelte community.

**Key Features:**

- Testing documentation and working examples using
  vitest-browser-svelte in a real browser
- A shared testing skill for coding agents, plus a `pnpx sveltest` CLI
  that works with any AI assistant
- Minimal mocking: shared validation logic, real FormData and Request
  objects, and TypeScript contracts
- Patterns taken from production Svelte 5 apps

**Tech Stack:** SvelteKit, TypeScript, Vitest, vitest-browser-svelte,
Playwright, TailwindCSS, daisyUI

[Visit Sveltest](https://sveltest.dev) |
[View Source](https://github.com/spences10/sveltest)

---

## Model Context Protocol tools

I've built 21 MCP servers and tools since January 2025. On 25
September 2026 they had more than 1,400 GitHub stars, 260 forks, and
11,000 npm downloads a month. The numbers change, so the [repository
list] is the source of truth.

Most were experiments, or tools to fill a gap that models and agent
clients have since closed. Two are still in daily use:

- **Omnisearch** provides one interface for web search, AI answers,
  and content extraction across several providers.
  [View the repository](https://github.com/spences10/mcp-omnisearch).
- **SQLite Tools** separates read-only, write, schema, and transaction
  operations for safer SQLite access.
  [View the repository](https://github.com/spences10/mcp-sqlite-tools).

[I wrote up why those two stuck](/posts/i-built-21-mcp-tools-and-still-use-2).

To manage them, [MCPick](https://github.com/spences10/mcpick) keeps
MCP servers and skills in one configuration that works across
coding-agent clients.

[Explore all MCP repositories](https://github.com/spences10?tab=repositories&q=mcp)

[repository list]: https://github.com/spences10?tab=repositories&q=mcp

---

## SvelteKit Embed

[![SvelteKit Embed screenshot](https://sveltekit-embed.pages.dev/og/home.png)](https://sveltekit-embed.pages.dev/)

21 components for embedding media in Svelte sites without pasting
iframes around: YouTube, Vimeo, Spotify, Bluesky, Threads, CodePen,
StackBlitz, and more. Give a component an ID or a link and it handles
the rest. I started it in 2021, and it has around 6,800 npm downloads
a month.

**Key Features:**

- Embeds load as they get close to the viewport
- Works in Markdown with mdsvex
- Responsive by default

[View the docs](https://sveltekit-embed.pages.dev/) |
[View on GitHub](https://github.com/spences10/sveltekit-embed) |
[NPM Package](https://www.npmjs.com/package/sveltekit-embed)

---

## Svead

[![Svead screenshot](https://svead.pages.dev/og/home.png)](https://svead.pages.dev/)

Svead is used on Ashley Furniture's home page.

Svelte + Head = Svead. Every page needs the same set of head tags:
title, description, canonical link, Open Graph, and Twitter card. Miss
one and a shared link shows up as a bare URL. Svead is two components:

- **Head** takes one config object and writes the lot
- **SchemaOrg** adds typed structured data for articles, products,
  FAQs, events, breadcrumbs, and more, so a schema mistake fails at
  build time instead of weeks later in search results

I've maintained it since 2022, and it's now on Svelte 5.

[View the docs](https://svead.pages.dev/) |
[View on GitHub](https://github.com/spences10/svead) |
[NPM Package](https://www.npmjs.com/package/svead)

---

## Analytics for this site

This site runs its own analytics rather than a third-party script. The
[stats page](/stats) shows live visitors, referrers, and historical
trends, and a nightly rollup separates people from bots.

Splitting traffic by browser version showed that roughly half my
visitors were software: visitors on months-old Chrome or Firefox
mostly arrived with no referrer, while those on current browsers
mostly came from search or a link.

**Tech Stack:** SvelteKit, SQLite, LayerChart

[View the stats](/stats)

---

## Community involvement

- **Svelte Ambassador**: recognised by the Svelte team
- **Svelte Society London**: co-founder and co-organiser
- **Technical writing**: more than 240 public engineering articles
- **Speaking**: conference talks, workshops, podcasts, and community
  events about AI engineering, coding agents, Svelte, and SvelteKit

---

## Technical writing

I publish first-hand engineering guides rather than product summaries.
Current highlights include:

- [What happened to my coding agent guardrails after I left](/posts/what-happened-to-my-coding-agent-guardrails-after-i-left)
- [Revisiting LSP in Claude Code](/posts/revisiting-lsp-in-claude-code)
- [Give coding agents your project docs with node:sqlite and FTS5](/posts/give-coding-agents-your-project-docs-with-node-sqlite-and-fts5)
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
