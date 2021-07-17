---
date: 2020-04-27
title: Continuous Deployments on Non Essential Projects
tags: ['learning']
isPrivate: false
---

Quite a while ago now I was introduced to dependency update tools like
Renovate and Greenkeeper, at the time I thought they were awesome,
keeping your projects patched and secure so I went and used them in
_every_ project I made.

## Busy work

Some of my GitHub projects has a ridiculous amount of commits on them.
I remember pointing [Jamie Barton] to a project I did to make a
dynamic [navigation bar with GraphCMS] and he commented on the amount
of commits ~1.5k commits. I'd say about 99% of those were dependency
updates from the Renovate bot, it's bonkers!

One of the main reasons for using Renovate was for keeping the project
up to date when I wasn't working on it. I haven't done anything with
it for years!

So there's this long list of dependency updates on a project that's
not in production which I haven't worked on in years.

I guess I thought I can keep it updated for when I eventually get
round to working on it again and just merge any updates as and when
they're made.

I had this whole strategy of a `patch` branch that I'd merge into a
`develop` branch that would eventually make it's way into `master` the
thing is, if I wanted to find a specific commit I'd be wading through
hundreds of commits from a bot.

## Great tool

Renovate is an awesome tool with fantastic configuration that you can
use to effectively keep your dependencies up to date. On the creation
of each of my GitHub projects there's a default checkbox for Renovate
which I'd think yeah cool, better keep it updated.

## Noisy

That's great n' all but when you also have a GitHub build integration
like the Netlify or Vercel integrations to build new PRs when there's
a new release then things start to go south.

With Netlify if your a non pro user you get 300 build minutes a month
if you have a package in your project dependencies that has a high
turnover of releases, like Gatsby, then each time there's a release
Renovate will make a PR and the Netlify integration will kick off a
build with the updated dependency.

This is when things can start to break down a touch, say you have
several projects all of which have Prettier installed along with
Gatsby and another popular JS lib with high release turnover. If they
all release on the same day for the many projects you have then say
goodbye to the 300 build minutes you had with Netlify, Vercel will
stop any builds being processed for what I've seen at four hours at a
time when this happens as well.

Renovate will try again when there's a new release, Gatsby can release
many many times in one day, so if you have waited patiently through
your four hours cut off to push another change and there's another
release from Gatsby then you're back where you started as the Vercel
integration will start getting hammered again by the Renovate bot
being helpful and making PRs for you.

## Config

"Why don't you configure it properly Scott?" You could avoid all this
if you took the time to configure your `renovate.json` correctly.

I love no a friction process, the thing with Renovate is it comes with
a base configuration so there's no need to spend any time when you're
first setting up your project to do that as well, just get on with
what you're doing and let Renovate do it's thing in the background.

Before I knew it though I had 30+ projects all with Renovate
configured to ping a PR on all those projects and hammer my build
queue for Vercel and Netlify any time there was a new release.

## Lessons learned

I changed the default on Renovate to only be enabled on selected
projects and not all by default.

It was an incredible PITA (Pain in the Arse) to remove the Renovate
config from each project.

Using Renovate may sound like a good idea, everything is kept current
and secure and you always have some PRs to review on GitHub.

But if you have a lot of projects with a dependency that has high
release rates or that you use in every project (Gatsby, Prettier) then
when update time comes there's a lot of 'busy work' involved.

<!-- Links -->

[jamie barton]: https://twitter.com/notrab
[navigation bar with graphcms]:
  https://github.com/spences10/gatsby-using-graphcms
