---
date: 2025-02-05
title: Setting Up Codename Goose in WSL
tags:
  ['mcp', 'goose', 'learning', 'tools', 'learning', 'wsl', 'notes']
is_private: false
---

<!-- cspell:ignore Groq,precmd,openrouter,webscraping,computercontroller,modelcontextprotocol,sequentialthinking,deepseek -->

Ok, so, I've heard about this CLI tool that allows you to use your
preferred LLM provider, Goose, from Block (Square, payment thingy)
which I think is officially called codename goose, but we all know
everyone is going to refer to it as Goose. Anyway, Goose will allow
you to run commands and interact with your computer and also use Model
Context Protocol (MCP) tools.

So, super quick pre-amble there but essentially getting set up with
Goose (as a WSL user) wasn't as straight forward as I hoped.

## Install Goose

These instructions will be going through the install on a fresh Ubuntu
24.04 install on WSL.

The installation for goose is essentially Linux, there's Windows
instructions but it's to use WSL.

I want to make sure I'm all up to date first:

```bash
sudo apt update -y && sudo apt upgrade -y && sudo apt autoremove -y
```

I'll open a new WSL terminal without sudo permissions applied and keep
the sudo terminal open for the next steps.

I'll run the install script.

```bash
curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash
```

This will attempt to install the CLI but there's a missing dependency,
here's the output.

```bash
$ curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash
Downloading stable release: goose-x86_64-unknown-linux-gnu.tar.bz2...
Extracting goose-x86_64-unknown-linux-gnu.tar.bz2...
tar (child): bzip2: Cannot exec: No such file or directory
tar (child): Error is not recoverable: exiting now
tar: Child returned status 2
tar: Error is not recoverable: exiting now
```

So, there's a missing dependency `bzip2` I'll install the missing
dependency now in the terminal with sudo permissions:

```bash
sudo apt install bzip2
```

I'm now allowed to continue with the CLI setup!

```bash
$ curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash
Downloading stable release: goose-x86_64-unknown-linux-gnu.tar.bz2...
Extracting goose-x86_64-unknown-linux-gnu.tar.bz2...
Creating directory: /home/username/.local/bin
Moving goose to /home/username/.local/bin/goose

Configuring Goose


Welcome to goose! Let's get you set up with a provider.
  you can rerun this command later to update your configuration

┌   goose-configure
│
◆  Which model provider should we use?
│  ○ Anthropic
│  ○ Azure OpenAI
│  ○ Databricks
│  ○ Google Gemini
│  ○ Groq
│  ○ Ollama
│  ○ OpenAI
│  ● OpenRouter (Router for many model providers)
└
```

I'm going to go with OpenRouter for now as I can pick which model I
want to use, I'll be using `anthropic/claude-3.5-sonnet` for now.

So, now I'm prompted to add my OpenRouter API key.

```bash
Configuring Goose


Welcome to goose! Let's get you set up with a provider.
  you can rerun this command later to update your configuration

┌   goose-configure
│
◇  Which model provider should we use?
│  OpenRouter
│
◆  Provider OpenRouter requires OPENROUTER_API_KEY, please enter a value
│
└
```

Paste in my OpenRouter API key, hit enter and get this:

```bash
  Error Failed to access secure storage (keyring): Platform secure storage failure: DBus error: The name org.freedesktop.secrets was not provided by any .service files
  Please check your system keychain and run 'goose configure' again.
  If your system is unable to use the keyring, please try setting secret key(s) via environment variables.

Warning: Goose installed, but /home/username/.local/bin is not in your PATH.
Add it to your PATH by editing ~/.bashrc, ~/.zshrc, or similar:
    export PATH="/home/username/.local/bin:$PATH"
Then reload your shell (e.g. 'source ~/.bashrc', 'source ~/.zshrc') to apply changes.
```

So keyring (what's in the failure message) is part of Gnome, that's
present in the full Ubuntu GUI install, it's not part of the WSL
install.

I'm going to need to do this via environment variables!

## API Key Management

Ok, so... remember my post about
[speeding up my zsh shell](https://scottspence.com/posts/speeding-up-my-zsh-shell)?
Probably not I only posted it the other day, but it has some swish
bits in there for loading the SSH agent! I'm using that same approach
for managing API keys securely.

You don't have to follow this! Add your keys directly into your shell
config if you like, I'm writing this for future Scott essentially!

All the keys I want to use in Goose I'll add to a `~/.goose_keys`
file, this could alternately go into a `~/.config/api-keys` file but I
like things in home so I can poke around in there without having to go
digging elsewhere.

```bash
touch ~/.goose_keys
chmod 600 ~/.goose_keys
```

Then add in my key and the environment-specific configuration:

```bash
# Make sure to chmod 600 this file after creation

# OpenRouter API configuration
export OPENROUTER_API_KEY="secret-key-here"
```

Great! I'll update my current `.zshrc` config to load the keys:

```bash
# Lazy load API keys and sensitive configurations
function _load_api_keys() {
    if [ -f ~/.goose_keys ]; then
        if [ "$(stat -c %a ~/.goose_keys)" != "600" ]; then
            echo "Warning: ~/.goose_keys has incorrect permissions. Run: chmod 600 ~/.goose_keys"
        else
            source ~/.goose_keys
        fi
    fi
}

autoload -U add-zsh-hook
add-zsh-hook precmd _load_api_keys
```

Now if I try the `goose configure` command I get this:

```bash
$ goose configure

Welcome to goose! Let's get you set up with a provider.
  you can rerun this command later to update your configuration

┌   goose-configure
│
◇  Which model provider should we use?
│  OpenRouter
│
●  OPENROUTER_API_KEY is set via environment variable
│
◆  Would you like to save this value to your keyring?
│  ○ Yes  / ● No
└
```

I'll pick No, because there's no keyring! Then I'm prompted for the
model I want to use, the default is listed.

```bash
$ goose configure

Welcome to goose! Let's get you set up with a provider.
  you can rerun this command later to update your configuration

┌   goose-configure
│
◇  Which model provider should we use?
│  OpenRouter
│
●  OPENROUTER_API_KEY is set via environment variable
│
◇  Would you like to save this value to your keyring?
│  No
│
◆  Enter a model from that provider:
│  anthropic/claude-3.5-sonnet (default)
└
```

I'll hit enter to accept the default.

Then a last little confirmation:

```bash
◐  Checking your configuration...
└  Configuration saved successfully
```

Looks like I'm all set!

To start a Goose session it's `goose session` then I'm set to start
using it!

```bash
$ goose session
starting session | provider: openrouter model: anthropic/claude-3.5-sonnet
    logging to /home/username/.config/goose/sessions/iNy1kNmS.jsonl

Goose is running! Enter your instructions, or try asking what goose can do.

( O)>
```

Sweet! One last thing now is to check out what's been configured, you
may have seen references to where the config is:
`/home/scott/.config/goose/config.yaml`

I'll pop that open now to check out what's in there:

```yaml
GOOSE_MODEL: anthropic/claude-3.5-sonnet
GOOSE_PROVIDER: openrouter
extensions:
  developer:
    enabled: true
    name: developer
    type: builtin
```

And right now, that's not much!

## What comes in the box? 📦

Ok, so Goose comes with some built-in extensions:

1. **Developer**: Your basic dev tools - this one's on by default
2. **Computer Controller**: For web scraping and automation stuff
3. **Memory**: Helps Goose remember your preferences
4. **JetBrains**: For those IDE fans out there
5. **Google Drive**: File management with Google Drive

The Developer extension is enabled by default, I want to enable the
Computer Controller and Memory now using the `goose configure`
command:

```bash
$ goose configure

This will update your existing config file
  if you prefer, you can edit it directly at /home/scott/.config/goose/config.yaml

┌   goose-configure
│
◆  What would you like to configure?
│  ○ Configure Providers
│  ○ Toggle Extensions (Enable or disable connected extensions)
│  ● Add Extension
└
```

Goose configure you'd think to enable existing extensions it'd be
toggle extensions but it's not add extension, then built in extension.

```bash
┌   goose-configure
│
◇  What would you like to configure?
│  Add Extension
│
◆  What type of extension would you like to add?
│  ● Built-in Extension (Use an extension that comes with Goose)
│  ○ Command-line Extension
│  ○ Remote Extension
└
```

Now, instead of allowing me to select individual extensions to enable,
all I can do is select one at a time then go through the config again
for the next one! So, I'll select the Computer Controller extension
first:

```bash
┌   goose-configure
│
◇  What would you like to configure?
│  Add Extension
│
◇  What type of extension would you like to add?
│  Built-in Extension
│
◆  Which built-in extension would you like to enable?
│  ○ Developer Tools
│  ● Computer Controller (controls for webscraping, file caching, and automations)
│  ○ Google Drive
│  ○ Memory
│  ○ JetBrains
└
```

the CLI confirms it's enabled then I'm back in the terminal!

If you know which extensions you want it's quicker to edit the
`/home/username/.config/goose/config.yaml` file directly!

This is for me next time so I can copy and paste the config from this
post!

```yaml
GOOSE_PROVIDER: openrouter
GOOSE_MODEL: anthropic/claude-3.5-sonnet
extensions:
  computercontroller:
    enabled: true
    name: computercontroller
    type: builtin
  developer:
    enabled: true
    name: developer
    type: builtin
  memory:
    enabled: true
    name: memory
    type: builtin
```

You can check out the Goose
[extensions page](https://block.github.io/goose/v1/extensions/) where
you can see some of the built in extensions and how to install other
extensions.

The thing that got me excited about using Goose was the possibility to
use your own extensions (MCP tools!) I've made some of my own MCP
tools, you can see them on my GitHub or read about using them with
Claude Desktop in my
[Using MCP Tools with Claude and Cline](https://scottspence.com/posts/using-mcp-tools-with-claude-and-cline)
post.

## Adding in my own MCP tools

So, I have a few MCP tools I've built that I like to use (you can
[see them here on GitHub](https://github.com/spences10?tab=repositories&q=mcp&type=source&language=&sort=stargazers)
if you like) the thing is, the config I'm used to for Claude Desktop
and Cline is JSON but the config for Goose is YAML.

You can add in a MCP tool via the Goose CLI or just add them directly
to the config file. There's an example of the config on the
[Goose docs](https://block.github.io/goose/docs/getting-started/using-extensions#config-entry)

I'll follow that format and add them directly to the config file:

```yaml
GOOSE_PROVIDER: openrouter
GOOSE_MODEL: anthropic/claude-3.5-sonnet
extensions:
  computercontroller:
    enabled: true
    name: computercontroller
    type: builtin
  developer:
    enabled: true
    name: developer
    type: builtin
  memory:
    enabled: true
    name: memory
    type: builtin
  mcp-tavily-search:
    name: mcp-tavily-search
    cmd: npx
    args: [-y, mcp-tavily-search]
    enabled: true
    envs: { 'TAVILY_API_KEY': 'key-here' }
    type: stdio
  mcp-perplexity-search:
    name: mcp-perplexity-search
    cmd: npx
    args: [-y, mcp-perplexity-search]
    enabled: true
    envs: { 'PERPLEXITY_API_KEY': 'key-here' }
    type: stdio
  mcp-jinaai-search:
    name: mcp-jinaai-search
    cmd: npx
    args: [-y, mcp-jinaai-search]
    enabled: true
    envs: { 'JINAAI_API_KEY': 'key-here' }
    type: stdio
  mcp-jinaai-grounding:
    name: mcp-jinaai-grounding
    cmd: npx
    args: [-y, mcp-jinaai-grounding]
    enabled: true
    envs: { 'JINAAI_API_KEY': 'key-here' }
    type: stdio
  mcp-jinaai-reader:
    name: mcp-jinaai-reader
    cmd: npx
    args: [-y, mcp-jinaai-reader]
    enabled: true
    envs: { 'JINAAI_API_KEY': 'key-here' }
    type: stdio
  mcp-svelte-docs:
    name: mcp-svelte-docs
    cmd: npx
    args: [-y, mcp-svelte-docs]
    enabled: true
    type: stdio
  mcp-brave-search:
    name: mcp-brave-search
    cmd: npx
    args: [-y, '@modelcontextprotocol/server-brave-search']
    enabled: true
    envs: { 'BRAVE_API_KEY': 'key-here' }
    type: stdio
  mcp-memory-libsql:
    name: mcp-memory-libsql
    cmd: npx
    args: [-y, mcp-memory-libsql]
    enabled: true
    envs: { 'LIBSQL_URL': 'file:/home/scott/repos/memory-tool.db' }
    type: stdio
  mcp-sequentialthinking-tools:
    name: mcp-sequentialthinking-tools
    cmd: npx
    args: [-y, mcp-sequentialthinking-tools]
    enabled: true
    type: stdio
  mcp-wsl-exec:
    name: mcp-wsl-exec
    cmd: npx
    args: [-y, mcp-wsl-exec]
    enabled: true
    type: stdio
```

Ok, I'm now set up with the built-in extensions and my own MCP tools!

I'm still exploring Goose's features and practical use, so, still
early days, from what I can glean from interactions is that it's
claude desktop in the terminal 😂

The specific Goose features I'm still trying out, like iterating on
something in the terminal and a code editor.

## What's Next? 🚀

Ollama, I've downloaded DeepSeek model and tried that out with Goose
but it's not compatible there appears to be people working on
[deepseek-goose-models](https://github.com/michaelneale/deepseek-goose-models)
so I'll be taking a look at that at some point.

That's it! I'mm going to give this a good crack now and try
incorporate it into my workflow!

## Quick Reference

This is for me when I need to come back to this!!

- Config location: `~/.config/goose/config.yaml`
- API keys: `~/.goose_keys`
- Permissions:
  - Key files: `chmod 600`

List of Goose commands:

```bash
# Session Management
goose session                         # Start a new chat session
goose session -r                      # Resume the last session
goose session -n test                 # Start a new session named "test"
goose session -r -n test              # Resume a specific session named "test"

# Extension Management
goose session --with-builtin name     # Add a builtin extension by name
goose session --with-extension 'cmd'  # Add a custom extension using command

# Configuration
goose configure                       # Configure Goose settings

# Other Commands
goose agents                          # List available agent versions
goose run                             # Execute commands from instruction file/stdin
goose help                            # Show help message
goose help <command>                  # Show help for specific command

# Version
goose -v                              # Show version information
```

This reference covers the main commands available in Goose. Each
command also has additional options that can be viewed using
`goose <command> --help` for more detailed information.

That's it! Hope this helps if you're setting up Goose on WSL!
