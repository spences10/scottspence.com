// import slugify from 'slugify'
// import { describe, expect, it } from 'vitest'
// import { getPostTags } from '../get-post-tags'

// describe('getPostTags', () => {
//   it('returns an object with tags and postsByTag properties', () => {
//     const result = getPostTags()

//     expect(result).toHaveProperty('tags')
//     expect(result).toHaveProperty('postsByTag')
//   })

//   it('returns an object with tags in alphabetical order', () => {
//     const result = getPostTags()

//     expect(result.tags).toEqual(result.tags.sort())
//   })

//   it('tags are slugified', () => {
//     const result = getPostTags()

//     Object.keys(result.postsByTag).forEach(tag => {
//       expect(tag).toEqual(slugify(tag))
//     })
//   })

//   it('each tag in postsByTag has at least one associated post', () => {
//     const result = getPostTags()

//     Object.keys(result.postsByTag).forEach(tag => {
//       expect(result.postsByTag[tag].length).toBeGreaterThan(0)
//     })
//   })

//   it('posts in postsByTag have the correct tag', () => {
//     const result = getPostTags()

//     Object.keys(result.postsByTag).forEach(tag => {
//       result.postsByTag[tag].forEach(post => {
//         expect(post.metadata.tags).toContain(tag)
//       })
//     })
//   })

//   it('posts in postsByTag are not private', () => {
//     const result = getPostTags()

//     Object.keys(result.postsByTag).forEach(tag => {
//       result.postsByTag[tag].forEach(post => {
//         expect(post.metadata.isPrivate).toBeFalsy()
//       })
//     })
//   })
// })
