---
date: 2020-12-14
title: Fish Shell Introduction
tags: ['learning', 'guide']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

As a developer you spend a lot of time in the terminal so it's
important to be happy and as productive as possible whilst you're in
there.

This is why I'm a big fan of the Fish Shell in particular. The Fish
Shell is a user friendly shell with really handy features like
auto-suggestions and tab completions that come preconfigured, no need
to install additional plugins and mess around with config files.
That's not to say Fish Shell isn't configurable, there are plugins
available.

## Tl;Dr

If you prefer to watch how this is done then skip all the way to the
end for a [video detailing the process](#video-detailing-the-process).
🚀

## Navigation

Ok, let's look at a typical navigation example in bash, if you want to
change directory, you have to enter `cd` followed by the directory
name. In Fish you only need to type out the directory name.

Similarly if you want to go back a directory in bash, you need to
start with `cd` in Fish it's just a case of `../`.

```bash
# change directories in bash
cd Downloads
cd ../
# change directories in fish
Downloads/
../
```

## Auto-suggestions

Fish will suggest both directories and commands as you type away, you
will see suggestions in grey which you can tab onto to select.

If you want to go through you last `yarn` (or `npm`) commands, rather
than (like in bash) arrow through all you previously entered commands
(I know you can use `Ctr+r` in bash) or print out the history and look
at that.

In Fish if you start typing out your command, let's say `yarn` you can
then arrow through all commands that have included `yarn` it doesn't
even have to be the beginning of the command, if you have used a
package and want to know what else you installed with it at the time
you can use the package name then arrow though all command with that
keyword in there.

## Aliases

Aliases are where you're too lazy to keep typing in the full command
again and again so you make a shorter one, for me I have aliased `git`
to `g` in Fish, (I know, but that extra two characters over time is a
lot).

Aliases in shells like bash and zsh you need to open your config file
and find a appropriate place to add you alias. In

To make aliases in Fish shell use:

```bash
alias yga 'yarn global add'
# remember to save it
funcsave yga
```

## Abbreviations

Abbreviations are like having text expander in your terminal, so much
like with the aliases I can shorten `git` to `g` the difference with
abbreviations is that hitting the spacebar after that will expant it
out to git.

```bash
# add yarn global add
abbr -a yga 'yarn global add'
# type yga then space, result is 👇
yarn global add
```

## Install fresh Fish shell

Ok, time to go over an install, this is specifically for Windows
Subsystem Linux (WSL) but is the same instructions if you're on Linux:

```bash
sudo apt -y install fish
```

Depending on what version of Ubuntu you're on you may need to add [the
v3 package] which consists of adding a PPA:

```bash
# check your fish version
fish -v
# if the version isn't v3 add the PPA 👇
sudo apt-add-repository ppa:fish-shell/release-3
sudo apt update && sudo apt install fish -y
fish -v
# fish, version 3.1.2 👍
```

As a side note, I use fish on my work hardware so for macOS using brew
it's:

```bash
brew install fish
curl -L https://get.oh-my.fish | fish
sudo bash -c 'echo /usr/local/bin/fish >> /etc/shells'
chsh -s /usr/local/bin/fish
```

## Set fish as default shell

At this point I'm still in bash and can change to Fish by entering
`fish` in bash to switch to it.

If I want to default to Fish each time I can use the `chsh` command:

```bash
# if you want to default to fish shell
# use this command in bash
chsh -s $(which fish)
# use this command in fish
chsh -s (which fish)
```

## The bashrc equivalent in Fish

One thing about using WSL is that it always starts the shell in the
users folder on the C drive, I'll change this by defaulting the start
location to a folder of my choosing.

```bash
# create a repos folder in my home folder
mkdir ~/repos
# edit the fish config
nano ~/.config/fish/config.fish
# add the starting directory in there
cd ~/repos
```

## Oh My Fish (OMF)

[Oh My Fish] is touted as the Fishshell Framework but all I have used
it for is the extensive themes available, once you have installed OMF
you can list them out in the terminal with: `omf theme`

There's previews available on the [OMF Themes Markdown doc].

To install OMF:

```bash
curl -L https://get.oh-my.fish | fish
```

There's a few things I'll install with `omf`:

```bash
omf install spacefish nvm
```

## Install nvm

As I'll need to have node installed I'll be using nvm to manage my
node versions:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```

Because I installed the nvm package with fish there's no need to worry
about adding the variables output from the nvm insall, I can install
my required node version:

```bash
nvm install 14
```

## Install yarn

Lastly there are projects I work on that use Yarn so I'll need to
install that too, in this case it's the instructions from the [Yarn
site].

```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn -y
```

## Video detailing the process

<YouTube youTubeId="IJAEzWG6Uw4" />

## Wrap and recap!

That's it, I've detailed some of the advantages of using the Fish
shell and detailed getting set up from a fresh install.

Thanks 👍

<!-- Links -->

[omf themes markdown doc]:
  https://github.com/oh-my-fish/oh-my-fish/blob/master/docs/Themes.md
[extensive list]:
  https://github.com/oh-my-fish/packages-main/tree/master/packages
[oh my fish]: https://github.com/oh-my-fish/oh-my-fish
[the v3 package]:
  https://github.com/fish-shell/fish-shell#packages-for-linux
[yarn site]:
  https://classic.yarnpkg.com/en/docs/install/#debian-stable
