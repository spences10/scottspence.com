---
date: 2020-06-18
title: Windows Subsystem Linux 2 (WSL) - Up and Running
tags: ['learning', 'guide', 'wsl', 'n', 'node', 'react']
isPrivate: false
---

Now that Windows Subsystem Linux has finally arrived I think it's time
to refresh my notes on it from the last post I did back at the end
of 2018.

https://docs.microsoft.com/en-gb/windows/wsl/install-win10

https://docs.microsoft.com/en-gb/windows/wsl/wsl2-kernel

Install terminal

Run terminal as admin

```bash
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

Then

```bash
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Restart

Set WSL 2 as default

```bash
wsl --set-default-version 2
```

Install Ubuntu

```bash
# see what version of WSL is running
wsl -l -v
```

Set the version of WSL

```bash
wsl --set-version Ubuntu 2
# set it to default with
wsl --set-default-version 2
```
