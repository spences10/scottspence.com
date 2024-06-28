import {
  cleanup,
  render,
  screen,
} from '@testing-library/svelte/svelte5'
import { formatDistance } from 'date-fns'
import { afterEach, expect, test, vi } from 'vitest'
import DateDistance from './date-distance.svelte'

// Mock date-fns formatDistance function
vi.mock('date-fns', () => ({
  formatDistance: vi.fn(),
}))

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

test('renders formatted date distance', async () => {
  const mockDate = '2023-01-01'
  const mockFormattedDistance = '2 months ago'

  vi.mocked(formatDistance).mockReturnValue(mockFormattedDistance)

  render(DateDistance, { date: mockDate })

  const element = screen.getByTestId('date-distance')
  expect(element.textContent).toBe(mockFormattedDistance)

  expect(formatDistance).toHaveBeenCalledWith(
    expect.any(Date),
    new Date(mockDate),
  )
})

test.skip('updates formatted distance when date prop changes', async () => {
  const initialDate = '2023-01-01'
  const updatedDate = '2023-06-01'
  const initialFormattedDistance = '6 months ago'
  const updatedFormattedDistance = '1 month ago'

  vi.mocked(formatDistance)
    .mockReturnValueOnce(initialFormattedDistance)
    .mockReturnValueOnce(updatedFormattedDistance)

  const { component } = render(DateDistance, {
    date: initialDate,
  })

  const element = screen.getByTestId('date-distance')
  expect(element.textContent).toBe(initialFormattedDistance)

  // Update the date prop
  component.date = updatedDate

  // Wait for the component to update
  await vi.waitFor(() => {
    expect(element.textContent).toBe(updatedFormattedDistance)
  })

  expect(formatDistance).toHaveBeenCalledTimes(2)
  expect(formatDistance).toHaveBeenNthCalledWith(
    1,
    expect.any(Date),
    new Date(initialDate),
  )
  expect(formatDistance).toHaveBeenNthCalledWith(
    2,
    expect.any(Date),
    new Date(updatedDate),
  )
})
