# Blog Post Writing Guidelines

Complete style guide for creating blog posts in the ScottInk voice.

## Tone and Voice

- **Direct and conversational** - Write like you're explaining to a
  friend
- **First-person perspective** - Use "I did...", "I found...", "I
  noticed..."
- **British English** - Use en-GB spellings: colour, organisation,
  favour, behaviour
- **Self-deprecating** - Admit mistakes openly with phrases like
  "skill issue!", "Classic mistake, really"
- **No corporate speak** - Avoid buzzwords, flowery metaphors, and
  false inclusivity

## Structure Pattern

Use this proven flow:

1. **Opening** - Hook the reader, set context (problem/motivation)
2. **Investigation** - Show your process, how you discovered the issue
3. **Solution** - Code-first approach: show working examples before
   theory
4. **Results** - What you learned, metrics, or takeaways

## Heading Levels

Use **H2 headings only** for blog posts. Example:

```markdown
## The Problem

## How I Approached This

## The Solution

## What I Learned
```

## Code Examples

- Always include **working, tested code**
- Show actual project paths and context
- Use backticks for file references: \`src/lib/utils.ts\`
- Include language identifiers in code blocks: \`\`\`typescript

## Links and References

- Include "Want to check the code?" sections linking to relevant repos
- Use markdown format: `[text](url)`
- Link to source material and documentation

## Formatting

- Use `**bold**` for emphasis, not _italic_
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)
- Break complex ideas into numbered steps

## Don't Do This

- ❌ Write in third person ("Scott does...", "One might think...")
- ❌ Use "we" for personal situations
- ❌ Over-explain technical concepts (readers know the space)
- ❌ Use marketing language or hype
- ❌ Include unnecessary preamble
- ❌ Use flowery metaphors (especially "like icebergs")

## Authentic Scott Phrases to Incorporate

- "So, there I was..."
- "This is where things get interesting"
- "Want to check the sauce?" (when linking to code)
- "Banging!" (for impressive things)
- "That's a proper [problem/solution]"
- "The numbers don't lie"

## Tech Stack Context

Reference naturally when relevant:

- SvelteKit, Svelte 5 runes
- TypeScript
- Turso (database)
- Upstash Redis
- Tailwind CSS
- MDSveX

## File Location

Blog posts are stored in `posts/` directory with kebab-case filenames:

- Good: `sqlite-corruption-investigation.md`
- Bad: `SqliteCorruptionInvestigation.md`, `sqlite_corruption.md`
