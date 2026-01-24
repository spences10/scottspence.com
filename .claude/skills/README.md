# Claude Skills for scottspence.com

Custom Skills designed to enhance your workflow on this project. These
Skills are automatically loaded by Claude Code when relevant to your
task.

## Available Skills

### 1. blog-post-creator

Create new blog posts with proper frontmatter, structure, and
adherence to the ScottInk voice.

**Use when:**

- Writing a new blog post
- Creating technical articles or tutorials
- Need guidance on post structure and the ScottInk voice

**What it does:**

- Provides frontmatter template with required fields
- Explains the writing structure (Problem → Investigation → Solution →
  Results)
- Enforces ScottInk voice guidelines
- Ensures code-first approach with examples
- Guides heading usage and formatting

**Location:** `.claude/skills/blog-post-creator/SKILL.md`

---

### 2. blog-post-validator

Validate blog posts for quality, consistency, en-GB spelling, and
adherence to ScottInk style before publication.

**Use when:**

- Reviewing a blog post before publication
- Checking consistency with ScottInk voice
- Validating structure and formatting
- Verifying en-GB spelling
- Confirming code examples are correct

**What it does:**

- Provides comprehensive validation checklist
- Checks frontmatter, structure, and headings
- Verifies voice consistency and tone
- Flags common issues and red flags
- Validates code examples and links
- Checks en-GB spelling compliance

**Location:** `.claude/skills/blog-post-validator/SKILL.md`

---

### 3. newsletter-publisher

Prepare newsletters for publication by validating format, structure,
frontmatter, and content.

**Use when:**

- Reviewing newsletter drafts before sending
- Validating newsletter format and structure
- Preparing frontmatter for publication
- Checking newsletter content quality

**What it does:**

- Validates newsletter frontmatter (title, date, published flag)
- Checks structure (Opening, Highlights, Deep Dives, Open Source,
  Closing)
- Verifies content quality and scannability
- Checks link formatting and validity
- Ensures en-GB spelling throughout
- Confirms ready-to-publish status

**Location:** `.claude/skills/newsletter-publisher/SKILL.md`

---

### 5. content-linter

Comprehensive content checking for spelling errors, en-GB compliance,
and writing quality.

**Use when:**

- Checking spelling across markdown files
- Verifying en-GB spelling compliance
- Identifying writing quality issues
- Batch checking before publication
- Need to run project's cspell tool

**What it does:**

- Explains how to use project's built-in cspell tool
- Provides en-GB spelling reference
- Identifies vague language patterns
- Guides writing quality checks
- Includes link validation approaches
- Provides batch linting commands

**Location:** `.claude/skills/content-linter/SKILL.md`

---

## How Skills Work

Skills are **model-invoked**, meaning Claude automatically uses them
based on:

1. Your request/task description
2. The Skill's name and description
3. Whether the Skill applies to what you're doing

**You don't need to manually invoke them** - just ask Claude to help
with:

- "Write a blog post about..."
- "Check this blog post before publishing"
- "Prepare the newsletter for sending"
- "Check spelling in this content"

Claude will automatically load the relevant Skill(s).

## Sharing with Your Team

All Skills are stored in `.claude/skills/` and shared via git. When
teammates pull the latest changes, they'll automatically have access
to these Skills in their Claude Code environment.

## Structure

Each Skill follows this structure:

```
.claude/skills/
├── blog-post-creator/
│   └── SKILL.md
├── blog-post-validator/
│   └── SKILL.md
├── newsletter-publisher/
│   └── SKILL.md
├── content-linter/
│   └── SKILL.md
└── README.md (this file)
```

## Key Features

### Token Efficiency

Skills only load their full details when needed. Brief descriptions
are scanned upfront (costs just a few dozen tokens), then detailed
content loads only when relevant.

### Composability

Multiple Skills can work together. For example:

- Write a blog post with **blog-post-creator**
- Validate with **blog-post-validator**
- Lint with **content-linter**

### Tool Restrictions

Each Skill declares which tools it can use, keeping Claude's
capabilities scoped to what's needed:

- **blog-post-creator**: Read, Write, Edit, Glob
- **blog-post-validator**: Read, Grep, Glob (no write)
- **newsletter-publisher**: Read, Edit, Glob
- **content-linter**: Read, Bash, Grep

## Examples

### Creating a Blog Post

```
You: "I want to write a blog post about optimising database queries in SvelteKit"

Claude: [Automatically loads blog-post-creator Skill]
Claude: "I'll help you create this blog post following the ScottInk style..."
```

### Publishing a Newsletter

```
You: "Check if this newsletter draft is ready to send"

Claude: [Automatically loads newsletter-publisher Skill]
Claude: "Let me validate the newsletter structure and content..."
```

### Quality Checks

```
You: "Validate this blog post for spelling and ScottInk consistency"

Claude: [Automatically loads blog-post-validator and content-linter Skills]
Claude: "I'll check the formatting, spelling, and voice consistency..."
```

## Future Enhancements

Potential Skills to add:

- SEO optimizer (meta descriptions, keywords, headings)
- Social media previews generator
- Performance auditor (Lighthouse scores for posts)
- Analytics summarizer

## Notes

- Skills are read-only by default (no accidental overwrites)
- Each Skill has focused scope (one capability per Skill)
- Descriptions are specific to help Claude discover when to use them
- Tool restrictions prevent unintended actions

## Related

- **Agents**: `.claude/agents/` - Sub-agents for specific workflows
- **Settings**: `.claude/settings.local.json` - Claude Code
  configuration
