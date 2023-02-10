---
date: 2021-12-08
title: WSL Web Developer Setup with Fedora 35
tags: ['fedora', 'linux', 'wsl']
isPrivate: false
---

This is an updated guide on the post I did [at the start of the year]
for setting up a web development environment on Windows with Windows
Subsystem for Linux (WSL). This guide is intended for use to get set
up with Fedora 35 on WSL.

This is my opinionated guide for how I have my environment set up and
is intended for me to use in the future when I need to get set up
again with a new Fedora 35 instance.

The reasoning for this one is that there have been a few changes with
displaying Graphical User Interfaces (GUIs) on WSL. I'll be leaving
out the sections not needed with recent changes.

## Prerequisites

This guide presumes you're using WSL2 on Windows 11, check out my
short post on setting up [Windows Subsystem for Linux on Windows 11]
for more info.

## Download the Fedora 35 `rootfs`

Off to GitHub to download the `rootfs` for Fedora 35 which is
available from the Dockerhub container image.

From the GitHub page I can click on the image to downloaf it. For me
at the time of writing that file is
[`fedora-35.20211125-x86_64.tar.xz`].

The download is a `*.tar.xz` file, I need to extract this so it's a
`*.tar` file, I'll use 7zip to do that.

## Import `rootfs` into WSL

One thing to bear in mind is that the files you're importting into WSL
will need their own folder on your computer. So if you have Fedora 34
and Fedora 35 instances the're going to need their own folders to live
in.

I'm going to put mine in a Fedora-35 folder on my C drive.

```powershell
wsl --import Fedora-35 C:\\Users\\scott\\distros\\Fedora-35 C:\\Users\\scott\\distros\\fedora-35.20211125-x86_64.tar
```

In my Fedora-35 folder on my C drive I now have a `ext4.vhdx` file,
this is my new Fedora 35 instance!

From the same PowerShell window I can now run the `wsl -l -v` command
to list out the installed distros.

```powershell
# the l is for list
# v is for verbose
# this is the long version => wsl --list --verbose
PS C:\\Windows\\system32> wsl -l -v
  NAME                  STATE           VERSION
* Ubuntu                Stopped         2
  Fedora-35             Running         2
```

## Update and install core packages

Time to go onto the new Fedora 35 instance and update and install
packages. From my PowerShell terminal I can use this command:

```powershell
wsl -d Fedora-35
```

This log me into the new Fedora 35 instance as the root user. I'll set
up my user shortly, for now I'm going to update and add in some core
packages I'll need:

```bash
# update Fedora
dnf -y update
# install core packages
dnf install -y wget curl sudo nano ncurses dnf-plugins-core dnf-utils passwd findutils
```

Now the core packages are installed I can go about setting up my user.

## Add user

Adding my username to the sudoers list and setting my password with
the following commands:

```bash
# create user and add them to sudoers list
useradd -G wheel scott
# set password for user
passwd scott
```

There used to be this reg edit command that was used but this has now
been replaced with the `wsl.conf` file. I'll create the file and add
my details to it.

```bash
nano /etc/wsl.conf
```

Then in nano I'll add in my user:

```bash
[user]
default=scott
```

I'll save the changes in nano with `Ctrl+o` to write out the changes
to the file then, confirm with `y` and enter to confirm the file name
to write to. I can exit the file now with `Ctrl+x`.

If I were to exit from here and open a new Fedora 35 terminal I will
still be logged in as the root user.

Now I can `exit` the Fedora 35 terminal and from PowerShell run the
`wsl --shutdown` command.

```powershell
[root@WSL-INSTANCE scott]# exit
logout
PS C:\\Users\\scott> wsl --shutdown
```

I can also terminate a single instance of WSL with the
`wsl --terminate` command:

```powershell
wsl.exe --terminate Fedora-35 # or -t for short
```

Opening a new Fedora 35 terminal I'm now logged in a `scott`.

One last part here is to add [Copr], this is a collection of utilities
provided for use in WSL ([`wslu`]).

```bash
# in the Fedora shell
sudo dnf -y copr enable trustywolf/wslu
```

## Install additional packages

Some additional packages I'll need to install:

```bash
sudo dnf -y install git firefox chromium
```

## Install Zsh and Oh My Zsh

Time to install my shell of choice Zsh, if you're following along this
isn't required if you prefer a different shell.

```bash
# install zsh
sudo dnf -y install zsh
# install Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

There'll be some output from Oh My Zsh:

> I can't change your shell automatically because this system does not
> have chsh. Please manually change your default shell to zsh

How to change the default shell next.

## Change the default shell to Zsh

Like the output from Oh My Zsh said, because the system doesn't have
`chsh` I'll need to do that manually.

```bash
# open the passwd file
sudo nano /etc/passwd
```

Then I'll need to look for something with my username in it.

Mine looks like this:

```bash
scott:x:1000:1000::/home/scott:/bin/bash
```

I'll need to replace the `/bin/bash` with `/bin/zsh`.

Same as with nano before to save the changes I'll use `Ctrl+o` to
write _out_ the changes, then confirm with `y` and `Ctrl+x` to exit.

## Customise Zsh

If you're not interested in customising Zsh then skip to the next
section. I'm going to add a few things here that hlp me in my everyday
dev workflow.

I'm going to be adding the following plugins:

- [zsh-syntax-highlighting]
- [zsh-autosuggestions]

And my favourite theme:

- [Spaceship ZSH]

I'll install the plugins first:

```bash
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

I can then update the plugins array, here's what I have:

```bash
plugins=(
  git
  zsh-syntax-highlighting
  zsh-autosuggestions
)
```

Then add the Zsh autosuggest highlight style config to my Zsh config:

```bash
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
```

Adding the theme for Spaceship ZSH:

```bash
# clone the repo to the Zsh custom theme directory
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt" --depth=1
# symlink it
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
```

Now I can set the theme in my Zsh config:

```bash
# nano ~/.zshrc
ZSH_THEME="spaceship"
```

You might see a warning in a new shell now like this:

```bash
(upower:185): UPower-WARNING **: 18:38:44.618: Cannot connect to upowerd: Could not connect: No such file or directory
```

There's a post on [Miguel Alex Cantu]'s blog about this issue, there's
a spaceship config option for it.

You need to add the following to your `~/.zshrc`:

```bash
# nano ~/.zshrc
# Turn off power status when using spaceship prompt
export SPACESHIP_BATTERY_SHOW=false
```

## Add starting directory

As a preference I like to use my linux partition to store my projects
on, the default is the Windows C drive.

This can be configured with the `wsl.conf` file, or in the Windows
terminal `settings.json` file. You can do this with a a config like
this:

```json
{
  "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
  "hidden": false,
  "name": "Fedora-35",
  "source": "Windows.Terminal.WSL",
  "startingDirectory": "//wsl$/Fedora-35/home/scott/repos"
}
```

Personally, I prefer to set this in my `~/.zshrc` file:

```bash
# cd to the home directory
~
# mkdir for repos
mkdir repos
# Open the zshrc file
nano ~/.zshrc
# add this at the bottom
cd ~/repos
```

## Add SSH keys

I have a predefined set off SSH keys for use in my WSL instances. I'll
grab those and add them to my home (`~`) directory.

One of the new features of WSL is that you can open a windows file
explorer in your linux file system with `explorer.exe .`.

I'll paste in my `.ssh` folder. One thing to note here is that
sometimes copying files over will set the permissions on the files to
root, check that with:

```bash
# check the .ssh file permissions
ls -lart .ss*
# if it shows root as the owner then change it
-rw-r--r-- 1 scott scott  749 May 12  2021 id_rsa.pub
-rw-r--r-- 1 scott scott 3389 May 12  2021 id_rsa
```

This time the owner of the file is `scott`, so no need to change it.
If I did need to change it I could use `sudo chown` to change it.

```bash
# change ownership of folder and contents
sudo chown scott:users .ssh/ .ssh/*
```

Now to change the permissions on the `id_rsa` files. A really handy
way to find the ordinals on a file, is the `stat` command.

This means you can get the numbers of the permissions you need to set
instead of `-rw-r--r--`:

```bash
stat -c "%a %n" ~/.ssh/*
```

I'll change the permissions on the `id_rsa` files:

```bash
# change to the .ssh/ folder
.ssh/
# set permission
sudo chmod 600 id_rsa
# change out to set the folder permissions
../
sudo chmod 700 .ssh/
# authenticate with GitHub
ssh -T git@github.com
```

## Install nvm

Install nvm so I can switch node versions with a simple command:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | zsh
source ~/.zshrc
command -v nvm
# sets default to 14
nvm install 14
# nvm alias default 14
```

## Install pnpm

Finally for me I'll install pnpm. As I have node installed now that's
a one liner from the pnpm docs:

```bash
curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
```

## Conclusion

That's it, I've gone from a Fedora `rootfs` to a web development
environment.

I can now start working on my GitHub projects with VS Code integration
with the use of the [Remote WSL] extension.

<!-- Links -->

[at the start of the year]:
  https://scottspence.com/posts/fedora-bootstrap-from-scratch
[windows subsystem for linux on windows 11]:
  https://scottspence.com/posts/wsl-on-windows-11
[`fedora-35.20211125-x86_64.tar.xz`]:
  https://github.com/fedora-cloud/docker-brew-fedora/tree/35/x86_64
[copr]: https://github.com/wslutilities/wslu
[`wslu`]: https://github.com/wslutilities/wslu
[zsh-syntax-highlighting]:
  https://github.com/zsh-users/zsh-syntax-highlighting
[zsh-autosuggestions]:
  https://github.com/zsh-users/zsh-autosuggestions
[spaceship zsh]: https://github.com/denysdovhan/spaceship-prompt
[miguel alex cantu]:
  http://blog.miguelalexcantu.com/2020/12/fixing-upower-warning-wslzshspaceship.html
[remote wsl]:
  https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl
