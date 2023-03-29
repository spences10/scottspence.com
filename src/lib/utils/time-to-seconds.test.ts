import { describe, expect, it } from 'vitest'
import { time_to_seconds } from './time-to-seconds'

describe('time_to_seconds', () => {
  it('should return 0 when given no input', () => {
    expect(time_to_seconds({})).toEqual(0)
  })

  it('should return the correct number of seconds for given hours, minutes, and seconds', () => {
    expect(time_to_seconds({ hours: 1 })).toEqual(3600)
    expect(time_to_seconds({ minutes: 1 })).toEqual(60)
    expect(time_to_seconds({ seconds: 1 })).toEqual(1)
    expect(
      time_to_seconds({ hours: 2, minutes: 30, seconds: 45 })
    ).toEqual(9045)
  })

  it('should return the correct number of seconds for negative hours, minutes, and seconds', () => {
    expect(time_to_seconds({ hours: -1 })).toEqual(-3600)
    expect(time_to_seconds({ minutes: -1 })).toEqual(-60)
    expect(time_to_seconds({ seconds: -1 })).toEqual(-1)
    expect(
      time_to_seconds({ hours: -1, minutes: -30, seconds: -15 })
    ).toEqual(-5415)
  })
})
