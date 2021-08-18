---
date: 2021-01-20
title: QA Wolf v2 Getting Started
tags: ['ci-cd', 'testing', 'e2e']
isPrivate: false
---

I'm a bug writing machine, all developers are! We're only human after
all.

## Playwright

Playwright is neat n' all, it's the main 'evergreen' browsers all on
one package, so that's Chromium, Firefox and Webkit (Safari).

## Config

## Use different browsers

If you want to use the other browsers that are part of QA Wolf you can
specify them in the `launch` function:

```js
const { context } = await launch({ browser: 'firefox' })
// launch({browser: 'chromium'})
// launch({ browser: 'firefox' })
// launch({ browser: 'webkit' })
const page = await context.newPage()
```

## CI-CD configuration

```js
process.env.URL || 'https://scottspence.com'
```

```js
launch({ browser: 'firefox' })

launch({ browser: 'webkit' })

launch({ browser: process.env.BROWSER })
```

https://www.qawolf.com/docs/use-localhost#test-localhost
