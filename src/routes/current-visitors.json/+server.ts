import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { current_visitors_key } from '$lib/redis'
import {
  cache_response,
  fetch_fathom_data,
  get_data_from_cache,
} from '$lib/utils/fathom'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const config = {
  runtime: 'nodejs18.x',
}

export const GET: RequestHandler = async ({ url }) => {
  const cache_duration = parseInt(
    url.searchParams.get('cache_duration') ?? '900',
    10
  )
  const cached = await get_visitors_from_cache()

  if (cached) {
    return json({ visitors: cached })
  }

  const visitors = await get_visitors_from_api(cache_duration)

  if (visitors) {
    return json({ visitors })
  }

  return json({
    error: 'Failed to fetch visitors',
    status: 500,
  })
}

const get_visitors_from_api = async (cache_duration: number) => {
  try {
    const headers_auth = new Headers()
    headers_auth.append('Authorization', `Bearer ${FATHOM_API_KEY}`)
    const data = await fetch_fathom_data(
      `current_visitors?site_id=${PUBLIC_FATHOM_ID}&detailed=true`,
      {},
      headers_auth
    )
    await cache_response(
      current_visitors_key(),
      { visitors: data },
      cache_duration
    )
    return data
  } catch (error) {
    console.error(`Error fetching visitors from API: ${error}`)
  }

  return null
}

const get_visitors_from_cache = async () => {
  return get_data_from_cache(current_visitors_key())
}
