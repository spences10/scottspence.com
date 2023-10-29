import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data, handle_block_fathom } from '$lib/fathom'
import { time_to_seconds } from '$lib/utils/time-to-seconds.js'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async ({ fetch, cookies }): Promise<Response> => {
  const block_fathom = cookies.get('block_fathom') !== 'false'

  const visitors = await fetch_fathom_data(
    fetch,
    `current_visitors`,
    { site_id: PUBLIC_FATHOM_ID, detailed: true },
    time_to_seconds({ minutes: 1 }),
    `current_visitors`,
    block_fathom,
  )

  if (block_fathom) {
    const response = handle_block_fathom(visitors, 'visitors')

    if (response) {
      return json(response.body, { headers: response.headers })
    }
  }

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
