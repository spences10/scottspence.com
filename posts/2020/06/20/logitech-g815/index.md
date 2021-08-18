---
date: 2020-06-20
title: Logitech G815 Keyboard on Ubuntu - First Impressions
tags: ['hardware', 'ubuntu']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

My beloved [HAVIT KB395L] keyboard left Ctrl key has started cutting
out intermittently. As a developer all my coding revolves around that
key saving changes and copy pasting.

This means that my code now breaks with a random `s` in there where I
thought I'd saved something, or where I've replaced a code block with
`v`. 🙃

> CLACKITY, CLACKITY, CLACK, CLACK

When I say _beloved_ that keyboard was just the right mix of
mechanical feel without the CLACKITY, CLACKITY, CLACK, CLACK noise of
a mechanical keyboard.

Check out this video from TaeKeyboards on the HAVIT KB309L so you can
get an idea of the sound of the keys.

<YouTube youTubeId="9UhLZ9AWHJM" skipTo={{ h: 0, m: 6, s: 28 }} />

The video goes into depth on the switch used for the keyboard which is
a low profile Kailh switch, see this section for an explanation of how
they work compared to normal switches.

<YouTube youTubeId="9UhLZ9AWHJM" skipTo={{ h: 0, m: 3, s: 53 }} />

This switch is what I've been looking for, ever since getting the
HAVIT KB395L and finding that keyboards with this switch are _very_
hard to come by.

## The new shiny

Ok, time to stop [ruminating] on the keyboaard (as it's not healthy)!
Time to move on, but where to? I mentioned earlier I've bee finding it
_really_ difficult to find those switches in any other keyboards
anywhere.

Well, in these sorts of situations I'll go where I always go, YouTube!
After searching for loads of low profile boards I kept coming across
the Logitech G815, the switches looked similar and from watching
videos of review on it they _sounded_ similar too.

At £140 it wasn't a decision I'd make lightly (reduced from £170
though!) but the left Ctrl key situation was quite disruptive to my
flow so I had to go in!

I know the next shipment of the HAVIT KB395L will be arriving in
November with an increased price tag now, from £85 what I initially
paid to £137 as they know they're onto a winner with this and it's
popularity.

## First Impressions

The box for the board was LARGE! Then getting the actual board out of
the box I understand why.

Comparison with the HAVIT box on top on the G815 box:

![box comparison]

They keycaps have a nice matt finish, time will tell on how long it
will be before the finish wears off to leave shiny buttons. I'm fine
with that by the way.

The buttons for the presets at the top, along withe the brightness
switch and game mode switch add a good 25mm to the top of the board.

That along with the G switches on the left of the board all add up to
quite a larger footprint that my previous board.

![boards comparison]

That been said the keys feel exactly the same, maybe a bit firmer but
it's that really nice crisp click that I like.

## Thinn (but thicc)

Super thin! This was one of the big draws for me, it is thinner than
my last keyboaard. If you like to have the keyboaard elevated there's
two settings to lift the back of the board.

Weighty! It has a considerable weight to it coming in at over 1kg
giving it a nice premium feel.

## Lights

Lights! I would like to say that RGB lighting on a keyboard isn't
important to me but after initially plugging in the G815 and having
the initial setting of rainbow cycle set I immediately tried to change
to to something solid.

![rainbow cycle lights]

There wasn't any presets that were solid so I put the light setting to
0 and then couldn't make out the keys on the board as it was
completley blank.

My touch typing isn't great so I had to set it to one of the least
annoying presets until I figured out how to change them.

## Adapting to change

Any key, or key combination used in my usual workflow which involves
keys on the left hand side of the board, like Alt Tab, the backtick
key, Ctrl all have these G keys next to them.

This is something I'm gong to have to get used to where my fingers
usually hover on the left hand side of the board.

Alt+Tab I was instead pressing Super+G2, getting the Ctrl and Super
key mixed up due to the additional keys on the side means I have to
consiously find the groove between the G keys with my pinky before
typing.

## Lighting configuration on Ubuntu

Logitech have management software for the G815 with the [Logitech G
Hub] which is available for Windows and macOS users, but as I'm a
Linux users that's no help to me! 🙃

This was nearly a dealbreaker for me but I found a [Reddit post] with
someone asking the same question, turns out there is support for it in
the shape of [libratbag].

I had to [add a PPA] to install libratbag:

```bash
sudo add-apt-repository ppa:libratbag-piper/piper-libratbag-git
sudo apt-get update
sudo apt install ratbagd
```

Then there was a GUI to use called Piper which I installed from the
Ubuntu software manager.

Opening Piper I'm greeted with an image of a mouse holding a 404 sign.
So it looked like the software wasn't working until I tried changing
the profiles and saw the lights changing.

I added my preferred colour I wanted for the keys clicked apply and
nothing happened, it wasn't until I switched profiles that I noticed
the changes taking effect.

![preferred-colour]

I did find that you can change the lighting in the G in the top left
of the keyboard to be a different colour or off all together. I
decided to keep it the same as the keys as it looked a bit out of
place with the lights turned off.

## So far so good

I really like having the media controls above the number pad, yes I
like the number pad.

The volume roller is awesome too, has a real nice feel to it with no
lag between rolling it and the volume being adjusted on the system.

The keycaps are nice but what I find strange is that the characters on
the board are no illuminated like the letters making it a little
harder to scan the board visually to find them.

## Dem G keys

From reading up on the issue linked on the [Reddit post] it does seem
like I can assign different keys or nothing to the G keys.

For now at least I think I'll try live with them as is, although the
G5 key is mapped to F5 so it may get annoying.

<!-- Links -->

[havit kb395l]: https://www.amazon.co.uk/gp/product/B0767YQQTQ
[ruminating]: https://en.wikipedia.org/wiki/Rumination_(psychology)
[logitech g hub]:
  https://www.logitechg.com/en-gb/innovation/g-hub.html
[reddit post]:
  https://www.reddit.com/r/linux4noobs/comments/eqkotk/logitech_g815_keyboard_controls/
[libratbag]: https://github.com/libratbag/libratbag
[add a ppa]:
  https://launchpad.net/~libratbag-piper/+archive/ubuntu/piper-libratbag-git
[box comparison]: ./box-comparison.jpg
[boards comparison]: ./boards-comparison.jpg
[rainbow cycle lights]: ./rainbow-cycle-lights.jpg
[preferred-colour]: ./preferred-colour.jpg
