import { expect, test, vi } from 'vitest'
import { handle } from './hooks.server'

vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit')
	return {
		...actual,
		redirect: vi.fn((status, location) => {
			throw { status, location }
		}),
	}
})

vi.mock('$lib/themes', () => ({
	themes: ['light', 'dark', 'custom'],
}))

vi.mock('$lib/reject-patterns', () => ({
	rejected_extensions: ['.php', '.asp'],
	rejected_paths: ['/wp-admin', '/wp-login'],
}))

// Helper function to create a mock event
const createMockEvent = (pathname: string, theme?: string) => ({
	url: new URL(`https://example.com${pathname}`),
	cookies: {
		get: vi.fn().mockReturnValue(theme),
	},
})

// Helper function to create a mock resolve function
const createMockResolve = () =>
	vi.fn().mockImplementation(async (event, opts) => {
		if (opts && opts.transformPageChunk) {
			return opts.transformPageChunk({
				html: '<html data-theme="">',
			})
		}
		return '<html data-theme="">'
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

	try {
		await handle({ event: mockEvent, resolve: mockResolve } as any)
		expect.fail('Expected redirect to be thrown')
	} catch (error: any) {
		expect(error.status).toBe(302)
		expect(error.location).toBe('https://www.google.com')
	}
})

test('handle function rejects suspicious paths', async () => {
	const mockEvent = createMockEvent('/wp-admin')
	const mockResolve = createMockResolve()

	try {
		await handle({ event: mockEvent, resolve: mockResolve } as any)
		expect.fail('Expected redirect to be thrown')
	} catch (error: any) {
		expect(error.status).toBe(302)
		expect(error.location).toBe('https://www.google.com')
	}
})

test('handle function with valid theme', async () => {
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
