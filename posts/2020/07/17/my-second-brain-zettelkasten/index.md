---
date: 2020-07-17
title: My Second Brain - Zettelkasten
tags: ['habits', 'notes', 'vscode', 'resource', 'tools']
isPrivate: false
---

<script>
  import { DateDistance } from '$lib/components'
</script>

For as long as I have been learning web development (<DateDistance
date="2016-06-15" />) I have been taking notes. Partly notes to help
clarify my understanding of something and partly for future me.

That's why I have my [digital garden], an online collection of my
learning over the years.

What is in my garden is not the full extent of the notes I have taken
however, there's partly formed musings and one-liners that will help
me if I ever come across this one particular thing which took a while
to fix/resolve in the past.

Stuff like that doesn't really warrant going into a post so I have
[Cheat Sheets] where that will get added to and grouped with the
relevant information.

It's not been until recently that I have come to learn of the
[Zettelkasten] method, which translates from German to note box.

With tools like RoamResearch and Notion gaining popularity and me
using many of them I've decided to make some notes on my opinions of
what I have been using over the years.

## Cliffs/TL;DR

I'm using a mixture of Foam and Obsidian with my data exported from
RoamResearch and Notion which I now use in a private GitHub repo that
I'm in full control of.

## GitHub

GitHub is where it all began for me, with git being a particular
sticking point with a lot of commands that were all pretty alien at
the time so I started adding the commands [to a gist] which has a
history going back to [the start of 2017].

As this list started to grow I also had other areas that I needed to
keep these little one-liners to hand, git being the largest but other
things like [how to screen snip] on macOS and [kill a process] with
bash, all started adding up.

I moved them all into [one repository] for ease of access for me.
These later were added to [Cheat Sheets].xyz

## Notion

Back when Notion was the new hotness and I jumped onto it as soon as a
discovered how flexible it was and more importantly cross platform, so
I could take notes on my phone, work laptop and personal computer yay
🎉

<!-- cSpell:ignore kanban -->

I used it for stashing ideas for later, todo lists, shopping lists,
kanban boards and the 100s of links that I thought looked interesting
but didn't have time to read it there and then so stashed them in the
Notion links database (never to be seen again 🤣).

Downsides, the search wasn't great, that's been improved in recent
iterations but was quite annoying when you wanted to find something
quickly.

The Android version just straight up stopped working, I couldn't use
it and the general feeling from Notion was meh!

I learned the hard way about differing Markdown versions with this too
after making a 8k word post in Notion then copy pasting into VS Code
to find all the artifacts for code snippets and word formatting
throughout.

Getting my data out of Notion was straightforward enough but what I
was left with was a but of a mess. Because of the nesting you were
able to do with pages in pages the export was a mess of files with
hashes appended to them which is going to take a while to untangle.

## RoamResearch

Roam RoamResearch was a different way of logging notes, the default
was to open you on a daily notes view where you'd add your notes and
you could then move these into more long form documents with the help
of the graph behind it which helped you link information with
backlinks (`[[example backlink]]`) with the intention of helping you
collate information from differing sources.

The odd bit was that you could only add in a bullet fashion, so if you
want to add a code block it always looked weird inline of a unordered
list.

<!-- cSpell:ignore culty,googlers -->

It got a bit weird and culty, I always get a bit wary when companies
start referring to their users/employees as tribes, "Roamers",
"Googlers", no thanks.

That along with starting it and staring at the rotating logo for an
age waiting for it to start, not helpful when you want to take a note
quickly.

Getting my data out of there was a straightforward button click
though.

## Obsidian

Obsidian, the free (or one off licence payment) offering that is a
standalone app, much like Notion (which I know is web based too)
available on macOS, Windows and Linux.

The idea is that the notes you take are hosted locally on your
machine, no central storage location like with Notion and
RoamResearch.

With Obsidian you are in direct control of the Markdown, store it
wherever you like.

This brings up questions about how and where you store your data, I've
now added all the exports from Notion and RoamResearch to a git
repository which is on a private GitHub repo.

This is nice, there's an import option for Roam exports, you can
configure your daily notes location and it has a super nice graph
view.

This experience felt a lot like working in VS Code, but it wasn't VS
Code! 😬

I'm very comfortable with editing Markdown in VS Code and felt a bit
cheated when I couldn't select a tab or move lines around.

## Foam

So, Foam! [Foam is a VS Code extension] that enables the features of
Obsidian but with the editing power of VS Code, so no brainier, right?

Foam are the first to admit that [things may be a little rough] as
it's still in preview. But I _really_ like working with my Markdown in
VS Code so I'm prepared for the teething issues.

There's a [super welcoming Discord] to join and talk to other users
and the developers.

With my new liberated data from Notion and RoamResearch I'm in the
process of working through all this data which is easy to visualise
with the VS Code file explorer and built in graph view of Foam.

The Foam graph view is still a WIP so I'm referring to Obsidian to
check that out for now.

I'm super excited following the progress of this!

<!-- Links -->

[digital garden]: https://scottspence.com/garden
[cheat sheets]: https://cheatsheets.xyz
[zettelkasten]: https://zettelkasten.de/
[to a gist]:
  https://gist.github.com/spences10/5c492e197e95158809a83650ff97fc3a
[the start of 2017]:
  https://gist.github.com/spences10/5c492e197e95158809a83650ff97fc3a/revisions?page=2#diff-0517f094a4805e87e00d10b2891d99e4
[how to screen snip]: https://cheatsheets.xyz/mac/#screen-snip
[kill a process]: https://cheatsheets.xyz/bash/#kill-process-on-port
[one repository]: https://github.com/spences10/cheat-sheets
[foam is a vs code extension]: https://github.com/foambubble/foam
[things may be a little rough]:
  https://foambubble.github.io/foam/#getting-started
[super welcoming discord]: https://discord.gg/rtdZKgj
