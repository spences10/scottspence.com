import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  const slugs = ['bio-corporate', 'bio-fun']
  try {
    const [corporateCopy, funCopy] = await Promise.all(
      slugs.map(slug => import(`../../../copy/${slug}.md`))
    )
    return {
      CorporateCopy: corporateCopy.default,
      FunCopy: funCopy.default,
    }
  } catch (e) {
    throw error(404, 'Uh oh!')
  }
}
