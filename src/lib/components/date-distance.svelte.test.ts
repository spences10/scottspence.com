import { cleanup, render, screen } from '@testing-library/svelte'
import { formatDistanceStrict } from 'date-fns'
import { afterEach, expect, test, vi } from 'vitest'
import DateDistance from './date-distance.svelte'

// Mock date-fns formatDistanceStrict function
vi.mock('date-fns', () => ({
	formatDistanceStrict: vi.fn(),
}))

// Clean up after each test
afterEach(() => {
	cleanup()
	vi.resetAllMocks()
})

test('renders formatted date distance', async () => {
	const mockDate = '2023-01-01'
	const mockFormattedDistance = '2 months ago'

	vi.mocked(formatDistanceStrict).mockReturnValue(mockFormattedDistance)

	render(DateDistance, { date: mockDate })

	const element = screen.getByTestId('date-distance')
	expect(element.textContent).toBe(mockFormattedDistance)

	expect(formatDistanceStrict).toHaveBeenCalledWith(
		expect.any(Date),
		new Date(mockDate),
	)
})

test('updates formatted distance when date prop changes', async () => {
	const initialDate = '2023-01-01'
	const updatedDate = '2023-06-01'
	const initialFormattedDistance = '6 months ago'
	const updatedFormattedDistance = '1 month ago'

	vi.mocked(formatDistanceStrict)
		.mockReturnValueOnce(initialFormattedDistance)
		.mockReturnValueOnce(updatedFormattedDistance)

	const { rerender } = render(DateDistance, { date: initialDate })

	const element = screen.getByTestId('date-distance')

	// Wait for the initial render to complete
	await vi.waitFor(() => {
		expect(element.textContent).toBe(initialFormattedDistance)
	})

	// Update the date prop by re-rendering the component
	await rerender({ date: updatedDate })

	// Wait for the component to update
	await vi.waitFor(() => {
		expect(element.textContent).toBe(updatedFormattedDistance)
	})

	expect(formatDistanceStrict).toHaveBeenCalledTimes(2)
	expect(formatDistanceStrict).toHaveBeenNthCalledWith(
		1,
		expect.any(Date),
		new Date(initialDate),
	)
	expect(formatDistanceStrict).toHaveBeenNthCalledWith(
		2,
		expect.any(Date),
		new Date(updatedDate),
	)
})
