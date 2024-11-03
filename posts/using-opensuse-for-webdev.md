---
date: 2020-12-13
title: WSL openSUSE for web dev
tags: ['linux', 'learning', 'guide']
is_private: false
---

So I had a play around with the openSUSE Leap 15.2 you can get [on the
Windows store] and after familiarising myself with it decided to see
if I could use it for web development.

Well, yeah, you can, that's it, that's the post!

There's a few subtle differences between doing it with Ubuntu/Debian
which I'm going to cover here.

First up, I couldn't get GUI app working for using tools like Cypress,
Playwright etc. I did get it to a state where you could run node on it
and have git working with VS Code.

I couldn't spend any more time trying to work out the missing parts
and this was more to see if I could use it like any other Linux distro
I use.

## Update and upgrade

The equivalent to `sudo apt` in openSUSE is `sudo zypper` so in
openSUSE to do a `sudo apt update && sudo apt upgrade` you do this:

```bash
sudo zypper ref && sudo zypper up
```

In openSUSE `ref` or `refresh` are equivalent to `update` in
Ubuntu/Debian and `up` or `update` in openSUSE are equivalent to
`upgrade` in Ubuntu/Debian.

## Install dev tools

I've recently become a fan of using Zsh over Fish, I made [notes on
it] and also done a stream on a [full customisation].

I'll start with adding in Zsh:

```bash
# search for zsh
sudo zypper search zsh
# install zsh
sudo zypper in zsh
```

Then set the default shell to Zsh and install Oh My Zsh:

```bash
# default the shell to Zsh
chsh -s $(which zsh)
# install git
sudo zypper in git
# one liner to install OMZ
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Nano is my preferred terminal text editor, I'll nee install that too:

```bash
sudo zypper search nano
sudo zypper in nano
```

Rather than install Node with `zypper` I'll use nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | zsh
source ~/.zshrc
# confirm install
command -v nvm
# install preferred node version
nvm install 14
```

## Add Yarn

Install yarn, the script is for bash here but it also adds the `$PATH`
variable to the `.zshrc` file.

```bash
curl -o- -L https://yarnpkg.com/install.sh | bash
source ~/.zshrc
yarn -v
```

Check that the following has been added to the `.zshrc` file and add
it manually if it's not there:

```bash
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
```

## Add SSH keys

As with Ubuntu/Debian I can pop open the openSUSE file system in the
Windows file explorer by using the handy dandy `explorer.exe .` that
comes with WSL2.

This means I can open the home folder of my user and add in some SSH
keys I use for other WSL instances.

Be wary here, when pasting the files in they have a default owner and
group of `root`:

```bash
# change ownership of folder and contents
sudo chown scott:users .ssh/ .ssh/* .gitconfig
# change .ssh/ .ssh/* permissions
# change to the .ssh folder
~/.ssh/
sudo chmod 644 id_rsa.pub
sudo chmod 600 id_rsa
sudo chmod 644 known_hosts
# change out to set the folder permissions
../
sudo chmod 700 .ssh/
# authenticate with GitHub
ssh -T git@github.com
```

## Recap and wrap!

That's it for this, like I said at the top this is just me seeing if I
can use openSUSE for doing web dev on.

What I covered:

- The differences to updating and installing on Ubuntu/Debian
- Installing required tools for web development, Zsh, git, nano
- Adding SSH keys from another Ubuntu/Debian install

I can now clone git repos and work on them as I would with
Ubuntu/Debian. Just no GUI app at the moment!

Thanks for reading 🙌

[install yarn]: https://www.osradar.com/install-yarn-opensuse-15-1/
[on the windows store]:
  https://www.microsoft.com/en-us/p/opensuse-leap-152/9mzd0n9z4m4h?activetab=pivot:overviewtabb
[notes on it]: https://scottspence.com/posts/zsh-and-oh-my-zsh/
[full customisation]: https://www.youtube.com/watch?v=4cp-GcZxB-g
