import { describe, expect, it } from 'vitest'
import { update_toc_visibility } from './update-toc-visibility'

describe('update_toc_visibility', () => {
	it('should return true when window.scrollY is less than end_of_copy.offsetTop + offset', async () => {
		// Create a tall element to enable scrolling in the test environment
		const tallElement = document.createElement('div')
		tallElement.style.height = '2000px'
		document.body.appendChild(tallElement)

		// Use real browser scrolling and wait for it to complete
		window.scrollTo({ top: 100, behavior: 'instant' })

		// Wait for scroll to complete
		await new Promise((resolve) => {
			const checkScroll = () => {
				if (window.scrollY >= 100) {
					resolve(undefined)
				} else {
					requestAnimationFrame(checkScroll)
				}
			}
			checkScroll()
		})

		const end_of_copy = { offsetTop: 200 }
		const offset = 100 // 100 < (200 + 100) = 300, so should return true

		const result = update_toc_visibility(
			end_of_copy as HTMLElement,
			offset,
		)

		expect(result).toBe(true)

		// Clean up
		document.body.removeChild(tallElement)
		window.scrollTo({ top: 0, behavior: 'instant' })
	})

	it('should return false when window.scrollY is greater than or equal to end_of_copy.offsetTop + offset', async () => {
		// Create a tall element to enable scrolling in the test environment
		const tallElement = document.createElement('div')
		tallElement.style.height = '2000px'
		document.body.appendChild(tallElement)

		// Use real browser scrolling and wait for it to complete
		window.scrollTo({ top: 350, behavior: 'instant' })

		// Wait for scroll to complete
		await new Promise((resolve) => {
			const checkScroll = () => {
				if (window.scrollY >= 350) {
					resolve(undefined)
				} else {
					requestAnimationFrame(checkScroll)
				}
			}
			checkScroll()
		})

		const end_of_copy = { offsetTop: 200 }
		const offset = 100 // 350 >= (200 + 100) = 300, so should return false

		const result = update_toc_visibility(
			end_of_copy as HTMLElement,
			offset,
		)

		expect(result).toBe(false)

		// Clean up
		document.body.removeChild(tallElement)
		window.scrollTo({ top: 0, behavior: 'instant' })
	})
})
