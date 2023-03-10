---
date: 2021-03-13
title: Notes on direnv
tags: ['tools', 'cli', 'notes']
isPrivate: false
---

<!-- cSpell:ignore direnv,vlad,envrc -->

I was directed to direnv by Chris Biscardi when I was trying to use
some environment variables in my Toast site.

In the past I have always reached for dotenv so taking a look at other
[Toast sites] I couldn't find any that used it so I reached out to
Chris and he mentioned direnv.

I found a really useful video from [Vlad] detailing the setup which
I've adopted and started using.

## Install

Install for me (using Fedora 33) was a package manager install, there
are many [supported platforms].

```bash
sudo dnf -y install direnv
```

## Setup

To hook direnv into my Zsh shell I added the direnv [hook from the
documentation] and wrapped it in an if as detailed in Vlad's video.

```bash
# .zshrc
if [ $(command -v direnv) ]; then
  eval "$(direnv hook zsh)"
fi
```

In the project I want to use direnv in I created a `.envrc` file then
added `dotenv` to that file:

```bash
# .envrc
dotenv
```

This lets `direnv` know that you want to use the environment variables
in you `.env` file.

Lastly I need to tell direnv that it can run in this directory with
the allow command:

```bash
direnv allow
```

Vlad also provided a handy alias for initialising direnv in a new
project, I added this to my Zsh aliases file:

````bash
# direnv
alias -g di='echo dotenv > .envrc && touch .env && direnv allow'```
````

Now each time I cd into a directory with a `.env` file where I have
allowed direnv I'm prompted on what environment variables are
available.

[toast sites]:
  http://localhost:4512/2021/03/13/notes-on-toast/#resources
[vlad]: https://www.youtube.com/watch?v=YkxoGRpHcVQ
[supported platforms]:
  https://direnv.net/docs/installation.html#from-system-packages
[hook from the documentation]: https://direnv.net/docs/hook.html
