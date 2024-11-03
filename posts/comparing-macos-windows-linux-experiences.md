---
date: 2023-11-04
title: Comparing macOS, Windows, and Linux Experiences
tags: ['macos', 'windows', 'linux', 'notes']
is_private: false
---

<script>
  import { DateDistance as DD } from '$lib/components'
</script>

I don't get it. I've used macOS for well over 4 years Windows for the
past 20 and I have used Linux for 4 years. I've been using all these
systems for a long time and sometimes the snark get's to me.

I get it everyone has their preference, but, this doesn't mean that
using one platform over another is flawed. Blind allegiance to one
platform over another means that you could be missing out on the
benefits of the other platforms.

I know the vibe, I used Android for over 10 years and was in the early
ROM flashing scene, good times! I have now been an iOS user now for 2
years. I'm just at that age now where I want my phone to work and not
have to spend hours scrolling through XDA forums to find the right ROM
for my phone.

## What I want in a platform

Developing websites and creating content are the main things that I
use a computer for, so, being able to get set up quickly with node,
zsh, and other cli tools is a must..

There's a couple of categories that I want to compare the platforms
on:

- Development Environment Setup
- Display Management
- Window Management
- Webcam Functionality
- Content Creation

## macOS

Apple sell beautiful devices, there's no denying that. The hardware
with the M chips is amazing and the battery life is incredible. Mind
blowing that you can use it over a couple of days without charging.

People say "it just works" which is where I have to disagree. My
experience with macOS has been on par with the other platforms I've
used. I've had to troubleshoot issues with macOS just as much as I
have with Windows and Linux.

**Development Environment Setup**

You think that macOS would come installed with git already, it
doesn't. To get git on a mac you have to install Xcode, which is
around 11GB massive! just for git!

There's alternate ways to install git on a mac, but, they're not easy
to find.

**Display Management**

With macOS I have never found a decent way to extend/duplicate
screens, there's always that annoying orange dot in the top right
corner and when presenting there's the whole mirroring thing which is
buried in the settings.

**Window Management**

Window management (with the keyboard) on macOS is non existant and you
have to rely on third party software.

I was using Raycast for moving windows with keyboard shortcuts for a
while and it was really good. There's other tools out there to do the
same thing.

**Webcam Functionality**

Web cameras with all the MacBooks I have used have rarely worked as
expected. There were always some visual glitch, image flickering or
just plain wont work. Usually a hardware issue and more often than not
there's no macOS version available from the manufacturer

**Content Creation**

Content creation on the mac in my past experience hasn't been the
best. OBS can be a bit of a challenge to get working as you'd like
(because of the new M chips?) and I don't think there's additional
audio drivers you can install for things like noise suppression.

## Linux

Linux is very much a DIY platform, you can get it working as you want
you can use really old hardware and have a really snappy system due to
the memory footprint.

Bring your own hardware and get stuck in! Prepare to spend many hours
trying to find the fix for that one issue that's really bugging you,
like no native support for emojis, so you have to install them or find
an emoji picker you like!

**Development Environment Setup**

Linux, if there's no community support for what you want to do then
you're out of luck, you have to wait for someone to create it or make
it yourself, as is the OSS way.

The platforms I use have always come with git installed as default,
installing additional tools after that is a `apt get install` or
terminal command away.

**Display Management**

Extend/duplicate screens is configurable in the settings and works
well with usually only minor adjustments needed. Always simple to find
with a quick search.

**Window Management**

Window management is pretty good with the majority of the platforms I
used having it as default. With minor adjustments needed in hotkeys
sections I've usually always been able to get it working as I want.

**Webcam Functionality**

Webcams, I have never had an issue with webcams for recording OBS
videos or attending virtual meetings, plug and play as expected.
Driver support is usually limited and you're relying on the community
to create them.

**Content Creation**

Content creation using OBS, again, there may be missing audio drivers
for noise suppression. Things like virtual camera backgrounds were not
readily available when I was last using Linux as my daily driver.

## Windows

Windows, the most boring of them all. Loved by large enterprises and
corporates. Used absolutely everywhere and the most supported
platform.

Again, bring your own hardware or buy a pre-built machine! I [built my
own machine] <DD date="2020-05-30" /> ago and it's still going strong.

**Development Environment Setup**

Don't do web development on Windows! 😂 **"But you're a web developer
what gives?"** I use the Windows Subsystem for Linux (WSL) this means
that I can install either one (or many) of the supported distros
available from the Microsoft Store or install my preferred distro!

This means that you don't need to concern yourself with getting git
and node working on the Windows platform which I have seen many people
struggle with.

On Windows 11 getting set up with WSL now is one PowerShell command
with `wsl --install Ubuntu` this does everything needed to get WSL set
up on your machine and install Ubuntu. I can even install a desktop
environment and use it as if it was a native Linux machine. But, no.

**Display Management**

Extend/duplicate screens is configurable in the settings and works
with minor adjustments needed, in my experience it's the most complete
and easy to use.

**Window Management**

Window management as the name implies is the Windows thing! It's
really intuitive and there's been some really good improvements in
Windows 11

**Webcam Functionality**

Webcams, the majority I have used in the past have been plug and play
with no issues, in some cases things get better with drivers from the
manufacturer and of course Windows is supported.

**Content Creation**

Content creation using OBS again there may be missing audio drivers
for noise suppression, the built in ones are really good and if you
have a graphics card then additional ones can be installed and used.
Things like virtual camera backgrounds are supported with XSplitVcam
great bit of software.

## Conclusion

This is a really quick comparison of the platforms I have used, I know
I didn't cover things like video editing software or anything platform
specific that would have one stand out from the others.

In my experience the points covered are the things that I have to deal
with on a daily basis and what is the most important to me when using
a platform.

My current daily driver is Windows 11, for <DD date="2020-05-30" />
now. At one point I was dual booting PopOS and Windows 11 but I found
that I was using Windows more and more. If I needed anything Linux
specific I would just use WSL and do what I needed to do there.

As with my mobile experience of going from Android to iOS I just want
things to work and I have found Windows + WSL is the best for me.

## Further Reading/Resources

I've written about my experiences with most of these platforms you can
check out the tags for them:

- <a href="/tags/ubuntu" target="_blank">Ubuntu</a>
- <a href="/tags/fedora" target="_blank">Fedora</a>
- <a href="/tags/manjaro" target="_blank">Manjaro</a>
- <a href="/tags/windows" target="_blank">Windows</a>

<!-- Links -->

[built my own machine]:
  https://www.scottspence.com/posts/first-time-pc-build
