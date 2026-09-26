---
date: 2026-09-17
title: Give Coding Agents Your Project Docs With node:sqlite and FTS5
tags: ['sqlite', 'node', 'guide']
is_private: false
---

<!-- cSpell:ignore FTS bm25 wiki0 DOCX readdirSync readFileSync DatabaseSync UNINDEXED -->

On a reinsurance platform I built at an agency this year, the
documentation got big. Requirements, specs, schema notes, meeting
notes and client emails. It went from 65 documents in May to 291 by
September.

Coding agents had two ways to deal with that. Read loads of files at
the start of every session, or guess. Neither is good.

On 9 May I asked an agent whether SQLite FTS5 with BM25 ranking would
cut down the research phase at the start of each session. Forty
minutes later the first version of a docs search CLI was in the repo.

It's just a way to get context into a coding agent session via a CLI.
It became one of the most used tools on the project.

## What it turned into

The CLI stayed with the agency I built it for, so I can't share its
code. What it did:

- **`search`** ranked matches across every document.
- **`context`** returned the matching section plus the sections around
  it. This was the one agents used most.
- **`facts`** pulled out decisions, requirements, risks and
  assumptions so they could be queried on their own.
- **Source priority** ranked specs above schema notes, and those above
  meeting notes. Documents marked as superseded dropped down.
- It read PDF and Word documents as well as Markdown.

Step one of the project's agent instructions was to use it. Across my
sessions, agents called it 1,122 times in 327 sessions, and `context`
accounted for 615 of those.

It had no dependencies beyond Node. `node:sqlite` has FTS5 built in,
so the whole thing is a database file and some SQL.

## A minimal version

This is a small version I wrote from scratch for this post. It indexes
a folder of Markdown, one chunk per heading, and has `search` and
`context` commands:

```ts {7-11,61-63}
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('docs.db');

db.exec(`
	CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5(
		path, heading, body, seq UNINDEXED
	);
`);

function markdown_files(dir: string): string[] {
	return readdirSync(dir, { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.md'))
		.map((file) => join(dir, file));
}

// One chunk per heading, so results point at a section, not a whole file
function chunk(markdown: string) {
	const chunks: { heading: string; body: string }[] = [];
	let heading = '';
	let lines: string[] = [];
	const content = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
	for (const line of content.split('\n')) {
		if (/^#{1,3} /.test(line)) {
			if (lines.join('').trim())
				chunks.push({ heading, body: lines.join('\n') });
			heading = line.replace(/^#+ /, '');
			lines = [];
		} else {
			lines.push(line);
		}
	}
	if (lines.join('').trim())
		chunks.push({ heading, body: lines.join('\n') });
	return chunks;
}

function index(dir: string) {
	db.exec('DELETE FROM chunks');
	const insert = db.prepare(
		'INSERT INTO chunks (path, heading, body, seq) VALUES (?, ?, ?, ?)',
	);
	let count = 0;
	for (const file of markdown_files(dir)) {
		const path = relative(dir, file);
		chunk(readFileSync(file, 'utf8')).forEach((c, seq) => {
			insert.run(path, c.heading, c.body, seq);
			count++;
		});
	}
	console.log(`Indexed ${count} chunks`);
}

// bm25 weights: a match in the path or heading counts for more than the body
function search(query: string, limit = 5) {
	return db
		.prepare(
			`SELECT path, heading, seq,
				snippet(chunks, 2, '[', ']', '…', 12) AS snippet
			FROM chunks WHERE chunks MATCH ?
			ORDER BY bm25(chunks, 3.0, 2.0, 1.0) LIMIT ?`,
		)
		.all(query, limit);
}

// The matched section plus the ones either side of it
function context(query: string) {
	const [top] = search(query, 1) as { path: string; seq: number }[];
	if (!top) return 'No match';
	return db
		.prepare(
			`SELECT heading, body FROM chunks
			WHERE path = ? AND seq BETWEEN ? AND ? ORDER BY seq`,
		)
		.all(top.path, top.seq - 1, top.seq + 1)
		.map((c) => `## ${c.heading}\n${c.body}`)
		.join('\n');
}

const [command, arg] = process.argv.slice(2);
if (command === 'index') index(arg);
else if (command === 'search')
	for (const r of search(arg))
		console.log(
			`${r.path} › ${r.heading}\n  ${String(r.snippet).replace(/\s+/g, ' ')}`,
		);
else if (command === 'context') console.log(context(arg));
else
	console.log(
		'Usage: docs-search index <dir> | search <query> | context <query>',
	);
```

Node 24 runs TypeScript directly, so there's no build step. I pointed
it at the posts on this blog:

```bash
node docs-search.ts index ./posts
# Indexed 2647 chunks

node docs-search.ts search "hook instructions"
```

Results will come back something like this:

```text
how-to-make-claude-code-follow-hook-instructions.md › Hooks
  …Execute [hook] [instructions] FIRST — before any reasoning, tool calls, or response text…
how-to-make-claude-code-follow-hook-instructions.md › Receipts
  …a on user submit prompt [hook] fired?" - **March 19** — "there's a…
how-to-make-claude-code-follow-hook-instructions.md › I'm not the only one
  …anthropics/claude-code/issues/18660) — "[Instructions] are read but not followed" - [#27032…
```

That's about 260 posts indexed in under half a second, including Node
starting up, and a search takes around 50ms. Every result comes back
from the right post.

## The bits that matter

**Chunking by heading.** An agent wants the section that answers its
question, not a whole document. Splitting on headings means `search`
returns something small enough to read, and the heading tells the
agent what it's looking at.

**Weighted ranking.** `bm25(chunks, 3.0, 2.0, 1.0)` gives the path
three times the weight of the body, and the heading twice. A match in
a file called `authentication.md` is a much stronger signal than the
same word in passing somewhere else. You can see it in the output
above: every result is from the post whose file name matches.

**Context around the match.** `context` returns the matched section
with its neighbours. Docs tend to explain something across a couple of
sections, and this is why it became the most used command on the real
project.

## Telling the agent to use it

A CLI only helps if the agent reaches for it. On the project it was
the first step in the agent instructions, something like:

```markdown
Before starting work, search the project docs:

- `node docs-search.ts context "<topic>"` for the relevant section
- `node docs-search.ts search "<terms>"` to find related documents

Cite the file and section you relied on.
```

I didn't need an MCP server for any of this, which is
[why I've mostly stopped building them](/posts/i-built-21-mcp-tools-and-still-use-2).
Models are good with a CLI, and they can run `--help` when they're
unsure.

## Where it went next

Working on that CLI changed how I thought about the docs folder. On 31
May I described it as going from a dumping ground to memory and
context infrastructure.

That's where [wiki0](https://github.com/spences10/wiki0) came from.
It's my open-source take on the same idea: Markdown as the source of
truth, with a SQLite index that can be rebuilt any time for search,
backlinks and facts. It's still early.

If I were adding to the minimal version above, I'd start with the two
things that made the biggest difference on the project: source
priority, so a spec outranks a meeting note, and retrying with `OR`
when a strict search finds too little.
