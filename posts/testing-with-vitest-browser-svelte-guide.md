---
date: 2025-06-20
title:
  'From JSDOM to Real Browsers: Testing Svelte with Vitest Browser
  Mode'
tags: ['svelte', 'sveltekit', 'testing', 'guide', 'resource']
is_private: false
---

<script>
  import { Banner } from '$lib/components'
	import { Bluesky } from 'sveltekit-embed'

  const sveltest_repo = {
    type: 'info',
    message: `This guide is accompanied by the 
      <a href="https://github.com/spences10/sveltest" target="_blank" 
      rel="noopener noreferrer">Sveltest</a> 
      repository. Perfect for learning by example!`
  }

  const sveltest_site = {
    type: 'info',
    message: `Check out the 
      <a href="https://sveltest.dev" target="_blank" rel="noopener noreferrer">
      Sveltest.dev</a> site!!. A lot of nice example documentation!`
  }
</script>

<!-- cspell:ignore vitest jsdom flushSync Sveltest xlcwj pmdsdto iwptd lqkkl macbook Peng Dominik -->

In this post I'm going to go through converting the SvelteKit minimal
template from using `@testing-library/svelte` and `jsdom` over to
using `@vitest/browser`, `vitest-browser-svelte` and `playwright`.
Why? Well, it's as close to testing components and pages as you can
get, rather than relying on the simulated `jsdom` it's using
Playwright.

I'm currently working on a large monorepo where I'm leading the
improvement on the testing posture for the teams there. There's
currently four apps, and we're focusing on two right now with a
combined 6k tests! 😅

The slowest part, running the server tests, client test's run with
`vitest-browser-svelte` runs super fast!

So, at the time of writing this `@testing-library/svelte` and `jsdom`
are still the default when starting out with a new project (and
probably what you're testing with now). From Svelte ambassador
discussions I have been involved with this may change in the future,
so I'll also be detailing some common testing patterns and a good
testing strategy to set you up.

You can always check out the migration post I did for this site for
more details
[Migrating from @testing-library/svelte to vitest-browser-svelte](https://scottspence.com/posts/migrating-from-testing-library-svelte-to-vitest-browser-svelte).

<Banner options={sveltest_repo} />

> **Important**: This guide reflects vitest-browser-svelte v0.1.0
> limitations. **Universal state runes require `flushSync()` to
> trigger DOM updates in tests** - the locators alone won't
> automatically wait for external state changes. The testing patterns
> work well, but you might notice minor differences in HTML output
> format (like self-closing tags or CSS class ordering) between
> examples and actual results.

The current canonical testing documentation around this is from David
Peng, after I updated the
[sveltest](https://github.com/spences10/sveltest) repo and shared it
on Bluesky it looks like I have been given his blessing to lead the
way on this now 😅

<Bluesky 	
  post_id="did:plc:xlcwj5hg7pmdsdto7j7iwptd/app.bsky.feed.post/3lqkkl37xns2o"
  iframe_styles="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
/>

This also encouraged me to create the
[sveltest.dev](https://sveltest.dev) site which is essentially
everything I have been learning over the past several weeks on using
Vitest Browser

<Banner options={sveltest_site} />

Aight, preamble over! Let's get started with this then!

## Create a new SvelteKit project

Right, let's get this party started! I use pnpm as my preferred
package manager, so I'll be using it throughout these examples. Let me
bootstrap a project:

```bash
pnpm dlx sv@latest create testing-with-vitest-browser-svelte

# Here's the options I'm picking
┌  Welcome to the Svelte CLI! (v0.8.10)
◆  Which template would you like?
│  SvelteKit minimal
◆  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
◆  What would you like to add to your project? (use arrow keys / space bar)
│  prettier, eslint, vitest, playwright, tailwindcss
◆  tailwindcss: Which plugins would you like to add?
│  typography
◆  Which package manager do you want to install dependencies with?
│  ● pnpm
└
```

I'll also be using daisyUI - that's just an extra line in the
`app.css` once I've got it installed:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';
```

Onward!

## Install vitest-browser-svelte

Install the deps I'm going to need, uninstall the ones I won't be
needing anymore!

```bash
cd testing-with-vitest-browser-svelte
# Add vitest browser, Svelte testing and playwright
pnpm install -D @vitest/browser vitest-browser-svelte playwright

# remove testing library and jsdom
pnpm un @testing-library/jest-dom @testing-library/svelte jsdom

# Install Playwright browsers (required for browser testing!)
pnpm exec playwright install
```

**Important!** The `pnpm exec playwright install` step is crucial -
without it, browser tests will fail with "No browsers found" errors.

Now running `pnpm run test:unit` is going to fail because I've not
configured anything!

## Configure Vitest for browser testing

I need to completely replace the `vite.config.ts` file. The SvelteKit
template comes with testing-library configuration, but I'm switching
to browser testing, so I'll wipe it clean and start fresh:

```ts
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	test: {
		projects: [
			{
				// Client-side tests (Svelte components)
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					// Timeout for browser tests - prevent hanging on element lookups
					testTimeout: 2000,
					browser: {
						enabled: true,
						provider: 'playwright',
						// Multiple browser instances for better performance
						// Uses single Vite server with shared caching
						instances: [
							{ browser: 'chromium' },
							// { browser: 'firefox' },
							// { browser: 'webkit' },
						],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: [
						'src/lib/server/**',
						'src/**/*.ssr.{test,spec}.{js,ts}',
					],
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
						'src/**/*.ssr.{test,spec}.{js,ts}',
					],
				},
			},
		],
	},
})
```

Now I need to set up the proper test scripts in `package.json`. I'll
add these scripts to run the different project configurations:

```json
{
	"scripts": {
		"test": "vitest",
		"test:client": "vitest --project=client",
		"test:server": "vitest --project=server",
		"test:ssr": "vitest --project=ssr",
		"test:e2e": "playwright test"
	}
}
```

It's not wildly different to the current setup! Client environment is
switched from jsdom over to browser and I've added an aggressive
timeout on tests for that. I've also added in some SSR config!

I'll also replace the contents of the `vitest-setup-client.ts` file so
there's no mocks, I'm just referencing Vitest browser here!

```ts
/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />
```

For more on this watch the awesome talk from Dominik G at Svelte
Summit [Testing 1 2 3 4](https://www.youtube.com/watch?v=ljmUuhfTR80).
Which I'll credit as what inspired me to create
[sveltest.dev](https://sveltest.dev).

## Get the current tests working

So, running `pnpm run test:unit` is still going to cause issues
because I've still got references to testing library which I
uninstalled!

```bash
[vite] Internal server error: Failed to resolve import "@testing-library/jest-dom/vitest" from "src/routes/page.svelte.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: /home/testing-with-vitest-browser-svelte/src/routes/page.svelte.test.ts:2:7
  2  |  import * as $ from 'svelte/internal/client';
  3  |  import { describe, test, expect } from "vitest";
  4  |  import "@testing-library/jest-dom/vitest";
     |          ^
  5  |  import { render, screen } from "@testing-library/svelte";
  6  |  import Page from "./+page.svelte";
```

So, swap out testing library with Vitest browser now in the
`src/routes/page.svelte.test.ts` file:

```ts
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Page from './+page.svelte'

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page)

		const heading = page.getByRole('heading', { level: 1 })
		await expect.element(heading).toBeInTheDocument()
	})
})
```

Now `pnpm run test:unit` passes!! Success!

Aight! So, let's go through some of the examples in
[sveltest](https://sveltest.dev) now!

## Make a button and test it

```svelte
<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
		size?: 'sm' | 'md' | 'lg'
		disabled?: boolean
		loading?: boolean
		onclick?: () => void
		type?: 'button' | 'submit' | 'reset'
		class_names?: string
		children?: any
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		onclick,
		type = 'button',
		class_names = '',
		children,
	}: Props = $props()

	const base_classes = 'btn transition-all duration-200'
	const variant_classes = {
		primary: 'btn-primary hover:scale-105',
		secondary: 'btn-secondary hover:scale-105',
		outline: 'btn-outline hover:scale-105',
		ghost: 'btn-ghost hover:scale-105',
	}
	const size_classes = {
		sm: 'btn-sm',
		md: '',
		lg: 'btn-lg',
	}
</script>

<button
	{type}
	class={[
		base_classes,
		variant_classes[variant],
		size_classes[size],
		class_names,
	]}
	{disabled}
	{onclick}
	aria-disabled={disabled || loading}
>
	{#if loading}
		<span class="loading loading-spinner loading-sm"></span>
		Loading...
	{:else}
		{@render children?.()}
	{/if}
</button>
```

Sweet! Let me create this as a new file in the `src/lib/components/`
directory. I'll also add an export from `index.ts` so I can use it:

```bash
# Create the components directory first
mkdir -p src/lib/components
touch src/lib/components/button.svelte
touch src/lib/components/index.ts
```

And the export from `src/lib/components/index.ts`:

```ts
export { default as Button } from './button.svelte'
```

Now, let's get into testing this! This is where the Client-Server
Alignment Strategy comes in! 🚀

## The Client-Server Alignment Strategy

Right, this is the approach I'm using at work and what's detailed on
[sveltest.dev](https://sveltest.dev). The idea is simple: **test where
you run!**

- **Client tests** (`.svelte.test.ts`) - Test UI components, user
  interactions, and anything that runs in the browser
- **Server tests** (`.test.ts`) - Test server utilities, API logic,
  and pure functions that run in Node.js
- **E2E tests** - Test the whole application flow with Playwright

This alignment means no more trying to mock browser APIs in Node or
server APIs in the browser. Each environment tests what it's designed
to handle!

## Testing the button component

Right, let's write some tests for this button! I'll create
`src/lib/components/button.svelte.test.ts`:

```bash
touch src/lib/components/button.svelte.test.ts
```

Then:

```ts
import { page } from '@vitest/browser/context'
import { createRawSnippet } from 'svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Button from './button.svelte'

describe('Button Component', () => {
	it('renders with default props', async () => {
		const children = createRawSnippet(() => ({
			render: () => '<span>Click me</span>',
			setup: () => {},
		}))

		render(Button, {
			children,
		})

		const button = page.getByRole('button')
		await expect.element(button).toBeInTheDocument()
		await expect.element(button).toHaveTextContent('Click me')
		await expect.element(button).toHaveClass('btn-primary')
	})

	it.skip('applies different variants', () => {
		// Pattern: Test component props that change CSS classes
		// render(Button, { variant: 'secondary' })
		// await expect.element(button).toHaveClass('btn-secondary')
	})

	it.skip('shows loading state', () => {
		// Pattern: Test conditional rendering based on props
		// render(Button, { loading: true })
		// await expect.element(button).toHaveTextContent('Loading...')
	})

	it('handles click events', async () => {
		let clicked = false
		const handle_click = () => {
			clicked = true
		}

		const children = createRawSnippet(() => ({
			render: () => '<span>Click me</span>',
			setup: () => {},
		}))

		render(Button, {
			onclick: handle_click,
			children,
		})

		const button = page.getByRole('button')
		await button.click()

		// Testing the state change - this is where real browser testing shines!
		expect(clicked).toBe(true)
	})

	it.skip('is disabled when disabled prop is true', () => {
		// Pattern: Test accessibility attributes
		// render(Button, { disabled: true })
		// await expect.element(button).toBeDisabled()
		// await expect.element(button).toHaveAttribute('aria-disabled', 'true')
	})
})
```

Running `pnpm run test:client` and these tests pass! Real browser
testing in action! 🎉

**Note:** You might see some warnings about `createRawSnippet`
expecting HTML for a single element - that's why I'm wrapping the text
in `<span>` tags. This keeps the Svelte 5 snippet system happy!

## A note on the test examples

Right, before we dive into more code examples, I want to mention
something about the test patterns you'll see. Throughout this guide,
I'm going to show you the core testing patterns once, and then use
`it.skip()` for similar tests to avoid repetition.

When you see an `it.skip()` test, it's not broken - it's intentionally
skipped with comments showing what pattern it would follow. This keeps
the guide focused on the essential concepts without drowning you in
repetitive test code.

If you want to see all the tests implemented in full, check out
[sveltest.dev](https://sveltest.dev) where every pattern is shown
completely. Think of this guide as the "why and how" and sveltest.dev
as the "show me everything" resource.

The patterns I'll show once and then reference with `it.skip()`:

- Component prop variations (different variants, sizes, etc.)
- State manipulation patterns (increment, decrement, reset)
- Form validation edge cases
- SSR rendering with different props
- E2E interaction patterns

This approach lets me keep your attention on the important stuff - the
Client-Server Alignment Strategy and the key insights for testing
Svelte 5 with real browsers!

## Testing best practices (the stuff that'll save you headaches)

Right, before we get into the meat of the testing examples, let me
share some hard-earned wisdom from my real-world testing experience.
These are the gotchas that'll trip you up if you don't know about
them!

## Always use locators, never containers

This is the big one! I cannot stress this enough - **always use
`page.getBy*()` locators, never use containers**. Here's why:

```ts
// ❌ DON'T do this - no auto-retry, will randomly fail
const { container } = render(MyComponent)
const button = container.querySelector('[data-testid="submit"]')
await button.click() // This will bite you!

// ✅ DO this - auto-retry built in, much more reliable
render(MyComponent)
const button = page.getByTestId('submit')
await button.click() // Rock solid!
```

Locators have automatic retry logic built in, which means they'll wait
for elements to appear in the DOM. Containers don't have this magic,
so you'll get flaky tests that fail randomly. Trust me, I've been
there!

## Locator priority order

When you're picking locators, follow this hierarchy for the best
accessibility and reliability:

```ts
// 1. Semantic roles (best for accessibility)
page.getByRole('button', { name: 'Submit' })

// 2. Labels (great for form fields)
page.getByLabel('Email address')

// 3. Text content (good for unique text)
page.getByText('Welcome back')

// 4. Test IDs (last resort, but reliable)
page.getByTestId('submit-button')
```

## Handle multiple elements properly

This one caught me out! When multiple elements match your locator,
you'll get a "strict mode violation" error. Here's the fix:

```ts
// ❌ FAILS: "strict mode violation" when multiple links exist
page.getByRole('link', { name: 'Home' })

// ✅ CORRECT: Be specific about which one you want
page.getByRole('link', { name: 'Home' }).first()
page.getByRole('link', { name: 'Home' }).nth(1) // second one
page.getByRole('link', { name: 'Home' }).last()
```

## Never click form submit buttons

This is a sneaky one that'll cause your tests to hang! Don't click
form submit buttons directly:

```ts
// ❌ DON'T - causes test hangs
const submitButton = page.getByRole('button', { type: 'submit' })
await submitButton.click() // Test hangs here!

// ✅ DO - test the form state instead
render(ContactForm, {
	form: { errors: { email: 'Required' } },
})
await expect.element(page.getByText('Required')).toBeInTheDocument()
```

## Use `untrack()` for derived values

When testing Svelte 5 `$derived` values, always wrap them in
`untrack()`:

```ts
// ❌ This might not work reliably
expect(counter_state.doubled).toBe(6)

// ✅ Always use untrack for derived values
expect(untrack(() => counter_state.doubled)).toBe(6)
```

## Don't test implementation details

Focus on user behavior, not internal implementation:

```ts
// ❌ Testing implementation details (SVG paths, CSS classes)
expect(body).toContain('M9 12l2 2 4-4m6 2a9')
expect(button).toHaveClass('bg-blue-500 hover:bg-blue-600')

// ✅ Test user-facing behavior
await expect
	.element(page.getByRole('img', { name: /success/i }))
	.toBeInTheDocument()
await expect.element(page.getByRole('button')).toBeEnabled()
```

## SvelteKit mocking - keep it simple

For SvelteKit apps, keep your mocks simple and avoid `importOriginal`
with SvelteKit modules:

```ts
// ✅ Simple and reliable
vi.mock('$app/state', () => ({
	page: {
		data: { user: { name: 'Test User' } },
		url: new URL('http://localhost'),
	},
}))

// ❌ Causes SSR issues
vi.mock('$app/stores', async (importOriginal) => {
	return { ...(await importOriginal()) } // Don't do this!
})
```

## Ignore SSR module warnings in browser tests

You might see warnings like this when running browser tests:

```
Error when evaluating SSR module: Cannot read properties of undefined (reading 'wrapDynamicImport')
```

Don't panic! These are expected during the transition to browser
testing and don't affect your test results. They're just noise in the
output from SvelteKit trying to evaluate server modules in the browser
context. Your tests will still pass fine.

These practices will save you hours of debugging flaky tests. I
learned most of these the hard way, so you don't have to! Right, now
let's get into the fun stuff...

## Testing Svelte 5 runes and universal state

Now let's get into the really exciting stuff - testing Svelte 5's
runes! One of the coolest features is universal state using
`*.svelte.ts` files. This is perfect for testing reactive state
management.

**Important caveat**: Universal state from external `*.svelte.ts`
files requires `flushSync()` to trigger DOM updates in browser tests.
The automatic retry behavior of locators only works for
component-internal reactivity.

Let me create a universal state store for managing a counter. I'll
create `src/lib/stores/counter.svelte.ts`:

```bash
mkdir -p src/lib/stores
```

```ts
// src/lib/stores/counter.svelte.ts
class CounterStore {
	count = $state(0)
	multiplier = $state(2)

	doubled = $derived(this.count * this.multiplier)
	is_even = $derived(this.count % 2 === 0)

	increment() {
		this.count++
	}

	decrement() {
		this.count--
	}

	reset() {
		this.count = 0
	}

	setMultiplier(value: number) {
		this.multiplier = value
	}
}

export const counter_state = new CounterStore()
```

This gives me a proper universal state store with reactive values,
derived state, and methods. Now let's create a component that uses
this store:

```svelte
<!-- src/lib/components/counter.svelte -->
<script lang="ts">
	import { counter_state } from '$lib/stores/counter.svelte.js'
</script>

<div class="card bg-base-100 w-96 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Counter: {counter_state.count}</h2>
		<p>Doubled: {counter_state.doubled}</p>
		<p>Is Even: {counter_state.isEven ? 'Yes' : 'No'}</p>
		<p>Multiplier: {counter_state.multiplier}</p>

		<div class="card-actions justify-end">
			<button
				class="btn btn-primary"
				onclick={() => counter_state.increment()}
				data-testid="increment-btn"
			>
				+1
			</button>
			<button
				class="btn btn-secondary"
				onclick={() => counter_state.decrement()}
				data-testid="decrement-btn"
			>
				-1
			</button>
			<button
				class="btn btn-neutral"
				onclick={() => counter_state.reset()}
				data-testid="reset-btn"
			>
				Reset
			</button>
		</div>

		<div class="form-control">
			<label class="label" for="multiplier">
				<span class="label-text">Multiplier</span>
			</label>
			<input
				id="multiplier"
				type="number"
				class="input input-bordered"
				bind:value={counter_state.multiplier}
				data-testid="multiplier-input"
			/>
		</div>
	</div>
</div>
```

Now for the testing! This is where it gets really interesting. The key
insight here is that **Svelte 5 runes only work in browser/component
environments**, not in plain Node.js.

So I need to test the universal state where the runes actually work -
in the browser! I'll create
`src/lib/components/counter.svelte.test.ts` that tests both the
component AND the underlying state:

```ts
import { page } from '@vitest/browser/context'
import { describe, expect, it, beforeEach } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { flushSync } from 'svelte'
import { counter_state } from '$lib/stores/counter.svelte.js'
import Counter from './counter.svelte'

describe('Counter Component + Universal State', () => {
	beforeEach(() => {
		// Reset state before each test
		counter_state.reset()
		counter_state.setMultiplier(2)
	})

	describe('Universal State (tested via component)', () => {
		it('initializes with correct default values', async () => {
			render(Counter)

			// Test that both state and UI reflect initial values
			expect(counter_state.count).toBe(0)
			expect(counter_state.multiplier).toBe(2)
			expect(counter_state.doubled).toBe(0)
			expect(counter_state.is_even).toBe(true)

			// Verify UI reflects these values
			await expect.element(page.getByText('Counter: 0')).toBeInTheDocument()
			await expect.element(page.getByText('Doubled: 0')).toBeInTheDocument()
			await expect.element(page.getByText('Is Even: Yes')).toBeInTheDocument()
		})

		it.skip('reactive state updates correctly', () => {
			// Pattern: Direct state manipulation + flushSync for external state
			// counter_state.increment()
			// flushSync() // Required for external universal state
			// expect(counter_state.count).toBe(1)
			// await expect.element(page.getByText('Counter: 1')).toBeInTheDocument()
		})

		it.skip('derived state recalculates automatically', () => {
			// Pattern: Test derived values update when dependencies change
			// counter_state.increment()
			// counter_state.setMultiplier(3)
			// flushSync()
			// expect(counter_state.doubled).toBe(3) // 1 * 3
		})
	})

		it('increments counter when increment button is clicked', async () => {
			render(Counter)

			const incrementBtn = page.getByTestId('increment-btn')
			await incrementBtn.click()

			// External state ALWAYS needs flushSync, even with click events!
			flushSync()

			// Test that both the state and UI update
			expect(counter_state.count).toBe(1)
			await expect.element(page.getByText('Counter: 1')).toBeInTheDocument()
			await expect.element(page.getByText('Doubled: 2')).toBeInTheDocument()
			await expect.element(page.getByText('Is Even: No')).toBeInTheDocument()
		})

	it.skip('decrements counter when decrement button is clicked', () => {
		// Pattern: Same as increment but testing decrement functionality
		// Sets up initial state, clicks button, verifies result
	})

	it.skip('resets counter when reset button is clicked', () => {
		// Pattern: Testing state reset functionality
		// Set non-zero state, click reset, verify back to initial state
	})

	it.skip('updates multiplier through input field', () => {
		// Pattern: Testing form input binding with state
		// Fill input, trigger change, verify state and derived values update
	})

	it.skip('reactive derived state updates in real-time', () => {
		// Pattern: Testing multiple state changes and their effects
		// Click increment multiple times, verify derived state (is_even) toggles
	})
	})
})
```

Don't forget to add the Counter component to the exports in
`src/lib/components/index.ts`:

```ts
export { default as Button } from './button.svelte'
export { default as Counter } from './counter.svelte'
```

## What makes this testing approach powerful

This demonstrates the power of the Client-Server Alignment Strategy
with Svelte 5:

1. **Reactive state tested in browser environment** - Where runes
   actually work!
2. **Component + state integration** tested together - Complete
   behavior verification
3. **Universal state** works seamlessly across components (with proper
   `flushSync()` usage)
4. **No mocking needed** - The same state instance works everywhere
5. **Clear patterns** - External state always needs `flushSync()`,
   internal component state updates automatically

**Key insights for testing Svelte 5 runes:**

1. **External state ALWAYS requires `flushSync()`**: When testing
   universal state from `*.svelte.ts` files, you need `flushSync()` to
   trigger DOM updates after ANY state manipulation - even click
   events!
2. **Component-internal state works automatically**: Only state that
   lives inside the component itself gets automatic reactivity updates
3. **Test in browser environment**: Runes require a component context
   and don't work in plain Node.js

The `*.svelte.ts` universal state is particularly brilliant because:

- **Shared reactive state** across your entire app
- **Type-safe** with full TypeScript support
- **Testable with real reactivity** in browser tests (with
  `flushSync()` for external updates)
- **Works in SSR and hydration** seamlessly

This approach gives you confidence that your reactive state management
works correctly, just remember the `flushSync()` requirement for
external state testing!

## Testing SSR (Server-Side Rendering)

Now let's cover SSR testing! This is crucial for ensuring your
components render correctly on the server and deliver proper HTML to
users. SSR tests run in Node.js and use Svelte's built-in `render`
function.

Let me create some components that benefit from SSR testing. First,
let's make a SEO component that should render properly on the server:

```bash
mkdir -p src/lib/components/seo
```

```svelte
<!-- src/lib/components/seo/meta-tags.svelte -->
<script lang="ts">
	interface Props {
		title: string
		description: string
		url?: string
		image?: string
		type?: 'website' | 'article'
	}

	let {
		title,
		description,
		url = 'https://example.com',
		image = '/default-og.png',
		type = 'website',
	}: Props = $props()
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:type" content={type} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>
```

And a blog post component that uses our universal state:

```svelte
<!-- src/lib/components/blog-post.svelte -->
<script lang="ts">
	import { counter_state } from '$lib/stores/counter.svelte.js'
	import MetaTags from './seo/meta-tags.svelte'

	interface Props {
		title: string
		content: string
		author: string
		publishedAt: string
		slug: string
	}

	let { title, content, author, publishedAt, slug }: Props = $props()

	const url = `https://example.com/posts/${slug}`
	const reading_time = Math.ceil(content.split(' ').length / 200)
</script>

<MetaTags
	{title}
	description={content.slice(0, 160) + '...'}
	{url}
	type="article"
/>

<article class="prose lg:prose-xl mx-auto">
	<header class="mb-8">
		<h1 class="mb-4 text-4xl font-bold">{title}</h1>
		<div class="mb-4 text-gray-600">
			<span>By {author}</span>
			<span class="mx-2">•</span>
			<time datetime={publishedAt}>
				{new Date(publishedAt).toLocaleDateString()}
			</time>
			<span class="mx-2">•</span>
			<span>{reading_time} min read</span>
		</div>

		<!-- Show current counter state (for demo purposes) -->
		<div class="rounded bg-blue-50 p-4">
			<p class="text-sm">
				Page views simulation: {counter_state.count}
				<button
					class="btn btn-xs btn-primary ml-2"
					onclick={() => counter_state.increment()}
				>
					+1
				</button>
			</p>
		</div>
	</header>

	<div class="content">
		{@html content}
	</div>
</article>
```

Now let's test the SSR rendering! I'll create
`src/lib/components/seo/meta-tags.ssr.test.ts`:

```ts
import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'
import MetaTags from './meta-tags.svelte'

describe('MetaTags SSR', () => {
	it('renders basic meta tags', () => {
		const { head } = render(MetaTags, {
			props: {
				title: 'Test Blog Post',
				description: 'This is a test description for SEO purposes.',
			},
		})

		// Check that essential meta tags are rendered
		expect(head).toContain('<title>Test Blog Post</title>')
		expect(head).toContain(
			'<meta name="description" content="This is a test description for SEO purposes.">',
		)

		// Check Open Graph tags
		expect(head).toContain(
			'<meta property="og:title" content="Test Blog Post">',
		)
		expect(head).toContain(
			'<meta property="og:description" content="This is a test description for SEO purposes.">',
		)
		expect(head).toContain(
			'<meta property="og:type" content="website">',
		)

		// Check Twitter tags
		expect(head).toContain(
			'<meta name="twitter:card" content="summary_large_image">',
		)
		expect(head).toContain(
			'<meta name="twitter:title" content="Test Blog Post">',
		)
	})

	it.skip('renders with custom URL and image', () => {
		// Pattern: Same as basic render test but with different props
		// Tests prop customization and default value overrides
	})

	it.skip('uses default values when not provided', () => {
		// Pattern: Test component default prop values
		// Render with minimal props, verify defaults are applied
	})
})
```

And let's test the blog post component with SSR -
`src/lib/components/blog-post.ssr.test.ts`:

```ts
import { render } from 'svelte/server'
import { describe, expect, it, beforeEach } from 'vitest'
import { counter_state } from '$lib/stores/counter.svelte.js'
import BlogPost from './blog-post.svelte'

describe('BlogPost SSR', () => {
	beforeEach(() => {
		counter_state.reset()
	})

	it('renders blog post structure', () => {
		const { body } = render(BlogPost, {
			props: {
				title: 'My Test Post',
				content: '<p>This is the content of my blog post.</p>',
				author: 'Scott Spence',
				publishedAt: '2025-06-18',
				slug: 'my-test-post',
			},
		})

		// Check main content
		expect(body).toContain(
			'<h1 class="text-4xl font-bold mb-4">My Test Post</h1>',
		)
		expect(body).toContain('<span>By Scott Spence</span>')
		expect(body).toContain(
			'<p>This is the content of my blog post.</p>',
		)
	})

	it.skip('calculates reading time correctly', () => {
		// Pattern: Test computed/derived values in SSR
		// Create content with known word count, verify reading time calculation
	})

	it.skip('formats date correctly', () => {
		// Pattern: Test date formatting in SSR context
		// Provide date string, verify formatted output in rendered HTML
	})

	it.skip('includes counter state from universal store', () => {
		// Pattern: Test universal state works in SSR
		// Render component, verify store state appears in server-rendered HTML
	})

	it.skip('renders meta tags in head', () => {
		// Pattern: Test child component integration in SSR
		// Verify that nested MetaTags component renders in head section
	})
})
```

Don't forget to add the exports to your components index:

```ts
export { default as Button } from './button.svelte'
export { default as Counter } from './counter.svelte'
export { default as BlogPost } from './blog-post.svelte'
export { default as MetaTags } from './seo/meta-tags.svelte'
```

## When to write SSR tests

Based on best practices and real-world experience, you should
prioritize SSR tests for:

**High Priority - Always Test:**

1. **SEO-critical components** - Meta tags, titles, Open Graph,
   structured data
2. **Initial page load content** - Hero sections, navigation, critical
   above-the-fold content
3. **Universal state initialization** - Ensure stores work server-side
4. **Dynamic content generation** - Blog posts, product pages with
   server-generated content

**Medium Priority - Test When Relevant:**

1. **Content that affects accessibility** - Proper heading hierarchy,
   alt tags
2. **Conditional rendering** - Different content based on user state
   or data
3. **Date/time formatting** - Ensure consistent formatting across
   server/client
4. **Calculated values** - Reading time, pricing, derived data

**Low Priority - Optional:**

1. **Pure UI components** - Buttons, modals that don't affect SEO
2. **Interactive-only features** - Client-side only functionality
3. **Development/debug components** - Counter examples, dev tools

**When NOT to write SSR tests:**

- Client-side only interactions (hover states, animations)
- Components that only render after user interaction
- Third-party widgets that don't affect initial load

## Why SSR testing matters

SSR tests are crucial because they:

1. **Validate SEO** - Ensure meta tags, titles, and structured data
   render correctly for search engines
2. **Test initial state** - Verify server-rendered HTML matches what
   users see on first load
3. **Check universal state** - Confirm your `*.svelte.ts` stores work
   on the server
4. **Prevent hydration mismatches** - Catch differences between server
   and client rendering
5. **Performance validation** - Ensure server rendering doesn't break
   with complex state
6. **Content consistency** - Verify that server-generated content is
   complete and accurate

## Running SSR tests

These tests run with:

```bash
pnpm run test:ssr
```

They're fast because they don't need browsers - just Node.js and
Svelte's server renderer!

## Key SSR testing patterns

- **Use `render()` from `svelte/server`** - Not the browser version
- **Test both `head` and `body`** - Many components affect both
- **Check universal state** - Ensure stores work server-side
- **Validate calculated values** - Reading time, dates, formatting
- **Test conditional rendering** - Different states should render
  different HTML

This completes the Client-Server Alignment Strategy - now you're
testing everywhere your code runs!

## Testing server utilities

Now let's test some server-side code. I'll create a utility function
for handling form data. First I need to create the directory:

```bash
mkdir -p src/lib/server
```

Then create `src/lib/server/form-utils.ts`:

```ts
export interface FormData {
	name: string
	email: string
	message: string
}

export function validate_form_data(data: FormData): {
	valid: boolean
	errors: string[]
} {
	const errors: string[] = []

	if (!data.name || data.name.trim().length < 2) {
		errors.push('Name must be at least 2 characters')
	}

	if (!data.email || !is_valid_email(data.email)) {
		errors.push('Valid email is required')
	}

	if (!data.message || data.message.trim().length < 10) {
		errors.push('Message must be at least 10 characters')
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

function is_valid_email(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export function sanitize_input(input: string): string {
	return input.trim().replace(/[<>]/g, '')
}
```

And the test for it, `src/lib/server/form-utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { sanitize_input, validate_form_data } from './form-utils'

describe('Form Utilities', () => {
	describe('validate_form_data', () => {
		it('validates correct form data', () => {
			const valid_data = {
				name: 'John Doe',
				email: 'john@example.com',
				message: 'This is a valid message with enough characters',
			}

			const result = validate_form_data(valid_data)
			expect(result.valid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it.skip('catches validation errors', () => {
			// Pattern: Test validation logic with invalid data
			// Pass invalid form data, verify errors are returned
		})

		it.skip('handles empty data', () => {
			// Pattern: Test edge case with empty/missing data
			// Pass empty form data, verify appropriate errors
		})
	})

	describe('sanitize_input', () => {
		it('removes dangerous characters', () => {
			const input = '<script>alert("xss")</script>Normal text'
			const sanitized = sanitize_input(input)
			expect(sanitized).toBe('scriptalert("xss")/scriptNormal text')
		})

		it.skip('trims whitespace', () => {
			// Pattern: Test string processing utility
			// Pass string with whitespace, verify trimmed result
		})
	})
})
```

These run with `pnpm run test:server` - pure Node.js testing for
server logic!

## A contact form bringing it all together

Let me create a contact form that uses both the button component and
the server utilities. First I'll create the directory:

```bash
mkdir -p src/routes/contact
```

Then create `src/routes/contact/+page.svelte`:

```svelte
<script lang="ts">
	import { Button } from '$lib/components'
	import { enhance } from '$app/forms'

	let { form } = $props()
	let loading = $state(false)
</script>

<div class="mx-auto max-w-2xl p-6">
	<h1 class="mb-6 text-3xl font-bold">Contact Me</h1>

	{#if form?.success}
		<div class="alert alert-success mb-6">
			Thanks for your message! I'll get back to you soon.
		</div>
	{/if}

	{#if form?.errors && form.errors.length > 0}
		<div class="alert alert-error mb-6">
			<ul>
				{#each form.errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			loading = true
			return async ({ update }) => {
				loading = false
				await update()
			}
		}}
		class="space-y-4"
	>
		<div class="form-control">
			<label for="name" class="label">
				<span class="label-text">Name</span>
			</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				class="input input-bordered w-full"
				value={form?.data?.name ?? ''}
			/>
		</div>

		<div class="form-control">
			<label for="email" class="label">
				<span class="label-text">Email</span>
			</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				class="input input-bordered w-full"
				value={form?.data?.email ?? ''}
			/>
		</div>

		<div class="form-control">
			<label for="message" class="label">
				<span class="label-text">Message</span>
			</label>
			<textarea
				id="message"
				name="message"
				required
				rows="4"
				class="textarea textarea-bordered w-full"
				value={form?.data?.message ?? ''}
			></textarea>
		</div>

		<Button type="submit" {loading} class_names="w-full">
			{#snippet children()}
				Send Message
			{/snippet}
		</Button>
	</form>
</div>
```

And the form action in `src/routes/contact/+page.server.ts`:

```ts
import { validate_form_data } from '$lib/server/form-utils'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData()

		const form_data = {
			name: data.get('name') as string,
			email: data.get('email') as string,
			message: data.get('message') as string,
		}

		const validation = validate_form_data(form_data)

		if (!validation.valid) {
			return fail(400, {
				errors: validation.errors,
				data: form_data,
			})
		}

		// Here you'd normally send the email or save to database
		console.log('Form submitted:', form_data)

		return {
			success: true,
		}
	},
}
```

## Testing the contact form

Now for the fun part! Testing the whole form interaction. I'll create
`src/routes/contact/+page.svelte.test.ts`:

```ts
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import ContactPage from './+page.svelte'

describe('Contact Page', () => {
	it('renders the contact form', async () => {
		render(ContactPage, {
			form: null,
		})

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Contact Me')

		await expect
			.element(page.getByLabelText('Name'))
			.toBeInTheDocument()
		await expect
			.element(page.getByLabelText('Email'))
			.toBeInTheDocument()
		await expect
			.element(page.getByLabelText('Message'))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'Send Message' }))
			.toBeInTheDocument()
	})

	it.skip('shows success message when form is successful', () => {
		// Pattern: Test conditional rendering based on form state
		// render(ContactPage, { form: { success: true } })
		// await expect.element(page.getByText('Thanks for your message!')).toBeInTheDocument()
	})

	it.skip('shows validation errors', () => {
		// Pattern: Test error display from form validation
		// render(ContactPage, { form: { errors: [...] } })
		// await expect.element(page.getByText('Name must be at least 2 characters')).toBeInTheDocument()
	})

	it.skip('preserves form data on validation errors', () => {
		// Pattern: Test form data persistence after validation failure
		// render(ContactPage, { form: { errors: [...], data: {...} } })
		// await expect.element(page.getByDisplayValue('John')).toBeInTheDocument()
	})
})
```

## E2E testing with Playwright

Finally, let's add some E2E tests to make sure everything works
together. Here's `tests/contact.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test.describe('Contact Form E2E', () => {
	test('successfully submits contact form', async ({ page }) => {
		await page.goto('/contact')

		// Fill out the form
		await page.fill('[name="name"]', 'John Doe')
		await page.fill('[name="email"]', 'john@example.com')
		await page.fill(
			'[name="message"]',
			'This is a test message with enough characters to pass validation',
		)

		// Submit the form
		await page.click('button[type="submit"]')

		// Check for success message
		await expect(
			page.getByText('Thanks for your message!'),
		).toBeVisible()
	})

	test.skip('shows validation errors for invalid data', () => {
		// Pattern: E2E form validation testing
		// Fill form with invalid data, submit, verify error messages appear
	})

	test.skip('shows loading state during form submission', () => {
		// Pattern: E2E loading state testing
		// Fill form, click submit, immediately check for loading indicator
	})
})
```

## Running all the tests

Now I can run each test suite individually:

```bash
# Client-side component tests
pnpm run test:client

# Server-side utility tests
pnpm run test:server

# E2E tests
pnpm run test:e2e
```

Or all at once:

```bash
pnpm run test
```

## The beauty of this approach

This testing strategy gives me:

1. **Separation of concerns** - Each test runs in its appropriate
   environment
2. **Real browser testing** - No more mocking browser APIs for
   component tests
3. **Fast server tests** - Pure Node.js testing for utilities
4. **Comprehensive coverage** - E2E tests ensure everything works
   together
5. **Great DX** - Clear error messages and debugging in real browsers

The Client-Server Alignment Strategy means I'm testing things where
they actually run, leading to more reliable tests and fewer surprises
in production!

## Testing patterns to remember

- **Use locators** instead of manual DOM queries - they're more
  reliable and wait automatically
- **Await all assertions** with `expect.element()` in browser tests
- **No more `flushSync()` needed** for most cases - locators handle
  the waiting
- **Test user interactions** in browser tests, **test logic** in
  server tests
- **Use semantic queries** like `getByRole()` and `getByLabelText()`
  for better accessibility testing

This approach has completely changed how I think about testing in
SvelteKit. No more fighting with mocks or trying to simulate browser
behavior - just test in the environment where your code actually runs!

## Setting up CI/CD

Right, you've got your tests working locally, but what about CI? This
is where things get interesting! I'm going to set up GitHub Actions
with the same Client-Server Alignment Strategy.

I'll create two separate workflows - one for unit tests (client +
server) and one for E2E tests. This separation means if my E2E tests
are flaky, my unit tests can still pass and vice versa.

Let's create `.github/workflows/unit-tests.yml`:

```yaml
name: Unit Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Run unit tests
    runs-on: ubuntu-latest
    container:
      # Using Playwright container for pre-installed browsers
      image: mcr.microsoft.com/playwright:v1.52.0-noble
      options: --user 1001

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4.1.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run client tests
        run: pnpm run test:client

      - name: Run server tests
        run: pnpm run test:server
```

And `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    name: Run E2E tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4.1.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Build application
        run: pnpm run build

      - name: Run E2E tests
        run: pnpm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Why separate workflows?

This separation is brilliant for a few reasons:

1. **Independent failures** - E2E tests can be flaky, but that won't
   block your unit tests
2. **Different requirements** - Unit tests need Playwright containers,
   E2E tests need full app builds
3. **Faster feedback** - Unit tests run faster, so you get quicker
   feedback on basic functionality
4. **Resource optimization** - You can scale these differently based
   on your needs

## The Playwright container advantage

Using `mcr.microsoft.com/playwright:v1.52.0-noble` for unit tests is a
game changer! No more waiting for browser downloads:

- **Pre-installed browsers** - Chromium is already there
- **Optimized environment** - Tuned specifically for browser testing
- **Consistent versions** - Same browser versions every time
- **Faster CI runs** - No download time means faster feedback

## Environment variables for server tests

If your server tests need environment variables, add them to your
workflow:

```yaml
- name: Run server tests
  run: pnpm run test:server
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_SECRET: ${{ secrets.API_SECRET }}
```

## Caching for speed

The `cache: 'pnpm'` in the Node.js setup step caches your
`node_modules`, making subsequent runs much faster. Combined with the
Playwright container, you're looking at seriously optimized CI times!

## Troubleshooting CI issues

**Browser tests fail with "No browsers found":** Make sure you're
using the Playwright container for unit tests and running
`playwright install` for E2E tests.

**Permission errors in container:** Always use `--user 1001` in
container options to avoid permission issues.

**Timeout issues:** Browser tests can be slower in CI. Consider
increasing the `testTimeout` in your Vitest config for CI
environments.

This CI setup follows the same Client-Server Alignment Strategy as
your local development - test where you run! Unit tests run in
optimized containers, E2E tests run in full environments, and
everything stays fast and reliable.

## Alternative: Component-Internal Runes Testing

If you want to avoid the `flushSync()` requirement, consider testing
runes through component props instead of external universal state:

```typescript
// Component that accepts initial state as props
test('counter with internal runes', async () => {
	render(Counter, { initial_count: 5 })

	const count_display = page.getByTestId('count')
	await expect.element(count_display).toHaveTextContent('5')

	const increment_button = page.getByRole('button', {
		name: 'Increment',
	})
	await increment_button.click()

	// No flushSync needed - component-internal reactivity works automatically
	await expect.element(count_display).toHaveTextContent('6')
})
```

This pattern avoids the external state complexity while still testing
runes thoroughly.

Now get out there and write some tests! Your future self (and your
users) will thank you! 🚀
