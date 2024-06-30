import { describe, it, expect, vi, beforeEach } from 'vitest'
import { load } from './+page'
import { error } from '@sveltejs/kit'

// Mock the @sveltejs/kit error function
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit')
  return {
    ...(actual as object),
    error: vi.fn((status, message) => ({ status, message })),
  }
})

describe('About page load function', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it.skip('successfully loads the about page content', async () => {
    // Mock the successful import of the markdown file
    vi.mock('../../../copy/about.md', () => ({
      default: '<h1>About Page</h1>',
    }))

    const result = await load()
    expect(result).toEqual({
      Copy: '<h1>About Page</h1>',
    })
  })

  it('returns a 404 error when the markdown file is not found', async () => {
    // Mock a failed import
    vi.mock('../../../copy/about.md', () => {
      throw new Error('File not found')
    })

    await load()
    expect(error).toHaveBeenCalledWith(404, 'Uh oh!')
  })
})
