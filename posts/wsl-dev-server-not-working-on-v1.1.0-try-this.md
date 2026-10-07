---
date: 2023-01-22
title: WSL Dev Server Not Working on v1.1.0? Try this!
tags: ['wsl', 'guide']
is_private: false
---

If, like me, you're on the Windows Insider Programme Dev channel and
you use Windows Subsystem for Linux (WSL) for your web development
then you may have noticed some weird dev server behaviour recently.

Behaviour like, starting the dev server, then clicking around on some
routes then the dev server stops responding. Starting up the dev
server again, works but then the same thing happens again.

With the recent update of the Windows Subsystem for Linux (WSL) on the
Microsoft Store from version 1.0.3 to 1.1.0 there's been several
people noticing similar issues.

Here's a few of the issues I found when trying to understand what was
going on:

- [Port forwarding repeated failure on WSL 1.1.0](https://github.com/microsoft/WSL/issues/9508)
- [Some network connections hang (timed out) under WSL](https://github.com/microsoft/WSL/issues/7326)
- [SSH to remote causes disconnect with client_loop: send disconnect:
  Broken pipe](https://github.com/microsoft/WSL/issues/7966)

The first issue in the list there is where I found a solution that
worked for me, so might work for you if you're having the same issue.

Basically uninstall the most recent version of WSL and install the
previous version.

<!-- cSpell:ignore rudyzeinoun -->

Thanks to [this comment](https://github.com/microsoft/WSL/issues/9508#issuecomment-1396866615) from [rudyzeinoun](https://github.com/rudyzeinoun) which details the Windows
PowerShell commands to do this.

Before running the commands, you'll need to download the previous
version of WSL from the [releases page](https://github.com/microsoft/WSL/releases) on GitHub.

<!-- cSpell:ignore msixbundle -->

I went and downloaded the `Microsoft.WSL_1.0.3.0_x64_ARM64.msixbundle`
asset from the releases page and added it to the same location from
where I was running the PowerShell commands from.

If you already have WSL running it might be a good idea to close it
before running the commands.

```powershell
wsl --shutdown
```

You'll need to have an elevated (admin) PowerShell window open to run
these commands:

<!-- cSpell:ignore Subsystemfor -->

```powershell
$Package = Get-AppxPackage MicrosoftCorporationII.WindowsSubsystemforLinux -AllUsers
Remove-AppxPackage $Package -AllUsers
Add-AppxPackage .\\Microsoft.WSL_1.0.3.0_x64_ARM64.msixbundle
```

The first command puts the package into a variable, the second command
uninstalls the package using the variable, and the third command
installs the previous package.

That's it, I now have a working dev server again!

One thing to note is that now going to the Microsoft Store, to the WSL
app page, it is prompting me to install it!

I'll be monitoring the releases page for the WSL package over on
GitHub and will probably uninstall the previous version I have
installed (with the first two commands detailed earlier) before going
to the Microsoft Store to install the latest version.

Leaving this here in the hope it will help someone else, and also for
me and the next time I need to do this!!
