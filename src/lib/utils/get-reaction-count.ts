import { reactions } from '$lib/reactions-config'
import { cache_get } from '$lib/redis'

export const get_reaction_count_data = async (
  pathname: string,
): Promise<{ count: ReactionCount }> => {
  const reaction_types = reactions.map(reaction => reaction.type)
  const promises = reaction_types.map(reaction =>
    cache_get(`reactions:${pathname}:${reaction}`),
  )
  const results = await Promise.all(promises)

  const count = {} as ReactionCount
  reaction_types.forEach((reaction, index) => {
    count[reaction] = Number(results[index]) || 0
  })

  return { count }
}
