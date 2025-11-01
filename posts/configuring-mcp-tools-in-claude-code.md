---
date: 2025-03-30
title: Configuring MCP Tools in Claude Code - The Better Way
tags: ['mcp', 'claude', 'tools', 'wsl', 'guide']
is_private: false
---

<!-- cSpell:ignore modelcontextprotocol mcpServers spences10 sequentialthinking omnisearch -->

<script>
  import { Banner, Details } from '$lib/components'

  const options = {
    type: 'info',
    message: `Managing MCP servers can be tricky! Check out 
      <a href="https://github.com/spences10/mcpick" target="_blank" rel="noopener noreferrer">
      McPick</a> - a tool that makes it simpler to manage your MCP 
			server configurations. Also see the guide on 
      <a href="/posts/optimising-mcp-server-context-usage-in-claude-code" target="_blank" rel="noopener noreferrer">
      optimising MCP server context usage</a> to get the most out of 
			your setup.`,
    track_event: 'configuring mcp tools in claude code banner',
  }
</script>

Aight! So, I've been using Claude Code for a bit now, and one thing
that's been bugging me is the way you're supposed to configure MCP
tools. If you follow the official approach, you're stepping through a
CLI wizard that forces you to enter everything perfectly on the first
try or start over. Not ideal!

But there's a better way - directly editing the config file. This is
especially useful when there's a large config that requires a lot of
parameters to pass, such as paths and environment variables. More on
that later.

<Banner {options} />

## The problem with the CLI approach

Claude Code's default approach for configuring MCP tools is through a
CLI wizard (`claude mcp add`). You run a command, and it walks you
through setting up each tool step by step. This might seem
user-friendly at first, but it quickly becomes frustrating:

- If you make a typo, you often have to start the whole process over
- You can't easily see all your configurations at once
- It's harder to copy/paste complex configurations
- Making small tweaks requires going through multiple prompts again

For those of us who prefer to see the whole picture and make precise
edits, this becomes tedious, fast!

## Finding the config file

The first step is locating where Claude Code stores its configuration.
So after initial searches I couldn't find anything, but I eventually
found it at:

```bash
/home/scott/.claude.json
# or ~/.claude.json
```

Srs! This should have been the first place I looked! 🤦 Although I am
a Windows Subsystem for Linux (WSL) user, the config for Claude Code
file (unlike Claude Desktop) is stored in the Linux file system (as
I'm running it in a node env) this means there's none of the faffing
around with passing the request through the `wse.exe` binary like I've
had to do with Claude Desktop.

## The full config file structure

The `.claude.json` file contains a a bit more than just MCP server
configurations. Here's a simplified overview of what I found in mine:

<!-- cSpell:ignore daltonized -->

```json
{
	"numStartups": 34,
	"autoUpdaterStatus": "enabled",
	"theme": "dark-daltonized",
	"customApiKeyResponses": {
		"approved": ["some-id"],
		"rejected": []
	},
	"hasCompletedOnboarding": true,
	"lastOnboardingVersion": "0.2.42",
	"projects": {
		"/home/scott/repos/my-project": {
			"allowedTools": [],
			"history": ["some", "command", "history"],
			"mcpServers": {},
			"exampleFiles": ["file1.js", "file2.js"]
		}
	},
	"mcpServers": {
		"server-name": {
			"command": "command-to-run-server",
			"args": ["arg1", "arg2", "..."]
		}
	},
	"lastReleaseNotesSeen": "0.2.45",
	"oauthAccount": {
		"accountUuid": "",
		"emailAddress": "",
		"organizationUuid": "",
		"organizationRole": "",
		"workspaceRole": ""
	}
}
```

The most important part for what I'm interested in is the `mcpServers`
object, which contains all my MCP tool configurations, with each tool
having its own named entry.

I'll go through some practical examples of how to add MCP tools by
editing the config file directly.

## Basic example: Sequential Thinking

Simplest one (that doesn't use keys or paths) is the official
[Sequential Thinking MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking):

```json
{
	"mcpServers": {
		"sequential-thinking": {
			"type": "stdio",
			"command": "npx",
			"args": [
				"-y",
				"@modelcontextprotocol/server-sequential-thinking"
			]
		}
	}
}
```

## Consolidating my MCP tools with mcp-omnisearch

I used to have a bunch of different search tools configured
separately:

- Brave Search
- Tavily Search
- Kagi Search
- Perplexity
- Jina AI

This meant my config file was getting pretty bloated, and I had to
manage multiple API keys and configurations. That's why I created
[mcp-omnisearch](https://github.com/spences10/mcp-omnisearch), which
combines all these search tools into a single MCP server.

Here's how to configure it:

<!-- cSpell:ignore firecrawl -->

```json
{
	"mcpServers": {
		"mcp-omnisearch": {
			"type": "stdio",
			"command": "npx",
			"args": ["-y", "mcp-omnisearch"],
			"env": {
				"TAVILY_API_KEY": "your-tavily-key",
				"BRAVE_API_KEY": "your-brave-key",
				"KAGI_API_KEY": "your-kagi-key",
				"PERPLEXITY_API_KEY": "your-perplexity-key",
				"JINA_AI_API_KEY": "your-jina-key",
				"FIRECRAWL_API_KEY": "your-firecrawl-key"
			}
		}
	}
}
```

With this single configuration, I get access to:

- **Search Tools**: Tavily, Brave, and Kagi search engines
- **AI Response Tools**: Perplexity AI and Kagi FastGPT
- **Content Processing Tools**: Jina AI Reader, Kagi Summarizer, and
  more

The best part is that I can use whichever tools I have API keys for -
they're all optional. This dramatically simplifies my configuration
while giving me access to a wide range of capabilities.

## Enhanced Sequential Thinking with mcp-sequentialthinking-tools

If you're using the standard sequential thinking tool, you might want
to check out my enhanced version:
[mcp-sequentialthinking-tools](https://github.com/spences10/mcp-sequentialthinking-tools).

This adaptation of the standard MCP Sequential Thinking Server is
designed to guide tool usage in problem-solving. It helps break down
complex problems into manageable steps and provides recommendations
for which MCP tools would be most effective at each stage.

It's as simple as the official Sequential Thinking Server:

```json
{
	"mcpServers": {
		"mcp-sequentialthinking-tools": {
			"type": "stdio",
			"command": "npx",
			"args": ["-y", "mcp-sequentialthinking-tools"]
		}
	}
}
```

This tool is particularly useful when working on complex tasks that
require multiple steps and different tools along the way.

## Custom MCP Tools

If you've created your own MCP tools (or are testing locally), the
configuration is similar. You just need to point to the built
JavaScript file:

```json
{
	"mcpServers": {
		"my-custom-tool": {
			"type": "stdio",
			"command": "node",
			"args": ["/home/scott/mcp-tools/my-custom-tool/build/index.js"]
		}
	}
}
```

## Restarting Claude Code

After editing the config file, you'll need to restart Claude Code for
the changes to take effect. When it starts up, you should see the MCP
tools icon indicating that your tools are available.

```bash
╭────────────────────────────────────────────╮
│ ✻ Welcome to Claude Code research preview! │
│                                            │
│   /help for help                           │
│                                            │
│   cwd: /home/scott/repos/scottspence.com   │
╰────────────────────────────────────────────╯

 ✔  Found 2 MCP servers • /mcp
```

To check on them use the `/mcp` command inside Claude Code:

```bash
> /mcp
  ⎿  MCP Server Status
  ⎿
  ⎿  • mcp-omnisearch: connected
  ⎿  • sequentialthinking-tools: connected
```

## Why this approach is better

Editing the config file directly has several advantages:

1. **Complete visibility** - I can see all my configurations at once
2. **Easy copying and backup** - Simple to share configurations across
   machines
3. **Version control** - I can track changes to my config over time
4. **Quick edits** - Make small changes without going through the
   entire wizard
5. **Complex configurations** - Support for more advanced setups that
   might be difficult through the CLI

## My Current MCP Tool Setup

Here's the actual setup I'm currently using with Claude Code (with API
keys removed, of course):

```json
{
	"mcpServers": {
		"mcp-omnisearch": {
			"type": "stdio",
			"command": "npx",
			"args": ["-y", "mcp-omnisearch"],
			"env": {
				"TAVILY_API_KEY": "",
				"BRAVE_API_KEY": "",
				"KAGI_API_KEY": "",
				"PERPLEXITY_API_KEY": "",
				"JINA_AI_API_KEY": ""
			}
		}
	}
}
```

Yes, one MCP tool! This setup gives me a powerful combination of tools
for searching the web, reading documentation, AI-powered responses,
and content processing - all through a single MCP server.

## Conclusion

While Claude Code's CLI wizard might be the "official" way to
configure MCP tools, directly editing the config file gives me much
more control and flexibility. This is especially true for anyone with
more complex setups or testing locally.

By taking the direct approach, I can quickly set up, modify, and
maintain my MCP tool configurations without the frustration of
stepping through CLI prompts. It's a small change in workflow that
makes a big difference in usability.

If you're using Claude Code, I highly recommend giving this approach a
try. Your future self will thank you when you need to make a quick
change to your configuration!
