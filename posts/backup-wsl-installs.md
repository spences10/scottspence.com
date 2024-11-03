---
date: 2021-03-24
title: How to Backup Windows Subsystem for Linux distributions
tags: ['wsl', 'fedora', 'linux']
isPrivate: false
---

I have always liked using Windows Subsystem for Linux (WSL), I'd
routinely trash installs then reinstall them from the Microsoft store
and have become quite adept at setting up new instances with
everything I need to get back to coding as quickly as possible.

Because most of the work I do in WSL is in a git repo somewhere means
I can start up again where I left off as long as I have committed and
pushed my code that is!

I've covered getting set up with a WSL instance that isn't on the
Microsoft store before with a [WSL Web Developer Bootstrap with
Fedora 33].

That covered importing the distribution from a `rootfs` (root file
system) image and configuring it from scratch.

This time around is for when I have a really nice setup and I'd prefer
not to have to setup again I can do this instead.

## List installed distros

To back up, I can get the list of installed distros in PowerShell
with:

```bash
wsl -l -v
```

That gives me a list of my installed distributions:

```bash
  NAME                  STATE           VERSION
  Ubuntu                Stopped         2
  fedoraremix           Stopped         2
  Debian                Stopped         2
* Fedora-33             Running         2
```

The `*` denotes my default distribution, so I'm going to backup the
Fedora 33 instance. First up I'll need to navigate to where I want to
save the backup, to list all drives in PowerShell I can use the
following:

<!-- cSpell:ignore WMIOBJECT,logicaldisk,fedoraremix -->

```bash
# | FORMAT-TABLE added for less verbose output
GET-WMIOBJECT win32_logicaldisk | FORMAT-TABLE
```

From here I can `cd` to the drive I want to save the distro:

```bash
cd e:
# list out local directories
dir
# change to desired folder
cd .\distros\
```

Just to note, if I'm currently running that WSL instance it will stop!
It's best to stop WSL with:

```bash
wsl --shutdown
```

I can also terminate a single instance of WSL with the
`wsl --terminate` command:

```powershell
wsl.exe --terminate Ubuntu # or -t for short
```

## Backup distro

I'll make sure I've not got anything running on there before going to
the next step which is the backup.

Now I can run the export and wait for it to do it's thing:

```bash
# Fedora-33 is the distro
# Fedora-33.tar is the backup file
wsl --export Fedora-33 Fedora-33.tar
```

This can take a while to complete whilst it makes the backup. I'll go
make a cup off coffee whilst I wait!

Ant that's it, I have a backup of my Fedora 33 instance waiting for me
on another drive if anything catastrophic happens.

Little tip as well if you're in PowerShell and you want an admin level
terminal you can run the following command to open a new terminal
window with admin rights:

```bash
Start-Process powershell -Verb runAs
```

If I want to reinstate the backup I can use the `--import` command,
here I have to specify where I want it to go as well, something like
this:

```bash
wsl --import (distribution) (where I want it to go) (path to backup)
```

## Import backed up distro

So if I wanted to reinstate the distribution in it's current location
I can do this:

```bash
wsl --import Fedora-test e:\distros .\Fedora-33.tar
```

Then if I go check available distros again with `wsl -l -v` I'll get
this:

```bash
  NAME                  STATE           VERSION
  Ubuntu                Stopped         2
  fedoraremix           Stopped         2
  Debian                Stopped         2
* Fedora-33             Running         2
  Fedora-test           Stopped         2
```

## Remove installed distro

Cool, cool! Now as I'm not using it I'm going to unregister it with
the `--unregister` command:

```bash
wsl --unregister Fedora-test
```

[wsl web developer bootstrap with fedora 33]:
	https://scottspence.com/posts/fedora-bootstrap-from-scratch/
