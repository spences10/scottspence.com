import { format } from 'date-fns'
import { afterEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import DateUpdated from './date-updated.svelte'

vi.mock('date-fns', () => ({
	format: vi.fn(),
}))

// Clean up after each test
afterEach(() => {
	vi.resetAllMocks()
})

test('renders formatted date with default size', async () => {
	const mockDate = '2023-06-15'
	const mockFormattedDate = 'June 15th 2023'

	vi.mocked(format).mockReturnValue(mockFormattedDate)

	const { container } = render(DateUpdated, { date: mockDate })

	await vi.waitFor(() => {
		expect(container.textContent?.includes(mockFormattedDate)).toBe(
			true,
		)
		const element = container.querySelector('.text-base')
		expect(element).toBeDefined()
	})

	expect(format).toHaveBeenCalledWith(
		new Date(mockDate),
		'MMMM do yyyy',
	)
})

test('renders formatted date with small size', async () => {
	const mockDate = '2023-06-15'
	const mockFormattedDate = 'June 15th 2023'

	vi.mocked(format).mockReturnValue(mockFormattedDate)

	const { container } = render(DateUpdated, {
		date: mockDate,
		small: 'true',
	})

	await vi.waitFor(() => {
		expect(container.textContent?.includes(mockFormattedDate)).toBe(
			true,
		)
		const element = container.querySelector('.text-xs')
		expect(element).toBeDefined()
	})

	expect(format).toHaveBeenCalledWith(
		new Date(mockDate),
		'MMMM do yyyy',
	)
})

test('renders current date when date prop is null', async () => {
	const mockCurrentDate = new Date('2023-06-15')
	vi.setSystemTime(mockCurrentDate)

	const mockFormattedDate = 'June 15th 2023'
	vi.mocked(format).mockReturnValue(mockFormattedDate)

	const { container } = render(DateUpdated, { date: null })

	await vi.waitFor(() => {
		expect(container.textContent?.includes(mockFormattedDate)).toBe(
			true,
		)
	})

	expect(format).toHaveBeenCalledWith(mockCurrentDate, 'MMMM do yyyy')

	vi.useRealTimers()
})

test('renders current date when date prop is undefined', async () => {
	const mockCurrentDate = new Date('2023-06-15')
	vi.setSystemTime(mockCurrentDate)

	const mockFormattedDate = 'June 15th 2023'
	vi.mocked(format).mockReturnValue(mockFormattedDate)

	const { container } = render(DateUpdated, { date: undefined })

	await vi.waitFor(() => {
		expect(container.textContent?.includes(mockFormattedDate)).toBe(
			true,
		)
	})

	expect(format).toHaveBeenCalledWith(mockCurrentDate, 'MMMM do yyyy')

	vi.useRealTimers()
})
