import { error } from '@sveltejs/kit'

export const load = async () => {
  try {
    // @ts-ignore
    const Copy = await import(`../../../copy/privacy-policy.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
