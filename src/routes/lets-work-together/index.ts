export { default as BlogPost } from './blog-post.svelte'
export { default as Rate } from './rate.svelte'
export { default as Video } from './video.svelte'
export { default as Workshop } from './workshop.svelte'

export const locale_string = (number: number) =>
  number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })
