# Blog Post Examples

## Complete Example Structure

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

## Frontmatter Template

Every post must start with:

```markdown
---
title: 'Your Post Title Here'
date: YYYY-MM-DD
published: false
---
```

**Important:** Always set `published: false` initially. Only change to
`true` when ready for publication.
