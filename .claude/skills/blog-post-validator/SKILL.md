---
name: blog-post-validator
description: Validate blog posts for quality, consistency, en-GB spelling, code examples, and adherence to ScottInk style guidelines before publication.
allowed-tools: Read, Grep, Glob
---

# Blog Post Validator

Perform comprehensive quality checks on blog posts to ensure they meet
publication standards.

## When to Use

- Reviewing a blog post before publication
- Checking consistency with ScottInk voice and style
- Validating structure, formatting, and best practices
- Verifying en-GB spelling and grammar
- Confirming code examples are valid and tested

## Validation Checklist

### Frontmatter

- [ ] Has frontmatter with `---` delimiters
- [ ] Contains `title`, `date`, and `published` fields
- [ ] Date is in YYYY-MM-DD format
- [ ] `published: false` before publication
- [ ] No typos in frontmatter

### Structure & Content

- [ ] Opens with a hook or context-setting statement
- [ ] Clear problem statement early
- [ ] Investigation/process clearly explained
- [ ] Solution comes with working code examples
- [ ] Results/takeaways are concrete, not vague
- [ ] Reasonable length (500-2000 words typical)

### Headings

- [ ] Uses only H2 headings (`##`) for sections
- [ ] No H1 headings (`#`) in content
- [ ] Headings are descriptive and follow the flow
- [ ] No orphaned sections without content

### Code Examples

- [ ] All code blocks have language identifiers (e.g.,
      \`\`\`typescript)
- [ ] Code is tested and working
- [ ] File paths use backticks: \`src/lib/utils.ts\`
- [ ] Code examples support the narrative
- [ ] No placeholder or pseudocode presented as fact

### Voice & Tone

- [ ] Written in first-person ("I did...", not "One might...")
- [ ] Conversational and direct
- [ ] No corporate speak or buzzwords
- [ ] No false inclusivity ("we" only where appropriate)
- [ ] Self-deprecating where relevant
- [ ] Authentic to Scott's personality

### Spelling & Language

- [ ] Uses en-GB spelling: colour, organisation, behaviour, favour,
      etc.
- [ ] No en-US spellings: color, organization, behavior
- [ ] Grammar and punctuation are correct
- [ ] No typos or spelling errors
- [ ] Links are properly formatted in markdown

### Formatting

- [ ] Uses `**bold**` for emphasis, not _italic_
- [ ] Bullet points and numbered lists are clean
- [ ] Paragraphs are short (2-3 sentences)
- [ ] Complex ideas broken into steps or subsections
- [ ] No excessive whitespace or formatting issues

### Links & References

- [ ] All links are in markdown format: `[text](url)`
- [ ] Links are relevant and working
- [ ] Code repository links included where applicable
- [ ] External documentation referenced when helpful
- [ ] "Want to check the code?" section present if code was shared

### ScottInk Characteristics

- [ ] Shows working code before theory
- [ ] Admits mistakes openly
- [ ] Includes specific numbers or metrics (not vague)
- [ ] Demonstrates problem with real context
- [ ] Solution is practical, not just theoretical
- [ ] Includes takeaways for reader

## Common Issues to Flag

### Red Flags (Fix Required)

- Third-person narrative ("Scott does...", "The developer...")
- Vague conclusions ("It was interesting", "Good to know")
- No code examples when topic requires them
- Fabricated metrics or made-up statistics
- Heading misuse (H1 or excessive levels)
- Marketing language or hype

### Yellow Flags (Review)

- Very short posts (under 300 words)
- Very long posts (over 3000 words)
- Excessive use of italics instead of bold
- Missing repository links for code-heavy topics
- British/American spelling inconsistency
- Generic opening that could apply to many posts

## Reporting Format

Provide feedback in this structure:

**Overall Assessment:** [Pass/Needs Changes/Hold for Discussion]

**Strengths:**

- Specific positive observations

**Issues to Address:**

- Priority: High
  - [Issue 1]
  - [Issue 2]
- Priority: Medium
  - [Issue 3]
  - [Issue 4]
- Priority: Low
  - [Issue 5]

**Ready to Publish:** [Yes/No] - Brief reasoning

## Reference: ScottInk Voice Elements

**Authentic phrases to verify are present:**

- "So, there I was..."
- "This is where things get interesting"
- "Want to check the code?"
- "Banging!" (for impressive things)
- "That's a proper [problem/solution]"
- "The numbers don't lie"

**Tone descriptors:**

- Direct, honest, no-nonsense
- Conversational and personal
- British expressions used naturally
- Self-deprecating humour
- Pragmatic over perfectionist

## En-GB vs En-US Reference

Common conversions to verify:

- colour (not color)
- organisation (not organization)
- favour (not favor)
- behaviour (not behavior)
- grey (not gray)
- travelling (not traveling)
- licence (not license) - when used as noun
- practise (not practice) - when used as verb
