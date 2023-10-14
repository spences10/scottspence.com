import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { time_to_seconds } from '$lib/utils/time-to-seconds.js'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async ({ fetch, cookies }): Promise<Response> => {
  const block_fathom = cookies.get('block_fathom') !== 'false'

  console.log('=====================')
  console.log(`Block Fathom: Current Visitors: `, block_fathom)
  console.log('=====================')
  if (block_fathom) {
    // Fathom script is blocked, return early to avoid API call
    return json(
      {
        visitors: {},
        message: 'Fathom script is blocked on the client-side.',
      },
      {
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    )
  }

  const cache_duration = time_to_seconds({ minutes: 1 })

  const visitors = await fetch_fathom_data(
    fetch,
    `current_visitors`,
    { site_id: PUBLIC_FATHOM_ID, detailed: true },
    cache_duration,
    `current_visitors`,
    block_fathom,
  )

  if (visitors && visitors.total != null && visitors.content) {
    return json(
      {
        visitors,
      },
      {
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    )
  } else {
    console.error('Visitors API returned data in unexpected format.')
    return json({ visitors: {} })
  }
}
