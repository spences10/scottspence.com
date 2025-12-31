import { describe, expect, it } from 'vitest'
import { og_image_url } from './og-image-url-build'

describe('og_image_url', () => {
	it('should build URL with correct base and encoded parameters', () => {
		const author = 'John Doe'
		const website = 'https://example.com'
		const title = 'My awesome blog post'

		const result = og_image_url(author, website, title)

		expect(result).toContain('https://og.scott.garden/og?')
		expect(result).toContain('title=My%20awesome%20blog%20post')
		expect(result).toContain('author=John%20Doe')
		expect(result).toContain('website=https%3A%2F%2Fexample.com')
	})

	it('should use default website when empty', () => {
		const result = og_image_url('Author', '', 'Title')

		expect(result).toContain('website=scottspence.com')
	})
})
