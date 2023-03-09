// import { describe, expect, test } from 'vitest'
// import { getPosts } from './get-posts'

// describe('getPosts', () => {
//   test('returns an array of posts sorted by date', () => {
//     const result = getPosts()
//     const array_length = result.length
//     expect(result).toHaveLength(array_length)
//     expect(
//       new Date(result[0].metadata.date).getTime()
//     ).toBeGreaterThan(new Date(result[1].metadata.date).getTime())
//   })

//   test('each post contains metadata and a component', () => {
//     const result = getPosts()
//     expect(result).toBeInstanceOf(Array)
//     const array_length = result.length
//     expect(result).toHaveLength(array_length)
//     expect(result[0].metadata).toBeDefined()
//     expect(result[0].component).toBeDefined()
//     expect(result[1].metadata).toBeDefined()
//     expect(result[1].component).toBeDefined()
//   })
// })
