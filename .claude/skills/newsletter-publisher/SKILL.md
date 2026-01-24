---
name: newsletter-publisher
# prettier-ignore
description: Prepare newsletters for publication by validating format, structure, frontmatter, and content. Use when reviewing drafts before sending.
allowed-tools: Read, Edit, Glob
---

# Newsletter Publisher

Validate and prepare newsletters for publication to ensure consistency
and readiness.

## Quick Start

Check newsletter draft for:

1. **Frontmatter** - Title format, date, published field
2. **Structure** - Opening → Highlights → Deep Dives → Closing
3. **Voice** - First-person, conversational, en-GB
4. **Links** - No links in headings (causes nested `<a>` tags)

## Critical Checks

### Must Have

- ✅ Title format: "[Playful Title] - [Month Year]"
- ✅ H2 headings only (no H1 or H3)
- ✅ First-person voice
- ✅ en-GB spelling throughout
- ✅ Links in paragraph text, NOT in headings
- ✅ Under 600 words - newsletter should be scannable

### Structure

- Opening prose (no heading)
- Highlights section
- Technical Deep Dives
- Brief closing (no heading)

## Common Issues

**Red Flag:** Links in headings - causes nested `<a>` tags in HTML
**Fix:** Use plain heading + link in paragraph below

## References

For complete checklist and detailed guidelines:

- [Pre-Publication Checklist](references/checklist.md)
- [Format Guide](references/format-guide.md)
