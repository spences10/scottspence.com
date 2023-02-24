import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/current_visitors?site_id=${PUBLIC_FATHOM_ID}&detailed=true`,
      {
        headers: headers_auth,
      }
    )

    let data = await res.json()

    return json({
      visitors: data,
    })
  } catch (error) {
    return json({
      error: 'Big oof! Sorry' + error,
      status: 500,
    })
  }
}
