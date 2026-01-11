---
date: 2026-01-11
title: GitHub CLI Installation Guide for WSL (Ubuntu)
tags: ['guide', 'notes']
is_private: false
---

<!-- cspell:ignore Clauding mktemp githubcli dpkg -->

Real quick on this one! I need to document it though as this has been
a persistent pain for me for a while! Getting the GitHub `gh` CLI to
work in Windows Subsystem for Linux (WSL). Well, turns out it's still
an issue! But with some searching and Clauding I was able to get it
working!

Anyway **Tl;Dr** go to here [WSL auth](#wsl-auth)

## Install command

So, first up that scary looking install command from the [official
GitHub CLI docs]:

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && sudo mkdir -p -m 755 /etc/apt/sources.list.d \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y
```

Like? Really?? I know most installers be in a "trust me bro" install
script but compare that to the `brew install gh` for Homebrew users!
Or how I installed in Arch `yay github-cli` feels a bit janky.

## What each part does

I had Claude break down the commands and what they do here:

| Command                                                                            | Purpose                                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `type -p wget >/dev/null \|\| (sudo apt update && sudo apt install wget -y)`       | Checks if `wget` exists; installs it if missing                                                |
| `sudo mkdir -p -m 755 /etc/apt/keyrings`                                           | Creates the keyrings directory with proper permissions (read/execute for all, write for owner) |
| `out=$(mktemp)`                                                                    | Creates a temporary file and stores its path in `$out`                                         |
| `wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg`    | Downloads GitHub's GPG signing key to the temp file (`-nv` = not verbose)                      |
| `cat $out \| sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null` | Copies the key to the keyrings directory (needs `tee` for sudo write permissions)              |
| `sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg`                  | Makes the key readable by group and others                                                     |
| `sudo mkdir -p -m 755 /etc/apt/sources.list.d`                                     | Ensures the apt sources directory exists                                                       |
| `echo "deb [arch=... signed-by=...] https://cli.github.com/packages stable main"`  | Constructs the apt source entry with your CPU architecture and the signing key path            |
| `\| sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null`                  | Writes the source entry to a new apt list file                                                 |
| `sudo apt update`                                                                  | Refreshes package lists (now includes GitHub's repo)                                           |
| `sudo apt install gh -y`                                                           | Installs the `gh` package without prompting                                                    |

The `&&` chains mean each command only runs if the previous one
succeeded.

## Authenticate

That's it! Then the fun begins with trying to auth in WSL.

```bash
gh auth login
```

Follow the prompts:

1. Select **GitHub.com**
2. Select **HTTPS** (or SSH if you prefer)
3. Choose **Login with a web browser**

But don't! Skip to the next section.

## WSL auth

This is a [known issue] affecting WSL users. If you get this error:

```
failed to authenticate via web browser: Too many requests have been made in the same timeframe. (slow_down)
```

**Fix:** When prompted to press Enter to open the browser, **don't
press it yet**. Instead:

1. Copy the one-time code shown
2. Manually open https://github.com/login/device in your browser
3. Paste the code
4. Complete auth in browser
5. Return to terminal

Success??! This is what worked for me and this is why I'm documenting
here!

This workaround is [documented in the issue comments] and worked for
me!

## Verify installation

Check if all good by checking the version and the auth status.

```bash
gh --version
gh auth status
```

## Done

I'm now able to use the GitHub CLI in my WSL with (so far) no issues!

<!-- Links -->

[official GitHub CLI docs]:
	https://github.com/cli/cli/blob/trunk/docs/install_linux.md
[known issue]: https://github.com/cli/cli/issues/9370
[documented in the issue comments]:
	https://github.com/cli/cli/issues/9370#issuecomment-3476377562
[WSL clock skew]:
	https://github.com/cli/cli/issues/9370#issuecomment-3405646845
