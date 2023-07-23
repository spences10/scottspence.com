import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async ({ url, fetch }): Promise<Response> => {
  const cache_duration = parseInt(
    url.searchParams.get('cache_duration') ?? '900',
    10,
  )

  const visitors = await fetch_fathom_data(
    fetch,
    `current_visitors`,
    { site_id: PUBLIC_FATHOM_ID, detailed: true },
    cache_duration,
    `current_visitors`,
  )

  if (visitors && visitors.visitors) {
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
