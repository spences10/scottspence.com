---
date: 2020-08-26
title: Windows Subsystem Linux Bootstrap 2020
tags: ['learning', 'guide', 'wsl']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
</script>

Yo! It's that time again!!

This is an opinionated guide on setting up a development environment
for web development in widows that will use the requisite tools, Bash,
Node, Git, VS Code etc...

Tl;Dr to the [guide] if you're not interested in the preamble and how
I got here.

I've been using Manjaro (Linux distribution) for a grand total of
three months or so now; so now I've switched back to Windows 😂

> Why?
>
> Why not! 😜

I added another SSD to my PC so I have one with Linux and one with
Windows, I'm giving Windows a good roll because of things like the
XSplit VCam for a virtual camera background and OBS having Twitch
integration, not directly related to web dev but I like to create
content and the options in Windows are better than with Linux.

I have done a web development set up on Windows a couple of times in
the past:

- [Windows Subsystem Linux setup]
- [Windows Web-dev bootstrap]

This time round it was just as confusing (for me) at the times before,
so this is why I'm making notes for future Scott to refer to. 🔥

## Advantages of Windows over Linux or macOS

I'm not going to get into a debate on the advantages of one platform
over another.

I can be productive on all of them given the right tools and that's
fine with me. Consider it like building a project for a client, they
really don't care what framework you used to make it as long as it
works and I feel the same about that with using Windows, Linux or
macOS.

## Why WSL?

So me saying that I do sound like a total hypocrite when what I am
using for web dev on Windows is, in fact, Linux!

Windows Subsystem Linux 2 to be precise, I was really excited for this
ever since seeing the announcement back in May 2019.

<!-- cSpell:ignore windowsdev -->

<Tweet tweetLink="windowsdev/status/1125484494616649728" />

> Dramatically improved file read performance up to a 3x improvement!

So what does WSL offer over using everything in Windows, I couldn't
say really, I think the developer experience (DX) in WSL offers a bit
more than that of Windows.

I have become a lot more accustomed to doing my web dev in a Linux
environment and I'm very comfortable using the terminal to get what
needs doing, done.

> If you already have a good set-up with Windows then there's no need
> to change, I'm not here to convince you otherwise.

## Prerequisites

I did this from a fresh install of Windows 10 Pro, I followed the
instructions from the [Windows WSL Install] docs.

You need to be on Windows version 1903 or higher, Build 18362 or
higher.

If you don't have Windows Pro you should be able to enable WSL 2 on
[Windows 10 home].

<!-- cSpell:ignore winver -->

To check use the Windows run command Windows key + r (Win+r) and enter
`winver`, you'll get a dialogue with your machine details on it, I'm
on version 2004 build 19041.

## Install Ubuntu

Now is a good time to install [a Linux distro from the ms store] I'll
be using Ubuntu.

## Use PowerShell as admin

The next couple of things are getting the computer ready to run WSL,
open PowerShell as admin and enter some commands.

To open PowerShell as admin use Win+x then select Windows PowerShell
(Admin) or press a on the keyboard.

<!-- cSpell:ignore dism,featurename,norestart -->

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Restart the machine.

## Check the features are on

Now is a good time to check the features were enabled, open the
Windows panel and search for 'Turn Windows features on or off' and
check in the dialogue windows that the 'Virtual Machine Platform' and
'Windows Subsystem for Linux' are checked.

Check that you can open Ubuntu, open it from the Windows start panel.

If there's a message along the lines of
`WSLRegisterDistribution failed with error: xxxx` (which is what I
got) then there's more information on enabling [some
additional features] for the WSL 2 kernel, run that.

Reboot again!

Check that you can open Ubuntu, again, it should start initialising.

> Installing, this may take a few minutes...

Open PowerShell, as admin again and check for available distros.

The `-l` is to list what you have installed and the `-v` flag is for
verbose, I thought it was the WSL version (1 or 2). 🤷‍♀️

```powershell
wsl -l -v
```

Once Ubuntu has finished installing you're prompted to add a user and
password.

You're good to go!

I like to update any packages that may need upgrading, I use the
following snippet to do that:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
```

The `-y` flag is to confirm 'yes I want to update' if you want to take
a look before letting it do it's thing then remove the `-y` flags.

## Enable file permissions for symlinks

This will only come into play if you want to have your configuration
files for things like `.gitconfig` and `.ssh` in a shared location.

<!-- cSpell:ignore Turek -->

This allows file permissions to be persisted see this [great
explanation from Brian Turek] detailing it.

I followed the documentation on the Microsoft docs to [configure
per distro launch settings with `wsl.conf`], my `wsl.conf` file looks
like this:

<!-- cSpell:ignore fmask,automount,windir -->

```bash
# Enable extra metadata options by default
[automount]
enabled = true
root = /windir/
options = "metadata,umask=22,fmask=11"
mountFsTab = false
```

You probably only need:

```bash
[automount]
enabled = true
options = "metadata,umask=22,fmask=11"
```

With the first options I now have my root directory changed to
`/windir/` instead of the default `/mnt/`. Partly my fault for blindly
following instructions on the internet!

<!-- cSpell:ignore RIDICURIOUS -->

There's more detail on what the `[automount]` options are in this post
on [RIDICURIOUS].

You can edit the `wsl.conf` with:

```bash
nano /etc/wsl.conf
```

## Chocolatey

Now it's time for me to start adding programs for use on my Windows
machine, this is a fresh install so all I have installed is the
pre-installed app that come with the installation media I created via
the Windows media creation tool.

Anyways, to keep my packages in order I'm using [Chocolatey] the
package manager for Windows.

Install for Chocolatey was again via an admin level PowerShell, the
instructions can be found on the site under [Get Started].

From the Chocolatey docs:

Run `Get-ExecutionPolicy`. If it returns `Restricted`, then run
`Set-ExecutionPolicy AllSigned` or
`Set-ExecutionPolicy Bypass -Scope Process`

Which I did, then I run this:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

So for me there are a few programs I need:

<!-- cSpell:ignore hwmonitor -->

- 7zip
- bitwarden
- discord
- firefox-dev
- hwmonitor
- hyper
- licecap
- microsoft-edge-insider
- obs-studio
- vlc
- vscode
- WSLGit

To get that list I used this PowerShell command to list what I have
installed:

<!-- cSpell:ignore choco,clist -->

```powershell
choco list --local-only
# or
clist -l
```

The only ones on there to take note of really that are used for web
dev are VS Code and **WSLGit**.

WSLGit being the important one that enables the use of Git installed
on my WSL instance to work in VS Code on Windows.

Prior to this I [had to install Git on Windows] which had it's own set
of problems with line endings and file permissions.

Installing this via Chocolatey I haven't had any issues, it's a
straight up install from Chocolatey and forget about it, works pretty
well so for.

## Make it my own

Time to add all the web dev tools I need, for me this is Node, Yarn,
NVM and my shell of choice Fish with Oh My Fish.

Install the `build-essential` tools for utility packages like `make`
this will come in handy when installing NVM and OMF.

```bash
sudo apt install -y build-essential
```

## Terminal

I like [Hyper], but I've decided to use the [Microsoft Terminal] for a
while, so far I really like it.

Once I found out how to customise it via the [Windows
Terminal documentation] and found a pretty sweet site for [Windows
Terminal Themes].

## Shell, Fish Shell

My preferred shell is Fish, I love this for it's auto completion and
path matching, also with Oh My Fish you get added themes and support
for NVM and additional utilities.

Install Fish via the Ubuntu package manager:

```bash
sudo install fish
```

Then install OMF with a `curl` command:

```bash
curl -L https://get.oh-my.fish | fish
```

This will switch me into the Fish shell once it's finished then I can
install a super sweet theme from OMF, to list out the available themes
in OMF:

```bash
omf theme
```

I like the `one` theme as it gives Git and node version information,
I'll install it with:

```bash
omf install one
```

I'm also going to need the NVM wrapper package for Fish:

```bash
omf install nvm
```

Now I can add my aliases to fish, I have a list that I always use from
my [Cheat Sheets] site. This is shortening things like `git` to `g` (yes)
and `yarn add` to `ya`.

## Change default shell

Default shell is currently set to bash I want to change that to Fish,
I can do that with `chsh` (Change Shell, I guess??).

In the past I have used `chsh -l` to list available shells, that
doesn't work here so instead I can see what shells are available with
`cat /etc/shells`, this lists out my available shells:

<!-- cSpell:ignore rbash -->

```bash
# /etc/shells: valid login shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/usr/bin/tmux
/usr/bin/screen
/usr/bin/fish
```

That's a lot of shells yo! I want to use Fish so I'll use the `-s`
(set, save whatevs!):

```bash
chsh -s /usr/bin/fish
```

My default shell is now Fish cool! I now want to have my default path
to my repos set when I open the terminal, I'll do that by adding a
command to the `config.fish` file:

```bash
nano ~/.config/fish/config.fish
```

It didn't exist before so nano will create it for me, I'll then add in
the default path I want to go to when I open the terminal, in the file
I'll add:

```bash
# Change start path
cd /home/scott/projects/
```

## Node with NVM

Ok, time to install Node, this time round I'm [using Node Version
Manager] (NVM) in place of `n` as `n` has a weird bug where it doesn't
change past Node v10.

NVM is installed with a one liner:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Then install node set it for use and default it to v12 long term
support (LTS) version.

```bash
nvm install 12 && nvm use 12 && nvm alias default 12
```

There's other Node version managers out there if you want to give them
a try:

- [n]
- [fnm]
- [Volta]
- [asdf-vm]
- [nvs]

For fnm you may need `unzip` for if not installed already:

```bash
sudo apt install unzip
```

I've also installed [fnm] as it also works with `.nvmrc` and
`.node-version`.

## Yarn

I prefer to use Yarn in my projects over npm, one for Yarn workspaces
but also because the script syntax is that little bit shorter:

```bash
npm run develop
# vs
yarn develop
```

Yes lazy dev is lazy! I'll install Yarn with the Ubuntu package
manager:

```bash
sudo apt install yarn
```

## Hub

[Hub] offers some extended command line features for GitHub, such as
making PRs and being able to pop open the repo in a browser window.

Install hub via the Ubuntu package manager:

```bash
sudo apt install hub
```

Now I'll alias my `git` command which I already have aliased to `g`
over to Hub:

<!-- cSpell:ignore funcsave -->

```bash
alias g hub
funcsave g
```

Now if I want to make a PR from my current branch `develop` to the
`production` branch I can do:

```bash
g pull-request -b production
```

If you don't specify a branch with `-b` then it will default to the
default branch on GitHub.

## Symlinks (Symbolic Link)

A quick note on symlinks ([symbolic links]), and why I'm using them.

I touched on this [earlier] where I set up my filesystem so I could
set file permissions that aren't enabled by default in WSL.

So a symlink is a pointer to a file somewhere else, an example would
be in Windows when you install a program you get a shortcut on your
desktop to that program, a symlink is like that.

The reasoning for using them is with WSL you can have several several
instances of a Linux distro on your machine.

<!-- cSpell:ignore pengwin -->

There's several for Ubuntu, with Ubuntu (20.04), Ubuntu 20.04 LTS and
Ubuntu 18.04 LTS then on top of that there are [another
several distros] recommended by Microsoft with additional ones on top
of that like [Pengwin] (which is a great extension on what's already
available in the recommended distros from Microsoft).

**What does that have to do with symlinks though?** Well, if you think
about each one of these instances as their own isolated operating
system on your machine.

Each one with it's own set of configurations, it will get pretty
tedious keeping them all current.

The majority of my settings on these instances will be for Git,
`.gitconfig` and SSH settings for [authenticating with GitHub
via SSH].

Rather than have several differing SSH keys I have the one key in a
shared location for all the WSL instances that need to use it.

## Config Git

So I have had to install WSL enough times to know that I'm going to be
losing my dotfiles at some point, that's why I made a [dotfiles repo] to
store this information for the next time.

This is where the symlinks come into play, I have my `.gitconfig` in a
separate location on my computer to my WSL install.

So for me as I changed my root dir, that'll be `/windir/` if you're
following along and didn't set your root dir to that then you're
probably going to be in `/mnt/` anyways! Link what is on my C drive to
what in in my Linux home folder:

```bash
ln -s /windir/c/Users/scott/stuff-not-on-linux/symlinks/.gitconfig /home/scott/.gitconfig
```

Coolio!

## Config SSH

I want to be able to use Git with GitHub and not have to authenticate
on each pull/push to a GitHub repo, to do that I use SSH!

I'll follow my own instructions I've made for myself in [Cheat
Sheets again], as this is the first time authenticating with GitHub
the `.ssh` folder containing the `rsa` files will be created on my WSL
instance. I'll need to move the contents of the created `.ssh` folder
to the location on my C drive for safe keeping.

```bash
mv ~/.ssh/* /windir/c/Users/scott/stuff-not-on-linux/symlinks/.ssh/
```

Then I'll simlink to those files:

```bash
# pwd = /home/scott/.ssh/
ln -s /windir/c/Users/scott/stuff-not-on-linux/symlinks/.ssh/* .
```

Now to change the permissions from within the `.ssh` folder for the
symlinks, I'll do that with `chmod`:

```bash
sudo chmod 644 id_rsa.pub
sudo chmod 600 id_rsa
sudo chmod 644 known_hosts
cd ../
sudo chmod 700 .ssh/
```

## VS Code

Ok I'm ready to use VS Code, configuring VS Code is another topic in
itself the one thing I want to for Git to work with VS Code is to pick
the default shell I want to use with VS Code.

On first opening VS Code I'm prompted in install the [Remote WSL] extension
this will integrate VS Code with my WSL instance.

I'll pop out the terminal pane in VS Code with the shortcut Ctrl+j (or
Ctrl+') then in the top of the panel there's a drop down box with the
option to 'Select Default Shell', selecting this option gives me the
list of shells to choose from I'm picking Fish.

Now if I go to my settings (with Ctrl+,) I can see a new entry for the
default shell:

```json
"terminal.integrated.shell.windows": "C:\\Windows\\System32\\wsl.exe",
```

Shout out to [Brittney] in the [Party Corgi Discord] for that one as
I've always added that setting manually in the past!

I can open the settings as a JSON file because I have set my workbench
settings to open the JSON file rather than the UI, if you want to open
the JSON file use the VS Code shortcut to open the command pallet with
Ctrl+Shift+p then search for 'Preferences: Open Setting (JSON)', I
have the following setting so I can use the JSON file over the UI:

```json
"workbench.settings.editor": "json",
```

## WSLGit

Time to touch on [WSLGit] again, now that I've got VS Code pointing to
my WSL terminal I should see any changes under source control (Git)
appear in the Git VS Code panel.

I mentioned previously in the past I [had to install Git on windows] with
WSLGit installed via Chocolatey any issues I had in the past are forgotten
(for now).

Now any code changes that are made in VS Code are forwarded to the WSL
Git instance so there's no need to install Git in Windows!

## Other Guides

Like I mentioned at the top of this post, this is my opinionated guide
for how I want to do my web dev work in Windows.

Here are some other guides that may be of use when setting up your in
environment.

- Nicky Meuleman: [WSL2, zsh, and docker. Linux through Windows.]

- The Microsoft Docs: [Set up your development environment on Windows 10]

- Scott Hanselman: [Developing on Windows with WSL2 (Subsystem for
  Linux), VS Code, Docker, and the Terminal]

## Hints and tips

Here's a list of some of the problems I come up against when using the
tools I detailed in this post.

They may work for you if you come across a similar problem.

### Open Linux files in Windows

<!-- cSpell:ignore yeahp -->

Yeahp! You can do that with `explore.exe` in WSL:

```bash
# pwd = /home/scott/
explore.exe .
```

Will open the directory I'm in, in Windows file explorer!

### No Yarn?

Don't seem to be able to use `yarn` in the terminal? Try adding [this
line] to your `.bashrc` file:

```bash
# open the .bashrc file to edit with nano
nano ~/.bashrc
# add the following line at the bottom of the file
export PATH="$(yarn global bin):$PATH"
# ctrl+o to write the change
# ctrl+x to exit
# reload the terminal with
source ~/.bashrc
```

### No Yarn binaries showing?

I came across this issue when [switching to Manjaro from Ubuntu] where
I have documented it, the following line will resolve that issue:

```bash
set -U fish_user_paths $HOME/.yarn/bin $HOME/.config/yarn/global/node_modules/.bin $fish_user_paths
```

If you need to remove it at a later date use:

```bash
set fish_user_paths (string match -rv yarn $fish_user_paths)
```

### Slow WSL

Does WSL seem slow on `npm install`/`yarn`? I had this issue and
wasn't to impressed with the supposed 3x speed increase promised with
WSL 2. I found [this comment on a WSL issue] which cleared it up.

I had my project repos on my Windows file system
(`/mnt/c/Users/scott/`), when they should be on my WSL file system
(`/home/scott/`). Once I moved them to the Linux filesystem everything
as super duper fast.

## Wrap up!

That's it 😅 done, for now at least!

Like I mentioned several times now I have set up WSL on Windows a few
times now! This time was still confusing to me, I hope some of these
notes help you although this is really just my reference for when I
have to start from scratch again.

There is a lot more documentation out there covering this subject and
I see Windows as a solid development environment now.

I'd love to know how it went for you if you're going to give WSL a
try.

<!-- Links -->

[windows subsystem linux setup]:
	https://scottspence.com/posts/wsl-bootstrap/
[windows web-dev bootstrap]:
	https://scottspence.com/posts/wsl-bootstrap-2019
[this comment on a wsl issue]:
	https://github.com/microsoft/WSL/issues/5078#issuecomment-613384302
[symbolic links]: https://en.wikipedia.org/wiki/Symbolic_link
[a linux distro from the ms store]: https://aka.ms/wslstore
[another several distros]: https://aka.ms/wslstore
[pengwin]: https://www.whitewaterfoundry.com/
[wsl2, zsh, and docker. linux through windows.]:
	https://nickymeuleman.netlify.app/blog/linux-on-windows-wsl2-zsh-docker
[authenticating with github via ssh]:
	https://cheatsheets.xyz/git/#how-to-authenticate-with-github-using-ssh
[cygwin]: https://cygwin.com/packages/summary/bash.html
[chocolatey]: chocolatey.org/
[guide]: #prerequisites
[windows terminal documentation]:
	https://github.com/microsoft/terminal/blob/master/doc/user-docs/UsingJsonSettings.md
[windows terminal themes]: https://atomcorp.github.io/themes/
[guide on how to use themes]:
	https://github.com/atomcorp/themes#how-to-use-the-themes
[wsl git workaround]: https://github.com/Microsoft/vscode/issues/9502
[this line]:
	https://github.com/yarnpkg/yarn/issues/5353#issuecomment-593307861
[windows wsl install]:
	https://docs.microsoft.com/en-us/windows/wsl/install-win10
[some additional features]: https://aka.ms/wsl2kernel
[great explanation from brian turek]:
	https://www.turek.dev/post/fix-wsl-file-permissions/
[configure per distro launch settings with `wsl.conf`]:
	https://docs.microsoft.com/en-us/windows/wsl/wsl-config#configure-per-distro-launch-settings-with-wslconf
[ridicurious]:
	https://ridicurious.com/2019/07/25/setup-wsl-launch-configuration-wsl-conf/
[chocolatey]: https://chocolatey.org/
[get started]: https://chocolatey.org/install
[had to install git on windows]:
	https://scottspence.com/posts/wsl-bootstrap-2019/#install-windows-git
[using node version manager]: https://github.com/nvm-sh/nvm
[n]: https://www.npmjs.com/package/n#installation
[fnm]: https://github.com/Schniz/fnm#using-a-script
[volta]: https://github.com/volta-cli/volta#installing-volta
[asdf-vm]: https://asdf-vm.com/#/core-manage-asdf-vm
[nvs]: https://github.com/jasongin/nvs
[hub]: https://github.com/github/hub
[hyper]: https://hyper.is/
[microsoft terminal]: https://aka.ms/terminal
[cheat sheets]: https://cheatsheets.xyz/fish/#list-out-added-aliases
[earlier]: #enable-file-permissions-for-symlinks
[dotfiles repo]:
	https://github.com/spences10/dotfiles/blob/master/Windows/.gitconfig
[cheat sheets again]:
	https://cheatsheets.xyz/git/#how-to-authenticate-with-github-using-ssh
[brittney]: https://twitter.com/brittneypostma
[party corgi discord]: https://discord.gg/MzC3kr
[wslgit]: https://github.com/andy-5/wslgit
[set up your development environment on windows 10]:
	https://docs.microsoft.com/en-us/windows/dev-environment/overview
[developing on windows with wsl2 (subsystem for linux), vs code, docker, and the terminal]:
	https://www.youtube.com/watch?v=A0eqZujVfYU&feature=emb_title
[remote wsl]:
	https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl
[windows 10 home]:
	https://docs.microsoft.com/en-us/windows/wsl/wsl2-faq#does-wsl-2-use-hyper-v-will-it-be-available-on-windows-10-home
[switching to manjaro from ubuntu]:
	https://scottspence.com/posts/switching-to-manjaro-from-ubuntu/#yarn
