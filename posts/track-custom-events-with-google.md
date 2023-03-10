---
date: 2019-09-16
title: Track Custom Events With Google Analytics
tags: ['learning', 'guide', 'hooks', 'react', 'analytics']
isPrivate: false
---

Do you use Google Analytics (GA) for any of your sites?

I've used it in the past and it gives quite good information about

Want to track what users of your site are clicking and navigating to?

Let's talk about Google Analytics, what is it used for

Tracking Events

Privacy Policy

Ambulance Chasers

We're going to use the React context API

```js
import React, { useContext, useEffect } from 'react'

const AnalyticsContext = React.createContext({})

export const AnalyticsProvider = ({ children }) => {
  useEffect(() => {
    if (typeof window.ga === 'undefined') {
      window.ga = (x, y) => {
        console.log(`I'm a fake GA`, x, y)
      }
    }
  }, [])

  const events = {
    logButtonPress: e => {
      window.ga('send', {
        hitType: 'event',
        eventCategory: 'buttonPress',
        eventAction: 'click',
        eventLabel: e.target.innerText,
      })
    },
    logSocial: socialMediaPlatform => {
      window.ga('send', {
        hitType: 'event',
        eventCategory: 'socialShareClicks',
        eventAction: 'click',
        eventLabel: socialMediaPlatform,
      })
    },
    logNavigation: navItem => {
      window.ga('send', {
        hitType: 'event',
        eventCategory: 'navigationClicks',
        eventAction: 'click',
        eventLabel: navItem,
      })
    },
  }
  return (
    <AnalyticsContext.Provider value={events}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  return useContext(AnalyticsContext)
}
```

As high up the component tree add the provider.

```js
import { AnalyticsProvider } from '../components/GAEventTracking'
```

Then use in the areas you Want

```js
export const ButtonComponent = props => {
  const analytics = useAnalytics()
  return (
    <button onClick={analytics.logButtonPress} {...props}>
      {props.children}
    </button>
  )
}
```
