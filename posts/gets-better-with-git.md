---
date: 2017-05-31
title: Just starting out with Git and GitHub? It gets easier, honest!
tags: ['guide']
is_private: false
---

No doubt you have heard of Git or GitHub for source control, but
**what is source control?**

> "Revision control (also known as version control, source control or
> (source) code management (SCM)) is the management of multiple
> revisions of the same unit of information.

Cool story br0! In other words: Source control allows distributed work
in teams of any size, at different locations, while avoiding conflicts
in source code changes.

Really!? Thanks for clearing that up!

Lets look at it this way…

> In its simplest term it's like a "Save As". You want the new file
> without getting rid of the changes on the old one. It's an everyday
> situation, except on a software project there is the potential for a
> lot of changes.

https://twitter.com/lindakatcodes/status/869086021220261888

A familiar sentiment for anyone starting out with Git

## Concepts

There are some basic concepts about version control I'll quickly go
over here, these terms used in many SCM systems some relevant to Git
and GitHub some to other systems.

**Repository/repo:** The database storing the files.

**Branch:** Create a separate copy of a repo for use on your computer.

**Revert/rollback:** Go back to a previously saved version of the
codebase/repo.

**Push:** Push is an access level on the repo, if you have no push
access you will need to make a pull request.

**Pull:** If you have no Push access you can make a pull request which
will notify the repo owner you want to merge your changes into their
code.

If you are just starting out then your most used commands will
probably be :

```bash
git add .
git commit -m 'some informative message'
git push origin master
```

Those commands have served me well in my early days of learning how to
get my code back up to GitHub.

`video: https://www.youtube.com/watch?v=CDeG4S-mJts`

> **Git and GitHub** Git and GitHub are two separate things, Git is a
> free and open source version control system whilst GitHub uses Git
> technology to host your repositories on the GitHub.com servers.

Git and GitHub were a bit confusing for me when I first started out
with them, I was familiar with VCS before but that was in the shape of
Microsoft's Visual SourceSafe and Team Foundation Server where you
have a nice GUI to guide you through the check-in and check-out
process, for those the process was:

- **Check-out:** make a copy of the repository you wanted to make
  changes to on your machine, once you have made your change then,
  Check-in your changes.

- **Check-in:** add your changes back to the repository with an
  accompanying message detailing the change you have made.

With Git it's a bit less fancy, all via the command line, but pretty
much the same as with VSS and TFS.

- Clone the repository: Make a copy of the repo on your machine.
- Make changes.
- Once the changes are made then add them back with accompanying
  commit messages.
- Push the changes back to the repo on GitHub.

The documentation on GitHub is fantastic for anything you want to
achieve and in this post I have referenced some the documentation.

It can get a bit overwhelming though, especially if you get out of
sync, i.e. forget to pull a change made on the remote then try to
check your changes in before pulling the changes into your local
version. I'm by no means confident if things go a bit wrong but I have
developed a "[Commit Often Perfect Later]" approach so if you do break
something you didn't lose too much of you valuable time trying to work
out what went wrong where.

If you take a look at a repo you have cloned from GitHub you will see
there is a file called `.git` this is like a little database of all
the changes you have made on your machine and it contains all the
information it needs to connect to GitHub and make the changes it
needs to make to the master repo [or whatever branch you're pushing
the changes to].

I made a cheat sheet [Gist] which I used every time I went near Git,
it has now turned into a [repo] of other cheat sheets I still use on a
daily basis.

In it I cover these situations:

- Make a new project on your machine that you want to add to GitHub?
  Look here.
- Cloning a repo from someone else's GitHub and pushing it to a repo
  on my GitHub, or "I didn't make a fork, what do I do now!"
- You have a fork which you need to update before making any changes.

Workflow will be different for differing situations, for me as a noob
developer I have tried to document anything I have come across with
Git so I can reference back to it for that one time I need it but
can't remember what I did at 21:45 on a Wednesday just to get the code
checked into GitHub.

There are many GUIs that integrate with Git for use with GitHub the
official GitHub one is pretty nice but I quickly got into situations
that the GUI couldn't get me out of so I have stuck with the terminal
since, well there is VS Code though which has a beautiful Git UI that
I use daily, but there are some things that I still use the terminal
for:

```bash
git status
git checkout <branch-name>
git [push] tags
```

All pretty handy, there is probably extensions out there to help with
these but for now I'm pretty comfortable doing it via the command
line.

Any tips or tricks you use in Git you'd like to share? Please feel
free to leave a comment or better still add to the repo via a pull
request.

If any of this has helped you in any way feel free to like the article
and share it on social media.

Many thanks.

<!-- LINKS -->

[commit often perfect later]:
  https://gist.github.com/SethRobertson/1540906/68feeabfe906ec1eb893e4fa45f402795ed6e62c#commit
[gist]:
  https://gist.github.com/spences10/5c492e197e95158809a83650ff97fc3a#useful-git-commands
[repo]: https://github.com/spences10/cheat-sheets
