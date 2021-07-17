---
date: 2021-04-28
title: OBS Fix Display Capture not Working
tags: ['how-to', 'obs']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

I came across this issue today when trying to set up OBS on a new
machine where trying to add a display capture and there was no output
for the screen.

I found a fix, apparently this only affects laptops and it's to do
with the video card.

There's a section buried in the settings to add custom options for
apps located:

```text
Settings > System > Display > Graphics settings > Custom options for apps
```

in there is an option to 'Add an app', select 'Desktop app' then
navigate to OBS mine is located here:

C:\Program Files\obs-studio\bin\64bit\obs64.exe

OBS is now added to the all apps list, if I click on it I get two
buttons 'Options' and 'Remove'. Clicking the options I'm asked for
Graphics preference with 'Let Windows decide' as the default.

Selecting the 'Power saving' option didn't do anything for me so I
enabled 'High performance' going back to OBS and closing and opening
it again (classic) I could then see the display capture.

Here's a video detailing the process:

<YouTube youTubeId="5_YnG4j03yE" />

This partly worked but I spent the next four hours trying to work out
why my Twitch chat and alerts weren't showing I found another solution
in a video where I had to disable one of the graphics cards.

Modern laptops have two graphics cards one for high powered stuff like
games and the other for browsing web pages. OBS doesn't understand the
difference between the two.

The next video I found covered a specific way to do it which involves
going into the Device Manager (search Device Manager in the Windows
menu) and finding the card I wanted to disable in the 'Display
Adapters', there was two options for me `AMD Radeon(TM) Graphics` and
`NVIDIA GeForce RTX 2060` I disabled the AMD one closed and reopened
OBS and it was fine.

The video also details putting OBS into compatability mode I tried
with and without and it made no difference for me so I left it how it
was.

<YouTube youTubeId="IexPI3oE4p0" />

Here's a detailed video going over all the points I mentioned and some
other things you can try if you're having a similar issue:

<YouTube youTubeId="FrmcLHFCAiM" />

This was a real pain in the butt to work out. Hope it helps you too!
