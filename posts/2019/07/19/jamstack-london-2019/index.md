---
date: 2019-07-19
title: JAMstack_conf London 2019
tags: ['conference', 'jamstack']
isPrivate: false
---

<script>
  import { Tweet, YouTube } from 'sveltekit-embed'
</script>

I've been wanting to go to a JAMstack conf since the first one was
scheduled for October 2018. This year when it was announced there
would be one in London I was super excited to get the opportunity to
go.

The conference was across two days with the first consisting of
workshops, lightning talks and welcome drinks. The second was the
keynote and conference talks either side of a lightning round with
some exciting announcements.

## Tuesday - 2019-07-09

<!-- cSpell:ignore moltin -->

First up was the workshop events where I was attending a workshop on
schema stitching with GraphQL using GraphCMS and Moltin

## Workshop

Jesse was a great at going through the basics of the headless CMS and
why you should be using one. The workshop consisted of us defining our
CMS content model with pen and paper before creating them in the
GraphCMS UI for use with the Moltin eCommerce API

<Tweet tweetLink="notrab/status/1148587457866358784" />

### Technical difficulties

There were issues on both the GraphCMS and the Moltin side, mainly
around the UI for Moltin. We all managed to breeze through these
keeping a good pace on the content.

### GraphQL Schema Stitching

Once we all got through the initial setup on our projects it was quite
satisfying to get to two schemas in one query. I still have a bit of
work to do on my project as we all ran out of time towards the end.
Jesse covered the main goal of the workshop which was to stitch the
two schemas together. The additional UI work I can pick up at a later
date.

## Lightning Talks

After the workshops it was time for the lightening talks.

[@jamiebradley234] did a talk on the booming tech scene in
Middlesbrough.

<!-- cSpell:ignore kmelve -->
<Tweet tweetLink="kmelve/status/1148664935305699328" />

[@danfascia] did a great talk on how healthcare tech is benefiting
from JAMstack methodologies.

<YouTube youTubeId="n1ca0cQAr_4" />

## Wednesday - 2019-07-10

## Talks

First up we had some apologies from Phil Hawksworth on behalf of Chris
Coyer as Chris couldn't make it. We sent him a get well soon message.

<Tweet tweetLink="philhawksworth/status/1148929743342972928" />

<!-- cSpell:ignore Drasner -->

### State of the JAMstack Nation - Sarah Drasner

Sarah gave a demo of how quickly you could set up a JAMstack site,
using Vue and Nuxt

<!-- cSpell:ignore biilmann -->

### Netlify Analytics - Matt Biilmann

Massive announcement for Netlify analytics I signed up there and then
for my blog. Obviously Netlify is used to build Netlify so Matt showed
off the continuous deployment for Netlify whilst putting the feature
live.

### Transforming the JSON - GROQ (& Sanity CMS) - Knut Melvær

<!-- cSpell:ignore groq,knut,Melvær -->

Knut showing off the advantages of using GROQ for querying your data.

Also it's [now open source]

### Stackbit - Ben Edwards

Ben announcing that Stackbit was coming out of beta. Stackbit is a
great all in one tool for making JAMstack sites with CMS integration.

### Code Sandbox. - Ives van Horne

Ives (Flip) went into how he made [codesandbox.io] whilst being a
college student.

If you want something build cheaply, ask a student to build it for you
was the take home here for me.

### Why & How Smashing Magazine moved to JAMstack - Vitaly Friedman

<!-- cSpell:ignore Vitaly,Ramin,Bozorgzadeh -->

Brilliant talks from Vitaly on the transition of Smashing Mag from
monolith over to the JAMstack. Also great detail on the redesign.

### WeWorkLabs moves to JAMstack - Ramin Bozorgzadeh

JAMstack helps me sleep at night!

### CSS Houdini Today - Una Kravets

Una was super jazzed about Houdini, you could do some pretty neat css
tricks with it.

[https://extra-css.netlify.com/]

<!-- cSpell:ignore simona,cotin -->

### Serverless functions - Simona Cotin

Simona detailed key use cases for serveless functions.

<!-- cSpell:ignore surma -->

### Performance optimizing and Webpack bashing - Jake Archibald and Surma

Surma and Jake went through how to optimise a modern day minesweeper
game for mobile.

**"Should I worry about performance?"**

**Answer: YES!**

Hosted web fonts slow things down, because the browser has to load
from multiple servers. Optimize further by only including the
characters you need. Use css, assets, fonts directly in the HTML to
eliminate needing additional requests.

Here's the repo: [https://github.com/GoogleChromeLabs/proxx]

### Hot!

Being in the UK we had the British weather to content with and the
venue although fitted with A/C units in the speaker hall the venue
outside of that was hot and sweaty! I spent the majority of my time
between talks situated directly in front of the A/C units.

<!-- cSpell:ignore peduarte -->
<Tweet tweetLink="spences10/status/1148927111526268928" />
<Tweet tweetLink="peduarte/status/1148923305254096896" />
<Tweet tweetLink="spences10/status/1148914884039577600" />

## That's it folks!

This was a great event I met a lot of new people and several Twitter
friends. I can't wait until the next one.

<!-- Links -->

[@danfascia]: https://twitter.com/danfascia
[@jamiebradley234]: https://twitter.com/jamiebradley234
[codesandbox.io]: https://codesandbox.io
[https://github.com/googlechromelabs/proxx]:
  https://github.com/GoogleChromeLabs/proxx
[https://extra-css.netlify.com/]: https://extra-css.netlify.com/
[now open source]:
  https://www.sanity.io/blog/we-re-open-sourcing-groq-a-query-language-for-json-documents
