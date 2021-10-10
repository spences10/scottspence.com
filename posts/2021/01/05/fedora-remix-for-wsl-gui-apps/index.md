---
date: 2021-01-05
title: Fedora Remix for WSL GUI Apps
tags: ['linux', 'notes', 'wsl']
isPrivate: false
---

[Fedora Remix for WSL] was on sale for £2.51 so I thought I'd have a
look see and add it to the rest of the other WSL distros I have
installed.

As I'm all jazzed about using Cypress in WSL I thought I'd give it a
go on Fedora.

There's a few dependencies that are detailed by the Cypress CLI output
that helps you underestand what needs to be installed, there were a
few that took a bit of searching to find but I've got it working in
now.

Unlike the post [I did previously] on doing it with Debian based WSL
instances like Ubuntu and Debian there's no need to set the
**$DISPLAY** variable like detailed in [Nicky's post].

Also I didn't configure to [Automatically start `dbus`] or [Grant
passwordless access for `dbus`]. Right, enough link love to Nicky's
site!

I'm using the [MDX Embed project] to run the Cypress tests which I
have validated with Debian and Ubuntu in previous posts on here.

Here's the dependencies that I needed to install:

```bash
sudo dnf install \
  \ libX11
  \ libX11-xcb
  \ nss
  \ libdrm
  \ libgbm
  \ libasound
  \ libXv -y
```

This one that I couldn't find with `dnf`:

```bash
# elusive to find dependency
sudo yum install alsa-lib.x86_64
```

ℹ the `-y` at the end of that command will automatically install the
dependencies for you.

There was one part for `libnss3.so` missing but I couldn't find
anything matching `libnss` using the the search command:

```bash
sudo dnf search libnss
```

After a bit of Googling (Startpage.com actually) I found in the
comments of this [Stack Overflow question] there was the clue:

![stack overflow comment]

Install that:

```bash
sudo dnf install nss -y
```

Then run `yarn cy:test` on the MDX Embed project...

Errors for `libdrm.so.2` and `libgbm.so.2` installed those and tried
again.

ℹ both of those are included in the first block of dependencies.

```bash
sudo dnf install libdrm libgbm -y
```

Next error from the Cypress CLI, missing `libasound.so.2` this was a
bit of a pain to find, I eventually came across this post on [Code
Weavers], it wasn't that actual post it was referred to from [this
page].

It details adding `alsa-lib.x86_64` which installs the missing
`libasound.so.2` dependency:

```bash
sudo yum install alsa-lib.x86_64
```

Install that and try running Cypress again `yarn cy:test`...

Success!!

That's it! I now have Fedora Remix for WSL working with GUI apps as
well!!

<!-- Links -->

[fedora remix for wsl]:
  https://www.microsoft.com/en-us/p/fedora-remix-for-wsl/9n6gdm4k2hnc?activetab=pivot:overviewtab
[i did previously]: https://scottspence.com/2020/12/09/gui-with-wsl/
[nicky's post]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress
[automatically start `dbus`]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress#automatically-start-dbus
[grant passwordless access for `dbus`]:
  https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress#grant-passwordless-access-for-dbus
[stack overflow question]:
  https://stackoverflow.com/questions/58134793/error-while-loading-shared-libraries-libnss3-so-while-running-gtlab-ci-job-to
[code weavers]:
  https://www.codeweavers.com/support/wiki/Diag/MissingLibAsoundMidi
[this page]:
  https://www.codeweavers.com/support/wiki/Diag/MissingLibAsound
[mdx embed project]: https://github.com/PaulieScanlon/mdx-embed

<!-- Images -->

[stack overflow comment]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/stack-overflow-comment-55459b70613d9cd30faf38898f07e47d.png
