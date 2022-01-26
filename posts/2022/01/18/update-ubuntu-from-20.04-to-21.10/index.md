---
date: 2022-01-18
title:
  Upgrade Ubuntu on Windows Subsystem for Linux from 20.04 to 22.04
tags: ['wsl', 'guide', 'ubuntu']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

In this guide I’m going to detail upgrading Ubuntu on Windows
Subsystem for Linux (WSL) from the current version 20.04 to 22.04 this
the development build of Ubuntu 22.04 which is due to be released on
2022 April 21.

You can Tl;Dr and watch the
[video](#heres-a-video-detailing-the-process) if you like.

I have [documented the process] in the past for moving from Ubuntu
version 18.04 to 19.10. You can see my comments as I went through the
process back then.

That was to move from the `lts` (Long Term Service) to the `normal`
release.

In this guide we're going full YOLO upgrade to Aprils release! I
personally have been using this for a few month now with no issues.

## Do a normal upgrade (Ubuntu 21.10)

If you're wanting to go to the next `normal` release you can use the
approach mentioned in the linked guide. The Tl;Dr is this, open the
`release-upgrades` file with:

```bash
sudo nano /etc/update-manager/release-upgrades
```

And change the default behaviour from `lts` to `normal`:

```bash
# Default behavior for the release upgrader.

[DEFAULT]
# Default prompting and upgrade behavior, valid options:
#
#  never  - Never check for, or allow upgrading to, a new release.
#  normal - Check to see if a new release is available.  If more than one new
#           release is found, the release upgrader will attempt to upgrade to
#           the supported release that immediately succeeds the
#           currently-running release.
#  lts    - Check to see if a new LTS release is available.  The upgrader
#           will attempt to upgrade to the first LTS release available after
#           the currently-running one.  Note that if this option is used and
#           the currently-running release is not itself an LTS release the
#           upgrader will assume prompt was meant to be normal.
Prompt=normal
```

If you going this route then before you start, make sure you have
updated and upgraded your system with the usual command:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
```

Then you can use the `do-release-upgrade` command to upgrade:

```bash
sudo do-release-upgrade
```

## Do a development release upgrade (Ubuntu 22.04)

I'm not doing that though! I'll be going to the development release!
As I mentioned earlier, before doing this I'll make sure I have
updated and upgraded my system with the usual command:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
```

So for the development upgrade I'm going to be passing the development
flag ([`-d`]) to the `do-release-upgrade` command:

```bash
sudo do-release-upgrade -d
```

Then I can follow any prompts which are given, the first is to confirm
I'm happy to proceed with the upgrade.

```bash
Reading state information... Done

Calculating the changes

Calculating the changes

Do you want to start the upgrade?


1 installed package is no longer supported by Canonical. You can
still get support from the community.

3 packages are going to be removed. 86 new packages are going to be
installed. 597 packages are going to be upgraded.

You have to download a total of 253 M. This download will take about
1 minute with your connection.

Installing the upgrade can take several hours. Once the download has
finished, the process cannot be canceled.

 Continue [yN]  Details [d] y
```

I'll answer `y` to continue.

The next is a prompt asking me if I want to configure a mail server!
I'm not using Ubuntu for that so I'll skip that.

[![configure-ubuntu-mail-server-initial]]
[configure-ubuntu-mail-server-initial]

I'll use the arrow keys to select `No configuration`.

[![configure-ubuntu-mail-server-no-config]]
[configure-ubuntu-mail-server-no-config]

Then use the tab key to select `<Ok>` and hit the enter key to
continue.

[![configure-ubuntu-mail-server-ok]] [configure-ubuntu-mail-server-ok]

Next I'm prompted to confirm the removal of the obsolete packages,
I'll answet `y` to this and hit enter.

```bash
Reading package lists... Done
Building dependency tree
Reading state information... Done

Searching for obsolete software
Reading state information... Done

Remove obsolete packages?


68 packages are going to be removed.

 Continue [yN]  Details [d] y
```

Then finally I'm prompted to restart the server after the upgrade is
complete:

```bash
System upgrade is complete.

Restart required

To finish the upgrade, a restart is required.
If you select 'y' the system will be restarted.

Continue [yN] y
```

I'll get a final prompt to tell me the system needs a restart!

```bash
System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down
Failed to talk to init daemon.
=== Command detached from window (Wed Jan 26 22:21:08 2022) ===
```

If I hit enter again and press `x` the terminal will restart with the
upgraded version of Ubuntu.

I can do a final check with `lsb_release -a` to confirm I've been
upgraded!

```bash
🎉lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu Jammy Jellyfish (development branch)
Release:        22.04
Codename:       jammy
```

All done!

## Here's a video detailing the process

You can check out the upgrade process over on my YouTube channel as
well!

<YouTube youTubeId='2Mwo4BfJuvA'/>

## Wrap up!

That's it! I've upgraded my Ubuntu version from 20.04 to 22.04!

I hope you found useful and I'll see you in the next one!

<!-- Links -->

[documented the process]:
  https://scottspence.com/posts/update-wsl-ubuntu-from-18.10-to-19.10
[`-d`]: https://ubuntu.com/server/docs/upgrade-introduction

<!-- Images -->

[configure-ubuntu-mail-server-initial]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1643235369/scottspence.com/configure-ubuntu-mail-server-initial.png
[configure-ubuntu-mail-server-no-config]:
  https://res.cloudinary.com/defkmsrpw/image/upload/v1643235370/scottspence.com/configure-ubuntu-mail-server-no-config.png
[configure-ubuntu-mail-server-ok]:
  https://res.cloudinary.com/defkmsrpw/image/upload/v1643235369/scottspence.com/configure-ubuntu-mail-server-ok.png
