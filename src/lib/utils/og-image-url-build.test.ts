import { og_image_url } from './og-image-url-build'
import { object_to_query_params } from './object-to-query-params'
import { describe, expect, it } from 'vitest'

describe('og_image_url', () => {
	it('should return a valid og:image url', () => {
		const author = 'John Doe'
		const website = 'https://example.com'
		const title = 'My awesome blog post'
		const expectedQueryParams = object_to_query_params({
			title,
			author,
			website,
		})
		const expectedUrl = `https://ogimggen.vercel.app/og${expectedQueryParams}`

		const result = og_image_url(author, website, title)

		expect(result).toEqual(expectedUrl)
	})
})
