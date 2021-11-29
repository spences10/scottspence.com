---
date: 2020-09-02
title: How to Monetise Your Content With Coil and Brave BAT
tags: ['learning', 'guide']
isPrivate: false
---

I recently started monetising my blog, (don't worry there's no
paywall!) this isn't a new thing as I originally did something similar
with Brave and the Basic Attention Token (BAT) back in 2018 on
scottspence.me.

So what is web monetisation? It's an alternative approach to payments
that doesn't rely on advertising or stealing your data and selling it
on.

This time around I've re-enlisted the Brave BAT for [scottspence.com]
but also started using [Coil], Coil was announced on the Dev.to
community [back in June] as a way of streaming micropayments to the
creator of the contents you're consuming.

Coil is a paid service (~£4.17 a month) that allows you to access web
monetised content. "So you said there was no paywall yo!?" There isn't
but there can be, this can be for Coil exclusive content and other
services like accessing the entire [Cinnamon] video library.

There's also [imgur Emerald] and a Twitch Coil Twitch Bot that pays
the content creator as you watch, this is as long as you (the watcher)
have a Coil membership and the Coil extension installed on your
browser.

## Wait it's Monetization not Monetisation

I'll use the american spelling when referring to a location of a
setting on a site or the actual `monetization` tag name.

All other times I mention it I'll be using the usual UK [spelling] for
it.

## What you need

If you're a content creator and you want to monetise your content,
like your site, your YouTube videos or your Twitch streams you'll need
a few things.

## 1. Set up a web monetised wallet

You'll need a web monetised wallet that supports web monetisation,
although there are wallets that support the [Interledger Protocol]
(ILP) it only appears that [Uphold] and [GateHub] support web
monetisation.

I had a Uphold account since I set up the Brave BAT back in 2018 so
there was noting for me to do there.

## 2. Get your payment pointer

Now that I have a web monetised wallet I need to get the payment
pointer. In Uphold you do this by clicking on the currency you want to
receive your web monetisation in. In my case GBP, on the GPB card
there's three options, Use Funds, Add Funds and Activity.

Clicking Add Funds take you to the various ways you can add funds, one
option is to fund 'from Interledger Payment Pointer', there's an
option to generate a payment pointer. As I had already created one I
could copy pasta that for later, my pointer looks like this:
`$ilp.uphold.com/bzPBWkMBzLmN`

## 3. Create your `monetization` meta tag

Time to get the payment pointer into a `monetization`, `<meta>` tag.

The tag's name is always `monetization`. The content is your payment
pointer. My example `meta` tag here:

```html
<meta name="monetization" content="$ilp.uphold.com/bzPBWkMBzLmN" />
```

## 4. Add the meta tag to your site

Now I can add the meta tag to my site, I use Gatsby and of course
"[there's a plugin for that]" but I've gone with adding the tag to the
head of my site with React Helmet.

I have [top level module] that wraps my whole site so I'm going to
slot my `monetization`, `meta` tag in there.

## Brave Rewards

Brave rewards I've amassed a total of 0.95 BAT since I implemented the
BAT on scottspence.me in 2018, I used the same approach to add the BAT
for [scottspence.com].

To create a BAT I logged in to the [Brave Rewards] admin panel, I
don't recall the sign-up process but do know there's not a password
username system but a magic email link sent to you each time you want
to use it.

From the panel I can use 'Add Channel' to add a website, YouTube
channel, Twitch channel, Twitter account, Vimeo channel, Reddit and a
GitHub

In my case I'm adding a website where I'm asked to choose one of two
verification methods, add a trusted file to your site or add a DNS
record, I go with the trusted file.

I'm them prompted to add the file `brave-payments-verification.txt`
and it's contents to a `.well-known` folder, I have this in the root
of my project and copy it into the `public` folder of my site as the
last build step, here's the `package.json` script:

```json
"scripts": {
  "build": "gatsby build && yarn wellknown",
  "wellknown": "cp -r .well-known/ public/"
}
```

## Coil account

You don't have to have a Coil account to benefit from web
monetisation.

## Dev.to are using web monetisation too

Like I mentioned earlier, Dev.to are now web monetised but it looks
like the `monetization` tag on Dev.to is their own tag whilst they
test the viability of it before letting authors to set their own
pointers.

Here's the source comments from one of my Dev.to posts, notice the
pointer is different:

```html
<!-- Experimental web monetization payment pointer for micropayments -->
<!-- It lets readers make micropayments to websites they visit. -->
<!-- This is step 1: Get live in production to test for platform-wide payment pointer. -->
<!-- Step 2: Allow authors to set their payment pointer so they can directly monetize their content based on visitors. -->
<!-- Step 3: Enable further functionality based on what we learn from this experimentation and how the ecosystem evolves. -->
<meta name="monetization" content="$ilp.uphold.com/24HhrUGG7ekn" />
```

To set up your Dev.to posts to be web monetised you can add your
payment pointer in the [settings] panel under 'Web Monetization'.

## Resources

- [DEV is now Web Monetized]
- [webmonetization.org]
- [Innovating on Web Monetization: Coil and Firefox Reality]
- [The State of Web Monetization]
- [Web Monetization like I'm 5]
- [You can now web-monetize your DEV posts! (But don't get your hopes
  up too quickly)]
- [Brave Rewards: Earn more for content you publish to the web]

<!-- Links -->

[coil]: https://coil.com
[cinnamon]: https://cinnamon.video/
[imgur emerald]: https://imgur.com/emerald
[webmonetization.org]: https://webmonetization.org/
[quick start]: https://webmonetization.org/docs/getting-started
[back in june]: https://dev.to/devteam/dev-is-now-web-monetized-21db
[scottspence.com]: https://scottspence.com
[interledger protocol]: https://interledger.org/setup-wallets.html
[uphold]: https://uphold.com/
[gatehub]: https://gatehub.net/
[there's a plugin for that]:
  https://github.com/Daudr/gatsby-plugin-web-monetization
[top level module]:
  https://github.com/spences10/last.scottspence.com/blob/production/src/root-wrapper.js#L79
[settings]: https://dev.to/settings/misc
[spelling]:
  https://dictionary.cambridge.org/dictionary/english/monetization
[brave rewards]: https://publishers.basicattentiontoken.org
[web monetization like i'm 5]:
  https://dev.to/hacksultan/web-monetization-like-i-m-5-1418
[dev is now web monetized]:
  https://dev.to/devteam/dev-is-now-web-monetized-21db
[you can now web-monetize your dev posts! (but don't get your hopes up too quickly)]:
  https://dev.to/devteam/you-can-now-web-monetize-your-dev-posts-but-don-t-get-your-hopes-up-too-quickly-goc
[brave rewards: earn more for content you publish to the web]:
  https://publishers.basicattentiontoken.org/
[innovating on web monetization: coil and firefox reality]:
  https://hacks.mozilla.org/2020/03/web-monetization-coil-and-firefox-reality/
[the state of web monetization]:
  https://coil.com/p/kenmelendez/The-State-of-Web-Monetization/KTVijO7ah
