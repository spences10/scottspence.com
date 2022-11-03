---
date: 2022-11-03
title: Testing meta tags with Playwright
tags: ['ci-cd', 'testing', 'e2e', 'playwright']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
</script>

I recently released a [head component] that can be used in Svelte
projects and I wanted to add tests to it to make sure that it's
working as expected.

I decided to use Playwright to test the component as it comes with the
SvelteKit CLI as a config option.

## The component

The component is a simple wrapper around the `<svelte:head>` API that
takes in any meta tags and adds them to the head of the page it's
being used in.

The component has the bare minimum needed for meta tags, `canonical`
link, the `title` and `description`. There's also optional tags for
Open Graph images and adding a payments pointer with the
`monetization` tag.

## The tests

The skeleton project that comes with the SvelteKit CLI has the options
to configure Playwright as the testing framework. I decided to use
that as it's already there and I don't have to configure anything.

The CLI creates a `tests` directory with a `test.ts` file in it with a
simple test:

```ts
test('index page has h1', async ({ page }) => {
  await page.goto('/')
  expect(await page.textContent('h1')).toBe('Welcome to Svead')
})
```

I'll keep that in the file.

Then the first thing I'll want to check after that would be the
`canonical`. I found how to do this with a combination of the
Playwright documentation and the Cypress tests on the [Astro SEO]
component which has been really helpful in helping me identify where
there may be some gaps in my own component.

```ts
test('head has canonical', async ({ page }) => {
  await page.goto('/')
  const metaDescription = page.locator('link[rel="canonical"]')
  await expect(metaDescription).toHaveAttribute('href', pageURL)
})
```

Then for the `description` tag:

```ts
test('head has description', async ({ page }) => {
  await page.goto('/')
  const metaDescription = page.locator('meta[name="description"]')
  await expect(metaDescription).toHaveAttribute(
    'content',
    'Svead, a component that allows you to set head meta information.'
  )
})
```

That's the basics covered for testing, I used the [Playwright VS Code
extension] for running them locally.

If you want to see the full suite of tests then check out the [tests]
over on the GitHub repo.

This is by no means a complete test suite and I'll be taking more
pointers from the really well written [Astro SEO] component tests by
[Jonas Schumacher].

## The CI

Now that I have the tests written I want to run them in CI. I was a
bit confused about how to do this to begin with so I reached out to
Debbie O'Brien who works on the Playwright developer relations team.

<Tweet tweetLink="spences10/status/1586041756751081472" />

Liran Tal chimed in a solution which was to create a GitHub workflow.

<Tweet tweetLink="liran_tal/status/1586072458171650048" />

It did help! Thanks Liran 🙏

I used that really handy post from Liran to create my own workflow
which is on the [Svead GitHub] repo in the [`.github/workflows`
folder].

That's it, now I have a CI workflow that runs the tests on every push.

## What's next?

Like I mentioned this isn't a complete suite of tests but enough to
give me the confidence it's functioning as it should. I'll be adding
in more tests to cover the other optional meta tags.

If you want to contribute feel free to open a PR on the [Svead GitHub]
repo.

<!-- Links -->

[head component]: https://github.com/spences10/svead
[astro seo]: https://github.com/jonasmerlin/astro-seo/
[playwright vs code extension]:
  https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright
[tests]: https://github.com/spences10/svead/blob/main/tests/test.ts
[jonas schumacher]: https://github.com/jonasmerlin
[svead github]: https://github.com/spences10/svead
[`.github/workflows` folder]:
  https://github.com/spences10/svead/blob/main/.github/workflows/e2e-ci.yml
