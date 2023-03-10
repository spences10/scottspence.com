import { describe, expect, it } from 'vitest'
import { shuffle_array } from './shuffle-array'

describe('shuffle_array', () => {
  it('should shuffle an array of numbers', () => {
    const input = [1, 2, 3, 4, 5]
    const output = shuffle_array(input)

    // Ensure the output array contains the same elements as the input array
    expect(output).toContain(1)
    expect(output).toContain(2)
    expect(output).toContain(3)
    expect(output).toContain(4)
    expect(output).toContain(5)

    // Ensure the output array is not the same as the input array
    expect(output).not.toEqual(input)

    // Ensure the output array is a permutation of the input array
    expect(output.sort()).toEqual(input.sort())
  })

  it('should shuffle an array of objects', () => {
    const input = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
      { id: 4, name: 'Dave' },
    ]
    const output = shuffle_array(input)

    // Ensure the output array contains the same elements as the input array
    expect(output).toContainEqual({ id: 1, name: 'Alice' })
    expect(output).toContainEqual({ id: 2, name: 'Bob' })
    expect(output).toContainEqual({ id: 3, name: 'Charlie' })
    expect(output).toContainEqual({ id: 4, name: 'Dave' })

    // Ensure the output array is not the same as the input array
    expect(output).not.toEqual(input)

    // Ensure the output array is a permutation of the input array
    expect(output.sort((a, b) => a.id - b.id)).toEqual(
      input.sort((a, b) => a.id - b.id)
    )

    // Ensure the output array is a different order than the input array
    expect(output).not.toEqual([...input].reverse())
  })
})
