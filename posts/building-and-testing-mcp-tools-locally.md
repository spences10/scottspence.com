---
date: 2026-02-28
title: Building and Testing MCP Tools Locally
tags: ['mcp', 'claude-code', 'tools', 'guide']
published: false
---

<!-- cSpell:ignore modelcontextprotocol mcpServers spences10 omnisearch sequentialthinking tmcp paoloricciuti mcpick pnpx -->

Ok, so, I've built over 20 MCP servers at this point. Search tools,
memory systems, doc scrapers, workflow builders. I've written about
[configuring MCP tools in Claude Code](/posts/configuring-mcp-tools-in-claude-code)
before, but one thing I've never actually covered is the bit that
tripped me up early on: "I've made this MCP server... how do I
actually test it before publishing to npm?"

I tried using the official `@modelcontextprotocol/sdk` tooling and it
was clunky af - bloated with a load of stuff I'll never use. I
switched to [tmcp](https://github.com/paoloricciuti/tmcp) by
[Paolo Ricciuti](https://github.com/paoloricciuti) instead. We're both
Svelte ambassadors and I trust his work. It's lightweight,
schema-agnostic, and the API is dead clean.

But regardless of which SDK you use to build your MCP server, the
question is still the same, how do you actually test it? The best way
I found was to just have the LLM test it locally. Point your
`mcpServers` config at the built `dist/` directory, ask the model to
use the tool, see what happens. Claude Code can give you feedback on
using it, you'll be able to see where it struggles or just gets things
wrong. You can ask Claude Code to evaluate the tool for its
usefulness, have it make a report of pros/cons as it uses it.

This tightens the feedback loop massively. Make a change, rebuild,
reconnect, have the LLM test and evaluate it. Then use the LLM again
to make the suggested changes.

## Try it yourself

Right, rather than just talking about this, let's build one. Something
simple that actually does something useful - a text stats tool. Give
it some text and it'll tell you the word count, character count,
sentence count, and reading time. Follow along and you'll have it
running locally in about five minutes.

**Step 1: Scaffold the project**

```bash
mkdir mcp-text-stats && cd mcp-text-stats
pnpm init
pnpm install tmcp @tmcp/adapter-valibot @tmcp/transport-stdio valibot
pnpm install -D typescript @types/node
mkdir src
```

**Step 2: Set up `package.json`**

Replace the contents of `package.json` with this - it's got the
`type`, `main`, `bin`, and `build` script we need, plus the deps from
step 1:

```json
{
	"name": "mcp-text-stats",
	"version": "0.0.1",
	"type": "module",
	"main": "dist/index.js",
	"bin": {
		"mcp-text-stats": "./dist/index.js"
	},
	"scripts": {
		"build": "tsc && chmod +x dist/index.js",
		"start": "node dist/index.js"
	},
	"dependencies": {
		"@tmcp/adapter-valibot": "^0.1.5",
		"@tmcp/transport-stdio": "^0.4.1",
		"tmcp": "^1.19.2",
		"valibot": "^1.2.0"
	},
	"devDependencies": {
		"@types/node": "^25.3.2",
		"typescript": "^5.9.3"
	}
}
```

The `chmod +x` makes the compiled JavaScript executable so it can run
as a CLI tool.

**Step 3: Create `tsconfig.json`**

```bash
touch tsconfig.json
```

This is the same config I use across all my MCP tools, paste this in:

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "Node16",
		"moduleResolution": "Node16",
		"outDir": "./dist",
		"rootDir": "./src",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"declaration": true,
		"sourceMap": true
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "dist"]
}
```

**Step 4: Create `src/index.ts`**

```bash
touch src/index.ts
```

Paste this in - the shebang on the first line is important:

```ts
#!/usr/bin/env node
import { McpServer } from 'tmcp'
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot'
import { StdioTransport } from '@tmcp/transport-stdio'
import * as v from 'valibot'

const adapter = new ValibotJsonSchemaAdapter()
const server = new McpServer(
	{ name: 'mcp-text-stats', version: '0.0.1' },
	{ adapter, capabilities: { tools: { listChanged: true } } },
)

server.tool(
	{
		name: 'text_stats',
		description:
			'Analyse text and return word count, character count, sentence count, and estimated reading time',
		schema: v.object({
			text: v.pipe(
				v.string(),
				v.minLength(1, 'Text cannot be empty'),
			),
		}),
	},
	async ({ text }) => {
		const words = text.trim().split(/\s+/).length
		const characters = text.length
		const sentences = text.split(/[.!?]+/).filter(Boolean).length
		const reading_time_mins = Math.ceil(words / 200)

		const result = [
			`Words: ${words}`,
			`Characters: ${characters}`,
			`Sentences: ${sentences}`,
			`Reading time: ~${reading_time_mins} min`,
		].join('\n')

		return {
			content: [{ type: 'text', text: result }],
		}
	},
)

const transport = new StdioTransport(server)
transport.listen()
```

**Step 5: Build it**

```bash
pnpm build
```

**Step 6: Point Claude Code at it**

Add this to your `~/.claude.json` (global) or `.claude/settings.json`
(project):

```json
{
	"mcpServers": {
		"mcp-text-stats": {
			"command": "node",
			"args": ["/home/you/repos/mcp-text-stats/dist/index.js"]
		}
	}
}
```

**Important:** swap `/home/you/repos/` with the actual absolute path
to your project. If you copy-paste the placeholder as-is, Claude Code
will fail to connect to the server with no useful error - ask me how I
know. 😅

No `npx`, no pulling from npm. Just the absolute path to the built
file on disk. If your tool needs API keys, add an `env` block:

```json
{
	"mcpServers": {
		"mcp-text-stats": {
			"command": "node",
			"args": ["/home/you/repos/mcp-text-stats/dist/index.js"],
			"env": {
				"MY_API_KEY": "your-key-here"
			}
		}
	}
}
```

If you've got a bunch of MCP servers and don't fancy manually editing
JSON or running `claude mcp add` for each one, I built
[mcpick](https://github.com/spences10/mcpick) for exactly this.
`pnpx mcpick` gives you an interactive menu to toggle servers on and
off without losing their config. Handy for seeing what you've got
loaded - granted, Claude Code does a good job of managing memory now
and loads in MCP tools when needed.

**Step 7: Start a new Claude Code session and test**

Start a fresh Claude Code session so it picks up the new config, then
ask it to use your tool:

> "Use the text_stats tool to analyse this blog post I'm working on"

That's it. You've got a working MCP tool being tested locally by the
LLM. No publishing, no faff. Here's what I got when I asked Claude
Code to use it on this very post:

```
┌──────────────┬────────┐
│    Metric    │ Value  │
├──────────────┼────────┤
│ Words        │ 1,250  │
├──────────────┼────────┤
│ Characters   │ 8,609  │
├──────────────┼────────┤
│ Sentences    │ 108    │
├──────────────┼────────┤
│ Reading time │ ~7 min │
└──────────────┴────────┘
```

If you don't want to lose your current conversation context, you don't
have to start a brand new session. Close Claude Code, reopen it, and
use `/resume` to pick up where you left off - it'll reconnect to your
MCP servers with the new config while keeping all your previous
context intact.

## The development loop

Once you've got the basic setup, the iteration is pretty
straightforward - you make changes in your `src/`, then let the LLM do
the rest. Claude Code will probably offer to build and test it for
you. Start a fresh session each time so the LLM isn't carrying context
from previous runs - you get cleaner feedback that way.

Prompt it with something like "Evaluate mcp-text-stats for its
usefulness, give detailed report after use" and you'll get genuinely
useful feedback on your tool's API design, error handling, edge cases,
all of it.

If something's not working _after_ the tool connects, just ask Claude
Code to figure it out. It's got access to your project files, it can
read the error output, and it'll usually nail the issue faster than
you will manually. That's the whole point of this workflow — let the
LLM do the heavy lifting. 😅

One gotcha though - if the server won't start at all, Claude Code
can't help you. It just sees "failed" with no error details. MCP
servers communicate over stdio, so errors go to `stderr` which Claude
Code doesn't get to see when the connection fails. You'll need to
debug that one yourself:

```bash
node dist/index.js 2>&1
```

That'll show you the actual crash output - missing dependencies, bad
imports, runtime errors, whatever's stopping it from starting.

## Local vs published

The nice thing about this setup is that the jump from local dev to
published npm package is tiny. During development your config points
to the local path:

```json
"args": ["/home/you/repos/mcp-text-stats/dist/index.js"]
```

After publishing, users pull it from npm with `npx`:

```json
"command": "npx",
"args": ["-y", "mcp-text-stats"]
```

Same tool, same config structure, just a different entry point. The
`bin` field in `package.json` handles the rest.

## My MCP tools

I've built over 20 MCP servers but day-to-day I only actually run two:

- [mcp-omnisearch](https://github.com/spences10/mcp-omnisearch) for
  search
- [mcp-sqlite-tools](https://github.com/spences10/mcp-sqlite-tools)
  for local databases

The LLM's good enough at everything else to be honest.

If you want to poke around the rest of them, they're all
[on my GitHub](https://github.com/spences10?tab=repositories&q=mcp-&type=source&language=&sort=stargazers).
They all follow the same pattern - tmcp, Valibot, compile to `dist/`,
test locally by pointing the config at the built file.

## Conclusion

The whole workflow is: build your MCP server with tmcp, point your
`mcpServers` config at the `dist/` directory, start a Claude Code
session, and let it test the tool for you. Make changes, rebuild, new
session, test again. The LLM gives you feedback you'd never get from
manual testing - it'll tell you when your tool descriptions are
confusing, when the schema doesn't make sense, when it's missing edge
cases.
