---
date: 2025-03-18
title: Windsurf Setup for WSL
tags:
  [
    'tools',
    'wsl',
    'development',
    'cursor',
    'mcp',
    'windsurf',
    'guide',
  ]
is_private: false
---

I used Windsurf for the whole day yesterday, I'm impressed! I've been
using Cursor as part of my development workflow full time since
September last year. There's many a post on here from me on
integrating other tools into my workflow for using "AI" tools, mainly
around Anthropic's Model Context Protocol (MCP). I'm also a Windows
Subsystem for Linux (WSL) user, so this means there's limitations when
not having Node installed natively for MCP tool usage, see my
[Getting MCP Server Working with Claude Desktop in WSL](https://scottspence.com/posts/getting-mcp-server-working-with-claude-desktop-in-wsl)
post for more details.

Aight! **Tl;Dr links**:

- [if you're here to get Windsurf opening from the terminal](#launch-windsurf-from-the-terminal)
- [if you're wanting to change the market place](#extension-marketplace-difference)

I've known about Codium, well, ([VSCodium](https://vscodium.com)) for
a while actually, I mean, before Windsurf was a thing, I used to use
it when I was full on with Linux as a daily driver (not just WSL).
Windsurf was released
[November last year](https://codeium.com/blog/windsurf-launch). I did
take a look back then but there was no WSL support, so I left it
there!

## Just another VS Code, right?

So, if you didn't know already both Cursor and Windsurf are based on
the same codebase as Microsoft's VS Code. This means I was able to go
from VS Code to Cursor to Windsurf with relative ease. My keybindings
and shortcuts either remained the same or I copy pasted what I needed
from my [settings repo](https://github.com/spences10/settings).

Without going into too much detail, the process was, download the
latest Windsurf, I use winget so `winget install Codeium.Windsurf`
then open it. I get the expected **"Would you like to import your
settings and extensions from Cursor or VS Code?"** prompt, from past
experience with Cursor (i.e. just making a general mess) I now opt for
the start from scratch option. I did check the option to add Windsurf
to my PATH and allow access to public **AND** private networks.

So at this point, Windsurf is throwing errors saying it can't find git
installed, go install it, and I'm like "we got git at home", home
being WSL! I'll come onto this in the next section, for now I'm just
getting the settings sorted.

Ctrl+, to open the Windsurf Settings tab, scroll to the bottom of the
page and select the Other Settings, View Settings option, this opens
the `settings.json` file. Copy paste in my settings then the first
thing I notice is that the marketplace is different, (more on that in
the
[Extension Marketplace Difference](#extension-marketplace-difference)
section).

## Launch Windsurf from the terminal

Let's talk about getting that sweet action of opening up a project
folder from the terminal, like `code .` or `cursor .`, well, you can
`windsurf .` but it doesn't connect to WSL.

This was a bit of a clunky experience to open a project in WSL in
Windsurf,
[it's detailed on the Windsurf site](https://docs.codeium.com/windsurf/advanced#wsl-beta),
you have to launch the WSL remote connection by clicking the very
bottom left button to connect to WSL (or **Remote-WSL: Connect to
WSL** from the command palette) and then you're picking out the folder
you want to open in WSL, it opens up again in WSL.

Anyways! Bit of searching around and found
[this post on Reddit](https://www.reddit.com/r/Codeium/comments/1jbz4j3/i_figured_out_how_to_open_a_wsl_folder_from_the).

What I did, create a `windsurf-launcher.sh` file:

```bash
# in my home folder ~
nano windsurf-launcher.sh
```

Add in the script from the Reddit post:

<!-- cspell:ignore readlink -->

```bash
#!/bin/bash
CURRENT_PATH=$(readlink -f "$1")
windsurf --folder-uri "vscode-remote://wsl+Ubuntu$CURRENT_PATH"
```

Make it executable:

```bash
chmod +x windsurf-launcher.sh
```

In my aliases file and in the alias!

```bash
alias -g wf="~/windsurf-launcher.sh ."
```

If you don't have an aliases file, do this:

```bash
echo 'alias wf="~/bin/windsurf-launcher.sh ."' >> ~/.zshrc
source ~/.zshrc
```

If your using bash then replace `~/.zshrc` with `~/.bashrc`.

With this setup, I can type `wf .` to open Windsurf connected to my
current WSL directory from the terminal. It's a bit of extra setup,
but once done, it makes the workflow much smoother.

## MCP tools in WSL

I'll be honest, I have been absolutely fine working with MCP tools in
Claude Desktop or in Cline, there's been some occasions where I've
_really_ been wanting an MCP tool in my editor, historically I'd reach
for Cline and swallow the cost! Now I can use MCP tools directly in
Windsurf!

If you've read my other posts about
[Getting MCP Server Working with Claude Desktop in WSL](https://scottspence.com/posts/getting-mcp-server-working-with-claude-desktop-in-wsl)
or
[Using MCP Tools with Claude and Cline](https://scottspence.com/posts/using-mcp-tools-with-claude-and-cline),
you'll know that I've spent considerable time integrating AI tooling
into my development environment.

Cursor, just wouldn't work with MCP tools in WSL. There's a load of
workaround from the Cursor forum none of which ever worked for me.

Windsurf, on the other hand, handled MCP tools like a champ! I
literally took my Claude Desktop config and dropped it into Windsurf
and it worked right away.

## Keyboard shortcuts work!

In Cursor, I consistently ran into an annoying limitation: when using
the composer, keyboard shortcuts would become "trapped" within that
context. If I wanted to, for example, check the file explorer using a
keyboard shortcut while working with the composer, I'd have to
manually click outside the composer first, breaking my flow.

In Windsurf keyboard shortcuts work! I can switch into the file
explorer or anything else after working in the composer.

## Extension marketplace difference

Right, so, the default marketplace wasn't what I was used to! While
Cursor uses the Microsoft extension marketplace, Windsurf opts for its
own extension marketplace.

To configure the extension marketplace in Windsurf, I can modify the
settings.json file. By default, Windsurf uses its own marketplace, but
if I want to switch to the Microsoft marketplace, I can use this
configuration:

```json
{
	"windsurf.marketplaceExtensionGalleryServiceURL": "https://marketplace.visualstudio.com/_apis/public/gallery",
	"windsurf.marketplaceGalleryItemURL": "https://marketplace.visualstudio.com/item"
}
```

I can also use the Open VSX Registry if I prefer:

```json
{
	"windsurf.marketplaceExtensionGalleryServiceURL": "https://open-vsx.org/vscode/gallery",
	"windsurf.marketplaceGalleryItemURL": "https://open-vsx.org/vscode/item"
}
```

Being able to configure which marketplace to use means I can access
different extension ecosystems, which is a flexibility that Cursor
doesn't currently offer.

## The verdict (for now)

The thing is, because they are all so similar there's not much to
separate them on, so it's very small differences that make a big
impact in my workflow.

So, with the
[open editor from the terminal](#launch-windsurf-from-the-terminal)
issue sorted for me and Windsurf not getting in the way and hijacking
my keyboard shortcuts I'm feeling Windsurf!

The command palette is new, opens as a floating window instead of
being attached to the top of the editor. For me this is big, but not
in isolation!

After a full day with Windsurf replacing Cursor, I'm inclined to
continue using it as my primary editor. The MCP tools compatibility
with WSL alone makes it worth the switch for my workflow, not that
it's that big a leap!
