---
date: 2022-05-22
title: Get Debian WSL Set Up For Web Development
tags: ['wsl', 'debian', 'guide']
isPrivate: false
---

Quick guide to getting Debian WSL set up for web development.

You can install Debian from the [Windows Store] and get started straight
away with using it, but there's a few things missing.

For me one of the first things I like to do is get set up with my
preferred shell Zsh with Oh My Zsh. I've documented [My Zsh Setup]
previously if you're interested in that.

Installing Zsh is a `sudo apt` command:

```bash
sudo apt install zsh
```

Installing Oh My Zsh with the recommended `curl` command gives an
error though, the Oh My Zsh install command is this:

```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

That gives an error in Debian:

```bash
-bash: curl: command not found
```

So, I can install the `curl` package with `sudo apt install curl` then
I'd be on my way, but then I get prompted again for more missing
packages.

There's a collection of packages in [`build-essential`] that will get
you set up with the basics for web development.

I'll install that along with `git` and `curl`, the `-y` flag is to
agree to installing the packages, you can omit that if you want to
choose what to install, I use it to skip having to agree to the
prompts.

```bash
sudo apt install build-essential git curl wget -y
```

Now if I run the `curl` command again to install Oh My Zsh, it works!

That's it! Real quick note for myself and the next time I come up
against this! 😊

<!-- Links -->

[windows store]:
	https://www.microsoft.com/store/productId/9MSVKQC78PK6
[`build-essential`]: https://packages.debian.org/sid/build-essential
[my zsh setup]: https://scottspence.com/posts/my-zsh-config
