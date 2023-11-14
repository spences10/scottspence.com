import { BUTTONDOWN_API_KEY } from '$env/static/private'
import {
  cache_get,
  cache_set,
  get_newsletter_subscriber_count_key,
} from '$lib/redis'
import { time_to_seconds } from '$lib/utils'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import { json } from '@sveltejs/kit'

const buttondown_url = 'https://api.buttondown.email'
const buttondown_endpoint = '/v1/subscribers'

export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}

export const GET = async () => {
  try {
    const cached: number | null = await cache_get(
      get_newsletter_subscriber_count_key(),
    )
    if (cached) {
      return json({ newsletter_subscriber_count: cached })
    }
  } catch (error) {
    console.error('Error fetching from Redis:', error)
  }

  // cache miss, fetch from API
  const response = await fetch(buttondown_url + buttondown_endpoint, {
    headers: {
      Authorization: `Token ${BUTTONDOWN_API_KEY}`,
    },
  })

  if (!response.ok) {
    return {
      status: response.status,
      body: 'Error fetching newsletter subscriber count',
    }
  }

  const data = await response.json()
  const newsletter_subscriber_count = data.count

  try {
    await cache_set(
      get_newsletter_subscriber_count_key(),
      JSON.stringify(newsletter_subscriber_count),
      time_to_seconds({ hours: 24 }),
    )
  } catch (error) {
    console.error('Error setting to Redis:', error)
  }

  return json({ newsletter_subscriber_count })
}
