import { expect, test, vi } from 'vitest'

// Mock all dependencies before importing
vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit')
	return {
		...actual,
		redirect: (status: number, location: string) => {
			const error = new Error('REDIRECT') as any
			error.status = status
			error.location = location
			throw error
		},
	}
})

// Mock sequence function to avoid SvelteKit internals
vi.mock('@sveltejs/kit/hooks', () => ({
	sequence: (...handlers: any[]) => {
		return async ({ event, resolve }: any) => {
			for (const handler of handlers) {
				const response = await handler({ event, resolve })
				if (response instanceof Response) {
					return response
				}
			}
			return await resolve(event)
		}
	},
}))

vi.mock('$lib/themes', () => ({
	themes: ['light', 'dark', 'custom'],
}))

vi.mock('$lib/reject-patterns', () => ({
	rejected_extensions: ['.php', '.asp'],
	rejected_paths: ['/wp-admin', '/wp-login'],
}))

vi.mock('$app/environment', () => ({
	building: false,
}))

const { handle } = await import('./hooks.server')

// Helper function to create a mock event
const createMockEvent = (pathname: string, theme?: string) => ({
	url: new URL(`https://example.com${pathname}`),
	request: new Request(`https://example.com${pathname}`, {
		headers: new Headers({
			'x-forwarded-for': '127.0.0.1',
		}),
	}),
	cookies: {
		get: vi.fn().mockReturnValue(theme),
	},
	getClientAddress: () => '127.0.0.1',
	locals: {},
	params: {},
	route: { id: null },
	setHeaders: vi.fn(),
	platform: undefined,
})

// Helper function to create a mock resolve function
const createMockResolve = () =>
	vi.fn().mockImplementation(async (event, opts) => {
		let html = '<html data-theme="">'
		if (opts && opts.transformPageChunk) {
			html = opts.transformPageChunk({ html })
		}
		return html
	})

test('handle function redirects old URL structure', async () => {
	const mockEvent = createMockEvent('/2022/05/15/my-blog-post')
	const mockResolve = createMockResolve()

	try {
		await handle({ event: mockEvent, resolve: mockResolve } as any)
		expect.fail('Expected redirect to be thrown')
	} catch (error: any) {
		expect(error.status).toBe(301)
		expect(error.location).toBe('/posts/my-blog-post')
	}
})

test('handle function removes trailing slash', async () => {
	const mockEvent = createMockEvent('/posts/my-blog-post/')
	const mockResolve = createMockResolve()

	try {
		await handle({ event: mockEvent, resolve: mockResolve } as any)
		expect.fail('Expected redirect to be thrown')
	} catch (error: any) {
		expect(error.status).toBe(301)
		expect(error.location).toBe('/posts/my-blog-post')
	}
})

test('handle function rejects suspicious extensions', async () => {
	const mockEvent = createMockEvent('/malicious.php')
	const mockResolve = createMockResolve()

	const response = await handle({
		event: mockEvent,
		resolve: mockResolve,
	} as any)

	expect(response.status).toBe(204)
})

test('handle function rejects suspicious paths', async () => {
	const mockEvent = createMockEvent('/wp-admin')
	const mockResolve = createMockResolve()

	const response = await handle({
		event: mockEvent,
		resolve: mockResolve,
	} as any)

	expect(response.status).toBe(204)
})

test.skip('handle function with valid theme', async () => {
	const mockEvent = createMockEvent('/posts/my-blog-post', 'dark')
	const mockResolve = createMockResolve()

	const result = await handle({
		event: mockEvent,
		resolve: mockResolve,
	} as any)

	expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme')
	expect(mockResolve).toHaveBeenCalledWith(
		mockEvent,
		expect.objectContaining({
			transformPageChunk: expect.any(Function),
		}),
	)

	expect(result).toBe('<html data-theme="dark">')
})

test('handle function with invalid theme', async () => {
	const mockEvent = createMockEvent(
		'/posts/my-blog-post',
		'invalid-theme',
	)
	const mockResolve = createMockResolve()

	const result = await handle({
		event: mockEvent,
		resolve: mockResolve,
	} as any)

	expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme')
	expect(mockResolve).toHaveBeenCalledWith(
		mockEvent,
		expect.objectContaining({
			transformPageChunk: expect.any(Function),
		}),
	)

	expect(result).toBe('<html data-theme="">')
})

test('handle function with no theme', async () => {
	const mockEvent = createMockEvent('/posts/my-blog-post')
	const mockResolve = createMockResolve()

	const result = await handle({
		event: mockEvent,
		resolve: mockResolve,
	} as any)

	expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme')
	expect(mockResolve).toHaveBeenCalledWith(
		mockEvent,
		expect.objectContaining({
			transformPageChunk: expect.any(Function),
		}),
	)

	expect(result).toBe('<html data-theme="">')
})
