---
date: 2020-12-09
title: Enable GUIs on Windows Subsystem Linux (WSL)
tags: ['wsl', 'testing', 'guide']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

<!-- cSpell:ignore pengwin -->

So this post started off with me getting GUI apps running on my
Windows WSL install of [Pengwin], but has now turned into doing it
without the need to fork over [the readies] for Pengwin as now you can
do it with Ubuntu or Debian (possibly others) which are free to
download on the Microsoft store.

Pengwin is a pretty powerful Linux distro based off of Debian you can
pick it up in the Windows store for £16.74 if you want all the
additional features it offers up. I'd suggest keeping and eye on it
because they regularly do discounts on it too.

I say this started off using Pengwin, because I used all the setup
options to enable GUI usage on there but (like most of my WSL
instances) I trashed the install and couldn't recreate what I had done
before. This post stayed shelved since the start of October but now
I'm picking it up again thanks to [Nicky Meuleman]'s guide on [Using
Graphical User Interfaces like Cypress' in WSL2] and his other post on
[Linux on windows WSL2 ZSH Docker] that post also spawned the last
post I did on my [Notes on Zsh and Oh My Zsh] with the great section
he did on [setting up Zsh].

So, what am I doing in this post? Ripping off Nicky's content? Pretty
much!

I'll be adding content from Nicky's posts here along with my own take
on things. I have several bits of content I have to gather up each
time I want to do this (I've done it several times now) so this will
be a complete list for my use case.

I'll be doing this with a fresh install of [Debian] from the Windows
store, this was me wanting to understand if I could do it using Debian
as well as with Ubuntu more than anything else.

I can confirm it works with Ubuntu 18.04 and Ubuntu 20.04 as well as
Debian, the version of Debian I'm using is Debian GNU/Linux 10, if you
want to check your version use `cat /etc/issue` in the terminal.

Again massive thanks to Nick Meuleman for his awesome content on this.

## Tl;Dr

If you prefer to watch how this is done then skip all the way to the
end for a [video detailing the process](#video-detailing-the-process).
🚀

## Why GUI apps though?

Ok, so first up why do I want to be able to run [GUI]s (Graphical User
Interface) on my Linux instances?

Solely for testing software like [Cypress], [QA Wolf] and browser
automation tools [Microsoft's Playwright]; these all need to run from
the WSL instance which isn't set up by default to run GUIs.

There is talk of the WSL team [Adding Linux GUI app support to WSL]
but this is slated for an update in the holidays (Christmas??).

I'm not going to hold my breath for this to go into the main release
of Windows 10 I'd hazard a guess that it'll be available Spring/Summer
release.

If you absolutely must have this functionality yourself then I'd
suggest giving [Windows insiders] a try. I've been on Windows insiders
in the past and would prefer to stay on the normal release schedule
for now.

There's a some things I'll need up front, an [X-server] I already have
[X410] which I got on offer from the Windows store, it retails around
£8.39.

Check out Nicky's blog on getting set up with [VcXsrv] if you're not
going to hand over the cash for X410. There's an important note on the
additional settings needed for that on Nicky's post.

If you don't have WSL set up already then check out Nicky's post on
it, I've also made a post on when I initially set up my machine to use
WSL in the summer.

- [Linux on Windows WSL2 Zsh Docker]
- [WSL Bootstrap 2020]

## Debian install and config

First up I'll need to download and install the Debian app, this will
open up the Debian command line and prompt me to enter a username and
password.

I'll then need to change this from WSL to WSL2 via a PowerShell admin
panel (`Windows Key+x`, then `a`) as it's fresh from the store it'll
be on version 1.

To list out my WSL instances I'll use the `wsl -l -v` command:

```bash {9}
# the l is for list
# v is for verbose 🤷‍♀️
# this is the long version => wsl --list --verbose
PS C:\Windows\system32> wsl -l -v
  NAME            STATE           VERSION
* Ubuntu          Running         2
  Ubuntu-16.04    Stopped         2
  WLinux          Stopped         2
  Debian          Running         1
  Ubuntu-20.04    Running         2
  Ubuntu-18.04    Stopped         2
```

That lists out what I have installed, see that Debian is version 1,
I'll use the `wsl` command in PowerShell to set it to version 2, it'll
show some output and let you know when it's done it's thing:

```bash
wsl --set-version Debian 2
# PS C:\Windows\system32> wsl --set-version Debian 2
# Conversion in progress, this may take a few minutes...
# For information on key differences with WSL 2 please visit https://aka.ms/wsl2
# Conversion complete.
```

Now that is out of the way I can open the Debian shell on my Windows
Terminal app and work in there from here on out.

## Update Debian

Update all the things, **a word of warning** if you're copy pasting
these commands I have the `-y` flag set in these which agrees to
install without prompting first, **you've been warned** 😛:

First update all the things:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
```

Then to add the missing libraries and utilities and packages I'll need
[`build-essential`], `git` and `curl`:

```bash
sudo apt install build-essential git curl -y
```

## Install Zsh and Oh My Zsh

For this guide I'm going to concentrate on getting up and running with
the GUI goodness. So I'm going to forgo adding anything fancy to Zsh
other than Oh My Zsh.

If you're interested in configuring Zsh a bit more then check out the
[Notes on Zsh and Oh My Zsh] post I made which covers a fair bit of
customisation.

```bash
# Install zsh
sudo apt install zsh -y
# set Zsh to default shell
chsh -s $(which zsh)
# add Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Oh My Zsh will prompt to be set as the default shell to which I'll
answer why `y`es.

## The `.zshrc` file

Oh My Zsh uses the `.zshrc` file for configuration, it can be accessed
in the `$HOME` directory, I will be editing it a fair bit from now on
with Nano:

```bash
nano ~/.zshrc
```

To exit out of Nano `Ctrl+o` to write out the changes, `Enter` to
confirm changes then `Ctrl+x` to close.

## Install nvm

Install nvm for that quick change node versions goodness, this isn't
essential but comes in handy if you need to change node versions.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | zsh
command -v nvm
# sets default to 14
nvm install 14
# nvm alias default 14
```

The first node install is what is set to the default, if you change
versions later and want to default to a different version use
`nvm alias default 15`.

## Install Yarn

I'm installing yarn as a preference and also because I know the
repository I'm going to test with Cypress uses Yarn as well.

These instructions are taken from the [Yarn install docs]:

```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn -y
```

## Add starting directory

All the Linux distros I use start in the Windows C drive for some
reason at `/mnt/c/Users/username`.

It can be really easy to start creating projects there but because
it's on the Windows file system, running projects from there will be a
lot slower than running them from the native partition.

```bash
# cd to the home directory
~
# Open the zshrc file
nano ~/.zshrc
# add this at the bottom
cd ~/repos
```

## Add SSH keys

Because I like to trash my Linux installs on a regular basis I have a
set of SSH keys I move from install to install. I recently discovered
the [`explorer.exe`] which allows you to access the Linux files in the
Windows file explorer! This is really handy and means I haven't got to
simlink them any more!! 🚀

I'll pop open my Debian instance and copy pasta the SSH files in
there:

```bash
explorer.exe .
```

Because I've pasted them in from a Windows file system I'll need to
set the correct permissions on the files, then I'll authenticate with
GitHub.

```bash
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

## GUI things

This is where Nicky's detailed posts come in, the dependencies here
are what's needed to get the GUI stuff going:

<!-- cSpell:disable -->

```bash
sudo apt install \
  libgtk-3-dev \
  libnotify-dev \
  libgconf-2-4 \
  libnss3 \
  libxss1 \
  libasound2 -y
```

<!-- cSpell:enable -->

ℹ If you're using [Playwright] there's a few additional dependencies
tha need installing for WebKit, this was from using with Ubuntu.

<!-- cSpell:disable -->

```bash
sudo apt install \
  libgstreamer-plugins-bad1.0-0 \
  libenchant1c2a \
  gstreamer1.0-libav -y
```

<!-- cSpell:enable -->

For the GUI apps to connect to my X-server I'll need to create a
`DISPLAY` environment variable in my `.zshrc` config file.

Pop open the file with my terminal text editor of choice, Nano:

```bash
nano ~/.zshrc
```

Then add in the variable, when I have attempted this in the past the
variable was literally `0.0` so this from Nicky is a nice expansion on
that and he [explains brilliantly] why this needs to be done:

<!-- cSpell:ignore resolv -->

```bash
# set DISPLAY variable to the IP automatically assigned to WSL2
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2; exit;}'):0.0
```

To exit out of Nano `Ctrl+o` to write out the changes, `Enter` to
confirm then `Ctrl+x` to close.

To confirm that it works I can open a new terminal or use
`source ~/.zshrc` then print out the `DISPLAY` variable:

```bash
source ~/.zshrc
echo $DISPLAY
```

<!-- cSpell:ignore dbus -->

## `dbus` start and access

[D-Bus] is ued by Linux desktop environments for GUI apps so I'm going
to need that and the following will automatically start it.

Pop open the `.zshrc` file again:

```bash
# open the zzh config file
nano ~/.zshrc
```

Add the below snippet to the end of the `.zshrc` file:

```bash
# Automatically start dbus
sudo /etc/init.d/dbus start &> /dev/null
```

To exit out of Nano `Ctrl+o` to write out the changes, `Enter` to
confirm then `Ctrl+x` to close.

I'll need to create a `sudoers` file to grant passwordless access for
`dbus`, the following command will open that file (or create it if it
doesn't exist already), in there I need to give no password access to
`dbus`:

```bash
# open or create the sudoers file for dbus
sudo visudo -f /etc/sudoers.d/dbus
```

In Nano add in my username, and this:

```bash
scott ALL = (root) NOPASSWD: /etc/init.d/dbus
```

Again,to exit out of Nano `Ctrl+o` to write out the changes, `Enter`
to confirm then `Ctrl+x` to close.

## Clone a repo that uses Cypress

I know that MDX Embed uses Cypress because I participated in adding
tests to it for Hacktoberfest.

I'm going to clone that:

```bash
git clone git@github.com:PaulieScanlon/mdx-embed.git
```

Wait for that to do it's thing! ⏲

Then time to test!

```bash
yarn cy:test
```

Boom! GUI running in WSL!!

## Video detailing the process

<YouTube youTubeId="hhxMFVQsklI" />

<!-- Links -->

<!-- cSpell:ignore commandline -->

[x410]: https://www.microsoft.com/en-gb/p/x410/9nlp712zmn9q
[pengwin]: https://www.microsoft.com/en-gb/p/pengwin/9nv1gv1pxz6p
[the readies]:
  https://dictionary.cambridge.org/dictionary/english/readies
[linux on windows wsl2 zsh docker]:
  https://nickymeuleman.netlify.app/blog/linux-on-windows-wsl2-zsh-docker
[setting up zsh]:
  https://nickymeuleman.netlify.app/blog/linux-on-windows-wsl2-zsh-docker#zsh
[using graphical user interfaces like cypress' in wsl2]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress
[nicky meuleman]: https://twitter.com/NMeuleman
[debian]: https://www.microsoft.com/en-gb/p/debian/9msvkqc78pk6
[notes on zsh and oh my zsh]:
  https://scottspence.com/posts/zsh-and-oh-my-zsh/
[gui]: https://en.wikipedia.org/wiki/Graphical_user_interface
[microsoft's playwright]: https://github.com/microsoft/playwright
[qa wolf]: https://github.com/qawolf/qawolf
[cypress]: https://www.cypress.io/
[x-server]: https://en.wikipedia.org/wiki/X_server
[adding linux gui app support to wsl]:
  https://devblogs.microsoft.com/commandline/the-windows-subsystem-for-linux-build-2020-summary/#wsl-gui
[windows insiders]: https://insider.windows.com/en-gb/for-developers
[vcxsrv]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress#vcxsrv
[wsl bootstrap 2020]:
  https://scottspence.com/posts/wsl-bootstrap-2020/
[stack overflow answer]: https://stackoverflow.com/a/60016407/1138354
[`explorer.exe`]:
  https://devblogs.microsoft.com/commandline/whats-new-for-wsl-in-windows-10-version-1903/#accessing-linux-files-from-windows
[explains brilliantly]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress#the-display-variable
[d-bus]: https://en.wikipedia.org/wiki/D-Bus
[`build-essential`]:
  https://packages.ubuntu.com/xenial/build-essential
[yarn install docs]:
  https://classic.yarnpkg.com/en/docs/install/#debian-stable
[playwright]: https://github.com/microsoft/playwright
