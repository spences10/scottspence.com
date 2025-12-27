---
date: 2025-11-02
title: Claude Code Skills Not Recognised? Here's the Fix!
tags: ['claude', 'claude-code', 'tools', 'guide']
is_private: false
---

Not having Claude Code skills showing up? Yeah, I hit this too... When
Claude Skills were announced I jumped straight on that! Dug into it
and built out several skills, for this site and other projects.

I even built out my own
[CLI tool](https://github.com/spences10/claude-skills-cli) (Claude
Code _loves_ a CLI!!) to create Claude Skills, and they, well, just
didn't show up. I'd ask Claude **"list `<available_skills>`"** and
Claude would be like 🤷.

## The problem

I built the `claude-skills-cli` specifically to help create
well-structured skills and prevent Claude from going absolutely
bananas writing stupidly long skills (which it absolutely does without
guardrails). The CLI was doing its job, but the skills still weren't
being recognised by Claude Code.

Searching around there were _similar_ issues so I ended up commenting
on the
[GitHub issue #9716](https://github.com/anthropics/claude-code/issues/9716)
because I figured I wasn't the only one hitting this.

## The investigation

The CLI was outputting perfectly valid skills, but I was reformatting
them afterwards with Prettier. Quite by accident, I discovered, the
issue was with how Prettier formatted the YAML frontmatter. It used
multi line descriptions because, well, that's valid YAML, innit?

So, this is a super specific post for if you use Prettier and have
asked Claude Code to write you some skills but they're not showing up
when you ask Claude to list them.

Here's what I had (and what didn't work):

```yaml
---
name: skill-creator
description:
  Design and create Claude Skills using progressive disclosure
  principles.
---
```

Looks fine, right? YAML parsers handle this no problem. But Claude
Code? Nah, it wasn't having any of it. Thanks Prettier!

## The fix

The solution was super simple, use single line description so as not
to break the YAML (rules??) with a `# prettier-ignore` comment.

Here's the working format:

```yaml
---
name: skill-creator
# prettier-ignore
description: Design and create Claude Skills using progressive disclosure principles.
---
```

That's it. Single line, job done. The `# prettier-ignore` keeps
Prettier from reformatting it back to multi line on the next run.

## The results

Once I updated all my skills files to use single line descriptions,
they immediately showed up in the skills list. Running
`list <available_skills>` now works perfectly.

I've also updated the `claude-skills-cli` to output the correct format
from the start, so anyone using the tool won't hit this issue. The CLI
now ensures descriptions stay single line with the `# prettier-ignore`
comment.

## If you're hitting this

Check your `.claude/skills/` directory and make sure your descriptions
are:

1. Single line format
2. Have `# prettier-ignore` above them (if you use Prettier!)
3. Don't use YAML's multi line syntax

Or better yet, use my
[`claude-skills-cli`](https://github.com/spences10/claude-skills-cli)
which now handles all this formatting correctly and helps keep your
skills properly structured. Just ask Claude "use pnpx
claude-skills-cli to create a skill for x" (or "npx -y
claude-skills-cli" if you use npm) and it'll guide Claude through
creating a properly formatted skill. Hopefully this saves you from the
same head scratching I went through!

For more on creating skills, check out the
[official Claude Code Skills documentation](https://docs.claude.com/en/docs/claude-code/skills).

## Related posts

If you're getting into Claude Code, you might also find these helpful:

- [Configuring MCP Tools in Claude Code - The Better Way](/posts/configuring-mcp-tools-in-claude-code)
- [Optimising MCP Server Context Usage in Claude Code](/posts/optimising-mcp-server-context-usage-in-claude-code)
- [The AI Coding Tools I Actually Use (And the Ones I Don't)](/posts/ai-coding-tools-i-actually-use)

Have you run into this? Hit me up on
[Bluesky](https://bsky.app/profile/scottspence.dev) – always
interested to hear about other Claude Code quirks people discover.
