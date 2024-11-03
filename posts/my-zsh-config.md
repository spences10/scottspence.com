---
date: 2022-04-14
title: My Zsh Config
tags: ['zsh', 'guide']
isPrivate: false
---

I've always bundled in my Zsh config with other guides I've done in
the past and never a stand alone post. So I'm making this now for my
reference.

I switched to Zsh around two years ago after being a long time [Fish]
shell user. The reason for the switch? I found Zsh to be a bit simpler
to configure. I'm by no means a power user but I like to have my own
preferred configuration.

## Install Zsh

Depending on your platform (I use Ubuntu on Windows Subsystem for
Linux - WSL) you can install Zsh with the following:

```bash
sudo apt install zsh
```

If you're on macOS and use Brew you can install Zsh with the
following:

```bash
brew install zsh
```

I've covered [installing Zsh and Oh My Zsh on Fedora] in another guide
as well.

## Install Oh My Zsh

Zsh has a framework that you can use with it called [Oh My Zsh] this
adds a lot of functionality to the shell, more on this in the guide.

Installing Oh My Zsh is as simple as:

```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Once installed you will have a `~/.zshrc` file that you can edit to
add additional functionality to the shell.

The `~` here represents the home directory of your current logged in
user. So if you were to do `cd ~` you would be in your home directory.

One of the joys of Zsh is that many commands are contextual so the
`cd ~` can be shortened to `~`.

Another nice one is changing directories, in bash you'd need to
`cd ..` to go back a directory. In Zsh you can use `..` to go back a
directory. To go back three directories you can use `...`.

Anyway, the [default `.zshrc` file] is filled with helpful comments to
guide you through its usage.

If you `cat` out the contents of the `.zshrc` (with `cat ~/.zshrc`)
file you'll see something similar to what I just linked.

You can edit the `.zshrc` file with your text editor of choice, I use
`nano` but you can use any text editor, VS Code even, use
`code ~/.zshrc` from the terminal to start editing with VS Code.

## Oh My Zsh configuration

So if we take a look at my current configuration, it's a bit sparse
compared to the default file you get:

```bash
# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="spaceship"

plugins=(
  git
  zsh-syntax-highlighting
  zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh

# User configuration

# auto suggest
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"

# starting dir
cd ~/repos

# nvm config
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

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

SPACESHIP_PROMPT_ADD_NEWLINE="true"
SPACESHIP_CHAR_SYMBOL="⚡"

# Turn off power status when using spaceship prompt
export SPACESHIP_BATTERY_SHOW=false
```

<!-- cSpell:ignore lbuffer -->

There's quite a bit in there I know, so that's my full file, really
all that I'm using from the default config is this:

```bash
# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="spaceship"

plugins=(
  git
  zsh-syntax-highlighting
  zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh
```

And that has been augmented with some plugins with the `spaceship`
theme and the `zsh-syntax-highlighting` and `zsh-autosuggestions`
plugins.

## Adding plugins and themes

I'll cover them now [`zsh-syntax-highlighting`] is syntax highlighting
for the shell, so if you type out a command that's not recognised it
will show the command in red and it will also give syntax highlighting
to commands entered into the shell.

[`zsh-autosuggestions`] will show previously typed in commands to help
with auto completion.

Finally I'm a massive fan of the [`spaceship`] prompt back from my
Fish shell days!

I've linked the repositories for them which will have install
instructions, I'm going to list out the installation I use here:

```bash
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

Once the plugins are installed I'll add them to the `plugins` array:

```bash
plugins=(
  git
  zsh-syntax-highlighting
  zsh-autosuggestions
)
```

For Zsh autosuggest there's a variable that I set that highlights the
background of the suggested command, that need to go into the
`~/.zshrc` file as detailed my
[configuration](#oh-my-zsh-configuration):

```bash
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
```

Then install the Zsh theme for [`spaceship`] with:

```bash
# clone the repo to the Zsh custom theme directory
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt" --depth=1
# symlink it
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
```

And set the theme in the `~/.zshrc` file:

```bash
ZSH_THEME="spaceship"
```

There's a `UPower-WARNING` you might see in the terminal, this is
looking for the battery meter, if you're not using a laptop this may
cause some confusion, there's a workaround for it.

The error message looks something like this:

<!-- cSpell:ignore upower,upowerd,cantu -->

```bash
(upower:185): UPower-WARNING **: 18:38:44.618: Cannot connect to upowerd: Could not connect: No such file or directory
```

There’s a post on [Miguel Alex Cantu]’s blog about this and there’s a
spaceship config option for it.

```bash
# nano ~/.zshrc
# Turn off power status when using spaceship prompt
export SPACESHIP_BATTERY_SHOW=false
```

## Starting directory

As I'm a WSL user I like to set the starting directory in my
`~/.zshrc` file. You might not need to do this depending on your
setup.

## nvm

I'm an nvm user, this means I can switch between different versions of
node, after running the install command here:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | zsh
source ~/.zshrc
command -v nvm
# sets default to 14
nvm install 14
# nvm alias default 14
```

This configuration gets added to the `~/.zshrc` file:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

## Global aliases

<!-- cSpell:ignore gotbletu -->

Global aliases I learned from a great [video from gotbletu] on
YouTube!

Check it out! More details on the [Zsh and Oh My Zsh] post I did at
the end of 2020.

I have a list of global aliases I like to use in my [dotfiles
on github].

## Wrapping up

That's it! My very own Zsh configuration! Like I said at the start
this is mainly for my reference, but, if you have read through it and
found it useful then that's a massive win for me! Thank you 🙏

<!-- Links -->

[fish]: https://fishshell.com/
[oh my zsh]: https://ohmyz.sh/
[installing zsh and oh my zsh on fedora]:
	https://scottspence.com/posts/wsl-web-developer-setup-with-fedora-35#install-zsh-and-oh-my-zsh
[default `.zshrc` file]:
	https://github.com/ohmyzsh/ohmyzsh/blob/master/templates/zshrc.zsh-template
[`zsh-syntax-highlighting`]:
	https://github.com/zsh-users/zsh-syntax-highlighting
[`zsh-autosuggestions`]:
	https://github.com/zsh-users/zsh-autosuggestions
[`spaceship`]: https://github.com/spaceship-prompt/spaceship-prompt
[miguel alex cantu]:
	http://blog.miguelalexcantu.com/2020/12/fixing-upower-warning-wslzshspaceship.html
[video from gotbletu]: https://www.youtube.com/watch?v=WTTIGjZAMGg
[zsh and oh my zsh]:
	https://scottspence.com/posts/zsh-and-oh-my-zsh#abbreviations
[dotfiles on github]:
	https://github.com/spences10/dotfiles/blob/main/.zsh_aliases
