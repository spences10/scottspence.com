---
name: content-linter
# prettier-ignore
description: Lint content for spelling errors, en-GB compliance, and writing quality. Use when checking markdown files before publication.
allowed-tools: Read, Bash, Grep
---

# Content Linter

Comprehensive content checking for spelling, language consistency, and
writing quality.

## Quick Start

Run the project's spell checker:

```bash
npm run cspell
```

For specific files:

```bash
npx cspell 'posts/*.md' --config cspell.json
```

## Key Checks

1. **Spelling** - Run cspell on markdown files
2. **en-GB** - Verify British spellings (colour, organisation)
3. **Vague language** - Flag "very", "really", "quite"
4. **Code blocks** - Ensure language identifiers present

## Quick Grep Checks

```bash
# Find American spellings
grep -rE "\b(color|organization|behavior)\b" posts/

# Find vague language
grep -rE "\b(very|really|quite|basically)\b" posts/

# Find code blocks without language
grep -E "^\`\`\`$" posts/
```

## References

For detailed commands, full spelling tables, and workflows:

- [Commands Reference](references/commands.md)
- [Spelling Guide](references/spelling-guide.md)
- [Quality Checks](references/quality-checks.md)
