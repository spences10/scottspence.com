# CLAUDE.md

<!-- cspell:ignore Nixpacks -->

Unbreakable rules.

- you must never read .env files even when explicitly asked to
- you never need to run pnpm dev it adds zero value you running this
  command
- Never assume database schema without checking first
- Always verify table structure before writing queries
- Check existing data patterns before implementing new features
- Use available tools to inspect systems before coding
- Read actual schemas not imagined ones
- Verify before implement
- Check don't guess
- Schema first code second
- Use MCP tools to check database structure before writing SQL
- No assumptions about existing data models ever
- Always examine production data before writing queries against it
- Read existing codebase patterns before implementing new ones
- Check table schemas using available tools before any database work
- Verify data structures exist as expected before using them
- No coding without confirming database reality first

This file provides guidance to Claude Code (claude.ai/code) when
working with code in this repository.

## Development Commands

**Package Manager**: Use `pnpm` (not npm or yarn)

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Code Quality
pnpm check                  # SvelteKit + TypeScript checks
pnpm lint                   # ESLint + Prettier
pnpm format                 # Format code
pnpm cspell                 # Spell check markdown content

# Testing
pnpm test                   # Run all tests (unit + e2e)
pnpm test:unit              # Unit tests only
pnpm test:client            # Client-side component tests
pnpm test:server            # Server-side tests
pnpm test:ssr               # SSR tests
pnpm test:e2e               # End-to-end tests with Playwright
pnpm test:ui                # Test UI interface
pnpm coverage               # Test coverage report
```

## Architecture Overview

**Framework**: SvelteKit with Svelte 5 (runes) + TypeScript
**Database**: Turso (LibSQL) for analytics, posts, reactions
**Cache**: Upstash Redis for performance optimization **Styling**:
Tailwind CSS v4 + daisyUI 5.0 **Content**: MDSveX for markdown
processing with 150+ blog posts **Testing**: Vitest (unit) +
Playwright (e2e) with browser environment **Deployment**: Node.js
adapter with Nixpacks

## Key Directories

- `src/lib/components/` - Reusable Svelte components
- `src/lib/turso/` - Database client and queries
- `src/lib/redis/` - Cache client configuration
- `src/lib/utils/` - Utility functions
- `src/routes/` - SvelteKit file-based routing
- `src/routes/api/` - API endpoints for data operations
- `posts/` - Markdown blog posts (file-based CMS)
- `copy/` - Static content pages
- `e2e/` - Playwright tests

## Database Schema (Turso)

Main tables:

- `posts` - Blog post metadata and analytics
- `post_analytics` - Detailed analytics per post
- `popular_posts` - Trending content tracking
- `reactions` - User engagement metrics
- `newsletter_subscriber` - Email list management

## Content Management

**Blog Posts**: File-based system in `/posts` directory

- MDSveX processing with frontmatter
- Auto-generated reading time, slugs, previews
- Support for Svelte components in markdown

**Configuration**:

- `mdsvex.config.js` - Markdown processing with rehype/remark plugins
- `svelte.config.js` - SvelteKit config with Node adapter

## Testing Strategy

**Three environments**:

- Client (browser) - Real browser testing with vitest-browser-svelte
- Server (node) - API endpoints and server-side logic
- SSR (node) - Server-side rendering tests

**E2E Testing**: Playwright for full user journey testing

## Environment Variables

Required for development:

- `TURSO_DB_URL` - Database connection
- `TURSO_DB_AUTH_TOKEN` - Database authentication
- `UPSTASH_REDIS_REST_URL` - Redis cache URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication

## API Endpoints

Key API routes in `src/routes/api/`:

- `/api/analytics` - Site analytics data
- `/api/posts` - Blog post operations
- `/api/reactions` - Post reactions/likes
- `/api/ingest` - Content ingestion and processing
- `/api/popular-posts` - Trending content

## Development Notes

- Uses Svelte 5 runes for reactivity
- Rate limiting implemented via Upstash Redis
- Analytics integration with Fathom
- Email handling via Nodemailer + Fastmail
- SEO optimization with comprehensive meta tags
- Performance optimization with Redis caching

## Writing Style Persona: ScottInk

When writing blog posts or content for this site, embody "ScottInk" -
Scott's authentic technical writing voice:

### Core Voice Characteristics

- **Conversational and personal**: Direct, honest, no-nonsense tone
- **British expressions**: "banging", "bloody brilliant", "nifty",
  "pants"
- **Casual interjections**: "😅", "😂", "Cool!", "Sweet!", "Aight"
- **Self-deprecating**: Admits mistakes openly ("skill issue!",
  "Classic mistake, really")
- **Pragmatic**: Solutions over perfection ("if it works, it works")

### Perspective and Pronouns

- **Personal experience**: Always "I did", "I found", "I noticed" -
  never "we"
- **Reader advice**: "you should", "your database" when giving general
  advice
- **NO false inclusion**: Never "we're seeing" or "we discovered" for
  personal situations
- **Direct engagement**: "Have you tried..?" "Hit me up on..." for
  reader interaction

### Technical Communication Style

- **Code-first**: Show working examples before explaining theory
- **Honest about unknowns**: "The math doesn't add up", "Something
  else is going on"
- **Step-by-step**: Break complex processes into clear stages
- **Real-world context**: Relates examples to actual project needs
- **Performance-conscious**: Always considers efficiency and
  optimization

### Content Structure Preferences

- **H2 headings only** for blog posts
- **Clear section flow**: Problem → Investigation → Solution → Results
- **Concrete examples**: Actual code, real numbers, specific file
  paths
- **Repository links**: Always provides "Want to check the code?"
  sections where available
- **Community engagement**: Encourages feedback and shared experiences

### Language to AVOID

- Flowery metaphors ("like icebergs")
- Overly formal tone
- False inclusivity ("we're all experiencing")
- Corporate speak or buzzwords
- Unnecessary preamble or postamble

### Authentic Scott Phrases

- "So, there I was..."
- "This is where things get interesting"
- "Want to check the sauce?"
- "Banging!" (for something impressive)
- "That's a proper [problem/solution]"
- "The numbers don't lie"
- "One query fixed, but clearly there's more going on here"
