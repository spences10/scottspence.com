---
date: 2020-01-28
title: Upgrade Windows Subsystem Linux - Ubuntu 18.04 to Ubuntu 19.10
tags: ['wsl', 'guide', 'ubuntu']
isPrivate: false
---

<script>
   import { YouTube } from 'sveltekit-embed'
</script>

In this guide I'm going to detail upgrading a Windows Subsystem Linux
(WSL) Ubuntu install from the current version 18.04 to 19.10 this is
an intermediary release before Ubuntu 20.04 is released on 2020
April 23.

I have documented [this process in the past] for moving from Ubuntu
version 18.04 to 18.10. You can see [my comments] as I went through
the process back then.

## 📺 Here's a video detailing the process.

<YouTube youTubeId="IErQ4RnzPOg" />

## Check the current Ubuntu version

Ok, to check the current installed version of Ubuntu from the terminal
I enter `lsb_release -a` to get the currently installed Ubuntu version
displayed.

> LSB stands for Linux Standard Base and the '-a' is for 'all
> information'

```bash
lsb_release -a
```

The output looks like this:

![current-version]

## Do the release upgrade!

To start the upgrade I enter the terminal command
`do-release-upgrade`.

```bash
sudo do-release-upgrade
```

![do-release-upgrade]

This will prompt me if my `release-upgrades` file isn't set to
`normal`.

## Set release upgrades to normal

Open the `release-upgrades` file path to edit, in this example I'm
using [Nano] to edit the file.

```bash
sudo nano /etc/update-manager/release-upgrades
```

In the file I change the `Prompt` from `Prompt=lts` to
`Prompt=normal`.

![release-upgrades-normal]

To save the file in Nano I use Ctrl+o to write out the file, confirm
(Enter/Return) then to close use I Ctrl+x.

<!-- cSpell:ignore realsies -->

## Do the release upgrade, for realsies

Now the `release-upgrades` file is set to `normal` I can do the
[do-release-upgrade].

![release-upgrade-for-realsies]

You may be aware of an [lxd error] that occurs on the Ubuntu 18.04 to
Ubuntu 18.10 upgrade. This is where there is a prompt saying ["Your
system is unable to reach the snap store"].

I'm going to skip this during the upgrade but you can _**optionally**_
run this when doing this for yourself, here's the command:

<!-- cSpell:ignore dpkg -->

```bash
sudo dpkg --force depends -P lxd; sudo dpkg --force depends -P lxd-client
```

Pick the same command again in the terminal, if I arrow up a a couple
of commands I can use it again.

```bash
sudo do-release-upgrade
```

I'm now prompted with the details of what is going to happen in the
upgrade:

![upgrade-confirmation]

I respond with `y` to continue and start the upgrade.

## Warnings and configs

<!-- cSpell:ignore libc -->

When I'm prompted about `libc6` for restarting services during package
upgrades I use the tab key to select `<Yes>` then return to continue.

![config-libc6]

Next I have the `Lxd` warning I mentioned earlier, in this case I'm
going to arrow down and select the option to `<Skip>` then hit return
to continue.

![lxd-warning]

In the following screens I'm being asked about package configuration,
I'm going to be picking the option to
`install the package maintainer's version` for all of them.

Same with `openssh-server` arrow up key to to
`install the package maintainer's version` and hit return to continue.

<!-- cSpell:ignore servier -->

![openssh-servier-config]

Then there's the `release-upgrades` configuration and yeah I'm going
to select to `install the package maintainer's version` and confirm to
continue.

![release-upgrades-config]

## Finish up install

One of the last few prompts is to confirm the removal of the obsolete
packages, confirm `y` to continue.

![finish-up-install]

Restart is required now, so I confirm with `y`.

![restart-prompt]

Now I have the confirmation that the do release upgrade completed
successfully. I press Ctrl+c

![finish-upgrade]

Then have to press `x` to destroy!

![press-x]

That takes me back to the regular prompt where I can check with
`lsb_release -a` what version I'm now on.

![done]

Confirmation the Windows Subsystem Linux version of Ubuntu I'm using
is now on 19.10.

## Wrap up!

That's it! I upgraded a WSL Ubuntu version from 18.04 to 19.10.

<!-- cSpell:ignore upgrader -->

First, I changed the default behaviour of the release upgrader from
`lts` to `normal`.

Then `do-release-upgrade`, and I skipped the `Lxd` configuration. It
isn't needed on WSL but is part of the Ubuntu image on the Microsoft
Store 🤔

I accept `install the package maintainer's version` on any
configuration prompts.

Done.

## Thanks for reading 🙏

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

<!-- Links -->

[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
[this process in the past]:
  https://scottspence.com/posts/update-wsl-from-18.04-18.10/
[my comments]: https://dev.to/spences10/comment/9n19
[do-release-upgrade]:
  https://help.ubuntu.com/lts/serverguide/installing-upgrading.html
[nano]: https://help.ubuntu.com/community/Nano
[lxd error]: https://dev.to/spences10/comment/9n3j
["your system is unable to reach the snap store"]:
  https://askubuntu.com/questions/1119301/your-system-is-unable-to-reach-the-snap-store

<!-- Images -->

[current-version]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858536/scottspence.com/01.current-version-56f1518727b9d6339ef9cbc2f7813813.png
[do-release-upgrade]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858539/scottspence.com/02.do-release-upgrade-805fa66fa97906724e4644eceacbae5b.png
[release-upgrades-normal]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/03.release-upgrades-normal-396a67aa70e77081cacb71f123e08cad.png
[release-upgrade-for-realsies]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/04.release-upgrade-for-realsies-a48e73b6af82c743301d46ca098e03d1.png
[upgrade-confirmation]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/05.upgrade-confirmation-d4e06ebd5c9d732cffeaf9c8d0273841.png
[config-libc6]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/06.config-libc6-1cc150556cfed1f2b15fa369dbaacb46.png
[lxd-warning]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858536/scottspence.com/07.lxd-warning-c71b11ddfc5f0f3d0c8827901b8cdef0.png
[openssh-servier-config]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/08.openssh-servier-config-bfad8f011380589631f7857a44b4e99e.png
[release-upgrades-config]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/09.release-upgrades-config-5c27fb195ae859a7575b1376cd6132f3.png
[finish-up-install]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/10.finish-up-install-be96c886864a0920396fcffe2c546315.png
[restart-prompt]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858536/scottspence.com/11.restart-prompt-f720e506166f0f6898567559fbca187d.png
[finish-upgrade]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858539/scottspence.com/12.finish-upgrade-3f0a6842f37baa0f0e96b0468168a9e6.png
[press-x]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/13.press-x-49c154256be46d63b6dc1298907787f8.png
[done]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858538/scottspence.com/14.done-c0cac6ec5e1203fba1cdd7becdcd5391.png
