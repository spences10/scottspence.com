---
date: 2021-04-28
title: OBS Display Capture from one PC to Another
tags: ['how-to', 'obs']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

I got my new hardware from GraphCMS today and wanted to stream the
setup of a Windows PC for web development.

The idea was to do a 'set up a Windows machine from scratch for web
development' and there would be restarts when installing Windows
Subsystem for Linux so if I was streaming from that machine I'd lose
the stream on restart.

## Options

I know there was an option to use a screen capture card but I needed
to get the hardware operational (because work) so I asked about on
[Twitter] and did some searching of my own and came across some
solutions.

Found this one first:

<YouTube youTubeId="Nc2rPvJFwQ8" />

Which seemed reasonable but I wasn't that keen on installing the whole
suite from [NDI] so I did a bit more searching.

Then I found this one which doesn't need additional software outside
of OBS:

<YouTube youTubeId="4q1rXLcXRLM" />

So the idea is to set up OBS on both machines and have one pipe the
output to the other.

The second option I got working after solving the [OBS Fix Display
Capture not Working] issue.

Worked a charm, I could see the new machine on my PC where I was going
to do the stream from to Twitch.

## Burn

The issue for me was that I didn't have the WiFi bandwidth to stream
it. It wasn't until I started the stream that I saw the majority of
the stream was buffering whilst my WiFi crumbled under the load of
sharing the output from the two devices.

## Another way

It was only after a totally delightful conversation with [Kevin Lewis]
(hit him up for board game ideas any time) that I discovered I could
have done this a _lot_ simpler with Streamyard.

Streamyard if you're not familiar with it is a web based streaming
solution that allows you to stream to YouTube, Twitch and LinkedIn
from one place.

If I were to use the Streamyard link from the new machine then host on
my PC where I was streaming from, then I could add the new machine as
a guest to the stream, do all the work on there and when I needed to
restart I could do some talking whilst I wait for the new machine to
reboot.

A lot of the time the simpler option is by far the best, I was so
preoccupied with trying to work out if I _could_ do it that I didn't
consider the simpler option.

Lesson learned.

[ndi]: https://ndi.tv/
[twitter]: https://twitter.com/spences10/status/1387412287330430978
[obs fix display capture not working]:
  https://scottspence.com/posts/obs-display-capture-not-working/
[kevin lewis]: https://twitter.com/_phzn
