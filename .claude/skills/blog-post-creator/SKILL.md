---
name: blog-post-creator
description: Create new blog posts with proper frontmatter, structure, and ScottInk voice. Use when writing blog posts, creating new content for scottspence.com, or starting a technical article.
allowed-tools: Read, Write, Edit, Glob
---

# Blog Post Creator

Create new blog posts with proper frontmatter, markdown structure, and
adherence to the ScottInk voice guidelines.

## When to Use

- Writing new blog posts for scottspence.com
- Creating technical articles or tutorials
- Starting content that should follow the ScottInk voice
- Need guidance on post structure and formatting

## Post Structure

Every blog post must have this frontmatter at the top:

```markdown
---
title: 'Your Post Title Here'
date: YYYY-MM-DD
published: false
---
```

**Important:** Always set `published: false` initially. Only change to
`true` when ready for publication.

## Writing Guidelines

### Tone and Voice

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

### Structure Pattern

Use this proven flow:

1. **Opening** - Hook the reader, set context (problem/motivation)
2. **Investigation** - Show your process, how you discovered the issue
3. **Solution** - Code-first approach: show working examples before
   theory
4. **Results** - What you learned, metrics, or takeaways

### Heading Levels

Use **H2 headings only** for blog posts. Example:

```markdown
## The Problem

## How I Approached This

## The Solution

## What I Learned
```

### Code Examples

- Always include **working, tested code**
- Show actual project paths and context
- Use backticks for file references: \`src/lib/utils.ts\`
- Include language identifiers in code blocks: \`\`\`typescript

### Links and References

- Include "Want to check the code?" sections linking to relevant repos
- Use markdown format: `[text](url)`
- Link to source material and documentation

### Formatting

- Use `**bold**` for emphasis, not _italic_
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)
- Break complex ideas into numbered steps

## Example Structure

```markdown
---
title: 'How I Fixed SQLite Corruption in Production'
date: 2025-10-17
published: false
---

## The Problem

So, there I was at 3am when production went down...

## Investigation

I traced the issue through logs and found:

1. First symptom: database locked errors
2. Then: cascading failures
3. Root cause: improper file handling in fs.copyFile

## The Solution

Here's the fix I implemented:

\`\`\`typescript // Before (broken) fs.copyFile(source, dest, (err) =>
{ ... })

// After (working) import { copyFile } from 'fs/promises' await
copyFile(source, dest) \`\`\`

## Results

This prevented 99% of corruption issues. The numbers don't lie.

Want to check the code?
[See the full implementation](https://github.com/spences10/project)
```

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
