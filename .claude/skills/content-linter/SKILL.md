---
name: content-linter
description:
  Lint content for spelling errors, en-GB compliance, and writing
  quality. Use when checking markdown files for errors before
  publication.
allowed-tools: Read, Bash, Grep
---

# Content Linter

Comprehensive content checking for spelling, language consistency, and
writing quality.

## When to Use

- Checking spelling across markdown files
- Verifying en-GB spelling throughout content
- Identifying common writing issues
- Quality checks before publication
- Batch checking multiple content files

## Linting Tools and Commands

### Run cspell (Project's Built-in Tool)

The project uses cspell for spell checking across all markdown files.

```bash
npm run cspell
```

This command:

- Checks all markdown files recursively
- Uses project's cspell configuration
- Reports spelling errors and unknowns
- Respects the project's word list

### Check Specific Files

To check specific markdown files:

```bash
npx cspell 'posts/*.md' --config cspell.json --wordsOnly
npx cspell 'src/content/**/*.md' --config cspell.json --wordsOnly
```

### Manual Pattern Checks

Use grep to find potential issues:

```bash
# Find American spellings that should be British
grep -r "color\b" posts/
grep -r "organization\b" posts/
grep -r "behavior\b" posts/

# Find lowercase titles (should be capitalized)
grep -E "^title: \"[a-z]" posts/

# Find potential vague language
grep -E "(very|really|quite|basically|literally)" posts/

# Find missing code block language identifiers
grep -E "^\`\`\`$" newsletter/
```

## En-GB Spelling Reference

### Common Conversions

| British      | American     | Usage                    |
| ------------ | ------------ | ------------------------ |
| colour       | color        | noun: "the colour of..." |
| colour       | color        | all usages               |
| organisation | organization | noun: company/group      |
| favour       | favor        | noun or verb             |
| behaviour    | behavior     | noun                     |
| grey         | gray         | preferred in UK          |
| travelling   | traveling    | verb: present participle |
| realised     | realized     | verb: past tense         |
| licence      | license      | noun (license = verb)    |
| practise     | practice     | verb (practice = noun)   |
| centre       | center       | noun: location           |
| theatre      | theater      | noun: building           |
| metre        | meter        | noun: measurement        |
| analyse      | analyze      | verb                     |
| emphasise    | emphasize    | verb                     |

### Quick Check Pattern

Most British spellings follow the pattern:

- **-our** instead of **-or**: colour, favour, honour
- **-ise** instead of **-ize**: organise, realise, emphasise
- **-ll** instead of single **l**: travelled, skilled
- **-re** instead of **-er**: centre, metre, theatre

## Writing Quality Checks

### Vague Language (Flag for Review)

Search for and consider replacing:

- "very" - usually unnecessary ("very good" → "excellent")
- "really" - weakens writing ("really important" → "crucial")
- "quite" - vague intensity ("quite difficult" → "challenging")
- "basically" - filler word, remove or rephrase
- "literally" - often misused, usually can be removed
- "interesting" - show why instead of telling
- "nice" - too vague, use specific adjective
- "good" - be more specific ("efficient", "reliable", etc.)

### Common Issues

```bash
# Find potential vague phrases
grep -E "\b(very|really|quite|basically|literally)\b" posts/*.md

# Find weak verbs that could be stronger
grep -E "\b(is|are|was|were)\b" posts/*.md | head -20

# Find "it is" constructions (often can be simplified)
grep -E "\bit is\b" posts/*.md
```

## Spelling Check Workflow

### Step 1: Run Initial Check

```bash
npm run cspell
```

Review the output and categorize errors:

- **Misspellings** - Fix immediately
- **British/American conflicts** - Convert to British
- **Project-specific terms** - May be in dictionary already
- **Unknowns** - Add to cspell config if legitimate

### Step 2: Fix Identified Issues

Common issues to address:

- en-GB/en-US spelling conflicts
- Typos and misspellings
- Formatting inconsistencies
- Code examples with language identifiers

### Step 3: Verify Against Known Words

The project has a cspell configuration with approved words. Check:

- `cspell.json` - Main configuration
- Project-specific dictionaries

### Step 4: Final Verification

Re-run cspell to confirm all fixes:

```bash
npm run cspell
```

## Content Quality Checks

### Formatting Validation

```bash
# Find headings without content after them
grep -E "^##" posts/*.md | while read heading; do
  # Check if next line is blank or another heading
done

# Find code blocks missing language identifier
grep -n "^\`\`\`$" newsletter/*.md

# Find potential typos (double spaces)
grep -E "  " posts/*.md
```

### Link Validation

```bash
# Find markdown links
grep -oE "\[([^\]]+)\]\(([^)]+)\)" posts/*.md

# Check for placeholder links
grep -E "\(#\)|TODO|FIXME" posts/*.md
```

### En-GB Compliance Check

Run this verification:

```bash
# Find remaining American spellings
grep -rE "\b(color|organization|behavior|realize|analyze)\b" posts/
grep -rE "\b(traveled|honors|rumors|behaviors)\b" posts/

# British spellings should exist instead
grep -rE "\b(colour|organisation|behaviour|realise|analyse)\b" posts/
```

## Project-Specific Configurations

### cspell.json

The project's cspell configuration is located at `cspell.json` and
includes:

- Language settings (en-GB)
- Project-specific word lists
- Ignored patterns
- Custom dictionaries

### Adding Words to Dictionary

If a legitimate word is flagged by cspell:

1. Verify it's a real, correctly-spelled word
2. Check cspell.json to see if it should be added
3. Add to appropriate word list if needed

## Batch Linting

### Check All Blog Posts

```bash
npm run cspell -- 'posts/*.md'
```

### Check All Newsletters

```bash
npm run cspell -- 'newsletter/*.md'
```

### Check Specific File

```bash
npx cspell 'posts/my-post.md'
```

## Quality Checklist

- [ ] All spelling errors corrected
- [ ] All en-GB spellings verified
- [ ] No American spellings remain
- [ ] Code blocks have language identifiers
- [ ] Links are in markdown format
- [ ] No obvious typos or duplicated words
- [ ] Formatting is consistent
- [ ] Vague language reviewed and revised
- [ ] cspell passes without errors

## Common False Positives

These words might be flagged but are often correct:

- Tech terms: TypeScript, SvelteKit, Upstash, Turso, Tailwind
- Names: Scott, Spence, Bluesky, GitHub
- Abbreviations: API, SSH, URL, CLI
- Project-specific terms

Check `cspell.json` for project dictionary that may include these.

## Tips

- Run cspell **before** committing content
- Fix spelling issues as you write, not after
- Be consistent with en-GB throughout a post
- Use American English is **never** acceptable in this project
- When in doubt, verify in a British English dictionary
