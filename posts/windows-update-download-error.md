---
date: 2022-04-18
title: How to Fix Windows Update Download Error
tags: ['windows', 'how-to']
is_private: false
---

I've had this issue a couple of times now and want to document how to
resolve it in most cases.

The latest time this happened to me was with the 22H2 insider preview
Windows 11 update.

I get a failed update with something like `error - 0x8007139f` in the
system update dialogue.

## Run Windows System File Checker

Open a terminal as administrator `Windows + x` and then `a` to open a
terminal as admin. In the terminal use the `/scannow` command.

```powershell
sfc /scannow
```

Restart, see if you have the same issue. If that didn't work then next
up is to try deleting the `SoftwareDistribution` folder contents.

## How to clear the SoftwareDistribution folder

Open a terminal as administrator, same as in the last section;
`Windows + x` and then `a` to open a terminal as admin. Use the
following commands:

<!-- cSpell:ignore wuauserv -->

```powershell
net stop wuauserv
net stop bits
```

Open the `SoftwareDistribution` folder with PowerShell using the
following command:

```powershell
explorer C:\\Windows\\SoftwareDistribution
```

Delete the contents of the folder then start the services again:

```powershell
net start wuauserv
net start bits
```

Restart the machine and try your luck again.
