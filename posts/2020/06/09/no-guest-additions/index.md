---
date: 2020-06-09
title: Full Screen Resolution With No Guest Additions in VirtualBox
tags: ['learning']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

Virtual Box Guest Additions _can_ be a bit of a pain to set up
sometimes.

My current PC setup for some reason wouldn't show a VM in the full
resolution.

I went through a lot of post followed loads of instructions with none
of them working until I watched this video from ArcoLinux.

<YouTube youTubeId="zW03Vs2CVZo" />

There's a couple of options I've never had to configure before but
once I did I got a full screen resolution without having to mess
around with installing Guest Additions.

First up is "Enable PAE/NX" then I also checked "Enable Nested
VT-x/AMD-V"

![system extended features]

Then the display setting pick the "VBoxSVGA" option from the "Graphics
Controller" dropdown.

![display screen setting]

With these setting enabled ther's no need to install the Guest
Additions software.

> I've found that I need only to enable "Enable Nested VT-x/AMD-V"

After reading this post on [SuperUser] and the accompanying [WikiPedia
page] I decided to disable the "Enable PAE/NX" setting and play around
with the settings a bit more and I've found that I need only to enable
"Enable Nested VT-x/AMD-V"

On Windows and macOS you may need to enable the options through the
CLI, instructions on that can be found in this video.

<YouTube youTubeId="JMT2qimIL9Q" />

<!-- Images -->

[system extended features]: ./system-extended-features.png
[display screen setting]: ./display-screen.png
[superuser]:
  https://superuser.com/questions/1118712/when-do-i-have-to-use-pae-nx/1381508#1381508
[wikipedia page]:
  https://en.wikipedia.org/wiki/Physical_Address_Extension
