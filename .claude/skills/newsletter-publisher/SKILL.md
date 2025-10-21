---
name: newsletter-publisher
description:
  Prepare newsletters for publication by validating format, structure,
  frontmatter, and content. Use when reviewing newsletter drafts
  before sending or publishing.
allowed-tools: Read, Edit, Glob
---

# Newsletter Publisher

Validate and prepare newsletters for publication to ensure consistency
and readiness.

## When to Use

- Reviewing newsletter drafts before publication
- Validating newsletter format and structure
- Preparing frontmatter for publication
- Checking newsletter content quality
- Verifying links and formatting

## Pre-Publication Checklist

### Frontmatter Validation

- [ ] Has frontmatter with `---` delimiters
- [ ] Title follows format: "Newsletter: [Month Year]"
- [ ] Date is in YYYY-MM-DD format
- [ ] `published` field exists
- [ ] No typos or formatting issues in frontmatter

### Structure

- [ ] Includes Opening section (personal note or headline)
- [ ] Has Highlights section (2-4 major items)
- [ ] Contains Technical Deep Dives or Learnings
- [ ] Includes Open Source section if applicable
- [ ] Has "What's Coming" preview
- [ ] Ends with brief closing/sign-off

### Heading Consistency

- [ ] Uses only H2 headings (`##`) for main sections
- [ ] Subsections use H3 (`###`) if needed
- [ ] No H1 headings in content
- [ ] Headings are clear and descriptive

### Content Quality

- [ ] Written in first-person ("I built...", "I learned...")
- [ ] Conversational but substantive
- [ ] Uses en-GB spellings throughout
- [ ] Short paragraphs and bullet points for scannability
- [ ] Links in proper markdown format
- [ ] No fabricated metrics or statistics
- [ ] Content is substantial, not filler

### Links & References

- [ ] All links formatted correctly: `[text](url)`
- [ ] Links point to relevant resources
- [ ] Repository links included for projects
- [ ] Blog post links included where relevant
- [ ] No broken or placeholder links

### Formatting

- [ ] Uses `**bold**` for emphasis
- [ ] Uses `_italic_` rarely, only when needed
- [ ] Code references in backticks: \`src/file.ts\`
- [ ] No excessive whitespace
- [ ] Consistent formatting throughout

### Voice Consistency

- [ ] Authentic to Scott's voice (honest, conversational)
- [ ] No corporate or marketing language
- [ ] No hype or exaggeration
- [ ] Tone is genuine and specific
- [ ] Avoids vague descriptions

## Publication Workflow

### Before Publishing

1. **Review Content**
   - Verify all facts and metrics
   - Check all links are working
   - Ensure no fabricated information

2. **Validate Formatting**
   - Run through this checklist
   - Check for consistency with previous newsletters
   - Verify en-GB spelling

3. **Update Frontmatter**
   - Change `published: false` to `published: true`
   - Ensure date is correct

4. **Final Review**
   - Read through one more time
   - Check for tone consistency
   - Verify structure and flow

### After Publishing

1. Merge the PR to main
2. Newsletter delivery workflow activates automatically via Resend
   (when configured)

## File Location

Newsletters are stored in `newsletter/` (top-level directory) with filename
format:

- Correct: `2025-10.md` (YYYY-MM.md)
- Incorrect: `october-2025.md`, `Newsletter-Oct-2025.md`

Frontmatter structure:

```markdown
---
title: 'Newsletter: October 2025'
date: 2025-10-31
published: false
---

# Newsletter content here
```

Change to `published: true` only when ready.

## Content Guidelines

### What Should Be Included

- Significant technical achievements or learnings
- Projects with real impact or completion
- Interesting blog posts or documentation
- Community interactions or collaborations
- Open source contributions with substance
- Personal insights or reflections on development

### What to Exclude

- Dependency version bump notifications (unless major/breaking)
- Routine commit activity without narrative
- Duplicate or overlapping content
- Noise and cruft (build fixes, formatting, etc.)
- Unfinished or abandoned efforts
- Spam or self-promotion

## Structure Template

Use this proven structure (adapt sections as needed):

### Opening

Brief personal note or headline capturing the month's essence.

### Highlights

2-4 major accomplishments or projects with real substance.

### Technical Deep Dives

Blog posts published, significant learnings, or substantial technical
work.

### Open Source

Contributions to projects, releases, or community involvement.

### What's Coming

Teases or previews for next month's focus.

### Closing

Brief personal sign-off (keep it under 2 sentences).

## En-GB Compliance

Verify these common words use British spelling:

- colour, not color
- organisation, not organization
- favour, not favor
- behaviour, not behavior
- grey, not gray
- travelling, not traveling
- realised, not realized

## Tone Reference

**What to aim for:**

- Conversational but not flippant
- Substantive, not superficial
- Specific, not vague
- Honest, not hyped
- Personal, not corporate

**What to avoid:**

- Marketing speak
- Buzzwords
- Excessive enthusiasm
- Fabricated metrics
- Third-person perspective
- False inclusivity
