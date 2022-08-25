import { error } from '@sveltejs/kit'

export const load = async () => {
  try {
    const Copy = await import(`../../../copy/newsletter.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
