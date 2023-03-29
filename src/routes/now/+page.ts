import { error } from '@sveltejs/kit'

export const load = async () => {
  let slug = 'now'
  try {
    const Copy = await import(`../../../copy/${slug}.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
