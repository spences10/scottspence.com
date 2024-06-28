import { expect, test, vi } from 'vitest'
import { handle } from './hooks.server'

vi.mock('$lib/themes', () => ({
  themes: ['light', 'dark', 'custom'],
}))

test('handle function with valid theme', async () => {
  const mockEvent = {
    cookies: {
      get: vi.fn().mockReturnValue('dark'),
    },
  }

  const mockResolve = vi
    .fn()
    .mockImplementation(async (event, opts) => {
      if (opts && opts.transformPageChunk) {
        return opts.transformPageChunk({
          html: '<html data-theme="">',
        })
      }
      return '<html data-theme="">'
    })

  await handle({ event: mockEvent, resolve: mockResolve } as any)

  expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme')
  expect(mockResolve).toHaveBeenCalledWith(
    mockEvent,
    expect.objectContaining({
      transformPageChunk: expect.any(Function),
    }),
  )

  const result = await mockResolve.mock.results[0].value
  expect(result).toBe('<html data-theme="dark">')
})

test('handle function with invalid theme', async () => {
  const mockEvent = {
    cookies: {
      get: vi.fn().mockReturnValue('invalid-theme'),
    },
  }

  const mockResolve = vi.fn().mockResolvedValue('resolved')

  await handle({ event: mockEvent, resolve: mockResolve } as any)

  expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme')
  expect(mockResolve).toHaveBeenCalledWith(
    mockEvent,
    expect.objectContaining({
      transformPageChunk: expect.any(Function),
    }),
  )
})

test('handle function with no theme', async () => {
  const mockEvent = {
    cookies: {
      get: vi.fn().mockReturnValue(null),
    },
  }

  const mockResolve = vi.fn().mockResolvedValue('resolved')

  await handle({ event: mockEvent, resolve: mockResolve } as any)

  expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme')
  expect(mockResolve).toHaveBeenCalledWith(
    mockEvent,
    expect.objectContaining({
      transformPageChunk: expect.any(Function),
    }),
  )
})
