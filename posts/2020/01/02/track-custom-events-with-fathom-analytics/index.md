---
date: 2020-01-02
title: Track Custom Events With Fathom Analytics
tags: ['analytics', 'learning', 'guide', 'hooks', 'react']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

In this guide I'm going to go through how to track custom events in a
Gatsby site using Fathom analytics.

## Preamble

At the end of last month (November 2019) I started using [Fathom
Analytics] in place of Google Analytics.

I wanted a simpler way to track visitors to my sites and Fathom offers
that with a great, really intuitive interface and simple design.

So far, I love it, and would like to recommend it to others! Fathom
have an awesome affiliate program where every customer can take part!

For every paying customer I refer with [my unique code], I'll get a
25% lifetime commission on that customers payments, and if you use
that code too [you'll get a $10 discount on your first invoice].

For now here's some of the Fathom marketing copy.

## Why Fathom?

- You don't need to display those cookie notices as they don't use
  cookies, nor do they track invasive data.
- They are focused on privacy for website visitors, they don't track
  visitors, save their personal information, or need it to be
  profitable.
- They have hundreds of customers and track tens of millions of page
  views per month, so they may be a small company, but they're doing
  big things!
- They can handle viral content, so your site won't slow down because
  of them, an they wont ever stop tracking for you because of a spike
  in popularity.
- All of the plans allow for unlimited websites to be tracked and
  receive top-notch customer support. Plans start at $14 a month.

Do you use Google Analytics (GA) for any of your sites? I've used it
in the past and it gives the sort of information you'd expect but it
can be quite confusing to navigate and find that information.

What you get with Fathom out of the box is very similar to GA, but
it's all there on one page. You get the standard metrics like, 'Unique
visits', 'Page views', 'Avg time on site' and 'Bounce rate'.

There's also the breakdown of the most popular pages and referring
sites.

The difference (apart from the simple to use interface), you're not
giving away your visitors data to the big G!

> Want to track what users of your site are clicking and navigating
> to?

But say you want to track how many times a user of your site clicked a
particular button or link?

## Here's a video detailing the process. 📺

<YouTube youTubeId="yeMCma4Ae7Q" />

## Set-up Fathom account

If you want to follow along you're going to need a Fathom Analytics
account, if you haven't already got one then please consider signing
up with my affiliate link, [my unique code] will get you a `$10`
discount off of your first invoice! 🤝

## Add/Config Fathom Gatsby plugin

In this guide I'm going to use a Gatsby starter
[gatsby-starter-business] which is a nice starter with some of the
relevant things I'd want to track. Things like the pricing page and
how many people submit a contact form.

In the `gatsby-config.js` plugins array the config looks pretty
similar to this:

```js
{
  resolve: `gatsby-plugin-fathom`,
  options: {
    siteId: process.env.GATSBY_FATHOM_TRACKING_ID_MY_AWESOME_SITE,
    // or use the site ID in plaintext
    // siteId: 'PBZRRJHH',
  },
},
```

In the example I'm doing I'm hard-coding in the site ID but you can
use environment variables if you like.

## Push to Netlify and test

For the purposes of the guide I build and push the site to Netlify
then check in the console on the browser that `fathom` is available as
a global function.

I can now check my Fathom dashboard to see that the site has a
visitor.

Cool, cool! That's Fathom Analytics configured for the site, now to
the custom events.

## Create goals in Fathom Analytics

To track events in Fathom I'll first need to set up a goal! This will
give a unique ID that I can pass to the Fathom global function that's
on my configured site.

So, to get to the goal section of my site I'll scroll to the bottom of
the configured site's dashboard and click the _Show more data_ toggle.

This will reveal the _Goals_ section where I can configure goals. In
this example I'll be adding goals for `about`, `pricing`, `blog`,
`contact-us` and `form-submit`.

Each time I save the goal I'm given a JavaScript snippet to use, like:
`fathom('trackGoal', 'CYAZA98C', 0);` , this is what I'm going to be
adding into my code example.

## Use React Context API to make an analytics provider

I'm going to use the React context API to create an analytics provider
to be used throughout the app.

```js
import React, { createContext, useContext, useEffect } from 'react'

const AnalyticsContext = createContext({})

export const AnalyticsProvider = ({ children }) => {
  useEffect(() => {
    if (typeof window.fathom === 'undefined') {
      window.fathom = (x, y, z) => {
        console.log(`I'm a fake Fathom`, x, y, z)
      }
    }
  }, [])

  const logClicks = goalId => {
    window.fathom('trackGoal', goalId, 0)
  }

  return (
    <AnalyticsContext.Provider value={logClicks}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  return useContext(AnalyticsContext)
}
```

In this example I'm defining one function to be available via the
context provider and passed in with `value` but I could add in many
functions here for different event types.

The `useEffect` hook is for when I'm on the dev server and don't want
to be submitting data to Fathom, I'll instead get a console message.

As high up the component tree as possible, I'm going to add the
provider.

## Add custom event tracking for Fathom

In this example there's a `Layout` component I can add the provider
to, this wraps all of the components in the application so the
provider can be accessed throughout the site.

Then use in the areas I want to track a goal I'll use the
`useAnalytics` hook.

```js
const NavBar = ({ toggleNavbar, isActive }) => {
  const fa = useAnalytics()
  return (
    // other wrapping elements
    <Link
      onClick={() => {
        fa('CDDZY97C')
      }}
      className="navbar-item"
      to="/about"
    >
      About
    </Link>
    // other wrapping elements
  )
}
```

## Wrap up

Ok, time for me to review what I just did and what you'll need to do
if you're looking to do the same:

- Set up Fathom account
- Add and configure the Fathom Gatsby plugin
- Push the configured site to Netlify to test configuration.
- Add custom tracking code in the shape of a React Context API
  Provider
- Wrap the app in the `AnalyticsProvider`
- Consume the analytics provider function to log the event to the
  `fathom` global function.

🥁 Demo site: https://gatsby-starter-business-fathom.netlify.com

📈 Demo Fathom Dashboard:
https://app.usefathom.com/share/nymdtplm/gatsby-starter-business

🤝 Affiliate link for £10 of off your first month of Fathom Analytics:
https://usefathom.com/ref/HG492L

## Thanks for reading 🙏

That’s all folks! If there is anything I have missed, or if there is a
better way to do something then please let me know.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

<!-- Links -->

[fathom analytics]: https://usefathom.com/
[you'll get a $10 discount on your first invoice]:
  https://usefathom.com/ref/HG492L
[my unique code]: https://usefathom.com/ref/HG492L
[gatsby plugin for fathom]:
  https://www.gatsbyjs.org/packages/gatsby-plugin-fathom/
[fathom dashboard]: https://app.usefathom.com/#/settings/sites
[gatsby-starter-business]:
  https://github.com/v4iv/gatsby-starter-business
[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
