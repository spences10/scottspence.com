---
date: 2021-01-06
title: WSL Web Developer Bootstrap with Fedora 33
tags: ['fedora', 'linux', 'wsl']
isPrivate: false
---

I have been having a blast playing around with configuring Fedora 33
in Windows via Windows Subsystem for Linux, I didn't know you could
straight up import a Linux distro and use it.

In this guide I'll go through the complete setup needed to go from
initial install of Fedora 33 right through to running GUI tools like
Cypress and Puppeteer!

There's a great resource I found in [Fedora Magazine] and another post
in [Dev.to], the Dev.to one I haven't tried as the first guide does
all I need it to do so it's there for reference if needed.

This is my bootstrap for getting set up with Fedora 33 and all the
related bits of software I'll need for wed development with it.

## Prerequisites

If you haven't already got Windows Subsystem for Linux Installed then
take a look at the [official guidance from Microsoft].

I'd also suggest checking out [Nicky Muleman's post on it].

## Get Fedora 33 for use in WSL

First up! Importing the Fedora 33 distribution.

Credit to [Jim Perrin] for the original post in [Fedora Magazine] on
this.

Get the Dockerhub container image which is what I'll be using for the
Linux instance, this is because Fedora doesn't ship with `rootfs` so
I'm jacking [this one from GitHub].

I'll download the image and put it on my C drive in a distros folder.

The file is downloaded as a `*.tar.xz` file, I need to extract this so
it's a `*.tar` file, I use 7zip to do that.

## Import into WSL

Time to import the `*.tar` into WSL, I've already created a `distros`
folder on my C drive, now to point PowerShell to the file and import:

```powershell
wsl --import Fedora-33 C:\\Users\\scott\\distros\\ C:\\Users\\scott\\distros\\fedora-33.20201230-x86_64.tar
```

To break down that command, `wsl` is clear what that is hopefully,
with the `--import` denoting that what is being imported is called
`Fedora-33` and it should live in the `C:\Users\scott\distros\`
folder, and the place to import from is
`C:\Users\scott\distros\fedora-33.20201230-x86_64.tar`.

Now to check out the installed versions available on my machine with
`wsl -l -v`, I've removed all the other Linux installs I have for
brevity but leaving Ubuntu there with the `*` next to it denoting it
as the default:

```bash
# the l is for list
# v is for verbose 🤷‍♀️
# this is the long version => wsl --list --verbose
PS C:\Windows\system32> wsl -l -v
  NAME                  STATE           VERSION
* Ubuntu                Stopped         2
  Fedora-33             Running         2
```

## Update and install core packages

Now it's imported I can access it in PowerShell with:

```bash
wsl -d Fedora-33
```

This is the root user so I'll need to my user account in a minute
first up though it's the update dance we alway do in Linux, with
Fedora it's `dnf` you use in place of `apt` like what's used in
Ubuntu.

```bash
# update all the things
dnf -y update
# install core packages
dnf install -y wget curl sudo ncurses dnf-plugins-core dnf-utils passwd findutils
```

These are what're recommended on Jim's post so I'm going with this for
now, I'll add additional packages once I have created my user details.

## Add my user

So, my user is `scott` if you're following along you'll need to change
that.

```bash
# create user and add them to sudoers list
useradd -G wheel scott
# set password for user
passwd scott
```

Time to exit this shell and go back in as my newly created user to
check the credentials.

```bash
# exit current shell with
exit
# back in PowerShell now
wsl -d Fedora-33 -u scott
# get user id
id -u
# id -u returns 1000
# test that user is on sudoers list
sudo ll
```

That last command will prompt me for the password I created for
`scott`, presuming that went well then it's time to set the default
user.

To do that, `exit` WSL to get back into Powershell.

This PowerShell one-liner configures my user properly, (thanks Jim!)
take note of the last value here `1000` that's the `id -u` I checked
for earlier:

```powershell
Get-ItemProperty Registry::HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Lxss\\*\\ DistributionName | Where-Object -Property DistributionName -eq Fedora-33  | Set-ItemProperty -Name DefaultUid -Value 1000
```

The last piece here is to add [Copr] for the Windows integration:

```bash
# in the Fedora shell
sudo dnf -y copr enable trustywolf/wslu
```

## Install additional packages

Ok, now to get moving with the bits I need for web dev, fist I'll want
to add nano and git:

```bash
sudo dnf -y install nano git
```

Then for using end to end testing and automation tools like Cypress,
Playwright and Puppeteer I'll first want to install some browsers
which will add all the needed libs and packages I'll need later:

```bash
sudo dnf -y install firefox chromium
```

## Install Zsh and Oh My Zsh

Zsh has become quite special to me so this is a must for me, if you're
following along then you do you, the majority of the config here can
be done with bash too.

```bash
sudo dnf -y install zsh
```

Then OMZ with:

```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Oh My Zsh will say:

> I can't change your shell automatically because this system does not
> have chsh. Please manually change your default shell to zsh

I'll do that next.

## Change default shell

There's no `chsh` utility in Fedora so if I want to change the default
shell then I'll need to do this:

```bash
# open the passwd file
sudo nano /etc/passwd
```

Look for something like:

```text
scott:x:1000:1000::/home/scott:/bin/bash
```

Look for the part with my username, then change the `/bash` part with
`/zsh`

Save the changes in nano with `Ctrl+o` to write out the changes then
`Ctrl+x` to exit out of nano.

## Customise Zsh

I've gone over this a couple of times now, if you're not interested
skip along to the next bit.

I'm going to add a few things here, these are essentials for me:

Plugins:

- [zsh-syntax-highlighting]
- [zsh-autosuggestions]

Theme, very important:

- [Spaceship ZSH]

Install the plugins first:

```bash
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

Update the plugins array with some added ones from Oh My Zsh:

```bash
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

And remember to add the auto suggest config to the `.zshrc` config
file:

```bash
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#663399,standout"
```

Now for the theme, first up clone and symlink the repo:

```bash
# clone the repo first
git clone https://github.com/denysdovhan/spaceship-prompt.git "$ZSH_CUSTOM/themes/spaceship-prompt" --depth=1
# symlink it
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
```

Then set it to the `.zshrc` file:

```bash
# nano ~/.zshrc
ZSH_THEME="spaceship"
```

## Add starting directory

Add the starting directory to be in the Linux partition.

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

I have one set of SSH keys I keep for my WSL instances, I'll copy
those to my user home folder with the `explorer.exe` tool, pop open
the explorer:

```bash
explorer.exe .
```

Paste in my `.ssh` folder and `.gitconfig`, one thing to note here is
that sometimes copying files in will set the permissions on the files
to `root`, check that with:

```bash
# check the .ssh file permissions
ls -lart .ss*
# if it shows root as the owner then change it
-rw-r--r-- 1 root  root   749 Aug 25 17:36 id_rsa.pub
-rw-r--r-- 1 root  root  3389 Aug 25 17:36 id_rsa
```

A really handy way to find the ordinals on a file, (so the numbers
instead of `-rw-r--r--` whatever that means) is `stat`, this command
will give the actual numbers:

```bash
stat -c "%a %n" ~/.ssh/*
```

That gives an output like this:

```text
644 /home/scott/.ssh/id_rsa
644 /home/scott/.ssh/id_rsa.pub
644 /home/scott/.ssh/known_hosts
```

So after I change owner I know I'll need to change the `id_rsa` to
`600` from `644`.

In this example the owner is `root` so I'll change it to my user
(`scott`):

```bash
# change ownership of folder and contents
sudo chown scott:users .ssh/ .ssh/* .gitconfig
```

Now to change the permissions on the `id_rsa` file and authenticate
with GitHub:

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

Install nvm for that Node version goodness:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | zsh
source ~/.zshrc
command -v nvm
# sets default to 14
nvm install 14
# nvm alias default 14
```

## Install Yarn

Install Yarn with the instruction for the [Yarn docs]:

```bash
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo dnf -y install yarn
```

Install a global yarn package and make sure global binaries are
showing.

In this case I'll add Vercels CLI:

```bash
yarn global add vercel
```

Then try to login with `vc login` I get a response of:

```bash
zsh: command not found: vercel
```

So I need to set the prefix:

```bash
# confirm global path
yarn global bin
yarn config get prefix
# When I ran this it was undefined, so I set it:
yarn config set prefix ~/.yarn
```

Add the following to my `~/.zshrc` file:

```bash
export PATH="$PATH:`yarn global bin`"
```

Reload the shell:

```bash
source ~/.zshrc
```

And try again:

```bash
vercel login
```

## Set the `$DISPLAY` variable

Unlike with the [Fedora Remix for WSL] the display variable needs to
be set in Fedora 33, so I'll go through the same process as I did in
my [Enable GUIs WSL] post. Credit to Nicky Muleman and [his post] that
give me the initial details.

```bash
# set DISPLAY variable to the IP automatically assigned to WSL2
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2; exit;}'):0.0
```

## Run a project that uses a GUIs

I have an xserver in [x410] that's already running, if you need to set
up an xserver check out [Nicky's post on getting it set up].

I'm going to clone MDX Embed as I know it uses Cypress and run the
command to do end to end tests with Cypress once it's finished
installing:

```bash
git clone git@github.com:PaulieScanlon/mdx-embed.git
# then install dependencies
yarn
# and run yarn cy:test to test
yarn cy:test
```

## References and tips

Now that I've installed all the things I need I can run:

```bash
sudo dnf clean all
```

This will clear up all the unused files.

If I want to start over I can use:

```bash
wsl --unregister Fedora-33
```

This will remove the Fedora install so I can start again.

## Wrap!

that's it, I've gone and installed an off the shelf version of Linux
on my Windows machine and configured it for use in web development.

<!-- Links -->

[fedora magazine]: https://fedoramagazine.org/wsl-fedora-33/
[dev.to]:
  https://dev.to/bowmanjd/install-fedora-on-windows-subsystem-for-linux-wsl-4b26
[zsh-syntax-highlighting]:
  https://github.com/zsh-users/zsh-syntax-highlighting
[zsh-autosuggestions]:
  https://github.com/zsh-users/zsh-autosuggestions
[spaceship zsh]: https://github.com/denysdovhan/spaceship-prompt
[yarn docs]:
  https://classic.yarnpkg.com/en/docs/install/#centos-stable
[fedora remix for wsl]:
  https://www.microsoft.com/en-us/p/fedora-remix-for-wsl/9n6gdm4k2hnc?activetab=pivot:overviewtab
[his post]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress#the-display-variable
[enable guis wsl]:
  https://scottspence.com/posts/gui-with-wsl/#gui-things
[this one from github]:
  https://github.com/fedora-cloud/docker-brew-fedora/tree/33/x86_64
[official guidance from microsoft]:
  https://docs.microsoft.com/en-us/windows/wsl/install-win10
[nicky muleman's post on it]:
  https://nickymeuleman.netlify.app/blog/linux-on-windows-wsl2-zsh-docker
[jim perrin]: https://fedoramagazine.org/author/jperrin/
[x410]:
  https://www.microsoft.com/en-gb/p/x410/9nlp712zmn9q?activetab=pivot:overviewtab
[nicky's post on getting it set up]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress#vcxsrv
[copr]: https://docs.pagure.org/copr.copr/index.html
