---
date: 2020-10-17
title: Spreading the Jamstack
tags: ['jamstack', 'resource']
isPrivate: false
---

<script>
  import {
    DateDistance, 
    Sarcasm, 
    Small
  } from '$lib/components'
</script>

I have delivered this talk several times now but not actually written
about it.

<!-- cSpell:ignore Sooooo -->

Sooooo, let's talks about the jamstack!

Jamstack not JAMstack, Netlify have recently decided that there's a
bit of confusion around the capitalisation of the jam, more on this
shortly.

But first the obligatory preamble to qualify me for giving this
information to you.

I have been a professional web developer for <DateDistance
date="2018-03-08" /> now and in that time I have been getting familiar
with the jamstack using it on a daily basis.

I work at large digital agency that is using the jamstack in several
large scale projects currently in production.

I have been evangelising the adoption of the jamstack wherever I saw
there was an opportunity to use it.

## What is the jamstack?

It's JavaScript, APIs and Markup

JavaScript > browser side

APIs > the backend for the browser

(pre rendered) Markup > html, css, markdown, templating languages

Specifically, markup in the Jamstack terminology refers to
"pre-rendered" markup or content served in its final form, HTML.

One interesting thing to note is that none of these technologies are
new.

Let's looks at some other web dev stacks.

Using a group of technologies together is where the term stack comes
from.

<Small>
  It doesn't necessarily have to be tech, the fitness industry term
  their nutritional supplements combination as a stack, anyway...
</Small>

So you may or may not have heard of some of these stacks being
mentioned.

**LAMP** stack > Linux, Apache, MySQL, PHP

**MEAN** stack > MongoDB, ExpressJS, AngularJS, NodeJS

<!-- cSpell:ignore MERN -->

**MERN** stack > MongoDB, ExpressJS, React, NodeJS

These technologies generate the template for the pages you're going to
see on the fly on a server somewhere.

Notice that the technologies are specific?

With the jamstack your not bound to a certain framework or database
choice.

The core philosophy of the jamstack is to pre-render the pages and
serve the static assets from a CDN.

## Static, ew!

So when the term static is used you probably think of sites from
around the 90s and sites asking you to sign their guestbook.

Static, pre render now so your servers don't have to do it later. -
Phil Hawksworth

## It's not the experience it's the architecture

Let's take a look at some static site generators and the languages
they use:

- [Jekyll] > Ruby
- [Hugo] > Go
- [11ty] (Eleventy) > JavaScript
- [Gatsby] > JavaScript

Jekyll is the OG of the static site generators and what I used for my
first blog. But I could only run it on Cloud9 because I couldn't get
Ruby running on my computer. 😅

Hugo uses Go, <Sarcasm sarky="but where's the JavaScript!!?!1" /> see
this is where the [name change] comes in where there's no hard fast rules
on the technologies that make up a jamstack site.

## Jamstack core philosophy

The core philosophy with the jamstack is to generate as much content
as you can at build time then serve that statically from a CDN.

The distinction here is the delivery mechanism of content. Within the
jamstack model, content is not delivered dynamically via a web server
tasked with building pages at runtime.

Rather, the markup is prebuilt upfront and served to the browser via a
CDN.

Three different types of pages,

1. totally static like a landing page,

2. build time, referred to as prerendering, data for this is usually
   sitting somewhere else like a Markdown file a CMS or an API
   somewhere. Build a template somewhere and use the data to populate
   the template.

3. Data that is either stale or can't be added at build time, like
   user generated data, in this case you use a loading indicator
   whilst you retrieve the data from the API.

## Advantages

Cheaper or easier scaling

Better performance, the caveat being for dynamic data where the static
files will be served from the CDN then making an API request to ge the
data, in this case server side rendering would be faster.

Higher security

Better DX

## When to use it

Main consideration would be SEO

Is the content you need SEO for dynamic?

Yes > SSR

No > Jamstack

## What does that mean then?

## Static

## Performance matters

High performing sites retain visitors more than low performing ones.

Here's some information from Google's web.dev blog on [Why does speed matter].

Pinterest reduced perceived wait times by 40% and this increased
search engine traffic and sign-ups by 15%.

Perceived wait times are achieved by prerendering part of the page.

> Search engine traffic and signups increased by **15%** - Pinterest

Studies have also shown the negative impact poor performance can have
on business goals. For example, the BBC found they lost an additional
10% of users for every additional second their site took to load.

> BBC found they lost an additional **10%** of users for every
> additional second their site took to load

<!-- Links -->
<!-- cSpell:ignore 404pagefound,jfkt,staticgen -->

[smashingmagazine.com]: https://smashingmagazine.com
[jfkt4.nyc]: https://jfkt4.nyc
[reactjs.org]: https://reactjs.org
[store.gatsbyjs.com]: https://store.gatsbyjs.com
[nozzle.io]: https://nozzle.io
[staticgen.com]: https://www.staticgen.com/)
[404pagefound.com]: https://www.404pagefound.com/)
[jamstack.wtf]: https://jamstack.wtf/)
[how-mobile-latency-impacts-publisher-revenue]:
	https://www.thinkwithgoogle.com/intl/en-154/insights-inspiration/research-data/need-mobile-speed-how-mobile-latency-impacts-publisher-revenue/
[mobile-page-speed-new-industry-benchmarks]:
	https://www.thinkwithgoogle.com/marketing-resources/data-measurement/mobile-page-speed-new-industry-benchmarks/
[cook]: https://www.cookfood.net/
[why does speed matter]: https://web.dev/why-speed-matters/
[name change]: https://github.com/jamstack/jamstack.org/issues/279
[hugo]: https://gohugo.io/
[jekyll]: https://jekyllrb.com
[11ty]: https://11ty.dev/
[gatsby]: https://www.gatsbyjs.com/
