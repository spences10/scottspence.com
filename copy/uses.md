<!-- cspell:ignore Ghostty nopeek WezTerm -->

<script>
  import {
    DateUpdated, 
    Small
  } from '#lib/components/index.js'
</script>

# Uses

<Small>
  Last updated: <DateUpdated date="2026-08-25" small="true" />
</Small>

This is the hardware and software I use for product engineering,
writing, video, and far too much coding-agent experimentation.

## Workstation

My main machine is a Framework Laptop 13 with an AMD Ryzen AI 9 HX
370, 64 GB of memory, Radeon 890M graphics, and a 1 TB NVMe drive. At
my desk, I use the laptop screen with two external displays.

The current input and audio setup is a Keychron Q3 keyboard, a
Keychron Q0 number pad, a Logitech mouse, and a Shure MV7 microphone.
The laptop has Framework's second-generation webcam module.

The Framework replaced the small-form-factor desktop from my [first PC
build] post. I wanted a repairable machine with enough memory for
several repositories, language servers, local databases, containers,
and coding-agent sessions at the same time.

## Operating system and terminal

My main development system is [EndeavourOS] with KDE Plasma. I moved
to it after years of using Windows and WSL. I still keep Windows
available for the software and hardware that need it.

I switched from Ghostty to WezTerm in July 2026. It uses a custom Neon
Afterglow colour scheme based on my Zed theme, Victor Mono, and the
same tab shortcuts I had configured in Ghostty. I use Zsh for the
shell and pnpm for JavaScript and TypeScript projects.

My public [dotfiles] and [settings] repositories contain the parts of
the setup that are useful to share.

## Editor and coding agents

Zed has been my main graphical editor since May 2026. I like the
speed, project-wide editing, built-in collaboration features, and the
fact I can keep repository settings next to the code. I still keep VS
Code available, but Zed is where I do my day-to-day editing now.

Most agent-assisted work happens beside it in WezTerm through [my-pi],
my customised Pi coding-agent environment.

The setup includes:

- MCP tools for search, documentation, SQLite, and workflow
  automation;
- LSP diagnostics, definitions, references, and document symbols;
- local session recall and focused context retrieval;
- evals, telemetry, scope controls, and deterministic validation;
- secret-safe command execution with [nopeek];
- GitHub CLI, browser automation, and human review before changes
  ship.

I use several models and providers. The workflow matters more than
which model is fashionable that week.

## Recording and media

I use OBS for screen recording and live sessions. For editing, I use
DaVinci Resolve for larger projects and simpler tools when the job
does not need a full editing suite.

## Other hardware

I use a Steam Deck for games. The Keychron Q3 and separate Q0 number
pad also confirm that I apparently needed another hobby with expensive
switches.

<!-- Links -->

[EndeavourOS]: /posts/switching-to-endeavouros-from-omarchy
[first PC build]: /posts/first-time-pc-build
[dotfiles]: https://github.com/spences10/dotfiles
[settings]: https://github.com/spences10/settings
[my-pi]: https://github.com/spences10/my-pi
[nopeek]: https://github.com/spences10/nopeek
