import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { get_date_range } from './utils'
import * as dateFns from 'date-fns'

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    startOfDay: vi.fn(),
    endOfDay: vi.fn(),
    startOfMonth: vi.fn(),
    endOfMonth: vi.fn(),
    startOfYear: vi.fn(),
    endOfYear: vi.fn(),
    formatISO: vi.fn(date => date.toISOString()),
  }
})

describe('get_date_range function', () => {
  const mockDate = new Date('2023-06-15T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)

    vi.mocked(dateFns.startOfDay).mockReturnValue(
      new Date('2023-06-15T00:00:00Z'),
    )
    vi.mocked(dateFns.endOfDay).mockReturnValue(
      new Date('2023-06-15T23:59:59Z'),
    )
    vi.mocked(dateFns.startOfMonth).mockReturnValue(
      new Date('2023-06-01T00:00:00Z'),
    )
    vi.mocked(dateFns.endOfMonth).mockReturnValue(
      new Date('2023-06-30T23:59:59Z'),
    )
    vi.mocked(dateFns.startOfYear).mockReturnValue(
      new Date('2023-01-01T00:00:00Z'),
    )
    vi.mocked(dateFns.endOfYear).mockReturnValue(
      new Date('2023-12-31T23:59:59Z'),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return correct date range for day period', () => {
    const range = get_date_range('day')
    expect(range).toEqual([
      '2023-06-15T00:00:00.000Z',
      '2023-06-15T23:59:59.000Z',
    ])
    expect(dateFns.startOfDay).toHaveBeenCalledWith(mockDate)
    expect(dateFns.endOfDay).toHaveBeenCalledWith(mockDate)
  })

  it('should return correct date range for month period', () => {
    const range = get_date_range('month')
    expect(range).toEqual([
      '2023-06-01T00:00:00.000Z',
      '2023-06-30T23:59:59.000Z',
    ])
    expect(dateFns.startOfMonth).toHaveBeenCalledWith(mockDate)
    expect(dateFns.endOfMonth).toHaveBeenCalledWith(mockDate)
  })

  it('should return correct date range for year period', () => {
    const range = get_date_range('year')
    expect(range).toEqual([
      '2023-01-01T00:00:00.000Z',
      '2023-12-31T23:59:59.000Z',
    ])
    expect(dateFns.startOfYear).toHaveBeenCalledWith(mockDate)
    expect(dateFns.endOfYear).toHaveBeenCalledWith(mockDate)
  })

  it('should throw an error for unknown period', () => {
    expect(() => get_date_range('decade')).toThrow(
      'Unknown period: decade',
    )
  })
})
