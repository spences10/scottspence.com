import { describe, expect, it, vi } from 'vitest'
import { get_headings } from './get-headings'

function create_mock_heading(
	id: string,
	textContent: string,
): HTMLElement {
	const mock_heading = document.createElement('h2')
	mock_heading.id = id
	mock_heading.textContent = textContent
	return mock_heading
}

describe('get_headings', () => {
	it('should return an array of headings', async () => {
		const mock_headings = [
			create_mock_heading('heading-1', 'Heading 1'),
			create_mock_heading('heading-2', 'Heading 2'),
		]

		const query_selector_all_spy = vi.spyOn(
			document,
			'querySelectorAll',
		)
		query_selector_all_spy.mockReturnValue(mock_headings as any)

		const result = await get_headings()

		expect(result).toEqual([
			{ label: 'Heading 1', href: '#heading-1' },
			{ label: 'Heading 2', href: '#heading-2' },
		])

		query_selector_all_spy.mockRestore()
	})
})
