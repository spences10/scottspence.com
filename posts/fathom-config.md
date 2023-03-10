---
date: 2020-06-09
title: Fathom Analytics Gatsby Configuration
tags: ['analytics', 'learning', 'guide', 'hooks', 'react', 'gatsby']
isPrivate: false
---

Fathom Analytics, a great tool to use for your site analytics without
the compromise of giving your visitors data to Google.

I've written about [How to Track Custom Events with Fathom] in the
past but since then Fathom have [changed their tracking/embed code],
which means the config is slightly different.

## Install

With the new embed code there's a guide on how to [use the code with
Gatsby] on Fathom's blog. It involves modifying the Gatsby `html.js`
file which I'm not too keen on doing, although it works fine, it's not
recommended.

I've gone with using React Helmet to add the embed code to the head of
my Gatsby projects.

Add it as high up in the React component tree as possible. In my case
the way I do it is with the Gatsby `wrapPageelEment` API which I use
in a module that's shared between `gatsby-browser.js` and
`gatsby-ssr.js`.

## There's a Plugin for That

There's also a plugin available, you can configure
[`gatsby-plugin-fathom`] which will take the same details, a site id
and a custom domain but as far as I can tell it's still using the
previous version of the embed code.

The new embed code is less verbose and offers some handy options like
`enableTrackingForMe` and `blockTrackingForMe`.

Here's that same Fathom tracking from the Fathom blog guide, but I'm
adding it to the head of the site with React Helmet instead of using
the `html.js` file.

```jsx
export const wrapPageElement = ({ element }) => (
  <>
    <Helmet>
      <script
        src={`${process.env.GATSBY_FATHOM_TRACKING_URL}/script.js`}
        spa="auto"
        site={process.env.GATSBY_FATHOM_TRACKING_ID}
        defer
      ></script>
    </Helmet>
    <MDXProvider components={components}>
      <Layout>{element}</Layout>
    </MDXProvider>
  </>
)
```

## Track Events

Because the new tracking code is a _tiny bit_ less verbose I've had to
slightly modify the React Context Provider to accommodate.

```jsx
import React, { createContext, useContext } from 'react'

const AnalyticsContext = createContext({})

export const AnalyticsProvider = ({ children }) => {
  const logClicks = goalId => {
    window.fathom.trackGoal(goalId, 0)
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

To consume the event tracking lower in the tree either use it with a
hardcoded `goalId` or pass it in as a variable, here's how I do it for
nav items.

<!-- cSpell:ignore GH6DDCV6,HJAW5F8H -->

```jsx
export const NavItems = () => {
  const fa = useAnalytics()
  return (
    <nav aria-label={`page navigation`}>
      <NavLink
        gridArea={`about`}
        href={`#hi-im-scott`}
        onClick={() => fa('GH6DDCV6')}
      >
        About
      </NavLink>
      <NavLink
        gridArea={`portfolio`}
        href={`#portfolio`}
        onClick={() => fa('HJAW5F8H')}
      >
        Portfolio
      </NavLink>
      ...
```

A click event passing in the `goalId` there's also the option to pass
a variable.

```jsx
export const A = props => {
  const fa = useAnalytics()
  const containsGoalId = props.href?.includes(`goalId`)
  const [goalId, setGoalId] = useState(``)
  const [newHref, setNewHref] = useState(``)

  useEffect(() => {
    if (containsGoalId) {
      const url = new URL(props.href)
      setGoalId(url.searchParams.get(`goalId`))
      url.searchParams.delete(`goalId`)
      setNewHref(url.href)
    }
  }, [containsGoalId, props.href])

  const onClick = () => {
    if (goalId) {
      fa(goalId, 0)
    }
  }
  return (
    <StyledA
      {...props}
      href={containsGoalId ? newHref : props.href}
      onClick={onClick}
    >
      {props.children}
    </StyledA>
  )
}
```

I've written before on how to [Add Analytics Tracking Links to your
Markdown] this still stands apart from there's no need to include
quotes (`""`) around the `goalId`.

<!-- Links -->

[how to track custom events with fathom]:
  https://scottspence.com/posts/track-custom-events-with-fathom-analytics
[changed their tracking/embed code]:
  https://usefathom.com/support/tracking
[use the code with gatsby]:
  https://usefathom.com/integrations/gatsbyjs
[`gatsby-plugin-fathom`]:
  https://www.gatsbyjs.com/packages/gatsby-plugin-fathom/
[add analytics tracking links to your markdown]:
  https://scottspence.com/posts/add-tracking-links-to-your-markdown/
