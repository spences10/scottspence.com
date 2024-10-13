import {
	cleanup,
	render,
	screen,
} from '@testing-library/svelte/svelte5'
import { format } from 'date-fns'
import { afterEach, expect, test, vi } from 'vitest'
import DateUpdated from './date-updated.svelte'

vi.mock('date-fns', () => ({
	format: vi.fn(),
}))

// Clean up after each test
afterEach(() => {
	cleanup()
	vi.resetAllMocks()
})

test('renders formatted date with default size', async () => {
	const mockDate = '2023-06-15'
	const mockFormattedDate = 'June 15th 2023'

	vi.mocked(format).mockReturnValue(mockFormattedDate)

	await vi.waitFor(async () => {
		render(DateUpdated, { date: mockDate })
	})

	const element = screen.getByText(mockFormattedDate)
	expect(element).toBeDefined()
	expect(element.classList.contains('text-base')).toBe(true)

	expect(format).toHaveBeenCalledWith(
		new Date(mockDate),
		'MMMM do yyyy',
	)
})

test('renders formatted date with small size', async () => {
	const mockDate = '2023-06-15'
	const mockFormattedDate = 'June 15th 2023'

	vi.mocked(format).mockReturnValue(mockFormattedDate)

	await vi.waitFor(async () => {
		render(DateUpdated, { date: mockDate, small: 'true' })
	})

	const element = screen.getByText(mockFormattedDate)
	expect(element).toBeDefined()
	expect(element.classList.contains('text-xs')).toBe(true)

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

	await vi.waitFor(async () => {
		render(DateUpdated, { date: null })
	})

	const element = screen.getByText(mockFormattedDate)
	expect(element).toBeDefined()

	expect(format).toHaveBeenCalledWith(mockCurrentDate, 'MMMM do yyyy')

	vi.useRealTimers()
})

test('renders current date when date prop is undefined', async () => {
	const mockCurrentDate = new Date('2023-06-15')
	vi.setSystemTime(mockCurrentDate)

	const mockFormattedDate = 'June 15th 2023'
	vi.mocked(format).mockReturnValue(mockFormattedDate)

	await vi.waitFor(async () => {
		render(DateUpdated, { date: undefined })
	})

	const element = screen.getByText(mockFormattedDate)
	expect(element).toBeDefined()

	expect(format).toHaveBeenCalledWith(mockCurrentDate, 'MMMM do yyyy')

	vi.useRealTimers()
})
