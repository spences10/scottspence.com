import { error } from '@sveltejs/kit'

export const load = async () => {
  const slug = 'about'
  try {
    const Copy = await import(`../../../copy/${slug}.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
