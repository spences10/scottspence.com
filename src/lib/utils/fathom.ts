import redis from '$lib/redis'

export const fetch_fathom_data = async (
  endpoint: string,
  params: { [s: string]: unknown } | ArrayLike<unknown>,
  headers: Headers
) => {
  const url = new URL(`https://api.usefathom.com/v1/${endpoint}`)
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value as string)
  )

  const res = await fetch(url.toString(), {
    headers,
  })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
  }

  return res.json()
}

export const get_data_from_cache = async (cache_key: string) => {
  try {
    const cached = await redis.get(cache_key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error(`Error fetching data from cache: ${e}`)
  }
  return null
}

export const cache_response = async (
  cache_key: string,
  data: any,
  cache_duration: number
) => {
  try {
    await redis.set(
      cache_key,
      JSON.stringify(data),
      'EX',
      cache_duration
    )
  } catch (e) {
    console.error(`Error caching response: ${e}`)
  }
}
