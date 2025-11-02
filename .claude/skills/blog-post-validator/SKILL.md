---
name: blog-post-validator
# prettier-ignore
description: Validate blog posts for quality, consistency, en-GB spelling, and ScottInk style. Use when reviewing posts before publication.
allowed-tools: Read, Grep, Glob
---

# Blog Post Validator

Perform comprehensive quality checks on blog posts to ensure they meet
publication standards.

## Quick Start

Validate a post by checking:

1. **Frontmatter** - Has `title`, `date`, `published: false`
2. **Structure** - Hook → Problem → Investigation → Solution → Results
3. **Voice** - First-person, conversational, British English
4. **Code** - Working examples with language identifiers
5. **Spelling** - en-GB (colour, organisation, behaviour)

## Critical Checks

### Must Have

- ✅ First-person perspective ("I did...", not "One might...")
- ✅ en-GB spelling throughout
- ✅ Code blocks with language identifiers
- ✅ H2 headings only (no H1)
- ✅ Working code examples

### Must Not Have

- ❌ Third-person narrative
- ❌ en-US spelling (color, organization)
- ❌ Corporate speak or buzzwords
- ❌ Vague conclusions

## Reporting

Provide feedback as:

**Overall:** [Pass/Needs Changes/Hold]

**Issues to Address:**

- High priority items
- Medium priority items

**Ready to Publish:** Yes/No

## References

For complete checklists and detailed guidelines:

- [Validation Checklist](references/checklist.md)
- [Common Issues](references/common-issues.md)
- [ScottInk Voice Guide](references/voice-guide.md)
