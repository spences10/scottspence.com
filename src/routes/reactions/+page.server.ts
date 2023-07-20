import { ratelimit, redis } from '$lib/redis.js'
import { fail } from '@sveltejs/kit'

export const actions = {
  default: async ({ request, url, getClientAddress }) => {
    const ip = getClientAddress()
    const rate_limit_attempt = await ratelimit.limit(ip)

    if (!rate_limit_attempt.success) {
      const time_remaining = Math.floor(
        (rate_limit_attempt.reset - new Date().getTime()) / 1000,
      )

      return fail(429, {
        error: `Rate limit exceeded. Try again in ${time_remaining} seconds`,
        time_remaining,
      })
    }

    const data = await request.formData()
    const reaction = data.get('reaction')
    const path = url.searchParams.get('path')

    const redis_key = `reactions:${path}:${reaction}`

    const result = await redis.incr(redis_key)

    return {
      success: true,
      status: 200,
      reaction: reaction,
      path: path,
      count: result,
    }
  },
}
