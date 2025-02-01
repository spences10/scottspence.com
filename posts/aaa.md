---
date: 2025-02-01
title: Speeding Up My ZSH Shell ⚡
tags: ['zsh', 'guide', 'notes']
is_private: false
---

<!-- cSpell:ignore zprof,zmodload,zcompdump,compinit,COMPFIX,Luca's,zcompdump,precmd,alternitives,Zinit,Jacek's -->

Super quick one I want to document here! I got myself on a side quest,
again! No biggie, my ZSH shell was taking ages to load. When I say
ages, more like 5+ seconds every time I opened a new terminal, that
sort of thing can add up. This is just something I've lived with over
the years, nothing has prompted this other than me wondering why it's
slow, then searching for how to profile it.

## How to profile your ZSH

So, what's actually slowing things down? Zsh comes with this super
handy profiling tool called `zprof`. Here's how to use it:

```bash
# Add this to the TOP of your .zshrc
zmodload zsh/zprof

# Add this to the BOTTOM of your .zshrc
zprof
```

This give a load of output, but it's a good starting point.

I had no idea this existed so massive shoutout to
[Jacek's Blog](https://blog.askesis.pl/post/2017/04/how-to-debug-zsh-startup-time.html)
for this tip!

## Ok, so what was making my shell slow?

When I ran the profiler, here's what I found:

```bash
1) _omz_source        55.73%   # Oh-My-Zsh loading everything
2) compinit           30.76%   # Completion system being slow
3) syntax-highlight   14.63%   # Making things pretty, but slow
```

So, Oh-My-Zsh was taking up over half the startup time!

## Oh-My-Zsh (55.73% → ~20%)

According to
[JonLuca's research](https://blog.jonlu.ca/posts/speeding-up-zsh),
this can cut the load time in half! The auto-updates are nice, but I'd
rather do them manually when I want to.

```bash
# Top of .zshrc
DISABLE_AUTO_UPDATE="true"
DISABLE_MAGIC_FUNCTIONS="true"
DISABLE_COMPFIX="true"
```

## Fixing the completion system (30.76% → ~10%)

The completion system (`compinit`) is zsh's built-in command
completion - it's what shows possible completions when you hit tab.
This is a neat trick I found. Instead of rebuilding the completion
cache every time, we only do it once a day:

```bash
# Smarter completion initialization
autoload -Uz compinit
if [ "$(date +'%j')" != "$(stat -f '%Sm' -t '%j' ~/.zcompdump 2>/dev/null)" ]; then
    compinit
else
    compinit -C
fi
```

This comes from
[a popular GitHub gist](https://gist.github.com/ctechols/ca1035271ad134841284) -
cheers for sharing this one!

## Making Spaceship Prompt Faster (22.47% → ~5%)

I love Spaceship prompt (been using it for years!), but it was being a
bit of a resource hog. Here's how to speed it up:

```bash
SPACESHIP_PROMPT_ASYNC=true
SPACESHIP_PROMPT_ADD_NEWLINE=true
SPACESHIP_CHAR_SYMBOL="⚡"

# Only load what you actually use
SPACESHIP_PROMPT_ORDER=(
    time
    user
    dir
    git
    line_sep
    char
)
```

The Spaceship team actually
[recommended this approach](https://github.com/spaceship-prompt/spaceship-prompt/issues/161) -
only load what you need!

## Plugin management

I have very few plugins, here's how I organize my plugins now:

```bash
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting  # Always last!
)
```

The order is super important here! According to the
[zsh-syntax-highlighting docs](https://github.com/zsh-users/zsh-syntax-highlighting#why-must-zsh-syntax-highlightingzsh-be-sourced-at-the-end-of-the-zshrc-file),
it needs to be last to work properly.

For autosuggestions, I added these performance tweaks:

```bash
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE="20"
ZSH_AUTOSUGGEST_USE_ASYNC=1
```

## The results? FAST! ⚡

Check this out:

| Component        | Before | After |
| ---------------- | ------ | ----- |
| Oh-My-Zsh        | 55.73% | ~20%  |
| Completions      | 30.76% | ~10%  |
| Syntax Highlight | 14.63% | ~8%   |
| Total Time       | ~5s    | ~0.5s |

That's like a 10x improvement! My terminal now opens in the blink of
an eye!

## Want to try this yourself?

1. Add the profiling code (I showed you earlier) to see what's slow

1. Try the fixes one at a time - that way you know what's actually
   helping

1. Keep what works for you - everyone's setup is different!

## Before and after

For comparison here's a before and after configs:

```bash
# Path to your Oh My Zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="spaceship"

# spaceship config
SPACESHIP_PROMPT_ASYNC=false
SPACESHIP_PROMPT_ADD_NEWLINE="true"
SPACESHIP_CHAR_SYMBOL="⚡"

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
        git
        zsh-syntax-highlighting
        zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh

# User configuration

# auto suggest
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"

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

# Start SSH agent if not running
if [ -z "$SSH_AUTH_SOCK" ]; then
   eval "$(ssh-agent -s)" > /dev/null
   ssh-add ~/.ssh/id_github_sign_and_auth 2>/dev/null
fi

# volta
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
# volta end

# bun completions
#[ -s "/home/scott/.bun/_bun" ] && source "/home/scott/.bun/_bun"

# Turso
export PATH="$PATH:/home/scott/.turso"
```

With all the optimisations in place, here's the after config:

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

# Theme config - fixed syntax
ZSH_THEME="spaceship"

# Spaceship settings (fixed syntax)
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
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null
        ssh-add ~/.ssh/id_github_sign_and_auth 2>/dev/null
    fi
}
autoload -U add-zsh-hook
add-zsh-hook precmd _load_ssh_agent

# Path configurations
export VOLTA_HOME="$HOME/.volta"
PATH="$VOLTA_HOME/bin:$PATH:/home/scott/.turso"
export PATH

# Source aliases last
[ -f ~/.zsh_aliases ] && source ~/.zsh_aliases
```

## Other things

As per usual when I do this sort of thing I alway search around for
alternitives, I tried [Starship](https://starship.rs) and to be
honest, I'm pretty happy with zsh, what it was for me (when trying it)
is I don't use `cd` I'm so used to just entering the directory name I
was pretty put off straight away. 😅

There were other things out there, like:

- Pure prompt (super fast alternative to Spaceship)
- [fast-syntax-highlighting](https://github.com/zdharma-continuum/fast-syntax-highlighting)
  (potentially faster than regular syntax highlighting, though the
  default is pretty quick already!)
- Zinit (a faster alternative to Oh-My-Zsh if you want to try
  something different)

But, honestly? If you're happy with your current setup (and I am) and
it's fast enough, stick with it! This was me going on a little side
quest because I was curious. My curiosity was rewarded with a markably
faster shell!

That's it! Hope this helps if you were having similar issues!
