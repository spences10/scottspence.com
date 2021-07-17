---
date: 2017-06-01
title:
  Moving from beginner to [slightly more] advanced git with aliases.
tags: ['guide']
isPrivate: false
---

Speed up your git workflow with git aliases, this is a brief
introduction on using aliases 🚀👍

The more you work with Git the more familiar you become with the
commands used in your every day workflow for your projects or your
team's projects.

Commands like naming and creating feature branches making pull
requests or pushing your changes if you have the requisite
permissions.

So still used by me on a daily basis, and everyone else that uses git
[I presume] is the `git add .` command, then
`git commit -m 'my awesome feature'` and `git push` or
`git push origin <branch>`

In my short time using Git I have always just typed out the full
commands [usually with [my cheatsheet] close to hand] and thought
nothing more of it, that is how you use the tool, right?

Well that was what I foolishly presumed until I learned about
dotfiles, I learned about `.` files from listening to the
[toolsday.io][toolsday] podcast with [Chris][chris] and [Una][una] a
great channel for learning about tooling 👍 the podcast was about [Git
Tools][git-tools] give it a listen it's a great show.

This was a pretty cool learning experience for me and I now have a
pretty efficient git workflow 🚀

Let's go over `.gitconfig`, do you remember having to enter your email
address and name when first setting up Git on your computer? That
information is stored in your `.gitconfig` file, your file will be
located in your user folder on Windows
`C:\Users\yourusername\.gitconfig` or `~/.gitconfig` on Linux/Mac

If you navigate to the file in the text editor of your choice and pop
it open you'll see your details under the `[user]` flag, here's mine:

```bash
[user]
  name = spences10
  email = spences10apps@gmail.com
```

I'm not sure what other configuration options you may have in yours so
we're just going to concentrate on the aliases, aliases can be used so
that you can shorten the commands [or make them longer if you like]
but I'm all for reducing key strokes, even if it is one or two less.

So let's review the common commands I mentioned at the start:

```bash
git add .
git commit -m 'my awesome feature'
git push
```

So with aliases we can shorten these down a bit:

In your `.gitconfig` file if there's not already one there add in the
`[aliases]` section, I have mine above my user details, then add in
some aliases:

```bash
[alias]
  a = add .
  c = commit -am
  p = push

[user]
  name = spences10
  email = spences10apps@gmail.com
```

So now we can shorten down our workflow for adding a change to one of
our repos:

```bash
git add .
git commit -m 'my awesome feature'
git push
```

Will become:

```bash
git a
git c 'my awesome feature'
git p
```

It's not a massive reduction in what you're typing but you'll be
amazed at how quickly you become accustomed to it and start adding
more an more.

Here's my current list of aliases:

```bash
[alias]
  a = add .
  b = branch
  c = commit -am
  cl = clone
  co = checkout
  d = diff
  f = fetch
  i = init
  o = open # see: https://github.com/paulirish/git-open ♥
  p = push
  pt = push --tags
  s = status
  t = tag
```

A new one I have found out whilst making this post is
`clone --depth 1` which clones only the HEAD of the repository instead
of the whole repository, so say if you were cloning react you'd just
get the master version rather than the other 38 branches included in
the repository. Pretty neat 👍 so that could be aliased into something
a lot shorter `git cl1d`?

You'll no doubt notice the link I have in there for `o = open` that
little gem belongs to [Paul Irish][pi] it's an npm package that will
pop open a browser tab to the current repository you are in, pretty
neat right?

I'm sure there are many, many more ways to configure Git if you take a
look at [Paul Irish][pidf]'s dotfiles repo for his `.gitconfig` you'll
see there is a lot of ways to configure Git, I'm still learning and
finding new ways to do things.

If there is anything I have missed, or if you have a better way to dom
something then please let me know 👍

Get me on [Twitter][sdt] or [Ask Me Anything][ama] on GitHub

If you like this post or if it has helped you in any way then please
give it a like and don't forget to share it on social media 🙌

<!--Links-->

[git-cheatsheet]: https://cheatsheets.xyz/git/
[toolsday]: http://www.toolsday.io/
[chris]: http://twitter.com/chrisdhanaraj
[una]: http://twitter.com/una
[git-tools]: http://www.toolsday.io/episodes/git.html
[pi]: https://github.com/paulirish
[pidf]: https://github.com/paulirish/dotfiles/blob/master/.gitconfig
[sdt]: https://twitter.com/spences10
[ama]: https://github.com/spences10/ama
