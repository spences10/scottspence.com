# En-GB Spelling Reference

## Common Conversions

| British      | American     | Usage                    |
| ------------ | ------------ | ------------------------ |
| colour       | color        | noun: "the colour of..." |
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

## Quick Check Patterns

Most British spellings follow these patterns:

- **-our** instead of **-or**: colour, favour, honour
- **-ise** instead of **-ize**: organise, realise, emphasise
- **-ll** instead of single **l**: travelled, skilled
- **-re** instead of **-er**: centre, metre, theatre

## En-GB Compliance Check

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

The project's cspell configuration is located at `cspell.json` and includes:

- Language settings (en-GB)
- Project-specific word lists
- Ignored patterns
- Custom dictionaries

### Adding Words to Dictionary

If a legitimate word is flagged by cspell:

1. Verify it's a real, correctly-spelled word
2. Check cspell.json to see if it should be added
3. Add to appropriate word list if needed

## Common False Positives

These words might be flagged but are often correct:

- Tech terms: TypeScript, SvelteKit, Upstash, Turso, Tailwind
- Names: Scott, Spence, Bluesky, GitHub
- Abbreviations: API, SSH, URL, CLI
- Project-specific terms

Check `cspell.json` for project dictionary that may include these.
