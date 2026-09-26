---
date: 2026-09-09
title: Moving my development setup from EndeavourOS to Ubuntu
tags: ['ubuntu', 'linux', 'notes']
is_private: false
---

<!-- cspell:ignore EndeavourOS Ghostty WezTerm Espanso inotify sysctl zeditor Helium Spaceship pnpm keybindings symlinks dearmor Sourcegraph publickey owlz kglobalshortcutsrc -->

I created a development setup from EndeavourOS to Ubuntu 26.04. It's
for work: they need 1Password's security check scripts running, and
the drive has to be encrypted. My machine runs EndeavourOS, so I
needed an Ubuntu environment alongside it.

Ubuntu is on a Framework expansion card, and EndeavourOS is still on
the internal SSD, so the old drive is mounted and available to copy
things from. Nice! All my settings are there. This should be
straightforward.

Then WezTerm complained about a missing font, my shell was missing its
framework, and Zed kept opening Firefox when I wanted Helium. 😅

This is another one of those posts for future me. The initial transfer
copied preferences, but getting the applications to behave like my old
setup needed a few more steps. By the time I was configuring
shortcuts, I was using KDE Plasma on Wayland.

## Start with a migration log

I had an `Ubuntu-settings-migration.md` file recording what had been
copied. Git configuration, Zsh files, terminal settings, editor
settings and Espanso expansions were already there.

Applications, editor extensions, fonts, browser profiles and SSH keys
hadn't been included in that first pass.

That distinction mattered! Having a settings file on disk doesn't mean
everything it refers to is installed. I kept the original drive
available as a reference and backed up destination files before
changing them.

## Terminal settings need their fonts

Ghostty is available through Ubuntu 26.04's package repositories:

```bash
sudo apt update
sudo apt install ghostty zsh git curl gnupg
```

For WezTerm I used the repository listed in its Linux installation
instructions:

```bash
curl -fsSL https://apt.fury.io/wez/gpg.key \
  | sudo gpg --yes --dearmor -o /usr/share/keyrings/wezterm-fury.gpg

sudo chmod 644 /usr/share/keyrings/wezterm-fury.gpg

echo 'deb [signed-by=/usr/share/keyrings/wezterm-fury.gpg] https://apt.fury.io/wez/ * *' \
  | sudo tee /etc/apt/sources.list.d/wezterm.list

sudo apt update
sudo apt install wezterm
```

The install instructions are here:

- https://ghostty.org/docs/install/binary
- https://wezterm.org/install/linux.html#using-the-apt-repo

Both terminal configurations used `VictorMono Nerd Font Mono`. The
configuration had migrated; the font hadn't.

The exact font files were on the old drive, so I copied the Mono
variants into `~/.local/share/fonts/VictorMono` and refreshed the
cache. Replace the source path below with wherever your old
installation is mounted:

```bash
mkdir -p ~/.local/share/fonts/VictorMono
cp /path/to/old-root/usr/share/fonts/TTF/VictorMonoNerdFontMono-*.ttf \
  ~/.local/share/fonts/VictorMono/
fc-cache -f ~/.local/share/fonts
fc-match 'VictorMono Nerd Font Mono'
```

After restarting the terminals, they could use the right font. I'd
prefer a distro package for updates, but there wasn't a matching Nerd
Font package in my configured Ubuntu repositories.

## A shell configuration isn't the whole shell

My `.zshrc` expected Oh My Zsh and the Spaceship prompt, the setup
from [my updated Zsh config](/posts/my-updated-zsh-config-2025). The
first copy had included custom plugins and themes, but left out the Oh
My Zsh framework and skipped symlinks.

I restored the framework from the old installation, along with the
Spaceship links. That brought back Git integration,
`zsh-autosuggestions` and `zsh-syntax-highlighting`.

There were also startup lines loading Daytona completions and Vite+
environment settings from files that didn't exist on Ubuntu. Those
loads now check whether the optional files are present.

With startup checks passing, I changed the login shell:

```bash
chsh -s /usr/bin/zsh
```

Log out and back in for the login-shell change. To switch the current
terminal immediately:

```bash
exec zsh
```

## Restore the development tools separately

Volta's old metadata gave me the Node version and global packages to
reinstall. My default was Node 24.15.0, with pnpm, TypeScript, the
TypeScript and Svelte language servers, npm-check-updates and the
Sourcegraph CLI.

I installed Volta using `--skip-setup`, because the migrated shell
already configured `VOLTA_HOME` and its `bin` directory:

```bash
curl -fsSL https://get.volta.sh | bash -s -- --skip-setup
volta install node@24.15.0
```

Then I reinstalled the recorded package versions and checked the
commands from Zsh. That was a better fit here than copying an entire
old Node installation and hoping its dependencies still worked.

Volta's installer options: https://docs.volta.sh/advanced/installers

## SSH needed its own migration

The first GitHub connection asked me to confirm the host fingerprint,
then failed with `Permission denied (publickey)`.

Ubuntu didn't have my SSH key pair yet. Restoring it with the right
permissions got authentication working. I then copied the SSH host
configuration and the separate keys referenced by those hosts, and
merged the known-host entries with a backup.

The check was:

```bash
ssh -T git@github.com
```

GitHub's successful authentication message includes “does not provide
shell access”. That's expected. Checking that login worked didn't
verify every private repository or server connection, though.

## Zed settings and extensions are separate

Zed's settings, keybindings and snippets already matched the old
installation. The extensions were missing.

I added the old extension IDs to `auto_install_extensions` in the
settings file. Zed then installed all 14, including Night Owl,
Material Icon Theme, Svelte and WakaTime.

Here's the shape of that setting, with a smaller example list:

```json
{
	"auto_install_extensions": {
		"night-owlz": true,
		"material-icon-theme": true,
		"svelte": true
	}
}
```

Merge that into your existing settings rather than replacing the whole
file. Having the extension list alongside the preferences should make
the next move easier.

My shell also expected the Arch command name `zeditor`, while Zed's
installer provided `zed`. A `zeditor` symlink kept my existing aliases
and editor environment variables working.

Zed's extension documentation:
https://zed.dev/docs/extensions/installing-extensions

## The browser default rabbit hole

I use Helium for the accounts I'm signed into. Zed's sign-in button
kept opening Firefox.

Both `xdg-settings` and the HTTPS MIME association said Helium was the
default. Setting `BROWSER` in the shell and Zed's launcher didn't fix
it either.

Tracing a public URL through `xdg-open` showed it calling `kde-open`.
I explicitly set Helium in KDE's `BrowserApplication` setting and
reapplied the HTTP and HTTPS associations. That was the last change I
made before moving on.

I didn't test sign-in end to end afterwards, so I can't say which
setting was responsible. Setting `BROWSER` in the shell on its own
wasn't enough.

## Helium's saved tab groups

I wanted my tab groups back without replacing the new browser profile.
Chromium's saved groups use its sync storage layer, which Helium also
uses. In this profile the relevant records were inside
`Default/Sync Data/LevelDB`.

With Helium fully closed, I backed up the destination database and
merged only the saved tab-group records from a working copy of the old
database. The merge verified all 215 group-and-tab records and checked
that existing records were unchanged.

That's 215 records, not 215 groups! A group and the tabs inside it
have separate records. It was specific to my profiles rather than a
general fix, so I've not included the commands.

Chromium's storage overview:
https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/saved_tab_groups/README.md

## Plasma shortcuts and screenshots

Some familiar shortcuts were missing. I restored Ctrl+Shift+Esc for
System Monitor. Meta+Tab had also changed from Overview to window
switching; Meta+W still opened Overview.

The screenshot shortcut sent me down another small detour: Spectacle
wasn't installed. On Ubuntu the package is:

```bash
sudo apt install kde-spectacle
```

Comparing only `kglobalshortcutsrc` wasn't enough to inventory every
shortcut. Spectacle's launcher on the old drive also supplied default
bindings, including Print Screen and Meta+Shift+S.

## The inotify warning

Plasma warned that I was using 95% of the available inotify instances,
but only 1% of the watches. I wondered whether running from a storage
card had something to do with it.

The relevant difference was the configured limits. Ubuntu allowed 128
instances; the old EndeavourOS configuration allowed 1,024.

Inotify lets applications subscribe to file changes. Editors and dev
servers use it to notice edits. An instance is a monitoring
connection; watches are the files or directories monitored through it.

I restored the old limits in a local sysctl file:

```bash
printf '%s\n' \
  'fs.inotify.max_user_instances = 1024' \
  'fs.inotify.max_user_watches = 524288' \
  | sudo tee /etc/sysctl.d/99-inotify.conf

sudo sysctl -p /etc/sysctl.d/99-inotify.conf
```

These are the values from my old setup, and the change took effect
without rebooting.

The Linux reference:
https://man7.org/linux/man-pages/man7/inotify.7.html

## A few remaining checks

Espanso's settings and expansions were already copied, and I installed
its Wayland build. GitHub CLI was another separate install. I also
copied the complete `.pi` directory, including its databases and
backup, and verified that nothing remained to copy.

Copying a directory doesn't verify that every tool inside it runs on
the new distro. I still need to check those tools, Espanso's behaviour
in the apps I use, and any server-specific SSH access as I need it.

For next time, I'm keeping the detailed migration log local and the
general lessons here. Having the old drive available made recovering
the missing pieces much easier. Remembering which pieces were never
copied in the first place would have saved a fair bit of
head-scratching!
