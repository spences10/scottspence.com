# Linting Commands Reference

## Run cspell (Project's Built-in Tool)

The project uses cspell for spell checking across all markdown files.

```bash
npm run cspell
```

This command:

- Checks all markdown files recursively
- Uses project's cspell configuration
- Reports spelling errors and unknowns
- Respects the project's word list

## Check Specific Files

To check specific markdown files:

```bash
npx cspell 'posts/*.md' --config cspell.json --wordsOnly
npx cspell 'src/content/**/*.md' --config cspell.json --wordsOnly
```

## Manual Pattern Checks

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
