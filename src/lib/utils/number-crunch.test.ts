import { describe, expect, it } from 'vitest'
import { number_crunch } from './number-crunch'

describe('number_crunch', () => {
  it('should return string value for input as string', () => {
    const input = '1000'
    const result = number_crunch(input)

    expect(result).toEqual('1000')
  })

  it('should return updated value for input as number >= 1000000', () => {
    const input = 10000000
    const result = number_crunch(input)

    expect(result).toEqual('10.00m')
  })

  it('should return updated value for input as number >= 1000', () => {
    const input = 5000
    const result = number_crunch(input)

    expect(result).toEqual('5.00k')
  })

  it('should return updated value for input as number < 1000', () => {
    const input = 500
    const result = number_crunch(input)

    expect(result).toEqual(500)
  })
})
