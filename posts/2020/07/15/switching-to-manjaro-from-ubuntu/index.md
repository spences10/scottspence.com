---
date: 2020-07-15
title: Switching to Manjaro from Ubuntu
tags: ['manjaro', 'ubuntu', 'getting started', 'linux']
isPrivate: false
---

<script>
  import Tweet from '$lib/components/tweet.svelte'
</script>

I switched from Ubuntu to Manjaro Linux, here's how it went.

So for a while now I've been using Ubuntu, from when my old Asus
Transformer Pro decided that it didn't like running windows anymore.

To [my shiny new rig] where the first thing I installed was Ubuntu,
now I'm not going to pontificate on OSs and which one is the best,
leave that for Twitter! 😂

There are pros and cons to all systems and it's up to you which ones
you want to live with.

I have preferred Linux, mostly Debian based distributions (or distros)
for a long time now. I remember initially trying Ubuntu around 2013
and decided I didn't like the unity launcher that came with it.

Linux Mint was my go to as it was Windows like with the super key
mapped to the applications menu so you could navigate around your apps
which felt familiar and I stuck with it for a long time before going
back to Windows (new hardware with Windows preinstalled).

Then I switched back to Ubuntu with the introduction of Windows
Subsystem Linux, it was only a matter of time before I decided to go
all in with Ubuntu again as that was where the majority of my work was
being done. Also see the second paragraph, my old Asus laptop was
really bogged down with all the Windows updates.

Right! Mangled retelling of my OS history out of the way I can now
continue!!

June 9th I did an innocent Twitter poll, and got some really good
suggestions on other Linux distros to try.

<Tweet tweetLink="spences10/status/1270385153232207874" />

I decided to give all the Manjaro distros a try, I tried Majaro once
before and was a bit overwhelmed (because it wasn't Debian) so didn't
persue it any farther.

<Tweet tweetLink="spences10/status/1270589501732278272" />

This time however I was _super_ impressed!

<Tweet tweetLink="spences10/status/1281174782269161474" />

Ok! Enough of the tweets! Here's how it went...

## Didn't copy my dotfiles

First up, I made a backup of my current Ubuntu home folder, what I
didn't know at the time was that a straight up copy pasta with the
file GUI doesn't copy hidden files!

Luckily I had my dotfiles on GitHub along with my setting for various
apps like VSCode so it wasn't a massive issue.

If you're thinking about doing something similar check your backups or
use a backup tool.

## Super fast install

It was a freakishly quick install, I do have a fast SSD but it was
something like three minutes to install after clicking 'install' on
the Majaro installer interface.

<Tweet tweetLink="spences10/status/1283394445300375553" />

## Boot order

So after the freakishly fast install I restarted and got a weird
message:

```text
> looking for media
> Media not found
```

Not a good start 😬, it eventually booted which was a relief!

<Tweet tweetLink="spences10/status/1283420540280156162" />

I found out the following morning that the SSD wasn't first in the
boot order in the Motherboard BOIS so after putting it first the
message went away. 😅

## Bluetooth

Bluetooth wasn't working with my headset, to Google!

I found a post on the [Manjaro forum] which (once I got past the crazy
amount of links on there) pointed me to install
`pulseaudio-bluetooth-a2dp-gdm-fix` searching for "Bluetooth Headset"
in the add/remove software section will bring it up.

## Yarn

I was having Yarn Global binaries not sowing in the fish shell, you
know when you install a global package, well they weren't showing.

I did the usual by adding the path to my `.bashrc` file:
`PATH=$PATH:/home/scott/.yarn/bin`

This was my first port of call but was still getting issues in Fish,
wasn't until I checked in Bash that I knew the path was working.
([What prompted me to check bash])

- Useful(ish) links from SO and GH:
  - SO:
    https://stackoverflow.com/questions/40317578/yarn-global-command-not-working
  - GH: https://github.com/yarnpkg/yarn/issues/5353

I found an issue on the [Yarn repo] detailing the same issue, set
this:

```bash
set -U fish_user_paths $HOME/.yarn/bin $HOME/.config/yarn/global/node_modules/.bin $fish_user_paths
```

If you need to remove it at a later date use:

```bash
set fish_user_paths (string match -rv yarn $fish_user_paths)
```

## Emoji

There's no packages form am emoji dialog, you know like the one you
get in macOS with Ctrl+Command+Space so I installed Emote via a Snap!

```bash
snap install emote
```

Emote package details here: https://snapcraft.io/install/emote/ubuntu

There were issues with emoji not showing in some apps, I've come
across it before but this time there was no support in my VSCode!

Before:

![emoji support before]

There was a post on the Manjaro forum for [emoji support] which I
wasn't keen on so I had a play around in a VM and found there was no
need to add the config.

I needed to do was install the `noto-fonts-emoji` package:

```bash
sudo pacman -Syu noto-fonts-emoji
```

Then in Tweaks set the Legacy Window Titles to Noto Sans Regular.

Tweaks > Fonts > Legacy Window Titles > Noto Sans Regular

After:

![emoji support after]

## Hot corners

I was somehow turning on the activity view, it looks like this:

![activity view]

I was getting pretty annoying but I found out it was a [hot corner
setting] which was disabled in the Tweaks dialog.

Tweaks > Top Bar > Activities Overview Hot Corner

## Virtualbox

Installing Virtualbox wasn't a straightforward click install either I
had to get a version matching my kernel version! 🙃

There's a dialog that the add/remove software interface presents you
with with a big list of host modules.

To check the kernel:

```bash
uname -r
# 5.6.16-1-MANJARO
```

So that means I should pick `linux56-virtualbox-host-modules` 😅!

<Tweet tweetLink="spences10/status/1283797903203618816" />

I found this info [again from the Manjaro forum].

## Done

So far, that's all the hickups, so not completely smooth sailing!

But, I still _really_ like the GNOME desktop with Manjaro, super
snappy and FAST!

<!-- Links -->

[my shiny new rig]:
  https://scottspence.com/2020/05/30/first-time-pc-build/
[manjaro forum]:
  https://forum.manjaro.org/t/bluetooth-is-not-working-with-headphones/116661/4
[yarn repo]: https://github.com/yarnpkg/yarn/issues/5824
[what prompted me to check bash]:
  https://github.com/yarnpkg/yarn/issues/4702#issuecomment-343970090
[hot corner setting]: https://askubuntu.com/a/1019918/142801
[emoji support]:
  https://forum.manjaro.org/t/solved-emoji-support-problem/86783
[again from the manjaro forum]:
  https://forum.manjaro.org/t/help-me-install-virtualbox/103458/4
[emoji support before]: ./emoji-support-before.png
[emoji support after]: ./emoji-support-after.png
[activity view]: ./activity-view.png
