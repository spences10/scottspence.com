---
date: 2025-02-07
title: My Updated ZSH Config 2025
tags: ['zsh', 'guide', 'notes']
is_private: false
---

So, this is my updated Zsh config! To be honest there's little that's
changed over the years since I originally posted about this a good
three years ago now in
[My Zsh Config](https://scottspence.com/posts/my-zsh-config). But! The
changes are substantial enough for me to justify a new post. I
essentially write this for me to come back to when I need to go
through this process again.

With the improvements I discovered on a whim when I thought to myself,
"should opening this shell up always be this slow?" Then went on a
little side quest in
[Speeding Up My ZSH Shell](https://scottspence.com/posts/speeding-up-my-zsh-shell)
so I thought I better document the rest of the changes I made.

Tl;Dr: It's essentially the same config, but faster (see previous
paragraph) and with Volta instead of nvm. 😂

Much like the previous post though, this will be a walkthrough of
getting set up, from scratch with a new shell! I'll be walking through
this in a fresh install of Ubuntu 24.04.

## Install Zsh

Ok, as stated, this is going to be a fresh install of Ubuntu 24.04,
I'll be going through the steps I do, so you can follow along, I'll be
adding links to the sources if you're not ok with pasting random
commands into your terminal!

```bash
sudo apt install zsh -y
# enter sudo password
```

This will install Zsh but that's it, I can access from here by
entering `zsh` but I'm not going to do that I'm going to go straight
to installing Oh My Zsh.

## Install Oh My Zsh

So, [Oh My Zsh](https://ohmyz.sh) (for my use case) allows you to add
plugins and themes, which is what I'm using it for. There's a load of
other super useful stuff on there which I've not looked into, like,
ever! 😅

Install is a one liner from the website:

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# when prompted to change default to zsh, enter y
# enter sudo password again
```

So, I'm prompted to change default to zsh, and yes, I do want that,
thanks!

Now, for me, I'm essentially gutting the `.zshrc` file and adding in
my config I've detailed in the
[Speeding Up My ZSH Shell](https://scottspence.com/posts/speeding-up-my-zsh-shell)
post.

You can have a poke around in the `.zshrc` file, there's a load of
info in there to get familiar with the file contents.

Have a look around, I use `nano` to edit files:

```bash
nano ~/.zshrc
```

For the next section I'm essentially adding in the theme and plugins
I'm using. So, going from this:

```bash
ZSH_THEME="robbyrussell"

plugins=(git)
```

To this:

```bash
ZSH_THEME="spaceship"

plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

For the purposes of this exercise, this is just to confirm the theme
and plugins are working, I'll switch to my preferred config when it's
up and running.

After editing the `.zshrc` file in nano it's `Ctrl+o` to save and
`Ctrl+x` to exit the file.

## Adding plugins and themes

So, Zsh plugins! There's a lot! I essentially use three, the built in
`git` one and
[`zsh-autosuggestions`](https://github.com/zsh-users/zsh-autosuggestions)
and
[`zsh-syntax-highlighting`](https://github.com/zsh-users/zsh-syntax-highlighting).
That's it, you can go bananas installing all you like, there's a
performance overhead though so be aware of this if you adding in a
load of extensions.

For the auto suggestions plugin, in the
[instructions](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md)
in the GitHub repo it's essentially add this (`zsh-autosuggestions`)
to your plugin array and run this command:

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

Then add in my autosuggest preferred settings:

```bash
# Autosuggest settings
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE="20"
ZSH_AUTOSUGGEST_USE_ASYNC=1
```

That's going to give me some nice looking autosuggestions now!

Onto the syntax highlighting, same again, I already have the
`zsh-syntax-highlighting` in the plugin array and in the
[instructions](https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md)
it's run this command:

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

Done for the plugins! Now the theme!

I like
[Spaceship Prompt](https://github.com/spaceship-prompt/spaceship-prompt),
there's loads of other options out there, I've been with this one for
many years now and see no reason to switch!

```bash
# Clone the repo
git clone https://github.com/spaceship-prompt/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt" --depth=1
# Link the theme
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
```

There's a load of config you can use for spaceship, see the
[spaceship-prompt](https://github.com/spaceship-prompt/spaceship-prompt)
repo for details! I'll be taking my preferred config from the
[Speeding Up My ZSH Shell](https://scottspence.com/posts/speeding-up-my-zsh-shell)
post.

```bash
ZSH_THEME="spaceship"

# Spaceship settings
SPACESHIP_PROMPT_ASYNC=true
SPACESHIP_PROMPT_ADD_NEWLINE=true
SPACESHIP_CHAR_SYMBOL="⚡"

# Minimal spaceship sections for performance
SPACESHIP_PROMPT_ORDER=(
  time
  user
  dir
  git
  line_sep
  char
)
```

Aight! Plugins and theme sorted!

## Volta

So, as a JavaScript developer I need tooling and differing node
versions, nvm was the way for me until I was recommended
[Volta](https://volta.sh) by [JYC](https://jyc.dev/card), thanks!

So, this isn't essentially a Zsh thing and more of a me thing! But,
this is what I'll be referring to when I want to get set up with a new
shell instance! For me, this is exactly where this should be!

Install is a one liner from the website:

```bash
curl https://get.volta.sh | bash
```

So, now I can install node, pnpm, npm-check-updates, etc. Essentially
any global package I need, I install it with Volta now.

## Global aliases

I still use the super awesome auto expansions from gotbletu (no idea
how to pronounce that!) but the video (from over 7 years ago now) on
[ZSH Global Alias Expansion - Linux ZSH](https://www.youtube.com/watch?v=WTTIGjZAMGg)
is still solid and what I still have in my config!

Check out my
[dotfiles](https://github.com/spences10/dotfiles/blob/main/.zsh_aliases)
repo for that and my `.zshrc` config too!

## The Config

That's it, as mentioned earlier you can check out my
[dotfiles](https://github.com/spences10/dotfiles) repo for the full
config!

Here's where I'm at with it currently:

```bash
# Performance optimizations
DISABLE_AUTO_UPDATE="true"
DISABLE_MAGIC_FUNCTIONS="true"
DISABLE_COMPFIX="true"

# Cache completions aggressively
autoload -Uz compinit
if [ "$(date +'%j')" != "$(stat -f '%Sm' -t '%j' ~/.zcompdump 2>/dev/null)" ]; then
    compinit
else
    compinit -C
fi

# Oh My Zsh path
export ZSH="$HOME/.oh-my-zsh"

# Theme config
ZSH_THEME="spaceship"

# Spaceship settings
SPACESHIP_PROMPT_ASYNC=true
SPACESHIP_PROMPT_ADD_NEWLINE=true
SPACESHIP_CHAR_SYMBOL="⚡"

# Minimal spaceship sections for performance
SPACESHIP_PROMPT_ORDER=(
  time
  user
  dir
  git
  line_sep
  char
)

# Carefully ordered plugins (syntax highlighting must be last)
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
)

# Source Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Autosuggest settings
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE="20"
ZSH_AUTOSUGGEST_USE_ASYNC=1

# Alias expansion function
globalias() {
   if [[ $LBUFFER =~ '[a-zA-Z0-9]+$' ]]; then
       zle _expand_alias
       zle expand-word
   fi
   zle self-insert
}
zle -N globalias
bindkey " " globalias
bindkey "^[[Z" magic-space
bindkey -M isearch " " magic-space

# Lazy load SSH agent
function _load_ssh_agent() {
    if [ -z "$$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null
        ssh-add ~/.ssh/id_github_sign_and_auth 2>/dev/null
    fi
}

autoload -U add-zsh-hook
add-zsh-hook precmd _load_ssh_agent

# Path configurations
export VOLTA_HOME="$HOME/.volta"
PATH="$VOLTA_HOME/bin:$PATH:/home/scott/.turso:/home/scott/.local/bin"
export PATH

# Source aliases last
[ -f ~/.zsh_aliases ] && source ~/.zsh_aliases
```

## Wrapping Up

Ok, so that's my Zsh config updated! Everything's running super smooth
now. The shell opens instantly with the improvements I made in the
[Speeding Up My ZSH Shell](https://scottspence.com/posts/speeding-up-my-zsh-shell)
post, I've got Volta handling my global tool installs, and
everything's set up just how I like it.

If you're following along with this, remember this is my config that
I've tweaked over the years - take what works for you and leave what
doesn't!

Like I said at the start, I write these posts mainly for me to refer
back to when I inevitably need to set up a new machine. But if you've
found it useful, that's awesome! 🙌

Right, back to actually using the terminal instead of tweaking it...
until the next side quest catches my eye! 😅
