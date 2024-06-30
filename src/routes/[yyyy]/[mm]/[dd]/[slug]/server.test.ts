import { redirect } from '@sveltejs/kit'
import { describe, expect, it, vi } from 'vitest'
import { GET } from './+server'

// Mock @sveltejs/kit redirect function
vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => ({ status, location })),
  error: vi.fn((status, message) => ({ status, message })),
}))

describe('GET', () => {
  it('redirects to the correct URL', async () => {
    const mockParams = { slug: 'test-post' }
    await GET({ params: mockParams } as any)

    expect(redirect).toHaveBeenCalledWith(301, '/posts/test-post')
  })

  it('uses the provided slug in the redirect URL', async () => {
    const mockParams = { slug: 'another-test-post' }
    await GET({ params: mockParams } as any)

    expect(redirect).toHaveBeenCalledWith(
      301,
      '/posts/another-test-post',
    )
  })

  it('calls redirect with correct status code', async () => {
    const mockParams = { slug: 'example-post' }
    await GET({ params: mockParams } as any)

    expect(redirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    )
    expect(redirect).toHaveBeenCalledWith(301, expect.anything())
  })

  it('handles slugs with special characters', async () => {
    const mockParams = {
      slug: 'test-post-with-special-chars!@#$%^&*()',
    }
    await GET({ params: mockParams } as any)

    expect(redirect).toHaveBeenCalledWith(
      301,
      '/posts/test-post-with-special-chars!@#$%^&*()',
    )
  })
})
