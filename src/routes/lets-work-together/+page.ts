import { error } from '@sveltejs/kit'

export const load = async () => {
  const slug = 'lets-work-together'
  try {
    const Copy = await import(`../../../copy/${slug}.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
