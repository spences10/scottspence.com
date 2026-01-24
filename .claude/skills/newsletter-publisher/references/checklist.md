# Pre-Publication Checklist

## Frontmatter Validation

- [ ] Has frontmatter with `---` delimiters
- [ ] Title follows format: "[Playful Title] - [Month Year]" (e.g.,
      "The one where I broke SQLite - October 2025")
- [ ] Title has personality and captures the month's essence
- [ ] Date is in YYYY-MM-DD format
- [ ] `published` field exists
- [ ] No typos or formatting issues in frontmatter

## Structure

- [ ] Starts with opening prose (no heading) that summarises the month
- [ ] Has Highlights section (2-4 major items)
- [ ] Contains Technical Deep Dives or Learnings
- [ ] Includes Open Source section if applicable
- [ ] Ends with brief closing prose (no heading)

## Heading Consistency

- [ ] Uses only H2 headings (`##`) for sections
- [ ] No H3 subheadings (`###`) - use prose instead
- [ ] No H1 headings in content
- [ ] Headings are clear and descriptive
- [ ] **Headings contain no links** (links should be in paragraph
      text)
- [ ] Total length under 600 words

## Content Quality

- [ ] Written in first-person ("I built...", "I learned...")
- [ ] Conversational but substantive
- [ ] Uses en-GB spellings throughout
- [ ] Short paragraphs and bullet points for scannability
- [ ] Links in proper markdown format
- [ ] No fabricated metrics or statistics
- [ ] Content is substantial, not filler

## Links & References

- [ ] All links formatted correctly: `[text](url)`
- [ ] Links point to relevant resources
- [ ] Repository links included for projects
- [ ] Blog post links included where relevant
- [ ] No broken or placeholder links
- [ ] **No links in headings** (causes nested `<a>` tags)

## Formatting

- [ ] Uses `**bold**` for emphasis
- [ ] Uses `_italic_` rarely, only when needed
- [ ] Code references in backticks: \`src/file.ts\`
- [ ] No excessive whitespace
- [ ] Consistent formatting throughout
- [ ] No links in headings (use plain heading + link in paragraph)

## Voice Consistency

- [ ] Authentic to Scott's voice (honest, conversational)
- [ ] No corporate or marketing language
- [ ] Admits struggles and learnings openly
- [ ] Mentions specific technologies (SvelteKit, Turso, etc.)
- [ ] British English used naturally
