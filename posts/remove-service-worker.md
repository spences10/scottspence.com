---
date: 2021-04-20
title: Remove Service Worker - Gatsby
tags: ['gatsby', 'guide', 'resource']
is_private: false
---

The Gatsby offline plugin is really handy right up until you don't
want it any more!

I switched my main site over to Toast from Gatsby and hit a bump when
it came to removing the old Gatsby site because it used a service
worker meant that the new site had to remove the installed service
worker.

How I got round it was taking the `sw.js` file from the
`gatsby-plugin-remove-service-worker` plugin and added that to the
build script of my new site.

A good place to start is if you have the offline plugin installed
already is to also have the `gatsby-plugin-remove-service-worker`
ready to go as well.

This is what my `gatsby-config.js` looked like when I'd finished:

```js
// {
//   resolve: `gatsby-plugin-offline`,
//   options: {
//     precachePages: [`/2020/*`, `/2021/*`],
//   },
// },
`gatsby-plugin-remove-serviceworker`,
// {
//   resolve: `gatsby-plugin-manifest`,
//   options: {
//     name: siteMetadata.title,
//     short_name: siteMetadata.title,
//     start_url: `/`,
//     background_color: `#336699`,
//     theme_color: `#663399`,
//     display: `minimal-ui`,
//     icon: `static/favicon.png`, // This path is relative to the root of the site.
//   },
// },
```

So remove `gatsby-plugin-offline` and `gatsby-plugin-manifest` and
make sure `gatsby-plugin-remove-serviceworker` is enabled.

If I go to `https://scottspence.com/sw.js` I can see the script that
is in the `gatsby-plugin-remove-serviceworker` package. What I need to
do now is mirror that on my new site.

Here's that script:

```js
// sw.js
self.addEventListener('install', function (e) {
  self.skipWaiting()
})

self.addEventListener('activate', function (e) {
  self.registration
    .unregister()
    .then(function () {
      return self.clients.matchAll()
    })
    .then(function (clients) {
      clients.forEach(client => client.navigate(client.url))
    })
})
```

I've taken that `sw.js` script from the
`gatsby-plugin-remove-serviceworker` package and added it to the root
of my project.

I have a `postbuild` script I run to create the sitemap and
`robots.txt` file amongst other things so I'll add it in with that.

In the `npm` script I'll move a copy of the `sw.js` file to the
`public` folder, that's where the site build output goes:

```json
"sw": "cp sw.js public/"
```

Then when the new site spins up it will remove the old service worker.
