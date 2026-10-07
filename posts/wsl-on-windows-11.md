---
date: 2021-10-14
title: Windows Subsystem for Linux on Windows 11
tags: ['wsl', 'windows', 'ubuntu']
is_private: false
---

Now that Windows 11 has been released I decided to switch from my
Windows 11 insiders build and go over to my Windows 10 partition,
reset it and start over on a fresh Windows 11 machine!

In the past getting set up with Windows Subsystem for Linux (WSL) has
had it's challenges but now with Windows 11 it's as simple as
installing the [Windows Subsystem for Linux](https://www.microsoft.com/en-gb/p/windows-subsystem-for-linux-preview/9p9tqf7mrm4r) app from the Windows
Store.

## GUIs

Graphical User Interfaces (GUIs) for use in WSL now work with no
configuration, install your browser of choice via the command line
then you can pick it from the Windows Start menu like any other app
installed on your machine.

This used to be a whole load of dependencies that needed to be
installed and some configuration of the display. I go into detail in
[Enable GUIs on Windows Subsystem Linux (WSL)](https://scottspence.com/posts/gui-with-wsl#gui-things) if you're interested.
This is all unnecessary now with Windows 11 however!

If you want to install Chrome on Ubuntu however there's still the same
manual install needed for that. See my post on [Use Chrome in Ubuntu
on Windows Subsystem Linux](https://scottspence.com/posts/use-chrome-in-ubuntu-wsl) for more info on how to do that.

## Third party apps with winget

For third part apps in the past I have used Chocolatey as it had all
the apps I needed, now with Windows 11 all the apps I need are there
including some I couldn't get via Chocolatey!

So now rather than going through the setup of Chocolatey, (which can
be a bit daunting at times) all I need to do now is open a PowerShell
terminal and search for what I want to install!

I've created a [GitHub gist](https://gist.github.com/spences10/8fd4bb1581cfa234e7a72d5c63ee247b) of all the programs I install.

## Linux distributions not on the Windows Store

There's still the aspect of using a Linux distribution that's not on
the Windows Store, you _can_ do this and I have detailed the whole
setup for web dev in [WSL Web Developer Bootstrap with Fedora 33](https://scottspence.com/posts/fedora-bootstrap-from-scratch)
(replace Fedora 33 with your distro of choice).

## Windows Subsystem for Linux Preview

You can now install WSL from the Windows store with the [Windows
Subsystem for Linux Preview](https://www.microsoft.com/en-gb/p/windows-subsystem-for-linux-preview/9p9tqf7mrm4r?activetab=pivot:overviewtab) app!

Just make sure you have *Virtual Machine Platform* enabled in the
'Turn Windows Features on or off' section.

## Conclusion

What was once several blog posts on how to configure your system to
first get set up to use WSL is now a simple Windows Store app and a
couple of PowerShell commands!
