import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  try {
    // @ts-ignore
    const Copy = await import(`../../../copy/portfolio.md`)
    return {
      Copy: Copy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
