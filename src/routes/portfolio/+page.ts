import { error } from '@sveltejs/kit'

export const load = async () => {
  try {
    // @ts-ignore
    const Copy = await import(`../../../copy/portfolio.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    error(404, 'Uh oh!');
  }
}
