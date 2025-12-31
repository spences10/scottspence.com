# Writing Quality Checks

## Vague Language (Flag for Review)

Search for and consider replacing:

- "very" - usually unnecessary ("very good" → "excellent")
- "really" - weakens writing ("really important" → "crucial")
- "quite" - vague intensity ("quite difficult" → "challenging")
- "basically" - filler word, remove or rephrase
- "literally" - often misused, usually can be removed
- "interesting" - show why instead of telling
- "nice" - too vague, use specific adjective
- "good" - be more specific ("efficient", "reliable", etc.)

## Common Issues

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

## Tips

- Run cspell **before** committing content
- Fix spelling issues as you write, not after
- Be consistent with en-GB throughout a post
- American English is **never** acceptable in this project
- When in doubt, verify in a British English dictionary
