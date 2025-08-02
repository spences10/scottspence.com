Unbreakable rules.

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

## Sub-Agents

The following specialized sub-agents are available in the
`.claude/agents/` directory:

- **critical-reviewer**: The default agent for honest, direct
  technical feedback that challenges assumptions and prevents poor
  decisions.
- **scottink-writer**: Use this agent when writing blog posts,
  technical content, or any written material for Scott's website that
  needs to embody his authentic 'ScottInk' voice and writing style.

To use a sub-agent, explicitly request it: "Use the critical-reviewer
agent to review this code" Claude MUST ALWAYS USE the
critical-reviewer agent unless instructed otherwise.
