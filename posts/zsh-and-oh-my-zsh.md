---
date: 2020-12-08
title: Notes on Zsh and Oh My Zsh
tags: ['zsh', 'learning', 'guide']
isPrivate: false
---

<script>
  import { Sarcasm } from '$lib/components'
</script>

<!-- cSpell:ignore Sooooooo -->

Sooooooo, so, so, so, Zsh is pretty neat, right?

I've been a long time fan of the Fish shell, but I recently had to go
full on with a Zsh shell and decided to give it a proper go.

The main selling points for Fish shell to me over anything else was
not having to prefix directory changes with a `cd` all the time, just
typing out the path you wanted to go to would offer up auto suggest of
paths to use.

That was enough to have me sold on it, there's also abbreviations and
aliases all super nice to use and that is pretty much the extent of
the sort of perks I like to have.

Oh! I should mention themes, themes in Fish with [Oh My Fish] were
also a great selling point for me!

## Oh My Zsh

Zsh has [Oh My Zsh] which offers up a similar framework for managing
your Zsh configuration.

So the majority of the setup I got for my Zsh shell was from following
Nicky Meuleman's guide on [Linux on windows WSL2 ZSH Docker].

Nicky's guide covers getting setup with Zsh and Oh My Fish, but I'll
condense it into the terminal commands here for continuity:

```bash
# I'm on Ubuntu so
sudo apt install zsh
# default the shell to Zsh
chsh -s $(which zsh)
# one liner to install OMZ
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Then I can add all the plugins and themes I want, sort of!

Unlike Oh My Fish, it's not just a case of command line installing
themes and plugins like you do with Oh My Fish. With Oh My Zsh there's
some config file you need to edit. Oh My Zsh (which I'm now
abbreviating to OMZ) gives you a whopper of a config file (`.zshrc`)
that you use to configure your Zsh.

The file `.zshrc` is in the home directory so I can pop it open with:

```bash
nano ~/.zshrc
```

Some plugins come out of the box with OMZ, here's what I enabled
straight away.

```text
plugins=(
  git
  node
  npm
  npx
  nvm
)
```

<!-- cSpell:ignore agnoster -->

And I changed the theme to `ZSH_THEME="agnoster"`, pretty sweet theme
out of the box!

## Themes

One theme I really liked with Fih shell was [Spacefish] and I spent a
lot longer than I should have done looking through the [Zsh Wiki
Themes] before discovering there's also [external themes for Zsh]
where I found [Spaceship ZSH], which looks identical to Spacefish!

I did find [powerlevel10k] which looked really intriguing and I'm
probably going to try once I have finished writing this!

## Plugins

Ok, in Nicky's guide he details a couple of plugins to use which are
what has given it the edge or put it on feature parity with Fish.

- [zsh-syntax-highlighting]
- [zsh-autosuggestions]

Syntax highlighting so you know if you're entering a valid command and
auto suggestions which will bring up historically entered commands and
suggest them to you.

Auto suggestions wasn't working for me initially so I had to add the
`ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE` setting to my `.zshrc` file.

There's a couple of options to choose from I settled on foreground
colour and standout which is pretty neat.

```bash
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
```

The plugins need to be added to the `plugins` config in the `.zshrc`
file, that looks like this now:

```text
plugins=(
  git
  node
  npm
  npx
  nvm
  zsh-syntax-highlighting
  zsh-autosuggestions
)
```

## Plugins/themes location?

Plugins and themes, some are really not that helpful (documentation
wise) when it comes to installing them.

But hey <Sarcasm>it's open source so if you're not happy you can
always ask for your money back</Sarcasm>, right? 😂

If the instruction is along the lines of, clone the repo then there is
a path you can specify when cloning it.

This is the clone location for `zsh-syntax-highlighting` that can be
swapped out with the theme/plugin you're using, just be sure to swap
out `plugins` with `themes` if you're cloning a theme.

```bash
git clone \
  https://github.com/zsh-users/zsh-syntax-highlighting \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

## Abbreviations

One killer feature of Fish is the abbreviations, so you can shorten
down things like `yarn && yarn develop` into `yyd` hitting enter will
expand that out into the full command and run it.

<!-- cSpell:ignore gotbletu -->

I was quite keen to find something like that in Zsh and I did in the
form of a [video from gotbletu] with accompanying [GitHub repo] for
the code example.

I added that to my `.zshrc` file, like so:

```bash {3,15}
#-------- Global Alias {{{
globalias() {
  if [[ $LBUFFER =~ '[a-zA-Z0-9]+$' ]]; then
    zle _expand_alias
    zle expand-word
  fi
  zle self-insert
}
zle -N globalias
bindkey " " globalias                 # space key to expand globalalias
# bindkey "^ " magic-space            # control-space to bypass completion
bindkey "^[[Z" magic-space            # shift-tab to bypass completion
bindkey -M isearch " " magic-space    # normal space during searches

. ~/.zsh_aliases

#}}}
```

You'll notice that I have added lower case variables to the if
statement from `'[A-Z0-9]+$'` to `'[a-zA-Z0-9]+$'` and that I have
abstracted out the aliases into their own file `.zsh_aliases` this is
because I have a lot of aliases for things.

If you're interested in checking out my configuration for Zsh you can
see my [`dotfiles`] on GitHub.

## What's next?

That's it for this, I felt that I should put down what I know now then
maybe revisit this after using Zsh for a while.

So far, I like it because I have all the toys I like to play with! 😊

I'll be having a look at [powerlevel10k] sometime soon as it looks
pretty swish!

<!-- Links -->
<!-- cSpell:ignore powerlevel -->

[oh my fish]: https://github.com/oh-my-fish/oh-my-fish
[spacefish]: https://github.com/matchai/spacefish
[spaceship zsh]: https://github.com/denysdovhan/spaceship-prompt
[zsh wiki themes]: https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
[external themes for zsh]:
  https://github.com/ohmyzsh/ohmyzsh/wiki/External-themes
[powerlevel10k]: https://github.com/romkatv/powerlevel10k
[oh my zsh]: https://github.com/ohmyzsh/ohmyzsh
[linux on windows wsl2 zsh docker]:
  https://nickymeuleman.netlify.app/blog/linux-on-windows-wsl2-zsh-docker#zsh
[zsh-syntax-highlighting]:
  https://github.com/zsh-users/zsh-syntax-highlighting
[zsh-autosuggestions]:
  https://github.com/zsh-users/zsh-autosuggestions
[video from gotbletu]: https://www.youtube.com/watch?v=WTTIGjZAMGg
[github repo]:
  https://github.com/gotbletu/shownotes/blob/master/zsh_global_alias_expansion.md
[`dotfiles`]: https://github.com/spences10/dotfiles
