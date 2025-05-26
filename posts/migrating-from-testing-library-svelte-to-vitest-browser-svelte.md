---
date: 2025-05-25
title: Migrating from @testing-library/svelte to vitest-browser-svelte
tags: ['svelte', 'sveltekit', 'testing']
is_private: false
---

<script>
  import { Details } from '$lib/components'
	import { Bluesky } from 'sveltekit-embed'
</script>

<!-- cspell:ignore Dominik unobserve cbjcbvndpjb vyndsqgpsi lpzm ynvzs -->

I first heard about `vitest-browser-svelte` at Svelte Summit from a
talk by [Dominik G](https://github.com/dominikg), one of the core
maintainers of SvelteKit and Vite. He demonstrated how this new
approach lets you test Svelte components in actual browsers instead of
mocked environments like `jsdom`. The idea immediately clicked - why
mock browser APIs when you can just use real ones, cool!

I just finished a pretty satisfying refactor, overhauling the testing
strategy for this site. I ditched the `@testing-library/svelte` setup
which relied on mocking various browser APIs, and moved to a
browser-based approach using `vitest-browser-svelte`.

The results? No more mocking browser APIs because I'm testing in an
actual browser. This in contrast to the work I've been doing at
XtendOps where I've migrated two quite large apps from Svelte 4 to 5
in their monorepo and I used the `vitest-setup-client.ts` for mocks,
one of them has a 60 line config and another with just under 250! 😅

As this is my space (this site) to test things out I thought I'd try
this approach here first, and SUCCESS! Guess what I'll be doing when I
get back to work! 😂 It good!

## The old setup

Let me paint you a picture of what testing looked like before. Here's
what the setup file used to look like:

<Details button_text="Expand to take a look! 👀">

```typescript
// vitest-setup-client.ts
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}))

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
	value: vi.fn(),
	writable: true,
})

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
	value: localStorageMock,
})

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
	value: vi.fn(),
})
```

</Details>

Every time I needed to test something that used a new browser API, I'd
have to come back here and add another mock. It was like playing
whack-a-mole with web standards.

## The Svelte 5 problem

Testing `$state` and `$derived` runes? Good luck with that. The
testing library would either throw weird errors or just silently fail
to detect reactivity changes. I spent more time debugging my tests
than actually writing features. Using the `*.svelte.test.ts` notation
now means that you can now use runes in these files!

## What tests actually looked like

Here's what a typical test looked like with the old setup:

```typescript
// Old approach
import { render, screen } from '@testing-library/svelte'
import { fireEvent } from '@testing-library/dom'
import MyComponent from './MyComponent.svelte'

test('component works', async () => {
	render(MyComponent, { props: { title: 'Test' } })

	const button = screen.getByTestId('my-button')
	await fireEvent.click(button)

	expect(screen.getByText('Clicked')).toBeInTheDocument()
})
```

Looks clean enough, right? But under the hood, it's running in `jsdom`
(not a real browser), using mocked APIs, and struggling with Svelte
5's reactivity. Plus, every time I wanted to test something that used
a browser API I hadn't mocked yet, I'd have to go add it to the
`vitest-setup-client.ts` file.

## The migration

Aight, here's what I did for the migration, essentially uninstall some
stuff, add some new stuff

**_Step 1: remove old dependencies_**

Take out the old testing dependencies:

```bash
pnpm remove @testing-library/jest-dom @testing-library/svelte jsdom
```

Then add in the new hotness:

```bash
pnpm add -D @vitest/browser vitest-browser-svelte playwright
```

So, yeah, it's Playwright that is doing the heavy lifting of running
an actual browser here now!

**_Step 2: configuration_**

The old `vite.config.ts` config (OLD! it's like, two weeks old! 😂)
looked like this:

```typescript
// Old config
test: {
  workspace: [
    {
      extends: './vite.config.ts',
      plugins: [svelteTesting()],
      test: {
        name: 'client',
        environment: 'jsdom',
        clearMocks: true,
        include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        exclude: ['src/lib/server/**'],
        setupFiles: ['./vitest-setup-client.ts'],
      },
    },
    {
      extends: './vite.config.ts',

      test: {
        name: 'server',
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,ts}'],
        exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
      },
    },
  ],
},
```

The new config is a bit more involved now, especially because I've
also added in SSR testing, I just chucked one test in there so that I
have a reference on how to use it in the future:

```typescript
// New config
test: {
  workspace: [
    {
      // Client-side tests (Svelte components)
      extends: './vite.config.ts',
      test: {
        name: 'client',
        environment: 'browser',
        browser: {
          enabled: true,
          provider: 'playwright',
          instances: [{ browser: 'chromium' }]
        },
        include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        exclude: ['src/lib/server/**', 'src/**/*.ssr.{test,spec}.{js,ts}'],
        setupFiles: ['./vitest-setup-client.ts'],
      },
    },
    {
      // SSR tests (Server-side rendering)
      extends: './vite.config.ts',
      test: {
        name: 'ssr',
        environment: 'node',
        include: ['src/**/*.ssr.{test,spec}.{js,ts}'],
      },
    },
    {
      // Server-side tests (Node.js utilities)
      extends: './vite.config.ts',
      test: {
        name: 'server',
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,ts}'],
        exclude: [
          'src/**/*.svelte.{test,spec}.{js,ts}',
          'src/**/*.ssr.{test,spec}.{js,ts}'
        ],
      },
    },
  ],
}
```

Yeah, it's more lines, but look what we get:

- **Browser tests** for component interactivity (real Chromium!)
- **SSR tests** for server-side rendering
- **Node tests** for server utilities

Each environment is optimized for its specific use case. No more
trying to make `jsdom` pretend to be a browser.

**_Step 3: the new setup file_**

Here's the new `vitest-setup-client.ts` setup file:

```typescript
/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />
```

That's it. **Two lines.** Both are TypeScript reference directives
that tell TypeScript about the available types.

The first reference (`@vitest/browser/matchers`) gives us access to
browser-specific assertion methods like `expect.element()` and DOM
matchers like `toBeInTheDocument()`. The second reference
(`@vitest/browser/providers/playwright`) provides TypeScript
definitions for Playwright-specific browser configuration options.

Now, to be fair, the configuration complexity didn't disappear - it
moved to the `vite.config.ts` where I've defined the browser
workspace. But here's the key difference: instead of **mocking**
browser APIs, I'm **configuring** real browser environments. No more
fake implementations, just telling Vitest which browsers to use and
how to organize my tests.

**_Step 4: rewriting the tests_**

Claude 4 to the rescue! Grunt work time, so that means AI! So, I gave
Claude the context on this project, then I referenced
[the repo kindly given by Dominik](https://github.com/dominikg/svelte-summit-testing)
in the prompt and it churned through them like a champ!

**Before:**

```typescript
import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import Details from './details.svelte'

test('toggles details', async () => {
	render(Details, { props: { summary: 'Test' } })

	const summary = screen.getByText('Test')
	await fireEvent.click(summary)

	expect(summary.closest('details')).toHaveAttribute('open')
})
```

**After:**

```typescript
import { render } from 'vitest-browser-svelte'
import { page } from '@vitest/browser/context'
import { flushSync } from 'svelte'

test('toggles details', async () => {
	render(Details, {
		props: { summary: 'Test' },
	})

	const summary = page.getByRole('button', { name: 'Test' })
	await summary.click()
	flushSync()

	const details = page.getByRole('group')
	await expect.element(details).toHaveAttribute('open')
})
```

The new version uses **locators** instead of manual DOM queries and
all `expect.element()` calls must be awaited. Locators are more
reliable because they:

- Use semantic queries (like `getByRole`) that match how users
  interact with elements
- Automatically wait for elements to be available
- Provide better error messages when elements aren't found
- Are more resilient to DOM structure changes

## Using locators instead of container queries

Thanks to
[Vladimir on Bluesky](https://bsky.app/profile/erus.dev/post/3lpzm7ynvzs2o)
for pointing this out!

One important improvement in the new approach is using **locators**
from the `page` object instead of manual `container.querySelector()`
calls.

<Bluesky
	post_id="did:plc:x7cbjcbvndpjb3vyndsqgpsi/app.bsky.feed.post/3lpzm7ynvzs2o"
	iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

Here's the difference:

**Old approach (container queries):**

```typescript
test('renders button', () => {
	const { container } = render(MyComponent)
	const button = container.querySelector('[data-testid="my-button"]')
	expect(button?.textContent).toBe('Click me')
})
```

**New approach (locators):**

```typescript
test('renders button', async () => {
	render(MyComponent)
	const button = page.getByTestId('my-button')
	await expect.element(button).toHaveTextContent('Click me')
})
```

**Key differences:**

1. **Import the page object**:
   `import { page } from '@vitest/browser/context'`
2. **Use semantic queries**: `page.getByRole()`, `page.getByTestId()`,
   `page.getByText()`
3. **Await all assertions**:
   `await expect.element(locator).toBeInTheDocument()`
4. **No container destructuring needed**: Just call
   `render(Component)` directly

**Available locator methods:**

- `page.getByRole('button')` - Find by ARIA role
- `page.getByTestId('my-id')` - Find by test ID
- `page.getByText('Click me')` - Find by text content
- `page.getByLabel('Email')` - Find by label text
- `page.getByPlaceholder('Enter email')` - Find by placeholder

This approach is more reliable and follows modern testing best
practices by focusing on how users interact with your components.

## The three testing environments

One of the coolest things about the new setup is how it separates
concerns. Instead of trying to make one testing environment do
everything, I have three specialized environments:

**_Browser Environment (`*.svelte.test.ts`)_**

This is where the magic happens. Tests run in actual Chromium, so you
get:

- Real DOM APIs
- Actual event handling
- Native browser behavior

Perfect for testing user interactions, component reactivity, and
anything that needs real browser APIs.

**_SSR Environment (`*.ssr.test.ts`)_**

For testing server-side rendering using Svelte's built-in `render`
function, here's that test I chucked in for reference:

```typescript
import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'
import BackToTop from './back-to-top.svelte'

describe('BackToTop.svelte SSR', () => {
	it('renders', () => {
		const { body } = render(BackToTop)
		expect(body).toContain('Back to top')
	})
})
```

This is good for testing SEO
([svead](https://github.com/spences10/svead) I'm coming for you 👀),
initial page loads, and making sure your components work without
JavaScript.

**_Node Environment (`*.test.ts`)_**

For testing server-side utilities, API logic, and pure functions. Just
regular Node.js testing.

## Svelte 5 testing

So, the new setup has native support for Svelte 5 runes. Testing
reactive state is now possible.

```typescript
// some-file.svelte.test.ts
import { page } from '@vitest/browser/context'
import { flushSync } from 'svelte'

test('reactive state with $state and $derived', async () => {
	let count = $state(0)
	let doubled = $derived(count * 2)

	render(Counter, {
		props: { count, doubled },
	})

	const countDisplay = page.getByTestId('count-display')
	const doubledDisplay = page.getByTestId('doubled-display')

	await expect.element(countDisplay).toHaveTextContent('0')
	await expect.element(doubledDisplay).toHaveTextContent('0')

	count = 5
	flushSync()

	await expect.element(countDisplay).toHaveTextContent('5')
	await expect.element(doubledDisplay).toHaveTextContent('10')
})
```

## It's not `global.window` now

During the migration, there was a "global is not defined" error.

The problem was in some utility functions I had that were trying to
set global properties:

```typescript
// ❌ This breaks in browser environment
global.window.scrollY = 100
```

The fix:

```typescript
// ✅ This works in browser environment
Object.defineProperty(window, 'scrollY', {
	value: 100,
	writable: true,
})
```

In the browser environment, there's no `global` object - just use
`window` directly!

## Performance and developer experience wins

The improvements aren't just about cleaner code (though that's nice).
The developer experience is night and day better:

**Faster Feedback Loop**

- Tests run in parallel across multiple browser instances
- No more waiting for jsdom to boot up and pretend to be a browser
- Real browser debugging tools when tests fail

**Better Error Messages**

When a test fails, you get actual browser errors instead of jsdom's
sometimes cryptic messages. Plus, you can actually open the browser
dev tools and inspect what's happening.

## The new test commands

The workspace setup gives you granular control over what tests to run,
I've set up some scripts passing the flags for the environments I'm
testing in, so, no need to wait for all tests to run if I'm only
testing SSR etc, here's the scripts:

```bash
"test:server": "vitest --project=server",
"test:client": "vitest --project=client",
"test:ssr": "vitest --project=ssr",
```

## Real-World example: testing a component

Let me show you how much better testing is now with a real example. I
have a `Details` component that handles collapsible content:

```typescript
// details.svelte.test.ts
import { page } from '@vitest/browser/context'
import { createRawSnippet, flushSync, tick } from 'svelte'
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Details from './details.svelte'

describe('Details Component', () => {
	test('renders with button text', async () => {
		render(Details, {
			button_text: 'Show Details',
		})

		const button = page.getByTestId('details-button')
		await expect.element(button).toHaveTextContent('Show Details')
	})

	test('toggles open state when clicked', async () => {
		const testSnippet = createRawSnippet(() => ({
			render: () => '<p>Test Content</p>',
			setup: () => {},
		}))

		render(Details, {
			button_text: 'Show Details',
			is_open: false,
			children: testSnippet,
		})

		const button = page.getByTestId('details-button')

		// Initially closed
		await expect.element(button).toHaveTextContent('Show Details')
		await expect
			.element(page.getByTestId('details-content'))
			.not.toBeInTheDocument()

		// Click to open
		await button.click()
		flushSync()
		await tick()

		const content = page.getByTestId('details-content')
		await expect.element(content).toBeInTheDocument()
		await expect.element(content).toHaveTextContent('Test Content')
		await expect.element(button).toHaveTextContent('Close')
	})

	test('applies custom styles', async () => {
		render(Details, {
			styles: 'custom-class',
		})

		const button = page.getByTestId('details-button')
		await expect.element(button).toHaveClass('custom-class')
		await expect.element(button).toHaveClass('btn')
	})
})
```

This test is:

- **Clear**: You can see exactly what's being tested
- **Reliable**: Uses real browser APIs, no mocking needed
- **Fast**: Runs in actual Chromium, not a slow jsdom simulation
- **Maintainable**: No complex setup or mocking to maintain

## Summary of things

**The file naming convention**

- `*.svelte.test.ts` for browser tests
- `*.ssr.test.ts` for SSR tests
- `*.test.ts` for Node tests

This makes it crystal clear what environment each test runs in.

**`flushSync()`**

After any interaction that should trigger Svelte reactivity, call
`flushSync()` to ensure updates are applied before making assertions.

**Use real browser APIs**

Stop mocking things! If your component uses `IntersectionObserver`,
test it with the real `IntersectionObserver`. The browser has it, use
it.

**Debug with Browser Dev Tools**

When tests fail, you can actually inspect them in the browser. This is
a really handy for debugging complex interactions.

## Overview

Let me break down the before and after:

| Metric               | Old Approach            | New Approach           | Improvement   |
| -------------------- | ----------------------- | ---------------------- | ------------- |
| **Dependencies**     | 4 testing libs          | 3 testing libs         | Simpler       |
| **Test Reliability** | jsdom limitations       | Real browser           | Much better   |
| **Svelte 5 Support** | Experimental/patchy     | Full native            | Complete      |
| **Maintenance**      | High (constant mocking) | Low (just works)       | Way better    |
| **Debug Experience** | Console logs only       | Real browser dev tools | Night and day |

## What I learned

This migration taught me a few things:

**_Sometimes the "simple" solution isn't_**

The old setup looked simple on the surface, but the complexity was
hidden in that setup file. The new approach is more explicit about
what it's doing.

**_Real > fake every time_**

Testing in a real browser beats mocking browser APIs every single
time. The confidence level in my tests has gone through the roof.

**_Separation of concerns is so nice!_**

Having different test environments for different purposes makes
everything clearer. Browser tests test browser things, SSR tests test
SSR things, Node tests test Node things. Run them where you're doing
them, no need to wait for other tests to run!

**_Modern tools are worth the migration effort_**

Yes, migrating was work (for Claude 😅). But the productivity gains
and better developer experience make it totally worth it.

## CI with Playwright containers

Another thing I discovered when doing this migration is that there's a
Playwright Docker container you can use in your CI!

So, in the case of this site (~150 tests) by using the official
Playwright Docker container I managed to save 30 seconds, the
container still needs to spn up, but I'm not downloading binaries each
time! My CI run time dropped from 2 minutes to 1 minute 30 seconds,
so, nearly a 30% reduction!

Here's the key configuration in my `.github/workflows/unit-test.yml`
file:

```yaml
jobs:
  unit-tests:
    name: Run unit tests
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.52.0-noble
      options: --user 1001

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4.1.0
      - uses: actions/setup-node@v4
      - name: Install dependencies
        run: pnpm install
      - name: Test
        run: pnpm run test:ci
```

**Why this is faster:**

1. **Pre-installed browsers**: The Playwright container comes with
   Chromium already installed
2. **Optimized environment**: Container is specifically tuned for
   browser testing
3. **No browser download**: Skips the time-consuming browser
   installation step
4. **Better resource allocation**: Container resources are optimized
   for testing workloads

**For larger projects**, the time savings would be even more
significant. If you're running hundreds or thousands of browser tests,
this optimization alone could save substantial CI minutes and costs.

**Important notes:**

- Use `--user 1001` to avoid permission issues
- Match the Playwright version in your container with your project
  dependencies
- The container approach works great for both unit tests and E2E tests

## Should you make the switch?

If you're still using `@testing-library/svelte` with jsdom, I'd say
absolutely yes. Here's why:

**You should migrate if:**

- You're using or planning to use Svelte 5
- You're tired of maintaining complex mocks
- You want more reliable tests
- You value good developer experience
- You test components that use modern browser APIs

**You might want to wait if:**

- You have a massive test suite and limited time
- Your current setup is working fine and you're not hitting
  limitations
- You're not using any browser APIs that need mocking

But honestly? Even if you're in the "wait" category, I'd recommend
trying this approach on a new project. Once you experience testing
with real browser APIs, it's hard to go back.

## Conclusion

This migration was really interesting to do and has me eyeing up other
opportunities to use this approach elsewhere! The new setup is:

- **Simpler** to maintain
- **More reliable** in results
- **Better** for Svelte 5
- **Faster** to debug
- **Future-proof** for new web standards

Plus, the three-environment approach means I can test the environments
on an individual basis!

See the
[files for this change in this PR](https://github.com/spences10/scottspence.com/pull/1092/files).
