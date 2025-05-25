# Testing Strategy & Best Practices

This document outlines the comprehensive testing strategy for this
SvelteKit project, covering both client-side Svelte component testing
and server-side Node.js testing.

## Table of Contents

- [Overview](#overview)
- [Testing Architecture](#testing-architecture)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Testing Svelte Components](#testing-svelte-components)
- [Testing Server-Side Rendering (SSR)](#testing-server-side-rendering-ssr)
- [Testing Node.js/Server Code](#testing-nodejs-server-code)
- [Testing Utilities](#testing-utilities)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Running Tests](#running-tests)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses a modern testing setup with **Vitest** as the test
runner and **vitest-browser-svelte** for component testing. The
testing strategy is split into three main environments:

1. **Browser Environment**: For testing Svelte components using real
   browser APIs
2. **Server Environment**: For testing server-side rendering (SSR) of
   Svelte components
3. **Node Environment**: For testing server-side utilities, API logic,
   and pure functions

## Testing Architecture

### Workspace Configuration

The project uses Vitest workspaces to separate client and server
testing:

```typescript
// vite.config.ts
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

## Dependencies

### Core Testing Dependencies

```json
{
	"vitest": "^3.1.4",
	"@vitest/browser": "^3.1.4",
	"vitest-browser-svelte": "^0.1.0",
	"playwright": "^1.52.0",
	"@playwright/test": "^1.52.0"
}
```

### Key Features

- **Real Browser Testing**: Tests run in actual Chromium browser
- **Svelte 5 Support**: Native support for `$state`, `$derived`, and
  other runes
- **No Mocking Required**: Real DOM APIs eliminate need for complex
  mocks
- **Fast Execution**: Playwright provides efficient browser automation

## Configuration

### Client Setup (`vitest-setup-client.ts`)

```typescript
/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />
```

The setup is minimal because we use real browser APIs instead of
mocks.

## Testing Svelte Components

### File Naming Convention

Svelte component tests use the `.svelte.test.ts` extension:

- `Component.svelte` → `Component.svelte.test.ts`

### Basic Component Test Structure

```typescript
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { flushSync } from 'svelte'
import MyComponent from './MyComponent.svelte'

describe('MyComponent', () => {
	test('renders with default props', () => {
		const { container } = render(MyComponent)
		const element = container.querySelector(
			'[data-testid="my-element"]',
		)
		expect(element?.textContent?.trim()).toBe('Expected Text')
	})
})
```

### Testing Component Props

```typescript
test('renders with custom props', () => {
	const { container } = render(MyComponent, {
		props: {
			title: 'Custom Title',
			isVisible: true,
		},
	})

	expect(container.textContent?.includes('Custom Title')).toBe(true)
})
```

### Testing User Interactions

```typescript
test('handles click events', () => {
	const { container } = render(MyComponent)
	const button = container.querySelector('button') as HTMLElement

	button.click()
	flushSync() // Ensure Svelte updates are applied

	expect(container.textContent?.includes('Clicked')).toBe(true)
})
```

### Testing Reactive State (Svelte 5 Runes)

```typescript
test('reactive state updates', () => {
	const props = $state({ count: 0 })
	const { container } = render(Counter, { props })

	expect(container.textContent?.includes('0')).toBe(true)

	props.count = 5
	flushSync()

	expect(container.textContent?.includes('5')).toBe(true)
})
```

### Testing with Custom Styles

```typescript
test('applies custom CSS classes', () => {
	const { container } = render(MyComponent, {
		props: { styles: 'custom-class' },
	})

	const element = container.querySelector(
		'[data-testid="styled-element"]',
	)
	expect(element?.classList.contains('custom-class')).toBe(true)
})
```

### Testing Server-Side Rendering (SSR)

For testing how components render on the server side, you can use
Svelte's built-in `render` function from `svelte/server`:

```typescript
// Component.ssr.test.ts
import { describe, expect, test } from 'vitest'
import { render } from 'svelte/server'
import MyComponent from './MyComponent.svelte'

describe('MyComponent SSR', () => {
	test('renders correctly on server', () => {
		const { body } = render(MyComponent, {
			props: { name: 'World' },
		})

		expect(body).toContain('Hello, World!')
	})

	test('generates proper HTML structure', () => {
		const { body, head, css } = render(MyComponent, {
			props: { title: 'Test Page' },
		})

		expect(body).toContain('<h1>Test Page</h1>')
		expect(head).toContain('<title>Test Page</title>')
		expect(css.code).toContain('.my-component')
	})
})
```

**Key differences from client-side testing:**

- Uses `render` from `svelte/server` instead of
  `vitest-browser-svelte`
- Returns `{ body, head, css }` object instead of container
- Tests the actual HTML string output
- No DOM interaction or browser APIs available
- Perfect for testing initial render and SEO-related content

### Testing Svelte 5 Classes (.svelte.ts files)

```typescript
// doubler.svelte.ts
export class Doubler {
	#getNumber
	#double = $derived(this.#getNumber() * 2)

	constructor(getNumber: () => number) {
		this.#getNumber = getNumber
	}

	get value() {
		return this.#double
	}
}

// doubler.svelte.test.ts
import { describe, expect, it } from 'vitest'
import { Doubler } from './doubler.svelte.ts'

describe('doubler.svelte.ts', () => {
	it('should double initial value', () => {
		let value = $state(1)
		let doubler = new Doubler(() => value)
		expect(doubler.value).toBe(2)
	})

	it('should be reactive', () => {
		let value = $state(0)
		let doubler = new Doubler(() => value)
		expect(doubler.value).toBe(0)

		value = 2
		expect(doubler.value).toBe(4)
	})
})
```

## Testing Server-Side Rendering (SSR)

Server-side rendering testing is crucial for ensuring your components
render correctly on the server, which is important for SEO, initial
page load performance, and ensuring your app works without JavaScript.

### File Naming Convention

SSR tests use the `.ssr.test.ts` extension:

- `Component.svelte` → `Component.ssr.test.ts`

### Basic SSR Test Structure

```typescript
import { describe, expect, test } from 'vitest'
import { render } from 'svelte/server'
import MyComponent from './MyComponent.svelte'

describe('MyComponent SSR', () => {
	test('renders with props', () => {
		const { body } = render(MyComponent, {
			props: { name: 'World' },
		})

		expect(body).toContain('Hello, World!')
	})
})
```

### Testing HTML Output

```typescript
test('generates correct HTML structure', () => {
	const { body } = render(ProductCard, {
		props: {
			title: 'Test Product',
			price: 29.99,
			inStock: true,
		},
	})

	expect(body).toContain('<h2>Test Product</h2>')
	expect(body).toContain('$29.99')
	expect(body).toContain('In Stock')
	expect(body).not.toContain('Out of Stock')
})
```

### Testing Head Content

```typescript
test('generates proper head content', () => {
	const { head } = render(SEOComponent, {
		props: {
			title: 'My Page Title',
			description: 'Page description',
		},
	})

	expect(head).toContain('<title>My Page Title</title>')
	expect(head).toContain(
		'<meta name="description" content="Page description">',
	)
})
```

### Testing CSS Generation

```typescript
test('generates component styles', () => {
	const { css } = render(StyledComponent, {
		props: { theme: 'dark' },
	})

	expect(css.code).toContain('.component')
	expect(css.code).toContain('background-color')
})
```

### Testing Conditional Rendering

```typescript
test('conditionally renders content based on props', () => {
	// Test when user is logged in
	const { body: loggedInBody } = render(UserProfile, {
		props: { user: { name: 'John', isLoggedIn: true } },
	})

	expect(loggedInBody).toContain('Welcome, John!')
	expect(loggedInBody).not.toContain('Please log in')

	// Test when user is not logged in
	const { body: loggedOutBody } = render(UserProfile, {
		props: { user: { isLoggedIn: false } },
	})

	expect(loggedOutBody).toContain('Please log in')
	expect(loggedOutBody).not.toContain('Welcome')
})
```

### Testing with Context

```typescript
test('renders with context', () => {
	const context = new Map([
		['theme', 'dark'],
		['user', { id: 1, name: 'Alice' }],
	])

	const { body } = render(ContextAwareComponent, {
		props: {},
		context,
	})

	expect(body).toContain('dark-theme')
	expect(body).toContain('Hello, Alice')
})
```

### SSR vs Client-Side Testing

| Aspect           | SSR Testing                   | Client-Side Testing                   |
| ---------------- | ----------------------------- | ------------------------------------- |
| **Import**       | `render` from `svelte/server` | `render` from `vitest-browser-svelte` |
| **Environment**  | Node.js                       | Browser (Playwright)                  |
| **Output**       | `{ body, head, css }`         | `{ container }`                       |
| **Interactions** | None                          | Click, type, etc.                     |
| **Use Case**     | Initial render, SEO           | User interactions, reactivity         |
| **Browser APIs** | Not available                 | Available                             |

### When to Use SSR Testing

- **SEO Content**: Testing meta tags, titles, structured data
- **Initial Render**: Ensuring components render without JavaScript
- **Performance**: Testing that critical content is server-rendered
- **Accessibility**: Ensuring semantic HTML structure
- **Static Content**: Testing content that doesn't require
  interactivity

### SSR Testing Best Practices

1. **Test Critical Paths**: Focus on components that affect SEO and
   initial load
2. **Verify HTML Structure**: Ensure proper semantic markup
3. **Test Edge Cases**: Empty states, missing props, error conditions
4. **Keep Tests Simple**: SSR tests should focus on output, not logic
5. **Complement Client Tests**: Use alongside browser tests, not
   instead of

## Testing Node.js/Server Code

### File Naming Convention

Server-side tests use the `.test.ts` extension:

- `utils.ts` → `utils.test.ts`

### Basic Server Test Structure

```typescript
import { describe, expect, test } from 'vitest'
import { myUtilFunction } from './utils'

describe('myUtilFunction', () => {
	test('returns expected result', () => {
		const result = myUtilFunction('input')
		expect(result).toBe('expected output')
	})
})
```

### Testing with Mocks

```typescript
import { describe, expect, test, vi } from 'vitest'
import { formatDistanceStrict } from 'date-fns'

// Mock external dependencies
vi.mock('date-fns', () => ({
	formatDistanceStrict: vi.fn(),
}))

test('formats date correctly', () => {
	const mockDate = '2023-01-01'
	const mockResult = '2 months ago'

	vi.mocked(formatDistanceStrict).mockReturnValue(mockResult)

	const result = formatDate(mockDate)
	expect(result).toBe(mockResult)
})
```

### Testing Window/Browser APIs in Node Environment

When testing utilities that use browser APIs, mock them appropriately:

```typescript
test('handles window.scrollY', () => {
	// Mock window.scrollY for Node environment
	Object.defineProperty(window, 'scrollY', {
		value: 100,
		writable: true,
	})

	const result = checkScrollPosition()
	expect(result).toBe(true)
})
```

## Testing Utilities

### Common Test Utilities

```typescript
// Test helper for rendering components with common props
function renderWithDefaults(Component: any, props = {}) {
	return render(Component, {
		props: {
			// Default props
			theme: 'light',
			...props,
		},
	})
}

// Test helper for waiting for async operations
async function waitForElement(container: Element, selector: string) {
	return new Promise((resolve) => {
		const observer = new MutationObserver(() => {
			const element = container.querySelector(selector)
			if (element) {
				observer.disconnect()
				resolve(element)
			}
		})

		observer.observe(container, { childList: true, subtree: true })
	})
}
```

## Best Practices

### 1. Use Data Test IDs

```svelte
<!-- Test -->
<script>
	const button = container.querySelector(
		'[data-testid="submit-button"]',
	)
</script>

<!-- Component.svelte -->
<button data-testid="submit-button">Submit</button>
```

### 2. Test User Behavior, Not Implementation

```typescript
// ❌ Testing implementation details
test('calls internal method', () => {
	const component = render(MyComponent)
	expect(component.internalMethod).toHaveBeenCalled()
})

// ✅ Testing user behavior
test('shows success message after form submission', async () => {
	const { container } = render(ContactForm)

	await container.querySelector('[data-testid="submit"]').click()

	expect(container.textContent?.includes('Success!')).toBe(true)
})
```

### 3. Use Descriptive Test Names

```typescript
// ❌ Vague test names
test('button works', () => {})

// ✅ Descriptive test names
test('shows loading state when form is submitting', () => {})
test('displays error message when email is invalid', () => {})
```

### 4. Group Related Tests

```typescript
describe('ContactForm', () => {
	describe('validation', () => {
		test('shows error for invalid email', () => {})
		test('shows error for empty required fields', () => {})
	})

	describe('submission', () => {
		test('shows loading state during submission', () => {})
		test('shows success message on successful submission', () => {})
	})
})
```

### 5. Clean Up After Tests

```typescript
import { afterEach, vi } from 'vitest'

afterEach(() => {
	vi.resetAllMocks()
	// Reset any global state
})
```

## Common Patterns

### Testing Forms

```typescript
test('validates form input', async () => {
	const { container } = render(ContactForm)

	const emailInput = container.querySelector(
		'[data-testid="email"]',
	) as HTMLInputElement
	const submitButton = container.querySelector(
		'[data-testid="submit"]',
	) as HTMLElement

	// Test invalid email
	emailInput.value = 'invalid-email'
	submitButton.click()
	flushSync()

	expect(container.textContent?.includes('Invalid email')).toBe(true)
})
```

### Testing Conditional Rendering

```typescript
test('shows content when condition is met', () => {
	const { container } = render(ConditionalComponent, {
		props: { showContent: true },
	})

	expect(
		container.querySelector('[data-testid="content"]'),
	).toBeTruthy()
})

test('hides content when condition is not met', () => {
	const { container } = render(ConditionalComponent, {
		props: { showContent: false },
	})

	expect(
		container.querySelector('[data-testid="content"]'),
	).toBeFalsy()
})
```

### Testing Async Operations

```typescript
test('loads data asynchronously', async () => {
	const { container } = render(AsyncComponent)

	// Wait for loading to complete
	await vi.waitFor(() => {
		expect(container.textContent?.includes('Loading...')).toBe(false)
	})

	expect(container.textContent?.includes('Data loaded')).toBe(true)
})
```

## Running Tests

### Available Commands

```bash
# Run all tests
pnpm test

# Run only unit tests (both client and server)
pnpm test:unit

# Run only client-side tests (Svelte components)
pnpm test:client

# Run only SSR tests (Server-side rendering)
pnpm test:ssr

# Run only server-side tests (Node.js utilities)
pnpm test:server

# Run tests in watch mode
pnpm test:unit

# Run tests with UI
pnpm test:ui

# Run tests for CI
pnpm test:ci

# Run with coverage
pnpm coverage

# Run E2E tests
pnpm test:e2e
```

### Running Specific Tests

```bash
# Run specific test file
pnpm vitest src/lib/components/Button.svelte.test.ts

# Run tests matching pattern
pnpm vitest --grep "Button component"

# Run tests in specific directory
pnpm vitest src/lib/utils/
```

## Troubleshooting

### Common Issues

#### 1. "global is not defined" Error

**Problem**: Using `global.window` in browser environment tests.

**Solution**: Use `window` directly or `Object.defineProperty`:

```typescript
// ❌ Don't use global in browser tests
global.window.scrollY = 100

// ✅ Use window directly or Object.defineProperty
Object.defineProperty(window, 'scrollY', {
	value: 100,
	writable: true,
})
```

#### 2. Tests Not Finding Elements

**Problem**: Elements not found after interactions.

**Solution**: Use `flushSync()` to ensure Svelte updates:

```typescript
button.click()
flushSync() // Ensure DOM updates are applied
expect(container.querySelector('[data-testid="result"]')).toBeTruthy()
```

#### 3. Async Test Issues

**Problem**: Tests failing due to timing issues.

**Solution**: Use `vi.waitFor()` for async operations:

```typescript
await vi.waitFor(() => {
	expect(container.textContent?.includes('Expected text')).toBe(true)
})
```

#### 4. Mock Not Working

**Problem**: Mocks not being applied correctly.

**Solution**: Ensure mocks are set up before imports:

```typescript
// ❌ Mock after import
import { myFunction } from './module'
vi.mock('./module')

// ✅ Mock before import
vi.mock('./module', () => ({
	myFunction: vi.fn(),
}))
import { myFunction } from './module'
```

### Debugging Tips

1. **Use `console.log(container.innerHTML)`** to inspect rendered HTML
2. **Use `screen.debug()`** equivalent:
   `console.log(container.outerHTML)`
3. **Check browser dev tools** when running tests with `--ui` flag
4. **Use `test.only()`** to run single tests during debugging
5. **Use `vi.waitFor()`** for timing-sensitive assertions

## Migration Notes

This project was migrated from `@testing-library/svelte` to
`vitest-browser-svelte`. Key changes:

1. **Import changes**: `render` now comes from `vitest-browser-svelte`
2. **Query methods**: Use `container.querySelector()` instead of
   `screen.getByTestId()`
3. **No more mocking**: Real browser APIs eliminate need for
   window/document mocks
4. **Better Svelte 5 support**: Native support for runes and reactive
   state

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [vitest-browser-svelte](https://github.com/vitest-dev/vitest-browser-svelte)
- [Playwright Documentation](https://playwright.dev/)
- [Svelte Testing Best Practices](https://svelte.dev/docs/testing)
- [Svelte 5 Runes](https://svelte.dev/docs/runes)

---

This testing strategy ensures comprehensive coverage of both
client-side Svelte components and server-side Node.js code, providing
a robust foundation for maintaining code quality and preventing
regressions.
