---
date: 2024-03-17
title: WSL Web Developer Setup with Fedora 39
tags: ['fedora', 'linux', 'wsl']
isPrivate: false
---

A couple of years ago I wrote a guide on setting up a web development
environment on
[WSL using Fedora 35](https://scottspence.com/posts/wsl-web-developer-setup-with-fedora-35).
I wanted to get an up to date version of Fedora to use in WSL so I
went back to my guide and the link for the `rootfs` file was a 404 on
the repo linked there.

So, when doing this, the first thing that was a struggle was to find
the root file system zip. The GitHub org for Fedora Cloud is (funnily
enough) only for the cloud i.e. Docker images. Unlike in the last post
where it was a one click download now there's a bit of digging around
to do.

## Download the rootfs

A search for "fedora container base" will point to this URL:
https://koji.fedoraproject.org/koji/packageinfo?packageID=26387 there
was a lot of clicking around but eventually I found something to use.
If you're following along, what you need to look for is something like
`Fedora-Container-Base-39-20240311.0`, clicking into that gave me the
Image Archives where I can download the `x86_64.tar.xz` file.

In the `.tar.xz` file there's a `layer.tar` in the first folder of the
zip, that's the file I need to import into WSL.

So, essentially the same instructions from the Fedora 35 guide now
with some slight changes!

## Import the rootfs

So the PowerShell command to import the file is in five parts, `wsl`,
`--import`, `name`, `path`, `layer.tar`. The `name` is the name of the
distro, `path` is the path to the folder where the distro will be
stored and `layer.tar` is the path to the `layer.tar` file.

So, I create a `Fedora-39` folder in my `distros` folder and then run
the command:

```powershell
wsl --import Fedora-39 C:\\Users\\scott\\distros\\Fedora-39\\ C:\\Users\\scott\\distros\\layer.tar
```

Done!

Now I can run `wsl -l -v` to see the distros I have installed and from
here (PowerShell) I can specify the distro I want to use with the `-d`
flag:

```powershell
wsl -d Fedora-39
```

That opens up the distro as root, so I can add in som e core packages
and the default user.

## Update and install core packages

Fedora's package manager is `dnf` so I can use that to update the
system and install some core packages.

I'm using the `-y` flag to automatically answer yes to any prompts.

```bash
# update Fedora
dnf -y update
# install core packages
dnf install -y wget curl sudo nano ncurses dnf-plugins-core dnf-utils passwd findutils
```

That's it for the core packages, if you're following along feel free
to add in whatever you need on top of this, for me that's all I need
so I can now I can add a default user.

## Add default user

Ok, so I'm not logging in as root each time I want to use the distro,
I'm going to add a user to the system.

```bash
# create user and add them to sudoers list
useradd -G wheel scott
# set password for user
passwd scott
```

I'm prompted to give the user a password, once I've done that I can
then add them to the `wheel` group so they can use `sudo`.

There's a specific config file for WSL where I can add in the user,
I'll create that file with nano:

```bash
nano /etc/wsl.conf
```

Then add in my user:

```conf
[user]
default=scott
```

Save and exit nano, then I can exit the distro and open it again to
check that I'm logged in as the user I just created.

So, that would be the following:

```bash
# exit the distro
exit
# open the distro again
wsl -d Fedora-39
# check who I'm logged in as
whoami
```

## wslu (WSL Utilities)

Not essential but I've had this in the last guide and it's changed
since then so detailing here for prosperity.

You can check out what you get with wslu on the GitHub repo here:
https://github.com/wslutilities/wslu

Also the docs site where I got this info from:
https://wslutiliti.es/wslu/install.html

Install:

```bash
sudo dnf copr enable wslutilities/wslu -y
sudo dnf install wslu -y
```

## That's it!

Essentially, I'm done here, I can now use the distro as I would any
other Linux system. I can install packages, set up my development
environment and get to work.

The rest of the stuff detailed now is my preferred setup, you can
personalise your setup as you see fit.

## Personalisation

So, for me there's several things that I need, Zsh, Oh My Zsh, Node,
NVM, pnpm.

I've done a whole guide on my preferred Zsh setup here:
https://www.scottspence.com/posts/my-zsh-config

I'm going to detail the process here too.

<mark class='text-primary-content bg-primary'>Install Zsh and Oh My
Zsh:</mark>

```bash
# install zsh
sudo dnf -y install zsh
# install Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Following the Oh My Zsh install I'm prompted to change my shell to
Zsh, that used to be a bit of a faff, now it does it in the
initialisation.

<mark class='text-primary-content bg-primary'>Customise Zsh:</mark>

Several things that I install in any new Zsh setup:

- zsh-syntax-highlighting
- zsh-autosuggestions
- Spaceship ZSH

The first two are plugins for Zsh, the last is a theme.

Install the plugins:

```bash
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

In my `.zshrc` file I need to add the plugins to the list of plugins:

```text
plugins=(
  git
  zsh-syntax-highlighting
  zsh-autosuggestions
)
```

Then whilst I'm in the `.zshrc` file I can add the autosuggest config:

```bash
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
```

Next add the Spaceship ZSH theme:

```bash
# clone the repo to the Zsh custom theme directory
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt" --depth=1
# symlink it
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
```

Then add in the theme to the `.zshrc` file:

```text
ZSH_THEME="spaceship"
```

There's some errors that I come up against on the regular with
Spaceship, an error like this:

```bash
async_worker_eval: no such async worker: spaceship
```

There's also a warning from upower:

```bash
(upower:185): UPower-WARNING **: 18:38:44.618: Cannot connect to upower: Could not connect: No such file or directory
```

These can be fixed by adding the following to the `.zshrc` file after
the theme line:

```bash
ZSH_THEME="spaceship"

# spaceship config
SPACESHIP_PROMPT_ASYNC=false
SPACESHIP_PROMPT_ADD_NEWLINE="true"
SPACESHIP_CHAR_SYMBOL="⚡ "
export SPACESHIP_BATTERY_SHOW=false
```

<mark class='text-primary-content bg-primary'>Install Node and
NVM:</mark>

I prefer to use NVM to manage my Node versions, so I'll install that
and then use it to install Node.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | zsh
source ~/.zshrc
command -v nvm
# sets default to 14
nvm install 18
# nvm alias default 18
```

<mark class='text-primary-content bg-primary'>Install pnpm:</mark>

Then pnpm, I've tried adding pnpm via npm in the past and had issues
so I use the pnpm install script:

```bash
curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
```

<mark class='text-primary-content bg-primary'>SSH keys:</mark>

Setting up git, I used to go through moving SSH files from an existing
WSL instance over to a new one but it's just as simple to set up
another SSH key and add it to my GitHub account.

I haven't changed the process for myself in an **age**, maybe it's
changed, for now I'll keep following this guide I made a couple of
years ago: https://scottspence.com/posts/set-up-ssh-for-use-with-git

## Something go wrong? Start over!

Mess up? No problem, just unregister the distro and start over.

```bash
wsl --unregister Fedora-39
```

## Conclusion

Yeah, like, that's it! I know it's common structure to add a
conclusion to the end of the post to go over what happened. So, here's
the cliffs; I dug around on the internet, found the rootfs for and up
to date version of Fedora, imported it into WSL, installed some
packages and added a user. Personalised it a bit, bipity bopity boo,
I'm done!
