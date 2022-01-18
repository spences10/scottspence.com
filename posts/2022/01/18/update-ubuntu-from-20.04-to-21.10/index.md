---
date: 2022-01-18
title:
  Upgrade Ubuntu on Windows Subsystem for Linux from 18.04 to 19.10
tags: ['wsl', 'guide', 'ubuntu']
isPrivate: true
---

In this guide I’m going to detail upgrading Ubuntu on Windows
Subsystem for Linux (WSL) from the current version 20.04 to 21.10 this
is an intermediary release before Ubuntu 22.04 is released on 2022
April 21.

I have [documented this process] in the past for moving from Ubuntu
version 18.04 to 19.10. You can see my comments as I went through the
process back then.

```bash
sudo do-release-upgrade -d
```

```bash
uname -r # kernel version
apt list --installed
apt list --installed | wc -l # wordcount lines
```

<!-- Links -->

[documented this process]:
  https://scottspence.com/posts/update-wsl-ubuntu-from-18.10-to-19.10
[-d]: https://ubuntu.com/server/docs/upgrade-introduction
