import { describe, expect, it } from 'vitest'
import { get_padding } from './get-padding'

describe('get_padding', () => {
  it('should return padding for 1:1 aspect ratio', () => {
    const aspectRatio = '1:1'
    const result = get_padding(aspectRatio)

    expect(result).toEqual(`padding-top: 100%;`)
  })

  it('should return padding for 16:9 aspect ratio', () => {
    const aspectRatio = '16:9'
    const result = get_padding(aspectRatio)

    expect(result).toEqual(`padding-top: 56.25%;`)
  })

  it('should return padding for 4:3 aspect ratio', () => {
    const aspectRatio = '4:3'
    const result = get_padding(aspectRatio)

    expect(result).toEqual(`padding-top: 75%;`)
  })

  it('should return padding for 3:2 aspect ratio', () => {
    const aspectRatio = '3:2'
    const result = get_padding(aspectRatio)

    expect(result).toEqual(`padding-top: 66.66%;`)
  })

  it('should return padding for 8.5 aspect ratio', () => {
    const aspectRatio = '8.5'
    const result = get_padding(aspectRatio)

    expect(result).toEqual(`padding-top: 62.5%;`)
  })

  it('should return undefined for unsupported aspect ratio', () => {
    const aspectRatio = '5:4'
    const result = get_padding(aspectRatio)

    expect(result).toEqual(undefined)
  })
})
