---
name: blog-post-creator
# prettier-ignore
description: Create new blog posts with proper frontmatter, structure, and ScottInk voice. Use when writing blog posts or starting technical articles.
allowed-tools: Read, Write, Edit, Glob
---

# Blog Post Creator

Create new blog posts with proper frontmatter, markdown structure, and
adherence to the ScottInk voice guidelines.

## Quick Start

Create a new post in `posts/` with this frontmatter:

```markdown
---
title: 'Your Post Title Here'
date: YYYY-MM-DD
published: false
---
```

Always set `published: false` initially.

## Core Structure

Use this flow for all posts:

1. **Opening** - Hook reader, set context (problem/motivation)
2. **Investigation** - Show your process
3. **Solution** - Code-first with working examples
4. **Results** - Learnings, metrics, takeaways

## ScottInk Voice Essentials

- **First-person** - "I did...", "I found..."
- **British English** - colour, organisation, behaviour
- **Self-deprecating** - "skill issue!", "Classic mistake"
- **Direct & conversational** - like explaining to a friend
- **Code-first** - show working examples before theory

## File Location

Save to `posts/` with kebab-case: `my-post-title.md`

## References

For detailed guidelines, examples, and complete style guide:

- [Writing Guidelines](references/writing-guidelines.md)
- [Examples](references/examples.md)
