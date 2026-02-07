Unbreakable rules.

<!-- cspell:ignore scottink -->

- NEVER read, write, or access .env files - this is a critical
  security violation
- NEVER assume API details, endpoints, or implementations - always
  research first
- en-GB spellings, not en-US (e.g. "behaviour" not "behavior")
- Don't over engineer simple solutions
- Snake case for variables and functions
- Kebab case for file names
- Always prefer editing existing files over creating new ones
- Focus on user-facing functionality over implementation details
- Performance and accessibility are non-negotiable
- Test critical user journeys, not implementation details
- Use established patterns and components over custom solutions

## Agents and Teams

Prefer team mode over sub-agents for multi-step work. Sub-agents
ignore instructions, lack project context, and can't coordinate. Use
team mode with delegate mode for orchestration tasks.

Sub-agents are acceptable for single focused lookups (search, fetch,
summarise) where context isolation doesn't matter.

Do NOT use `.claude/agents/` sub-agents unless explicitly requested.
They exist as references but are not the default workflow.
