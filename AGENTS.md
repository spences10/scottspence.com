# Agent instructions

## Rules

- Research APIs, endpoints, and implementations before changing code
  that depends on them.
- Use en-GB spelling in prose and user-facing copy.
- Do not over-engineer simple solutions.
- Follow existing local naming conventions rather than forcing a
  global style.
- Use Vite+ for the toolchain. Keep Vite, Vitest, browser providers,
  and coverage packages aligned with its bundled versions.
- Prefer editing existing files over creating new ones.
- Focus on user-facing functionality over implementation details.
- Performance and accessibility are non-negotiable.
- Test critical user journeys, not implementation details.
- Use established patterns and components over custom solutions.
- Run relevant tests and `pnpm lint` after changes. Report failures
  and validation gaps; do not weaken checks to get a green result.

Keep these instructions limited to durable, non-obvious decisions.
Discover commands, dependencies, configuration, and file layout from
source files. Put specialised guidance in the narrowest applicable
folder.

## Coordination

Use coordinated teammate/worktree workflows for genuinely parallel or
multi-step work. Avoid isolated sub-agents unless the task is a single
focused lookup where project context does not matter.
