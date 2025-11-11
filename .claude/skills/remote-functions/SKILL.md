---
name: remote-functions
# IMPORTANT: Keep description on ONE line for Claude Code compatibility
# prettier-ignore
description: Use when building, auditing, or reviewing SvelteKit remote functions for validation, batching, and optimistic UI patterns
allowed-tools: Read, Write, Edit, Glob
---

# Remote Functions

## Quick Start

```ts
/// file: src/routes/counter/count.remote.ts
import * as v from 'valibot'
import { query, command } from '$app/server'

let count = 0

export const getCount = query(async () => count)

export const increment = command(
	v.object({ delta: v.optional(v.number(), 1) }),
	async ({ delta = 1 }) => {
		count += delta
		getCount().set(count) // keep cached query in sync without extra fetch
	},
)
```

Trigger optimistic single-flight updates via
`increment({ delta: 1 }).updates(getCount().withOverride((n = 0) => n + 1))`
inside the component.

## Core Principles

- Validate every argument with a Standard Schema; use
  `getRequestEvent` for auth/cookies but never treat
  `route/params/url` as an authorization boundary.
- Queries are cached promises — refresh, `set`, or `withOverride` them
  explicitly from commands/forms to prevent stale UI and redundant
  roundtrips.

## Common Patterns

### Single-flight optimistic mutations

Pair a `command`/`form` with its sibling `query`: perform the
mutation, then call `query.refresh()`/`set()` or
`.updates(query.withOverride(...))` so the UI updates once per
request, even with high latency.

## Reference Files

For detailed documentation, see:

- [references/remote-functions-overview.md](references/remote-functions-overview.md)
- [references/remote-functions-demos.md](references/remote-functions-demos.md)

## Notes

- Prefer `form` for progressive enhancement; reserve `command` for
  imperative or cross-component workflows.
- Use `query.batch` for n+1 scenarios (e.g., weather demo) and
  `prerender({ inputs, dynamic })` for data that should be cached at
  build time yet remain opt-in for runtime refreshes.

<!--
PROGRESSIVE DISCLOSURE GUIDELINES:
- Keep this file ~50 lines total (max ~150 lines)
- Use 1-2 code blocks only (recommend 1)
- Keep description <200 chars for Level 1 efficiency
- Move detailed docs to references/ for Level 3 loading
- This is Level 2 - quick reference ONLY, not a manual

LLM WORKFLOW (when editing this file):
1. Write/edit SKILL.md
2. Format (if formatter available)
3. Run: claude-skills-cli validate <path>
4. If multi-line description warning: run claude-skills-cli doctor <path>
5. Validate again to confirm
-->
