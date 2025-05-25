import { describe, expect, it } from 'vitest'
import { update_toc_visibility } from './update-toc-visibility'

describe('update_toc_visibility', () => {
	it('should return true when window.scrollY is less than end_of_copy.offsetTop + offset', () => {
		// Set window.scrollY using Object.defineProperty since it's read-only
		Object.defineProperty(window, 'scrollY', {
			value: 100,
			writable: true,
		})
		const end_of_copy = { offsetTop: 200 }
		const offset = 100

		const result = update_toc_visibility(
			end_of_copy as HTMLElement,
			offset,
		)

		expect(result).toBe(true)
	})

	it('should return false when window.scrollY is greater than or equal to end_of_copy.offsetTop + offset', () => {
		// Set window.scrollY using Object.defineProperty since it's read-only
		Object.defineProperty(window, 'scrollY', {
			value: 300,
			writable: true,
		})
		const end_of_copy = { offsetTop: 200 }
		const offset = 0

		const result = update_toc_visibility(
			end_of_copy as HTMLElement,
			offset,
		)

		expect(result).toBe(false)
	})
})
