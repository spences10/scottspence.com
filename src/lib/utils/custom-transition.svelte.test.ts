import { describe, expect, test } from 'vitest'
import { scale_and_fade } from './custom-transition'

describe('scale_and_fade', () => {
	const node = document.createElement('div')

	test('returns an object with delay, duration, and css properties', () => {
		const result = scale_and_fade(node, {
			delay: 500,
			duration: 1000,
		})
		expect(result).toEqual(
			expect.objectContaining({
				delay: 500,
				duration: 1000,
				css: expect.any(Function),
			}),
		)
	})

	test('returns css property with opacity and transform properties', () => {
		const result = scale_and_fade(node, {
			delay: 500,
			duration: 1000,
		})
		const css = result.css(0.5)
		expect(css).toContain('opacity: 0.5')
		expect(css).toContain('transform: scale(0.5)')
	})

	test('returns css property with correct opacity and transform values', () => {
		const result = scale_and_fade(node, {
			delay: 500,
			duration: 1000,
		})
		const css = result.css(0.8)
		expect(css).toContain('opacity: 0.8')
		expect(css).toContain('transform: scale(0.8)')
	})
})
