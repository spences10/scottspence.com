---
date: 2021-11-02
title: Backup Ubuntu in Windows Subsystem for Linux
tags: ['wsl', 'ubuntu', 'linux', 'how-to']
isPrivate: false
---

I've had to make a copy of my current Ubuntu install for Windows
Subsystem for Linux (WSL) and although [I have written about this
before] but this time there were a few gotchas I want to cover here.

WSL moves pretty fast so a lot of the documentation you find out there
may be outdated.

This is what I had work for me in this instance, the setup is I want
to have a copy of my current Ubuntu so I can install some additional
packages on it I may not want on my 'working' instance of Ubuntu.

The majority of the terminal commands used here will be in PowerShell,
I'll make sure I'm clear when I'm using PowerShell and when I'm using
a Linux Bash shell.

## List installed distros

To list my installed Linux versions I can use the following from a
PowerShell prompt:

```powershell
# -l is short for --list
# -v is short for --verbose
wsl -l -v
```

That command gives me a list of my installed Linus distrobutions that
look a little something like this:

```powershell
  NAME                  STATE           VERSION
* Ubuntu       Running         2
  Fedora-35    Stopped         2
```

The `*` denotes my default distribution, that's what is run when I
open a new Windows Terminal.

## Set up save location

I'm going to want to save the distrobution in a folder somewhere on my
hard drive. For me that will be a new folder on a dive that's not my
main partition.

If you want to see the dives you have available in PowerShell you can
use this:

```powershell
# | FORMAT-TABLE added for less verbose output
GET-WMIOBJECT win32_logicaldisk | FORMAT-TABLE
```

That gives me an output like this:

```powershell
DeviceID DriveType VolumeName
-------- --------- ----------
C:               3
D:               3 Mass Storage
E:               3
```

## Backup distro

I'm going to navigate in PowerShell to where I want to backup my
Ubuntu instance on my `D` drive.

To get the current directory in PowerShell I can use the `pwd` (Print
Working Directory) command. `pwd` is aliased to `Get-Location` in
PowerShell:

```powershell
PS C:\\Users\\scott> pwd
Path
----
C:\\Users\\scott
```

I'm going to change directory (`cd`) to the `D` drive then create a
`distros` folder and a `backups` folder in that, I'll use the `mkdir`
(Linux command) which is aliased to `md`:

```powershell
# change to the D drive
cd D:\\
# make a distros folder with a backups folder in it
mkdir -p distros/backups
# change directory into the distros/backups folder
cd .\\distros\\backups\\
```

The `-p` flag create's parent directories when using the `mkdir`
command.

From here I can start the backup of my Ubuntu instance.

Before I do that I'll make sure that there's no running instances of
WSL with the `wsl --shutdown` command in PowerShell:

```powershell
wsl --shutdown
```

Now I can run the `--export` command to backup Ubuntu into the
`backups` directory:

```powershell
# Ubuntu is the distro
# Ubuntu-2021-11-01.tar is the backup file
wsl --export Ubuntu Ubuntu-2021-11-01.tar
# Conversion in progress, this may take a few minutes...
```

So now I have a snapshot of my Ubuntu instance I can use to do
whatever I want with. Now to use it and import it for use in WSL.

## Import backed up distro

To use the backup as a 'new' distro I'll use the `--import` WSL
command, the command take a couple of parameters, what you want to
call the imported distro, where you want it to go and the path to the
backup.

For performance I'll want to use the new Ubuntu instance on my faster
`C` drive, I'll call it UbuntuTest.

I already have a `distros` folder on my `C` drive but I'll need to
create a folder for the new UbuntuTest distrobution:

```powershell
mkdir C:\\Users\\scott\\distros\\UbuntuTest
```

Now that's created I can `--import` the new UbuntuTest instance:

```powershell
# wsl --import (what I want to call the new instance) (where I want it to go) (path to backup)
wsl --import UbuntuTest C:\\Users\\scott\\distros\\UbuntuTest .\\Ubuntu-2021-11-01.tar
# Import in progress, this may take a few minutes...
```

Now if I open a new Windows Terminal instance I can select the new
Ubuntu instance!

There's one little snag here though and that is that the user on the
UbuntuTest instance is a `root` user!

## Default user

Still as the root user of UbuntuTest I'll need to change the default
user permissions. I'll create a WSL config file for this.

ℹ️ This is from the UbuntuTest (bash) command line interface (CLI)

To create the new file I'll use `nano` (Linux text editor) with this
command:

```bash
nano /etc/wsl.conf
```

Then in `nano` I'll add the following:

```bash
[user]
default=scott
```

To save the changes in `nano` I'll use `Ctrl+o` to write out the
changes to the file then, confirm with `y` and enter to confirm the
file name to write to.

If I open a new UbuntuTest terminal now I still have the same
permissions, what I need to do is restart WSL with the `--shutdown`
command in PowerShell:

```powershell
wsl --shutdown
```

In the same PowerShell terminal I can check the installed WSL
instances with the `--list` command:

```powershell
PS D:\\distros\\backups> wsl -l -v
  NAME          STATE           VERSION
* Ubuntu        Stopped         2
  Fedora-35     Stopped         2
  UbuntuTest    Stopped         2
```

Now opening up a new UbuntuTest terminal I have the right permissions
for the default user!

## Remove installed distro

To remove the installed distro I can use the unregister command in
PowerShell to remove it:

```powershell
wsl --unregister UbuntuTest
```

## Recap and wrap up!

That's it! I've backed up my current Ubuntu install by saving it to a
local hard drive directory. Then created a new Ubuntu instance with
the WSL `--import` command. Finally I can delete the what I created
with the WSL `--unregister` command.

<!-- Links -->

[i have written about this before]:
  https://scottspence.com/posts/backup-wsl-installs
